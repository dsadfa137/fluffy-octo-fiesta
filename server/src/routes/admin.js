'use strict';
/** 관리자 라우트: 로그인 / 신고 열람·상태변경 / 첨부 다운로드 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

const { db, ATTACH_DIR } = require('../db');
const enc = require('../crypto');
const { issueToken, clearToken, requireAdmin } = require('../auth');

const router = express.Router();

const STATUS = ['received', 'review', 'investigating', 'done', 'rejected'];
const STATUS_LABEL = {
  received: '접수완료', review: '검토중', investigating: '조사중', done: '처리완료', rejected: '종결',
};

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

/* 로그인 */
router.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '아이디와 비밀번호를 입력하세요.' });
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(String(username));
  const hash = admin ? admin.password_hash : '$2a$12$0000000000000000000000000000000000000000000000000000';
  if (!admin || !bcrypt.compareSync(String(password), hash)) {
    return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
  }
  issueToken(res, admin);
  res.json({ ok: true, username: admin.username });
});

router.post('/logout', (req, res) => { clearToken(res); res.json({ ok: true }); });

router.get('/me', requireAdmin, (req, res) => res.json({ username: req.admin.u }));

/* 신고 목록 */
router.get('/reports', requireAdmin, (req, res) => {
  const { status } = req.query;
  let rows;
  if (status && STATUS.includes(status)) {
    rows = db.prepare('SELECT id, report_no, category, title_enc, status, created_at FROM reports WHERE status = ? ORDER BY id DESC').all(status);
  } else {
    rows = db.prepare('SELECT id, report_no, category, title_enc, status, created_at FROM reports ORDER BY id DESC').all();
  }
  res.json(rows.map(r => ({
    reportNo: r.report_no,
    category: r.category,
    title: enc.decrypt(r.title_enc),
    status: r.status,
    statusLabel: STATUS_LABEL[r.status] || r.status,
    createdAt: r.created_at,
  })));
});

/* 신고 상세 (복호화) */
router.get('/reports/:reportNo', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM reports WHERE report_no = ?').get(String(req.params.reportNo).toUpperCase());
  if (!row) return res.status(404).json({ error: '신고를 찾을 수 없습니다.' });

  const attachments = db.prepare('SELECT id, filename_enc, mime, size FROM attachments WHERE report_id = ?').all(row.id)
    .map(a => ({ id: a.id, filename: enc.decrypt(a.filename_enc), mime: a.mime, size: a.size }));
  const messages = db.prepare('SELECT sender, body_enc, created_at FROM messages WHERE report_id = ? ORDER BY id').all(row.id)
    .map(m => ({ sender: m.sender, body: enc.decrypt(m.body_enc), at: m.created_at }));
  const timeline = db.prepare('SELECT status, created_at FROM status_history WHERE report_id = ? ORDER BY id').all(row.id)
    .map(h => ({ status: h.status, label: STATUS_LABEL[h.status] || h.status, at: h.created_at }));

  res.json({
    reportNo: row.report_no,
    category: row.category,
    dept: row.dept_enc ? enc.decrypt(row.dept_enc) : '',
    title: enc.decrypt(row.title_enc),
    occurredAt: row.occurred_at,
    content: enc.decrypt(row.content_enc),
    status: row.status,
    statusLabel: STATUS_LABEL[row.status] || row.status,
    createdAt: row.created_at,
    attachments, messages, timeline,
  });
});

/* 상태 변경 + 담당자 메시지 */
router.patch('/reports/:reportNo', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT id, status FROM reports WHERE report_no = ?').get(String(req.params.reportNo).toUpperCase());
  if (!row) return res.status(404).json({ error: '신고를 찾을 수 없습니다.' });

  const { status, message } = req.body;
  const tx = db.transaction(() => {
    if (status && STATUS.includes(status) && status !== row.status) {
      db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, row.id);
      db.prepare('INSERT INTO status_history (report_id, status) VALUES (?, ?)').run(row.id, status);
    }
    if (message && String(message).trim()) {
      db.prepare('INSERT INTO messages (report_id, sender, body_enc) VALUES (?, ?, ?)')
        .run(row.id, 'admin', enc.encrypt(String(message).trim()));
    }
  });
  tx();
  res.json({ ok: true });
});

/* 첨부 복호화 다운로드 */
router.get('/attachments/:id', requireAdmin, (req, res) => {
  const a = db.prepare('SELECT * FROM attachments WHERE id = ?').get(Number(req.params.id));
  if (!a) return res.status(404).json({ error: '첨부파일을 찾을 수 없습니다.' });
  const p = path.join(ATTACH_DIR, a.store_name + '.enc');
  if (!fs.existsSync(p)) return res.status(410).json({ error: '파일이 존재하지 않습니다.' });

  const plain = enc.decryptBuf(fs.readFileSync(p));
  const filename = enc.decrypt(a.filename_enc);
  res.setHeader('Content-Type', a.mime || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
  res.send(plain);
});

module.exports = router;
