'use strict';
/** 공개 라우트: 신고 접수 / 익명 결과조회 */
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

const { db, ATTACH_DIR } = require('../db');
const enc = require('../crypto');

const router = express.Router();

const MAX_FILE = 20 * 1024 * 1024; // 20MB
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE, files: 5 } });

const submitLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
const lookupLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

const STATUS_LABEL = {
  received: '접수완료',
  review: '검토중',
  investigating: '조사중',
  done: '처리완료',
  rejected: '종결',
};

/* ------- 신고 접수 ------- */
router.post('/', submitLimiter, upload.array('files', 5), (req, res) => {
  try {
    const { category, dept, title, occurredAt, content, password } = req.body;

    if (!category || !title || !content || !password) {
      return res.status(400).json({ error: '필수 항목을 모두 입력해 주세요.' });
    }
    if (String(content).trim().length < 20) {
      return res.status(400).json({ error: '신고 내용을 20자 이상 작성해 주세요.' });
    }
    if (String(password).length < 4) {
      return res.status(400).json({ error: '비밀번호는 4자 이상이어야 합니다.' });
    }

    // 중복되지 않는 신고번호 확보
    let reportNo;
    const exists = db.prepare('SELECT 1 FROM reports WHERE report_no = ?');
    do { reportNo = enc.generateReportNo(); } while (exists.get(reportNo));

    const passwordHash = bcrypt.hashSync(String(password), 12);

    const insertReport = db.prepare(`
      INSERT INTO reports (report_no, password_hash, category, dept_enc, title_enc, occurred_at, content_enc, status)
      VALUES (@report_no, @password_hash, @category, @dept_enc, @title_enc, @occurred_at, @content_enc, 'received')
    `);
    const insertAttach = db.prepare(`
      INSERT INTO attachments (report_id, filename_enc, mime, size, store_name) VALUES (?, ?, ?, ?, ?)
    `);
    const insertHistory = db.prepare(`INSERT INTO status_history (report_id, status) VALUES (?, 'received')`);

    const tx = db.transaction(() => {
      const info = insertReport.run({
        report_no: reportNo,
        password_hash: passwordHash,
        category: String(category),
        dept_enc: dept ? enc.encrypt(dept) : null,
        title_enc: enc.encrypt(title),
        occurred_at: occurredAt || null,
        content_enc: enc.encrypt(content),
      });
      const reportId = info.lastInsertRowid;
      insertHistory.run(reportId);

      for (const f of req.files || []) {
        const storeName = crypto.randomUUID();
        const encBuf = enc.encrypt(f.buffer); // 파일 내용 암호화 저장
        fs.writeFileSync(path.join(ATTACH_DIR, storeName + '.enc'), encBuf);
        insertAttach.run(reportId, enc.encrypt(f.originalname), f.mimetype || null, f.size || 0, storeName);
      }
      return reportId;
    });

    tx();
    return res.status(201).json({ reportNo });
  } catch (e) {
    console.error('[submit] error:', e.message);
    return res.status(500).json({ error: '접수 처리 중 오류가 발생했습니다.' });
  }
});

/* ------- 익명 결과조회 ------- */
router.post('/lookup', lookupLimiter, (req, res) => {
  try {
    const { reportNo, password } = req.body;
    if (!reportNo || !password) return res.status(400).json({ error: '신고번호와 비밀번호를 입력해 주세요.' });

    const row = db.prepare('SELECT * FROM reports WHERE report_no = ?').get(String(reportNo).toUpperCase());
    // 타이밍 공격 완화: 레코드가 없어도 bcrypt 비교 수행
    const hash = row ? row.password_hash : '$2a$12$0000000000000000000000000000000000000000000000000000';
    const ok = bcrypt.compareSync(String(password), hash);
    if (!row || !ok) return res.status(404).json({ error: '신고번호 또는 비밀번호가 일치하지 않습니다.' });

    const history = db.prepare('SELECT status, created_at FROM status_history WHERE report_id = ? ORDER BY id').all(row.id);
    const messages = db.prepare('SELECT sender, body_enc, created_at FROM messages WHERE report_id = ? ORDER BY id').all(row.id)
      .map(m => ({ sender: m.sender, body: enc.decrypt(m.body_enc), at: m.created_at }));

    return res.json({
      reportNo: row.report_no,
      category: row.category,
      title: enc.decrypt(row.title_enc),
      status: row.status,
      statusLabel: STATUS_LABEL[row.status] || row.status,
      createdAt: row.created_at,
      timeline: history.map(h => ({ status: h.status, label: STATUS_LABEL[h.status] || h.status, at: h.created_at })),
      messages,
    });
  } catch (e) {
    console.error('[lookup] error:', e.message);
    return res.status(500).json({ error: '조회 중 오류가 발생했습니다.' });
  }
});

/* ------- 신고자 추가 메시지 ------- */
router.post('/message', lookupLimiter, (req, res) => {
  try {
    const { reportNo, password, body } = req.body;
    if (!reportNo || !password || !body) return res.status(400).json({ error: '내용을 입력해 주세요.' });

    const row = db.prepare('SELECT id, password_hash FROM reports WHERE report_no = ?').get(String(reportNo).toUpperCase());
    const hash = row ? row.password_hash : '$2a$12$0000000000000000000000000000000000000000000000000000';
    if (!row || !bcrypt.compareSync(String(password), hash)) {
      return res.status(404).json({ error: '신고번호 또는 비밀번호가 일치하지 않습니다.' });
    }
    if (String(body).length > 4000) return res.status(400).json({ error: '메시지가 너무 깁니다.' });

    db.prepare('INSERT INTO messages (report_id, sender, body_enc) VALUES (?, ?, ?)')
      .run(row.id, 'reporter', enc.encrypt(body));
    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error('[message] error:', e.message);
    return res.status(500).json({ error: '전송 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
