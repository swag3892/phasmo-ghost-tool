(function registerFootsteps(factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory(require("./app.js"));
  else window.PhasmoFootsteps = factory(window.PhasmoTool);
})(function footstepsFactory(engine) {
  "use strict";
  const REVIEW_DATE = "2026-10-22";
  const LOS_LABELS = { yes: "あり", no: "なし", conditional: "条件付き", copied: "模倣次第" };
  const standard = (id = "normal", label = "通常", base = 1.7, rate = 0.05, bonus = base * 0.65) => ({ id, label, base, bonus, rate: base * rate });
  const fixed = (id, label, base) => ({ id, label, base, bonus: 0, rate: 0 });
  const shared = "標準のリズム。足音の間隔だけでは、ほかの標準速度のゴーストと区別できません。";
  const profiles = {
    aswang: { los: "yes", trait: "出だしは標準より遅め。継続視認では約8.7秒で上限に達し、加速が速い。", scenarios: [standard("normal", "通常", 1.53, 0.075)] },
    dayan: { los: "conditional", trait: "10m以内の最寄りのプレイヤーが静止すると遅く、動くと速い。近距離では固定速度が優先。", scenarios: [standard("far", "10m以内にプレイヤーなし"), fixed("still", "10m以内・最寄りの人が静止", 1.2), fixed("moving", "10m以内・最寄りの人が移動", 2.25)] },
    deildegast: { los: "no", trait: "動かした異なる小物が増えるほど遅くなる。同じ小物を繰り返し動かしても数は増えない。", scenarios: Array.from({ length: 27 }, (_, n) => fixed(`objects-${n}`, `動かした異なる小物 ${n}個`, Math.max(0.4, 3 - n * 0.1))) },
    deogen: { los: "no", trait: "遠距離では速く、接近すると極端に遅くなる。視認時間ではなく、標的までの経路距離で変化。", scenarios: [fixed("far", "経路距離6m以上", 3), fixed("close", "経路距離2.5m以内", 0.4)], note: "中間距離の連続的な減速は再現していません。隠れても位置を把握されます。" },
    gallu: { los: "yes", trait: "弱体・通常・激昂で基礎速度が変わる。どの状態でも継続視認で加速する。", scenarios: [standard(), standard("weak", "弱体", 1.36), standard("enraged", "激昂", 1.955)] },
    hantu: { los: "no", trait: "現在いる場所の温度が低いほど速い。部屋を移動したときの速度差に注目。", scenarios: [["warm", "15℃超", 1.4], ["12", "12～15℃", 1.75], ["9", "9～12℃", 2.1], ["6", "6～9℃", 2.3], ["3", "3～6℃", 2.4], ["0", "0～3℃", 2.5], ["freezing", "0℃未満", 2.7]].map(([id, label, base]) => fixed(id, label, base)) },
    jinn: { los: "conditional", trait: "通常は視認加速あり。ブレーカーがオンで、3m超から視認すると2.5m/sの固定速度が優先。", scenarios: [standard(), fixed("rush", "電源オン・3m超から視認", 2.5)], note: "特殊条件を外れると、蓄積した視認加速が速度に反映される場合があります。" },
    kormos: { los: "conditional", trait: "5m以内で、遮蔽物のない所を動く人を捉えると通常同様に加速。視認せず音を追う間は速度が1.3倍。", scenarios: [fixed("wander", "未発見・徘徊", 1.7), standard("near", "5m以内・動く人を捉える"), fixed("sound", "視認せず音を追跡・加速蓄積なし", 2.21)], note: "近距離での加速が残ったまま音を追うと、さらに速くなる場合があります。この複合状態は試聴に含みません。" },
    moroi: { los: "yes", trait: "チーム平均正気度が低いほど基礎速度が上がる。さらに視認加速が加わる。", scenarios: [1.5, 1.583, 1.666, 1.749, 1.832, 1.915, 1.998, 2.081, 2.164, 2.25].map((speed, n) => standard(`sanity-${n}`, n === 0 ? "平均正気度45%以上" : n === 9 ? "平均正気度0～5%" : `平均正気度${45 - n * 5}～${50 - n * 5}%`, speed)) },
    obambo: { los: "yes", trait: "穏やかな状態では遅く、攻撃的な状態では速い。ハント中に状態が切り替わることもある。", scenarios: [standard("calm", "穏やか", 1.445), standard("aggressive", "攻撃的", 1.955)] },
    raiju: { los: "conditional", trait: "有効な電子機器の近くでは2.5m/sの固定速度。機器から離れると通常の視認加速が反映される。", scenarios: [standard("far", "有効な電子機器から離れている"), fixed("equipment", "有効な電子機器の近く", 2.5)] },
    revenant: { los: "no", trait: "未発見時は遅く、視認・声・電子機器などで発見すると急に速くなる。徐々に上がる視認加速とは別。", scenarios: [fixed("hidden", "プレイヤー未発見", 1), fixed("detected", "発見地点まで追跡中", 3)], note: "発見地点へ到着後に減速する過程は再現していません。" },
    thaye: { los: "no", trait: "若いほど速く、近くで過ごして老化が進むほど遅くなる。ハントごとの基礎速度を比較。", scenarios: Array.from({ length: 11 }, (_, n) => fixed(`age-${n}`, `老化 ${n}段階${n === 0 ? "（最も若い）" : n === 10 ? "（最も老化）" : ""}`, 2.75 - n * 0.175)) },
    twins: { los: "yes", trait: "ハントごとに遅い速度か速い速度を選ぶ。両方とも視認加速があり、1回のハント中に交代するわけではない。", scenarios: [standard("slow", "遅いハント", 1.5, 0, 1.105), standard("fast", "速いハント", 1.9, 0, 1.105)].map((item) => ({ ...item, rate: 0.085 })) },
    mimic: { los: "copied", trait: "模倣先の速度・視認加速を再現するため、固有のリズムでは判別できない。模倣はハントの途中では切り替わらない。", scenarios: [standard("blank", "模倣前の標準状態（例）")], note: "この試聴は模倣前の一例です。模倣中の音は、模倣先のゴーストを選んで比較してください。" },
  };
  const traits = {
    myling: "リズムは標準。ハント音の可聴距離は約12m（通常約20m）。同じ階で機器の干渉と聞こえ方を比べる。",
    wraith: "リズムは標準で、足音も鳴る。塩を踏まない能力と、ハント中の足音の有無を混同しない。",
    phantom: "リズムは標準。姿が見えない時間が長いことと、足音の間隔は別の特徴。",
    oni: "リズムは標準。姿が見える時間が長いことと、足音の間隔は別の特徴。",
    obake: "リズムは標準。ハント中のモデル変化は見た目の特徴で、速度差による判別ではない。",
  };
  const ids = new Set(engine.GHOSTS.map((ghost) => ghost.id));
  function profile(id) {
    if (id !== "reference" && !ids.has(id)) throw new RangeError("Unknown ghost");
    return profiles[id] || { los: "yes", trait: traits[id] || shared, scenarios: [standard()] };
  }
  function scenario(id, choice) {
    const items = profile(id).scenarios;
    return items.find((item) => item.id === choice) || items[0];
  }
  function multiplier(speed = 100, bloodMoon = false) {
    return ([50, 75, 100, 125, 150].includes(Number(speed)) ? Number(speed) / 100 : 1) * (bloodMoon ? 1.15 : 1);
  }
  function speedAt(item, elapsed = 0, accelerate = false, scale = 1) {
    return (item.base + (accelerate ? Math.min(item.bonus, Math.max(0, elapsed) * item.rate) : 0)) * scale;
  }
  // Empirical community calibration: cadence only, not game audio or a physics engine.
  function interval(speed) { return 1 / speed - 0.075; }
  function steps(item, { seconds = 15, accelerate = false, scale = 1 } = {}) {
    if (![6, 15].includes(seconds) || !Number.isFinite(scale) || scale < 0.5 || scale > 1.725001) throw new RangeError("Invalid playback conditions");
    const times = [];
    for (let time = 0; time < seconds; time += interval(speedAt(item, time, accelerate, scale))) times.push(time);
    return times;
  }
  function range(id, scale = 1) {
    const items = profile(id).scenarios;
    return [Math.min(...items.map((item) => item.base)) * scale, Math.max(...items.map((item) => item.base)) * scale];
  }
  return { REVIEW_DATE, LOS_LABELS, profile, scenario, multiplier, speedAt, interval, steps, range };
});
