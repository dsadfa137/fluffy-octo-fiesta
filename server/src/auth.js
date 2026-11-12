'use strict';
/** 관리자 인증 (JWT, httpOnly 쿠키) */
const jwt = require('jsonwebtoken');

const COOKIE = 'mgtc_admin';

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error('SESSION_SECRET 환경변수가 없거나 너무 짧습니다(16자 이상 권장 32자 이상). `npm run gen-keys`로 생성하세요.');
  }
  return s;
}

function issueToken(res, admin) {
  const token = jwt.sign({ sub: admin.id, u: admin.username }, secret(), { expiresIn: '8h' });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000,
  });
}

function clearToken(res) {
  res.clearCookie(COOKIE);
}

function requireAdmin(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE];
  if (!token) return res.status(401).json({ error: '로그인이 필요합니다.' });
  try {
    req.admin = jwt.verify(token, secret());
    next();
  } catch (e) {
    res.status(401).json({ error: '세션이 만료되었습니다. 다시 로그인하세요.' });
  }
}

module.exports = { issueToken, clearToken, requireAdmin, COOKIE };
