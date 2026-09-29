# Phasmophobia Ghost Analyst

ナイトメア難易度に対応した静的ゴースト分析ツールです。

## 使い方

`index.html` をブラウザで開くと利用できます。

- 難易度は初期状態で `Nightmare 2証拠` です。
- 証拠カードはクリックで `不明 -> 確定 -> 否定 -> 不明` の順に切り替わります。
- ナイトメアでは、否定した証拠が隠れ証拠である可能性もあるため、その証拠を持つゴーストをすぐには除外しません。
- Goryo / Hantu / Moroi / Obake / Deogen の強制証拠は、証拠数が1以上の場合に必ず現れるものとして扱います。証拠数が0の場合は現れません。
- The Mimic は、設定された証拠数に加えてゴーストオーブが現れるものとして扱います。
- 日本語名・英語名で候補ゴーストを検索できます。

## データ確認日

2026-09-07時点で確認したリリース: v0.19.0.0 / 全30種類

公式のv0.18・v0.19の更新履歴と照合しました。Deildegastの証拠と行動の詳細は、下記の2件の攻略記事で確認しました。公式の日本語名は未確認のため、英語表記を使用しています。ゲーム内での実測による検証は行っていません。

## 今回の修正

- Deildegastを追加しました。証拠はD.O.T.S. / EMF 5 / ライティングです。
- v0.18で修正されたコルモスの壁越しの殺害を、現行の仕様として案内しないようにしました。
- 行動を模倣できるミミックを候補に残すようにしました。ただし、御霊のカメラ越しでのみ見えるD.O.T.S.は模倣できません。
- 塩を踏まない候補に、激昂したガルルを追加しました。塩を踏むことと、UVの足跡が現れることは区別しています。
- 女性名やハントが発生していないことなど、絞り込みの根拠として弱い観測は「参考」に変更しました。候補を除外せず、表示順のみを調整します。表示順は出現確率を表すものではありません。
- 固有の呼吸音はスピリットボックス、カメラ越しでのみ見える姿はD.O.T.S.の観測を含むため、表示される証拠の組み合わせにも反映します。
- ブラウザ内への保存が拒否された場合や保存データが破損している場合でも、起動できるようにしました。コピーの権限が拒否された場合も通知します。

## 検証

Node.jsで `node --test app.test.cjs` を実行できます。

## 公開

公開URL: [Phasmophobia ゴースト分析](https://swag3892.github.io/phasmo-ghost-tool/)

静的サイトのため、公開先には `index.html`・`app.js`・`styles.css` と `assets` フォルダーを同じ階層に配置します。GitHub Pagesで公開する場合は、Settings > Pages > Deploy from a branch で `main` / `/(root)` を選択します。ブラウザ内の保存データは、端末・ブラウザ・URLごとに管理され、他のプレイヤーとは同期しません。

主な参照元:

- https://www.reddit.com/r/PhasmophobiaGame/comments/1vy2ce1/phasmophobia_v01900_quality_of_life_part_2/ (Kinetic Games担当者による更新履歴)
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
