(function registerFootstepAudio(factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory(require("./footsteps.js"));
  else window.PhasmoFootstepAudio = factory(window.PhasmoFootsteps);
})(function audioFactory(model) {
  "use strict";
  function makeBuffer(context) {
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.14), context.sampleRate);
    const data = buffer.getChannelData(0);
    let noise = 2147;
    for (let i = 0; i < data.length; i += 1) {
      const t = i / context.sampleRate;
      noise = (noise * 16807) % 2147483647;
      const attack = Math.min(1, t / 0.003);
      data[i] = attack * (0.48 * Math.sin(2 * Math.PI * 86 * t) * Math.exp(-t * 42) + 0.12 * (noise / 1073741823.5 - 1) * Math.exp(-t * 80));
    }
    return buffer;
  }
  function createPlayer({ createContext, onStatus = () => {}, every = setInterval, cancel = clearInterval } = {}) {
    let context, buffer, output, timer;
    let generation = 0;
    let sources = [];
    let active = [];
    function stop() {
      generation += 1;
      if (timer !== undefined) cancel(timer);
      timer = undefined;
      for (const source of sources) {
        try { source.stop(); } catch { /* A scheduled sound may already have ended. */ }
        source.disconnect();
      }
      sources = [];
      if (output) output.disconnect();
      output = undefined;
      active = [];
      onStatus(null);
    }
    async function play(plans, volume = 0.35) {
      stop();
      const token = generation;
      if (!plans.length || plans.length > 2) throw new RangeError("Invalid listening plan");
      const prepared = plans.map((plan) => ({ ...plan, times: model.steps(plan.scenario, plan) }));
      try {
        context ||= createContext();
        if (context.state !== "running") await context.resume();
        if (generation !== token) return false;
        if (context.state !== "running") throw new Error("Audio context is not running");
        buffer ||= makeBuffer(context);
        output = context.createGain();
        output.gain.value = Math.max(0, Math.min(1, Number(volume) || 0));
        output.connect(context.destination);
        let offset = context.currentTime + 0.05;
        for (const plan of prepared) {
          const start = offset;
          active.push({ ...plan, start, end: start + plan.seconds });
          for (const time of plan.times) {
            const source = context.createBufferSource();
            source.buffer = buffer;
            source.connect(output);
            sources.push(source);
            source.start(start + time);
          }
          offset += plan.seconds + 0.75;
        }
        const update = () => {
          if (token !== generation) return;
          const plan = active.find((item) => context.currentTime >= item.start && context.currentTime < item.end);
          if (context.currentTime > active.at(-1).end + 0.15) { stop(); return; }
          onStatus(plan ? { lane: plan.lane, elapsed: context.currentTime - plan.start, seconds: plan.seconds, speed: model.speedAt(plan.scenario, context.currentTime - plan.start, plan.accelerate, plan.scale) } : { lane: "gap" });
        };
        timer = every(update, 80);
        update();
        return true;
      } catch (error) {
        if (generation === token) stop();
        throw error;
      }
    }
    function setVolume(value) {
      if (output) output.gain.value = Math.max(0, Math.min(1, Number(value) || 0));
    }
    return { play, stop, setVolume };
  }
  return { makeBuffer, createPlayer };
});
