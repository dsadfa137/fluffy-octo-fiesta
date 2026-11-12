# Render 배포 가이드 — 문경관광공사 공직비위 익명신고센터

이 저장소는 **정적 프런트엔드 + Node 백엔드(암호화 저장·관리자 콘솔)** 로 구성됩니다.
Render에 배포하면 프런트와 백엔드가 **하나의 서비스**로 함께 동작합니다. (GitHub Pages는 백엔드를 실행하지 못해 신고 기능이 동작하지 않습니다.)

## 1. 블루프린트로 배포 (가장 간단)

1. https://dashboard.render.com 접속 → **New +** → **Blueprint**
2. GitHub 저장소 **`dsadfa137/fluffy-octo-fiesta`** 선택 → **Connect**
3. 루트의 `render.yaml` 을 Render가 자동 인식합니다. **Apply** 클릭
4. 배포 중 아래 두 값을 입력하라고 나옵니다(저장소에는 저장되지 않음):
   - `ADMIN_USER` : 관리자 아이디 (예: `admin`)
   - `ADMIN_PASSWORD` : 관리자 비밀번호 (10자 이상 권장)
   - `MASTER_KEY`, `SESSION_SECRET` 는 **자동 생성**되므로 입력 불필요
5. 첫 빌드가 끝나면 `https://mgtc-report-center.onrender.com` 형태의 주소가 발급됩니다.
   - 사이트: `https://<주소>/`
   - 관리자 콘솔: `https://<주소>/admin/`  (4번에서 정한 아이디/비밀번호로 로그인)

> 최초 기동 시 `ADMIN_USER`/`ADMIN_PASSWORD` 로 관리자 계정이 **자동 생성**됩니다(이미 있으면 건너뜀).

## 2. 동작 확인

- 메인 → **신고 접수하기** → 폼 작성 후 제출 → **신고번호(MG-YYYY-XXXXXX)** 발급 확인
- **결과확인** → 그 신고번호 + 비밀번호로 조회 → 상태 표시 확인
- **/admin/** 로그인 → 방금 접수한 신고가 목록에 보이고, 상세(복호화)·상태변경·담당자 메시지 동작 확인
- 헤더 **KO/EN** 전환 확인

## 3. ⚠️ 실제 운영 전 반드시 — 영구 디스크

**무료(free) 플랜은 파일시스템이 임시**라서, 재배포하거나 서비스가 절전(15분 무접속)되면
**접수된 신고 데이터(`data/`)가 사라집니다.** 동작 확인용으로만 쓰세요.

실제 운영에서는 영구 디스크를 붙입니다(유료 플랜 필요):

1. `render.yaml` 에서 `plan: free` → `plan: starter` (이상)
2. `disk:` 블록 주석 해제 (mountPath `/var/data`)
3. `envVars` 에 `DATA_DIR=/var/data` 추가
4. 커밋·푸시 후 Render가 자동 재배포

또는 Render 대시보드에서 수동으로 Disk를 추가하고 환경변수 `DATA_DIR=/var/data` 를 설정해도 됩니다.

## 4. 보안 체크리스트 (운영)

- `MASTER_KEY` 분실 시 기존 신고는 복호화 불가 → Render 환경변수를 안전히 보관/백업
- HTTPS는 Render가 자동 제공(쿠키 `secure` 활성). `NODE_ENV=production` 유지
- 신고자 IP는 애플리케이션에서 로깅하지 않음. Render 접근 로그에도 신고 본문은 남지 않음
- 관리자 비밀번호는 10자 이상, 주기적 변경(`server`에서 `npm run seed-admin -- <id> <pw>` 로 변경 가능)
- 영구 디스크 데이터는 정기 백업 권장

## 로컬에서 직접 실행하려면

`server/README.md` 참고. 요약:
```bash
cd server && npm install
cp .env.example .env && npm run gen-keys   # 출력값을 .env에 저장
npm run seed-admin -- admin '강력한비밀번호'
npm start    # http://localhost:3000
```
