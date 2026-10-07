(() => {
  "use strict";
  const engine = window.PhasmoTool;
  const model = window.PhasmoConceptState;
  const adopted = document.body.dataset.app === "dossier";
  const storageKey = adopted ? model.DOSSIER_KEY : model.STORAGE_KEY;
  const review = { version: "0.19.0.2", date: "2026-10-07" };
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

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const icon = (name, className = "") => `<img class="${className}" src="./assets/${name}.svg" width="20" height="20" alt="" />`;
  const iconButton = (action, name, label, extra = "") => `<button type="button" class="icon-control" data-action="${action}" data-focus="${action}" title="${label}" aria-label="${label}" ${extra}>${icon(name)}</button>`;
  const notes = (text) => `<ul class="record-notes">${model.noteItems(text).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

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
    const filters = engine.BEHAVIOR_FILTERS.filter((item) => (state.behaviorMode === "all" || (state.behaviorMode === "hint" ? item.mode === "hint" : item.mode !== "hint")) && `${item.label} ${item.help}`.toLocaleLowerCase("ja").includes(state.behaviorTerm.trim().toLocaleLowerCase("ja")));
    return `<div class="behavior-tools"><label class="behavior-search">${icon("search")}<input type="search" aria-label="行動フィルターを検索" placeholder="行動を検索" data-field="behaviorTerm" data-focus="behavior-search" value="${escapeHtml(state.behaviorTerm)}" /></label><select aria-label="行動フィルターの種類" data-field="behaviorMode" data-focus="behavior-mode"><option value="all" ${state.behaviorMode === "all" ? "selected" : ""}>すべて</option><option value="decisive" ${state.behaviorMode === "decisive" ? "selected" : ""}>絞り込み</option><option value="hint" ${state.behaviorMode === "hint" ? "selected" : ""}>参考（除外しない）</option></select><button type="button" class="clear-control" data-action="clearBehaviors">行動をリセット</button></div><div class="observation-list">${filters.map((item) => `<div class="observation ${state.activeBehaviors.includes(item.id) ? "is-selected" : ""}"><label><input type="checkbox" data-behavior="${item.id}" data-focus="behavior-${item.id}" aria-describedby="help-${item.id}" ${state.activeBehaviors.includes(item.id) ? "checked" : ""} /><span>${item.mode === "hint" ? '<small class="hint-label">参考</small>' : ""}${item.label}</span></label><details data-disclosure="${item.id}"><summary>判定条件</summary><p id="help-${item.id}">${item.help}</p></details></div>`).join("") || '<p class="empty-note">該当する行動はありません。</p>'}</div>`;
  }

  function detail(result) {
    if (!result) return emptyRecord();
    const ghost = result.ghost;
    return `<article class="ghost-record" data-ghost-detail="${ghost.id}"><div class="record-heading"><div><p class="record-id">${ghost.english}</p><h2>${ghost.name}</h2></div><span class="record-status ${result.ok ? "" : "out"}">${result.ok ? "候補" : "除外"}</span></div><div class="record-evidence">${[...ghost.evidence, ...(ghost.extraEvidence || [])].map((id) => { const item = engine.EVIDENCE.find((entry) => entry.id === id); const forced = ghost.forced === id && engine.getEvidenceCount(state) > 0; const extra = (ghost.extraEvidence || []).includes(id); return `<div class="record-evidence-item ${state.evidenceStates[id]}">${icon(evidenceIcons[id])}<span>${item.label}${forced ? '<small>強制証拠</small>' : extra ? '<small>追加証拠</small>' : ""}</span></div>`; }).join("")}</div><section class="record-section"><h3>特徴</h3>${notes(ghost.tell)}</section><section class="record-section"><h3>調査のポイント</h3>${notes(ghost.hunt)}</section>${result.ok ? `<details class="record-options" data-disclosure="options-${ghost.id}"><summary>観測できる証拠の組み合わせ <span>${result.evidence.options.length}</span></summary><ul>${result.evidence.options.map((option) => `<li><strong>${option.visible.map((id) => engine.EVIDENCE.find((item) => item.id === id).short).join(" + ") || "証拠なし"}</strong><span>隠れる証拠: ${option.hidden.map((id) => engine.EVIDENCE.find((item) => item.id === id).short).join(" / ") || "なし"}</span></li>`).join("")}</ul></details>` : `<p class="exclusion-reason">${result.reason}</p>`}</article>`;
  }

  function matrixView() {
    const tally = counts();
    const results = model.visibleResults(state);
    return `<div class="matrix-app"><header class="matrix-header"><div class="brand"><p>GHOST / EVIDENCE</p><h1>Phasmophobia</h1></div><div class="matrix-total"><strong>${tally.candidates}</strong><span>候補 / 30</span></div><div class="header-settings">${difficulty()}${actions()}</div></header><div class="matrix-toolbar">${search()}<button type="button" class="observation-toggle" data-action="toggleMatrixFilters" data-focus="matrix-observations" aria-expanded="${state.matrixFiltersOpen}">${icon("audio-lines")}行動観測 <b>${state.activeBehaviors.length}</b>${icon(state.matrixFiltersOpen ? "chevron-left" : "chevron-right")}</button><button type="button" class="clear-control" data-action="clearEvidence">証拠をクリア</button></div>${state.matrixFiltersOpen ? `<section class="matrix-observations" aria-label="行動観測">${behaviorList()}</section>` : ""}<div class="matrix-scroll"><table class="evidence-matrix"><thead><tr><th scope="col" class="ghost-column">ゴースト <small>${results.length}件</small></th>${engine.EVIDENCE.map((item) => `<th scope="col" class="${state.evidenceStates[item.id]}"><div class="column-label">${icon(evidenceIcons[item.id])}<span>${item.short}</span></div>${stateControls(item)}</th>`).join("")}</tr></thead><tbody>${results.map((result) => `<tr class="${result.ok ? "" : "row-excluded"}" data-ghost-row="${result.ghost.id}"><th scope="row"><button type="button" class="ghost-row-name" data-action="selectGhost" data-focus="ghost-${result.ghost.id}" data-ghost="${result.ghost.id}" title="${result.ghost.name}の調査記録"><strong>${result.ghost.name}</strong><small>${result.ghost.english}</small></button></th>${engine.EVIDENCE.map((item) => { const has = result.ghost.evidence.includes(item.id); const extra = result.ghost.extraEvidence?.includes(item.id); const forced = result.ghost.forced === item.id && engine.getEvidenceCount(state) > 0; return `<td class="${state.evidenceStates[item.id]} ${has || extra ? "has-evidence" : ""}" aria-label="${result.ghost.name}: ${item.label} ${extra ? "追加証拠" : forced ? "強制証拠" : has ? "証拠あり" : "証拠なし"}">${extra ? '<span class="cell-extra">追加</span>' : forced ? '<span class="cell-forced">強制</span>' : has ? icon("circle-dot") : '<span class="no-evidence">-</span>'}</td>`; }).join("")}</tr>`).join("") || '<tr><td colspan="8" class="empty-note">条件に合うゴーストはありません。</td></tr>'}</tbody></table></div><footer class="matrix-foot"><span>確定 ${tally.confirmed} / 否定 ${tally.denied}</span><span>Nightmare対応 / v0.19.0.2</span><a href="https://github.com/swag3892/phasmo-ghost-tool/blob/main/GHOST_AUDIT.md" target="_blank" rel="noopener">仕様・出典</a></footer></div>`;
  }

  function evidenceReference() {
    return `<details class="dossier-reference" data-disclosure="all-evidence"><summary>全ゴーストの証拠一覧 <span>${engine.GHOSTS.length}種類</span></summary><div class="reference-scroll" tabindex="0" role="region" aria-label="全ゴーストの証拠一覧"><table class="reference-table"><thead><tr><th scope="col">ゴースト</th><th scope="col">証拠</th><th scope="col">調査のポイント</th></tr></thead><tbody>${engine.GHOSTS.map((ghost) => `<tr><th scope="row">${ghost.name}<small>${ghost.english}</small></th><td>${[...ghost.evidence, ...(ghost.extraEvidence || [])].map((id) => `${engine.EVIDENCE.find((item) => item.id === id).label}${ghost.forced === id && engine.getEvidenceCount(state) > 0 ? "（強制証拠）" : (ghost.extraEvidence || []).includes(id) ? "（追加証拠）" : ""}`).join(" / ")}</td><td>${notes(ghost.hunt)}</td></tr>`).join("")}</tbody></table></div></details>`;
  }

  function fileView() {
    const results = model.visibleResults(state);
    const selected = model.selectedResult(state);
    const index = Math.max(0, results.findIndex((result) => result.ghost.id === selected?.ghost.id));
    const tally = counts();
    const tabs = [["evidence", "証拠"], ["behaviors", "行動"], ["settings", "設定"]];
    const panel = state.caseTab === "evidence"
      ? `<div class="case-section-heading"><h2>証拠の確認</h2><button type="button" class="clear-control" data-action="clearEvidence">証拠をリセット</button></div><div class="evidence-legend" aria-hidden="true"><span>未確認</span><span>確定</span><span>否定</span></div>${evidenceRows()}<dl class="file-totals"><div><dt>確定</dt><dd>${tally.confirmed}</dd></div><div><dt>否定</dt><dd>${tally.denied}</dd></div></dl>`
      : state.caseTab === "behaviors"
        ? behaviorList()
        : `<div class="file-settings">${difficulty()}<dl class="data-facts"><div><dt>収録ゴースト</dt><dd>${engine.GHOSTS.length}種類</dd></div><div><dt>行動フィルター</dt><dd>${engine.BEHAVIOR_FILTERS.length}項目</dd></div><div><dt>仕様確認対象</dt><dd>v${review.version}</dd></div><div><dt>全件確認日</dt><dd>${review.date}</dd></div></dl><a href="https://github.com/swag3892/phasmo-ghost-tool/blob/main/GHOST_AUDIT.md" target="_blank" rel="noopener">仕様の確認結果と出典</a></div>`;
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
      <div class="case-spread">
        <section class="case-record" aria-label="選択したゴーストの調査記録"><p class="file-number">調査記録 <span>${String(selected ? index + 1 : 0).padStart(2, "0")}</span></p>${detail(selected)}</section>
        <section class="case-controls" aria-label="調査条件">
          <nav class="case-tabs" role="tablist" aria-label="調査項目">${tabs.map(([id, label]) => `<button id="case-${id}" role="tab" type="button" aria-selected="${state.caseTab === id}" aria-controls="casePanel" data-action="caseTab" data-tab="${id}" data-focus="case-${id}" tabindex="${state.caseTab === id ? 0 : -1}">${label}${id === "behaviors" ? `<b>${state.activeBehaviors.length}</b>` : ""}</button>`).join("")}</nav>
          <div class="case-panel" id="casePanel" role="tabpanel" tabindex="-1" aria-labelledby="case-${state.caseTab}">${panel}</div>
        </section>
      </div>
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
    const scrollRegions = [".matrix-scroll", ".candidate-rail", ".case-panel .observation-list", ".result-index"];
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
    if (action === "reset") state = model.createState();
    if (action === "clearEvidence") state.evidenceStates = model.createState().evidenceStates;
    if (action === "clearBehaviors") state.activeBehaviors = [];
    if (action === "clearSearch") state.searchTerm = "";
    if (action === "toggleMatrixFilters") state.matrixFiltersOpen = !state.matrixFiltersOpen;
    if (action === "caseTab") state.caseTab = button.dataset.tab;
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
    if (action === "step" || action === "reset") window.scrollTo({ top: 0, behavior: "auto" });
    if (["previousGhost", "nextGhost", "selectGhost", "reset"].includes(action)) root.querySelector(`.candidate-rail [data-ghost="${state.selectedGhost}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function handleField(event) {
    const element = event.target;
    const field = element.dataset.field;
    if (element.dataset.behavior) {
      const id = element.dataset.behavior;
      state.activeBehaviors = element.checked ? [...new Set([...state.activeBehaviors, id])] : state.activeBehaviors.filter((item) => item !== id);
    } else if (field === "customEvidenceCount") state.customEvidenceCount = engine.getEvidenceCount({ difficulty: "custom", customEvidenceCount: element.value });
    else if (field === "showExcluded") state.showExcluded = element.checked;
    else if (field) state[field] = element.value;
    else return;
    render();
  }

  function init() {
    root = document.getElementById("conceptApp");
    dialog = document.getElementById("ghostDialog");
    try { state = model.readStorage(window.localStorage, storageKey, adopted ? [model.LEGACY_KEY, model.STORAGE_KEY] : []); } catch { state = model.createState(); }
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
      if (!composing && !event.isComposing && event.target.matches('input[type="search"], input[type="number"]')) handleField(event);
    });
    root.addEventListener("keydown", (event) => {
      const radio = event.target.closest('button[role="radio"]');
      const tab = event.target.closest('.case-tabs button');
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
