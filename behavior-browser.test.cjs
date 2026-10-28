"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("./app.js");
const stateModel = require("./concept-state.js");
const browser = require("./behavior-browser.js");
const count = (state) => engine.analyze(state).filter((result) => result.ok).length;

test("all audited behavior filters belong to exactly one category", () => {
  const ids = browser.CATEGORIES.flatMap((category) => category.items);
  assert.equal(new Set(ids).size, 23);
  assert.deepEqual(ids.sort(), engine.BEHAVIOR_FILTERS.map((filter) => filter.id).sort());
  assert.equal(browser.build(stateModel.createState()).visible.length, 23);
});

test("search handles full-width input, kana, ghost names, aliases and AND terms", () => {
  const state = stateModel.createState();
  const find = (term) => browser.build({ ...state, behaviorTerm: term }).visible.map((row) => row.id);
  for (const term of ["ｕｖ", "ＵＶ", "六本指", "化け狐 指紋"]) assert.ok(find(term).includes("obakeUv"), term);
  for (const term of ["ばんしー", "ﾊﾞﾝｼｰ", "BANSHEE", "パラマイ"]) assert.ok(find(term).includes("bansheeScream"), term);
  assert.ok(find("DOTS カメラ").includes("goryoDots"));
  assert.ok(find("線香 180秒").includes("spiritSmudge"));
  assert.deepEqual(find("UV 絶対に該当しない"), []);
});

test("display filters combine without changing the underlying investigation", () => {
  const state = { ...stateModel.createState(), behaviorScope: "selected", activeBehaviors: ["maleName", "mylingQuiet"], behaviorMode: "hint", behaviorCategory: "sound" };
  const before = JSON.stringify(state);
  const result = browser.build(state);
  assert.deepEqual(result.visible.map((row) => row.id), ["mylingQuiet"]);
  assert.equal(result.selected.length, 2);
  assert.equal(result.current, 28);
  assert.equal(result.baseline, 30);
  assert.equal(JSON.stringify(state), before);
  assert.equal(browser.build({ ...state, behaviorTerm: "存在しない" }).selected.length, 2);
});

test("each preview matches the actual add/remove operation across evidence settings", () => {
  for (const difficulty of ["professional", "nightmare", "insanity", "zero"]) {
    for (const activeBehaviors of [[], ["maleName"], ["obakeUv"], ["mylingQuiet"], ["maleName", "bansheeScream"]]) {
      for (const evidence of ["unknown", "confirmed", "denied"]) {
        const state = stateModel.createState();
        state.difficulty = difficulty;
        state.activeBehaviors = activeBehaviors;
        state.evidenceStates.ultraviolet = evidence;
        const before = JSON.stringify(state);
        const result = browser.build(state);
        assert.equal(result.current, count(state));
        for (const row of result.rows) {
          const next = { ...state, activeBehaviors: row.selected ? activeBehaviors.filter((id) => id !== row.id) : [...activeBehaviors, row.id] };
          assert.equal(row.count, count(next), `${difficulty} ${row.id}`);
          if (row.mode === "hint") assert.equal(row.count, result.current);
        }
        assert.equal(JSON.stringify(state), before);
      }
    }
  }
});

test("zero evidence and denied evidence warnings preserve the extra-orb exception", () => {
  const state = { ...stateModel.createState(), difficulty: "zero" };
  const rows = browser.build(state).rows;
  for (const id of ["goryoDots", "obakeUv", "deogenBreath"]) {
    assert.equal(rows.find((row) => row.id === id).count, 0);
    assert.match(rows.find((row) => row.id === id).warning, /証拠0/);
  }
  assert.equal(rows.find((row) => row.id === "mimicOrb").count, 1);
  assert.equal(rows.find((row) => row.id === "mimicOrb").warning, "");
  state.evidenceStates.orb = "denied";
  assert.match(browser.build(state).rows.find((row) => row.id === "mimicOrb").warning, /否定と矛盾/);
});

test("Mimic exceptions and recovery counts are calculated by the audited engine", () => {
  const state = stateModel.createState();
  let rows = browser.build(state).rows;
  assert.equal(rows.find((row) => row.id === "bansheeScream").count, 2);
  assert.equal(rows.find((row) => row.id === "goryoDots").count, 1);
  state.activeBehaviors = ["maleName"];
  rows = browser.build(state).rows;
  assert.equal(rows.find((row) => row.id === "bansheeScream").count, 0);
  assert.match(rows.find((row) => row.id === "bansheeScream").warning, /両立/);
  state.activeBehaviors.push("bansheeScream");
  const result = browser.build(state);
  assert.equal(result.current, 0);
  assert.equal(result.selected.find((row) => row.id === "maleName").count, 2);
  assert.equal(result.selected.find((row) => row.id === "bansheeScream").count, 28);
});

test("relevant mode retains selected conditions and excludes ineffective decisive checks", () => {
  const state = { ...stateModel.createState(), difficulty: "zero", behaviorScope: "relevant" };
  const result = browser.build(state);
  assert.ok(!result.visible.some((row) => row.id === "goryoDots"));
  assert.ok(result.visible.some((row) => row.id === "mimicOrb"));
  state.activeBehaviors = ["goryoDots"];
  assert.deepEqual(browser.build(state).visible.map((row) => row.id), ["goryoDots"]);
});

test("name search and excluded display do not contaminate impact counts", () => {
  const state = stateModel.createState();
  state.evidenceStates.emf = "confirmed";
  const result = browser.build(state);
  const searched = browser.build({ ...state, searchTerm: "mimic", selectedGhost: "mimic", showExcluded: true });
  assert.deepEqual(searched, result);
});

test("new display preferences persist and malformed values fall back safely", () => {
  const state = stateModel.sanitizeState({ behaviorCategory: "sound", behaviorScope: "relevant" });
  assert.equal(state.behaviorCategory, "sound");
  assert.equal(state.behaviorScope, "relevant");
  assert.equal(stateModel.sanitizeState({ behaviorScope: "bad" }).behaviorScope, "all");
  assert.equal(stateModel.sanitizeState({ behaviorCategory: "bad" }).behaviorCategory, "all");
});
