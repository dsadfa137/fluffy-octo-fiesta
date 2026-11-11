'use strict';
/**
 * 관리자 계정 생성/비밀번호 변경
 * 사용: node scripts/seed-admin.js <username> <password>
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db } = require('../src/db');

const [, , username, password] = process.argv;
if (!username || !password) {
  console.error('사용법: node scripts/seed-admin.js <username> <password>');
  process.exit(1);
}
if (password.length < 10) {
  console.error('관리자 비밀번호는 10자 이상을 권장합니다.');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get(username);
if (existing) {
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(hash, existing.id);
  console.log(`관리자 '${username}' 비밀번호가 변경되었습니다.`);
} else {
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hash);
  console.log(`관리자 '${username}' 계정이 생성되었습니다.`);
}
