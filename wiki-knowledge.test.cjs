"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const engine = require("./app.js");
const model = require("./concept-state.js");
const knowledge = require("./wiki-knowledge.js");
const advice = require("./investigation-advice.js");
const browser = require("./behavior-browser.js");
const ids = (state) => engine.analyze(state).filter((row) => row.ok).map((row) => row.ghost.id).sort();
const exclusions = { breakerOn: "hantu", breakerOff: "jinn", lightOn: "mare", saltStepped: "wraith", incenseBefore180: "spirit" };

test("all thirty ghosts have individual Japanese wiki sources and observation guidance", () => {
  assert.deepEqual(Object.keys(knowledge.GHOSTS).sort(), engine.GHOSTS.map((ghost) => ghost.id).sort());
  assert.equal(new Set(Object.values(knowledge.GHOSTS).map((ghost) => ghost.page)).size, 30);
  for (const ghost of engine.GHOSTS) {
    const item = knowledge.GHOSTS[ghost.id];
    assert.match(knowledge.source(ghost.id), /^https:\/\/gamerch\.com\/phasmophobiajp\/\d+$/);
    assert.ok(item.focus.length > 30 && item.caution.length > 30, ghost.id);
    for (const count of [0, 1, 2, 3]) assert.ok(knowledge.focusFor(ghost, count).length > 20);
  }
  assert.equal(engine.GHOSTS.find((ghost) => ghost.id === "deildegast").name, "ディルデガスト");
});

test("wiki guidance respects zero evidence and the Mimic extra-orb exception", () => {
  for (const ghost of engine.GHOSTS.filter((ghost) => ghost.forced)) {
    assert.doesNotMatch(knowledge.focusFor(ghost, 0), /必ず出る通常証拠/);
    assert.match(knowledge.focusFor(ghost, 2), /必ず出る通常証拠/);
  }
  const mimic = engine.GHOSTS.find((ghost) => ghost.id === "mimic");
  for (const count of [1, 2, 3]) assert.ok(knowledge.focusFor(mimic, count).includes(`通常証拠${count}種類`));
  assert.match(knowledge.focusFor(mimic, 0), /通常証拠0でも追加オーブ/);
});

test("all ghosts have three distinct detailed sections with complete sourced bullet points", () => {
  assert.deepEqual(Object.keys(knowledge.DETAILS).sort(), engine.GHOSTS.map((ghost) => ghost.id).sort());
  assert.deepEqual(knowledge.DETAIL_SECTIONS.map((section) => section.id), ["ability", "hunt", "checks"]);
  assert.equal(Object.values(knowledge.DETAILS).reduce((sum, record) => sum + Object.values(record).reduce((count, items) => count + items.length, 0), 0), 181);
  for (const ghost of engine.GHOSTS) {
    const record = knowledge.DETAILS[ghost.id];
    for (const section of knowledge.DETAIL_SECTIONS) {
      assert.ok(record[section.id].length >= 2, `${ghost.id} ${section.id}`);
      for (const item of record[section.id]) {
        assert.ok(typeof item === "string" && item.length > 30, ghost.id);
        assert.ok(item.endsWith("。"), ghost.id);
        assert.doesNotMatch(item, /<[^>]+>|\n/);
      }
    }
    const items = knowledge.DETAIL_SECTIONS.flatMap((section) => record[section.id]);
    assert.equal(new Set(items).size, items.length, ghost.id);
  }
});

test("detailed profiles retain important timing, state, evidence and mimic caveats", () => {
  const text = (id) => knowledge.DETAIL_SECTIONS.flatMap((section) => knowledge.DETAILS[id][section.id]).join(" ");
  assert.match(text("obake"), /25%.*1\/6/);
  assert.match(text("obake"), /半分/);
  assert.match(text("gallu"), /5秒・激昂4秒・疲弊6秒/);
  assert.match(text("gallu"), /時間経過だけでは/);
  assert.match(text("twins"), /判定は移動前の現在地/);
  assert.match(text("moroi"), /7秒.*90秒/);
  assert.match(text("deogen"), /経路の長さ.*直線距離とは別/);
  assert.match(text("deildegast"), /同じ対象の反復/);
  assert.match(text("mimic"), /ハント中には模倣先を変更しません/);
  assert.match(text("aswang"), /直接ハントを始められるという意味ではありません/);
});

test("rendering detailed knowledge never changes analysis inputs or candidates", () => {
  const state = { ...model.createState(), activeBehaviors: ["saltStepped", "lightOn"] };
  state.evidenceStates.spiritBox = "confirmed";
  const original = JSON.stringify(state);
  const before = ids(state);
  for (const ghost of engine.GHOSTS) {
    knowledge.focusFor(ghost, engine.getEvidenceCount(state));
    knowledge.reportsFor({ ghost: ghost.id });
    for (const section of knowledge.DETAIL_SECTIONS) assert.ok(knowledge.DETAILS[ghost.id][section.id].length);
  }
  assert.equal(JSON.stringify(state), original);
  assert.deepEqual(ids(state), before);
});

test("observed positive actions remove only the intended ghost in every evidence setting", () => {
  for (const difficulty of ["professional", "nightmare", "insanity", "zero"]) {
    const state = { ...model.createState(), difficulty };
    for (const [filter, removed] of Object.entries(exclusions)) {
      const result = ids({ ...state, activeBehaviors: [filter] });
      assert.equal(result.length, 29, filter);
      assert.ok(!result.includes(removed), filter);
      assert.ok(result.includes("mimic"), filter);
      const metadata = engine.BEHAVIOR_FILTERS.find((row) => row.id === filter);
      assert.equal(metadata.mode, "exclude");
      assert.equal(metadata.requiredEvidence, undefined);
      assert.equal(browser.build({ ...state, activeBehaviors: [filter] }).selected[0].count, 30);
    }
    assert.equal(ids({ ...state, activeBehaviors: Object.keys(exclusions) }).length, 25);
  }
});

test("negative filters only narrow existing evidence candidates and preserve input", () => {
  for (const item of engine.EVIDENCE) for (const status of ["confirmed", "denied"]) {
    const state = model.createState();
    state.evidenceStates[item.id] = status;
    const original = JSON.stringify(state);
    const baseline = ids(state);
    for (const [filter, removed] of Object.entries(exclusions)) assert.deepEqual(ids({ ...state, activeBehaviors: [filter] }), baseline.filter((id) => id !== removed));
    assert.equal(JSON.stringify(state), original);
  }
  const state = { ...model.createState(), activeBehaviors: ["wraithSalt", "saltStepped"] };
  assert.deepEqual(ids(state), ["gallu", "mimic"]);
});

test("community reports have valid references and do not enter candidate logic", () => {
  assert.equal(new Set(knowledge.REPORTS.map((report) => report.id)).size, 9);
  for (const report of knowledge.REPORTS) {
    assert.ok(report.ghosts.every((id) => knowledge.GHOSTS[id]));
    assert.ok(report.behaviors.every((id) => engine.BEHAVIOR_FILTERS.some((filter) => filter.id === id)));
    assert.ok(report.evidence.every((id) => engine.EVIDENCE.some((item) => item.id === id)));
    assert.match(report.page, /^\d+$/);
  }
  assert.deepEqual(knowledge.reportsFor({ evidence: "ultraviolet" }).map((row) => row.id), ["uv-surfaces"]);
  assert.ok(knowledge.reportsFor({ behavior: "wraithSalt" }).some((row) => row.id === "salt-sync"));
  assert.deepEqual(knowledge.reportsFor(), []);
  assert.equal(ids({ ...model.createState(), activeBehaviors: knowledge.REPORTS.map((report) => report.id) }).length, 30);
});

test("timed hunt check is not suggested as a non-hunt observation", () => {
  const state = model.createState();
  state.evidenceStates.emf = "confirmed";
  state.evidenceStates.writing = "confirmed";
  const result = advice.buildAdvice(state);
  assert.ok(result.huntChecks.some((row) => row.id === "incenseBefore180"));
  assert.ok(!result.behaviorChecks.some((row) => row.id === "incenseBefore180"));
});

test("new filters and category persist without renaming existing saved observations", () => {
  const state = model.sanitizeState({ activeBehaviors: ["obakePrint", ...Object.keys(exclusions)], behaviorCategory: "power" });
  assert.deepEqual(state.activeBehaviors, ["obakePrint", ...Object.keys(exclusions)]);
  assert.equal(state.behaviorCategory, "power");
  assert.equal(model.visibleResults({ ...model.createState(), searchTerm: "ディルデガスト" })[0].ghost.id, "deildegast");
});

test("both current entry points load wiki knowledge before the renderer", () => {
  for (const name of ["index.html", "concepts.html"]) {
    const html = fs.readFileSync(require.resolve(`./${name}`), "utf8");
    assert.ok(html.indexOf("wiki-knowledge.js?") > html.indexOf("app.js?"));
    assert.ok(html.indexOf("wiki-knowledge.js?") < html.indexOf("concepts.js?"));
    assert.ok(html.includes("20261031-details-1"));
  }
});
