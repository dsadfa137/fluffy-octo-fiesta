'use strict';
require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

// 시작 시 필수 시크릿 검증 (없으면 즉시 종료)
try {
  if (!process.env.MASTER_KEY || process.env.MASTER_KEY.length !== 64) {
    throw new Error('MASTER_KEY(hex 64자)가 필요합니다. `npm run gen-keys` 참고.');
  }
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET(32자 이상)가 필요합니다. `npm run gen-keys` 참고.');
  }
} catch (e) {
  console.error('[설정 오류] ' + e.message);
  process.exit(1);
}

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
