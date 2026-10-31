# 日本語Wikiとの照合記録

照合日: 2026-10-31 / 公式更新履歴の確認対象: v0.19.1.0 / 対象: 30種類・行動28項目

## 採用方針

[Phasmophobia 日本語Wiki](https://gamerch.com/phasmophobiajp/)の個別記事と、[不具合・報告一覧](https://gamerch.com/phasmophobiajp/866325)を参照し、要点を独自の短い文章に整理しました。記事本文を転載するものではありません。記事のコメント欄や未実装の開発予告は判定の根拠にしていません。

- 証拠構成30種類、強制証拠5種類、ミミックの追加オーブは従来のデータと一致し、維持しました。
- 通常の能力と、コミュニティによる不具合報告を分けています。報告が必ず再現することや、現行環境で未修正であることを保証するものではありません。
- 公式修正と食い違う情報は、通常の固有能力・自動除外に採用しません。資料照合であり、ゲーム内実測は行っていません。
- 調査記録、候補の比較アドバイス、行動の判定条件から個別記事へ移動できます。証拠数0では強制証拠を探す案内を抑制し、ミミックの追加オーブだけを例外として案内します。

## 修正と保留

- ディルデガストは日本語Wikiの表記を採用しました。公式ローカライズ名が確定したという意味ではありません。英語名・保存用IDは維持しています。
- ダヤンの「移動」は移動入力、コルモスの足音検知は実際に発生する足音として区別しました。
- オバンボの周期の起点を出口の初回解錠に統一しました。ハント時間の比較では死亡による延長や呪いのハントを混ぜない注意を追加しています。
- ポルターガイストの同時操作に小物を浮かせる挙動を追加しました。ファントムの撮影には動画の完了も含め、写真欄満杯の報告は別表示にしています。
- メアーの明暗判定は照明スイッチ、モーロイの7秒は目くらましで通常ハント抑制とは別、デオヘンの速度は移動経路距離という点を補足しました。
- ガルルの状態名を「疲弊」に統一しました。保存用の足音シナリオID `weak` は変更しません。
- コルモスの壁越し殺害は日本語Wikiに記述が残っていますが、[公式v0.18更新履歴](https://kineticgames.co.uk/news/phasmophobia-v01800-patch-notes)に修正があるため現行仕様として復活させません。雷獣の大きな心音も修正済みの記述があり、判定項目にはしません。
- アスワングの最大加速までの時間は資料間で約8.5秒と約8.7秒の差があります。特徴では範囲を示し、合成足音は従来の近似計算（基礎速度の7.5%/秒）を維持します。実測精度を示す値ではありません。
- デオヘンの近距離・遠距離の境界値に資料差があるため、試聴の選択肢は「経路2m / 6mの例」としました。境界値を断定したり、中間距離を再現したりはしません。
- ディルデガストの開始時のドア枚数など、記事側でも推測表現がある挙動は自動除外に採用していません。
- セーイの記事は開始正気度を74% / 14%とし、公式情報より1ポイント低いと注記しています。約75% / 約15%という目安と資料差の報告を併記し、この差を自動判定には使いません。
- 幽霊のドア音、マイリングの怪音の多さ、怨霊の消火後ハントなど、別の原因でも起こる観測は単独の確定材料にしません。

## 追加した除外条件

いずれも「起こらなかった」ではなく、条件を満たす行動を実際に観測した場合に限ります。ミミックは模倣先を変えられるため残します。

| ID | 観測 | 除外対象 | 誤判定を避ける条件 |
| --- | --- | --- | --- |
| `breakerOn` | ゴーストがブレーカーをオンにした | ハントゥ | 初期設定・人の操作を除く |
| `breakerOff` | ゴーストがブレーカーを直接オフにした | ジン | 過負荷・人の操作・故障・一時消灯を除く |
| `lightOn` | ゴーストが通常の照明を点けた | メアー | 自動照明・家電・人の操作・イベントを除く |
| `saltStepped` | 未使用の塩の山を崩した | レイス | UV足跡とは別。同期状態も照合 |
| `incenseBefore180` | 新規有効スマッジの90〜179秒後に通常ハント | スピリット | 命中時刻から計測。不発・重ねがけ・呪いのハントを除く |

60〜89秒の通常ハントをデーモン・ミミックに絞る既存条件とは別です。180秒ハントがない観測は引き続き参考扱いです。

## 報告の扱い

`wiki-knowledge.js` の9項目は、対象の記録・行動の判定条件・UV確認欄にだけ関連付けています。候補判定のエンジンはこの報告データを参照しません。開始正気度の資料差、塩の同期、写真欄満杯、ホスト死亡後の足音検知、炎と電子機器の表示、部屋判定、UV表示、ミミック模倣の同期を収録しています。

## 個別記事

| ID | ゴースト | 出典 |
| --- | --- | --- |
| `aswang` | アスワング | [日本語Wiki](https://gamerch.com/phasmophobiajp/985679) |
| `banshee` | バンシー | [日本語Wiki](https://gamerch.com/phasmophobiajp/193163) |
| `dayan` | ダヤン | [日本語Wiki](https://gamerch.com/phasmophobiajp/955038) |
| `deildegast` | ディルデガスト | [日本語Wiki](https://gamerch.com/phasmophobiajp/998852) |
| `demon` | デーモン | [日本語Wiki](https://gamerch.com/phasmophobiajp/193169) |
| `deogen` | デオヘン | [日本語Wiki](https://gamerch.com/phasmophobiajp/363095) |
| `gallu` | ガルル | [日本語Wiki](https://gamerch.com/phasmophobiajp/955069) |
| `goryo` | 御霊 | [日本語Wiki](https://gamerch.com/phasmophobiajp/283735) |
| `hantu` | ハントゥ | [日本語Wiki](https://gamerch.com/phasmophobiajp/263954) |
| `jinn` | ジン | [日本語Wiki](https://gamerch.com/phasmophobiajp/193164) |
| `kormos` | コルモス | [日本語Wiki](https://gamerch.com/phasmophobiajp/985680) |
| `mare` | メアー | [日本語Wiki](https://gamerch.com/phasmophobiajp/193166) |
| `moroi` | モーロイ | [日本語Wiki](https://gamerch.com/phasmophobiajp/363091) |
| `myling` | マイリング | [日本語Wiki](https://gamerch.com/phasmophobiajp/283733) |
| `obake` | 化け狐 | [日本語Wiki](https://gamerch.com/phasmophobiajp/296203) |
| `obambo` | オバンボ | [日本語Wiki](https://gamerch.com/phasmophobiajp/955094) |
| `oni` | 鬼 | [日本語Wiki](https://gamerch.com/phasmophobiajp/193171) |
| `onryo` | 怨霊 | [日本語Wiki](https://gamerch.com/phasmophobiajp/296200) |
| `phantom` | ファントム | [日本語Wiki](https://gamerch.com/phasmophobiajp/193161) |
| `poltergeist` | ポルターガイスト | [日本語Wiki](https://gamerch.com/phasmophobiajp/193162) |
| `raiju` | 雷獣 | [日本語Wiki](https://gamerch.com/phasmophobiajp/296202) |
| `revenant` | レヴナント | [日本語Wiki](https://gamerch.com/phasmophobiajp/193167) |
| `shade` | シェード | [日本語Wiki](https://gamerch.com/phasmophobiajp/193168) |
| `spirit` | スピリット | [日本語Wiki](https://gamerch.com/phasmophobiajp/193158) |
| `thaye` | セーイ | [日本語Wiki](https://gamerch.com/phasmophobiajp/363096) |
| `mimic` | ミミック | [日本語Wiki](https://gamerch.com/phasmophobiajp/305772) |
| `twins` | ツインズ | [日本語Wiki](https://gamerch.com/phasmophobiajp/296201) |
| `wraith` | レイス | [日本語Wiki](https://gamerch.com/phasmophobiajp/193159) |
| `yokai` | 妖怪 | [日本語Wiki](https://gamerch.com/phasmophobiajp/263955) |
| `yurei` | 幽霊 | [日本語Wiki](https://gamerch.com/phasmophobiajp/193170) |

## 検証

- 全30種類の個別リンク・着眼点・注意事項の対応、報告参照先の整合性。
- 証拠数0〜3での案内、追加5条件の単独・併用、証拠入力との組み合わせ、ミミックの保持。
- 既存の強制証拠・保存データ・アドバイス・足音・行動表示の回帰検証。
- ローカルPlaywrightで全30種類の日本語Wikiリンクと箇条書き、追加条件、報告開閉、320〜1440pxの表示を確認。
