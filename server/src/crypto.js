'use strict';
/**
 * 애플리케이션 레벨 암호화 (AES-256-GCM)
 *
 * 신고 내용·메시지·첨부파일은 이 모듈을 통해 암호화되어 저장됩니다.
 * MASTER_KEY(32바이트, hex 64자)는 환경변수로 주입하며, 운영에서는
 * KMS/HSM 또는 시크릿 매니저로 관리하는 것을 권장합니다.
 */
const crypto = require('crypto');

const ALGO = 'aes-256-gcm';

let _keyCache = null;
function getKey() {
  if (_keyCache) return _keyCache;
  const v = process.env.MASTER_KEY;
  if (!v) {
    throw new Error('MASTER_KEY 환경변수가 없습니다. `npm run gen-keys`로 생성하거나 호스팅 환경변수에 설정하세요.');
  }
  // 64자 hex(=32바이트)면 그대로 키로 사용, 그 외 문자열이면 SHA-256으로 32바이트 키 파생
  if (/^[0-9a-fA-F]{64}$/.test(v)) {
    _keyCache = Buffer.from(v, 'hex');
  } else if (v.length >= 16) {
    _keyCache = crypto.createHash('sha256').update(v, 'utf8').digest(); // 32바이트
  } else {
    throw new Error('MASTER_KEY가 너무 짧습니다(최소 16자, 권장: hex 64자).');
  }
  return _keyCache;
}

/** 문자열/버퍼 → 암호문 버퍼 (iv[12] | tag[16] | ciphertext) */
function encrypt(plain) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const data = Buffer.isBuffer(plain) ? plain : Buffer.from(String(plain), 'utf8');
  const ct = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]);
}

/** 암호문 버퍼 → 평문 버퍼 */
function decryptBuf(buf) {
  const key = getKey();
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}

/** 평문 문자열 반환 */
function decrypt(buf) {
  return decryptBuf(buf).toString('utf8');
}

/** 신고번호 생성: MG-YYYY-XXXXXX (혼동 문자 제외) */
function generateReportNo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(6);
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[bytes[i] % chars.length];
  return `MG-${new Date().getFullYear()}-${s}`;
}

module.exports = { encrypt, decrypt, decryptBuf, generateReportNo };
