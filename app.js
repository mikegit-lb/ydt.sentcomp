(() => {
  "use strict";

  const questions = [...(window.YDT_QUESTIONS || [])].sort((a, b) => a.id - b.id);
  const modules = window.YDT_MODULES || [];
  const method = window.YDT_METHOD || {};
  const storageKey = "ydt-sentence-completion-v1";
  const totalQuestions = questions.length;
  const examDuration = 50 * 60 * 1000;
  const appView = document.getElementById("app-view");
  const moduleNav = document.getElementById("module-nav");
  const questionGrid = document.getElementById("sidebar-question-grid");
  const breadcrumb = document.getElementById("breadcrumb");
  const storageStatus = document.getElementById("storage-status");
  const modeToggle = document.getElementById("mode-toggle");
  const toast = document.getElementById("toast");

  let storageUsable = true;
  let toastTimeout;

  function emptyProgress() {
    return { version: 1, answers: {}, bookmarks: [], examSession: null };
  }

  function loadProgress() {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return emptyProgress();
      const parsed = JSON.parse(raw);
      return {
        ...emptyProgress(),
        ...parsed,
        answers: parsed.answers && typeof parsed.answers === "object" ? parsed.answers : {},
        bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
        examSession: parsed.examSession && typeof parsed.examSession === "object" ? parsed.examSession : null
      };
    } catch {
      storageUsable = false;
      return emptyProgress();
    }
  }

  const progress = loadProgress();
  const state = {
    view: "method",
    currentId: progress.examSession?.currentId || 1,
    selectedAnswer: null,
    hintVisible: false,
    examSummary: null
  };

  function saveProgress() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(progress));
      storageUsable = true;
      storageStatus.textContent = "İlerlemen bu cihazda saklanır.";
    } catch {
      storageUsable = false;
      storageStatus.textContent = "Kayıt kullanılamıyor; bu oturumdaki ilerleme geçici.";
    }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function currentQuestion() {
    return questions.find((question) => question.id === state.currentId) || questions[0];
  }

  function currentModule() {
    const question = currentQuestion();
    return modules.find((item) => item.id === question?.module) || modules[0];
  }

  function questionsInModule(moduleId) {
    return questions.filter((question) => question.module === moduleId);
  }

  function getAnswer(questionId) {
    return progress.answers[String(questionId)] || null;
  }

  function getQuestionStatus(questionId) {
    const answer = getAnswer(questionId);
    if (!answer) return "";
    return answer.correct ? "is-correct" : "is-wrong";
  }

  function moduleStats(moduleId) {
    const items = questionsInModule(moduleId);
    const answered = items.filter((question) => getAnswer(question.id));
    const correct = answered.filter((question) => getAnswer(question.id).correct).length;
    return { answered: answered.length, correct, total: items.length };
  }

  function renderSidebar() {
    document.querySelectorAll(".nav-link").forEach((button) => {
      if (button.dataset.view === state.view) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });

    const activeModule = currentModule();
    moduleNav.innerHTML = modules.map((item) => {
      const stats = moduleStats(item.id);
      return `<button class="module-link" type="button" data-module="${item.id}" aria-current="${activeModule?.id === item.id ? "true" : "false"}" aria-label="${escapeHTML(item.title)}, ${stats.answered} / ${stats.total} soru çözüldü">
        <span class="module-number">${String(item.id + 1).padStart(2, "0")}</span>
        <span class="module-name">${escapeHTML(item.title)}</span>
        <span class="module-range">${stats.answered}/${stats.total}</span>
      </button>`;
    }).join("");

    const showQuestionGrid = state.view === "practice" && Boolean(activeModule);
    questionGrid.hidden = !showQuestionGrid;
    if (showQuestionGrid) {
      questionGrid.setAttribute("aria-label", `${activeModule.title} soruları`);
      questionGrid.innerHTML = questionsInModule(activeModule.id).map((question) => `
        <button class="side-question ${getQuestionStatus(question.id)}" type="button" data-question="${question.id}" aria-current="${state.currentId === question.id ? "true" : "false"}" aria-label="Soru ${question.id}${getAnswer(question.id) ? getAnswer(question.id).correct ? ", doğru cevaplandı" : ", tekrar gözden geçir" : ""}">${String(question.id).padStart(2, "0")}</button>
      `).join("");
    } else {
      questionGrid.innerHTML = "";
    }
  }

  function renderHeader() {
    if (state.view === "practice") {
      const question = currentQuestion();
      const moduleItem = currentModule();
      breadcrumb.textContent = `${moduleItem?.title || "50 Soru"} / Soru ${String(question?.id || 1).padStart(2, "0")}`;
      modeToggle.hidden = false;
      if (progress.examSession) {
        modeToggle.textContent = "Denemeyi bitir";
        modeToggle.classList.add("secondary");
        modeToggle.setAttribute("aria-label", "Süreli denemeyi bitir ve sonuçları göster");
      } else {
        modeToggle.textContent = "Süreli denemeyi başlat";
        modeToggle.classList.remove("secondary");
        modeToggle.setAttribute("aria-label", "50 soruluk süreli denemeyi başlat");
      }
    } else if (state.view === "progress") {
      breadcrumb.textContent = "İlerlemem / Çalışma özeti";
      modeToggle.hidden = true;
    } else {
      breadcrumb.textContent = "Yöntem / Çözüm sistemi";
      modeToggle.hidden = true;
    }

    if (!storageUsable) storageStatus.textContent = "Kayıt kullanılamıyor; bu oturumdaki ilerleme geçici.";
  }

  function setView(view, focus = true) {
    if (!["method", "practice", "progress"].includes(view)) return;
    state.view = view;
    if (view === "practice" && !currentQuestion()) state.currentId = questions[0]?.id || 1;
    render();
    if (focus) appView.focus({ preventScroll: true });
  }

  function renderMethod() {
    const steps = (method.steps || []).map((step) => `
      <article class="method-step">
        <div class="step-number" aria-hidden="true">${escapeHTML(step.number)}</div>
        <div class="step-copy">
          <h3>${escapeHTML(step.title)}</h3>
          <p>${escapeHTML(step.body)}</p>
          <span class="step-cue">${escapeHTML(step.cue)}</span>
        </div>
      </article>
    `).join("");

    const tactics = (method.tactics || []).map((item) => `
      <article class="strategy-item">
        <div class="eyebrow">${escapeHTML(item.label)}</div>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.body)}</p>
      </article>
    `).join("");

    const traps = (method.traps || []).map((item) => `
      <article class="trap-item"><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.text)}</p></article>
    `).join("");

    const routine = (method.routine || []).map((item) => `<li>${escapeHTML(item)}</li>`).join("");
    const example = method.example || { stem: "", answer: "", logic: "", explanation: "" };

    appView.innerHTML = `
      <section aria-labelledby="method-title">
        <h1 id="method-title" class="page-heading">Boşluğu değil, ilişkiyi çöz.</h1>
        <p class="page-intro">Seçeneklere geçmeden önce cümlenin senden ne istediğini belirle.</p>
        <div class="method-steps">${steps}</div>

        <div class="worked-example">
          <div class="worked-label">Örnek çözüm</div>
          <h2 class="worked-stem">${escapeHTML(example.stem)}</h2>
          <div class="worked-columns">
            <div><h3>Beklenen devam</h3><p>${escapeHTML(example.logic)}</p></div>
            <div><h3>Doğru tamamlamanın özü</h3><p>${escapeHTML(example.answer)}</p></div>
          </div>
          <p class="worked-explanation">${escapeHTML(example.explanation)}</p>
          <button class="button" type="button" data-action="start-practice">İlk soruya geç <span aria-hidden="true">→</span></button>
        </div>
      </section>

      <section class="strategy-section" aria-labelledby="tactics-title">
        <h2 id="tactics-title" class="section-title">Daha az kullanılan, güçlü kontroller</h2>
        <p class="section-subtitle">Bunlar cevabı tahmin ettirmez; çeldiricileri sistemli biçimde daraltır.</p>
        <div class="strategy-list">${tactics}</div>
      </section>

      <section class="strategy-section" aria-labelledby="traps-title">
        <h2 id="traps-title" class="section-title">Çeldiriciyi tanı</h2>
        <div class="trap-list">${traps}</div>
      </section>

      <section class="strategy-section" aria-labelledby="routine-title">
        <h2 id="routine-title" class="section-title">Her soruda aynı kısa sıra</h2>
        <ol class="routine-list">${routine}</ol>
      </section>

      <p class="source-note">${escapeHTML(method.sourceNote || "Bu setteki sorular özgündür; resmî sınav sorusu değildir.")} <a class="source-link" href="https://cdn.osym.gov.tr/pdfdokuman/2026/YKS/TSK/ydt_ing_2026_kitapcik_Di55.pdf" target="_blank" rel="noopener noreferrer">ÖSYM 2026 kitapçığını aç (PDF)</a></p>
    `;
  }

  function renderQuestionNumberButtons(className = "side-question") {
    const moduleItem = currentModule();
    return questionsInModule(moduleItem?.id ?? 0).map((question) => `
      <button class="${className} ${getQuestionStatus(question.id)}" type="button" data-question="${question.id}" aria-current="${state.currentId === question.id ? "true" : "false"}" aria-label="Soru ${question.id}${getAnswer(question.id) ? getAnswer(question.id).correct ? ", doğru cevaplandı" : ", tekrar gözden geçir" : ""}">${String(question.id).padStart(2, "0")}</button>
    `).join("");
  }

  function renderFeedback(question, answer) {
    if (!answer) return "";
    const correct = answer.correct;
    const reasons = Object.entries(question.options).map(([letter]) => `
      <li class="option-reason ${letter === question.answer ? "is-answer" : ""}">
        <strong>${letter}${letter === question.answer ? " · doğru" : ""}</strong>
        <span>${escapeHTML(question.why[letter])}</span>
      </li>
    `).join("");

    return `<section class="feedback ${correct ? "result-correct" : "result-wrong"}" aria-live="polite">
      <h2 class="feedback-heading">${correct ? "Doğru. Bağı doğru kurdun." : `Seçimin ${answer.choice}; doğru cevap ${question.answer}.`}</h2>
      <p class="feedback-copy">${escapeHTML(question.explanation)}</p>
      <p class="rule-line"><strong>İpucu:</strong> ${escapeHTML(question.clue)}</p>
      <h3 class="rail-mini-heading">Beş seçeneği de denetle</h3>
      <ul class="option-reasons">${reasons}</ul>
      <button class="button secondary" type="button" data-action="retry-question">Soruyu yeniden çöz</button>
    </section>`;
  }

  function renderPractice() {
    if (!questions.length) {
      appView.innerHTML = `<h1 class="page-heading">Soru verisi bulunamadı.</h1><p class="page-intro">Sorular yüklenemedi. Sayfayı yeniden açmayı deneyin.</p>`;
      return;
    }

    const question = currentQuestion();
    const moduleItem = currentModule();
    const isExam = Boolean(progress.examSession);
    const savedAnswer = !isExam ? getAnswer(question.id) : null;
    const examAnswer = isExam ? progress.examSession.answers?.[String(question.id)] : null;
    const selected = isExam ? (examAnswer || "") : (savedAnswer?.choice || state.selectedAnswer || "");
    const solvedCount = Object.keys(progress.answers).length;
    const answeredThisModule = moduleStats(moduleItem.id).answered;
    const bookmarked = progress.bookmarks.includes(question.id);
    const options = Object.entries(question.options).map(([letter, text]) => {
      const markedCorrect = isExam && progress.examSession.finished ? letter === question.answer : Boolean(savedAnswer && letter === question.answer);
      const markedWrong = isExam && progress.examSession.finished ? letter === selected && letter !== question.answer : Boolean(savedAnswer && letter === savedAnswer.choice && !savedAnswer.correct);
      const dim = Boolean(savedAnswer && letter !== question.answer && letter !== savedAnswer.choice);
      const statusClass = markedCorrect ? "is-correct" : markedWrong ? "is-wrong" : dim ? "is-muted" : "";
      return `<label class="option ${statusClass}">
        <input type="radio" name="answer" value="${letter}" ${selected === letter ? "checked" : ""} ${savedAnswer || (isExam && progress.examSession.finished) ? "disabled" : ""}>
        <span class="option-body"><span class="option-letter">${letter}</span><span class="option-text">${escapeHTML(text)}</span></span>
      </label>`;
    }).join("");
    const progressPercent = totalQuestions ? Math.round((solvedCount / totalQuestions) * 100) : 0;
    const examAnsweredCount = isExam ? Object.keys(progress.examSession.answers || {}).length : 0;
    const feedbackAnswer = !isExam ? savedAnswer : progress.examSession.finished && selected ? { choice: selected, correct: selected === question.answer } : null;
    const unansweredLinks = state.examSummary?.unansweredIds?.length ? `<div class="exam-unanswered"><strong>Boş bırakılanlar:</strong> ${state.examSummary.unansweredIds.map((id) => `<button type="button" class="text-link" data-question="${id}">${String(id).padStart(2, "0")}</button>`).join(" ")}</div>` : "";
    const examSummary = state.examSummary ? `<section class="exam-results" role="status"><h2>Deneme tamamlandı</h2><p>${state.examSummary.answered} soruda yanıt verdin. ${state.examSummary.correct} doğru; ${state.examSummary.answered - state.examSummary.correct} yanlış. ${state.examSummary.unansweredIds.length ? `${state.examSummary.unansweredIds.length} soru boş kaldı.` : "Tüm soruları yanıtladın."} Yanıtladığın soruları açıp gerekçeleri inceleyebilirsin.</p>${unansweredLinks}</section>` : "";
    const examBanner = isExam ? `<div class="exam-banner"><div><strong>Süreli deneme · 50 dakika</strong><div class="question-module-label">Bu, çalışma temposu için seçilmiş süredir; resmî soru başı süre değildir. Açıklamalar deneme bitince açılır.</div></div><div class="exam-timer" id="exam-timer" aria-live="off">--:--</div></div>` : "";
    const feedback = feedbackAnswer ? renderFeedback(question, feedbackAnswer) : "";
    const learnActions = !isExam ? `
      <button class="button" type="button" data-action="check-answer" ${savedAnswer || !selected ? "disabled" : ""}>Cevabı kontrol et</button>
      <button class="button secondary" type="button" data-action="show-hint" aria-expanded="${state.hintVisible}">İpucu</button>
      <button class="button subtle" type="button" data-action="bookmark" aria-pressed="${bookmarked}">${bookmarked ? "İşaretlendi ✓" : "Daha sonra bak"}</button>
    ` : `<span class="exam-save-indicator" aria-live="polite">${selected ? "Yanıt kaydedildi" : "Bir seçenek işaretle"}</span>`;
    const hint = state.hintVisible ? `<div class="hint-box" role="note"><strong>İpucu:</strong> ${escapeHTML(question.hint)}</div>` : "";
    const mobileModuleButtons = modules.map((item) => `<button class="module-chip" type="button" data-module="${item.id}" aria-current="${item.id === moduleItem.id ? "true" : "false"}">${escapeHTML(item.short)}</button>`).join("");
    const questionNav = `<nav class="question-nav-mobile" aria-label="Bu setteki sorular">${renderQuestionNumberButtons()}</nav>`;
    const prevId = questions.find((item) => item.id < question.id)?.id;
    const nextId = questions.find((item) => item.id > question.id)?.id;
    const footer = `<div class="practice-footer-nav">
      <button class="button secondary" type="button" data-question="${prevId || questions[questions.length - 1].id}" aria-label="Önceki soru">← Önceki</button>
      <span class="question-module-label">${answeredThisModule} / ${moduleStats(moduleItem.id).total} bu sette çözüldü</span>
      <button class="button secondary" type="button" data-question="${nextId || questions[0].id}" aria-label="Sonraki soru">Sonraki →</button>
    </div>`;

    appView.innerHTML = `
      <div class="practice-module-strip" aria-label="Soru modülü">${mobileModuleButtons}</div>
      ${examSummary}
      ${examBanner}
      ${questionNav}
      <div class="practice-layout">
        <section class="practice-main" aria-labelledby="question-stem">
          <div class="question-topline">
            <span class="question-index">Soru ${String(question.id).padStart(2, "0")} / ${totalQuestions}</span>
            <span class="question-module-label">${escapeHTML(moduleItem.title)} · ${escapeHTML(moduleItem.focus)}</span>
          </div>
          <h1 id="question-stem" class="question-stem">${escapeHTML(question.stem).replace("----", '<span class="blank">____</span>')}</h1>
          <fieldset class="options"><legend>Doğru tamamlamayı seç</legend>${options}</fieldset>
          <div class="question-actions">${learnActions}</div>
          ${hint}
      ${isExam && !progress.examSession.finished ? `<div class="exam-submit-row"><p><span class="exam-answered-count">${examAnsweredCount}</span> / ${totalQuestions} soru yanıtlandı. Süre dolmadan denemeyi bitirerek cevap anahtarını ve ayrıntılı gerekçeleri açabilirsin.</p><button class="button" type="button" data-action="submit-exam">Denemeyi bitir ve sonuçları gör</button></div>` : ""}
          ${feedback}
          ${footer}
        </section>
        <aside class="reasoning-rail" aria-label="Çözüm ipuçları">
          <h2>Çözüm izi</h2>
          <div class="clue-box">${escapeHTML(question.clue)}</div>
          <p>${escapeHTML(question.hint)}</p>
          <div class="rail-divider"></div>
          <div class="rail-mini-heading">Genel ilerleme</div>
          <div class="rail-progress" role="progressbar" aria-label="Çözülen soru oranı" aria-valuemin="0" aria-valuemax="${totalQuestions}" aria-valuenow="${solvedCount}"><span style="width:${progressPercent}%"></span></div>
          <p class="rail-progress-copy">${solvedCount} / ${totalQuestions} soru çözüldü</p>
          <div class="rail-divider"></div>
          <p class="rail-mini-heading">Bu set</p>
          <p class="rail-progress-copy">${escapeHTML(moduleItem.description)}</p>
          <p class="rail-progress-copy">${answeredThisModule} / ${moduleStats(moduleItem.id).total} tamamlandı</p>
        </aside>
      </div>
    `;

    updateTimer();
  }

  function renderProgress() {
    const records = Object.entries(progress.answers).map(([id, answer]) => ({ id: Number(id), ...answer }));
    const solved = records.length;
    const correct = records.filter((answer) => answer.correct).length;
    const accuracy = solved ? `${Math.round((correct / solved) * 100)}%` : "—";
    const wrong = records.filter((answer) => !answer.correct).sort((a, b) => a.id - b.id);
    const bookmarked = [...new Set(progress.bookmarks)].sort((a, b) => a - b);
    const pct = totalQuestions ? Math.round((solved / totalQuestions) * 100) : 0;

    const wrongContent = wrong.length ? `<div class="review-list">${wrong.map((record) => {
      const question = questions.find((item) => item.id === record.id);
      return `<article class="review-row">
        <div class="review-number">${String(record.id).padStart(2, "0")}</div>
        <div><h3>${escapeHTML(question?.stem || "Soru")}</h3><p>Senin yanıtın ${escapeHTML(record.choice)} · Doğru yanıt ${escapeHTML(question?.answer || "—")} · ${escapeHTML(question?.clue || "")}</p></div>
        <button class="button secondary" type="button" data-question="${record.id}">Tekrar çöz</button>
      </article>`;
    }).join("")}</div>` : `<div class="empty-state">Yanlış cevapların burada birikir. Her çözümde hangi ipucunu kaçırdığını göreceksin.</div>`;

    const bookmarkContent = bookmarked.length ? `<div class="review-list">${bookmarked.map((id) => {
      const question = questions.find((item) => item.id === id);
      return `<article class="review-row"><div class="review-number">${String(id).padStart(2, "0")}</div><div><h3>${escapeHTML(question?.stem || "Soru")}</h3><p>${escapeHTML(modules[question?.module]?.title || "50 Soru")}</p></div><button class="button secondary" type="button" data-question="${id}">Soruyu aç</button></article>`;
    }).join("")}</div>` : `<div class="empty-state">İşaretlediğin sorular burada.</div>`;

    const moduleRows = modules.map((item) => {
      const stats = moduleStats(item.id);
      const bar = stats.total ? Math.round((stats.answered / stats.total) * 100) : 0;
      return `<div class="module-progress-row">
        <div class="module-progress-name">${escapeHTML(item.title)}</div>
        <div class="module-progress-track" role="progressbar" aria-label="${escapeHTML(item.title)} ilerlemesi" aria-valuemin="0" aria-valuemax="${stats.total}" aria-valuenow="${stats.answered}"><span style="width:${bar}%"></span></div>
        <div class="module-progress-value">${stats.answered} / ${stats.total}</div>
      </div>`;
    }).join("");

    appView.innerHTML = `
      <section aria-labelledby="progress-title">
        <h1 id="progress-title" class="page-heading">İlerlemeni gör.</h1>
        <p class="page-intro">Yanlışlar, sonraki çalışma rotanı belirler.</p>
        <section class="progress-summary" aria-labelledby="summary-title">
          <h2 id="summary-title" class="progress-summary-heading">Çalışma özeti</h2>
          <div class="summary-row">
            <div>
              <p class="solved-count">${solved} / ${totalQuestions} çözüldü</p>
              <div class="progress-track" role="progressbar" aria-label="Toplam ilerleme" aria-valuemin="0" aria-valuemax="${totalQuestions}" aria-valuenow="${solved}"><span style="width:${pct}%"></span></div>
              <p class="progress-note">${solved ? `${correct} doğru · ${solved - correct} yanlış` : "Henüz cevaplanmış soru yok"}</p>
            </div>
            <div class="accuracy-box"><span>Doğruluk</span><strong>${accuracy}</strong></div>
          </div>
        </section>

        <section class="progress-section" aria-labelledby="module-progress-title">
          <h2 id="module-progress-title" class="progress-section-title">Setlere göre ilerleme <small>Her biri 10 özgün soru</small></h2>
          <div class="module-progress-list">${moduleRows}</div>
        </section>
        <section class="progress-section" aria-labelledby="wrong-title">
          <h2 id="wrong-title" class="progress-section-title">Hata defteri <small>${wrong.length} soru tekrar bekliyor</small></h2>
          ${wrongContent}
        </section>
        <section class="progress-section" aria-labelledby="bookmark-title">
          <h2 id="bookmark-title" class="progress-section-title">Daha sonra bak <small>${bookmarked.length} işaretli soru</small></h2>
          ${bookmarkContent}
        </section>
        <div class="progress-tools"><button class="button subtle" type="button" data-action="reset-progress">Tüm ilerlemeyi sıfırla</button></div>
      </section>
    `;
  }

  function render() {
    renderSidebar();
    renderHeader();
    if (state.view === "practice") renderPractice();
    else if (state.view === "progress") renderProgress();
    else renderMethod();
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  function selectQuestion(questionId) {
    if (!questions.some((question) => question.id === questionId)) return;
    state.currentId = questionId;
    state.selectedAnswer = null;
    state.hintVisible = false;
    state.view = "practice";
    if (progress.examSession) {
      progress.examSession.currentId = questionId;
      saveProgress();
    }
    render();
  }

  function selectModule(moduleId) {
    const target = questions.find((question) => question.module === moduleId);
    if (target) selectQuestion(target.id);
  }

  function checkAnswer() {
    const question = currentQuestion();
    const selected = document.querySelector('input[name="answer"]:checked')?.value || state.selectedAnswer;
    if (!selected) {
      showToast("Önce bir seçenek işaretle.");
      return;
    }
    if (getAnswer(question.id)) return;
    progress.answers[String(question.id)] = {
      choice: selected,
      correct: selected === question.answer,
      mode: "learn",
      answeredAt: new Date().toISOString()
    };
    state.selectedAnswer = selected;
    state.hintVisible = false;
    saveProgress();
    render();
    if (selected === question.answer) showToast("Doğru cevap. Gerekçeyi de incele.");
  }

  function retryQuestion() {
    const question = currentQuestion();
    delete progress.answers[String(question.id)];
    state.selectedAnswer = null;
    state.hintVisible = false;
    saveProgress();
    render();
  }

  function toggleBookmark() {
    const id = currentQuestion().id;
    const index = progress.bookmarks.indexOf(id);
    if (index >= 0) {
      progress.bookmarks.splice(index, 1);
      showToast("Soru işaretlilerden çıkarıldı.");
    } else {
      progress.bookmarks.push(id);
      showToast("Soru daha sonra bakmak üzere kaydedildi.");
    }
    saveProgress();
    render();
  }

  function startExam() {
    if (progress.examSession) {
      showToast("Süreli deneme zaten devam ediyor.");
      return;
    }
    state.examSummary = null;
    progress.examSession = { startedAt: Date.now(), endsAt: Date.now() + examDuration, answers: {} };
    state.currentId = questions[0]?.id || 1;
    state.selectedAnswer = null;
    state.hintVisible = false;
    saveProgress();
    state.view = "practice";
    render();
    startTimer();
  }

  function finishExam() {
    const session = progress.examSession;
    if (!session) return;
    const records = Object.entries(session.answers || {});
    let correct = 0;
    for (const [id, choice] of records) {
      const question = questions.find((item) => item.id === Number(id));
      if (!question) continue;
      const isCorrect = choice === question.answer;
      if (isCorrect) correct += 1;
      progress.answers[String(question.id)] = {
        choice,
        correct: isCorrect,
        mode: "timed",
        answeredAt: new Date().toISOString()
      };
    }
    const answeredIds = new Set(records.map(([id]) => Number(id)));
    const unansweredIds = questions.filter((question) => !answeredIds.has(question.id)).map((question) => question.id);
    state.examSummary = { answered: records.length, correct, total: totalQuestions, unansweredIds };
    progress.examSession = null;
    saveProgress();
    window.clearInterval(timerInterval);
    state.view = "practice";
    render();
    showToast(`Deneme tamamlandı: ${correct} / ${records.length} doğru.`);
  }

  let timerInterval = null;
  function updateTimer() {
    const timer = document.getElementById("exam-timer");
    if (!timer || !progress.examSession) return;
    const remaining = Math.max(0, progress.examSession.endsAt - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    timer.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    if (remaining <= 0) finishExam();
  }

  function startTimer() {
    window.clearInterval(timerInterval);
    if (!progress.examSession) return;
    updateTimer();
    timerInterval = window.setInterval(updateTimer, 1000);
  }

  function toggleViewMode() {
    if (progress.examSession) {
      finishExam();
      return;
    }
    startExam();
  }

  function resetProgress() {
    const confirmed = window.confirm("Çözümler, hata defteri, işaretli sorular ve deneme oturumu silinsin mi?");
    if (!confirmed) return;
    const fresh = emptyProgress();
    progress.answers = fresh.answers;
    progress.bookmarks = fresh.bookmarks;
    progress.examSession = null;
    state.examSummary = null;
    state.selectedAnswer = null;
    window.clearInterval(timerInterval);
    saveProgress();
    render();
    showToast("İlerlemen sıfırlandı.");
  }

  document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
      event.preventDefault();
      setView(viewButton.dataset.view);
      return;
    }

    const moduleButton = event.target.closest("[data-module]");
    if (moduleButton) {
      selectModule(Number(moduleButton.dataset.module));
      return;
    }

    const questionButton = event.target.closest("[data-question]");
    if (questionButton) {
      selectQuestion(Number(questionButton.dataset.question));
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    switch (actionButton.dataset.action) {
      case "start-practice": setView("practice"); break;
      case "check-answer": checkAnswer(); break;
      case "show-hint": state.hintVisible = !state.hintVisible; render(); break;
      case "bookmark": toggleBookmark(); break;
      case "retry-question": retryQuestion(); break;
      case "exam-toggle": toggleViewMode(); break;
      case "submit-exam": finishExam(); break;
      case "reset-progress": resetProgress(); break;
      default: break;
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches('input[name="answer"]')) {
      state.selectedAnswer = event.target.value;
      if (progress.examSession) {
        progress.examSession.answers[String(currentQuestion().id)] = event.target.value;
        saveProgress();
        const answeredCount = document.querySelector(".exam-answered-count");
        if (answeredCount) answeredCount.textContent = String(Object.keys(progress.examSession.answers).length);
        const indicator = document.querySelector(".exam-save-indicator");
        if (indicator) indicator.textContent = "Yanıt kaydedildi";
      } else {
        const checkButton = document.querySelector('[data-action="check-answer"]');
        if (checkButton) checkButton.disabled = false;
      }
    }
  });

  modeToggle.addEventListener("click", toggleViewMode);

  if (progress.examSession && progress.examSession.endsAt <= Date.now()) {
    finishExam();
  } else {
    render();
    if (progress.examSession) {
      state.view = "practice";
      render();
      startTimer();
      showToast("Süreli denemen kaldığı yerden devam ediyor.");
    }
  }
})();
