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
      summary: "所定の隠れ場所で接触すると、殺さずにハントを終える",
      tell: "使用可能な所定の隠れ場所にいる人へ到達すると、殺さずにハントを終了します。基礎速度は1.53 m/sで、視認すると約8.5〜8.7秒で最大2.53 m/sまで加速します。",
      hunt: "確認: ハントが隠れ場所への到達と同時に終わったかを、自然終了やほかの人の死亡と区別します。注意: 家具の陰など所定の場所以外や、隠れ場所なしの設定では保護されません。注意: この終了後の次のハントでは、開始時のプレイヤーの位置へ向かうため、退避場所を変えます。",
      source: "https://phasmopedia.com/en/ghosts/aswang/",
    },
    {
      id: "banshee",
      name: "バンシー",
      english: "Banshee",
      evidence: ["dots", "orb", "ultraviolet"],
      summary: "特定の1人を狙い、標的の正気度でハントを判断する",
      tell: "契約開始時に1人を標的にし、その人が調査エリア内にいる間は、ハント中にほかの人を追跡・殺害しません。ハント開始はチーム平均ではなく、標的の正気度50%が基準です。名前とモデルは女性のみです。",
      hunt: "確認: パラボラマイクやサウンドレコーダーで、通常の怪音とは異なる固有の絶叫を探します。注意: 標的が調査エリア外でも開始判定は標的の正気度を使いますが、ハント中は全員を狙います。注意: プレイヤーの死亡・退出で標的が変わることがあるため、ナイトメアの継続ハントでほかの人も安全とは限りません。",
      source: "https://phasmopedia.com/en/ghosts/banshee/",
    },
    {
      id: "dayan",
      name: "ダヤン",
      english: "Dayan",
      evidence: ["emf", "orb", "spiritBox"],
      summary: "近くの人が動くと速く、止まると遅くなる",
      tell: "10 m以内にいる最も近い人の移動入力で、ハント中の速度が変わります。移動中は2.25 m/s、静止中は1.2 m/sになり、別の階の人も判定対象です。ハント開始の基準は、近くの人が移動中なら65%、静止中なら45%、範囲内に誰もいなければ50%です。",
      hunt: "確認: 速度変化が視認ではなく、最も近い人の移動・静止に対応しているか比較します。注意: 10 m以内に誰もいないと通常速度と視認加速に戻り、蓄積した加速が適用されることがあります。注意: 名前とモデルは女性のみですが、女性名だけでは種類を絞れません。",
      source: "https://phasmopedia.com/en/ghosts/dayan/",
    },
    {
      id: "deildegast",
      name: "ディルデガスト",
      english: "Deildegast",
      evidence: ["dots", "emf", "writing"],
      summary: "ハント外で異なる物を操作すると、次のハントが遅くなる",
      tell: "ハント外にプレイヤーが異なる小物やスイッチなどを操作すると、次のハントの速度が下がります。3 m/sから対象1つにつき0.1 m/s下がり、最小0.4 m/sで、視認では加速しません。死亡したプレイヤーの操作も有効です。",
      hunt: "確認: 小物・照明スイッチ・ブレーカー・蛇口など、異なる対象を操作した前後の速度を比べます。注意: 同じ対象の繰り返し、ドア、調査装備、呪いのアイテムは減速数に加算されません。注意: ハント終了や十字架の消費で減速数がリセットされるため、その後は操作し直します。",
      source: "https://phasmopedia.com/en/ghosts/deildegast/",
    },
    {
      id: "demon",
      name: "デーモン",
      english: "Demon",
      evidence: ["writing", "ultraviolet", "freezing"],
      summary: "高い正気度でもハントし、スマッジの抑制が短い",
      tell: "通常ハントの基準は正気度70%で、能力では正気度に関係なくハントを試みます。スマッジによる通常ハント抑制は60秒、ハント後の待機は最短20秒です。十字架の有効範囲は通常の1.5倍です。",
      hunt: "確認: スマッジの新しい効果が確実に届いてから、60秒以上90秒未満で通常ハントが始まったかを測ります。注意: 効果中の再使用では抑制タイマーは更新されず、不発や呪いのハントは判定に使えません。注意: 正気度が高くても安全とは限らないため、十字架と退路を早めに準備します。",
      source: "https://phasmopedia.com/en/ghosts/demon/",
    },
    {
      id: "deogen",
      name: "デオヘン",
      english: "Deogen",
      evidence: ["dots", "writing", "spiritBox"],
      forced: "spiritBox",
      summary: "ハント中は隠れても見つかるが、近づくと大きく減速する",
      tell: "ハント中は隠れている人の位置も把握して追跡します。遠距離では最大3 m/s、近距離では最小0.4 m/sになり、視認による加速はありません。通常ハントの基準は正気度40%です。",
      hunt: "確認: 遠くでは速く、追跡相手に接近すると極端に遅くなる動きを観察します。確認: 1 m以内でスピリットボックスが応答すると、固有の重い呼吸音が出ることがあります。注意: 証拠数1以上ではボックスは隠れず、証拠0では呼吸音を使えません。注意: 隠れるだけでは防げないため、行き止まりを避け、回り続けられる経路を確保します。",
      source: "https://phasmopedia.com/en/ghosts/deogen/",
    },
    {
      id: "gallu",
      name: "ガルル",
      english: "Gallu",
      evidence: ["emf", "ultraviolet", "spiritBox"],
      summary: "防御装備の効果を受けると状態が変わり、激昂中は塩を踏まない",
      tell: "通常・激昂・疲弊の3状態を持ち、十字架の消費、スマッジの効果、塩を踏むことで通常→激昂、疲弊→通常へ変化します。激昂状態でハントが終わると疲弊し、激昂中は塩を踏みません。開始正気度と基礎速度は通常50%・1.7 m/s、激昂60%・1.955 m/s、疲弊40%・1.36 m/sです。",
      hunt: "確認: 最初の塩を踏んだ後、未使用の別の塩を通過しても踏まなくなるかを観察します。注意: 装備を置くだけでは状態は変わらず、塩では2〜3秒の遅れがあります。注意: ハント中のスマッジでは目くらましが終わってから変化し、各状態で視認加速も起こります。",
      source: "https://phasmopedia.com/en/ghosts/gallu/",
    },
    {
      id: "goryo",
      name: "御霊",
      english: "Goryo",
      evidence: ["dots", "emf", "ultraviolet"],
      forced: "dots",
      summary: "D.O.T.S.の人影がカメラ越しでだけ見える",
      tell: "お気に入りの部屋に誰もいないときにD.O.T.S.状態になり、その人影はビデオカメラ越しでのみ見えます。証拠数1以上ならD.O.T.S.は隠れません。通常の徘徊ではお気に入りの部屋を変更しません。",
      hunt: "確認: 全員が部屋の外へ出て、同じD.O.T.S.の出現を肉眼とカメラで同時に比べます。注意: カメラで一度見ただけでは判定できず、イベントやハントの実体は肉眼でも見えます。注意: 猿の手の正気度の願いによる部屋変更は、通常の部屋変更とは別の例外です。",
      source: "https://phasmopedia.com/en/ghosts/goryo/",
    },
    {
      id: "hantu",
      name: "ハントゥ",
      english: "Hantu",
      evidence: ["orb", "ultraviolet", "freezing"],
      forced: "freezing",
      summary: "寒い部屋ほど速く、ハント中の白い息が手掛かりになる",
      tell: "ハント中の速度は通過する部屋の温度に応じて約1.4〜2.7 m/sになり、視認では加速しません。ブレーカーがオフ・故障中は、ハント中にゴーストの頭付近から白い息が出ます。自分でブレーカーをオンにせず、証拠数1以上なら氷点下は隠れません。",
      hunt: "確認: 寒い部屋と暖かい部屋での足音の速さや、頭付近の白い息を比較します。注意: ゴーストの白い息は氷点下の証拠とは別の能力で、証拠0でも出ます。注意: プレイヤー自身の白い息や、単なる速度変化だけで断定しません。",
      source: "https://phasmopedia.com/en/ghosts/hantu/",
    },
    {
      id: "jinn",
      name: "ジン",
      english: "Jinn",
      evidence: ["emf", "ultraviolet", "freezing"],
      summary: "ブレーカーがオンのとき、遠くに見える人へ急加速する",
      tell: "ブレーカーがオンで、3 mより遠い人を視認すると2.5 m/sで追跡します。電源が入っていると、同室または3 m以内の人の正気度を25%減らす能力も使います。自分でブレーカーをオフにはしませんが、照明の過負荷で落ちる場合はあります。",
      hunt: "確認: 電源・視線・距離の3条件がそろったときの加速を、ほかの速度変化と区別します。確認: 正気度低下能力では、ブレーカーを切らずにその場所へEMF反応を残すことがあります。注意: ブレーカーをオフにすると固有能力を抑えられますが、通常の視認加速まで消えるわけではありません。",
      source: "https://phasmopedia.com/en/ghosts/jinn/",
    },
    {
      id: "kormos",
      name: "コルモス",
      english: "Kormos",
      evidence: ["orb", "spiritBox", "ultraviolet"],
      summary: "ハント中は視覚が弱い一方、同じ階の足音を遠くまで追う",
      tell: "ハント中は同じ階の足音を、しゃがみ歩き10 m・通常歩き15 m・走行30 mまで検知します。5 m以内で遮蔽物なく実際に足音を立てると、視認したように追跡・加速します。通常ハントの基準は正気度50%、同じ部屋で走る人がいると70%です。",
      hunt: "確認: 動く人の足音に反応するかを、視線や声・電子機器による検知と区別します。注意: 静止した人を無視しただけでは、バンシーの非標的などと区別できません。注意: 声や電子機器も検知し、静止中でも接触すれば殺されるため、安全確認のために近づけないでください。",
      source: "https://phasmopedia.com/en/ghosts/kormos/",
    },
    {
      id: "mare",
      name: "メアー",
      english: "Mare",
      evidence: ["writing", "orb", "spiritBox"],
      summary: "部屋の明かりを嫌い、暗い部屋ではハントしやすい",
      tell: "通常の部屋照明を自分では点けず、近くで点けた照明をほぼ即座に消すことがあります。ハント開始の基準は、ゴーストがいる部屋の照明がオフなら正気度60%、オンなら40%です。懐中電灯や炎はこの照明判定に含まれません。",
      hunt: "確認: 照明を点けた直後の消灯が繰り返されるかを観察します。注意: 偶然の消灯や消灯回数の多さだけでは確定できず、自動点灯する照明も通常のスイッチ操作と区別します。注意: お気に入りの部屋ではなく、現在ゴーストがいる部屋の照明が基準です。",
      source: "https://phasmopedia.com/en/ghosts/mare/",
    },
    {
      id: "moroi",
      name: "モーロイ",
      english: "Moroi",
      evidence: ["writing", "freezing", "spiritBox"],
      forced: "spiritBox",
      summary: "呪いで正気度を削り、平均正気度が下がるほど速くなる",
      tell: "ボックスの応答、パラボラマイクの怪音、サウンドレコーダーの録音操作でプレイヤーを呪います。呪われると正気度の自然減少が速くなり、照明の保護も無効になりますが、回復薬で解除できます。ハントの基礎速度は平均正気度に応じて約1.5〜2.25 m/sとなり、視認でも加速します。",
      hunt: "確認: 正気度の変化とハント速度の対応を比べます。確認: ハント中のスマッジの目くらましは7秒で、通常の5秒より長めです。注意: 証拠数1以上ではスピリットボックスは隠れず、録音操作は録音に成功しなくても呪いの契機になります。",
      source: "https://phasmopedia.com/en/ghosts/moroi/",
    },
    {
      id: "myling",
      name: "マイリング",
      english: "Myling",
      evidence: ["writing", "emf", "ultraviolet"],
      summary: "ハント音が近距離まで聞こえず、マイクの怪音が多い",
      tell: "ハント中の足音・声が聞こえる距離は12 mで、多くのゴーストの20 mより短くなります。ハント外では、パラボラマイクやサウンドレコーダーで怪音を出す頻度が高めです。",
      hunt: "確認: 同じ階で、足音が聞こえ始める位置と機器干渉の10 mを比較します。注意: 音を聞き逃しただけや別の階の遮音は判定に使えません。注意: 雷獣は15 mから機器に干渉するため、足音より先に干渉が出たことだけでは断定しません。",
      source: "https://phasmopedia.com/en/ghosts/myling/",
    },
    {
      id: "obake",
      name: "化け狐",
      english: "Obake",
      evidence: ["emf", "orb", "ultraviolet"],
      forced: "ultraviolet",
      summary: "特殊な指紋を残し、ハント中に一瞬だけ別の姿になる",
      tell: "6本指などの特殊な紫外線指紋を残すことがあり、指紋を残さない干渉や残り時間を短くする能力もあります。ハント中には、一瞬だけ別のゴーストモデルへ変化します。証拠数1以上なら紫外線は隠れません。",
      hunt: "確認: ドアやスイッチに触れた直後に、指紋の形を繰り返し確認します。確認: ハント中は単なる点滅・姿勢変化ではなく、別モデルへの変化を見ます。注意: 紫外線が出る設定でも毎回指紋を残すとは限らず、短いハントではモデル変化を観測できない場合があります。",
      source: "https://phasmopedia.com/en/ghosts/obake/",
    },
    {
      id: "obambo",
      name: "オバンボ",
      english: "Obambo",
      evidence: ["writing", "ultraviolet", "dots"],
      summary: "平静と攻撃を周期的に切り替え、ハント中にも速さが変わる",
      tell: "平静状態で始まり、出口を初めて解錠した1分後に攻撃状態へ、その後は2分ごとに切り替わります。平静時は正気度10%・基礎速度1.445 m/s、攻撃時は65%・1.955 m/sで、視認加速もあります。干渉やイベントの活動量は、平静時のほうが高くなります。",
      hunt: "確認: ハント中も起きる速度変化と、出口の解錠からの周期を照合します。確認: 攻撃状態で始まるハントは、通常より持続時間が20%短くなります。注意: 静かになったから安全とは限らず、視認・電子機器・温度などによる速度変化とも区別します。",
      source: "https://phasmopedia.com/en/ghosts/obambo/",
    },
    {
      id: "oni",
      name: "鬼",
      english: "Oni",
      evidence: ["dots", "emf", "freezing"],
      summary: "ハント中の姿が見えやすく、実体化イベントで正気度を多く削る",
      tell: "近くに人がいると活発になり、ハント中は姿が見えている時間が長めです。霧状のゴーストイベントは起こしません。イベントで接触すると、正気度を通常の10%ではなく20%減らします。",
      hunt: "確認: ハント中の点滅で、姿が見えている時間を比較します。注意: デオヘンも見えやすいため、それだけでは確定できません。注意: 息を吹きかける音は別のイベントでも出るため、霧状イベントの姿を確認せずに鬼を除外しません。",
      source: "https://phasmopedia.com/en/ghosts/oni/",
    },
    {
      id: "onryo",
      name: "怨霊",
      english: "Onryo",
      evidence: ["orb", "freezing", "spiritBox"],
      summary: "炎がハントを防ぐ一方、3回消火すると能力ハントを試みる",
      tell: "通常ハントの基準は正気度60%、4 m以内に炎があると40%です。近くの炎は十字架より優先してハントを防ぎます。ゴーストが炎を3回消すたびに、正気度に関係なくハントを試みます。",
      hunt: "確認: ゴーストによる消火回数と、炎・十字架の位置を記録します。注意: 3回目の消火後に必ず即座に始まるわけではなく、スマッジ・待機時間・別の炎・十字架で遅延や阻止が起こります。注意: 通常ハントとの偶然の一致もあるため、消火後にハントしたことだけでは確定しません。",
      source: "https://phasmopedia.com/en/ghosts/onryo/",
    },
    {
      id: "phantom",
      name: "ファントム",
      english: "Phantom",
      evidence: ["dots", "ultraviolet", "spiritBox"],
      summary: "撮影で姿が消え、ハント中も見えない時間が長い",
      tell: "イベントやD.O.T.S.の姿を有効な写真に収めると姿が消え、動画の撮影完了でも消失します。写真には実体や機器干渉が写りません。ハント中は点滅の間隔が長く、姿を見失いやすくなります。イベントやハントで近くから見ると、追加の正気度低下も起こります。",
      hunt: "確認: イベントを正常に撮影し、姿と機器干渉が消えてもイベント音が続くかを見ます。注意: 撮り損ね・自然終了・同期ずれは消失と区別し、D.O.T.S.写真に姿がないだけでは御霊も区別できません。注意: ハント中に撮影してもハント自体は止まりません。",
      source: "https://phasmopedia.com/en/ghosts/phantom/",
    },
    {
      id: "poltergeist",
      name: "ポルターガイスト",
      english: "Poltergeist",
      evidence: ["writing", "ultraviolet", "spiritBox"],
      summary: "複数の小物を同時に動かし、周囲の正気度も下げる",
      tell: "ハント外に複数の小物を一斉に浮かせたり投げたりする能力を持ち、同じ部屋の人の正気度を下げます。ハント中も小物を頻繁に、強く投げます。投げる物がない場所では、この特徴は現れにくくなります。",
      hunt: "確認: 活動地点に複数の小物をまとめて置き、同時に浮く・飛ぶかを観察します。注意: ハント外の同時操作と、ハント中の連続投げは別の観測です。注意: 単発の強い投げや、物同士の衝突でまとめて動いただけでは確定しません。",
      source: "https://phasmopedia.com/en/ghosts/poltergeist/",
    },
    {
      id: "raiju",
      name: "雷獣",
      english: "Raiju",
      evidence: ["dots", "emf", "orb"],
      summary: "作動中の調査用電子機器の近くで速くなり、早くハントする",
      tell: "同じ階の有効な調査用電子機器が作動している近くでは、ハント速度が2.5 m/sになります。ハント開始の基準も通常の正気度50%から65%へ上がります。機器への干渉範囲は、通常の10 mより広い15 mです。",
      hunt: "確認: 有効な機器をオン・オフにして、付近での速度を比較します。注意: 建物の照明やブレーカー、床に投げたカメラ、未設置のセンサーなどは加速の対象外です。注意: 機器を置くだけでは不十分で、視認・温度・人の移動による加速とも区別します。",
      source: "https://phasmopedia.com/en/ghosts/raiju/",
    },
    {
      id: "revenant",
      name: "レヴナント",
      english: "Revenant",
      evidence: ["writing", "orb", "freezing"],
      summary: "人を検知するまでは遅く、検知すると急に速くなる",
      tell: "人を検知していない徘徊中は1 m/s、視認・声・電子機器で検知すると3 m/sになります。見失っても、最後に検知した位置までは高速のまま進みます。そこへ到達してから約2.7秒かけて徘徊速度へ戻ります。",
      hunt: "確認: 未検知時の遅い足音と、検知後の急加速を比較します。注意: 視線を切った瞬間には減速せず、接近するほど遅くなるデオヘンとも動きが異なります。注意: 検証のために追わせず、スマッジで距離を取り、声と電子機器を止めて退避します。",
      source: "https://phasmopedia.com/en/ghosts/revenant/",
    },
    {
      id: "shade",
      name: "シェード",
      english: "Shade",
      evidence: ["writing", "emf", "freezing"],
      summary: "ゴーストと同じ部屋に人がいると、通常の活動を抑える",
      tell: "ゴーストと同じ部屋に1人でもいると、通常の干渉・イベント・ハント開始を抑えます。単に距離が近いことや、複数人であることが条件ではありません。通常ハントの基準は正気度35%です。",
      hunt: "確認: ゴーストがいる部屋と、人がいる部屋を分けて活動を観察します。注意: 無人の隣室からこちらの部屋の物へ干渉することがあり、お気に入りの部屋に滞在するだけでは安全とは限りません。注意: 静かだったことやハントがなかったことだけでは確定せず、呪いのハントも別に扱います。",
      source: "https://phasmopedia.com/en/ghosts/shade/",
    },
    {
      id: "spirit",
      name: "スピリット",
      english: "Spirit",
      evidence: ["writing", "emf", "spiritBox"],
      summary: "スマッジによる通常ハントの抑制が180秒と長い",
      tell: "スマッジの新しい効果が届いてから180秒間、通常ハントを抑制します。多くのゴーストの90秒、デーモンの60秒より長く、それ以外の基本的な挙動は標準的です。",
      hunt: "確認: 点火した時刻ではなく、効果が確実に届いた時点から次の通常ハントまでを測ります。注意: 効果中の再使用は抑制タイマーを更新せず、呪いのハントは抑制できません。注意: 有効な効果から180秒より早い通常ハントは否定材料ですが、180秒間ハントがないだけでは確定しません。",
      source: "https://phasmopedia.com/en/ghosts/spirit/",
    },
    {
      id: "thaye",
      name: "セーイ",
      english: "Thaye",
      evidence: ["dots", "writing", "orb"],
      summary: "近くに人がいると老化し、徐々に遅く・消極的になる",
      tell: "若い状態では活発で、基礎速度は2.75 m/s、通常ハントの基準は正気度約75%です。同室または3 m以内に人がいると定期的な老化判定が進み、最終的に1 m/s・正気度約15%まで弱くなります。視認による加速はありません。",
      hunt: "確認: 近くで調査した前後で、ハントごとの基礎速度が遅くなるかを比較します。注意: 経過時間だけで必ず老化するわけではなく、ハント中の老化による速度変化は終了後に反映されます。注意: 初期は高い正気度でもハントするため、老化させる目的で無防備に近づきません。",
      source: "https://phasmopedia.com/en/ghosts/thaye/",
    },
    {
      id: "mimic",
      name: "ミミック",
      english: "The Mimic",
      evidence: ["ultraviolet", "freezing", "spiritBox"],
      extraEvidence: ["orb"],
      summary: "ほかの種類の行動を模倣するが、追加オーブは常に出る",
      tell: "ほかのゴーストの速度・ハント条件・能力を模倣し、ハント外に模倣対象を切り替えます。通常証拠や強制証拠は模倣せず、自分の証拠構成は変わりません。設定された通常証拠数とは別に、オーブが追加で出ます。",
      hunt: "確認: ナイトメアでは通常証拠2種類と追加オーブの計3種類、証拠0ではオーブだけが出る点を照合します。注意: オーブがあるだけでは確定できず、1回のハント中に模倣対象が切り替わるわけでもありません。注意: 男性のミミックはバンシー・ダヤンを模倣できず、御霊のD.O.T.S.も再現できません。",
      source: "https://phasmopedia.com/en/ghosts/the-mimic/",
    },
    {
      id: "twins",
      name: "ツインズ",
      english: "The Twins",
      evidence: ["emf", "freezing", "spiritBox"],
      summary: "1体で離れた場所にも干渉し、ハントごとに速度が変わる",
      tell: "実際は1体のゴーストで、近距離と遠距離の干渉を続けて行う能力があります。ハントごとに基礎速度が約1.5 m/sまたは約1.9 m/sになり、視認でも加速します。遠距離の干渉地点付近からハントを始める場合もあります。",
      hunt: "確認: 離れた場所での連続干渉と、視認加速を除いたハントごとの速度を比較します。注意: 遠距離の干渉地点に別の個体が常駐するわけではなく、そこで氷点下やボックスの反応が出るとは限りません。注意: 速度差だけで断定せず、正気度や状態によって速さが変わるほかの候補も比較します。",
      source: "https://phasmopedia.com/en/ghosts/the-twins/",
    },
    {
      id: "wraith",
      name: "レイス",
      english: "Wraith",
      evidence: ["dots", "emf", "spiritBox"],
      summary: "塩の山を崩さず、ハント外に人の近くへテレポートする",
      tell: "塩の山を通過しても崩しません。ハント外にプレイヤーの近くへテレポートし、移動先にEMF反応を残すことがあります。壁を透視したり、ハント中に壁をすり抜けたりする性質ではありません。",
      hunt: "確認: 実際に通過した未使用の塩の山が崩れないかを観察します。注意: 紫外線で足跡が見えないこととは別の判定です。注意: 激昂中のガルルや模倣中のミミックも塩を踏まないため、これだけではレイスと断定しません。",
      source: "https://phasmopedia.com/en/ghosts/wraith/",
    },
    {
      id: "yokai",
      name: "妖怪",
      english: "Yokai",
      evidence: ["dots", "orb", "spiritBox"],
      summary: "ハント外では声で活発になり、ハント中は声を検知しにくい",
      tell: "同じ部屋でボイスチャットを使うと、ハント開始の基準が通常の正気度50%から80%へ上がります。ハント中に声や手持ち電子機器を検知できる範囲は2.5 mと狭い一方、視覚は正常です。",
      hunt: "確認: ハント中に声へ反応しにくいかを、視線やほかのプレイヤーへの追跡と区別します。注意: 見えている人は普通に追跡するため、声だけで安全を確かめようとしません。注意: 猿の手の安全の願いを使った人には検知範囲の例外があります。",
      source: "https://phasmopedia.com/en/ghosts/yokai/",
    },
    {
      id: "yurei",
      name: "幽霊",
      english: "Yurei",
      evidence: ["dots", "orb", "freezing"],
      summary: "ドアを閉めて正気度を下げ、スマッジ後は徘徊を抑える",
      tell: "能力で部屋の開いたドアを完全に閉め、7.5 m以内のプレイヤーの正気度を15%減らします。スマッジが届くと90秒間、通常の徘徊とD.O.T.S.を抑え、お気に入りの部屋に戻る状態になります。",
      hunt: "確認: ドアの動きと正気度の低下、スマッジ後の通常の移動を組み合わせて観察します。注意: ドアが完全に閉まったことや閉まる音だけでは断定できず、音の遅延も固有能力の根拠にはしません。注意: イベントによる部屋の外への移動と、スマッジで抑えられる通常の徘徊は区別します。",
      source: "https://phasmopedia.com/en/ghosts/yurei/",
    },
  ];

  const BEHAVIOR_FILTERS = [
    {
      id: "breakerOn",
      label: "ゴーストがブレーカーをオンにした",
      help: "誰も操作していないブレーカーが、ゴーストの干渉でオフからオンになったことを確認します。ハントゥを除外できます。開始時からオンだった場合や、単なる機器干渉では選びません。ミミックは残ります。",
      mode: "exclude",
      ghosts: ["hantu"],
    },
    {
      id: "breakerOff",
      label: "ゴーストがブレーカーを直接オフにした",
      help: "ゴースト自身によるブレーカーの操作を確認した場合にジンを除外します。プレイヤーの操作、照明の点けすぎによる過負荷、故障、イベント中の一時的な消灯は含めません。原因が不明な停電では選びません。ミミックは残ります。",
      mode: "exclude",
      ghosts: ["jinn"],
    },
    {
      id: "lightOn",
      label: "ゴーストが通常の部屋照明を点けた",
      help: "ハント・イベントの外で、ゴーストが通常の照明スイッチをオフからオンにした場合にメアーを除外します。自動点灯、プレイヤーの操作、イベントによる変化、テレビなどの家電は含めません。ミミックは残ります。",
      mode: "exclude",
      ghosts: ["mare"],
    },
    {
      id: "saltStepped",
      label: "ゴーストが未使用の塩を踏んだ",
      help: "通過によって塩の山が崩れたことを確認します。レイスを除外できますが、通常・疲弊状態のガルルやミミックは残ります。紫外線の足跡を確認できたかどうかとは別です。同期ずれが疑われる場合はホスト視点でも照合します。",
      mode: "exclude",
      ghosts: ["wraith"],
    },
    {
      id: "incenseBefore180",
      label: "有効なスマッジの90〜179秒後に通常ハント",
      help: "新しいスマッジの効果が確実に届いた時点から90秒以上180秒未満で通常ハントが始まった場合に、スピリットを除外します。点火時刻からの計測、不発、効果中の重ねがけ、呪いのハントは判定に使いません。ミミックは残ります。",
      mode: "exclude",
      ghosts: ["spirit"],
    },
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
      help: "10 m以内の最も近いプレイヤー（別の階も含む）について、移動入力あり2.25 m/s・静止1.2 m/sへの切り替わりを繰り返し確認した場合です。壁に向かう移動入力も含み、視点を回すだけなら静止扱いです。視認や電子機器による速度変化とは区別します。男性のミミックは模倣できません。",
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
      label: "複数の物を同時に浮かせる・投げる",
      help: "ハント外で複数の小物が一斉に浮く・投げられる能力です。ハント中の連続投げ、落下・衝突でまとめて動いただけの物とは区別します。ミミックも模倣できます。",
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
      help: "出口を初めて解錠した1分後、以後2分ごとの切り替えが目安です。活動量は平静時が高く、攻撃時が低めです。速度が変わる原因は複数あるため参考扱いです。",
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
        <p class="ghost-note"><strong>${ghost.summary}</strong></p>
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
