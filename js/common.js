/* 문경관광공사 익명신고센터 — 공통 스크립트 */
(function () {
  'use strict';

  // 모바일 내비게이션 토글
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      var expanded = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }

  // FAQ 아코디언
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var answer = item.querySelector('.faq-a');
      var isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      answer.style.maxHeight = isOpen ? answer.scrollHeight + 'px' : null;
    });
  });

  // 현재 연도
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
