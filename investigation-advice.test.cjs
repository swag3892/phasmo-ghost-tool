"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("./app.js");
const model = require("./concept-state.js");
const { buildAdvice } = require("./investigation-advice.js");
const ids = (advice) => advice.candidates.map((ghost) => ghost.id).sort();

function stateWith(evidence = [], difficulty = "nightmare") {
  const state = model.createState();
  state.difficulty = difficulty;
  for (const id of evidence) state.evidenceStates[id] = "confirmed";
  return state;
}

test("advice starts with evidence collection without changing the supplied state", () => {
  const state = stateWith(["emf"]);
  const before = JSON.stringify(state);
  const advice = buildAdvice(state);
  assert.equal(advice.stage, "evidence");
  assert.equal(advice.candidates.length, 13);
  assert.deepEqual(advice.evidenceChecks.map((item) => [item.id, item.count]), [["orb", 2], ["freezing", 4], ["ultraviolet", 4]]);
  assert.equal(JSON.stringify(state), before);
});

test("advice ignores name search, excluded-row visibility and the selected record", () => {
  const state = stateWith(["emf"]);
  const expected = buildAdvice(state);
  state.searchTerm = "存在しない名前";
  state.showExcluded = true;
  state.selectedGhost = "mimic";
  assert.deepEqual(buildAdvice(state), expected);
});

test("nightmare stops recommending an impossible third ordinary evidence", () => {
  const advice = buildAdvice(stateWith(["emf", "writing"]));
  assert.equal(advice.stage, "behavior");
  assert.deepEqual(ids(advice), ["deildegast", "myling", "shade", "spirit"]);
  assert.deepEqual(advice.evidenceChecks, []);
  assert.ok(advice.notices.some((text) => text.includes("隠れている")));
});

test("Mimic extra orbs remain observable after both ordinary evidence slots are filled", () => {
  const advice = buildAdvice(stateWith(["freezing", "spiritBox"]));
  assert.equal(advice.stage, "behavior");
  assert.deepEqual(advice.evidenceChecks.map((item) => [item.id, item.count, item.names]), [["orb", 1, ["ミミック"]]]);
  assert.ok(advice.notices.some((text) => text.includes("追加情報")));
});

test("an orb does not consume Mimic's ordinary evidence budget", () => {
  const advice = buildAdvice(stateWith(["orb", "freezing"]));
  assert.equal(advice.stage, "evidence");
  assert.deepEqual(advice.evidenceChecks.map((item) => [item.id, item.count, item.names]), [["spiritBox", 1, ["ミミック"]], ["ultraviolet", 1, ["ミミック"]]]);
});

test("zero evidence suggests only extra orbs, never evidence-dependent behavior", () => {
  const advice = buildAdvice(stateWith([], "zero"));
  assert.equal(advice.stage, "behavior");
  assert.deepEqual(advice.evidenceChecks.map((item) => item.id), ["orb"]);
  const checks = [...advice.behaviorChecks, ...advice.huntChecks];
  assert.ok(checks.every((item) => !item.requiredEvidence));
  assert.ok(checks.some((item) => item.id === "obakePrint"));
  const one = buildAdvice(stateWith(["orb"], "zero"));
  assert.equal(one.stage, "confirm");
  assert.deepEqual(ids(one), ["mimic"]);
});

test("impossible inputs produce review steps without further test recommendations", () => {
  const state = stateWith();
  state.activeBehaviors = ["maleName", "bansheeScream"];
  const advice = buildAdvice(state);
  assert.equal(advice.stage, "review");
  assert.deepEqual(advice.steps.map((step) => step.tab), ["settings", "evidence", "behaviors"]);
  assert.deepEqual(advice.evidenceChecks, []);
  assert.deepEqual(advice.behaviorChecks, []);
  assert.deepEqual(advice.huntChecks, []);
});

test("custom evidence counts use the same advice as their named difficulty equivalents", () => {
  for (const [count, difficulty] of ["zero", "insanity", "nightmare", "professional"].entries()) {
    const custom = stateWith([], "custom");
    custom.customEvidenceCount = count;
    assert.deepEqual(buildAdvice(custom), buildAdvice(stateWith([], difficulty)));
  }
});

test("evidence implied by an observed ability is not recommended a second time", () => {
  const state = stateWith();
  state.activeBehaviors = ["obakeUv"];
  const advice = buildAdvice(state);
  assert.deepEqual(ids(advice), ["mimic", "obake"]);
  assert.deepEqual(advice.inferred, ["ultraviolet"]);
  assert.ok(advice.evidenceChecks.every((item) => item.id !== "ultraviolet"));
  assert.ok([...advice.behaviorChecks, ...advice.huntChecks].every((item) => item.id !== "obakeUv"));
});

test("hint observations stay non-excluding and risky tests are separated", () => {
  const advice = buildAdvice(stateWith(["emf", "writing"]));
  assert.equal(advice.behaviorChecks.find((item) => item.id === "spiritSmudge").mode, "hint");
  assert.ok(advice.behaviorChecks.every((item) => !item.hunt));
  assert.ok(advice.huntChecks.every((item) => item.hunt));
  assert.equal(advice.huntChecks.find((item) => item.id === "mylingQuiet").count, 4);
});

test("recommendations respect every ghost's visible and hidden evidence combinations", () => {
  for (const difficulty of ["zero", "insanity", "nightmare", "professional"]) {
    for (const ghost of engine.GHOSTS) {
      const state = stateWith([], difficulty);
      const options = engine.evaluateEvidence(ghost, state).options;
      for (const option of options) {
        for (const subset of [[], option.visible.slice(0, 1), option.visible]) {
          const next = stateWith(subset, difficulty);
          for (const id of option.hidden) next.evidenceStates[id] = "denied";
          const before = JSON.stringify(next);
          const advice = buildAdvice(next);
          assert.ok(ids(advice).includes(ghost.id), `${difficulty} ${ghost.id}`);
          assert.equal(JSON.stringify(next), before);
          for (const check of advice.evidenceChecks) {
            assert.equal(next.evidenceStates[check.id], "unknown");
            const observed = { ...next, evidenceStates: { ...next.evidenceStates, [check.id]: "confirmed" } };
            const remaining = engine.analyze(observed).filter((result) => result.ok);
            assert.equal(check.count, remaining.length);
            assert.ok(check.count > 0 && check.count < advice.candidates.length);
            assert.ok(check.method.length > 0);
          }
          for (const check of [...advice.behaviorChecks, ...advice.huntChecks]) {
            assert.ok(!next.activeBehaviors.includes(check.id));
            if (check.requiredEvidence) assert.ok(engine.analyze(next).some((result) => result.ok && result.evidence.options.some((entry) => entry.visible.includes(check.requiredEvidence))));
          }
        }
      }
    }
  }
});
