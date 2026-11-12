'use strict';
/** 사이트 콘텐츠(인라인 편집) — 공개 조회 / 관리자 수정·이미지 업로드 */
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const { db, UPLOAD_DIR } = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();

var ALLOWED_IMG = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.svg' };
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });

/* ---------- 공개: 현재 언어의 콘텐츠 오버라이드 조회 ---------- */
router.get('/', (req, res) => {
  const lang = (req.query.lang === 'en') ? 'en' : 'ko';
  // 해당 언어 + 언어무관('*') 오버라이드 병합
  const rows = db.prepare("SELECT key, value FROM content WHERE lang = ? OR lang = '*'").all(lang);
  const values = {};
  rows.forEach(r => { values[r.key] = r.value; });
  res.json({ lang, values });
});

/* ---------- 관리자: 텍스트 콘텐츠 일괄 저장 ---------- */
router.post('/', requireAdmin, (req, res) => {
  const { lang, updates } = req.body || {};
  if ((lang !== 'ko' && lang !== 'en') || !updates || typeof updates !== 'object') {
    return res.status(400).json({ error: '잘못된 요청입니다.' });
  }
  const keys = Object.keys(updates);
  if (keys.length > 300) return res.status(400).json({ error: '항목이 너무 많습니다.' });

  const up = db.prepare(`
    INSERT INTO content (key, lang, value, updated_at) VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(key, lang) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `);
  const del = db.prepare('DELETE FROM content WHERE key = ? AND lang = ?');
  const tx = db.transaction(() => {
    for (const k of keys) {
      const v = updates[k];
      if (v == null || String(v) === '') { del.run(String(k), lang); }      // 빈 값 → 기본값(i18n)으로 복원
      else { up.run(String(k), lang, String(v).slice(0, 20000)); }
    }
  });
  tx();
  res.json({ ok: true, saved: keys.length });
});

/* ---------- 관리자: 이미지 업로드 → 공개 URL 발급 + 콘텐츠에 저장(언어무관) ---------- */
router.post('/image', requireAdmin, upload.single('image'), (req, res) => {
  try {
    const key = String((req.body && req.body.key) || '').trim();
    if (!key) return res.status(400).json({ error: '콘텐츠 키가 필요합니다.' });
    if (!req.file) return res.status(400).json({ error: '이미지 파일이 없습니다.' });
    const ext = ALLOWED_IMG[req.file.mimetype];
    if (!ext) return res.status(400).json({ error: '허용되지 않는 이미지 형식입니다(png/jpg/webp/gif/svg).' });

    const name = crypto.randomUUID() + ext;
    fs.writeFileSync(path.join(UPLOAD_DIR, name), req.file.buffer);
    const url = '/uploads/' + name;

    db.prepare(`
      INSERT INTO content (key, lang, value, updated_at) VALUES (?, '*', ?, datetime('now'))
      ON CONFLICT(key, lang) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `).run(key, url);

    res.status(201).json({ ok: true, url });
  } catch (e) {
    console.error('[content image] ' + e.message);
    res.status(500).json({ error: '업로드 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
