(function registerConceptState(factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory(require("./app.js"));
  else window.PhasmoConceptState = factory(window.PhasmoTool);
})(function conceptStateFactory(engine) {
  "use strict";
  const STORAGE_KEY = "phasmo-new-concepts-v1";
  const DOSSIER_KEY = "phasmo-dossier-v1";
  const LEGACY_KEY = "phasmo-nightmare-analyst-v1";
  const evidenceIds = new Set(engine.EVIDENCE.map((item) => item.id));
  const behaviorIds = new Set(engine.BEHAVIOR_FILTERS.map((item) => item.id));
  const ghostIds = new Set(engine.GHOSTS.map((item) => item.id));
  const difficultyLabels = { professional: "証拠3種類", nightmare: "ナイトメア（証拠2種類）", insanity: "インサニティ（証拠1種類）", zero: "証拠なし", custom: "カスタム" };

  function createState() {
    return { difficulty: "nightmare", customEvidenceCount: 2, evidenceStates: Object.fromEntries([...evidenceIds].map((id) => [id, "unknown"])), activeBehaviors: [], showExcluded: false, searchTerm: "", selectedGhost: "aswang", step: 0, caseTab: "evidence", behaviorTerm: "", behaviorMode: "all", matrixFiltersOpen: false };
  }

  function sanitizeState(value) {
    const state = createState();
    if (!value || typeof value !== "object" || Array.isArray(value)) return state;
    if (Object.hasOwn(difficultyLabels, value.difficulty)) state.difficulty = value.difficulty;
    state.customEvidenceCount = engine.getEvidenceCount({ difficulty: "custom", customEvidenceCount: value.customEvidenceCount ?? 2 });
    for (const id of evidenceIds) {
      const next = value.evidenceStates?.[id];
      if (["unknown", "confirmed", "denied"].includes(next)) state.evidenceStates[id] = next;
    }
    if (Array.isArray(value.activeBehaviors)) state.activeBehaviors = [...new Set(value.activeBehaviors.filter((id) => behaviorIds.has(id)))];
    state.showExcluded = value.showExcluded === true;
    for (const key of ["searchTerm", "behaviorTerm"]) if (typeof value[key] === "string") state[key] = value[key];
    if (ghostIds.has(value.selectedGhost)) state.selectedGhost = value.selectedGhost;
    if ([0, 1, 2].includes(value.step)) state.step = value.step;
    if (["evidence", "behaviors", "settings"].includes(value.caseTab)) state.caseTab = value.caseTab;
    if (["all", "decisive", "hint"].includes(value.behaviorMode)) state.behaviorMode = value.behaviorMode;
    state.matrixFiltersOpen = value.matrixFiltersOpen === true;
    return state;
  }

  function visibleResults(state) {
    const term = state.searchTerm.trim().toLocaleLowerCase("ja");
    return engine.analyze(state).filter((result) => (state.showExcluded || result.ok) && (!term || [result.ghost.name, result.ghost.english, result.ghost.id].some((text) => text.toLocaleLowerCase("ja").includes(term))));
  }

  function selectedResult(state) {
    const results = visibleResults(state);
    return results.find((result) => result.ghost.id === state.selectedGhost) || results[0];
  }

  function selectRelative(state, offset) {
    const results = visibleResults(state);
    if (!results.length) return state.selectedGhost;
    const current = Math.max(0, results.findIndex((result) => result.ghost.id === state.selectedGhost));
    return results[(current + offset % results.length + results.length) % results.length].ghost.id;
  }

  function setEvidence(state, id, value) {
    if (!evidenceIds.has(id) || !["unknown", "confirmed", "denied"].includes(value)) return false;
    state.evidenceStates[id] = value;
    return true;
  }

  function readStorage(storage, key = STORAGE_KEY, fallbackKeys = []) {
    for (const candidate of [key, ...fallbackKeys]) {
      try {
        const raw = storage.getItem(candidate);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return sanitizeState(parsed);
      } catch { /* Try the next valid saved session without changing its original key. */ }
    }
    return createState();
  }

  function writeStorage(storage, state, key = STORAGE_KEY) {
    try { storage.setItem(key, JSON.stringify(state)); return true; }
    catch { return false; }
  }

  return { STORAGE_KEY, DOSSIER_KEY, LEGACY_KEY, difficultyLabels, createState, sanitizeState, visibleResults, selectedResult, selectRelative, setEvidence, readStorage, writeStorage };
});
