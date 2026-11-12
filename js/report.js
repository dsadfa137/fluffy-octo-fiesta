/* 신고 접수 폼 처리
 *
 * 서버(/api/reports)로 신고를 전송하면 백엔드에서 내용·첨부를 암호화 저장하고
 * 신고번호를 발급합니다. 서버 없이 정적 파일만 열어 본 경우에는 네트워크 오류가
 * 발생하므로, server/ 를 실행한 상태에서 사용하세요.
 */
(function () {
  'use strict';

  var form = document.getElementById('reportForm');
  if (!form) return;

  var content = document.getElementById('content');
  var contentCount = document.getElementById('contentCount');
  var fileInput = document.getElementById('files');
  var filePick = document.getElementById('filePick');
  var fileDrop = document.getElementById('fileDrop');
  var fileList = document.getElementById('fileList');
  var errorBox = document.getElementById('formError');
  var receipt = document.getElementById('receipt');
  var outCode = document.getElementById('outCode');
  var copyBtn = document.getElementById('copyBtn');

  // 글자수 카운터
  content.addEventListener('input', function () {
    contentCount.textContent = content.value.length;
  });

  // 파일 선택 UI
  filePick.addEventListener('click', function () { fileInput.click(); });
  function renderFiles() {
    if (!fileInput.files.length) { fileList.textContent = ''; return; }
    var names = Array.prototype.map.call(fileInput.files, function (f) {
      return '📎 ' + f.name + ' (' + Math.round(f.size / 1024) + 'KB)';
    });
    fileList.innerHTML = names.join('<br>');
  }
  fileInput.addEventListener('change', renderFiles);
  ['dragover', 'dragleave', 'drop'].forEach(function (evt) {
    fileDrop.addEventListener(evt, function (e) {
      e.preventDefault();
      fileDrop.style.borderColor = evt === 'dragover' ? 'var(--forest-500)' : 'var(--forest-300)';
      if (evt === 'drop' && e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        renderFiles();
      }
    });
  });

  // 다국어 헬퍼 (i18n 미로드 시 한국어 기본값 사용)
  function t(key, fallback) {
    return (window.MGTC_I18N && window.MGTC_I18N.t) ? window.MGTC_I18N.t(key) : fallback;
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.add('show');
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  var submitBtn = form.querySelector('button[type=submit]');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorBox.classList.remove('show');

    if (!document.getElementById('category').value) return showError(t('err_category', '신고 유형을 선택해 주세요.'));
    if (!document.getElementById('title').value.trim()) return showError(t('err_title', '제목을 입력해 주세요.'));
    if (content.value.trim().length < 20) return showError(t('err_content', '신고 내용을 20자 이상 구체적으로 작성해 주세요.'));
    if (document.getElementById('pw').value.length < 4) return showError(t('err_pw', '비밀번호를 4자 이상 설정해 주세요.'));
    if (!document.getElementById('agree').checked) return showError(t('err_agree', '동의 항목에 체크해 주세요.'));

    var fd = new FormData(form); // category, dept, title, occurredAt, content, pw, files
    // 서버는 password 필드명을 사용하므로 pw 값을 매핑
    fd.set('password', document.getElementById('pw').value);
    fd.delete('pw');

    submitBtn.disabled = true;
    submitBtn.textContent = t('submitting', '접수 중…');

    fetch('/api/reports', { method: 'POST', body: fd })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.d.error || t('submit_err', '접수 중 오류가 발생했습니다.'));
        outCode.textContent = res.d.reportNo;
        form.hidden = true;
        receipt.hidden = false;
        receipt.scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(function (err) {
        showError(err.message + t('submit_fail_suffix', ' (서버가 실행 중인지 확인하세요.)'));
        submitBtn.disabled = false;
        submitBtn.textContent = t('submit_report', '익명으로 신고 접수');
      });
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = outCode.textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = t('copied', '복사됨 ✓');
          setTimeout(function () { copyBtn.textContent = t('btn_copy', '신고번호 복사'); }, 1800);
        });
      }
    });
  }
})();
