/* 신고 접수 폼 처리
 *
 * ⚠️ 데모/프론트엔드 구현 안내
 * 이 스크립트는 접수 UX를 보여주기 위한 클라이언트 측 데모입니다.
 * 실제 운영에서는 신고 내용이 반드시 서버로 전송되어 암호화 저장되어야 하며,
 * 신고번호·비밀번호 검증과 처리상태 관리는 백엔드에서 이루어져야 합니다.
 * (README의 "운영 배포 시 필수 구현" 항목 참고)
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

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.add('show');
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // 신고번호 생성: MG-YYYY-XXXXXX (추적 불가한 난수)
  function generateCode() {
    var year = new Date().getFullYear();
    var rand = '';
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동되는 문자 제외
    var buf = new Uint32Array(6);
    (window.crypto || window.msCrypto).getRandomValues(buf);
    for (var i = 0; i < 6; i++) rand += chars[buf[i] % chars.length];
    return 'MG-' + year + '-' + rand;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorBox.classList.remove('show');

    if (!document.getElementById('category').value) return showError('신고 유형을 선택해 주세요.');
    if (!document.getElementById('title').value.trim()) return showError('제목을 입력해 주세요.');
    if (content.value.trim().length < 20) return showError('신고 내용을 20자 이상 구체적으로 작성해 주세요.');
    if (document.getElementById('pw').value.length < 4) return showError('비밀번호를 4자 이상 설정해 주세요.');
    if (!document.getElementById('agree').checked) return showError('동의 항목에 체크해 주세요.');

    // === 실제 운영 시: 여기서 fetch()로 서버에 암호화 전송 ===
    // 데모에서는 신고번호만 발급하고 제출 화면을 전환합니다.
    var code = generateCode();
    outCode.textContent = code;
    form.hidden = true;
    receipt.hidden = false;
    receipt.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = outCode.textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = '복사됨 ✓';
          setTimeout(function () { copyBtn.textContent = '신고번호 복사'; }, 1800);
        });
      }
    });
  }
})();
