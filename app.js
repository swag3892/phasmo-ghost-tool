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
      tell: "使用可能な所定の隠れ場所にいるプレイヤーに到達すると、そのプレイヤーを殺さずにハントを終了します。",
      hunt: "基礎速度は1.53 m/sで、プレイヤーを視認すると最大2.53 m/sまで加速します。隠れ場所でハントを終了させた後は、次のハントの開始位置に注意してください。",
    },
    {
      id: "banshee",
      name: "バンシー",
      english: "Banshee",
      evidence: ["dots", "orb", "ultraviolet"],
      tell: "1人のプレイヤーをターゲットにします。パラボラマイクで固有の絶叫が聞こえることがあります。",
      hunt: "ターゲットの正気度に基づいてハントを開始します。ゴーストの名前は女性名のみです。",
    },
    {
      id: "dayan",
      name: "ダヤン",
      english: "Dayan",
      evidence: ["emf", "orb", "spiritBox"],
      tell: "ゴーストから10 m以内にいる最も近いプレイヤーが歩くと、ゴーストの速度は2.25 m/sになり、静止すると1.2 m/sになります。",
      hunt: "ハント開始の基準となる正気度は、近くのプレイヤーが歩いていると65%、静止していると45%です。ゴーストの名前とモデルは女性のみです。",
    },
    {
      id: "deildegast",
      name: "Deildegast",
      english: "Deildegast",
      evidence: ["dots", "emf", "writing"],
      tell: "ハントの合間に小物を動かしたり投げたりすると、次のハント中の移動速度が下がります。調査装備は対象外です。",
      hunt: "基礎速度は3 m/sで、視認による加速はありません。減速させるには、ハントごとに小物を動かし直す必要があります。",
    },
    {
      id: "demon",
      name: "デーモン",
      english: "Demon",
      evidence: ["writing", "ultraviolet", "freezing"],
      tell: "早い段階でのハント、十字架の広い防御範囲、スマッジ後の短いハント抑制時間が特徴です。",
      hunt: "通常のハント開始の基準となる正気度は70%です。能力によって、さらに高い正気度でハントを開始することもあります。",
    },
    {
      id: "deogen",
      name: "デオヘン",
      english: "Deogen",
      evidence: ["dots", "writing", "spiritBox"],
      forced: "spiritBox",
      tell: "プレイヤーの位置を常に把握して追跡しますが、近距離では極端に遅くなります。スピリットボックスで固有の呼吸音を出すことがあります。",
      hunt: "隠れても位置を把握されます。近距離での減速を利用して逃げる方法が有効です。",
    },
    {
      id: "gallu",
      name: "ガルル",
      english: "Gallu",
      evidence: ["emf", "ultraviolet", "spiritBox"],
      tell: "十字架、スマッジ、塩の使用で激昂し、激昂中は塩の山を崩しません。ハント後は弱体化します。",
      hunt: "ハント開始の基準となる正気度と、ハント中の移動速度は、通常時が50%・1.7 m/s、激昂時が60%・1.955 m/s、弱体化時が40%・1.36 m/sです。",
    },
    {
      id: "goryo",
      name: "御霊",
      english: "Goryo",
      evidence: ["dots", "emf", "ultraviolet"],
      forced: "dots",
      tell: "D.O.T.S.の姿はカメラ越しでのみ見えます。お気に入りの部屋を変更しません。",
      hunt: "ナイトメアでも、D.O.T.S.の証拠は隠れません。",
    },
    {
      id: "hantu",
      name: "ハントゥ",
      english: "Hantu",
      evidence: ["orb", "ultraviolet", "freezing"],
      forced: "freezing",
      tell: "低温の場所では速く、高温の場所では遅くなります。ハント中に白い息が見えることがあります。",
      hunt: "ブレーカーをオンにできません。氷点下の証拠は隠れません。",
    },
    {
      id: "jinn",
      name: "ジン",
      english: "Jinn",
      evidence: ["emf", "ultraviolet", "freezing"],
      tell: "ブレーカーがオンのとき、離れたプレイヤーに向かって加速します。能力で近くのプレイヤーの正気度を減らすこともあります。",
      hunt: "ブレーカーをオフにすると、固有の能力を抑えられます。",
    },
    {
      id: "kormos",
      name: "コルモス",
      english: "Kormos",
      evidence: ["orb", "spiritBox", "ultraviolet"],
      tell: "ほとんど視覚に頼らず、静止したプレイヤーを見つけにくい一方、10〜30 m先の足音を検知します。",
      hunt: "近くのプレイヤーが走ると、ハント開始の基準となる正気度が70%になります。壁越しや通常より遠い距離での殺害、スマッジ使用中の検知に関する不具合はv0.18で修正されています。",
    },
    {
      id: "mare",
      name: "メアー",
      english: "Mare",
      evidence: ["writing", "orb", "spiritBox"],
      tell: "明るい部屋を嫌い、電気を消す行動が多めです。",
      hunt: "ハント開始の目安となる正気度は、暗い場所で60%、明るい場所で40%です。",
    },
    {
      id: "moroi",
      name: "モーロイ",
      english: "Moroi",
      evidence: ["writing", "freezing", "spiritBox"],
      forced: "spiritBox",
      tell: "呪いでプレイヤーの正気度を減らします。平均正気度が低いほど、移動速度が上がります。",
      hunt: "スピリットボックスの証拠は隠れません。スマッジによる目くらましの時間が長めです。",
    },
    {
      id: "myling",
      name: "マイリング",
      english: "Myling",
      evidence: ["writing", "emf", "ultraviolet"],
      tell: "ハント中の足音は、ゴーストがかなり近づくまで聞こえにくいです。パラボラマイクでは、ゴーストの音が多く聞こえます。",
      hunt: "懐中電灯が点滅する距離と、足音が聞こえ始める距離を比較すると見分けやすくなります。",
    },
    {
      id: "obake",
      name: "化け狐",
      english: "Obake",
      evidence: ["emf", "orb", "ultraviolet"],
      forced: "ultraviolet",
      tell: "6本指などの特殊な指紋、指紋の消失、ハント中に一瞬だけ姿が変わることが特徴です。",
      hunt: "紫外線の証拠は隠れません。",
    },
    {
      id: "obambo",
      name: "オバンボ",
      english: "Obambo",
      evidence: ["writing", "ultraviolet", "dots"],
      tell: "玄関を開けた1分後から、2分ごとに平静状態と攻撃状態を切り替えます。状態が変わると活動量と速度が急変します。",
      hunt: "ハント開始の基準となる正気度と、ハント中の移動速度は、平静時が10%・1.445 m/s、攻撃時が65%・1.955 m/sです。攻撃状態で始まるハントは、持続時間が20%短くなります。",
    },
    {
      id: "oni",
      name: "鬼",
      english: "Oni",
      evidence: ["dots", "emf", "freezing"],
      tell: "実体を見せるゴーストイベントが多く、ハント中も姿が見える時間が長めです。霧状のゴーストイベントは起こしません。",
      hunt: "姿が見えやすい一方、プレイヤーの正気度を大きく減らします。",
    },
    {
      id: "onryo",
      name: "怨霊",
      english: "Onryo",
      evidence: ["orb", "freezing", "spiritBox"],
      tell: "ゴーストが炎を消した回数が、ハントの開始条件に関わります。炎そのものにはハントを防ぐ働きもあります。",
      hunt: "ゴーストが炎を3回消した後のハントや、炎が十字架のようにハントを防ぐ挙動を確認します。",
    },
    {
      id: "phantom",
      name: "ファントム",
      english: "Phantom",
      evidence: ["dots", "ultraviolet", "spiritBox"],
      tell: "写真を撮ると姿が消え、ハント中の点滅間隔が長いです。",
      hunt: "姿を長く見続けると、正気度が減りやすくなります。",
    },
    {
      id: "poltergeist",
      name: "ポルターガイスト",
      english: "Poltergeist",
      evidence: ["writing", "ultraviolet", "spiritBox"],
      tell: "複数の物を同時に投げます。物が多い部屋では、正気度の低下や活動が目立ちます。",
      hunt: "投げる物の数と、複数の物を同時に投げるかどうかを確認します。",
    },
    {
      id: "raiju",
      name: "雷獣",
      english: "Raiju",
      evidence: ["dots", "emf", "orb"],
      tell: "電子機器の近くでは移動速度が上がり、離れた場所からも機器に干渉します。",
      hunt: "電子機器を置いたルートと、置いていないルートで速度を比較します。",
    },
    {
      id: "revenant",
      name: "レヴナント",
      english: "Revenant",
      evidence: ["writing", "orb", "freezing"],
      tell: "標的を見つけると非常に速く、見失うとかなり遅くなります。",
      hunt: "足音の間隔から分かる速度の変化が大きいです。",
    },
    {
      id: "shade",
      name: "シェード",
      english: "Shade",
      evidence: ["writing", "emf", "freezing"],
      tell: "プレイヤーが近くにいると活動やハントが抑えられ、正気度が低くなるまでおとなしいことがあります。",
      hunt: "1人で調査するときと、複数人で調査するときの活動を比較します。",
    },
    {
      id: "spirit",
      name: "スピリット",
      english: "Spirit",
      evidence: ["writing", "emf", "spiritBox"],
      tell: "スマッジの使用後、約3分間ハントが抑制されます。",
      hunt: "ほかの特徴が見つからないときは、スマッジ使用後のハント抑制時間が判断材料になります。",
    },
    {
      id: "thaye",
      name: "セーイ",
      english: "Thaye",
      evidence: ["dots", "writing", "orb"],
      tell: "若いときは速く活発ですが、プレイヤーが近くにいる間に老化して弱くなります。",
      hunt: "調査序盤と後半の移動速度を比較します。",
    },
    {
      id: "mimic",
      name: "ミミック",
      english: "The Mimic",
      evidence: ["ultraviolet", "freezing", "spiritBox"],
      extraEvidence: ["orb"],
      tell: "ほかのゴーストの特徴を模倣します。設定された証拠数とは別に、ゴーストオーブが追加で出ます。",
      hunt: "ナイトメアでも、オーブを含めて3種類の証拠が見つかることがあります。",
    },
    {
      id: "twins",
      name: "ツインズ",
      english: "The Twins",
      evidence: ["emf", "freezing", "spiritBox"],
      tell: "離れた場所で連続して干渉します。速い個体と遅い個体がいるかのように、ハントごとに速度が異なります。",
      hunt: "干渉する場所の広がりと、ハントごとの速度の違いを確認します。",
    },
    {
      id: "wraith",
      name: "レイス",
      english: "Wraith",
      evidence: ["dots", "emf", "spiritBox"],
      tell: "塩を踏まず、プレイヤーへのテレポートでEMFを残すことがあります。",
      hunt: "塩の山が崩れないことを確認します。紫外線で見える足跡の有無とは別の判定です。激昂したガルルやミミックにも注意してください。",
    },
    {
      id: "yokai",
      name: "妖怪",
      english: "Yokai",
      evidence: ["dots", "orb", "spiritBox"],
      tell: "近くの会話に反応して早い段階でハントを開始しますが、ハント中に声を聞き取れる範囲は狭いです。",
      hunt: "声への反応を確認し、離れたプレイヤーを認識しにくいかを見ます。",
    },
    {
      id: "yurei",
      name: "幽霊",
      english: "Yurei",
      evidence: ["dots", "orb", "freezing"],
      tell: "ドアを強く閉めてプレイヤーの正気度を減らします。スマッジで一時的に部屋にとどめやすくなります。",
      hunt: "ドアへの干渉と、スマッジ使用後に部屋を移動するかを確認します。",
    },
  ];

  const BEHAVIOR_FILTERS = [
    {
      id: "maleName",
      label: "ゴーストの名前が男性名",
      help: "女性名のみを持つバンシーとダヤンを除外します。",
      mode: "exclude",
      ghosts: ["banshee", "dayan"],
    },
    {
      id: "femaleOnly",
      label: "ゴーストの名前が女性名",
      help: "女性名であることだけでは、ほかの種類を除外できません。参考情報として扱います。",
      mode: "hint",
      ghosts: ["banshee", "dayan"],
    },
    {
      id: "aswangHide",
      label: "所定の隠れ場所で殺されずにハントが終了",
      help: "ハントの自然終了と区別するため、ゴーストが隠れ場所に到達した瞬間に終了したかを確認します。",
      mode: "include",
      ghosts: ["aswang"],
    },
    {
      id: "dayanMotion",
      label: "近くで歩くとゴーストが速く、止まると遅い",
      help: "ゴーストから10 m以内のプレイヤーが歩いているか、静止しているかで、ゴーストの移動速度が変わる場合です。",
      mode: "include",
      ghosts: ["dayan"],
    },
    {
      id: "galluProtect",
      label: "防御行動の後に塩を踏まなくなった",
      help: "十字架、スマッジ、塩の使用で激昂し、その間は塩の山を崩さなくなる場合です。",
      mode: "include",
      ghosts: ["gallu"],
    },
    {
      id: "kormosAudio",
      label: "静止したプレイヤーを見失い、足音を追う",
      help: "物を投げる音ではなく、歩いたり走ったりする足音に反応して追跡する場合です。",
      mode: "include",
      ghosts: ["kormos"],
    },
    {
      id: "wraithSalt",
      label: "塩を踏まない",
      help: "ゴーストが通過しても塩の山そのものが崩れない場合です。レイス、激昂したガルル、模倣中のミミックが候補に残ります。",
      mode: "include",
      ghosts: ["wraith", "gallu"],
    },
    {
      id: "obakePrint",
      label: "特殊な指紋、またはハント中の姿の変化",
      help: "紫外線で6本指などの特殊な指紋が見えるか、ハント中に一瞬だけ姿が変わる場合です。",
      mode: "include",
      ghosts: ["obake"],
    },
    {
      id: "goryoDots",
      mimicCanCopy: false,
      requiredEvidence: "dots",
      label: "D.O.T.S.の姿がカメラ越しでのみ見える",
      help: "肉眼では見えず、カメラ映像でのみ姿が見える場合です。",
      mode: "include",
      ghosts: ["goryo"],
    },
    {
      id: "bansheeScream",
      label: "パラボラマイクで固有の絶叫",
      help: "バンシー固有の絶叫が聞こえた場合です。模倣中のミミックも候補に残ります。",
      mode: "include",
      ghosts: ["banshee"],
    },
    {
      id: "phantomPhoto",
      label: "写真を撮ると姿が消えた",
      help: "写真を撮ると姿だけが消え、イベントの音などは続く場合です。イベントそのものの終了とは区別します。",
      mode: "include",
      ghosts: ["phantom"],
    },
    {
      id: "deogenBreath",
      requiredEvidence: "spiritBox",
      label: "スピリットボックスで固有の呼吸音",
      help: "デオヘンが低確率で出す特殊な反応です。",
      mode: "include",
      ghosts: ["deogen"],
    },
    {
      id: "polterThrow",
      label: "複数の物を同時に投げる",
      help: "複数の物が一斉に動く、ポルターガイストの能力を観測した場合です。",
      mode: "include",
      ghosts: ["poltergeist"],
    },
    {
      id: "mylingQuiet",
      label: "近づくまで足音が聞こえにくい",
      help: "階の違いや遮音の影響もあるため、参考情報として扱います。同じ階で、足音が聞こえる距離と機器が干渉を受ける距離を比較します。",
      mode: "hint",
      ghosts: ["myling"],
    },
    {
      id: "onryoFlame",
      label: "ゴーストが炎を3回消した後にハント",
      help: "通常のハントと偶然重なる可能性があるため、参考情報として扱います。炎がハントを防ぐかも確認します。",
      mode: "hint",
      ghosts: ["onryo"],
    },
    {
      id: "obamboPhase",
      label: "活動量と速度が周期的に急変する",
      help: "速度の変化には複数の原因があるため、周期だけではほかの候補を除外しません。",
      mode: "hint",
      ghosts: ["obambo"],
    },
    {
      id: "spiritSmudge",
      label: "スマッジ使用後、3分間ハントがない",
      help: "ハントが起きないことだけでは種類を確定できません。正気度や防御アイテムなどの影響で、開始が遅れる場合もあります。",
      mode: "hint",
      ghosts: ["spirit"],
    },
    {
      id: "demonEarly",
      label: "スマッジ使用後、60〜89秒で再ハント",
      help: "スマッジの効果が確実に届いた後、60〜89秒で通常のハントが始まった場合です。呪いのハントは対象外です。",
      mode: "include",
      ghosts: ["demon"],
    },
    {
      id: "oniVisible",
      label: "姿が見えやすく、霧状のイベントがない",
      help: "霧状のイベントを観測していないだけでは、ほかの種類を除外できません。ハント中の点滅と併せて判断する参考情報です。",
      mode: "hint",
      ghosts: ["oni"],
    },
    {
      id: "raijuElectronics",
      label: "電子機器の近くで加速する",
      help: "設置した電子機器の近くで、移動速度が上がる場合です。",
      mode: "include",
      ghosts: ["raiju"],
    },
    {
      id: "hantuCold",
      label: "寒い場所で速くなり、白い息が見える",
      help: "温度による速度の違いと、ブレーカーがオフまたは故障しているときにハント中の白い息が見えるかを確認します。",
      mode: "include",
      ghosts: ["hantu"],
    },
    {
      id: "mimicOrb",
      label: "設定された証拠数に加えてオーブが見える",
      help: "ミミックは、設定された証拠数とは別にゴーストオーブを出します。",
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
    searchTerm: "",
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
    for (const id of state.activeBehaviors || []) {
      const required = behaviorById[id]?.requiredEvidence;
      if (required && !confirmed.includes(required)) confirmed.push(required);
    }
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
      reasons.push(`確定した証拠（${confirmLabels}）が同時に現れる組み合わせはありません。`);
    }
    if (denied.length > 0) {
      const deniedLabels = denied.map((id) => evidenceLabel(id, true)).join(" / ");
      reasons.push(`否定した証拠（${deniedLabels}）を含まない組み合わせはありません。`);
    }
    if (evidenceCount > 0 && ghost.forced && denied.includes(ghost.forced)) {
      reasons.unshift(`${evidenceLabel(ghost.forced, true)}は強制証拠のため、否定すると候補から除外されます。`);
    }
    if (ghost.extraEvidence && ghost.extraEvidence.some((id) => denied.includes(id))) {
      reasons.unshift("ミミックの追加オーブが否定されているため、候補から除外されます。");
    }
    return { ok: false, options: [], reason: reasons[0] || "選択した条件に一致しません。" };
  }

  function evaluateBehaviors(ghost, activeBehaviors = appState.activeBehaviors) {
    for (const id of activeBehaviors) {
      const filter = behaviorById[id];
      if (!filter) continue;
      // Mimic can copy abilities, but cannot produce Goryo's DOTS evidence.
      const listed = filter.ghosts.includes(ghost.id) ||
        (filter.mode === "include" && ghost.id === "mimic" && filter.mimicCanCopy !== false);
      if (filter.mode === "include" && !listed) {
        return { ok: false, reason: `行動条件「${filter.label}」に一致しません。` };
      }
      if (filter.mode === "exclude" && listed) {
        return { ok: false, reason: `行動条件「${filter.label}」により除外されます。` };
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
      return filter && ["include", "hint"].includes(filter.mode) && filter.ghosts.includes(ghost.id);
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
    return `${visible} / 隠れる証拠: ${hidden}${extra}`;
  }

  function statusLabel(value) {
    if (value === "confirmed") return "確定";
    if (value === "denied") return "否定";
    return "不明";
  }

  function renderEvidenceGrid() {
    const icons = { dots: "scan-line", emf: "radio", freezing: "thermometer-snowflake", orb: "circle-dot", spiritBox: "audio-lines", ultraviolet: "fingerprint", writing: "notebook-pen" };
    const grid = document.getElementById("evidenceGrid");
    grid.replaceChildren();
    EVIDENCE.forEach((item) => {
      const state = appState.evidenceStates[item.id];
      const button = document.createElement("button");
      button.type = "button";
      button.className = `evidence-card ${state}`;
      button.setAttribute("aria-pressed", state !== "unknown" ? "true" : "false");
      button.dataset.evidence = item.id;
      button.setAttribute("aria-label", `${item.label}: ${statusLabel(state)}`);
      button.innerHTML = `<img src="./assets/${icons[item.id]}.svg" width="22" height="22" alt=""><strong>${item.label}</strong><span class="state">${statusLabel(state)}</span>`;
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
        <span>${filter.mode === "hint" ? "参考: " : ""}${filter.label}<small>${filter.help}</small></span>
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
    const term = appState.searchTerm.trim().toLocaleLowerCase("ja");
    const statusResults = appState.showExcluded ? results : results.filter((result) => result.ok);
    const visibleResults = statusResults.filter(({ ghost }) => {
      if (!term) return true;
      return [ghost.name, ghost.english, ghost.id].some((value) => value.toLocaleLowerCase("ja").includes(term));
    });
    if (visibleResults.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = term
        ? "検索した名前に一致するゴーストはありません。"
        : "条件に合う候補はありません。否定した証拠や行動フィルターの選択を見直してください。";
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
          const forced = ghost.forced === id && getEvidenceCount() > 0;
          if (forced) classes.push("forced");
          return `<span class="${classes.join(" ")}">${evidenceLabel(id, true)}${forced ? " 強制" : ""}</span>`;
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
        <p class="ghost-note"><strong>特徴:</strong> ${ghost.tell}</p>
        <p class="ghost-note"><strong>調査のポイント:</strong> ${ghost.hunt}</p>
        ${
          result.ok
            ? `<details class="evidence-options"><summary>証拠の組み合わせ <span>${result.evidence.options.length}</span></summary><p class="visible-options">${optionsText}${moreOptions}</p></details>`
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
      const forced = ghost.forced ? `${evidenceLabel(ghost.forced, true)}は強制証拠です` : "";
      const extra = ghost.extraEvidence ? `${ghost.extraEvidence.map((id) => evidenceLabel(id, true)).join(" / ")}は追加証拠です` : "";
      tr.innerHTML = `
        <td><strong>${ghost.name}</strong><br><span class="muted">${ghost.english}</span></td>
        <td>${ghost.evidence.map((id) => evidenceLabel(id)).join(" / ")}${ghost.extraEvidence ? ` / +${ghost.extraEvidence.map((id) => evidenceLabel(id)).join(" / ")}` : ""}</td>
        <td>${[forced, extra].filter(Boolean).join("。") || "強制証拠や追加証拠はありません"}。</td>
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
      custom: `カスタム ${getEvidenceCount()}証拠`,
    };
    document.getElementById("difficultyLabel").textContent = labels[appState.difficulty];
    const note = document.getElementById("resultNote");
    if (possible === 0) {
      note.textContent = "条件に合う候補はありません。ナイトメアでは、見つからない証拠が隠れ証拠の場合もあります。";
    } else if (confirmed.length > getEvidenceCount() && !(confirmed.includes("orb") && results.some((r) => r.ok && r.ghost.id === "mimic"))) {
      note.textContent = "確定した証拠が、設定された証拠数を超えています。ミミックの追加オーブを除き、入力を見直してください。";
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
    document.getElementById("ghostSearch").value = appState.searchTerm;
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
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (error) {
      // Storage can be blocked or full; keep the current investigation usable.
    }
  }

  function loadState() {
    try {
      if (typeof localStorage === "undefined") return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        if (["professional", "nightmare", "insanity", "zero", "custom"].includes(parsed.difficulty)) {
          appState.difficulty = parsed.difficulty;
        }
        appState.customEvidenceCount = clampEvidenceCount(parsed.customEvidenceCount ?? appState.customEvidenceCount);
        appState.showExcluded = Boolean(parsed.showExcluded);
        appState.searchTerm = typeof parsed.searchTerm === "string" ? parsed.searchTerm : "";
        appState.activeBehaviors = Array.isArray(parsed.activeBehaviors) ? parsed.activeBehaviors.filter((id) => behaviorById[id]) : [];
        EVIDENCE.forEach((item) => {
          const next = parsed.evidenceStates && parsed.evidenceStates[item.id];
          appState.evidenceStates[item.id] = STATE_SEQUENCE.includes(next) ? next : "unknown";
        });
      }
    } catch (error) {
      // Ignore unavailable or malformed saved data without blocking startup.
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
    appState.searchTerm = "";
    resetEvidence();
    saveState();
    render();
  }

  function copySummary() {
    const results = analyze();
    const { confirmed, denied } = getStateLists();
    const possible = results.filter((result) => result.ok).map((result) => result.ghost.english).join(", ") || "なし";
    const activeBehaviors = appState.activeBehaviors.map((id) => behaviorById[id]?.label).filter(Boolean).join(", ") || "なし";
    const text = [
      "Phasmophobia ゴースト分析",
      `難易度: ${document.getElementById("difficultyLabel").textContent}`,
      `確定した証拠: ${confirmed.map((id) => evidenceLabel(id)).join(", ") || "なし"}`,
      `否定した証拠: ${denied.map((id) => evidenceLabel(id)).join(", ") || "なし"}`,
      `行動条件: ${activeBehaviors}`,
      `候補ゴースト: ${possible}`,
    ].join("\n");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => showToast("分析結果をコピーしました。"))
        .catch(() => showToast("コピーできませんでした。ブラウザのクリップボード権限を確認してください。"));
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
    document.getElementById("ghostSearch").addEventListener("input", (event) => {
      appState.searchTerm = event.target.value;
      saveState();
      renderGhosts(analyze());
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
