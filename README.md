# Phasmophobia ゴースト分析

ナイトメア難易度に対応した静的ゴースト分析ツールです。

## 使い方

`index.html` をブラウザで開くと利用できます。

- 初期設定の難易度は `Nightmare 2証拠` です。
- 証拠カードはクリックで `不明 -> 確定 -> 否定 -> 不明` の順に切り替わります。
- ナイトメアでは、否定した証拠が隠れている可能性もあるため、その証拠を持つゴーストをすぐには除外しません。
- Goryo / Hantu / Moroi / Obake / Deogen の強制証拠は、証拠数が1以上の場合に必ず現れるものとして扱います。証拠数が0の場合は現れません。
- The Mimic は、設定された証拠数に加えてゴーストオーブが現れるものとして扱います。
- 日本語名・英語名で候補ゴーストを検索できます。

## データ確認日

2026-10-01時点で確認した最新リリース: v0.19.0.2 / 全30種類

公式のv0.18・v0.19.0.0・v0.19.0.1・v0.19.0.2の更新履歴と照合しました。Deildegastの証拠と行動の詳細は、参照元に記載したgames.ggとallthings.howの攻略記事で確認しました。Deildegastの公式日本語名は未確認のため、英語表記を使用しています。ゲーム内での実測による検証は行っていません。

## 確認済みの更新情報

- [v0.19.0.2](https://kineticgames.co.uk/news/phasmophobia-v01902-patch-notes): PS5・Xbox Series X/Sでルームに入れない不具合を修正しました。また、マルチプレイで、ほかのプレイヤーがパラボラマイクの電源を入れた直後に落とすと、プレイヤーの音声がこもる不具合を修正しました。
- [v0.19.0.1](https://kineticgames.co.uk/news/phasmophobia-v01901-patch-notes): Prison Entranceに小物を追加し、指紋が残る干渉箇所を増やしました。猿の手の「知識が欲しい」で正しい証拠にも取り消し線が付く不具合や、ビデオカメラの画面が黒いままになる不具合を修正しました。PS5・Xboxの音声認識、UV指紋の撮影、ドアの音に関する不具合も修正しました。

この2回の更新では、ゴーストの追加や証拠構成・強制証拠・能力の変更は告知されていません。全30種類の証拠判定に対応し、サイトの「ゲーム更新情報」に調査に関する修正内容を掲載しています。

## 判定と機能の仕様

- Deildegastの証拠はD.O.T.S. / EMF 5 / ゴーストライティングです。
- v0.18で修正されたコルモスの壁越しの殺害は、現行の仕様として扱いません。
- 行動を模倣できるミミックは、該当する行動フィルターを選んでも候補に残ります。ただし、御霊のカメラ越しでのみ見えるD.O.T.S.は模倣できません。
- 塩を踏まない候補には、激昂したガルルも含まれます。塩を踏むことと、紫外線で足跡が見えることは区別しています。
- 女性名であることやハントが発生していないことなど、絞り込みの根拠として弱い観測は「参考」として扱います。候補を除外せず、表示順のみを調整します。表示順は出現確率を表すものではありません。
- 固有の呼吸音を観測した場合はスピリットボックス、カメラ越しでのみ姿を観測した場合はD.O.T.S.を、証拠の組み合わせにも反映します。
- ブラウザ内への保存が拒否された場合や保存データが破損している場合でも、ツールを起動できます。クリップボードへのコピーが許可されていない場合も通知します。

## 検証

Node.jsで `node --test app.test.cjs` を実行できます。

## 公開

公開URL: [Phasmophobia ゴースト分析](https://swag3892.github.io/phasmo-ghost-tool/)

静的サイトのため、公開先には `index.html`・`app.js`・`styles.css` と `assets` フォルダーを同じ階層に配置します。GitHub Pagesで公開する場合は、Settings > Pages > Deploy from a branch で `main` / `/(root)` を選択します。入力内容は利用中のブラウザに保存され、ほかの端末やプレイヤーとは同期しません。

主な参照元:

- https://kineticgames.co.uk/news
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
