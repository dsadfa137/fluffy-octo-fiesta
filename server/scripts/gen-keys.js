'use strict';
/** 운영용 시크릿 생성 도우미. 출력값을 .env 에 복사하세요. */
const crypto = require('crypto');
console.log('# .env 에 아래 값을 붙여넣으세요 (외부 유출 금지)');
console.log('MASTER_KEY=' + crypto.randomBytes(32).toString('hex'));
console.log('SESSION_SECRET=' + crypto.randomBytes(48).toString('base64url'));
