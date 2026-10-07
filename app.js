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
    { id: "emf", label: "EMFレベル5", short: "EMF 5" },
    { id: "freezing", label: "氷点下", short: "氷点下" },
    { id: "orb", label: "ゴーストオーブ", short: "オーブ" },
    { id: "spiritBox", label: "スピリットボックス", short: "ボックス" },
    { id: "ultraviolet", label: "紫外線", short: "UV" },
    { id: "writing", label: "ゴーストライティング", short: "筆記" },
  ];

  const GHOSTS = [
    {
      id: "aswang",
      name: "アスワング",
      english: "Aswang",
      evidence: ["dots", "freezing", "writing"],
      tell: "使用可能な所定の隠れ場所にいるプレイヤーに到達すると、殺さずにハントを終了します。家具の陰など所定の隠れ場所以外や、隠れ場所なしの設定では保護されません。",
      hunt: "基礎速度は1.53 m/s、視認時は約8.7秒で最大2.53 m/sに加速します。隠れてハントを終了させた後は、次のハント開始時にプレイヤーの位置を把握して向かってくるため、移動と退避に注意してください。",
    },
    {
      id: "banshee",
      name: "バンシー",
      english: "Banshee",
      evidence: ["dots", "orb", "ultraviolet"],
      tell: "1人を標的にし、その人が調査エリア内にいるハントではほかの人を無視します。パラボラマイクやサウンドレコーダーで固有の絶叫が聞こえることがあります。",
      hunt: "標的の正気度50%を基準にハントを開始します。標的が調査エリア外なら、ハント中は全員を狙います。名前とモデルは女性のみです。",
    },
    {
      id: "dayan",
      name: "ダヤン",
      english: "Dayan",
      evidence: ["emf", "orb", "spiritBox"],
      tell: "ゴーストから10 m以内にいる最も近いプレイヤーが歩くと、ゴーストの速度は2.25 m/sになり、静止すると1.2 m/sになります。",
      hunt: "最も近いプレイヤーが10 m以内で移動中なら正気度65%、静止中なら45%、誰も10 m以内にいなければ50%がハント開始の基準です。範囲外では通常速度と視認加速が適用されます。別の階のプレイヤーも判定対象で、名前とモデルは女性のみです。",
    },
    {
      id: "deildegast",
      name: "Deildegast",
      english: "Deildegast",
      evidence: ["dots", "emf", "writing"],
      tell: "ハント中でないときにプレイヤーが異なる小物を動かしたり、照明スイッチ・ブレーカー・蛇口などを操作したりすると、次のハントの移動速度が下がります。同じ対象を繰り返し操作しても加算されず、ドア・調査装備・呪いのアイテムの操作も対象外です。",
      hunt: "速度は3 m/sから対象1つにつき0.1 m/s下がり、最小0.4 m/sです。視認加速はなく、死亡したプレイヤーの操作も有効です。ハント終了や十字架の消費で減速数がリセットされるため、その後に操作し直します。",
    },
    {
      id: "demon",
      name: "デーモン",
      english: "Demon",
      evidence: ["writing", "ultraviolet", "freezing"],
      tell: "早い段階でのハント、十字架の広い防御範囲、スマッジ後の短いハント抑制時間が特徴です。",
      hunt: "通常は正気度70%、能力では正気度に関係なくハントを試みます。スマッジの抑制は60秒、通常ハント後の待機は最短20秒です。抑制時間中でも呪いのアイテムによるハントは防げません。",
    },
    {
      id: "deogen",
      name: "デオヘン",
      english: "Deogen",
      evidence: ["dots", "writing", "spiritBox"],
      forced: "spiritBox",
      tell: "プレイヤーの位置を常に把握して追跡しますが、近距離では極端に遅くなります。スピリットボックスで固有の呼吸音を出すことがあります。",
      hunt: "ハント開始の基準は正気度40%です。遠距離では最大3 m/s、近距離では最小0.4 m/sです。隠れると追い詰められるため、行き止まりを避けて回り続けます。固有の呼吸音は、1 m以内でスピリットボックスが反応した際に出ることがあります。",
    },
    {
      id: "gallu",
      name: "ガルル",
      english: "Gallu",
      evidence: ["emf", "ultraviolet", "spiritBox"],
      tell: "十字架の消費、ゴーストに届いたスマッジ、塩を踏むことにより、通常→激昂、弱体化→通常へ変化します。装備を置くだけでは変わりません。激昂中は塩を踏まず、激昂状態でハントが終わると弱体化します。",
      hunt: "正気度の基準と基礎速度は、通常50%・1.7 m/s、激昂60%・1.955 m/s、弱体化40%・1.36 m/sです。視認加速もあります。塩を踏んでから状態が変わるまで2〜3秒の遅れがあります。",
    },
    {
      id: "goryo",
      name: "御霊",
      english: "Goryo",
      evidence: ["dots", "emf", "ultraviolet"],
      forced: "dots",
      tell: "同じ部屋に誰もいないときにD.O.T.S.状態になり、姿はビデオカメラ越しでのみ見えます。通常の徘徊ではお気に入りの部屋を変更しませんが、猿の手の正気度の願いは例外です。",
      hunt: "証拠数が1以上ならD.O.T.S.は隠れません。部屋の外から肉眼とカメラを同時に比較します。ゴーストイベントやハントの実体は普通に見えます。",
    },
    {
      id: "hantu",
      name: "ハントゥ",
      english: "Hantu",
      evidence: ["orb", "ultraviolet", "freezing"],
      forced: "freezing",
      tell: "通過する部屋の温度で速度が変わり、視認では加速しません。ブレーカーがオフ・故障中のハントでは、ゴーストの頭付近に白い息が出ます。",
      hunt: "ブレーカーをオンにできず、証拠数が1以上なら氷点下は隠れません。頭付近の白い息は氷点下の証拠とは別で、証拠0でも出ます。プレイヤー自身の白い息とは区別します。",
    },
    {
      id: "jinn",
      name: "ジン",
      english: "Jinn",
      evidence: ["emf", "ultraviolet", "freezing"],
      tell: "ブレーカーがオンで、3 mより遠いプレイヤーを視認すると2.5 m/sで追跡します。同じ部屋または3 m以内のプレイヤーの正気度を25%減らす能力もあります。",
      hunt: "ブレーカーをオフにすると固有の加速と正気度低下を抑えられますが、通常の視認加速は残ります。自分でブレーカーを切ることはなく、照明を増やして過負荷で落とすことはあります。",
    },
    {
      id: "kormos",
      name: "コルモス",
      english: "Kormos",
      evidence: ["orb", "spiritBox", "ultraviolet"],
      tell: "同じ階の足音を、しゃがみ歩き10 m・通常歩き15 m・走行30 mまで検知します。5 m以内で遮蔽物なく移動すると追跡され、静止していても接触すれば殺されます。",
      hunt: "通常のハント開始基準は正気度50%、ゴーストと同じ部屋で走ると70%です。静止している人を無視しただけでは、バンシーなどと区別できません。声や電子機器も検知するため、静止だけで安全とは限りません。",
    },
    {
      id: "mare",
      name: "メアー",
      english: "Mare",
      evidence: ["writing", "orb", "spiritBox"],
      tell: "部屋の照明を自分では点けません。近くで点けた照明を、能力でほぼ即座に消すことがあります。単に消灯が多いだけでは確定しません。",
      hunt: "ゴーストがいる部屋の照明がオフなら正気度60%、オンなら40%がハント開始の基準です。懐中電灯や炎はこの照明判定に含まれません。",
    },
    {
      id: "moroi",
      name: "モーロイ",
      english: "Moroi",
      evidence: ["writing", "freezing", "spiritBox"],
      forced: "spiritBox",
      tell: "スピリットボックスの応答、パラボラマイクの怪音、サウンドレコーダーの録音操作で呪いを与えます。呪いは正気度の自然減少を速め、部屋の照明による保護を無効にします。正気度回復薬で解除できます。",
      hunt: "平均正気度が低いほど速くなり、視認でも加速します。証拠が1種類以上出る設定では、スピリットボックスは隠れません。ハント中のスマッジによる目くらましは7秒で、通常の5秒より長くなります。",
    },
    {
      id: "myling",
      name: "マイリング",
      english: "Myling",
      evidence: ["writing", "emf", "ultraviolet"],
      tell: "ハント中の足音は、ゴーストがかなり近づくまで聞こえにくいです。パラボラマイクでは、ゴーストの音が多く聞こえます。",
      hunt: "ハント中の足音・声は12 m以内で聞こえます。機器干渉の10 mと比較しますが、階・遮音・雷獣の15 m干渉でも紛らわしくなるため、これだけで確定しません。",
    },
    {
      id: "obake",
      name: "化け狐",
      english: "Obake",
      evidence: ["emf", "orb", "ultraviolet"],
      forced: "ultraviolet",
      tell: "6本指などの特殊な指紋を残すことがあり、指紋を残さない干渉や、残り時間を短縮する能力もあります。ハント中は一瞬だけ別のモデルに変化します。",
      hunt: "証拠数が1以上なら紫外線は隠れませんが、毎回指紋を残すわけではありません。モデル変化は証拠0でも有効で、短すぎるハントでは観測できないことがあります。",
    },
    {
      id: "obambo",
      name: "オバンボ",
      english: "Obambo",
      evidence: ["writing", "ultraviolet", "dots"],
      tell: "平静状態で始まり、出口を初めて開けた1分後に攻撃状態へ、その後は2分ごとに切り替わります。平静時のほうが干渉・イベントの活動量が高く、攻撃時は低くなります。ハント中にも状態と速度が変わります。",
      hunt: "ハント開始の基準となる正気度と、ハント中の移動速度は、平静時が10%・1.445 m/s、攻撃時が65%・1.955 m/sです。攻撃状態で始まるハントは、持続時間が20%短くなります。",
    },
    {
      id: "oni",
      name: "鬼",
      english: "Oni",
      evidence: ["dots", "emf", "freezing"],
      tell: "実体を見せるゴーストイベントが多く、ハント中も姿が見える時間が長めです。霧状のゴーストイベントは起こしません。",
      hunt: "イベントでプレイヤーに接触すると、正気度を通常の10%ではなく20%減らします。ハント中の見えやすさとは別の性質です。息を吹きかける音だけでは、霧状イベントとは判定できません。",
    },
    {
      id: "onryo",
      name: "怨霊",
      english: "Onryo",
      evidence: ["orb", "freezing", "spiritBox"],
      tell: "ゴーストが炎を消した回数が、ハントの開始条件に関わります。炎そのものにはハントを防ぐ働きもあります。",
      hunt: "通常のハント開始基準は正気度60%です。炎を3回消すと正気度に関係なくハントを試みますが、スマッジ・待機時間・別の炎・十字架で実際の開始が遅延・阻止されることがあります。4 m以内の炎は十字架より優先してハントを防ぎます。",
    },
    {
      id: "phantom",
      name: "ファントム",
      english: "Phantom",
      evidence: ["dots", "ultraviolet", "spiritBox"],
      tell: "イベントやD.O.T.S.の姿を正常に撮影すると、姿が消え、画像に実体と干渉が写りません。ハント中は消えている時間が長く、撮影してもハントは止まりません。",
      hunt: "イベントやハント中に姿を近くで見ると、追加の正気度低下が起こります。写真の撮り損ね・イベント終了・同期ずれ、御霊のD.O.T.S.写真を、撮影による消失と混同しないようにします。",
    },
    {
      id: "poltergeist",
      name: "ポルターガイスト",
      english: "Poltergeist",
      evidence: ["writing", "ultraviolet", "spiritBox"],
      tell: "複数の物を同時に投げます。物が多い部屋では、正気度の低下や活動が目立ちます。",
      hunt: "ハント外の一斉投げ能力と、ハント中の連続投げを区別します。複数の小物をまとめて置き、一斉に飛ぶかを確認します。単発の強い投げや物同士の衝突だけでは確定しません。",
    },
    {
      id: "raiju",
      name: "雷獣",
      english: "Raiju",
      evidence: ["dots", "emf", "orb"],
      tell: "同じ階の作動中の調査用電子機器の近くでは2.5 m/sになり、ハント開始基準が正気度65%になります。建物の照明やブレーカーは対象外です。機器への干渉は15 mまで届きます。",
      hunt: "有効な機器をオン・オフにして速度を比較します。投げたカメラや未設置のセンサーなどは対象外で、機器を置くだけでは不十分です。視認・温度・プレイヤーの移動による加速との混同にも注意します。",
    },
    {
      id: "revenant",
      name: "レヴナント",
      english: "Revenant",
      evidence: ["writing", "orb", "freezing"],
      tell: "未検知の徘徊は1 m/s、視認・声・電子機器でプレイヤーを検知すると3 m/sです。見失っても最後に検知した位置までは高速のまま進みます。",
      hunt: "最後に検知した位置に到達した後、約2.7秒かけて徘徊速度へ減速します。視線を切った瞬間には遅くならないため、スマッジで距離を取り、声と電子機器を止めて隠れます。",
    },
    {
      id: "shade",
      name: "シェード",
      english: "Shade",
      evidence: ["writing", "emf", "freezing"],
      tell: "ゴーストと同じ部屋に1人でもいると、通常の干渉・イベント・ハント開始を抑えます。単に距離が近いことや、複数人であることが条件ではありません。",
      hunt: "通常ハントの開始基準は正気度35%です。ゴーストが無人の隣室に移動して、こちらの部屋の物に干渉する場合もあります。お気に入りの部屋にいるだけではハントを防げません。呪いのハントも別です。",
    },
    {
      id: "spirit",
      name: "スピリット",
      english: "Spirit",
      evidence: ["writing", "emf", "spiritBox"],
      tell: "スマッジの効果が新しく届いてから180秒間、通常ハントを抑制します。効果が残る間の再使用では、抑制タイマーは更新されません。",
      hunt: "180秒より早い通常ハントは否定材料ですが、180秒間ハントがないだけでは確定しません。抑制は呪いのハントを防がず、計測は点火しただけでなく効果が届いた時点から行います。",
    },
    {
      id: "thaye",
      name: "セーイ",
      english: "Thaye",
      evidence: ["dots", "writing", "orb"],
      tell: "若いときは速く活発で、同じ部屋または3 m以内にプレイヤーがいると定期的な老化判定で弱くなります。時間が経つだけで必ず老化するわけではありません。",
      hunt: "基礎速度は最初2.75 m/s、老化で最小1 m/sまで下がり、視認では加速しません。近くで調査した前後の速度を比べます。ハント中に老化しても、その速度変化はハント終了後に反映されます。",
    },
    {
      id: "mimic",
      name: "ミミック",
      english: "The Mimic",
      evidence: ["ultraviolet", "freezing", "spiritBox"],
      extraEvidence: ["orb"],
      tell: "ほかのゴーストの特徴を模倣します。設定された証拠数とは別に、ゴーストオーブが追加で出ます。",
      hunt: "ナイトメアでは通常証拠2種類＋追加オーブの計3種類、証拠0ではオーブのみが出ます。男性のミミックはバンシー・ダヤンを模倣できません。模倣対象の証拠構成や強制証拠はコピーしません。",
    },
    {
      id: "twins",
      name: "ツインズ",
      english: "The Twins",
      evidence: ["emf", "freezing", "spiritBox"],
      tell: "実際には1体のゴーストで、近距離と遠距離の干渉を続けて行う能力があります。ハントの基礎速度は1.5 m/sまたは1.9 m/sで、視認でも加速します。",
      hunt: "視認加速を除いたハントごとの速度と、離れた場所での連続干渉を比較します。遠距離干渉の場所に別の個体が常駐するわけではなく、そこで氷点下やスピリットボックスの反応が出るとは限りません。",
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
      tell: "同じ部屋のボイスチャットで、ハント開始基準が通常の正気度50%から80%になります。ハント中に声・手持ち電子機器を検知できる範囲は2.5 mです。",
      hunt: "視覚は正常なので、姿が見えているのに声だけで検証しないようにします。猿の手の安全の願いを使った人には検知範囲の例外があるため、聞こえにくさの調査に注意します。",
    },
    {
      id: "yurei",
      name: "幽霊",
      english: "Yurei",
      evidence: ["dots", "orb", "freezing"],
      tell: "能力では部屋の開いたドアを滑らかに閉め、7.5 m以内のプレイヤーの正気度を15%減らします。大きな閉まる音だけでは固有能力と判定できません。",
      hunt: "スマッジが届くと90秒間、通常の徘徊とD.O.T.S.を抑え、お気に入りの部屋に戻る状態になります。イベントで部屋の外へ出る例外と、実際の徘徊を区別します。普通のドア全閉だけでも確定できません。",
    },
  ];

  const BEHAVIOR_FILTERS = [
    {
      id: "maleName",
      label: "ゴーストの名前が男性名",
      help: "ジャーナルの名前の性別表示で確認します。バンシーとダヤンを除外し、男性のミミックによる両者の模倣も除外します。名前の印象だけでは選びません。",
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
      help: "使用可能な公式の隠れ場所で、到達した瞬間に殺されず終了した場合です。自然終了・ほかの人の死亡と区別します。家具の陰や隠れ場所0の設定は対象外です。確認目的で近づける行為は危険です。",
      mode: "include",
      ghosts: ["aswang"],
    },
    {
      id: "dayanMotion",
      mimicRequiresFemale: true,
      label: "近くで歩くとゴーストが速く、止まると遅い",
      help: "10 m以内の最も近いプレイヤー（別の階も含む）について、移動2.25 m/s・静止1.2 m/sへの切り替わりを繰り返し確認した場合です。視認や電子機器による速度変化とは区別します。男性のミミックは模倣できません。",
      mode: "include",
      ghosts: ["dayan"],
    },
    {
      id: "galluProtect",
      label: "塩を踏んだ後、ほかの塩を踏まなくなった",
      help: "最初の塩の山を崩し、状態変化の2〜3秒後に未使用の別の塩を実際に通過しても崩さない場合です。防御装備を置いただけ、単に塩が残っているだけでは選びません。",
      mode: "include",
      ghosts: ["gallu"],
    },
    {
      id: "kormosAudio",
      label: "静止したプレイヤーを見失い、足音を追う",
      help: "同じ階の足音を追うか確認します。静止した人を無視するだけではバンシーの非標的などと区別できず、視線や声・電子機器の影響もあるため参考扱いです。接触すれば静止中でも殺されます。",
      mode: "hint",
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
      label: "ハント中に一瞬だけ別のモデルに変化",
      help: "単なる点滅や立ち姿・歩き方の変化ではなく、別のゴーストモデルになる場合です。紫外線の観測とは別で、証拠0でも有効です。模倣中のミミックも残ります。",
      mode: "include",
      ghosts: ["obake"],
    },
    {
      id: "obakeUv",
      requiredEvidence: "ultraviolet",
      label: "6本指などの特殊な紫外線指紋",
      help: "6本指の手形、スイッチの2本指、キーボードなどの5本指を観測した場合です。紫外線の確定も判定に反映します。モデル変化とは別で、紫外線が隠れた設定では観測できません。",
      mode: "include",
      ghosts: ["obake"],
    },
    {
      id: "goryoDots",
      mimicCanCopy: false,
      requiredEvidence: "dots",
      label: "D.O.T.S.の姿がカメラ越しでのみ見える",
      help: "全員が部屋の外へ出て、同じD.O.T.S.の出現を肉眼とビデオカメラで同時に比較した場合です。カメラで一度見ただけ、トラックでのみ観測しただけでは選びません。ミミックはD.O.T.S.を出せません。",
      mode: "include",
      ghosts: ["goryo"],
    },
    {
      id: "bansheeScream",
      mimicRequiresFemale: true,
      label: "パラボラマイクで固有の絶叫",
      help: "通常の怪音ではなくバンシー固有の絶叫です。サウンドレコーダーでも確認できます。女性のミミックは模倣でき、男性のミミックはできません。",
      mode: "include",
      ghosts: ["banshee"],
    },
    {
      id: "phantomPhoto",
      label: "イベントを正常に撮影すると姿だけが消失",
      help: "イベント中の実体を正常に撮影し、姿と機器干渉が消えても音は続く場合です。撮り損ね・自然終了・同期ずれとは区別します。D.O.T.S.写真に姿がないだけでは御霊も区別できません。",
      mode: "include",
      ghosts: ["phantom"],
    },
    {
      id: "deogenBreath",
      requiredEvidence: "spiritBox",
      label: "スピリットボックスで固有の呼吸音",
      help: "ゴーストから1 m以内でスピリットボックスが応答した際に出る、重い特殊な呼吸音です。通常のイベント音ではありません。スピリットボックスが証拠として出る設定でのみ観測できます。ミミックも模倣できます。",
      mode: "include",
      ghosts: ["deogen"],
    },
    {
      id: "polterThrow",
      label: "複数の物を同時に投げる",
      help: "ハント外で複数の小物が一斉に投げられる能力です。ハント中の連続投げ、落下・衝突でまとめて動いただけの物とは区別します。ミミックも模倣できます。",
      mode: "include",
      ghosts: ["poltergeist"],
    },
    {
      id: "mylingQuiet",
      label: "近づくまで足音が聞こえにくい",
      help: "同じ階で、足音・声の12 mと機器干渉の10 mを比較します。遮音や雷獣の15 m干渉でも似た観測になるため、ほかの候補は除外しません。",
      mode: "hint",
      ghosts: ["myling"],
    },
    {
      id: "onryoFlame",
      label: "ゴーストが炎を3回消した後にハント",
      help: "通常ハントと偶然重なるため参考扱いです。3回目で必ず即時開始するわけではなく、スマッジ・待機時間・別の炎・十字架で遅延や阻止が起こります。4 m以内の炎による防御も確認します。",
      mode: "hint",
      ghosts: ["onryo"],
    },
    {
      id: "obamboPhase",
      label: "活動量と速度が周期的に急変する",
      help: "出口を初めて開けた1分後、以後2分ごとの切り替えが目安です。活動量は平静時が高く、攻撃時が低めです。速度が変わる原因は複数あるため参考扱いです。",
      mode: "hint",
      ghosts: ["obambo"],
    },
    {
      id: "spiritSmudge",
      label: "スマッジ使用後、3分間ハントがない",
      help: "効果が新しく届いた時点から180秒を測ります。ハントしないだけでは正気度・防御装備・ランダム性と区別できません。効果中の再使用はタイマーを更新せず、呪いのハントは対象外です。",
      mode: "hint",
      ghosts: ["spirit"],
    },
    {
      id: "demonEarly",
      label: "スマッジ使用後、60〜89秒で再ハント",
      help: "新しい抑制効果が確実に届いた時点から、60秒以上90秒未満で通常ハントが始まった場合です。効果中の再使用から測ると誤判定します。呪いのハントやスマッジ不発は対象外です。",
      mode: "include",
      ghosts: ["demon"],
    },
    {
      id: "oniVisible",
      label: "姿が見えやすく、霧状のイベントがない",
      help: "霧状イベントを観測していないだけでは除外できません。デオヘンもハント中の可視時間が長めです。息の音だけは霧状イベントの証明にならないため、参考情報として扱います。",
      mode: "hint",
      ghosts: ["oni"],
    },
    {
      id: "raijuElectronics",
      label: "作動中の調査用電子機器の近くで加速",
      help: "同じ階の有効な調査装備をオン・オフにして比較します。建物の照明・投げたカメラ・未設置のセンサーなどは対象外です。視認・温度などでも加速するため参考扱いです。",
      mode: "hint",
      ghosts: ["raiju"],
    },
    {
      id: "hantuCold",
      label: "ハント中、ゴーストの頭から白い息",
      help: "ブレーカーがオフ・故障中に、ゴーストの頭付近で白い息を確認した場合です。プレイヤーの白い息や温度による速度変化だけでは選びません。氷点下の証拠とは別で、証拠0でも出ます。",
      mode: "include",
      ghosts: ["hantu"],
    },
    {
      id: "mimicOrb",
      mimicCanCopy: false,
      requiredEvidence: "orb",
      label: "設定された証拠数に加えてオーブが見える",
      help: "ナイトメアなら通常証拠2種類＋オーブの計3種類、証拠0ならオーブだけを観測した場合です。証拠数1以上でオーブがあるだけでは選びません。オーブの確定も判定に反映します。",
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
    const isMale = activeBehaviors.includes("maleName");
    for (const id of activeBehaviors) {
      const filter = behaviorById[id];
      if (!filter) continue;
      // Mimic cannot copy missing evidence or female-only ghosts when male.
      const listed = filter.ghosts.includes(ghost.id) ||
        (filter.mode === "include" && ghost.id === "mimic" && filter.mimicCanCopy !== false &&
          !(isMale && filter.mimicRequiresFemale));
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
