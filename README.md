# Phasmophobia Ghost Analyst

ナイトメア難易度対応の静的ゴースト分析ツールです。

## 使い方

`index.html` をブラウザで開くと使えます。

- 難易度は初期状態で `Nightmare 2証拠` です。
- 証拠カードはクリックで `不明 -> 確定 -> 否定 -> 不明` の順に切り替わります。
- ナイトメアでは、否定証拠が隠れ証拠になり得るため、候補は即除外されません。
- Goryo / Hantu / Moroi / Obake / Deogen の強制証拠は、証拠数1以上で隠れないものとして扱います。0証拠では出ません。
- The Mimic は証拠数とは別にゴーストオーブを追加表示するものとして扱います。
- 日本語名・英語名で候補ゴーストを検索できます。

## データ確認日

2026-09-07 / 確認できた最新リリース 0.19.0.0 / 30種類

公式v0.18・v0.19の更新履歴を照合。Deildegastの証拠と行動の詳細は下記の2件の攻略記事を照合しました。公式日本語名は未確認のため英語表記です。ゲーム内での実測検証ではありません。

## 今回の修正

- Deildegastを追加: D.O.T.S. / EMF 5 / ライティング。
- v0.18で修正されたコルモスの壁越し殺害を、現行の仕様として案内しないよう修正。
- 行動を模倣できるミミックを候補に残すよう修正。ただし御霊のD.O.T.S.は模倣不可。
- 塩を踏まない候補に、激昂したガルルを追加。UV足跡とは区別。
- 女性名、ハント未発生などの弱い観測は「参考」に変更。候補を除外せず表示順のみ調整します。表示順は確率ではありません。
- 固有呼吸はBox、カメラ限定D.O.T.S.はDOTSの観測を含むため、表示証拠の組み合わせにも反映します。
- 保存が拒否・破損していても起動可能にし、コピー権限拒否も通知します。

## 検証

Node.jsで `node --test app.test.cjs` を実行できます。

## 公開

静的サイトのため、公開先には `index.html`・`app.js`・`styles.css` を同じ階層で配置します。GitHub Pagesでは Settings > Pages > Deploy from a branch で `main` / `/(root)` を選択します。公開先URLは https://swag3892.github.io/phasmo-ghost-tool/ です（Pagesの有効化と配信完了が必要です）。ブラウザ内保存は端末・URLごとで、他のプレイヤーとは同期しません。

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
