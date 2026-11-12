/* 문경관광공사 익명신고센터 — 다국어(i18n)
 * 사용: 요소에 data-i18n(텍스트), data-i18n-html(HTML), data-i18n-ph(placeholder),
 *       data-i18n-al(aria-label) 지정. <body data-page="..."> 로 페이지 제목 번역.
 * 언어 전환: [data-lang="ko|en"] 버튼. 선택값은 localStorage에 저장.
 * 서버로 전송되는 값(신고 유형 등)은 번역하지 않음 — 화면 표시만 번역.
 */
(function () {
  'use strict';

  var T = {
    ko: {
      skip: '본문 바로가기',
      brand_main: '공직비위 익명신고센터',
      brand_sub: 'Anonymous Report Center',
      nav_about: '센터 안내', nav_report: '신고하기', nav_result: '결과확인',
      nav_faq: '자주 묻는 질문', nav_cta: '신고 접수',
      menu_open: '메뉴 열기', lang_aria: '언어 선택',
      bc_home: '홈',

      // index hero
      hero_eyebrow: '🔒 IP 추적 불가 · 완전 익명 보장',
      hero_h1: '용기 있는 제보가<br><span class="hl">깨끗한 문경</span>을 만듭니다.',
      hero_lead: '문경관광공사 공직비위 익명신고센터는 조직 내부의 부정·비리·갑질·이해충돌 등을 누구나 안심하고 신고할 수 있도록 익명성을 철저히 보장합니다.',
      hero_btn_report: '신고 접수하기', hero_btn_result: '처리결과 확인',

      // trust
      trust1_h: '완전한 익명성',
      trust1_p: '접속 IP·단말기 정보를 수집하지 않으며, 신고자를 특정할 수 있는 어떠한 정보도 기록되지 않습니다.',
      trust2_h: '신고번호로 소통',
      trust2_p: '접수 시 발급되는 신고번호와 비밀번호로만 처리 경과를 확인하고 담당자와 익명 소통합니다.',
      trust3_h: '신고자 보호',
      trust3_p: '「공익신고자 보호법」에 따라 신분 공개 금지와 불이익 조치 금지가 법적으로 보장됩니다.',

      // process
      proc_tag: 'How it works', proc_h: '신고는 이렇게 처리됩니다',
      proc_p: '접수부터 결과 통지까지 모든 단계가 익명으로 안전하게 진행됩니다.',
      step1_h: '신고 작성', step1_p: '실명 없이 사실관계와 증빙자료를 작성해 제출합니다.',
      step2_h: '신고번호 발급', step2_p: '본인만 아는 신고번호·비밀번호가 발급됩니다. 꼭 보관하세요.',
      step3_h: '조사·처리', step3_p: '감사 담당 부서가 사실 확인 후 공정하게 조사합니다.',
      step4_h: '결과 확인', step4_p: '신고번호로 접속해 처리 경과와 결과를 확인합니다.',

      // scope
      scope_tag: 'What to report', scope_h: '이런 사안을 신고할 수 있습니다',
      scope_p: '문경관광공사 임직원 및 수탁업무 관련자의 공직비위 전반을 다룹니다.',
      scope1_b: '금품·향응 수수', scope1_p: '직무와 관련한 금품, 선물, 접대, 편의 제공 등의 수수 행위.',
      scope2_b: '예산·계약 부정', scope2_p: '용역·공사·물품 계약의 특혜, 수의계약 남용, 예산 부당 집행.',
      scope3_b: '갑질·직장 내 괴롭힘', scope3_p: '지위를 이용한 부당 지시, 폭언, 따돌림, 사적 업무 지시 등.',
      scope4_b: '이해충돌', scope4_p: '사적 이해관계 미신고, 가족·지인 특혜, 미공개 정보 이용.',
      scope5_b: '채용·인사 비리', scope5_p: '채용 청탁, 부당한 인사 개입, 평가 조작 등.',
      scope6_b: '공용물·정보 유용', scope6_p: '공용 재산·시설·법인카드의 사적 사용, 자료 무단 유출.',

      // cta band
      cta_h: '망설이지 마세요. 당신은 보호받습니다.',
      cta_p: '작은 제보 하나가 공정한 조직문화의 시작이 됩니다.',
      cta_btn: '지금 신고하기',

      // footer
      f_org: '문경관광공사 공직비위 익명신고센터',
      f_addr: '경상북도 문경시 · 감사부서 운영',
      f_contact: '상담 문의: 감사부서 대표번호(평일 09:00~18:00)',
      f_links: '바로가기',
      f_protect_title: '신고자 보호 안내',
      f_protect_body: '「공익신고자 보호법」 및 「부패방지권익위법」에 따라<br>신고자의 신분은 보호되며 불이익 조치는 금지됩니다.',
      f_copy: '문경관광공사(Mungyeong Tourism Corporation). All rights reserved.',
      f_copy_simple: '문경관광공사 공직비위 익명신고센터',

      // report page
      page_report_h: '공직비위 신고 접수',
      page_report_p: '실명을 적지 않으셔도 됩니다. 사실에 근거하여 구체적으로 작성해 주세요.',
      rep_notice: '본 시스템은 접속 IP와 단말기 정보를 수집·저장하지 않습니다. 접수 완료 시 <b>신고번호</b>와 <b>비밀번호</b>가 발급되며, 이 정보로만 처리결과를 확인할 수 있으니 반드시 안전하게 보관하세요.',
      lbl_category: '신고 유형', opt_select: '유형을 선택하세요',
      cat1: '금품·향응 수수', cat2: '예산·계약 부정', cat3: '갑질·직장 내 괴롭힘',
      cat4: '이해충돌', cat5: '채용·인사 비리', cat6: '공용물·정보 유용', cat7: '기타 공직비위',
      lbl_dept: '신고 대상 소속(선택)', ph_dept: '예: ○○사업부 / 정확히 모르면 비워두세요',
      lbl_title: '제목', ph_title: '신고 내용을 한 줄로 요약해 주세요',
      lbl_occurred: '발생 시기(선택)', hint_occurred: '정확한 날짜를 모르면 대략적인 시기만 본문에 적으셔도 됩니다.',
      lbl_content: '신고 내용',
      ph_content: '누가(직위), 언제, 어디서, 무엇을, 어떻게 했는지 육하원칙에 따라 구체적으로 작성해 주세요. 추측보다 확인된 사실 위주로 적어 주시면 조사에 큰 도움이 됩니다.',
      counter_suffix: '/ 4000자',
      lbl_files: '증빙자료 첨부(선택)',
      file_dnd1: '파일을 끌어다 놓거나 ', file_pick: '여기를 클릭', file_dnd2: '해 선택하세요.',
      file_small: '문서·이미지·영상 등 (개별 20MB 이하)',
      hint_files: '파일에 포함된 이름·사번 등 신고자를 특정할 수 있는 정보는 미리 제거하는 것을 권장합니다.',
      lbl_pw: '신고 비밀번호 설정', ph_pw: '결과 확인 시 사용할 비밀번호(4자 이상)',
      hint_pw: '신고번호와 함께 처리결과 확인에 사용됩니다. 분실 시 복구가 불가능합니다.',
      consent: '위 내용은 사실이며, 허위·비방 목적의 신고는 관련 법령에 따라 보호받지 못할 수 있음을 이해하고 동의합니다.',
      submit_report: '익명으로 신고 접수',
      receipt_h: '✅ 신고가 접수되었습니다', receipt_p: '아래 정보를 반드시 저장하세요. 다시 표시되지 않습니다.',
      code_label: '신고번호', code_warn: '⚠️ 이 번호와 설정하신 비밀번호로만 결과를 확인할 수 있습니다.',
      btn_copy: '신고번호 복사', btn_go_result: '결과확인으로 이동',
      // report.js dynamic
      err_category: '신고 유형을 선택해 주세요.', err_title: '제목을 입력해 주세요.',
      err_content: '신고 내용을 20자 이상 구체적으로 작성해 주세요.',
      err_pw: '비밀번호를 4자 이상 설정해 주세요.', err_agree: '동의 항목에 체크해 주세요.',
      submitting: '접수 중…', submit_fail_suffix: ' (서버가 실행 중인지 확인하세요.)',
      submit_err: '접수 중 오류가 발생했습니다.', copied: '복사됨 ✓',

      // result page
      page_result_h: '신고 처리결과 확인', page_result_p: '접수 시 발급받은 신고번호와 비밀번호를 입력하세요.',
      res_notice: '신고번호와 비밀번호는 <b>본인만 보관</b>하고 있는 정보입니다. 분실 시 보안을 위해 재발급이 불가능하니 주의하세요.',
      lbl_code: '신고번호', ph_code: '예: MG-2026-ABC123',
      lbl_pw2: '비밀번호', ph_pw2: '접수 시 설정한 비밀번호',
      btn_lookup: '조회하기',
      res_history: '처리 이력', res_comm: '담당자와의 소통',
      lbl_reply: '담당자에게 추가 메시지 보내기(선택)', ph_reply: '추가로 전달할 내용이 있으면 작성하세요.',
      btn_send: '메시지 전송',
      res_title_prefix: '제목: ', res_no_msg: '아직 담당자 메시지가 없습니다.',
      reply_empty: '내용을 입력하세요.', reply_sent: '전송되었습니다. 새로고침하여 조회하면 반영됩니다.',
      reply_fail: '전송 실패', err_code_format: '신고번호 형식이 올바르지 않습니다. (예: MG-2026-ABC123)',
      err_lookup: '조회 중 오류가 발생했습니다.',
      sender_admin: '담당자', sender_reporter: '신고자',
      status_received: '접수완료', status_review: '검토중', status_investigating: '조사중',
      status_done: '처리완료', status_rejected: '종결',

      // faq page
      page_faq_h: '자주 묻는 질문', page_faq_p: '신고 전 궁금한 점을 확인해 보세요.',
      faq1_q: '정말 익명이 보장되나요?',
      faq1_a: '네. 본 센터는 접속 IP, 브라우저·단말기 식별 정보를 수집하거나 기록하지 않습니다. 신고 과정에서 실명·연락처를 요구하지 않으며, 신고자를 특정할 수 있는 어떠한 정보도 저장되지 않도록 설계되어 있습니다.',
      faq2_q: '누구를 신고할 수 있나요?',
      faq2_a: '문경관광공사 임직원 및 공사의 업무를 수탁·대행하는 관계자의 직무 관련 부정·비위 행위가 대상입니다. 금품수수, 예산·계약 부정, 갑질, 이해충돌, 채용비리, 공용물 유용 등이 포함됩니다.',
      faq3_q: '신고하면 어떻게 처리되나요?',
      faq3_a_html: '접수된 신고는 감사 담당 부서로 전달되어 사실관계 확인 및 조사가 진행됩니다. 처리 경과와 결과는 접수 시 발급된 신고번호와 비밀번호로 <a href="result.html">결과확인</a> 메뉴에서 조회할 수 있습니다.',
      faq4_q: '신고번호를 잃어버리면 어떻게 하나요?',
      faq4_a: '익명성 보장을 위해 신고자 정보를 저장하지 않으므로, 분실된 신고번호·비밀번호는 복구가 불가능합니다. 접수 완료 화면의 신고번호는 반드시 안전한 곳에 보관해 주세요.',
      faq5_q: '신고자는 어떤 보호를 받나요?',
      faq5_a: '「공익신고자 보호법」 및 「부패방지 및 국민권익위원회의 설치와 운영에 관한 법률」에 따라 신고자의 신분은 공개되지 않으며, 신고를 이유로 한 해고·징계 등 불이익 조치는 법으로 금지됩니다.',
      faq6_q: '증빙자료가 꼭 있어야 하나요?',
      faq6_a: '필수는 아닙니다. 다만 사진·문서·녹취 등 객관적 자료가 있으면 조사에 큰 도움이 됩니다. 자료에 신고자를 특정할 수 있는 정보(이름·사번 등)가 포함되지 않도록 확인 후 첨부해 주세요.',
      faq7_q: '허위로 신고하면 어떻게 되나요?',
      faq7_a: '고의적인 허위·비방 목적의 신고는 공익신고자 보호 대상에서 제외되며, 관련 법령에 따라 책임을 질 수 있습니다. 확인된 사실에 근거하여 신고해 주시기 바랍니다.',
      faq_cta: '신고하러 가기'
    },

    en: {
      skip: 'Skip to main content',
      brand_main: 'Anonymous Report Center',
      brand_sub: 'Mungyeong Tourism Corporation',
      nav_about: 'About', nav_report: 'Report', nav_result: 'Check Status',
      nav_faq: 'FAQ', nav_cta: 'File a Report',
      menu_open: 'Open menu', lang_aria: 'Select language',
      bc_home: 'Home',

      hero_eyebrow: '🔒 No IP tracking · Fully anonymous',
      hero_h1: 'Your courage builds a<br><span class="hl">cleaner Mungyeong</span>.',
      hero_lead: 'The Mungyeong Tourism Corporation Anonymous Report Center guarantees full anonymity so anyone can safely report corruption, misconduct, workplace abuse, and conflicts of interest.',
      hero_btn_report: 'File a Report', hero_btn_result: 'Check Status',

      trust1_h: 'Complete Anonymity',
      trust1_p: 'We do not collect IP or device information, and no data that could identify a reporter is ever recorded.',
      trust2_h: 'Communicate by Report No.',
      trust2_p: 'Use the report number and password issued at submission to check progress and communicate anonymously with staff.',
      trust3_h: 'Reporter Protection',
      trust3_p: 'Under the Public Interest Whistleblower Protection Act, identity disclosure and retaliation are legally prohibited.',

      proc_tag: 'How it works', proc_h: 'How your report is handled',
      proc_p: 'Every step, from submission to notification, is handled anonymously and securely.',
      step1_h: 'Write the report', step1_p: 'Submit the facts and any evidence without giving your name.',
      step2_h: 'Get a report number', step2_p: 'A report number and password only you know are issued. Keep them safe.',
      step3_h: 'Review & investigate', step3_p: 'The audit department verifies the facts and investigates fairly.',
      step4_h: 'Check the result', step4_p: 'Use your report number to check progress and the outcome.',

      scope_tag: 'What to report', scope_h: 'What you can report',
      scope_p: 'Covers misconduct by Mungyeong Tourism Corporation employees and contracted personnel.',
      scope1_b: 'Bribery & entertainment', scope1_p: 'Accepting money, gifts, hospitality, or favors related to one’s duties.',
      scope2_b: 'Budget & contract fraud', scope2_p: 'Favoritism in contracts, abuse of private contracts, improper budget spending.',
      scope3_b: 'Abuse of power & harassment', scope3_p: 'Unfair orders, verbal abuse, ostracism, or personal errands using one’s position.',
      scope4_b: 'Conflict of interest', scope4_p: 'Undisclosed private interests, favoring family/acquaintances, using non-public information.',
      scope5_b: 'Hiring & HR corruption', scope5_p: 'Recruitment solicitation, improper HR interference, manipulated evaluations.',
      scope6_b: 'Misuse of public assets/info', scope6_p: 'Personal use of public property, facilities, or corporate cards; unauthorized data leaks.',

      cta_h: 'Don’t hesitate. You are protected.',
      cta_p: 'One small report is the start of a fairer workplace.',
      cta_btn: 'Report now',

      f_org: 'Mungyeong Tourism Corp. — Anonymous Report Center',
      f_addr: 'Mungyeong-si, Gyeongsangbuk-do · Operated by the Audit Dept.',
      f_contact: 'Inquiries: Audit Dept. (Weekdays 09:00–18:00)',
      f_links: 'Quick Links',
      f_protect_title: 'Whistleblower Protection',
      f_protect_body: 'Under the Public Interest Whistleblower Protection Act and related laws,<br>reporters’ identities are protected and retaliation is prohibited.',
      f_copy: 'Mungyeong Tourism Corporation. All rights reserved.',
      f_copy_simple: 'Mungyeong Tourism Corp. Anonymous Report Center',

      page_report_h: 'File a Misconduct Report',
      page_report_p: 'You don’t need to give your name. Please describe the facts specifically.',
      rep_notice: 'This system does not collect or store IP or device information. On submission, a <b>report number</b> and <b>password</b> are issued; you can only check results with them, so keep them safe.',
      lbl_category: 'Report type', opt_select: 'Select a type',
      cat1: 'Bribery & entertainment', cat2: 'Budget & contract fraud', cat3: 'Abuse of power & harassment',
      cat4: 'Conflict of interest', cat5: 'Hiring & HR corruption', cat6: 'Misuse of public assets/info', cat7: 'Other misconduct',
      lbl_dept: 'Target department (optional)', ph_dept: 'e.g., ○○ Division / leave blank if unsure',
      lbl_title: 'Title', ph_title: 'Summarize your report in one line',
      lbl_occurred: 'When it happened (optional)', hint_occurred: 'If unsure of the exact date, just note the approximate time in the body.',
      lbl_content: 'Report details',
      ph_content: 'Describe who (position), when, where, what, and how in detail. Confirmed facts help the investigation far more than guesses.',
      counter_suffix: '/ 4000 chars',
      lbl_files: 'Attach evidence (optional)',
      file_dnd1: 'Drag & drop files, or ', file_pick: 'click here', file_dnd2: ' to select.',
      file_small: 'Documents, images, video, etc. (max 20MB each)',
      hint_files: 'We recommend removing identifying info (names, employee IDs) from files beforehand.',
      lbl_pw: 'Set a report password', ph_pw: 'Password for checking results (4+ characters)',
      hint_pw: 'Used with the report number to check results. It cannot be recovered if lost.',
      consent: 'I confirm the above is true and understand that false or defamatory reports may not be protected under the law.',
      submit_report: 'Submit anonymously',
      receipt_h: '✅ Your report has been submitted', receipt_p: 'Be sure to save the information below. It won’t be shown again.',
      code_label: 'Report number', code_warn: '⚠️ You can only check results with this number and your password.',
      btn_copy: 'Copy report number', btn_go_result: 'Go to Check Status',
      err_category: 'Please select a report type.', err_title: 'Please enter a title.',
      err_content: 'Please write at least 20 characters for the report details.',
      err_pw: 'Please set a password of at least 4 characters.', err_agree: 'Please check the consent box.',
      submitting: 'Submitting…', submit_fail_suffix: ' (Please check that the server is running.)',
      submit_err: 'An error occurred during submission.', copied: 'Copied ✓',

      page_result_h: 'Check Report Status', page_result_p: 'Enter the report number and password issued at submission.',
      res_notice: 'Your report number and password are <b>known only to you</b>. For security they cannot be reissued if lost.',
      lbl_code: 'Report number', ph_code: 'e.g., MG-2026-ABC123',
      lbl_pw2: 'Password', ph_pw2: 'The password you set at submission',
      btn_lookup: 'Look up',
      res_history: 'Status history', res_comm: 'Communication with staff',
      lbl_reply: 'Send an additional message to staff (optional)', ph_reply: 'Write anything else you’d like to add.',
      btn_send: 'Send message',
      res_title_prefix: 'Title: ', res_no_msg: 'No messages from staff yet.',
      reply_empty: 'Please enter a message.', reply_sent: 'Sent. Refresh and look up again to see it.',
      reply_fail: 'Failed to send.', err_code_format: 'Invalid report number format. (e.g., MG-2026-ABC123)',
      err_lookup: 'An error occurred during lookup.',
      sender_admin: 'Staff', sender_reporter: 'Reporter',
      status_received: 'Received', status_review: 'Under review', status_investigating: 'Investigating',
      status_done: 'Completed', status_rejected: 'Closed',

      page_faq_h: 'Frequently Asked Questions', page_faq_p: 'Check common questions before reporting.',
      faq1_q: 'Is anonymity really guaranteed?',
      faq1_a: 'Yes. This center does not collect or record your IP, browser, or device identifiers. It never asks for your name or contact details, and is designed so that no information that could identify a reporter is stored.',
      faq2_q: 'Who can I report?',
      faq2_a: 'Any job-related corruption or misconduct by Mungyeong Tourism Corporation employees or those contracted to perform its work — including bribery, budget/contract fraud, abuse of power, conflicts of interest, hiring corruption, and misuse of public assets.',
      faq3_q: 'What happens after I report?',
      faq3_a_html: 'Your report is forwarded to the audit department, which verifies the facts and investigates. You can check progress and the outcome under <a href="result.html">Check Status</a> using the report number and password issued at submission.',
      faq4_q: 'What if I lose my report number?',
      faq4_a: 'To guarantee anonymity we do not store reporter information, so a lost report number or password cannot be recovered. Please keep the report number from the confirmation screen somewhere safe.',
      faq5_q: 'What protections does a reporter have?',
      faq5_a: 'Under the Public Interest Whistleblower Protection Act and the Act on the Prevention of Corruption, a reporter’s identity is not disclosed, and retaliation such as dismissal or discipline for reporting is prohibited by law.',
      faq6_q: 'Do I need supporting evidence?',
      faq6_a: 'It is not required, but objective materials such as photos, documents, or recordings greatly help the investigation. Please check that files do not contain information identifying you (name, employee ID) before attaching.',
      faq7_q: 'What happens if I file a false report?',
      faq7_a: 'Deliberately false or defamatory reports are excluded from whistleblower protection and may incur legal liability. Please report based on confirmed facts.',
      faq_cta: 'Go to report'
    }
  };

  var TITLES = {
    index: { ko: '문경관광공사 공직비위 익명신고센터', en: 'Mungyeong Tourism Corp. — Anonymous Report Center' },
    report: { ko: '신고하기 · 문경관광공사 공직비위 익명신고센터', en: 'Report · MGTC Anonymous Report Center' },
    result: { ko: '결과확인 · 문경관광공사 공직비위 익명신고센터', en: 'Check Status · MGTC Anonymous Report Center' },
    faq: { ko: '자주 묻는 질문 · 문경관광공사 공직비위 익명신고센터', en: 'FAQ · MGTC Anonymous Report Center' }
  };

  var LS = 'mgtc_lang';
  function cur() { try { return localStorage.getItem(LS) || 'ko'; } catch (e) { return 'ko'; } }
  function t(key) { var d = T[cur()] || T.ko; return d[key] != null ? d[key] : (T.ko[key] != null ? T.ko[key] : key); }

  function apply(lang) {
    var d = T[lang] || T.ko;
    try { document.documentElement.lang = lang; } catch (e) {}
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n'); if (d[k] != null) el.textContent = d[k];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-html'); if (d[k] != null) el.innerHTML = d[k];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-ph'); if (d[k] != null) el.setAttribute('placeholder', d[k]);
    });
    document.querySelectorAll('[data-i18n-al]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-al'); if (d[k] != null) el.setAttribute('aria-label', d[k]);
    });
    var page = document.body.getAttribute('data-page');
    if (page && TITLES[page] && TITLES[page][lang]) document.title = TITLES[page][lang];
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      var on = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function set(lang) { try { localStorage.setItem(LS, lang); } catch (e) {} apply(lang); }

  window.MGTC_I18N = { t: t, lang: cur, set: set, apply: apply };

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () { set(btn.getAttribute('data-lang')); });
    });
    apply(cur());
  });
})();
