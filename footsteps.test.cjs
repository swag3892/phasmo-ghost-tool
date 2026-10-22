"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("./app.js");
const stateModel = require("./concept-state.js");
const model = require("./footsteps.js");
const audio = require("./footstep-audio.js");
const view = require("./footstep-view.js");
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.000001, `${actual} != ${expected}`);

test("all 30 ghosts have classified, positive footstep scenarios", () => {
  const classes = {};
  for (const ghost of engine.GHOSTS) {
    const profile = model.profile(ghost.id);
    assert.ok(profile.trait.length > 10, ghost.id);
    classes[profile.los] = (classes[profile.los] || 0) + 1;
    assert.equal(new Set(profile.scenarios.map((item) => item.id)).size, profile.scenarios.length);
    for (const scenario of profile.scenarios) {
      assert.ok(scenario.base > 0 && scenario.bonus >= 0 && scenario.rate >= 0, ghost.id);
      for (const scale of [0.5, 1, 1.725]) {
        const steps = model.steps(scenario, { seconds: 15, scale, accelerate: true });
        assert.equal(steps[0], 0);
        assert.ok(steps.length < 220);
        for (let n = 1; n < steps.length; n += 1) assert.ok(steps[n] > steps[n - 1] && steps[n] < 15);
      }
    }
  }
  assert.deepEqual(classes, { yes: 20, conditional: 4, no: 5, copied: 1 });
  assert.throws(() => model.profile("unknown"), RangeError);
});

test("standard ghosts share cadence, and Aswang reaches its cap earlier", () => {
  const standard = model.scenario("reference");
  near(model.speedAt(standard, 13, true), 2.805);
  near(model.speedAt(standard, 100, true), 2.805);
  near(model.speedAt(standard, 13, false), 1.7);
  near(model.speedAt(standard, -5, true), 1.7);
  assert.equal(Math.round(60 / model.interval(1.7)), 117);
  const aswang = model.scenario("aswang");
  near(model.speedAt(aswang, 9, true), 2.5245);
  for (const id of ["myling", "wraith", "oni", "phantom", "obake", "spirit"]) {
    assert.deepEqual(model.steps(model.scenario(id)), model.steps(standard), id);
  }
  assert.match(model.profile("myling").trait, /12m.*20m/u);
  assert.match(model.profile("wraith").trait, /足音も鳴る/u);
});

test("Twins add standard LOS acceleration rather than scaling their own base", () => {
  near(model.speedAt(model.scenario("twins", "slow"), 13, true), 2.605);
  near(model.speedAt(model.scenario("twins", "fast"), 13, true), 3.005);
});

test("fixed speed traits and conditional overrides never receive gradual LOS", () => {
  for (const id of ["deogen", "revenant", "hantu", "thaye", "deildegast"]) {
    for (const item of model.profile(id).scenarios) near(model.speedAt(item, 15, true), item.base);
  }
  for (const [id, scenario] of [["dayan", "still"], ["dayan", "moving"], ["jinn", "rush"], ["raiju", "equipment"], ["kormos", "sound"]]) {
    const item = model.scenario(id, scenario);
    near(model.speedAt(item, 15, true), item.base);
  }
  near(model.speedAt(model.scenario("kormos", "near"), 13, true), 2.805);
  near(model.speedAt(model.scenario("jinn"), 13, true), 2.805);
  near(model.range("deildegast")[0], 0.4);
  near(model.range("thaye")[0], 1);
  near(model.speedAt(model.scenario("moroi", "sanity-9"), 15, true), 3.7125);
  assert.equal(model.profile("mimic").los, "copied");
});

test("speed settings and Blood Moon affect both cadence and displayed speed", () => {
  near(model.multiplier(150, true), 1.725);
  near(model.multiplier("75"), 0.75);
  near(model.multiplier("invalid"), 1);
  const item = model.scenario("reference");
  near(model.speedAt(item, 13, true, 1.725), 2.805 * 1.725);
  assert.ok(model.steps(item, { scale: 1.725 }).length > model.steps(item).length);
  assert.throws(() => model.steps(item, { seconds: Infinity }), RangeError);
  assert.throws(() => model.steps(item, { scale: 100 }), RangeError);
});

test("comparison rendering follows actual candidates without mutating analysis", () => {
  const state = stateModel.createState();
  state.evidenceStates.emf = "confirmed";
  const original = JSON.stringify(state);
  let html = view.render(state);
  assert.equal([...html.matchAll(/data-foot-ghost=/g)].length, 13);
  assert.match(html, /ゲーム音声ではありません/u);
  assert.equal(JSON.stringify(state), original);
  state.footLos = "no";
  html = view.render(state);
  for (const [, id] of html.matchAll(/data-foot-ghost="([^"]+)"/g)) assert.equal(model.profile(id).los, "no");
  state.footScope = "all";
  state.footLos = "all";
  assert.equal([...view.render(state).matchAll(/data-foot-ghost=/g)].length, 30);
  state.activeBehaviors = ["maleName", "bansheeScream"];
  state.footScope = "candidates";
  assert.match(view.render(state), /比較対象がありません/u);
  assert.equal(engine.analyze(state).filter((item) => item.ok).length, 0);
});

test("old sessions and invalid footstep options restore safe defaults", () => {
  const state = stateModel.sanitizeState({ footView: "compare", footA: "unknown", footB: "thaye", footVolume: 1000, footSpeed: 999, footMoon: "false", footSeconds: 100, footLos: "invalid", footAccelerateA: true });
  assert.equal(state.footView, "compare");
  assert.equal(state.footA, "aswang");
  assert.equal(state.footB, "thaye");
  assert.equal(state.footVolume, 100);
  assert.equal(state.footSpeed, 100);
  assert.equal(state.footSeconds, 15);
  assert.equal(state.footMoon, false);
  assert.equal(state.footLos, "all");
  assert.equal(stateModel.sanitizeState({ difficulty: "zero" }).footView, "record");
});

function fakeContext() {
  const sources = [], gains = [];
  const context = {
    state: "running", currentTime: 10, sampleRate: 44100, destination: {},
    async resume() { this.state = "running"; },
    createBuffer(channels, length) { const data = new Float32Array(length); return { getChannelData() { return data; } }; },
    createGain() { const gain = { gain: { value: 0 }, connect() {}, disconnect() { this.disconnected = true; } }; gains.push(gain); return gain; },
    createBufferSource() { const source = { connect() {}, start(time) { this.time = time; }, stop() { this.stopped = true; }, disconnect() { this.disconnected = true; } }; sources.push(source); return source; },
  };
  return { context, sources, gains };
}
const plan = (lane = "A") => ({ lane, scenario: model.scenario("reference"), seconds: 6, scale: 1, accelerate: false });

test("synthetic footfall is non-silent, finite and below clipping", () => {
  const samples = audio.makeBuffer(fakeContext().context).getChannelData(0);
  assert.ok(samples.some((sample) => Math.abs(sample) > 0.1));
  assert.ok(samples.every((sample) => Number.isFinite(sample) && Math.abs(sample) < 1));
  near(samples[0], 0);
  assert.ok(Math.abs(samples.at(-1)) < 0.002);
});

test("A/B playback is sequential at equal volume and stops all scheduled sounds", async () => {
  const { context, sources, gains } = fakeContext();
  let tick, status, cancelled = 0;
  const player = audio.createPlayer({ createContext: () => context, onStatus: (next) => { status = next; }, every: (callback) => { tick = callback; return 1; }, cancel: () => { cancelled += 1; } });
  await player.play([plan("A"), plan("B")], 0.35);
  assert.equal(gains.length, 1);
  near(gains[0].gain.value, 0.35);
  player.setVolume(0.2);
  near(gains[0].gain.value, 0.2);
  player.setVolume(-1);
  near(gains[0].gain.value, 0);
  player.setVolume(2);
  near(gains[0].gain.value, 1);
  const count = model.steps(plan().scenario, plan()).length;
  assert.equal(sources.length, count * 2);
  near(sources[count].time - sources[0].time, 6.75);
  context.currentTime = 11; tick(); assert.equal(status.lane, "A");
  context.currentTime = 16.4; tick(); assert.equal(status.lane, "gap");
  context.currentTime = 17; tick(); assert.equal(status.lane, "B");
  context.currentTime = 24; tick(); assert.equal(status, null);
  assert.equal(cancelled, 1);
  assert.ok(sources.every((source) => source.stopped && source.disconnected));
  assert.ok(gains[0].disconnected);
});

test("a stop during async audio resume cannot later start playback", async () => {
  const { context, sources } = fakeContext();
  context.state = "suspended";
  let resume;
  context.resume = () => new Promise((resolve) => { resume = () => { context.state = "running"; resolve(); }; });
  const player = audio.createPlayer({ createContext: () => context });
  const pending = player.play([plan()]);
  player.stop(); resume();
  assert.equal(await pending, false);
  assert.equal(sources.length, 0);
});

test("audio failures are reported without leaving scheduled nodes or timers", async () => {
  let status;
  const player = audio.createPlayer({ createContext: () => { throw new Error("blocked"); }, onStatus: (value) => { status = value; } });
  await assert.rejects(player.play([plan()]), /blocked/);
  assert.equal(status, null);
  const { context, sources } = fakeContext();
  let tick;
  const good = audio.createPlayer({ createContext: () => context, every: (fn) => { tick = fn; return 1; }, cancel() {} });
  await good.play([plan()]);
  const old = [...sources];
  await good.play([plan("B")]);
  assert.ok(old.every((source) => source.stopped));
  assert.ok(sources.slice(old.length).every((source) => !source.stopped));
  good.stop(); tick();
});
