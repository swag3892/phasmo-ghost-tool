# Phasmophobia ゴースト分析

ナイトメア難易度に対応した静的ゴースト分析ツールです。暗色の「調査ファイル」デザインを正式採用し、候補の一覧と1体ずつの調査記録を表示します。

## 使い方

`index.html` をブラウザで開くと利用できます。

- 初期設定の難易度は `ナイトメア（証拠2種類）` です。
- 証拠は `未確認`・`確定`・`否定` のボタンで選択します。
- 調査入力は `証拠`・`行動`・`設定` のタブで切り替えます。
- ナイトメアでは、否定した証拠が隠れている可能性もあるため、その証拠を持つゴーストをすぐには除外しません。
- Goryo / Hantu / Moroi / Obake / Deogen の強制証拠は、証拠数が1以上の場合に必ず現れるものとして扱います。証拠数が0の場合は現れません。
- The Mimic は、設定された証拠数に加えてゴーストオーブが現れるものとして扱います。
- 日本語名・英語名で候補ゴーストを検索できます。
- 正式版は `phasmo-dossier-v1` に入力状態を保存します。初回は旧画面の保存データを優先して引き継ぎ、旧画面とプレビューの保存データは変更しません。
- 旧画面は `legacy.html` に保存しています。

## データ確認日

2026-10-07全件確認 / 仕様確認対象: v0.19.0.2 / 全30種類 / 行動フィルター23項目

公式更新履歴と、全30種類の個別仕様資料で「特徴」「調査のポイント」および行動フィルターの発動条件・例外・実際の候補判定を照合しました。[全件の確認結果と個別の出典](GHOST_AUDIT.md)を公開しています。Deildegastの公式日本語名は未確認のため英語表記です。ゲーム内での実測による検証は行っていません。

[Crimson Eyeの公式予告](https://kineticgames.co.uk/news/the-crimson-eye-approaches-once-more)には、パッチを10月7日に配信し、イベントを10月8日に開始すると記載されています。確認時点でその詳細パッチノートは未確認のため、予告を確定済みの仕様として扱いません。記載速度はゴースト速度100%・イベント補正なしです。

## 確認済みの更新情報

- [v0.19.0.2](https://kineticgames.co.uk/news/phasmophobia-v01902-patch-notes): PS5・Xbox Series X/Sでルームに入れない不具合を修正しました。また、マルチプレイで、ほかのプレイヤーがパラボラマイクの電源を入れた直後に落とすと、プレイヤーの音声がこもる不具合を修正しました。
- [v0.19.0.1](https://kineticgames.co.uk/news/phasmophobia-v01901-patch-notes): Prison Entranceに小物を追加し、指紋が残る干渉箇所を増やしました。猿の手の「知識が欲しい」で正しい証拠にも取り消し線が付く不具合や、ビデオカメラの画面が黒いままになる不具合を修正しました。PS5・Xboxの音声認識、UV指紋の撮影、ドアの音に関する不具合も修正しました。

この2回の更新では、ゴーストの追加や証拠構成・強制証拠・能力の変更は告知されていません。全30種類の証拠判定に対応し、サイトの「ゲーム更新情報」に調査に関する修正内容を掲載しています。

## 判定と機能の仕様

- Deildegastの証拠はD.O.T.S. / EMF 5 / ゴーストライティングです。
- v0.18で修正されたコルモスの壁越しの殺害は、現行の仕様として扱いません。
- ミミックは模倣可能な行動では候補に残ります。ただし御霊のカメラ専用D.O.T.S.は出せず、男性のミミックはバンシー・ダヤンを模倣できません。男性名と両者固有の行動を併用すると矛盾として扱います。
- 塩を踏まない候補には、激昂したガルルも含まれます。塩を踏むことと、紫外線で足跡が見えることは区別しています。
- 女性名であることやハントが発生していないことなど、絞り込みの根拠として弱い観測は「参考」として扱います。候補を除外せず、表示順のみを調整します。表示順は出現確率を表すものではありません。
- 固有のBox呼吸・カメラ専用D.O.T.S.・特殊UV指紋・追加オーブの観測は、対応する証拠も判定に反映します。化け狐のモデル変化やハントゥの頭付近の白い息は証拠0でも出る能力として別扱いにしています。
- コルモスの静止プレイヤー無視と雷獣の電子機器付近での加速は、ほかの条件でも紛らわしいため「参考」です。スマッジは効果中に再使用しても抑制タイマーが更新されない点に注意してください。
- ブラウザ内への保存が拒否された場合や保存データが破損している場合でも、ツールを起動できます。クリップボードへのコピーが許可されていない場合も通知します。

## 検証

Node.jsで `node --test app.test.cjs concepts.test.cjs` と `node --check app.js` を実行できます。全30種類・証拠数0〜3の全許容組み合わせ、強制証拠、ミミックの例外、行動と証拠の矛盾、監査表の全件掲載、正式版への保存データの引き継ぎを検証します。

## デザイン案の比較

`node preview-server.cjs` を実行し、`http://127.0.0.1:4173/designs.html` を開くと3種類のデザイン案を比較できます。使用中のポートを避ける場合は `--port 4174` のように指定します。

- 作戦室: 暗色の3列レイアウト。左に証拠、中央に候補、右に行動フィルターを配置します。
- 調査ノート: 明色の一覧レイアウト。特徴と調査のポイントを横並びで比較できます。
- コンパクト: 証拠入力を上部にまとめ、行動フィルターをドロワーに配置します。

3案とも旧画面の `legacy.html` と `app.js` を使用し、入力状態はデザインの切り替えで維持されます。比較ページの操作で正式版の保存データは変更しません。同一オリジンのフレームを利用するため、ファイルを直接開くのではなく上記サーバー経由で使用してください。

## 構成を変えたデザイン案

`http://127.0.0.1:4173/concepts.html` では、現行画面を使い回さずに作成した3案を比較できます。同じ `preview-server.cjs` で利用できます。

- 証拠マトリクス: 行がゴースト、列が証拠の比較表。列のヘッダーで証拠状態を入力し、行動観測を上部で開閉します。詳細はゴースト名を選ぶと表示されます。
- 調査ファイル: 候補名の横並びナビゲーションと、1体ずつの記録を表示する見開き構成。調査入力は証拠・行動・条件のタブで切り替えます。
- ステップ調査: 証拠・行動・候補を個別の画面に分けた段階式。候補画面は名前の一覧と選択した1体の詳細を表示します。

判定は監査済みの `app.js` のAPIを共有します。入力状態は3案間で共有・保存し、正式版とは別の保存キーを使います。「調査ファイル」を暗色に調整したものが正式版です。比較用のタブは正式版には表示しません。

PC・スマートフォンのプレビュー画像は `concept-previews` に保存しています。Playwrightで320・390・768・1080・1440pxの表示、証拠と行動の入力、キーボード操作、候補移動、入力状態の保存を検証しています。再検証には `node concepts.ui-check.cjs --playwright <Playwrightのモジュールパス> --browser <ブラウザの実行ファイル>` を使用します。先に上記のプレビューサーバーを起動してください。検証はlocalhostのみで行い、独立したブラウザプロファイルを使用します。

## 公開

公開URL: [Phasmophobia ゴースト分析](https://swag3892.github.io/phasmo-ghost-tool/)

静的サイトのため、公開先には `index.html`・`app.js`・`concept-state.js`・`concepts.js`・`concepts.css` と `assets` フォルダーを同じ階層に配置します。GitHub Pagesで公開する場合は、Settings > Pages > Deploy from a branch で `main` / `/(root)` を選択します。入力内容は利用中のブラウザに保存され、ほかの端末やプレイヤーとは同期しません。

主な参照元:

- https://kineticgames.co.uk/news
- https://phasmopedia.com/en/
- https://kineticgames.co.uk/news/the-crimson-eye-approaches-once-more
- https://kineticgames.co.uk/news/phasmophobia-v01902-patch-notes
- https://kineticgames.co.uk/news/phasmophobia-v01901-patch-notes
- https://kineticgames.co.uk/news/phasmophobia-v01900-quality-of-life-part-2
- https://kineticgames.co.uk/news/phasmophobia-v01800-patch-notes
- https://games.gg/phasmophobia/guides/phasmophobia-how-to-identify-a-deildegast/
- https://allthings.how/phasmophobia-how-to-identify-the-deildegast-ghost/
- https://phasmophobia.fandom.com/wiki/The_Mimic
- https://phasmophobia.fandom.com/wiki/Evidence
- https://phasmophobia.fandom.com/wiki/Difficulty
- https://phasmophobia.fandom.com/wiki/Guides/Identifying_ghosts
- https://phasmophobia.fandom.com/wiki/Aswang
- https://phasmophobia.fandom.com/wiki/Kormos
- https://phasmophobia.fandom.com/wiki/Dayan
- https://phasmophobia.fandom.com/wiki/Gallu
- https://phasmophobia.fandom.com/wiki/Obambo
- https://kineticgames.co.uk/news/phasmophobia-hotfix-v01715
