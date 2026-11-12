/* 문경관광공사 익명신고센터 — 인라인 콘텐츠 편집
 * - 모든 방문자: 저장된 콘텐츠 오버라이드([data-edit], [data-edit-img]) 적용
 * - 편집 모드는 "공개 사이트"에는 노출되지 않음.
 *   관리자 콘솔(/admin)의 '사이트 편집' 버튼으로 ?edit=1 로 열었을 때,
 *   그 탭에서만(관리자 인증 확인 후) 편집 UI가 활성화됨. sessionStorage로 탭 내 유지.
 */
(function () {
  'use strict';

  function lang() { return (window.MGTC_I18N && window.MGTC_I18N.lang && window.MGTC_I18N.lang()) || 'ko'; }

  /* ---------- 공개: 오버라이드 적용 ---------- */
  function apply(values) {
    Object.keys(values || {}).forEach(function (key) {
      var v = values[key];
      document.querySelectorAll('[data-edit="' + key + '"]').forEach(function (el) { el.textContent = v; });
      document.querySelectorAll('[data-edit-img="' + key + '"]').forEach(function (el) { if (v) el.src = v; });
    });
  }
  function fetchApply() {
    return fetch('/api/content?lang=' + encodeURIComponent(lang()), { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : { values: {} }; })
      .then(function (d) { apply(d.values || {}); })
      .catch(function () {});
  }

  var SKEY = 'mgtc_edit', fileInput = null;

  function wantEdit() {
    if (/[?&]edit=1(?![0-9])/.test(location.search)) return true;
    try { return sessionStorage.getItem(SKEY) === '1'; } catch (e) { return false; }
  }

  function start() {
    fetchApply();
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () { setTimeout(fetchApply, 40); });
    });

    if (!wantEdit()) return; // 공개 사이트: 편집 UI 없음 (관리자 로그인 여부와 무관)

    // 편집 의도가 있을 때만 관리자 인증 확인
    fetch('/api/admin/me', { credentials: 'same-origin' })
      .then(function (r) { return r.ok; })
      .then(function (isAdmin) {
        if (isAdmin) { try { sessionStorage.setItem(SKEY, '1'); } catch (e) {} startEditSession(); }
        else { try { sessionStorage.removeItem(SKEY); } catch (e) {} }
      })
      .catch(function () {});
  }

  function startEditSession() {
    document.querySelectorAll('[data-edit]').forEach(function (el) {
      el.dataset._orig = el.textContent;
      el.setAttribute('contenteditable', 'true');
      el.classList.add('mgtc-editable');
    });
    document.querySelectorAll('[data-edit-img]').forEach(function (el) {
      el.classList.add('mgtc-editable-img');
      el.addEventListener('click', imgClick);
    });
    showBar();
  }

  function ensureFileInput() {
    if (fileInput) return fileInput;
    fileInput = document.createElement('input');
    fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    return fileInput;
  }

  function imgClick(e) {
    e.preventDefault(); e.stopPropagation();
    var img = e.currentTarget, key = img.getAttribute('data-edit-img');
    var fi = ensureFileInput(); fi.value = '';
    fi.onchange = function () {
      if (!fi.files.length) return;
      var fd = new FormData(); fd.append('image', fi.files[0]); fd.append('key', key);
      status('이미지 업로드 중…');
      fetch('/api/content/image', { method: 'POST', body: fd, credentials: 'same-origin' })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.d.error || '업로드 실패');
          document.querySelectorAll('[data-edit-img="' + key + '"]').forEach(function (x) { x.src = res.d.url; });
          status('이미지가 변경되었습니다 ✓');
        })
        .catch(function (err) { status('오류: ' + err.message); });
    };
    fi.click();
  }

  function showBar() {
    var bar = document.createElement('div');
    bar.id = 'mgtc-edit-bar';
    bar.innerHTML =
      '<span class="mgtc-bar-info">✏️ 편집 모드 · 언어 ' + lang().toUpperCase() + '</span>' +
      '<span class="mgtc-bar-status" id="mgtc-bar-status"></span>' +
      '<button type="button" id="mgtc-revert">변경취소</button>' +
      '<button type="button" id="mgtc-save">저장</button>' +
      '<button type="button" id="mgtc-exit">편집 종료</button>';
    document.body.appendChild(bar);
    document.getElementById('mgtc-save').addEventListener('click', save);
    document.getElementById('mgtc-revert').addEventListener('click', revert);
    document.getElementById('mgtc-exit').addEventListener('click', exitSession);
  }
  function status(m) { var s = document.getElementById('mgtc-bar-status'); if (s) s.textContent = m; }

  function save() {
    var updates = {};
    document.querySelectorAll('[data-edit]').forEach(function (el) {
      if (el.textContent !== el.dataset._orig) updates[el.getAttribute('data-edit')] = el.textContent;
    });
    if (Object.keys(updates).length === 0) { status('변경된 글자가 없습니다.'); return; }
    status('저장 중…');
    fetch('/api/content', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
      body: JSON.stringify({ lang: lang(), updates: updates })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.d.error || '저장 실패');
        document.querySelectorAll('[data-edit]').forEach(function (el) { el.dataset._orig = el.textContent; });
        status('저장되었습니다 ✓ (방문자에게 반영됨)');
      })
      .catch(function (err) { status('오류: ' + err.message); });
  }

  function revert() {
    document.querySelectorAll('[data-edit]').forEach(function (el) {
      if (el.dataset._orig != null) el.textContent = el.dataset._orig;
    });
    status('변경을 되돌렸습니다(저장 전 상태).');
  }

  function exitSession() {
    try { sessionStorage.removeItem(SKEY); } catch (e) {}
    location.href = location.pathname; // 쿼리 제거 + 깨끗한 공개 화면으로
  }

  if (document.readyState !== 'loading') setTimeout(start, 0);
  else document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); });
})();
