(() => {
  "use strict";
  const engine = window.PhasmoTool;
  const model = window.PhasmoConceptState;
  const footsteps = window.PhasmoFootsteps;
  const footView = window.PhasmoFootstepView;
  const knowledge = window.PhasmoKnowledge;
  const adopted = document.body.dataset.app === "dossier";
  const storageKey = adopted ? model.DOSSIER_KEY : model.STORAGE_KEY;
  const review = knowledge.REVIEW;
  // Reuse the audited engine, without starting its original UI renderer.
  window.removeEventListener("DOMContentLoaded", engine.init);
  const concepts = { matrix: "証拠マトリクス", file: "調査ファイル", flow: "ステップ調査" };
  const statuses = { unknown: "未確認", confirmed: "確定", denied: "否定" };
  const evidenceIcons = { dots: "scan-line", emf: "radio", freezing: "thermometer-snowflake", orb: "circle-dot", spiritBox: "audio-lines", ultraviolet: "fingerprint", writing: "notebook-pen" };
  const requested = new URLSearchParams(location.search).get("concept");
  let concept = adopted ? "file" : Object.hasOwn(concepts, requested) ? requested : "matrix";
  let state;
  let root;
  let dialog;
  let toastTimer;
  let footPlayer;
  let playback = null;

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const icon = (name, className = "") => `<img class="${className}" src="./assets/${name}.svg" width="20" height="20" alt="" />`;
  const iconButton = (action, name, label, extra = "") => `<button type="button" class="icon-control" data-action="${action}" data-focus="${action}" title="${label}" aria-label="${label}" ${extra}>${icon(name)}</button>`;
  const notes = (text) => `<ul class="record-notes">${model.noteItems(text).map((item) => `<li>${escapeHtml(item).replace(/^(確認|注意): /u, '<strong class="record-note-label">$1: </strong>')}</li>`).join("")}</ul>`;

  function wikiLinks(ghosts) {
    return `<div class="wiki-links">${ghosts.map((ghost) => `<a href="${knowledge.source(ghost.id)}" target="_blank" rel="noopener">${escapeHtml(ghost.name)}の日本語Wiki</a>`).join("")}</div>`;
  }

  function reportNotes(context, key, collapsible = true) {
    const reports = knowledge.reportsFor(context);
    if (!reports.length) return "";
    const heading = `判定前に確認する報告 <span>${reports.length}件</span>`;
    return `${collapsible ? `<details class="wiki-reports" data-disclosure="reports-${key}"><summary>${heading}</summary>` : `<aside class="wiki-reports"><h4>${heading}</h4>`}<p class="wiki-report-meta">日本語Wikiの報告 / v${review.version} / ${review.date}照合。必ず発生するものではなく、自動除外には使いません。</p><ul>${reports.map((report) => `<li data-wiki-report="${report.id}"><strong>${escapeHtml(report.title)}</strong><p>${escapeHtml(report.text)}</p><a href="${review.home}${report.page}" target="_blank" rel="noopener">報告の出典</a></li>`).join("")}</ul>${collapsible ? "</details>" : "</aside>"}`;
  }

  function investigationFocus(ghost) {
    return `<section class="wiki-focus" data-wiki-ghost="${ghost.id}"><h3>調査のポイント</h3>${notes(knowledge.focusFor(ghost, engine.getEvidenceCount(state)))}<p class="wiki-pitfall"><strong>見誤りやすい条件</strong>${escapeHtml(knowledge.GHOSTS[ghost.id].caution)}</p>${reportNotes({ ghost: ghost.id }, `ghost-${ghost.id}`)}${wikiLinks([ghost])}</section>`;
  }

  function ghostDetails(ghost, context = "record") {
    const details = knowledge.DETAILS[ghost.id];
    const count = knowledge.DETAIL_SECTIONS.reduce((total, section) => total + details[section.id].length, 0);
    return `<details class="record-section record-conditions" data-ghost-facts="${ghost.id}" data-disclosure="conditions-${context}-${ghost.id}"><summary>詳しい特徴・調査条件 <span>${count}項目</span></summary><div class="ghost-facts-body">${knowledge.DETAIL_SECTIONS.map((section) => `<section class="ghost-fact-group" data-fact-section="${section.id}"><h4>${section.label}</h4><ul class="record-notes">${details[section.id].map((text) => `<li>${escapeHtml(text)}</li>`).join("")}</ul></section>`).join("")}<p class="wiki-report-meta">日本語Wikiの個別記事を要約しています。観測しなかったことだけで除外せず、ミミックの模倣・難易度・同期の影響も照合してください。</p>${wikiLinks([ghost])}</div></details>`;
  }

  function counts() {
    return { candidates: engine.analyze(state).filter((result) => result.ok).length, confirmed: Object.values(state.evidenceStates).filter((value) => value === "confirmed").length, denied: Object.values(state.evidenceStates).filter((value) => value === "denied").length };
  }

  function actions() {
    return `<div class="utility-actions">${iconButton("copy", "copy", "分析結果をコピー")}${iconButton("reset", "rotate-ccw", "すべての条件をリセット")}</div>`;
  }

  function difficulty() {
    return `<label class="difficulty-menu"><span>難易度</span><select aria-label="難易度" data-field="difficulty" data-focus="difficulty">${Object.entries(model.difficultyLabels).map(([id, label]) => `<option value="${id}" ${state.difficulty === id ? "selected" : ""}>${label}</option>`).join("")}</select></label>${state.difficulty === "custom" ? `<label class="custom-field">証拠数<input type="number" min="0" max="3" value="${state.customEvidenceCount}" data-field="customEvidenceCount" data-focus="custom" /></label>` : ""}`;
  }

  function search() {
    return `<label class="name-search">${icon("search")}<input type="search" placeholder="ゴースト名で検索" aria-label="ゴースト名で検索" autocomplete="off" data-field="searchTerm" data-focus="search" value="${escapeHtml(state.searchTerm)}" /></label><label class="excluded-toggle"><input type="checkbox" data-field="showExcluded" data-focus="excluded" ${state.showExcluded ? "checked" : ""} />除外済みも表示</label>`;
  }

  function stateControls(item, full = false) {
    return `<div class="evidence-states ${full ? "full-states" : ""}" role="radiogroup" aria-label="${item.label}">${Object.entries(statuses).map(([id, label]) => `<button type="button" role="radio" data-action="evidence" data-evidence="${item.id}" data-state="${id}" data-focus="${item.id}-${id}" aria-checked="${state.evidenceStates[item.id] === id}" aria-label="${item.label}: ${label}" tabindex="${state.evidenceStates[item.id] === id ? "0" : "-1"}" title="${label}">${icon({ unknown: "circle-dot", confirmed: "check", denied: "x" }[id])}${full ? `<span>${label}</span>` : ""}</button>`).join("")}</div>`;
  }

  function evidenceRows() {
    return `<div class="evidence-rows">${engine.EVIDENCE.map((item) => `<div class="evidence-row ${state.evidenceStates[item.id]}"><div class="evidence-label">${icon(evidenceIcons[item.id])}<strong>${item.label}</strong></div>${stateControls(item)}</div>`).join("")}</div>`;
  }

  function emptyRecord() {
    const searching = state.searchTerm.trim().length > 0;
    return `<div class="empty-note"><h2>${searching ? "検索に一致するゴーストがいません。" : "条件に合うゴーストがいません。"}</h2><button class="empty-action" type="button" data-action="${searching ? "clearSearch" : "reset"}">${searching ? "検索を解除" : "条件をリセット"}</button></div>`;
  }

  function behaviorList() {
    const browser = window.PhasmoBehaviorBrowser.build(state);
    const selectedCount = browser.selected.length;
    const resetDisplay = state.behaviorTerm || state.behaviorMode !== "all" || state.behaviorCategory !== "all" || state.behaviorScope !== "all";
    const impact = (row) => row.mode === "hint" ? "候補数は変わりません" : row.selected ? `解除すると ${row.count}候補` : browser.current === 0 ? "入力条件の見直しが必要" : `観測時 ${browser.current} → ${row.count}候補`;
    const rowHtml = (row) => `<div class="observation ${row.selected ? "is-selected" : ""} ${row.warning ? "has-warning" : ""}" data-observation="${row.id}">
      <label><input type="checkbox" data-behavior="${row.id}" data-focus="behavior-${row.id}" aria-describedby="impact-${row.id}${row.warning ? ` warning-${row.id}` : ""} help-${row.id}" ${row.selected ? "checked" : ""} /><span>${escapeHtml(row.label)}</span></label>
      <div class="observation-meta" id="impact-${row.id}"><span class="behavior-kind ${row.mode === "hint" ? "is-hint" : ""}">${row.mode === "hint" ? "参考・除外なし" : row.mode === "exclude" ? "除外条件" : "絞り込み"}</span><span class="observation-impact">${impact(row)}</span>${row.requiredEvidence ? `<span class="behavior-evidence">${engine.EVIDENCE.find((item) => item.id === row.requiredEvidence).short}も判定に反映</span>` : ""}</div>
      ${row.warning ? `<p class="observation-warning" id="warning-${row.id}">${escapeHtml(row.warning)}</p>` : ""}
      <details data-disclosure="${row.id}"><summary>判定条件</summary><div id="help-${row.id}" class="behavior-conditions">${notes(row.help)}</div>${reportNotes({ behavior: row.id }, `behavior-${row.id}`, false)}${wikiLinks(engine.GHOSTS.filter((ghost) => row.ghosts.includes(ghost.id)))}${row.mode !== "hint" && row.names.length > 0 && row.names.length <= 5 ? `<p class="behavior-preview">${row.selected ? "解除後の候補" : "観測時の候補"}: ${row.names.join(" / ")}</p>` : ""}</details>
    </div>`;
    return `<section class="behavior-browser" aria-label="行動による絞り込み">
      <header class="behavior-overview"><div><h2>行動の観測</h2><p>行動なし <b>${browser.baseline}</b> → 現在 <strong>${browser.current}</strong>候補</p></div><button type="button" class="clear-control" data-action="clearBehaviors" data-focus="clear-behaviors" ${selectedCount ? "" : "disabled"}>${icon("rotate-ccw")}選択をリセット</button></header>
      ${browser.current === 0 ? `<div class="behavior-conflict" role="status"><strong>${browser.baseline ? "選択した条件が両立していません" : "証拠・難易度の設定を見直してください"}</strong><p>${browser.baseline ? "各条件の解除後の候補数を確認し、観測の取り違えがないか照合してください。" : "行動の選択をすべて外しても候補は0種類です。"}</p></div>` : ""}
      ${selectedCount ? `<section class="behavior-selected" aria-label="選択中の行動"><div class="behavior-selected-heading"><h3>選択中 <span>${selectedCount}項目</span></h3><span>絞り込み ${browser.selected.filter((row) => row.mode !== "hint").length} / 参考 ${browser.selected.filter((row) => row.mode === "hint").length}</span></div><ul>${browser.selected.map((row) => `<li><span>${escapeHtml(row.label)}</span><button type="button" class="icon-control" data-action="removeBehavior" data-remove-behavior="${row.id}" data-focus="remove-${row.id}" aria-label="${escapeHtml(row.label)}を解除" title="${escapeHtml(row.label)}を解除">${icon("x")}</button></li>`).join("")}</ul></section>` : ""}
      <div class="behavior-tools">
        <div class="behavior-search-wrap"><label class="behavior-search">${icon("search")}<input type="search" aria-label="行動フィルターを検索" placeholder="行動・装備・ゴースト名" data-field="behaviorTerm" data-focus="behavior-search" value="${escapeHtml(state.behaviorTerm)}" /></label>${state.behaviorTerm ? iconButton("clearBehaviorSearch", "x", "行動の検索を解除") : ""}</div>
        <label class="behavior-select-label"><span>観測カテゴリ</span><select aria-label="観測カテゴリ" data-field="behaviorCategory" data-focus="behavior-category"><option value="all">すべての観測</option>${window.PhasmoBehaviorBrowser.CATEGORIES.map((category) => `<option value="${category.id}" ${state.behaviorCategory === category.id ? "selected" : ""}>${category.label}</option>`).join("")}</select></label>
        <label class="behavior-select-label"><span>判定の種類</span><select aria-label="行動フィルターの種類" data-field="behaviorMode" data-focus="behavior-mode"><option value="all" ${state.behaviorMode === "all" ? "selected" : ""}>すべて</option><option value="decisive" ${state.behaviorMode === "decisive" ? "selected" : ""}>絞り込み</option><option value="hint" ${state.behaviorMode === "hint" ? "selected" : ""}>参考・除外なし</option></select></label>
      </div>
      <div class="behavior-scope" role="group" aria-label="行動の表示対象">${[["all", "すべて"], ["relevant", "候補に関係"], ["selected", "選択中"]].map(([id, label]) => `<button type="button" data-action="behaviorScope" data-scope="${id}" data-focus="behavior-scope-${id}" aria-pressed="${state.behaviorScope === id}">${label}<span>${browser.rows.filter((row) => id === "all" || (id === "selected" ? row.selected : row.relevant)).length}</span></button>`).join("")}</div>
      <div class="behavior-results-heading"><span role="status">表示 ${browser.visible.length} / ${browser.rows.length}項目</span>${resetDisplay ? '<button type="button" class="clear-control" data-action="clearBehaviorDisplay" data-focus="clear-behavior-display">表示条件を解除</button>' : ""}</div>
      <div class="observation-list" tabindex="0" role="region" aria-label="行動の観測一覧">${browser.groups.map((group) => `<section class="behavior-group" aria-labelledby="behavior-group-${group.id}"><h3 id="behavior-group-${group.id}">${group.label}<span>${group.rows.length}</span></h3>${group.rows.map(rowHtml).join("")}</section>`).join("") || `<div class="behavior-empty"><h3>${state.behaviorScope === "selected" && !selectedCount ? "選択中の行動はありません" : "表示条件に合う行動はありません"}</h3>${resetDisplay ? '<button type="button" class="advice-link" data-action="clearBehaviorDisplay" data-focus="empty-behavior-display">すべての行動を表示</button>' : ""}</div>`}</div>
    </section>`;
  }

  function detail(result) {
    if (!result) return emptyRecord();
    const ghost = result.ghost;
    return `<article class="ghost-record" data-ghost-detail="${ghost.id}"><div class="record-heading"><div><p class="record-id">${ghost.english}</p><h2>${ghost.name}</h2></div><span class="record-status ${result.ok ? "" : "out"}">${result.ok ? "候補" : "除外"}</span></div><p class="record-summary">${escapeHtml(ghost.summary)}</p><div class="record-evidence">${[...ghost.evidence, ...(ghost.extraEvidence || [])].map((id) => { const item = engine.EVIDENCE.find((entry) => entry.id === id); const forced = ghost.forced === id && engine.getEvidenceCount(state) > 0; const extra = (ghost.extraEvidence || []).includes(id); return `<div class="record-evidence-item ${state.evidenceStates[id]}">${icon(evidenceIcons[id])}<span>${item.label}${forced ? '<small>強制証拠</small>' : extra ? '<small>追加証拠</small>' : ""}</span></div>`; }).join("")}</div><section class="record-section"><h3>特徴</h3>${notes(ghost.tell)}</section>${investigationFocus(ghost)}${ghostDetails(ghost)}${footView.mini(ghost, concept === "file")}<div class="record-foot"><p>速度はゴースト速度100%・イベント補正なし。正気度は通常ハント開始の目安で、必ず即時に始まる条件ではありません。</p><a href="${escapeHtml(ghost.source)}" target="_blank" rel="noopener">補足資料: Phasmopedia（非公式）</a></div>${result.ok ? `<details class="record-options" data-disclosure="options-${ghost.id}"><summary>観測できる証拠の組み合わせ <span>${result.evidence.options.length}</span></summary><ul>${result.evidence.options.map((option) => `<li><strong>${option.visible.map((id) => engine.EVIDENCE.find((item) => item.id === id).short).join(" + ") || "証拠なし"}</strong><span>隠れる証拠: ${option.hidden.map((id) => engine.EVIDENCE.find((item) => item.id === id).short).join(" / ") || "なし"}</span></li>`).join("")}</ul></details>` : `<p class="exclusion-reason">${result.reason}</p>`}</article>`;
  }

  function matrixView() {
    const tally = counts();
    const results = model.visibleResults(state);
    return `<div class="matrix-app"><header class="matrix-header"><div class="brand"><p>GHOST / EVIDENCE</p><h1>Phasmophobia</h1></div><div class="matrix-total"><strong>${tally.candidates}</strong><span>候補 / 30</span></div><div class="header-settings">${difficulty()}${actions()}</div></header><div class="matrix-toolbar">${search()}<button type="button" class="observation-toggle" data-action="toggleMatrixFilters" data-focus="matrix-observations" aria-expanded="${state.matrixFiltersOpen}">${icon("audio-lines")}行動観測 <b>${state.activeBehaviors.length}</b>${icon(state.matrixFiltersOpen ? "chevron-left" : "chevron-right")}</button><button type="button" class="clear-control" data-action="clearEvidence">証拠をクリア</button></div>${state.matrixFiltersOpen ? `<section class="matrix-observations" aria-label="行動観測">${behaviorList()}</section>` : ""}<div class="matrix-scroll"><table class="evidence-matrix"><thead><tr><th scope="col" class="ghost-column">ゴースト <small>${results.length}件</small></th>${engine.EVIDENCE.map((item) => `<th scope="col" class="${state.evidenceStates[item.id]}"><div class="column-label">${icon(evidenceIcons[item.id])}<span>${item.short}</span></div>${stateControls(item)}</th>`).join("")}</tr></thead><tbody>${results.map((result) => `<tr class="${result.ok ? "" : "row-excluded"}" data-ghost-row="${result.ghost.id}"><th scope="row"><button type="button" class="ghost-row-name" data-action="selectGhost" data-focus="ghost-${result.ghost.id}" data-ghost="${result.ghost.id}" title="${result.ghost.name}の調査記録"><strong>${result.ghost.name}</strong><small>${result.ghost.english}</small></button></th>${engine.EVIDENCE.map((item) => { const has = result.ghost.evidence.includes(item.id); const extra = result.ghost.extraEvidence?.includes(item.id); const forced = result.ghost.forced === item.id && engine.getEvidenceCount(state) > 0; return `<td class="${state.evidenceStates[item.id]} ${has || extra ? "has-evidence" : ""}" aria-label="${result.ghost.name}: ${item.label} ${extra ? "追加証拠" : forced ? "強制証拠" : has ? "証拠あり" : "証拠なし"}">${extra ? '<span class="cell-extra">追加</span>' : forced ? '<span class="cell-forced">強制</span>' : has ? icon("circle-dot") : '<span class="no-evidence">-</span>'}</td>`; }).join("")}</tr>`).join("") || '<tr><td colspan="8" class="empty-note">条件に合うゴーストはありません。</td></tr>'}</tbody></table></div><footer class="matrix-foot"><span>確定 ${tally.confirmed} / 否定 ${tally.denied}</span><span>Nightmare対応 / v${review.version}</span><a href="https://github.com/swag3892/phasmo-ghost-tool/blob/main/GHOST_AUDIT.md" target="_blank" rel="noopener">仕様・出典</a></footer></div>`;
  }

  function evidenceReference() {
    return `<details class="dossier-reference" data-disclosure="all-evidence"><summary>全ゴーストの証拠一覧 <span>${engine.GHOSTS.length}種類</span></summary><div class="reference-scroll" tabindex="0" role="region" aria-label="全ゴーストの証拠一覧"><table class="reference-table"><thead><tr><th scope="col">ゴースト</th><th scope="col">証拠</th><th scope="col">調査のポイント</th></tr></thead><tbody>${engine.GHOSTS.map((ghost) => `<tr><th scope="row">${ghost.name}<small>${ghost.english}</small><small>${ghost.summary}</small></th><td>${[...ghost.evidence, ...(ghost.extraEvidence || [])].map((id) => `${engine.EVIDENCE.find((item) => item.id === id).label}${ghost.forced === id && engine.getEvidenceCount(state) > 0 ? "（強制証拠）" : (ghost.extraEvidence || []).includes(id) ? "（追加証拠）" : ""}`).join(" / ")}</td><td>${notes(ghost.hunt)}</td></tr>`).join("")}</tbody></table></div></details>`;
  }

  function adviceView() {
    const advice = window.PhasmoAdvice.buildAdvice(state);
    const tabLabels = { evidence: "証拠を確認", behaviors: "行動を確認", settings: "設定を確認" };
    const tabLink = (tab, label = tabLabels[tab]) => `<button type="button" class="advice-link" data-action="caseTab" data-tab="${tab}" data-focus="advice-${tab}">${label}${icon("arrow-right")}</button>`;
    const observations = (items) => `<ul class="advice-checks">${items.map((item) => `<li data-advice-behavior="${item.id}"><div class="advice-check-heading"><h4>${escapeHtml(item.label)}</h4><span class="advice-tag ${item.mode === "hint" ? "is-hint" : ""}">${item.mode === "hint" ? "参考・除外なし" : `観測時 ${advice.candidates.length} → ${item.count}種類`}</span></div>${notes(item.help)}<button type="button" class="advice-link" data-action="reviewBehavior" data-behavior="${item.id}" data-focus="review-${item.id}">観測条件を確認${icon("arrow-right")}</button></li>`).join("")}</ul>`;
    const label = (id) => engine.EVIDENCE.find((item) => item.id === id).label;
    return `<section class="investigation-advice" data-advice-stage="${advice.stage}" aria-labelledby="adviceTitle">
      <header class="advice-heading"><p>候補 ${advice.candidates.length}種類 / 通常証拠の設定 ${advice.evidenceCount}種類</p><h2 id="adviceTitle">${escapeHtml(advice.heading)}</h2><p class="advice-summary">${escapeHtml(advice.message)}</p></header>
      <dl class="advice-context"><div><dt>確定した証拠</dt><dd>${advice.confirmed.map(label).join(" / ") || "なし"}</dd></div>${advice.inferred.length ? `<div><dt>行動から反映</dt><dd>${advice.inferred.map(label).join(" / ")}</dd></div>` : ""}</dl>
      <ol class="advice-steps">${advice.steps.map((step) => `<li><h3>${step.title}</h3><p>${step.text}</p>${step.tab ? tabLink(step.tab) : ""}</li>`).join("")}</ol>
      ${advice.evidenceChecks.length ? `<section class="advice-section" aria-labelledby="adviceEvidenceTitle"><h3 id="adviceEvidenceTitle">次に確認する証拠</h3><ul class="advice-checks">${advice.evidenceChecks.map((item) => `<li data-advice-evidence="${item.id}"><div class="advice-check-heading"><h4>${icon(evidenceIcons[item.id])}${item.label}</h4><span class="advice-tag">確認時 ${advice.candidates.length} → ${item.count}種類</span></div><p>${item.method}</p>${item.count <= 4 ? `<p class="advice-meta">残る候補: ${item.names.join(" / ")}</p>` : ""}${item.forcedFor.length ? `<p class="advice-meta">強制証拠: ${item.forcedFor.join(" / ")}</p>` : ""}</li>`).join("")}</ul></section>` : ""}
      ${advice.behaviorChecks.length ? advice.stage === "evidence" ? `<details class="advice-section advice-observations" data-disclosure="advice-behaviors"><summary>ハント外で確認する行動 <span>${advice.behaviorChecks.length}項目</span></summary>${observations(advice.behaviorChecks)}</details>` : `<section class="advice-section" aria-labelledby="adviceBehaviorTitle"><h3 id="adviceBehaviorTitle">ハント外で確認する行動</h3>${observations(advice.behaviorChecks)}</section>` : ""}
      ${advice.huntChecks.length ? `<details class="advice-section advice-hunt" data-disclosure="advice-hunt"><summary>ハント中・接近が必要な観測</summary><p class="advice-caution">確認のためにハントを起こしたり、ゴーストに近づいたりする必要はありません。自然に観測できた場合の比較用です。退避手段とスマッジ・着火具を準備してください。</p>${observations(advice.huntChecks)}</details>` : ""}
      ${advice.candidates.length > 0 && advice.candidates.length <= 6 ? `<section class="advice-section advice-comparison" aria-labelledby="adviceComparisonTitle"><h3 id="adviceComparisonTitle">候補の確認事項</h3>${advice.candidates.map((ghost) => `<details data-disclosure="advice-ghost-${ghost.id}"><summary>${ghost.name}<span>${ghost.english}</span></summary><p class="record-summary">${ghost.summary}</p>${investigationFocus(ghost)}${ghostDetails(ghost, "advice")}</details>`).join("")}</section>` : ""}
      ${advice.notices.length ? `<ul class="advice-notices">${advice.notices.map((notice) => `<li>${escapeHtml(notice)}</li>`).join("")}</ul>` : ""}
      ${advice.candidates.some((ghost) => ["deogen", "mimic"].includes(ghost.id)) ? '<p class="advice-caution">デオヘン、またはデオヘンを模倣するミミックが残る間は、隠れるだけではハントを防げません。逃げ続けられる経路も確認してください。</p>' : ""}
      <a class="advice-source" href="https://github.com/swag3892/phasmo-ghost-tool/blob/main/GHOST_AUDIT.md#調査アドバイス" target="_blank" rel="noopener">判定の根拠と出典</a>
    </section>`;
  }

  function fileView() {
    const results = model.visibleResults(state);
    const selected = model.selectedResult(state);
    const index = Math.max(0, results.findIndex((result) => result.ghost.id === selected?.ghost.id));
    const tally = counts();
    const tabs = [["evidence", "証拠"], ["behaviors", "行動"], ["advice", "アドバイス"], ["settings", "設定"]];
    const panel = state.caseTab === "evidence"
      ? `<div class="case-section-heading"><h2>証拠の確認</h2><button type="button" class="clear-control" data-action="clearEvidence">証拠をリセット</button></div><div class="evidence-legend" aria-hidden="true"><span>未確認</span><span>確定</span><span>否定</span></div>${evidenceRows()}<p class="evidence-caution">見つからない証拠は、隠れている可能性があります。観測に確信がなければ「未確認」のまま比較してください。</p>${reportNotes({ evidence: "ultraviolet" }, "evidence-uv")}<dl class="file-totals"><div><dt>確定</dt><dd>${tally.confirmed}</dd></div><div><dt>否定</dt><dd>${tally.denied}</dd></div></dl><div class="advice-entry"><p>選択した条件から、次に確認すること</p><button type="button" class="advice-link" data-action="caseTab" data-tab="advice" data-focus="open-advice">次の調査へ${icon("arrow-right")}</button></div>`
      : state.caseTab === "behaviors"
        ? behaviorList()
        : state.caseTab === "advice"
          ? adviceView()
        : `<div class="file-settings">${difficulty()}<dl class="data-facts"><div><dt>収録ゴースト</dt><dd>${engine.GHOSTS.length}種類</dd></div><div><dt>行動フィルター</dt><dd>${engine.BEHAVIOR_FILTERS.length}項目</dd></div><div><dt>仕様確認対象</dt><dd>v${review.version}</dd></div><div><dt>日本語Wiki照合日</dt><dd>${review.date}</dd></div></dl><a href="https://github.com/swag3892/phasmo-ghost-tool/blob/main/GHOST_AUDIT.md" target="_blank" rel="noopener">仕様の確認結果と出典</a><div class="wiki-links"><a href="${review.home}" target="_blank" rel="noopener">Phasmophobia 日本語Wiki</a><a href="${review.home}866325" target="_blank" rel="noopener">不具合・報告一覧</a></div><p class="wiki-report-meta">日本語Wikiはコミュニティ資料です。報告と通常の判定条件を分け、公式修正と食い違う情報は除外判定に採用していません。</p></div>`;
    return `<div class="file-app">
      <header class="file-header">
        <div class="brand"><p>ゴースト調査記録</p><h1 id="appTitle">Phasmophobia</h1></div>
        <span class="file-edition">ゴースト分析 / v${review.version}</span>${actions()}
      </header>
      <section class="file-candidates" aria-label="候補ゴースト">
        <div class="file-candidate-heading">
          <h2>候補ゴースト <strong>${tally.candidates}</strong></h2>
          <div class="file-search-tools">${search()}</div>
          <div class="record-pager"><span aria-label="表示中のゴースト: ${results.length ? index + 1 : 0} / ${results.length}">${results.length ? index + 1 : 0} / ${results.length}</span>${iconButton("previousGhost", "chevron-left", "前のゴースト", results.length ? "" : "disabled")}${iconButton("nextGhost", "chevron-right", "次のゴースト", results.length ? "" : "disabled")}</div>
        </div>
        <nav class="candidate-rail" aria-label="ゴーストを選択">${results.map((result) => `<button type="button" data-action="selectGhost" data-focus="ghost-${result.ghost.id}" data-ghost="${result.ghost.id}" aria-pressed="${result.ghost.id === selected?.ghost.id}" class="${result.ok ? "" : "out"}">${result.ghost.name}</button>`).join("") || '<p class="empty-note">表示するゴーストがありません。</p>'}</nav>
      </section>
      <nav class="record-view-tabs" role="tablist" aria-label="表示内容">${[["record", "調査記録", "book-open"], ["compare", "足音比較", "headphones"]].map(([id, label, image]) => `<button type="button" role="tab" id="view-${id}" aria-selected="${state.footView === id}" aria-controls="recordView" tabindex="${state.footView === id ? 0 : -1}" data-action="footView" data-view="${id}" data-focus="view-${id}">${icon(image)}${label}</button>`).join("")}</nav>
      <div id="recordView" role="tabpanel" tabindex="-1" aria-labelledby="view-${state.footView}">${state.footView === "compare" ? footView.render(state) : `<div class="case-spread">
        <section class="case-record" aria-label="選択したゴーストの調査記録"><p class="file-number">調査記録 <span>${String(selected ? index + 1 : 0).padStart(2, "0")}</span></p>${detail(selected)}</section>
        <section class="case-controls" aria-label="調査条件">
          <nav class="case-tabs" role="tablist" aria-label="調査項目">${tabs.map(([id, label]) => `<button id="case-${id}" role="tab" type="button" aria-selected="${state.caseTab === id}" aria-controls="casePanel" data-action="caseTab" data-tab="${id}" data-focus="case-${id}" tabindex="${state.caseTab === id ? 0 : -1}">${label}${id === "behaviors" ? `<b>${state.activeBehaviors.length}</b>` : ""}</button>`).join("")}</nav>
          <div class="case-panel" id="casePanel" role="tabpanel" tabindex="-1" aria-labelledby="case-${state.caseTab}">${panel}</div>
        </section>
      </div>
      `}</div>
      <footer class="file-foot"><span>${model.difficultyLabels[state.difficulty]}${state.difficulty === "custom" ? ` / 証拠${engine.getEvidenceCount(state)}種類` : ""}</span><span>確定 ${tally.confirmed} / 否定 ${tally.denied} / 行動 ${state.activeBehaviors.length}項目</span></footer>
      ${adopted ? evidenceReference() : ""}
    </div>`;
  }

  function flowView() {
    const tally = counts();
    const results = model.visibleResults(state);
    const selected = model.selectedResult(state);
    let stage;
    if (state.step === 0) {
      stage = `<div class="stage-title"><span>01</span><h2>証拠</h2><button type="button" class="clear-control" data-action="clearEvidence">すべてクリア</button></div><div class="instrument-bank">${engine.EVIDENCE.map((item, index) => `<section class="instrument ${state.evidenceStates[item.id]}"><span class="instrument-number">${String(index + 1).padStart(2, "0")}</span>${icon(evidenceIcons[item.id], "instrument-icon")}<h3>${item.label}</h3><span class="instrument-state">${statuses[state.evidenceStates[item.id]]}</span>${stateControls(item, true)}</section>`).join("")}</div>`;
    } else if (state.step === 1) {
      stage = `<div class="stage-title"><span>02</span><h2>行動観測</h2><b>${state.activeBehaviors.length}項目</b></div>${behaviorList()}`;
    } else {
      stage = `<div class="stage-title"><span>03</span><h2>候補ゴースト</h2><div class="flow-search-tools">${search()}</div></div><div class="flow-results"><nav class="result-index" aria-label="候補ゴースト">${results.map((result) => `<button type="button" data-action="selectGhost" data-focus="ghost-${result.ghost.id}" data-ghost="${result.ghost.id}" aria-pressed="${result.ghost.id === selected?.ghost.id}" class="${result.ok ? "" : "out"}"><strong>${result.ghost.name}</strong><span>${result.ghost.english}</span>${icon("chevron-right")}</button>`).join("") || '<p class="empty-note">該当なし</p>'}</nav><section class="flow-record">${detail(selected)}</section></div>`;
    }
    return `<div class="flow-app"><header class="flow-header"><div class="brand"><p>INVESTIGATION / ${String(state.step + 1).padStart(2, "0")}</p><h1>Phasmophobia</h1></div><div class="header-settings">${difficulty()}${actions()}</div></header><nav class="flow-steps" aria-label="調査ステップ">${["証拠", "行動", "候補"].map((label, index) => `<button type="button" data-action="step" data-focus="step-${index}" data-step="${index}" ${state.step === index ? 'aria-current="step"' : ""}><span>${String(index + 1).padStart(2, "0")}</span>${label}</button>`).join("")}</nav><section class="flow-stage" aria-label="${["証拠", "行動観測", "候補ゴースト"][state.step]}">${stage}</section><footer class="flow-dock"><div class="dock-count"><strong>${tally.candidates}</strong><span>候補</span></div><span class="dock-evidence">確定 ${tally.confirmed} / 否定 ${tally.denied}</span><div class="dock-actions"><button type="button" class="previous-step" data-focus="dock-back" data-action="step" data-step="${state.step - 1}" ${state.step === 0 ? "disabled" : ""}>${icon("arrow-left")}戻る</button><button type="button" class="next-step" data-focus="dock-next" data-action="step" data-step="${state.step === 2 ? 0 : state.step + 1}">${state.step === 2 ? "証拠へ戻る" : ["行動へ", "候補へ"][state.step]}${icon("arrow-right")}</button></div></footer></div>`;
  }

  function persist() {
    try { model.writeStorage(window.localStorage, state, storageKey); } catch { /* Storage can be blocked by the browser. */ }
  }

  function render() {
    const focused = document.activeElement;
    const focusKey = focused?.dataset?.focus;
    const focusAction = focused?.dataset?.action;
    const selection = focusKey && ["search", "behavior-search"].includes(focusKey) ? [focused.selectionStart, focused.selectionEnd] : null;
    const disclosures = [...root.querySelectorAll("details[open][data-disclosure]")].map((item) => item.dataset.disclosure);
    const scrollRegions = [".matrix-scroll", ".candidate-rail", ".observation-list", ".result-index", ".foot-table-scroll"];
    const scrollPositions = scrollRegions.map((selector) => {
      const element = root.querySelector(selector);
      return element ? [selector, element.scrollLeft, element.scrollTop] : null;
    }).filter(Boolean);
    const selected = model.selectedResult(state);
    if (selected) state.selectedGhost = selected.ghost.id;
    document.body.dataset.concept = concept;
    document.title = adopted ? "Phasmophobia ゴースト分析 | 調査ファイル" : `Phasmophobia | ${concepts[concept]}`;
    root.setAttribute("aria-labelledby", adopted ? "appTitle" : `${concept}Tab`);
    document.querySelectorAll(".concept-picker button").forEach((button) => {
      const active = button.dataset.concept === concept;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    root.innerHTML = { matrix: matrixView, file: fileView, flow: flowView }[concept]();
    root.querySelectorAll("details[data-disclosure]").forEach((item) => { item.open = disclosures.includes(item.dataset.disclosure); });
    for (const [selector, left, top] of scrollPositions) {
      const element = root.querySelector(selector);
      if (element) { element.scrollLeft = left; element.scrollTop = top; }
    }
    if (focusKey || focusAction) {
      const selector = focusKey ? `[data-focus="${CSS.escape(focusKey)}"]` : `[data-action="${CSS.escape(focusAction)}"]`;
      const nextFocus = root.querySelector(selector);
      nextFocus?.focus({ preventScroll: true });
      if (selection && nextFocus) nextFocus.setSelectionRange(...selection);
    }
    document.getElementById("liveStatus").textContent = `候補 ${counts().candidates}種類`;
    persist();
    updatePlayback(playback);
  }

  function showToast(message) {
    const toast = document.getElementById("conceptToast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  async function copySummary() {
    const candidates = engine.analyze(state).filter((result) => result.ok).map((result) => result.ghost.name);
    const summary = [`Phasmophobia / ${model.difficultyLabels[state.difficulty]}${state.difficulty === "custom" ? ` ${engine.getEvidenceCount(state)}証拠` : ""}`, ...["confirmed", "denied"].map((status) => `${statuses[status]}: ${engine.EVIDENCE.filter((item) => state.evidenceStates[item.id] === status).map((item) => item.label).join(" / ") || "なし"}`), `行動: ${engine.BEHAVIOR_FILTERS.filter((item) => state.activeBehaviors.includes(item.id)).map((item) => item.label).join(" / ") || "なし"}`, `候補 (${candidates.length}): ${candidates.join(" / ") || "なし"}`].join("\n");
    try { await navigator.clipboard.writeText(summary); showToast("分析結果をコピーしました。"); }
    catch { showToast("コピーできませんでした。ブラウザのクリップボード権限を確認してください。"); }
  }

  function openRecord(id) {
    const result = engine.analyze(state).find((item) => item.ghost.id === id);
    dialog.innerHTML = `${iconButton("closeDialog", "x", "調査記録を閉じる")}${detail(result)}`;
    if (!dialog.open) dialog.showModal();
  }

  function handleAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    if (action === "copy") { copySummary(); return; }
    if (action === "closeDialog") { dialog.close(); return; }
    if (action === "playFootsteps") { playFootsteps(button.dataset.lane); return; }
    if (action === "stopFootsteps") { footPlayer?.stop(); return; }
    footPlayer?.stop();
    if (action === "footView") state.footView = button.dataset.view;
    if (action === "footScope") state.footScope = button.dataset.scope;
    if (action === "openFootsteps" || action === "listenGhost") {
      const lane = action === "listenGhost" ? button.dataset.lane : "A";
      state[`foot${lane}`] = button.dataset.ghost;
      state[`footScenario${lane}`] = "";
      state[`footAccelerate${lane}`] = false;
      state.footView = "compare";
    }
    if (action === "reset") state = model.createState();
    if (action === "clearEvidence") state.evidenceStates = model.createState().evidenceStates;
    if (action === "clearBehaviors") state.activeBehaviors = [];
    if (action === "removeBehavior") state.activeBehaviors = state.activeBehaviors.filter((id) => id !== button.dataset.removeBehavior);
    if (action === "behaviorScope") state.behaviorScope = button.dataset.scope;
    if (action === "clearBehaviorSearch") state.behaviorTerm = "";
    if (action === "clearBehaviorDisplay") {
      state.behaviorTerm = "";
      state.behaviorMode = "all";
      state.behaviorCategory = "all";
      state.behaviorScope = "all";
    }
    if (action === "clearSearch") state.searchTerm = "";
    if (action === "toggleMatrixFilters") state.matrixFiltersOpen = !state.matrixFiltersOpen;
    if (action === "caseTab") state.caseTab = button.dataset.tab;
    if (action === "reviewBehavior") {
      const filter = engine.BEHAVIOR_FILTERS.find((item) => item.id === button.dataset.behavior);
      if (!filter) return;
      state.caseTab = "behaviors";
      state.behaviorTerm = filter.label;
      state.behaviorMode = "all";
      state.behaviorCategory = "all";
      state.behaviorScope = "all";
    }
    if (action === "evidence") model.setEvidence(state, button.dataset.evidence, button.dataset.state);
    if (action === "step") {
      const step = Number(button.dataset.step);
      if (![0, 1, 2].includes(step)) return;
      state.step = step;
    }
    if (action === "previousGhost" || action === "nextGhost") state.selectedGhost = model.selectRelative(state, action === "nextGhost" ? 1 : -1);
    if (action === "selectGhost") {
      state.selectedGhost = button.dataset.ghost;
      if (concept === "matrix") { persist(); openRecord(state.selectedGhost); return; }
    }
    render();
    if (["removeBehavior", "clearBehaviors", "clearBehaviorDisplay", "clearBehaviorSearch"].includes(action)) root.querySelector('[data-focus="behavior-search"]')?.focus({ preventScroll: true });
    if (["behaviorScope", "clearBehaviorDisplay", "clearBehaviorSearch", "reviewBehavior"].includes(action)) {
      const list = root.querySelector(".observation-list");
      if (list) list.scrollTop = 0;
    }
    if (action === "listenGhost") playFootsteps(button.dataset.lane);
    if (action === "openFootsteps") root.querySelector("#view-compare")?.focus({ preventScroll: true });
    if (action === "reviewBehavior") {
      const details = root.querySelector(`[data-disclosure="${button.dataset.behavior}"]`);
      if (details) details.open = true;
      root.querySelector(`[data-focus="behavior-${button.dataset.behavior}"]`)?.focus({ preventScroll: true });
    }
    if (action === "caseTab" && !button.dataset.focus?.startsWith("case-")) root.querySelector(`#case-${state.caseTab}`)?.focus({ preventScroll: true });
    if (action === "step" || action === "reset") window.scrollTo({ top: 0, behavior: "auto" });
    if (["previousGhost", "nextGhost", "selectGhost", "reset"].includes(action)) root.querySelector(`.candidate-rail [data-ghost="${state.selectedGhost}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function handleField(event) {
    const element = event.target;
    const field = element.dataset.field;
    if (field === "footVolume") {
      state.footVolume = Math.max(0, Math.min(100, Number(element.value) || 0));
      footPlayer?.setVolume(state.footVolume / 100);
      root.querySelector("#footVolumeValue").textContent = `${state.footVolume}%`;
      persist();
      return;
    }
    footPlayer?.stop();
    if (field?.startsWith("foot")) {
      if (["footMoon", "footAccelerateA", "footAccelerateB"].includes(field)) state[field] = element.checked;
      else if (["footSpeed", "footSeconds", "footVolume"].includes(field)) state[field] = Number(element.value);
      else state[field] = element.value;
      if (["footA", "footB"].includes(field)) {
        const lane = field.at(-1);
        state[`footScenario${lane}`] = "";
        state[`footAccelerate${lane}`] = false;
      }
      if (["footScenarioA", "footScenarioB"].includes(field)) state[`footAccelerate${field.at(-1)}`] = false;
      render();
      return;
    }
    if (element.dataset.behavior) {
      const id = element.dataset.behavior;
      state.activeBehaviors = element.checked ? [...new Set([...state.activeBehaviors, id])] : state.activeBehaviors.filter((item) => item !== id);
    } else if (field === "customEvidenceCount") state.customEvidenceCount = engine.getEvidenceCount({ difficulty: "custom", customEvidenceCount: element.value });
    else if (field === "showExcluded") state.showExcluded = element.checked;
    else if (field) state[field] = element.value;
    else return;
    render();
    if (["behaviorTerm", "behaviorCategory", "behaviorMode"].includes(field)) {
      const list = root.querySelector(".observation-list");
      if (list) list.scrollTop = 0;
    }
  }

  function updatePlayback(status) {
    playback = status;
    const workspace = root?.querySelector(".foot-workspace");
    if (!workspace) return;
    workspace.dataset.playing = String(Boolean(status));
    const stop = workspace.querySelector('[data-action="stopFootsteps"]');
    if (stop) stop.disabled = !status;
    workspace.querySelectorAll("[data-listen-lane]").forEach((lane) => {
      lane.classList.toggle("is-playing", lane.dataset.listenLane === status?.lane);
    });
    const text = workspace.querySelector("#footPlayback");
    if (text) text.textContent = !status ? "停止中" : status.lane === "gap" ? "再生待機中" : `${status.lane} 再生中 / ${status.elapsed.toFixed(1)}秒 / 約${footView.number(status.speed)} m/s`;
  }

  async function playFootsteps(lane) {
    try {
      footPlayer ||= window.PhasmoFootstepAudio.createPlayer({
        createContext() {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!AudioContext) throw new Error("Web Audio unavailable");
          return new AudioContext();
        },
        onStatus: updatePlayback,
      });
      const plans = (lane === "both" ? ["A", "B"] : [lane]).map((key) => {
        const scenario = footsteps.scenario(state[`foot${key}`], state[`footScenario${key}`]);
        return { lane: key, scenario, seconds: state.footSeconds, accelerate: scenario.bonus > 0 && state[`footAccelerate${key}`], scale: footsteps.multiplier(state.footSpeed, state.footMoon) };
      });
      await footPlayer.play(plans, state.footVolume / 100);
    } catch {
      showToast("音声を再生できませんでした。ブラウザの音声設定を確認してください。");
    }
  }

  function init() {
    root = document.getElementById("conceptApp");
    dialog = document.getElementById("ghostDialog");
    try { state = model.readStorage(window.localStorage, storageKey, adopted ? [model.LEGACY_KEY, model.STORAGE_KEY] : []); } catch { state = model.createState(); }
    document.addEventListener("visibilitychange", () => { if (document.hidden) footPlayer?.stop(); });
    window.addEventListener("pagehide", () => footPlayer?.stop());
    root.addEventListener("click", handleAction);
    dialog.addEventListener("click", handleAction);
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    root.addEventListener("change", (event) => { if (event.target.matches('input[type="checkbox"], select')) handleField(event); });
    let composing = false;
    root.addEventListener("compositionstart", () => { composing = true; });
    root.addEventListener("compositionend", (event) => {
      composing = false;
      if (event.target.matches('input[type="search"]')) handleField(event);
    });
    root.addEventListener("input", (event) => {
      if (!composing && !event.isComposing && event.target.matches('input[type="search"], input[type="number"], input[type="range"]')) handleField(event);
    });
    root.addEventListener("keydown", (event) => {
      const radio = event.target.closest('button[role="radio"]');
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const tab = event.target.closest('.case-tabs button, .record-view-tabs button');
      const current = radio || tab;
      const keys = radio ? ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"] : ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (!current || !keys.includes(event.key)) return;
      const peers = [...current.parentElement.querySelectorAll("button")];
      const index = peers.indexOf(current);
      const next = event.key === "Home" ? 0 : event.key === "End" ? peers.length - 1 : (index + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + peers.length) % peers.length;
      event.preventDefault();
      peers[next].click();
      root.querySelector(`[data-focus="${peers[next].dataset.focus}"]`)?.focus();
    });
    const tabs = [...document.querySelectorAll(".concept-picker button")];
    tabs.forEach((button, index) => {
      button.addEventListener("click", () => {
        footPlayer?.stop();
        concept = button.dataset.concept;
        if (dialog.open) dialog.close();
        const url = new URL(location.href);
        url.searchParams.set("concept", concept);
        history.replaceState(null, "", url);
        render();
        window.scrollTo({ top: 0, behavior: "auto" });
      });
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next].click();
        tabs[next].focus();
      });
    });
    render();
  }
  window.addEventListener("DOMContentLoaded", init);
})();
