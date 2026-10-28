(function registerBehaviorBrowser(factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory(require("./app.js"));
  else window.PhasmoBehaviorBrowser = factory(window.PhasmoTool);
})(function behaviorBrowserFactory(engine) {
  "use strict";
  const CATEGORIES = [
    { id: "identity", label: "名前・性別", items: ["maleName", "femaleOnly"] },
    { id: "evidence", label: "証拠の特殊反応", items: ["obakeUv", "goryoDots", "deogenBreath", "mimicOrb"] },
    { id: "appearance", label: "姿・物への干渉", items: ["obakePrint", "phantomPhoto", "polterThrow", "oniVisible", "hantuCold"] },
    { id: "sound", label: "音・索敵", items: ["bansheeScream", "mylingQuiet", "kormosAudio"] },
    { id: "speed", label: "速度・活動", items: ["dayanMotion", "obamboPhase", "raijuElectronics"] },
    { id: "protection", label: "塩・防御・ハント", items: ["wraithSalt", "galluProtect", "onryoFlame", "spiritSmudge", "demonEarly", "aswangHide"] },
  ];
  const aliases = {
    obakeUv: "UV 指紋 手形 六本指", goryoDots: "DOTS ドッツ カメラ", deogenBreath: "スピボ Box 呼吸",
    mimicOrb: "オーブ 追加証拠", bansheeScream: "パラマイ 叫び声 サウンドレコーダー",
    spiritSmudge: "線香 インセンス 180秒", demonEarly: "線香 インセンス 90秒",
    raijuElectronics: "電気 機器 スピード", dayanMotion: "スピード 移動 停止", mylingQuiet: "静か 音量",
  };
  const normalize = (text) => String(text).normalize("NFKC").toLocaleLowerCase("ja").replace(/[.]/g, "").replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
  const survivors = (state) => engine.analyze(state).filter((result) => result.ok);
  function build(state) {
    const current = survivors(state);
    const baseline = survivors({ ...state, activeBehaviors: [] }).length;
    const active = new Set(state.activeBehaviors);
    const terms = normalize(state.behaviorTerm || "").trim().split(/\s+/u).filter(Boolean);
    const rows = engine.BEHAVIOR_FILTERS.map((filter) => {
      const selected = active.has(filter.id);
      const next = { ...state, activeBehaviors: selected ? state.activeBehaviors.filter((id) => id !== filter.id) : [...state.activeBehaviors, filter.id] };
      const remaining = survivors(next);
      const category = CATEGORIES.find((group) => group.items.includes(filter.id));
      const names = filter.ghosts.map((id) => engine.GHOSTS.find((ghost) => ghost.id === id)).flatMap((ghost) => [ghost.name, ghost.english]);
      const haystack = normalize([filter.label, filter.help, category.label, aliases[filter.id] || "", ...names].join(" "));
      let warning = "";
      if (filter.requiredEvidence && engine.getEvidenceCount(state) === 0 && filter.requiredEvidence !== "orb") warning = "証拠0では観測できません";
      else if (filter.requiredEvidence && state.evidenceStates[filter.requiredEvidence] === "denied") warning = `${engine.EVIDENCE.find((item) => item.id === filter.requiredEvidence).label}の否定と矛盾します`;
      else if (!selected && current.length > 0 && filter.mode !== "hint" && !remaining.length) warning = "現在の条件とは両立しません";
      const relevant = selected || (filter.mode === "hint" ? current.some((result) => filter.ghosts.includes(result.ghost.id) || result.ghost.id === "mimic") : current.length > 0 && remaining.length > 0 && remaining.length < current.length);
      return { ...filter, selected, category: category.id, count: remaining.length, names: remaining.map((result) => result.ghost.name), warning, relevant, matchesSearch: terms.every((term) => haystack.includes(term)) };
    });
    const visible = rows.filter((row) => row.matchesSearch && (!state.behaviorCategory || state.behaviorCategory === "all" || row.category === state.behaviorCategory) && (state.behaviorMode === "all" || (state.behaviorMode === "hint" ? row.mode === "hint" : row.mode !== "hint")) && (state.behaviorScope === "selected" ? row.selected : state.behaviorScope === "relevant" ? row.relevant : true));
    return { current: current.length, baseline, rows, selected: rows.filter((row) => row.selected), visible, groups: CATEGORIES.map((group) => ({ ...group, rows: visible.filter((row) => row.category === group.id) })).filter((group) => group.rows.length) };
  }
  return { CATEGORIES, normalize, build };
});
