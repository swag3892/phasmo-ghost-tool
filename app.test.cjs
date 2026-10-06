const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const api = require("./app.js");
const ghost = (id) => api.GHOSTS.find((item) => item.id === id);
const state = (evidenceStates = {}, activeBehaviors = [], difficulty = "nightmare") => ({
  difficulty, customEvidenceCount: 2, evidenceStates, activeBehaviors,
});
const candidates = (s) => api.analyze(s).filter((item) => item.ok).map((item) => item.ghost.id).sort();

// Reviewed against the per-ghost references in GHOST_AUDIT.md, not derived from app data.
const reviewedEvidence = {
  aswang: ["dots", "freezing", "writing"],
  banshee: ["dots", "orb", "ultraviolet"],
  dayan: ["emf", "orb", "spiritBox"],
  deildegast: ["dots", "emf", "writing"],
  demon: ["freezing", "ultraviolet", "writing"],
  deogen: ["dots", "spiritBox", "writing"],
  gallu: ["emf", "spiritBox", "ultraviolet"],
  goryo: ["dots", "emf", "ultraviolet"],
  hantu: ["freezing", "orb", "ultraviolet"],
  jinn: ["emf", "freezing", "ultraviolet"],
  kormos: ["orb", "spiritBox", "ultraviolet"],
  mare: ["orb", "spiritBox", "writing"],
  moroi: ["freezing", "spiritBox", "writing"],
  myling: ["emf", "ultraviolet", "writing"],
  obake: ["emf", "orb", "ultraviolet"],
  obambo: ["dots", "ultraviolet", "writing"],
  oni: ["dots", "emf", "freezing"],
  onryo: ["freezing", "orb", "spiritBox"],
  phantom: ["dots", "spiritBox", "ultraviolet"],
  poltergeist: ["spiritBox", "ultraviolet", "writing"],
  raiju: ["dots", "emf", "orb"],
  revenant: ["freezing", "orb", "writing"],
  shade: ["emf", "freezing", "writing"],
  spirit: ["emf", "spiritBox", "writing"],
  thaye: ["dots", "orb", "writing"],
  mimic: ["freezing", "spiritBox", "ultraviolet"],
  twins: ["emf", "freezing", "spiritBox"],
  wraith: ["dots", "emf", "spiritBox"],
  yokai: ["dots", "orb", "spiritBox"],
  yurei: ["dots", "freezing", "orb"],
};

test("30 unique ghosts with three valid evidence types", () => {
  assert.equal(api.GHOSTS.length, 30);
  assert.equal(new Set(api.GHOSTS.map((g) => g.id)).size, 30);
  for (const g of api.GHOSTS) {
    assert.equal(new Set(g.evidence).size, 3);
    assert.ok(g.evidence.every((id) => api.EVIDENCE.some((e) => e.id === id)));
  }
});

test("all 30 evidence sets and five forced evidence types match the reviewed baseline", () => {
  assert.deepEqual(api.GHOSTS.map((g) => g.id).sort(), Object.keys(reviewedEvidence).sort());
  for (const g of api.GHOSTS) {
    assert.deepEqual([...g.evidence].sort(), [...reviewedEvidence[g.id]].sort(), g.id);
  }
  assert.deepEqual(Object.fromEntries(api.GHOSTS.filter((g) => g.forced).map((g) => [g.id, g.forced])), {
    deogen: "spiritBox", goryo: "dots", hantu: "freezing", moroi: "spiritBox", obake: "ultraviolet",
  });
  assert.deepEqual(api.GHOSTS.filter((g) => g.extraEvidence).map((g) => [g.id, g.extraEvidence]), [["mimic", ["orb"]]]);
});

test("every visible evidence combination survives with all hidden evidence denied", () => {
  for (const g of api.GHOSTS) {
    for (const count of [0, 1, 2, 3]) {
      for (const main of api.getVisibleMainOptions(g, count)) {
        const visible = new Set(api.addExtraEvidence(g, main));
        const observations = Object.fromEntries(api.EVIDENCE.map((e) => [e.id, visible.has(e.id) ? "confirmed" : "denied"]));
        const s = { ...state(observations, [], "custom"), customEvidenceCount: count };
        assert.ok(api.evaluateGhost(g, s).ok, `${g.id}: ${count} evidence ${main}`);
      }
    }
  }
});

test("Deildegast full evidence and all nightmare pairs", () => {
  const g = ghost("deildegast");
  assert.deepEqual(candidates(state({ dots: "confirmed", emf: "confirmed", writing: "confirmed" }, [], "professional")), [g.id]);
  for (const hidden of g.evidence) {
    const evidence = Object.fromEntries(g.evidence.map((id) => [id, id === hidden ? "denied" : "confirmed"]));
    assert.ok(api.evaluateGhost(g, state(evidence)).ok);
  }
});

test("forced evidence is mandatory only above zero evidence", () => {
  for (const g of api.GHOSTS.filter((item) => item.forced)) {
    for (const difficulty of ["professional", "nightmare", "insanity"]) {
      assert.equal(api.evaluateGhost(g, state({ [g.forced]: "denied" }, [], difficulty)).ok, false);
    }
    assert.ok(api.evaluateGhost(g, state({ [g.forced]: "denied" }, [], "zero")).ok);
  }
});

test("Mimic extra orb in nightmare and zero evidence", () => {
  assert.deepEqual(candidates(state({ orb: "confirmed", freezing: "confirmed", spiritBox: "confirmed" })), ["mimic"]);
  assert.deepEqual(candidates(state({ orb: "confirmed" }, [], "zero")), ["mimic"]);
  assert.equal(api.evaluateGhost(ghost("mimic"), state({ orb: "denied" }, [], "zero")).ok, false);
});

test("Mimic survives every copyable include filter", () => {
  for (const filter of api.BEHAVIOR_FILTERS.filter((f) => f.mode === "include" && f.mimicCanCopy !== false)) {
    assert.ok(api.evaluateGhost(ghost("mimic"), state({}, [filter.id])).ok, filter.id);
  }
  assert.deepEqual(candidates(state({}, ["bansheeScream", "obakePrint"])), ["mimic"]);
  assert.deepEqual(candidates(state({}, ["goryoDots"])), ["goryo"]);
});

test("observed evidence abilities cannot appear at zero evidence or contradict denied evidence", () => {
  for (const [behavior, evidence] of [["goryoDots", "dots"], ["deogenBreath", "spiritBox"], ["obakeUv", "ultraviolet"]]) {
    assert.deepEqual(candidates(state({}, [behavior], "zero")), []);
    assert.deepEqual(candidates(state({ [evidence]: "denied" }, [behavior])), []);
  }
});

test("Obake shapeshift is distinct from UV evidence, including zero evidence", () => {
  assert.deepEqual(candidates(state({}, ["obakePrint"], "zero")), ["mimic", "obake"]);
  assert.deepEqual(candidates(state({ ultraviolet: "denied" }, ["obakePrint"], "zero")), ["mimic", "obake"]);
  assert.deepEqual(candidates(state({ ultraviolet: "denied" }, ["obakePrint"])), ["mimic"]);
  assert.deepEqual(candidates(state({}, ["obakeUv"])), ["mimic", "obake"]);
});

test("male Mimic cannot copy Banshee or Dayan; order does not affect contradictions", () => {
  for (const behavior of ["bansheeScream", "dayanMotion"]) {
    assert.ok(candidates(state({}, [behavior])).includes("mimic"));
    assert.deepEqual(candidates(state({}, ["maleName", behavior])), []);
    assert.deepEqual(candidates(state({}, [behavior, "maleName"])), []);
  }
  assert.deepEqual(candidates(state({}, ["maleName", "polterThrow"])), ["mimic", "poltergeist"]);
});

test("Hantu breath is a non-evidence ability and must not imply freezing", () => {
  assert.deepEqual(candidates(state({ freezing: "denied" }, ["hantuCold"], "zero")), ["hantu", "mimic"]);
  assert.deepEqual(candidates(state({ freezing: "denied" }, ["hantuCold"])), ["mimic"]);
});

test("extra-orb observation requires orb, while plain orb does not identify Mimic in nightmare", () => {
  assert.ok(candidates(state({ orb: "confirmed" })).length > 1);
  assert.deepEqual(candidates(state({}, ["mimicOrb"])), ["mimic"]);
  assert.deepEqual(candidates(state({}, ["mimicOrb"], "zero")), ["mimic"]);
  assert.deepEqual(candidates(state({ orb: "denied" }, ["mimicOrb"])), []);
});

test("ambiguous movement and electronics observations cannot discard other ghosts", () => {
  assert.equal(candidates(state({}, ["kormosAudio", "raijuElectronics"])).length, 30);
  assert.ok(candidates(state({}, ["kormosAudio"])).includes("banshee"));
  assert.ok(candidates(state({}, ["raijuElectronics"])).includes("hantu"));
});

test("audit covers all ghosts and filters with no duplicate or dangling filter references", () => {
  const audit = fs.readFileSync(require.resolve("./GHOST_AUDIT.md"), "utf8");
  assert.equal(api.BEHAVIOR_FILTERS.length, 23);
  assert.equal(new Set(api.BEHAVIOR_FILTERS.map((f) => f.id)).size, 23);
  for (const g of api.GHOSTS) assert.ok(audit.includes(`| \`${g.id}\` |`), g.id);
  for (const f of api.BEHAVIOR_FILTERS) {
    assert.ok(audit.includes(`| \`${f.id}\` |`), f.id);
    assert.ok(f.ghosts.every((id) => ghost(id)), f.id);
    assert.ok(["include", "exclude", "hint"].includes(f.mode), f.id);
    if (f.requiredEvidence) assert.ok(api.EVIDENCE.some((e) => e.id === f.requiredEvidence), f.id);
  }
});

test("salt does not uniquely identify Wraith", () => {
  assert.deepEqual(candidates(state({}, ["wraithSalt"])), ["gallu", "mimic", "wraith"]);
});

test("weak hints never exclude candidates; male names still exclude female-only ghosts", () => {
  for (const filter of api.BEHAVIOR_FILTERS.filter((f) => f.mode === "hint")) {
    assert.equal(candidates(state({}, [filter.id])).length, 30, filter.id);
  }
  const ids = candidates(state({}, ["maleName"]));
  assert.equal(ids.length, 28);
  assert.ok(!ids.includes("banshee") && !ids.includes("dayan"));
});

test("startup and interactions tolerate blocked, broken, or full storage", () => {
  for (const mode of ["blocked", "malformed", "invalid", "full"]) {
    const nodes = new Map();
    const element = () => ({
      children: [], dataset: {}, classList: { add() {}, remove() {} },
      replaceChildren() { this.children = []; }, append(child) { this.children.push(child); },
      setAttribute() {}, addEventListener(type, fn) { this[type] = fn; },
      querySelector() { return element(); },
    });
    const document = {
      getElementById(id) { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); },
      querySelectorAll() { return []; }, createElement: element,
    };
    const context = { module: { exports: {} }, document };
    Object.defineProperty(context, "localStorage", { get() {
      if (mode === "blocked") throw new Error("SecurityError");
      return {
        getItem() { return mode === "malformed" ? "{" : mode === "invalid" ? '{"difficulty":"bogus"}' : null; },
        setItem() { throw new Error("QuotaExceededError"); },
      };
    } });
    vm.runInNewContext(fs.readFileSync(require.resolve("./app.js"), "utf8"), context);
    context.module.exports.init();
    assert.equal(nodes.get("candidateCount").textContent, "30");
    assert.equal(nodes.get("difficultyLabel").textContent, "Nightmare");
    nodes.get("evidenceGrid").children[0].click();
    assert.equal(nodes.get("confirmedCount").textContent, "1");
  }
});
