/* 문경관광공사 익명신고센터 — 인라인 콘텐츠 편집(관리자)
 * - 모든 방문자: 저장된 콘텐츠 오버라이드([data-edit], [data-edit-img])를 적용
 * - 관리자(로그인 상태): 플로팅 '편집' 버튼 → 글자/이미지 직접 수정 → 저장
 * 텍스트는 언어별로, 이미지는 언어 무관으로 저장됩니다.
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

  var editing = false, bar = null, fileInput = null;

  function start() {
    fetchApply();
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () { setTimeout(fetchApply, 40); });
    });
    // 관리자 여부 확인 → 편집 버튼
    fetch('/api/admin/me', { credentials: 'same-origin' })
      .then(function (r) { if (r.ok) addToggle(); })
      .catch(function () {});
  }

  function addToggle() {
    var btn = document.createElement('button');
    btn.id = 'mgtc-edit-toggle'; btn.type = 'button'; btn.textContent = '✏️ 편집';
    btn.addEventListener('click', function () { editing ? exitEdit(false) : enterEdit(); });
    document.body.appendChild(btn);
  }

  function enterEdit() {
    editing = true;
    document.getElementById('mgtc-edit-toggle').textContent = '✕ 편집 종료';
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
    var img = e.currentTarget;
    var key = img.getAttribute('data-edit-img');
    var fi = ensureFileInput();
    fi.value = '';
    fi.onchange = function () {
      if (!fi.files.length) return;
      var fd = new FormData();
      fd.append('image', fi.files[0]); fd.append('key', key);
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
    bar = document.createElement('div');
    bar.id = 'mgtc-edit-bar';
    bar.innerHTML =
      '<span class="mgtc-bar-info">편집 모드 · 언어 ' + lang().toUpperCase() + '</span>' +
      '<span class="mgtc-bar-status" id="mgtc-bar-status"></span>' +
      '<button type="button" id="mgtc-cancel">취소</button>' +
      '<button type="button" id="mgtc-save">저장</button>';
    document.body.appendChild(bar);
    document.getElementById('mgtc-save').addEventListener('click', save);
    document.getElementById('mgtc-cancel').addEventListener('click', function () { exitEdit(false); });
  }
  function status(m) { var s = document.getElementById('mgtc-bar-status'); if (s) s.textContent = m; }

  function save() {
    var updates = {};
    document.querySelectorAll('[data-edit]').forEach(function (el) {
      var cur = el.textContent;
      if (cur !== el.dataset._orig) updates[el.getAttribute('data-edit')] = cur;
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
        status('저장되었습니다 ✓'); exitEdit(true);
      })
      .catch(function (err) { status('오류: ' + err.message); });
  }

  function exitEdit(saved) {
    editing = false;
    var tgl = document.getElementById('mgtc-edit-toggle'); if (tgl) tgl.textContent = '✏️ 편집';
    document.querySelectorAll('[data-edit]').forEach(function (el) {
      el.removeAttribute('contenteditable'); el.classList.remove('mgtc-editable');
      if (!saved && el.dataset._orig != null) el.textContent = el.dataset._orig;
      delete el.dataset._orig;
    });
    document.querySelectorAll('[data-edit-img]').forEach(function (el) {
      el.classList.remove('mgtc-editable-img'); el.removeEventListener('click', imgClick);
    });
    if (bar) { bar.remove(); bar = null; }
    if (saved) fetchApply();
  }

  if (document.readyState !== 'loading') setTimeout(start, 0);
  else document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); });
})();
