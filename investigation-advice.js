(function registerAdvice(factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory(require("./app.js"));
  else window.PhasmoAdvice = factory(window.PhasmoTool);
})(function adviceFactory(engine) {
  "use strict";

  const evidenceMethods = {
    dots: "活動地点を照らすように設置し、光の中を通る人影を肉眼とビデオカメラで観察します。通常の実体化イベントとは区別してください。",
    emf: "触れたドアや投げた物の周辺を測り、EMFリーダーのレベル5表示を確認します。ハント・イベント中の機器干渉だけでは判定しません。",
    freezing: "温度計で、Tier Iは0°C未満、Tier II・IIIは1°C未満を確認します。室温が下がるまで時間がかかる場合があります。プレイヤーの白い息だけでは証拠になりません。",
    orb: "ビデオカメラのナイトビジョンで、部屋を複数の角度から観察します。空中を移動する光の粒を確認し、雪や照明の反射と区別してください。",
    spiritBox: "部屋の照明を消し、活動地点の近くで質問します。反応条件が不明なら同じ部屋には1人だけ入り、音声認識またはテキスト入力が機能していることも確認してください。",
    ultraviolet: "ドアやスイッチに触れた直後にUVライトを当て、手形や指紋を確認します。消えるまでの時間や指紋が残る確率にも設定・能力による違いがあります。",
    writing: "本を開いて活動地点に設置し、文字や絵が書かれるか確認します。本を投げられただけでは、書き込みの証拠にはなりません。",
  };
  const huntChecks = new Set(["aswangHide", "dayanMotion", "kormosAudio", "obakePrint", "deogenBreath", "mylingQuiet", "onryoFlame", "obamboPhase", "demonEarly", "oniVisible", "raijuElectronics", "hantuCold"]);
  const easyChecks = ["maleName", "goryoDots", "obakeUv", "polterThrow", "bansheeScream", "phantomPhoto", "wraithSalt", "galluProtect", "spiritSmudge"];
  const survivors = (state) => engine.analyze(state).filter((result) => result.ok);

  function buildAdvice(state) {
    // Search and excluded-row visibility do not change the investigation itself.
    const candidates = survivors(state);
    const evidenceCount = engine.getEvidenceCount(state);
    const confirmed = new Set(engine.EVIDENCE.filter((item) => state.evidenceStates[item.id] === "confirmed").map((item) => item.id));
    const inferred = [...new Set(engine.BEHAVIOR_FILTERS.filter((item) => state.activeBehaviors.includes(item.id) && item.requiredEvidence && !confirmed.has(item.requiredEvidence)).map((item) => item.requiredEvidence))];
    const observed = new Set([...confirmed, ...inferred]);
    const advice = { stage: "review", candidates: candidates.map((result) => result.ghost), evidenceCount, confirmed: [...confirmed], inferred, heading: "入力条件を見直す", message: "現在の条件を同時に満たすゴーストがいません。追加の検証より、観測内容の再確認を優先してください。", steps: [], evidenceChecks: [], behaviorChecks: [], huntChecks: [], notices: [] };
    if (!candidates.length) {
      advice.steps = [
        { title: "難易度と証拠数を確認", text: "実際の契約と、通常証拠の数が一致しているか確認します。", tab: "settings" },
        { title: "証拠の確定・否定を再確認", text: "短時間見つからなかっただけの証拠や、確信のない観測は未確認に戻します。", tab: "evidence" },
        { title: "行動の判定条件を照合", text: "イベントとハント、自然終了と固有能力などを混同していないか確認します。", tab: "behaviors" },
      ];
      return advice;
    }

    const ids = new Set(advice.candidates.map((ghost) => ghost.id));
    const regularEvidenceOpen = candidates.some((result) => result.evidence.options.some((option) => option.main.some((id) => !observed.has(id))));
    advice.evidenceChecks = engine.EVIDENCE.filter((item) => state.evidenceStates[item.id] === "unknown" && !observed.has(item.id)).map((item) => {
      const next = { ...state, evidenceStates: { ...state.evidenceStates, [item.id]: "confirmed" } };
      const remaining = survivors(next).filter((result) => ids.has(result.ghost.id));
      return { id: item.id, label: item.label, count: remaining.length, names: remaining.map((result) => result.ghost.name), method: evidenceMethods[item.id], forcedFor: evidenceCount > 0 ? advice.candidates.filter((ghost) => ghost.forced === item.id).map((ghost) => ghost.name) : [] };
    }).filter((item) => item.count > 0 && item.count < candidates.length).sort((a, b) => a.count - b.count).slice(0, 3);

    const checks = engine.BEHAVIOR_FILTERS.filter((filter) => !state.activeBehaviors.includes(filter.id) && filter.id !== "mimicOrb" && filter.ghosts.some((id) => ids.has(id))).map((filter) => {
      const next = { ...state, activeBehaviors: [...state.activeBehaviors, filter.id] };
      const remaining = survivors(next).filter((result) => ids.has(result.ghost.id));
      const available = !filter.requiredEvidence || candidates.some((result) => result.evidence.options.some((option) => option.visible.includes(filter.requiredEvidence)));
      return { ...filter, count: remaining.length, available, hunt: huntChecks.has(filter.id), order: easyChecks.includes(filter.id) ? easyChecks.indexOf(filter.id) : 99 };
    }).filter((filter) => filter.available && filter.count > 0 && (filter.mode === "hint" || filter.count < candidates.length)).sort((a, b) => Number(a.mode === "hint") - Number(b.mode === "hint") || a.order - b.order || a.count - b.count);
    advice.behaviorChecks = checks.filter((item) => !item.hunt).slice(0, 3);
    advice.huntChecks = checks.filter((item) => item.hunt).slice(0, 3);

    if (evidenceCount === 0) advice.notices.push("通常証拠は出ない設定です。証拠に依存しない行動を確認します。ミミックの追加オーブだけは例外です。");
    else if (evidenceCount < 3) advice.notices.push(`通常証拠は${evidenceCount}種類です。残りは隠れている可能性があるため、短時間見つからないだけでは否定しません。`);
    else advice.notices.push("証拠が出るまでの時間や装備の範囲を考慮し、短時間見つからないだけでは否定しません。");
    if (ids.has("mimic")) advice.notices.push("ミミックが候補に残っています。オーブは通常証拠とは別の追加情報で、オーブが見えるだけではミミックと断定できません。");
    if (inferred.length) advice.notices.push(`行動条件から${inferred.map((id) => engine.EVIDENCE.find((item) => item.id === id).label).join("・")}も観測済みとして判定しています。`);

    if (candidates.length === 1) {
      advice.stage = "confirm";
      advice.heading = `${advice.candidates[0].name}が入力条件に一致`;
      advice.message = "入力条件上の候補は1種類です。観測の取り違えがないか確認してから、ジャーナルのゴーストを選択してください。";
      advice.steps = [
        { title: "観測した証拠を照合", text: "確定・否定が実際の観測と一致しているか、もう一度確認します。", tab: "evidence" },
        { title: "行動の条件と例外を確認", text: "参考情報だけで断定せず、記録にある発動条件・ミミックの模倣・難易度の例外を照合します。", tab: "behaviors" },
        { title: "ジャーナルに記録して退避", text: "必要な調査が終わっていれば、確認のためだけにハントを起こす必要はありません。" },
      ];
      advice.evidenceChecks = [];
      advice.behaviorChecks = [];
      advice.huntChecks = [];
      return advice;
    }

    const evidenceFirst = regularEvidenceOpen && advice.evidenceChecks.length > 0;
    advice.stage = evidenceFirst ? "evidence" : "behavior";
    advice.heading = evidenceFirst ? "追加の証拠を確認する" : "行動の違いを確認する";
    advice.message = evidenceFirst ? "確認できたときに候補が減る証拠から、次の調査を進めます。下の件数は観測できた場合の候補数で、出現確率ではありません。" : regularEvidenceOpen ? "未確認の証拠を追加しても候補が分かれない組み合わせが残っています。証拠確認と並行して、行動の発動条件を比較します。" : "この設定で観測できる通常証拠は、入力内容にそろっています。これ以上の通常証拠を待たず、行動の発動条件を比較します。";
    if (evidenceCount === 0) advice.message = "通常証拠を探し続けず、ハント外で確認できる行動から比較します。ミミックが残る場合は、追加オーブも確認します。";
    advice.steps = [
      { title: "活動地点と退避手段を確認", text: "活動する場所を確認して装備を配置します。長く滞在する前に退路とスマッジ・着火具を準備してください。" },
      evidenceFirst
        ? { title: "候補が分かれる証拠を探す", text: "下の追加証拠を優先します。反応しないときは位置・範囲・観測条件を変え、未確認のまま別の調査も進めます。", tab: "evidence" }
        : { title: ids.has("mimic") && !observed.has("orb") ? "追加オーブと行動を照合" : "ハント外の行動を比較", text: ids.has("mimic") && !observed.has("orb") ? "ミミックの追加オーブを確認し、その後に残った候補の行動を比較します。ほかの通常証拠を無理に探し続ける必要はありません。" : "下の観測条件を満たしたときだけ記録します。固有の行動が起きないこと自体は、除外の根拠にしません。", tab: "behaviors" },
      { title: "観測を記録して候補を再比較", text: "証拠や行動を記録したら、残った候補に合わせて調査を続けます。候補が1種類になったら入力内容を最終確認してください。", tab: "behaviors" },
    ];
    return advice;
  }

  return { buildAdvice };
});
