'use strict';
require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

// 시작 시 필수 시크릿 검증 (없으면 즉시 종료)
try {
  const mk = process.env.MASTER_KEY || '';
  const ok = /^[0-9a-fA-F]{64}$/.test(mk) || mk.length >= 16;
  if (!ok) throw new Error('MASTER_KEY가 필요합니다(hex 64자 권장, 최소 16자). `npm run gen-keys` 참고.');
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 16) {
    throw new Error('SESSION_SECRET이 필요합니다(16자 이상, 권장 32자 이상). `npm run gen-keys` 참고.');
  }
} catch (e) {
  console.error('[설정 오류] ' + e.message);
  process.exit(1);
}

// 클라우드 배포용: ADMIN_USER / ADMIN_PASSWORD 가 있으면 최초 1회 관리자 자동 생성
(function bootstrapAdmin() {
  const u = process.env.ADMIN_USER, p = process.env.ADMIN_PASSWORD;
  if (!u || !p) return;
  try {
    const bcrypt = require('bcryptjs');
    const { db } = require('./db');
    const exists = db.prepare('SELECT id FROM admins WHERE username = ?').get(u);
    if (!exists) {
      db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(u, bcrypt.hashSync(String(p), 12));
      console.log(`[부트스트랩] 관리자 '${u}' 계정을 생성했습니다.`);
    }
  } catch (e) {
    console.error('[부트스트랩] 관리자 생성 실패: ' + e.message);
  }
})();

const reportRoutes = require('./routes/report');
const adminRoutes = require('./routes/admin');

const app = express();
app.set('trust proxy', 1);

/**
 * 익명성 보장: 이 애플리케이션은 신고자 IP를 로깅하지 않습니다.
 * (요청 로깅 미들웨어를 두지 않음) 리버스 프록시(nginx 등)에서도
 * 신고 경로의 access_log off 를 설정하세요. README 참고.
 */

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      fontSrc: ["'self'", 'https://cdn.jsdelivr.net', 'data:'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());

// API
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', require('./routes/content'));
app.use('/api/categories', require('./routes/categories'));

// 사이트 편집용 업로드 이미지(공개)
const { UPLOAD_DIR } = require('./db');
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '1h' }));

// 정적 프런트엔드 (프로젝트 루트) + 관리자 콘솔
const WEB_ROOT = path.join(__dirname, '..', '..'); // mgtc-report-center/

// 서버 내부 디렉터리·민감 파일은 웹으로 노출하지 않음
app.use((req, res, next) => {
  if (/(^|\/)(server|node_modules|\.git)(\/|$)/i.test(req.path) || /\.(db|db-wal|db-shm|enc|env)$/i.test(req.path)) {
    return res.status(403).type('text/plain').send('Forbidden');
  }
  next();
});

app.use('/admin', express.static(path.join(__dirname, '..', 'public', 'admin')));
app.use(express.static(WEB_ROOT, { extensions: ['html'], dotfiles: 'deny' }));

app.get('/healthz', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`문경관광공사 익명신고센터 서버 실행 → http://localhost:${PORT}`);
  console.log(`관리자 콘솔 → http://localhost:${PORT}/admin/`);
});
