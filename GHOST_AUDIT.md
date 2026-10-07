# ゴースト・行動フィルター全件監査

確認日: 2026-10-07 / 仕様確認対象: v0.19.0.2 / ゴースト30種類

## 確認範囲と限界

`app.js` の全30種類の「特徴」「調査のポイント」、証拠構成、強制証拠、追加オーブ、および既存22項目の行動フィルターの説明と実際の候補判定を確認しました。特殊指紋とモデル変化を分離したため、更新後のフィルターは23項目です。

公式更新履歴でバージョンと変更告知を確認し、能力の詳細は各ゴーストの仕様資料と照合しました。公式パッチノートはすべての内部仕様を列挙しているわけではありません。以下は資料照合とプログラムの検証結果であり、今回ゲーム内で実測した結果ではありません。

- [公式ニュース](https://kineticgames.co.uk/news)と[v0.19.0.2更新履歴](https://kineticgames.co.uk/news/phasmophobia-v01902-patch-notes): 確認時点で公開されている最新の詳細パッチノート。
- [Crimson Eye予告](https://kineticgames.co.uk/news/the-crimson-eye-approaches-once-more): イベント用パッチは10月7日配信予定、イベントは10月8日開始と告知されています。予告をリリース済みの仕様変更と混同せず、詳細未確認の変更は組み込んでいません。
- [v0.19.0.0更新履歴](https://kineticgames.co.uk/news/phasmophobia-v01900-quality-of-life-part-2): 鬼の歌唱イベントの正気度低下20%への修正と、幽霊の能力に誤認されていたドア音の遅延修正を確認。
- 速度はゴースト速度100%・イベント補正なしの値です。基礎速度と視認加速を区別しています。正気度の基準は通常ハントについての値で、バンシー以外は原則チーム平均です。呪いのハント・猿の手の願い・マルチプレイ同期の例外には注意が必要です。
- 出典のPhasmopediaは、Phasmophobia Wikiの各記事を出典・版・著者へのリンク付きで整理した非公式資料です。各記事はv0.19.0.2対応と明記しています。Wikiを直接取得できなかった記事は、この公開資料を参照しました。

## ゴースト30種類

全30種類の証拠構成は従来データと一致しました。修正は主に能力の発動条件・例外・調査手順の不足です。「条件補足」は元の説明の主旨は正しくても、実際の判定に必要な制約を追加したものです。

| ID | ゴースト | 結果・確認した重要条件 | 出典 |
| --- | --- | --- | --- |
| `aswang` | アスワング | 条件補足。公式かつ使用可能な隠れ場所限定。隠れ場所0や家具の陰は保護対象外。次回は開始時にプレイヤーの位置を把握して追跡。基礎1.53、最大2.53 m/s。 | [Aswang](https://phasmopedia.com/en/ghosts/aswang/) |
| `banshee` | バンシー | 条件補足。標的の正気度50%で判定。標的が調査エリア外なら全員を追う。名前・モデルとも女性のみ。固有絶叫は録音機でも観測可能。 | [Banshee](https://phasmopedia.com/en/ghosts/banshee/) |
| `dayan` | ダヤン | 条件補足。10 m以内の最も近い人の移動で65%・2.25 m/s、静止で45%・1.2 m/s。別階も対象。範囲外は50%・通常速度で、蓄積した視認加速が適用される。 | [Dayan](https://phasmopedia.com/en/ghosts/dayan/) |
| `deildegast` | Deildegast | 修正。異なる対象1つにつき0.1 m/s減速、3→最小0.4 m/s。スイッチ等も対象、ドア・装備・呪いのアイテムは対象外。死亡プレイヤーも有効。十字架消費とハント終了でリセット。 | [Deildegast](https://phasmopedia.com/en/ghosts/deildegast/)、[識別ガイド](https://steamcommunity.com/sharedfiles/filedetails/?id=3635613545&l=english) |
| `demon` | デーモン | 条件補足。通常70%、能力は正気度不問。スマッジ60秒、ハント後最短20秒。十字架の範囲拡大は正しい。再スマッジによるタイマー更新と呪いのハントを混同しない。 | [Demon](https://phasmopedia.com/en/ghosts/demon/) |
| `deogen` | デオヘン | 条件補足。通常40%、距離依存0.4〜3 m/s。全員の位置を把握し、隠れるだけでは防げない。特殊Box呼吸は1 m以内で応答した場合。Box強制。 | [Deogen](https://phasmopedia.com/en/ghosts/deogen/) |
| `gallu` | ガルル | 修正。装備の設置ではなく実際の防御効果で通常→激昂／弱体化→通常。激昂でハントが終わった場合だけ弱体化。塩の状態変化は2〜3秒遅延。50/60/40%・1.7/1.955/1.36 m/sは正しい。 | [Gallu](https://phasmopedia.com/en/ghosts/gallu/) |
| `goryo` | 御霊 | 条件補足。同室に人がいないときのDOTSを肉眼・カメラで同時比較。通常の部屋変更なし、猿の手の正気度の願いは例外。イベント・ハントは肉眼でも見える。DOTS強制。 | [Goryo](https://phasmopedia.com/en/ghosts/goryo/) |
| `hantu` | ハントゥ | 条件補足。温度依存で視認加速なし。ブレーカーオフ・故障中の頭付近の息は証拠0でも出る能力で、氷点下証拠やプレイヤーの息とは別。氷点下強制。 | [Hantu](https://phasmopedia.com/en/ghosts/hantu/)、[Wiki](https://phasmophobia.fandom.com/wiki/Hantu) |
| `jinn` | ジン | 条件補足。ブレーカーオン・視認・距離3 m超で2.5 m/s。電源オフでも通常視認加速は残る。直接オフにはしないが照明の過負荷は可能。正気度低下能力25%。 | [Jinn](https://phasmopedia.com/en/ghosts/jinn/) |
| `kormos` | コルモス | 修正。同室の走行で70%。足音検知は同じ階のしゃがみ10・歩き15・走行30 m。5 m以内で遮蔽物なく移動すると追跡。声・電子機器も検知し、静止していても接触で死亡。 | [Kormos](https://phasmopedia.com/en/ghosts/kormos/) |
| `mare` | メアー | 条件補足。ゴーストがいる部屋の照明で60/40%。懐中電灯・炎は対象外。照明を自分で点けない。単なる消灯の多さは確定材料ではない。 | [Mare](https://phasmopedia.com/en/ghosts/mare/) |
| `moroi` | モーロイ | 条件補足。呪いの契機はBox・パラボラ怪音・録音操作。照明の保護を無効化、回復薬で解除。平均正気度と視認で加速。スマッジ目くらまし7秒。Box強制。 | [Moroi](https://phasmopedia.com/en/ghosts/moroi/) |
| `myling` | マイリング | 条件補足。ハント音12 mと干渉10 mの比較。同じ階で検証し、雷獣の15 m干渉や遮音も考慮。怪音が多い説明は正しい。 | [Myling](https://phasmopedia.com/en/ghosts/myling/) |
| `obake` | 化け狐 | 条件補足・フィルター分離。特殊UV指紋と非証拠のモデル変化を別扱いに。UV強制でも毎回指紋を残すわけではない。指紋の残り時間短縮、短いハントの変化未観測にも注意。 | [Obake](https://phasmopedia.com/en/ghosts/obake/) |
| `obambo` | オバンボ | 条件補足。初期平静→最初の出口開放1分後に攻撃→以後2分交代。平静時のほうが活動量は高い。10/65%・1.445/1.955 m/s・攻撃開始ハント20%短縮は正しい。 | [Obambo](https://phasmopedia.com/en/ghosts/obambo/) |
| `oni` | 鬼 | 修正。正気度20%低下はイベント接触の性質で、ハントの見えやすさとは別。霧状イベントを起こさないが、追跡イベントで息の音は出せる。 | [Oni](https://phasmopedia.com/en/ghosts/oni/)、[公式v0.19.0.0](https://kineticgames.co.uk/news/phasmophobia-v01900-quality-of-life-part-2) |
| `onryo` | 怨霊 | 条件補足。通常60%、炎4 m以内では40%。3回消火で能力ハントを試みるが即時開始は保証されない。別の炎・十字架・スマッジ等で阻止可能。炎は十字架より優先。 | [Onryo](https://phasmopedia.com/en/ghosts/onryo/)、[Wiki](https://phasmophobia.fandom.com/wiki/Onryo) |
| `phantom` | ファントム | 条件補足。正常撮影による消失と自然終了・同期ずれを区別。DOTS写真の実体不在だけは御霊でも起きる。ハントは撮影で終了しない。 | [Phantom](https://phasmopedia.com/en/ghosts/phantom/) |
| `poltergeist` | ポルターガイスト | 条件補足。ハント外の一斉投げとハント中の連続投げ、物理衝突を区別。単発の強い投げだけでは確定しない。一斉投げと正気度低下の説明は正しい。 | [Poltergeist](https://phasmopedia.com/en/ghosts/poltergeist/) |
| `raiju` | 雷獣 | 修正。作動中かつ有効な調査用電子機器・同じ階が条件。建物の電気や投げたカメラ等は対象外。近傍2.5 m/s・65%、干渉15 m。単に機器付近で速い観測は参考へ。 | [Raiju](https://phasmopedia.com/en/ghosts/raiju/) |
| `revenant` | レヴナント | 修正。検知後3 m/sは視線が切れても最後の検知地点まで持続。その後約2.7秒で徘徊1 m/sへ減速。声・電子機器の検知でも高速化。 | [Revenant](https://phasmopedia.com/en/ghosts/revenant/) |
| `shade` | シェード | 修正。抑制条件は人数や単なる近距離ではなく、ゴーストと同じ部屋に1人以上。隣室からの干渉は可能。通常35%、お気に入りの部屋に滞在するだけでは防御にならない。 | [Shade](https://phasmopedia.com/en/ghosts/shade/) |
| `spirit` | スピリット | 条件補足。効果が新しく届いてから通常ハント180秒抑制。効果中の再使用はタイマー更新なし。180秒待っても確定ではなく、呪いのハントは別。 | [Spirit](https://phasmopedia.com/en/ghosts/spirit/) |
| `thaye` | セーイ | 条件補足。同室または3 m以内の人が老化判定の条件。単なる経過時間ではない。2.75→最小1 m/sで視認加速なし。ハント中の老化は終了後に速度へ反映。 | [Thaye](https://phasmopedia.com/en/ghosts/thaye/) |
| `mimic` | ミミック | 判定修正。男性の場合はバンシー／ダヤンを模倣不可。通常証拠・強制証拠は模倣しない。追加オーブと御霊DOTSの模倣不可は従来判定を維持。 | [The Mimic](https://phasmopedia.com/en/ghosts/the-mimic/)、[Wiki](https://phasmophobia.fandom.com/wiki/The_Mimic) |
| `twins` | ツインズ | 条件補足。ゲーム上は1体。ハント基礎1.5/1.9 m/sで視認加速あり。遠距離干渉地点に別個体が常駐するわけではない。 | [The Twins](https://phasmopedia.com/en/ghosts/the-twins/) |
| `wraith` | レイス | 誤りなし。塩の山を崩すかとUV足跡の有無を区別。激昂ガルル・ミミックを残す。テレポートのEMFと塩を踏まない性質を確認。 | [Wraith](https://phasmopedia.com/en/ghosts/wraith/) |
| `yokai` | 妖怪 | 条件補足。同室の声で通常50→80%。ハント中は声・手持ち電子機器の検知2.5 m、視覚は正常。猿の手の安全の願いを使った人には例外。 | [Yokai](https://phasmopedia.com/en/ghosts/yokai/) |
| `yurei` | 幽霊 | 修正。能力のドア閉鎖は滑らかで、大きな閉鎖音は確定根拠でない。7.5 m以内15%低下。スマッジ90秒は徘徊・DOTS抑制で、イベント移動を区別。 | [Yurei](https://phasmopedia.com/en/ghosts/yurei/)、[Wiki](https://phasmophobia.fandom.com/wiki/Yurei) |

## 行動フィルター

「絞り込み」は、記載した固有の観測を正しく確認した場合の候補制限です。「参考」は表示順だけを調整し、候補を除外しません。速度変化だけ・未観測だけ・装備の設置だけといった曖昧な観測から確定はできません。フィルターはプレイヤーが観測条件を確認して選択するもので、ツールがゲーム映像を自動検証する機能ではありません。

| ID | 更新後の判定 | 監査結果・修正 | 出典 |
| --- | --- | --- | --- |
| `maleName` | バンシー・ダヤン除外 | 性別アイコンで確認。男性ミミックによる両者の模倣も排除する組み合わせ判定を追加。 | 上表Banshee・Dayan・The Mimic |
| `femaleOnly` | 参考 | 女性名だけでは他種を排除できない。従来判定を維持。 | 上表Banshee・Dayan |
| `aswangHide` | アスワング・ミミック | 公式の使用可能な隠れ場所、自然終了・他者死亡との区別を明記。危険な試験である点も補足。 | 上表Aswang |
| `dayanMotion` | ダヤン・女性ミミック | 最も近い人、別階を含む10 m、移動／静止の反復を明記。男性との組み合わせは矛盾として候補なし。 | 上表Dayan・The Mimic |
| `galluProtect` | ガルル・ミミック | 「防御の後」から「踏んだ塩→未使用の別の塩を踏まない」へ具体化。2〜3秒の遅延と実際の通過確認。 | 上表Gallu |
| `kormosAudio` | 参考に変更 | 静止した人を無視するだけではバンシー等を除外できない。声・電子機器・接触の危険も補足。 | 上表Kormos・Banshee |
| `wraithSalt` | レイス・ガルル・ミミック | 既存の候補は正しい。通過と未使用の塩の山自体を確認し、UV足跡とは区別。 | 上表Wraith・Gallu |
| `obakePrint` | 化け狐・ミミック | 旧「特殊指紋または姿変化」をモデル変化のみへ分離。点滅・姿勢とは区別。証拠0で有効。 | 上表Obake |
| `obakeUv` | 化け狐・ミミック、UV必須 | 分離した新項目。特殊指紋ならUV確定を証拠判定へ追加。証拠0・UV否定と両立しない。 | 上表Obake・The Mimic |
| `goryoDots` | 御霊のみ、DOTS必須 | 全員部屋外・肉眼とカメラの同時比較を補足。カメラで見ただけでは不十分。ミミック不可。 | 上表Goryo・The Mimic |
| `bansheeScream` | バンシー・女性ミミック | 通常怪音と区別。男性の模倣不可を判定に追加。Box証拠は推論しない。 | 上表Banshee・The Mimic |
| `phantomPhoto` | ファントム・ミミック | イベント中の正常撮影に限定し、自然終了・同期ずれ・御霊DOTS写真を除外。撮影による姿消失を観測する条件。 | 上表Phantom・Goryo |
| `deogenBreath` | デオヘン・ミミック、Box必須 | 1 m以内の特殊Box反応であることを補足。イベントの息とは別。証拠0不可。 | 上表Deogen・The Mimic |
| `polterThrow` | ポルターガイスト・ミミック | ハント外の一斉投げ能力。ハント中の連続投げや物理衝突を除外。 | 上表Poltergeist |
| `mylingQuiet` | 参考 | 同じ階・12/10 m比較。雷獣15 m干渉や遮音の混同を補足。従来の参考判定を維持。 | 上表Myling・Raiju |
| `onryoFlame` | 参考 | 3回目で必ず即時ハントという誤解を防止。抑制・待機・防御と4 mの炎範囲を補足。 | 上表Onryo |
| `obamboPhase` | 参考 | 開始1分／以後2分、平静時の活動量が高い点を補足。周期や速度だけでは他種を排除しない。 | 上表Obambo |
| `spiritSmudge` | 参考 | 新規有効スマッジから計測。再使用は更新しない。ハントなし180秒だけは確定にならない。 | 上表Spirit・Demon |
| `demonEarly` | デーモン・ミミック | 新規有効スマッジから60秒以上90秒未満の通常ハント。効果中の再使用、呪いのハント、不発を明示的に除外。 | 上表Demon・Spirit・The Mimic |
| `oniVisible` | 参考 | デオヘンも見えやすい。霧状イベント未観測や息の音だけでは絞れない。 | 上表Oni・Deogen |
| `raijuElectronics` | 参考に変更 | 作動中の有効な調査装備・同じ階・除外装備を明記。視認や温度などで同時に速くなる候補を誤って落とさない。 | 上表Raiju・Hantu・Dayan |
| `hantuCold` | ハントゥ・ミミック | 温度の速度差より、オフ・故障ブレーカー時の頭付近の白い息に限定。プレイヤーの息は対象外。氷点下証拠は推論しない。 | 上表Hantu・The Mimic |
| `mimicOrb` | ミミックのみ、オーブ必須 | 単にオーブがあるだけは不十分。難易度の証拠数を超える観測を確認。オーブ否定との矛盾を新たにチェック。 | 上表The Mimic |

## 調査アドバイス

2026-10-07追加。既存の証拠・行動判定を使い、次の調査を提案します。ゲーム内での実測による検証ではありません。

- 名前検索・選択中の記録・除外済みの表示ではなく、実際に条件を満たす候補全体から計算します。
- 未確認の証拠を1種類ずつ仮に確定し、候補が残り、かつ減るものを表示します。件数は観測できた場合の候補数で、出現確率・発見率ではありません。
- 通常証拠の設定数と、有効な可視証拠の組み合わせから、追加証拠か行動確認を優先するか決めます。ミミックの追加オーブは通常証拠枠と別に扱い、証拠0でも提案できます。
- 行動から反映される証拠も考慮し、観測できない証拠に依存する検査は提案しません。固有行動の未観測を除外条件にせず、参考フィルターは除外しない旨を明示します。
- ハント外の確認を先に示し、ハント中・接近が必要な観測は注意文付きの別枠にします。確認のためのハント誘発や接近は勧めません。
- 候補0では入力の見直し、候補1では最終照合を案内します。アドバイス表示や観測条件の確認だけでは、証拠・行動を自動選択しません。
- 氷点下はTier Iで0°C未満、Tier II・IIIで1°C未満を目安とし、白い息だけでは確定しません。証拠の手順は[氷点下](https://phasmophobia.fandom.com/wiki/Freezing_Temperatures)、[スピリットボックス](https://phasmophobia.fandom.com/wiki/Spirit_Box)、[識別ガイド](https://phasmophobia.fandom.com/wiki/Guides/Identifying_ghosts)、[ライティングブック](https://phasmophobia.fandom.com/wiki/Ghost_Writing_Book)、[紫外線](https://phasmophobia.fandom.com/wiki/Ultraviolet)を参照しました。ミミックの例外は[Phasmopedia](https://phasmopedia.com/en/ghosts/the-mimic/)で再確認しました。

## プログラム検証

`node --test app.test.cjs concepts.test.cjs investigation-advice.test.cjs` と `node --check app.js` で検証します。

- 資料照合済みの全30種類の証拠構成・5種類の強制証拠・ミミックの追加証拠を固定した回帰テスト。
- 全30種類について証拠数0〜3の全許容組み合わせと、隠れる証拠を否定した場合の候補維持。
- 男性ミミックの模倣制限、入力順が異なっても同じ矛盾判定となること。
- 特殊指紋／モデル変化、ハントゥの白い息／氷点下証拠の分離。
- オーブの追加観測と否定の矛盾、カメラDOTS・Box特殊反応・UV特殊指紋の証拠0での排除。
- 参考フィルターが候補を除外しないこと、全ゴースト・全フィルターの監査表への掲載。
- 保存領域の拒否・破損・容量不足でも起動・入力できること。
- 全ゴースト・全難易度の可視証拠と隠れた証拠の組み合わせで、提案する証拠が観測可能であり、表示件数が実際の判定と一致すること。
- アドバイスが検索・除外済みの表示で変化せず、入力条件を変更しないこと。証拠枠の充足、追加オーブ、証拠0、矛盾、候補1、行動由来の証拠を別々に扱うこと。

新パッチが配信された場合や上記資料で仕様の訂正があった場合は、この基準を再確認する必要があります。
