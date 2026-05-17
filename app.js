(function buildPhasmoTool(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  if (typeof window !== "undefined") {
    window.PhasmoTool = api;
    window.addEventListener("DOMContentLoaded", api.init);
  }
})(this, function phasmoFactory() {
  const EVIDENCE = [
    { id: "dots", label: "D.O.T.S.", short: "DOTS" },
    { id: "emf", label: "EMF レベル5", short: "EMF 5" },
    { id: "freezing", label: "氷点下", short: "氷点下" },
    { id: "orb", label: "ゴーストオーブ", short: "オーブ" },
    { id: "spiritBox", label: "スピリットボックス", short: "Box" },
    { id: "ultraviolet", label: "紫外線", short: "UV" },
    { id: "writing", label: "ゴーストライティング", short: "筆記" },
  ];

  const GHOSTS = [
    {
      id: "aswang",
      name: "アスワング",
      english: "Aswang",
      evidence: ["dots", "freezing", "writing"],
      tell: "正しく使える公式隠れ場所にいるプレイヤーへ到達すると、殺さずにハントが終了します。",
      hunt: "基礎速度は遅めですが、視認加速が強いので直線で見られ続けると危険です。",
    },
    {
      id: "banshee",
      name: "バンシー",
      english: "Banshee",
      evidence: ["dots", "orb", "ultraviolet"],
      tell: "ターゲットを1人に絞り、パラボラマイクで固有の絶叫を出すことがあります。",
      hunt: "ターゲットの正気度で狩りを開始。名前は女性のみ。",
    },
    {
      id: "dayan",
      name: "ダヤン",
      english: "Dayan",
      evidence: ["emf", "orb", "spiritBox"],
      tell: "近くのプレイヤーが歩くと速く、止まると遅くなります。",
      hunt: "10m以内の動きで閾値と速度が変化します。名前とモデルは女性のみです。",
    },
    {
      id: "demon",
      name: "デーモン",
      english: "Demon",
      evidence: ["writing", "ultraviolet", "freezing"],
      tell: "早期ハント、十字架の広い防御範囲、スマッジ後の短いハント封じが特徴です。",
      hunt: "通常70%、能力でさらに早いハントがあります。",
    },
    {
      id: "deogen",
      name: "デオヘン",
      english: "Deogen",
      evidence: ["dots", "writing", "spiritBox"],
      forced: "spiritBox",
      tell: "必ず位置を把握して追跡し、近距離では極端に遅くなります。Spirit Boxの固有呼吸あり。",
      hunt: "隠れ切れません。近づけて逃げる判断が有効です。",
    },
    {
      id: "gallu",
      name: "ガルル",
      english: "Gallu",
      evidence: ["emf", "ultraviolet", "spiritBox"],
      tell: "十字架やスマッジなどの防御行動で激昂し、ハント後は弱体化します。",
      hunt: "激昂中は閾値と速度が上がり、防御範囲やスマッジ時間も変化します。",
    },
    {
      id: "goryo",
      name: "御霊",
      english: "Goryo",
      evidence: ["dots", "emf", "ultraviolet"],
      forced: "dots",
      tell: "D.O.T.S.はカメラ越し限定で、部屋移動がかなり少ないゴーストです。",
      hunt: "ナイトメアでもD.O.T.S.は隠れません。",
    },
    {
      id: "hantu",
      name: "ハントゥ",
      english: "Hantu",
      evidence: ["orb", "ultraviolet", "freezing"],
      forced: "freezing",
      tell: "低温で速く、高温で遅い。ハント中に白い息が見えることがあります。",
      hunt: "ブレーカーを入れられず、氷点下は隠れません。",
    },
    {
      id: "jinn",
      name: "ジン",
      english: "Jinn",
      evidence: ["emf", "ultraviolet", "freezing"],
      tell: "ブレーカーがオンだと遠距離で加速し、能力で近くのプレイヤーの正気度を削ります。",
      hunt: "ブレーカーを落とすと個性が弱まります。",
    },
    {
      id: "kormos",
      name: "コルモス",
      english: "Kormos",
      evidence: ["orb", "spiritBox", "ultraviolet"],
      tell: "視線で追跡できず、足音に反応して追う珍しいゴーストです。",
      hunt: "視認追跡はせず、声、電子機器、移動音で検知します。接近判定は障害物越しでも危険です。",
    },
    {
      id: "mare",
      name: "メアー",
      english: "Mare",
      evidence: ["writing", "orb", "spiritBox"],
      tell: "明るい部屋を嫌い、電気を消す行動が多めです。",
      hunt: "暗所60%、明所40%目安でハント閾値が変わります。",
    },
    {
      id: "moroi",
      name: "モーロイ",
      english: "Moroi",
      evidence: ["writing", "freezing", "spiritBox"],
      forced: "spiritBox",
      tell: "呪いで正気度を削り、平均正気度が低いほど速くなります。",
      hunt: "スピリットボックスは隠れません。スマッジ後の目眩まし時間が長めです。",
    },
    {
      id: "myling",
      name: "マイリング",
      english: "Myling",
      evidence: ["writing", "emf", "ultraviolet"],
      tell: "ハント中の足音が非常に近距離まで聞こえにくい。パラボラ音も多めです。",
      hunt: "懐中電灯点滅距離と足音の聞こえ方を比べると見抜きやすいです。",
    },
    {
      id: "obake",
      name: "化け狐",
      english: "Obake",
      evidence: ["emf", "orb", "ultraviolet"],
      forced: "ultraviolet",
      tell: "6本指などの特殊指紋、指紋消失、ハント中の一瞬のモデル変化が特徴です。",
      hunt: "紫外線は隠れません。",
    },
    {
      id: "obambo",
      name: "オバンボ",
      english: "Obambo",
      evidence: ["writing", "ultraviolet", "dots"],
      tell: "平静と攻撃の状態を切り替え、活動量、ハント閾値、速度がはっきり変わります。",
      hunt: "攻撃状態で始まるハントは速く、持続時間が短めです。状態切替で速度が急変することもあります。",
    },
    {
      id: "oni",
      name: "鬼",
      english: "Oni",
      evidence: ["dots", "emf", "freezing"],
      tell: "実体イベントが多く、ハント中に見える時間が長めです。霧状イベントを起こしません。",
      hunt: "姿が見えやすい一方、正気度削りは強めです。",
    },
    {
      id: "onryo",
      name: "怨霊",
      english: "Onryo",
      evidence: ["orb", "freezing", "spiritBox"],
      tell: "炎が消えることがハント条件にも防御にも関わります。",
      hunt: "炎3回消灯後のハント、または炎が十字架のように守る挙動を見ます。",
    },
    {
      id: "phantom",
      name: "ファントム",
      english: "Phantom",
      evidence: ["dots", "ultraviolet", "spiritBox"],
      tell: "写真を撮ると姿が消え、ハント中の点滅間隔が長いです。",
      hunt: "長く見ると正気度が削られやすいです。",
    },
    {
      id: "poltergeist",
      name: "ポルターガイスト",
      english: "Poltergeist",
      evidence: ["writing", "ultraviolet", "spiritBox"],
      tell: "複数の物を同時に投げ、物が多い部屋ほど正気度削りと活動が目立ちます。",
      hunt: "投げ物の量と同時投げが鍵です。",
    },
    {
      id: "raiju",
      name: "雷獣",
      english: "Raiju",
      evidence: ["dots", "emf", "orb"],
      tell: "電子機器の近くで速くなり、遠くから機器を乱します。",
      hunt: "機器を置いたルートで速度差を見ます。",
    },
    {
      id: "revenant",
      name: "レヴナント",
      english: "Revenant",
      evidence: ["writing", "orb", "freezing"],
      tell: "標的を見つけると非常に速く、見失うとかなり遅くなります。",
      hunt: "足音速度の落差が大きいです。",
    },
    {
      id: "shade",
      name: "シェード",
      english: "Shade",
      evidence: ["writing", "emf", "freezing"],
      tell: "人が近いと活動やハントが弱く、低正気度まで大人しいことがあります。",
      hunt: "単独調査と複数人調査の活動差を見ます。",
    },
    {
      id: "spirit",
      name: "スピリット",
      english: "Spirit",
      evidence: ["writing", "emf", "spiritBox"],
      tell: "スマッジ後、ハント封じが約3分続きます。",
      hunt: "他の個性が薄い時ほどスマッジタイマーが強力です。",
    },
    {
      id: "thaye",
      name: "セーイ",
      english: "Thaye",
      evidence: ["dots", "writing", "orb"],
      tell: "若い時は高速かつ活発で、プレイヤーが近くにいる時間で老化して弱くなります。",
      hunt: "序盤の速度と後半の減速を比べます。",
    },
    {
      id: "mimic",
      name: "ミミック",
      english: "The Mimic",
      evidence: ["ultraviolet", "freezing", "spiritBox"],
      extraEvidence: ["orb"],
      tell: "別ゴーストの個性を真似し、証拠数とは別にゴーストオーブが追加で出ます。",
      hunt: "ナイトメアでもオーブを含めて3つ見えることがあります。",
    },
    {
      id: "twins",
      name: "ツインズ",
      english: "The Twins",
      evidence: ["emf", "freezing", "spiritBox"],
      tell: "離れた場所で連続干渉し、速い個体と遅い個体のようなハント速度差があります。",
      hunt: "干渉範囲と速度のズレを見ます。",
    },
    {
      id: "wraith",
      name: "レイス",
      english: "Wraith",
      evidence: ["dots", "emf", "spiritBox"],
      tell: "塩を踏まず、プレイヤーへのテレポートでEMFを残すことがあります。",
      hunt: "塩の上を通っても足跡が出ないなら最有力です。",
    },
    {
      id: "yokai",
      name: "妖怪",
      english: "Yokai",
      evidence: ["dots", "orb", "spiritBox"],
      tell: "近くの会話に反応して早めにハントし、ハント中の聞こえる範囲が狭いです。",
      hunt: "声で釣って、遠距離認識の弱さを見ます。",
    },
    {
      id: "yurei",
      name: "幽霊",
      english: "Yurei",
      evidence: ["dots", "orb", "freezing"],
      tell: "ドアを強く閉めて正気度を削り、スマッジで一時的に部屋に閉じ込めやすいです。",
      hunt: "ドア操作とスマッジ後の部屋移動を見ます。",
    },
  ];

  const BEHAVIOR_FILTERS = [
    {
      id: "maleName",
      label: "ゴースト名が男性",
      help: "女性名限定のバンシー、ダヤンを除外します。",
      mode: "exclude",
      ghosts: ["banshee", "dayan"],
    },
    {
      id: "femaleOnly",
      label: "女性名限定の候補を疑う",
      help: "名前や挙動からバンシー、ダヤンだけを残します。",
      mode: "include",
      ghosts: ["banshee", "dayan"],
    },
    {
      id: "aswangHide",
      label: "公式隠れ場所で殺されずハント終了",
      help: "正しい公式隠れ場所へ到達されたのに死ななかった時の決定打です。",
      mode: "include",
      ghosts: ["aswang"],
    },
    {
      id: "dayanMotion",
      label: "近くで歩くと速く、止まると遅い",
      help: "10m以内のプレイヤーの移動状態で速度が変わる候補です。",
      mode: "include",
      ghosts: ["dayan"],
    },
    {
      id: "galluProtect",
      label: "防御行動後に激昂する",
      help: "十字架、スマッジ、塩などで状態が変わる候補です。",
      mode: "include",
      ghosts: ["gallu"],
    },
    {
      id: "kormosAudio",
      label: "視認ではなく足音を追う",
      help: "視線追跡せず、足音や物音に反応して追う候補です。",
      mode: "include",
      ghosts: ["kormos"],
    },
    {
      id: "wraithSalt",
      label: "塩を踏まない",
      help: "塩の上を通っても足跡が出ない時の決定打です。",
      mode: "include",
      ghosts: ["wraith"],
    },
    {
      id: "obakePrint",
      label: "特殊指紋またはモデル変化",
      help: "6本指などの紫外線証拠、またはハント中の姿変化です。",
      mode: "include",
      ghosts: ["obake"],
    },
    {
      id: "goryoDots",
      label: "D.O.T.S.がカメラ越し限定",
      help: "肉眼では見えず、カメラ映像だけで見える候補です。",
      mode: "include",
      ghosts: ["goryo"],
    },
    {
      id: "bansheeScream",
      label: "パラボラで固有の絶叫",
      help: "バンシーの代表的な決定打です。",
      mode: "include",
      ghosts: ["banshee"],
    },
    {
      id: "phantomPhoto",
      label: "写真で姿が消えた",
      help: "ゴースト写真に姿が写らず、イベントが途切れた時。",
      mode: "include",
      ghosts: ["phantom"],
    },
    {
      id: "deogenBreath",
      label: "Spirit Boxで固有呼吸",
      help: "デオヘンの低確率特殊反応です。",
      mode: "include",
      ghosts: ["deogen"],
    },
    {
      id: "polterThrow",
      label: "複数の物を同時投げ",
      help: "物が一斉に動くポルターガイストの能力です。",
      mode: "include",
      ghosts: ["poltergeist"],
    },
    {
      id: "mylingQuiet",
      label: "足音が近距離まで聞こえにくい",
      help: "点滅距離よりかなり近くで足音が聞こえる候補です。",
      mode: "include",
      ghosts: ["myling"],
    },
    {
      id: "onryoFlame",
      label: "炎3回消灯後にハント",
      help: "火を消す行動がハント条件に絡みます。",
      mode: "include",
      ghosts: ["onryo"],
    },
    {
      id: "obamboPhase",
      label: "活動量と速度が周期的に急変",
      help: "平静と攻撃の状態差がはっきり出る候補です。",
      mode: "include",
      ghosts: ["obambo"],
    },
    {
      id: "spiritSmudge",
      label: "スマッジ後3分ハントなし",
      help: "スピリットの長いハント封じです。",
      mode: "include",
      ghosts: ["spirit"],
    },
    {
      id: "demonEarly",
      label: "極端に早いハント",
      help: "高正気度や短いスマッジ猶予で疑います。",
      mode: "include",
      ghosts: ["demon"],
    },
    {
      id: "oniVisible",
      label: "実体が濃く、霧イベントなし",
      help: "ハント中に見えやすく、霧状イベントを起こさない候補です。",
      mode: "include",
      ghosts: ["oni"],
    },
    {
      id: "raijuElectronics",
      label: "電子機器の近くで加速",
      help: "置いた機器のそばだけ足が速くなる候補です。",
      mode: "include",
      ghosts: ["raiju"],
    },
    {
      id: "hantuCold",
      label: "寒い場所で速く、白い息",
      help: "温度差とハント中の息が見抜きどころです。",
      mode: "include",
      ghosts: ["hantu"],
    },
    {
      id: "mimicOrb",
      label: "証拠数よりオーブが余分",
      help: "ミミックは追加のゴーストオーブを出します。",
      mode: "include",
      ghosts: ["mimic"],
    },
  ];

  const STATE_SEQUENCE = ["unknown", "confirmed", "denied"];
  const STORAGE_KEY = "phasmo-nightmare-analyst-v1";

  const appState = {
    difficulty: "nightmare",
    customEvidenceCount: 2,
    evidenceStates: Object.fromEntries(EVIDENCE.map((item) => [item.id, "unknown"])),
    activeBehaviors: [],
    showExcluded: false,
  };

  const evidenceById = Object.fromEntries(EVIDENCE.map((item) => [item.id, item]));
  const ghostById = Object.fromEntries(GHOSTS.map((ghost) => [ghost.id, ghost]));
  const behaviorById = Object.fromEntries(BEHAVIOR_FILTERS.map((filter) => [filter.id, filter]));

  function getEvidenceCount(state = appState) {
    if (state.difficulty === "professional") return 3;
    if (state.difficulty === "nightmare") return 2;
    if (state.difficulty === "insanity") return 1;
    if (state.difficulty === "zero") return 0;
    return clampEvidenceCount(state.customEvidenceCount);
  }

  function clampEvidenceCount(value) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return 2;
    return Math.min(3, Math.max(0, parsed));
  }

  function evidenceLabel(id, short = false) {
    const item = evidenceById[id];
    return item ? (short ? item.short : item.label) : id;
  }

  function combinations(items, count) {
    if (count === 0) return [[]];
    if (count > items.length) return [];
    const result = [];
    function walk(start, combo) {
      if (combo.length === count) {
        result.push(combo.slice());
        return;
      }
      for (let index = start; index < items.length; index += 1) {
        combo.push(items[index]);
        walk(index + 1, combo);
        combo.pop();
      }
    }
    walk(0, []);
    return result;
  }

  function getVisibleMainOptions(ghost, evidenceCount) {
    if (evidenceCount >= 3) return [ghost.evidence.slice()];
    if (evidenceCount === 0) return [[]];
    const options = combinations(ghost.evidence, evidenceCount);
    if (!ghost.forced) return options;
    return options.filter((option) => option.includes(ghost.forced));
  }

  function addExtraEvidence(ghost, mainOption) {
    const visible = new Set(mainOption);
    if (ghost.extraEvidence) {
      ghost.extraEvidence.forEach((id) => visible.add(id));
    }
    return [...visible];
  }

  function getStateLists(state = appState) {
    const confirmed = [];
    const denied = [];
    Object.entries(state.evidenceStates).forEach(([id, value]) => {
      if (value === "confirmed") confirmed.push(id);
      if (value === "denied") denied.push(id);
    });
    return { confirmed, denied };
  }

  function evaluateEvidence(ghost, state = appState) {
    const evidenceCount = getEvidenceCount(state);
    const { confirmed, denied } = getStateLists(state);
    const options = getVisibleMainOptions(ghost, evidenceCount);
    const validOptions = options
      .map((main) => ({
        main,
        visible: addExtraEvidence(ghost, main),
        hidden: ghost.evidence.filter((id) => !main.includes(id)),
      }))
      .filter((option) => {
        const visible = new Set(option.visible);
        const hasConfirmed = confirmed.every((id) => visible.has(id));
        const avoidsDenied = denied.every((id) => !visible.has(id));
        return hasConfirmed && avoidsDenied;
      });

    if (validOptions.length > 0) {
      return { ok: true, options: validOptions, reason: "" };
    }

    const reasons = [];
    if (confirmed.length > 0) {
      const confirmLabels = confirmed.map((id) => evidenceLabel(id, true)).join(" / ");
      reasons.push(`確定証拠 ${confirmLabels} が同時に表示できません`);
    }
    if (denied.length > 0) {
      const deniedLabels = denied.map((id) => evidenceLabel(id, true)).join(" / ");
      reasons.push(`否定証拠 ${deniedLabels} を避ける表示候補がありません`);
    }
    if (ghost.forced && denied.includes(ghost.forced)) {
      reasons.unshift(`${evidenceLabel(ghost.forced, true)} は強制証拠です`);
    }
    if (ghost.extraEvidence && ghost.extraEvidence.some((id) => denied.includes(id))) {
      reasons.unshift("ミミックの追加オーブを否定しています");
    }
    return { ok: false, options: [], reason: reasons[0] || "条件に合いません" };
  }

  function evaluateBehaviors(ghost, activeBehaviors = appState.activeBehaviors) {
    for (const id of activeBehaviors) {
      const filter = behaviorById[id];
      if (!filter) continue;
      const listed = filter.ghosts.includes(ghost.id);
      if (filter.mode === "include" && !listed) {
        return { ok: false, reason: `${filter.label} と一致しません` };
      }
      if (filter.mode === "exclude" && listed) {
        return { ok: false, reason: `${filter.label} で除外` };
      }
    }
    return { ok: true, reason: "" };
  }

  function evaluateGhost(ghost, state = appState) {
    const evidence = evaluateEvidence(ghost, state);
    const behaviors = evaluateBehaviors(ghost, state.activeBehaviors);
    const ok = evidence.ok && behaviors.ok;
    const reason = evidence.ok ? behaviors.reason : evidence.reason;
    const forcedHits = ghost.forced ? [ghost.forced] : [];
    const extraHits = ghost.extraEvidence || [];
    return {
      ghost,
      ok,
      evidence,
      behaviors,
      reason,
      forcedHits,
      extraHits,
      score: scoreGhost(ghost, evidence, behaviors, state),
    };
  }

  function scoreGhost(ghost, evidence, behaviors, state) {
    const { confirmed } = getStateLists(state);
    let score = 0;
    if (evidence.ok) score += 20;
    score += confirmed.filter((id) => ghost.evidence.includes(id) || (ghost.extraEvidence || []).includes(id)).length * 4;
    score += state.activeBehaviors.filter((id) => {
      const filter = behaviorById[id];
      return filter && filter.mode === "include" && filter.ghosts.includes(ghost.id);
    }).length * 8;
    if (ghost.forced && confirmed.includes(ghost.forced)) score += 3;
    if (ghost.extraEvidence && confirmed.some((id) => ghost.extraEvidence.includes(id))) score += 4;
    if (!behaviors.ok || !evidence.ok) score -= 100;
    return score;
  }

  function analyze(state = appState) {
    return GHOSTS.map((ghost) => evaluateGhost(ghost, state)).sort((a, b) => {
      if (a.ok !== b.ok) return a.ok ? -1 : 1;
      if (b.score !== a.score) return b.score - a.score;
      return a.ghost.english.localeCompare(b.ghost.english);
    });
  }

  function formatOption(ghost, option) {
    const visible = option.visible.map((id) => evidenceLabel(id, true)).join(" + ") || "証拠なし";
    const hidden = option.hidden.map((id) => evidenceLabel(id, true)).join(" / ") || "なし";
    const extra = ghost.extraEvidence ? ` / 追加: ${ghost.extraEvidence.map((id) => evidenceLabel(id, true)).join(" / ")}` : "";
    return `${visible} / 隠れ候補: ${hidden}${extra}`;
  }

  function statusLabel(value) {
    if (value === "confirmed") return "確定";
    if (value === "denied") return "否定";
    return "不明";
  }

  function renderEvidenceGrid() {
    const grid = document.getElementById("evidenceGrid");
    grid.replaceChildren();
    EVIDENCE.forEach((item) => {
      const state = appState.evidenceStates[item.id];
      const button = document.createElement("button");
      button.type = "button";
      button.className = `evidence-card ${state}`;
      button.setAttribute("aria-pressed", state !== "unknown" ? "true" : "false");
      button.dataset.evidence = item.id;
      button.innerHTML = `<strong>${item.label}</strong><span class="state">${statusLabel(state)}</span>`;
      button.addEventListener("click", () => {
        const currentIndex = STATE_SEQUENCE.indexOf(appState.evidenceStates[item.id]);
        appState.evidenceStates[item.id] = STATE_SEQUENCE[(currentIndex + 1) % STATE_SEQUENCE.length];
        saveState();
        render();
      });
      grid.append(button);
    });
  }

  function renderBehaviors() {
    const list = document.getElementById("behaviorFilters");
    list.replaceChildren();
    BEHAVIOR_FILTERS.forEach((filter) => {
      const active = appState.activeBehaviors.includes(filter.id);
      const label = document.createElement("label");
      label.className = `behavior-filter ${active ? "active" : ""}`;
      label.innerHTML = `
        <input type="checkbox" ${active ? "checked" : ""} />
        <span>${filter.label}<small>${filter.help}</small></span>
      `;
      const input = label.querySelector("input");
      input.addEventListener("change", () => {
        if (input.checked) {
          appState.activeBehaviors = [...new Set([...appState.activeBehaviors, filter.id])];
        } else {
          appState.activeBehaviors = appState.activeBehaviors.filter((id) => id !== filter.id);
        }
        saveState();
        render();
      });
      list.append(label);
    });
  }

  function renderGhosts(results) {
    const grid = document.getElementById("ghostGrid");
    grid.replaceChildren();
    const visibleResults = appState.showExcluded ? results : results.filter((result) => result.ok);
    if (visibleResults.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "条件に合う候補がありません。否定証拠や行動フィルターを少し戻して確認してください。";
      grid.append(empty);
      return;
    }
    visibleResults.forEach((result) => {
      const { ghost } = result;
      const card = document.createElement("article");
      card.className = `ghost-card ${result.ok ? "" : "excluded"}`;
      const evidenceChips = ghost.evidence
        .map((id) => {
          const classes = ["chip"];
          if (appState.evidenceStates[id] === "confirmed") classes.push("confirmed");
          if (appState.evidenceStates[id] === "denied") classes.push("denied");
          if (ghost.forced === id) classes.push("forced");
          return `<span class="${classes.join(" ")}">${evidenceLabel(id, true)}${ghost.forced === id ? " 強制" : ""}</span>`;
        })
        .join("");
      const extraChips = (ghost.extraEvidence || [])
        .map((id) => `<span class="chip extra">${evidenceLabel(id, true)} 追加</span>`)
        .join("");
      const optionsText = result.evidence.options
        .slice(0, 3)
        .map((option) => formatOption(ghost, option))
        .join("<br>");
      const moreOptions = result.evidence.options.length > 3 ? `<br>ほか ${result.evidence.options.length - 3} パターン` : "";
      card.innerHTML = `
        <header>
          <div class="ghost-title">
            <h3>${ghost.name}</h3>
            <small>${ghost.english}</small>
          </div>
          <span class="badge ${result.ok ? "possible" : "out"}">${result.ok ? "候補" : "除外"}</span>
        </header>
        <div class="chip-row">${evidenceChips}${extraChips}</div>
        <p class="ghost-note"><strong>見抜き方:</strong> ${ghost.tell}</p>
        <p class="ghost-note"><strong>ハント:</strong> ${ghost.hunt}</p>
        ${
          result.ok
            ? `<p class="visible-options"><strong>表示候補:</strong><br>${optionsText}${moreOptions}</p>`
            : `<p class="out-reason">${result.reason}</p>`
        }
      `;
      grid.append(card);
    });
  }

  function renderTable() {
    const table = document.getElementById("ghostTable");
    table.replaceChildren();
    GHOSTS.forEach((ghost) => {
      const tr = document.createElement("tr");
      const forced = ghost.forced ? `${evidenceLabel(ghost.forced, true)} は強制証拠` : "";
      const extra = ghost.extraEvidence ? `${ghost.extraEvidence.map((id) => evidenceLabel(id, true)).join(" / ")} は追加証拠` : "";
      tr.innerHTML = `
        <td><strong>${ghost.name}</strong><br><span class="muted">${ghost.english}</span></td>
        <td>${ghost.evidence.map((id) => evidenceLabel(id)).join(" / ")}${ghost.extraEvidence ? ` / +${ghost.extraEvidence.map((id) => evidenceLabel(id)).join(" / ")}` : ""}</td>
        <td>${[forced, extra].filter(Boolean).join("。") || "通常の隠れ証拠判定"}</td>
      `;
      table.append(tr);
    });
  }

  function renderStatus(results) {
    const { confirmed, denied } = getStateLists();
    const possible = results.filter((result) => result.ok).length;
    document.getElementById("candidateCount").textContent = String(possible);
    document.getElementById("confirmedCount").textContent = String(confirmed.length);
    document.getElementById("deniedCount").textContent = String(denied.length);
    const labels = {
      professional: "3証拠",
      nightmare: "Nightmare",
      insanity: "Insanity",
      zero: "0証拠",
      custom: `Custom ${getEvidenceCount()}証拠`,
    };
    document.getElementById("difficultyLabel").textContent = labels[appState.difficulty];
    const note = document.getElementById("resultNote");
    if (possible === 0) {
      note.textContent = "条件が厳しすぎる可能性があります。ナイトメアでは否定証拠が隠れ証拠になる場合があります。";
    } else if (confirmed.length > getEvidenceCount() && !(confirmed.includes("orb") && results.some((r) => r.ok && r.ghost.id === "mimic"))) {
      note.textContent = "表示証拠数を超えています。ミミックの追加オーブ以外なら入力を見直してください。";
    } else {
      note.textContent = "条件に合うゴーストを表示します。";
    }
  }

  function renderDifficulty() {
    document.querySelectorAll("[data-difficulty]").forEach((button) => {
      const active = button.dataset.difficulty === appState.difficulty;
      button.setAttribute("aria-checked", active ? "true" : "false");
    });
    document.getElementById("customEvidenceCount").value = String(appState.customEvidenceCount);
    document.getElementById("showExcluded").checked = appState.showExcluded;
  }

  function render() {
    const results = analyze();
    renderDifficulty();
    renderEvidenceGrid();
    renderBehaviors();
    renderGhosts(results);
    renderStatus(results);
    renderTable();
  }

  function saveState() {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }

  function loadState() {
    if (typeof localStorage === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        appState.difficulty = parsed.difficulty || appState.difficulty;
        appState.customEvidenceCount = clampEvidenceCount(parsed.customEvidenceCount ?? appState.customEvidenceCount);
        appState.showExcluded = Boolean(parsed.showExcluded);
        appState.activeBehaviors = Array.isArray(parsed.activeBehaviors) ? parsed.activeBehaviors.filter((id) => behaviorById[id]) : [];
        EVIDENCE.forEach((item) => {
          const next = parsed.evidenceStates && parsed.evidenceStates[item.id];
          appState.evidenceStates[item.id] = STATE_SEQUENCE.includes(next) ? next : "unknown";
        });
      }
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function resetEvidence() {
    EVIDENCE.forEach((item) => {
      appState.evidenceStates[item.id] = "unknown";
    });
  }

  function resetAll() {
    appState.difficulty = "nightmare";
    appState.customEvidenceCount = 2;
    appState.activeBehaviors = [];
    appState.showExcluded = false;
    resetEvidence();
    saveState();
    render();
  }

  function copySummary() {
    const results = analyze();
    const { confirmed, denied } = getStateLists();
    const possible = results.filter((result) => result.ok).map((result) => result.ghost.english).join(", ") || "none";
    const activeBehaviors = appState.activeBehaviors.map((id) => behaviorById[id]?.label).filter(Boolean).join(", ") || "なし";
    const text = [
      "Phasmophobia Ghost Analyst",
      `Difficulty: ${document.getElementById("difficultyLabel").textContent}`,
      `Confirmed: ${confirmed.map((id) => evidenceLabel(id)).join(", ") || "なし"}`,
      `Denied: ${denied.map((id) => evidenceLabel(id)).join(", ") || "なし"}`,
      `Behavior: ${activeBehaviors}`,
      `Candidates: ${possible}`,
    ].join("\n");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showToast("分析をコピーしました。"));
    } else {
      showToast(text);
    }
  }

  let toastTimer = 0;
  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function bindEvents() {
    document.querySelectorAll("[data-difficulty]").forEach((button) => {
      button.addEventListener("click", () => {
        appState.difficulty = button.dataset.difficulty;
        saveState();
        render();
      });
    });
    document.getElementById("customEvidenceCount").addEventListener("input", (event) => {
      appState.customEvidenceCount = clampEvidenceCount(event.target.value);
      appState.difficulty = "custom";
      saveState();
      render();
    });
    document.getElementById("showExcluded").addEventListener("change", (event) => {
      appState.showExcluded = event.target.checked;
      saveState();
      render();
    });
    document.getElementById("clearEvidence").addEventListener("click", () => {
      resetEvidence();
      saveState();
      render();
    });
    document.getElementById("clearBehaviors").addEventListener("click", () => {
      appState.activeBehaviors = [];
      saveState();
      render();
    });
    document.getElementById("resetAll").addEventListener("click", resetAll);
    document.getElementById("copySummary").addEventListener("click", copySummary);
  }

  function init() {
    loadState();
    const showExcluded = document.getElementById("showExcluded");
    showExcluded.checked = appState.showExcluded;
    bindEvents();
    render();
  }

  return {
    EVIDENCE,
    GHOSTS,
    BEHAVIOR_FILTERS,
    getEvidenceCount,
    getVisibleMainOptions,
    addExtraEvidence,
    evaluateEvidence,
    evaluateGhost,
    analyze,
    init,
  };
});
