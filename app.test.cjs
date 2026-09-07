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

test("30 unique ghosts with three valid evidence types", () => {
  assert.equal(api.GHOSTS.length, 30);
  assert.equal(new Set(api.GHOSTS.map((g) => g.id)).size, 30);
  for (const g of api.GHOSTS) {
    assert.equal(new Set(g.evidence).size, 3);
    assert.ok(g.evidence.every((id) => api.EVIDENCE.some((e) => e.id === id)));
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
  for (const [behavior, evidence] of [["goryoDots", "dots"], ["deogenBreath", "spiritBox"]]) {
    assert.deepEqual(candidates(state({}, [behavior], "zero")), []);
    assert.deepEqual(candidates(state({ [evidence]: "denied" }, [behavior])), []);
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
