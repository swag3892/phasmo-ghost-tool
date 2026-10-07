"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("./app.js");
const model = require("./concept-state.js");
const fs = require("node:fs");
const vm = require("node:vm");

function createPreview(concept, saved, options = {}) {
  const listeners = new Map();
  const nodes = new Map();
  const storage = new Map(options.entries || (saved ? [[model.STORAGE_KEY, JSON.stringify(saved)]] : []));
  const element = () => ({
    dataset: {}, attributes: {}, innerHTML: "", textContent: "", open: false,
    classList: { add() {}, remove() {} },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(type, fn) { this[type] = fn; },
    querySelectorAll() { return []; }, querySelector() { return null; },
    showModal() { this.open = true; }, close() { this.open = false; },
  });
  const document = {
    body: element(), activeElement: null,
    getElementById(id) { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); },
    querySelectorAll() { return []; },
  };
  if (options.adopted) document.body.dataset.app = "dossier";
  const window = {
    PhasmoTool: engine, PhasmoConceptState: model,
    addEventListener(type, fn) { listeners.set(type, fn); },
    removeEventListener(type, fn) { assert.equal(fn, engine.init); },
    localStorage: { getItem(key) { return storage.get(key) ?? null; }, setItem(key, value) { storage.set(key, value); } },
    scrollTo() {},
  };
  vm.runInNewContext(fs.readFileSync(require.resolve("./concepts.js"), "utf8"), {
    window, document, URLSearchParams, location: { search: `?concept=${concept}` },
  });
  listeners.get("DOMContentLoaded")();
  const root = nodes.get("conceptApp");
  return {
    root, document, nodes, storage,
    action(action, values = {}) {
      const button = { dataset: { action, ...values }, disabled: false };
      root.click({ target: { closest() { return button; } } });
    },
    change(field, value) {
      root.change({ target: { dataset: { field }, value, checked: value, matches() { return true; } } });
    },
    behavior(id, checked) {
      root.change({ target: { dataset: { behavior: id }, checked, matches() { return true; } } });
    },
    state() { return JSON.parse(storage.get(options.adopted ? model.DOSSIER_KEY : model.STORAGE_KEY)); },
  };
}

test("new concepts share the audited analysis engine and start in nightmare", () => {
  const state = model.createState();
  assert.equal(engine.getEvidenceCount(state), 2);
  assert.equal(model.visibleResults(state).length, 30);
  assert.equal(Object.keys(state.evidenceStates).length, 7);
  assert.equal(model.selectedResult(state).ghost.id, "aswang");
});

test("direct three-state evidence controls preserve nightmare hidden evidence", () => {
  const state = model.createState();
  assert.equal(model.setEvidence(state, "emf", "confirmed"), true);
  assert.equal(model.visibleResults(state).length, 13);
  assert.equal(model.setEvidence(state, "emf", "denied"), true);
  assert.ok(model.visibleResults(state).some((result) => result.ghost.id === "deildegast"));
  assert.equal(model.setEvidence(state, "missing", "confirmed"), false);
  assert.equal(model.setEvidence(state, "emf", "invalid"), false);
});

test("search, excluded rows and empty selections work consistently", () => {
  const state = model.createState();
  state.searchTerm = "mimic";
  assert.equal(model.visibleResults(state).length, 1);
  assert.equal(model.selectedResult(state).ghost.id, "mimic");
  state.searchTerm = "存在しないゴースト";
  assert.equal(model.selectedResult(state), undefined);
  assert.equal(model.selectRelative(state, 1), state.selectedGhost);
  state.searchTerm = "";
  state.activeBehaviors = ["maleName"];
  assert.equal(model.visibleResults(state).length, 28);
  state.showExcluded = true;
  assert.equal(model.visibleResults(state).length, 30);
});

test("dossier navigation wraps in both directions within filtered results", () => {
  const state = model.createState();
  const results = model.visibleResults(state);
  assert.equal(model.selectRelative(state, -1), results.at(-1).ghost.id);
  state.selectedGhost = results.at(-1).ghost.id;
  assert.equal(model.selectRelative(state, 1), "aswang");
});

test("stored state rejects unknown IDs and restores valid UI state", () => {
  const state = model.sanitizeState({ difficulty: "custom", customEvidenceCount: 8, activeBehaviors: ["maleName", "maleName", "missing"], evidenceStates: { emf: "confirmed", dots: "invalid" }, selectedGhost: "mimic", step: 2, caseTab: "behaviors", behaviorMode: "hint", showExcluded: true, searchTerm: "鬼" });
  assert.equal(state.customEvidenceCount, 3);
  assert.deepEqual(state.activeBehaviors, ["maleName"]);
  assert.equal(state.evidenceStates.dots, "unknown");
  assert.equal(state.selectedGhost, "mimic");
  assert.equal(state.step, 2);
  assert.equal(state.caseTab, "behaviors");
  assert.equal(state.behaviorMode, "hint");
  assert.equal(state.showExcluded, true);
  assert.deepEqual(model.sanitizeState([]), model.createState());
  assert.equal(model.sanitizeState({ difficulty: "toString", selectedGhost: "missing", step: 99 }).difficulty, "nightmare");
});

test("blocked or malformed browser storage never prevents a fresh session", () => {
  assert.deepEqual(model.readStorage({ getItem() { throw new Error("blocked"); } }), model.createState());
  assert.deepEqual(model.readStorage({ getItem() { return "invalid json"; } }), model.createState());
  assert.equal(model.writeStorage({ setItem() { throw new Error("quota"); } }, model.createState()), false);
  let saved;
  assert.equal(model.writeStorage({ setItem(key, value) { saved = value; } }, model.createState()), true);
  assert.deepEqual(model.readStorage({ getItem() { return saved; } }), model.createState());
});

test("female-only Mimic contradictions and zero-evidence abilities remain intact", () => {
  const state = model.createState();
  state.activeBehaviors = ["maleName", "bansheeScream"];
  assert.equal(model.visibleResults(state).length, 0);
  state.difficulty = "zero";
  state.activeBehaviors = ["obakePrint"];
  assert.deepEqual(model.visibleResults(state).map((result) => result.ghost.id).sort(), ["mimic", "obake"]);
});

test("all three renderers start independently and evidence actions update the shared model", () => {
  for (const concept of ["matrix", "file", "flow"]) {
    const preview = createPreview(concept);
    assert.equal(preview.document.body.dataset.concept, concept);
    assert.equal(preview.root.attributes["aria-labelledby"], `${concept}Tab`);
    assert.match(preview.root.innerHTML, /Phasmophobia/);
    preview.action("evidence", { evidence: "emf", state: "confirmed" });
    assert.equal(preview.state().evidenceStates.emf, "confirmed");
    assert.equal(preview.nodes.get("liveStatus").textContent, "候補 13種類");
    preview.action("clearEvidence");
    assert.equal(preview.nodes.get("liveStatus").textContent, "候補 30種類");
    assert.deepEqual([...preview.storage.keys()], [model.STORAGE_KEY]);
  }
});

test("matrix dialogs render the audited record for all 30 ghosts", () => {
  const preview = createPreview("matrix");
  for (const ghost of engine.GHOSTS) {
    preview.action("selectGhost", { ghost: ghost.id });
    const dialog = preview.nodes.get("ghostDialog");
    assert.equal(dialog.open, true);
    const sections = [...dialog.innerHTML.matchAll(/<section class="record-section"><h3>[^<]+<\/h3><ul class="record-notes">(.*?)<\/ul><\/section>/g)];
    assert.equal(sections.length, 2, ghost.id);
    for (const [index, text] of [ghost.tell, ghost.hunt].entries()) {
      assert.deepEqual([...sections[index][1].matchAll(/<li>(.*?)<\/li>/g)].map((match) => match[1]), model.noteItems(text), ghost.id);
    }
    assert.match(dialog.innerHTML, /証拠の組み合わせ/);
  }
  preview.action("closeDialog");
  assert.equal(preview.nodes.get("ghostDialog").open, false);
});

test("bullet items preserve all 60 audited descriptions without dropping text", () => {
  for (const ghost of engine.GHOSTS) {
    for (const text of [ghost.tell, ghost.hunt]) {
      const items = model.noteItems(text);
      assert.ok(items.length > 0, ghost.id);
      assert.ok(items.every((item) => item.trim().length > 0), ghost.id);
      assert.equal(items.join(""), text, ghost.id);
      assert.ok(items.every((item) => item.endsWith("。")), ghost.id);
    }
  }
});

test("bullet boundaries keep D.O.T.S. and decimal speeds in their original sentences", () => {
  assert.deepEqual(model.noteItems("D.O.T.S.で確認する。速度は1.53m/s、近距離では0.4m/s。"), ["D.O.T.S.で確認する。", "速度は1.53m/s、近距離では0.4m/s。"]);
  assert.deepEqual(model.noteItems("句点のない文章"), ["句点のない文章"]);
  assert.deepEqual(model.noteItems(""), []);
});

test("adopted reference table uses the same bullet items for all 30 ghosts", () => {
  const preview = createPreview("file", null, { adopted: true });
  const table = preview.root.innerHTML.match(/<table class="reference-table">(.*?)<\/table>/)[1];
  const lists = [...table.matchAll(/<ul class="record-notes">(.*?)<\/ul>/g)];
  assert.equal(lists.length, engine.GHOSTS.length);
  for (const [index, ghost] of engine.GHOSTS.entries()) {
    assert.deepEqual([...lists[index][1].matchAll(/<li>(.*?)<\/li>/g)].map((match) => match[1]), model.noteItems(ghost.hunt), ghost.id);
  }
});

test("dossier tabs, candidate navigation and empty filtered state render correctly", () => {
  const preview = createPreview("file");
  preview.action("nextGhost");
  assert.equal(preview.state().selectedGhost, model.visibleResults(model.createState())[1].ghost.id);
  preview.action("caseTab", { tab: "behaviors" });
  assert.match(preview.root.innerHTML, /data-behavior="maleName"/);
  preview.behavior("maleName", true);
  assert.equal(preview.nodes.get("liveStatus").textContent, "候補 28種類");
  preview.action("caseTab", { tab: "settings" });
  preview.change("difficulty", "custom");
  assert.match(preview.root.innerHTML, /data-field="customEvidenceCount"/);
  preview.change("customEvidenceCount", 3);
  assert.equal(preview.state().customEvidenceCount, 3);
  preview.change("searchTerm", "存在しない名前");
  assert.match(preview.root.innerHTML, /調査記録 <span>00/);
  assert.match(preview.root.innerHTML, /検索に一致するゴーストがいません/);
  preview.action("clearSearch");
  assert.equal(preview.state().searchTerm, "");
});

test("flow stages retain observations and resolve contradictory conditions", () => {
  const preview = createPreview("flow");
  preview.action("step", { step: "1" });
  assert.match(preview.root.innerHTML, /行動観測/);
  preview.behavior("maleName", true);
  preview.behavior("bansheeScream", true);
  preview.action("step", { step: "2" });
  assert.equal(preview.nodes.get("liveStatus").textContent, "候補 0種類");
  assert.match(preview.root.innerHTML, /条件に合うゴーストがいません/);
  preview.action("step", { step: "0" });
  assert.equal(preview.state().activeBehaviors.length, 2);
  preview.action("reset");
  assert.equal(preview.state().activeBehaviors.length, 0);
  assert.equal(preview.nodes.get("liveStatus").textContent, "候補 30種類");
});

test("adopted dossier migrates legacy conditions without overwriting either earlier session", () => {
  const legacy = model.createState();
  legacy.evidenceStates.emf = "confirmed";
  legacy.activeBehaviors = ["maleName"];
  const draft = model.createState();
  draft.difficulty = "zero";
  const entries = [[model.LEGACY_KEY, JSON.stringify(legacy)], [model.STORAGE_KEY, JSON.stringify(draft)]];
  const preview = createPreview("flow", null, { adopted: true, entries });
  assert.equal(preview.document.body.dataset.concept, "file");
  assert.equal(preview.root.attributes["aria-labelledby"], "appTitle");
  assert.equal(preview.state().evidenceStates.emf, "confirmed");
  assert.equal(preview.state().difficulty, "nightmare");
  preview.action("reset");
  for (const [key, value] of entries) assert.equal(preview.storage.get(key), value);
  assert.equal([...preview.root.innerHTML.matchAll(/<th scope="row">/g)].length, 30);
  assert.doesNotMatch(preview.root.innerHTML, /GHOST FILE|FIELD RECORDS|Nightmare|クリア/);
});

test("adopted state takes priority and malformed fallback sessions are skipped", () => {
  const adopted = model.createState();
  adopted.selectedGhost = "mimic";
  const storage = new Map([[model.DOSSIER_KEY, JSON.stringify(adopted)], [model.LEGACY_KEY, "broken"]]);
  const reader = { getItem(key) { return storage.get(key); } };
  assert.equal(model.readStorage(reader, model.DOSSIER_KEY, [model.LEGACY_KEY]).selectedGhost, "mimic");
  storage.set(model.DOSSIER_KEY, "[]");
  storage.set(model.STORAGE_KEY, JSON.stringify(adopted));
  assert.equal(model.readStorage(reader, model.DOSSIER_KEY, [model.LEGACY_KEY, model.STORAGE_KEY]).selectedGhost, "mimic");
  assert.deepEqual(model.readStorage({ getItem() { throw new Error("blocked"); } }, model.DOSSIER_KEY, [model.LEGACY_KEY]), model.createState());
});

test("Japanese search composition is applied only after confirmation", () => {
  const preview = createPreview("file", null, { adopted: true });
  const target = { dataset: { field: "searchTerm" }, value: "ミミ", matches() { return true; } };
  preview.root.compositionstart();
  preview.root.input({ target, isComposing: true });
  assert.equal(preview.state().searchTerm, "");
  preview.root.compositionend({ target });
  assert.equal(preview.state().searchTerm, "ミミ");
  assert.match(preview.root.innerHTML, /data-ghost-detail="mimic"/);
});

test("saved search input is HTML escaped and every rendered local icon exists", () => {
  const state = model.createState();
  state.searchTerm = '\"><script>alert(1)</script>';
  for (const concept of ["matrix", "file", "flow"]) {
    const preview = createPreview(concept, state);
    if (concept === "flow") preview.action("step", { step: "2" });
    assert.ok(!preview.root.innerHTML.includes("<script>alert(1)</script>"));
    assert.ok(preview.root.innerHTML.includes("&lt;script&gt;"));
    preview.action("reset");
    for (const match of preview.root.innerHTML.matchAll(/src="\.\/assets\/([^"]+)"/g)) {
      assert.ok(fs.existsSync(require("node:path").join(__dirname, "assets", match[1])), match[1]);
    }
  }
});
