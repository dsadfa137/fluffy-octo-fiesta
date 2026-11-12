'use strict';
/** 신고유형 공개 조회 (현재 언어 라벨) */
const express = require('express');
const { db } = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const lang = (req.query.lang === 'en') ? 'en' : 'ko';
  const rows = db.prepare('SELECT cvalue, label_ko, label_en FROM categories ORDER BY sort, id').all();
  res.json(rows.map(r => ({
    value: r.cvalue,
    label: (lang === 'en' && r.label_en) ? r.label_en : r.label_ko,
  })));
});

module.exports = router;
