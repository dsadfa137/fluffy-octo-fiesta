# 익명신고 백엔드 + 관리자 콘솔

문경관광공사 공직비위 익명신고센터의 서버입니다.
신고 내용·첨부파일을 **AES-256-GCM으로 암호화 저장**하고, 신고번호/비밀번호 기반 익명 조회와
관리자 콘솔(신고 열람·상태변경·소통)을 제공합니다. 정적 프런트엔드도 함께 서빙합니다.

## 요구사항
- Node.js 18 이상 (개발·검증은 Node 22에서 수행)

## 설치 및 실행

```bash
cd server
npm install

# 1) 시크릿 생성 → 출력값을 .env 에 저장
cp .env.example .env
npm run gen-keys        # MASTER_KEY, SESSION_SECRET 출력 → .env 에 붙여넣기

# 2) 관리자 계정 생성
npm run seed-admin -- <아이디> <비밀번호(10자 이상)>

# 3) 서버 실행
npm start               # http://localhost:3000  (관리자: /admin/)
```

`.env` 예시:
```
MASTER_KEY=<hex 64자>
SESSION_SECRET=<32자 이상>
PORT=3000
NODE_ENV=production
```

## API 요약

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/reports` | 신고 접수(multipart, 파일 최대 5개·개당 20MB) → `{reportNo}` | 공개 |
| POST | `/api/reports/lookup` | 신고번호+비밀번호로 처리상태·메시지 조회 | 공개 |
| POST | `/api/reports/message` | 신고자 추가 메시지 전송 | 공개 |
| POST | `/api/admin/login` | 관리자 로그인(쿠키 발급) | 공개 |
| GET | `/api/admin/reports` | 신고 목록(상태 필터) | 관리자 |
| GET | `/api/admin/reports/:no` | 신고 상세(복호화) | 관리자 |
| PATCH | `/api/admin/reports/:no` | 상태 변경 + 담당자 메시지 | 관리자 |
| GET | `/api/admin/attachments/:id` | 첨부 복호화 다운로드 | 관리자 |

## 보안 설계

- **저장 시 암호화**: 제목·본문·소속·메시지·첨부파일·파일명을 AES-256-GCM으로 암호화하여 DB/디스크에 저장. (`src/crypto.js`)
- **비밀번호 해시**: 신고 비밀번호와 관리자 비밀번호는 bcrypt(cost 12)로 저장, 평문 미보관.
- **IP 미수집**: 애플리케이션은 요청 IP를 로깅하지 않습니다. 타이밍 공격 완화를 위해 조회 실패 시에도 bcrypt 비교를 수행합니다.
- **접근 통제**: 관리자 API는 JWT(httpOnly·sameSite=strict 쿠키)로 보호. `server/`·`data/`·`.env`·`*.db`·`*.enc`는 웹 비노출.
- **요청 제한**: 접수/조회/로그인에 rate limit 적용. Helmet으로 보안 헤더·CSP 설정.

## ⚠️ 운영(Production) 하드닝 체크리스트

1. **HTTPS 필수** — 반드시 TLS 뒤에서 운영하고 `NODE_ENV=production`으로 secure 쿠키를 활성화하세요.
2. **리버스 프록시 로그** — nginx 등에서 신고 경로의 `access_log off;` 설정으로 IP 기록을 제거하세요. 애플리케이션 외 레이어의 로그도 점검 대상입니다.
3. **키 관리** — `MASTER_KEY`는 KMS/시크릿 매니저로 관리하고 주기적 로테이션 전략을 마련하세요. 키 분실 시 기존 신고는 복호화 불가합니다.
4. **백업** — `data/` (DB + 암호화 첨부)를 암호화 백업하되, 키와 분리 보관하세요.
5. **첨부 메타데이터** — 필요 시 업로드 파일의 EXIF 등 식별정보 제거 처리를 추가하세요(서버 측).
6. **법적 고지·개인정보 처리방침** — 감사/법무 부서 검토 후 반영하세요.
7. **관리자 접근 범위** — 콘솔 접근 IP 제한, 2단계 인증 등 조직 정책에 맞게 강화하세요.

## 데이터 위치
- `data/reports.db` : SQLite(암호화 필드 포함)
- `data/attachments/*.enc` : 암호화된 첨부파일
- 위 경로는 `.gitignore`로 저장소에서 제외됩니다.
