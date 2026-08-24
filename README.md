# Rust 200 Steps

Rustを基礎から250ステップで学べる学習Webサービス。
各ステップは「解説→課題→コード編集→実行→答え合わせ」を1ページで完結できる。

公開URL：https://rust-200-steps.pages.dev

## 特徴

- 25章×10ステップ=250ステップのカリキュラム（Hello Worldから並行処理・総合演習、よくあるエラー50選まで）
- ブラウザ上のエディタでRustコードを編集し、その場でコンパイル・実行
- コンパイラのエラーメッセージをそのまま表示（エラーを読む訓練も学習の一部）
- 1から書かせず、例コードの部分修正・穴埋め・意図的なエラーの修正を中心とした課題設計
- ヒント（段階表示）、模範解答、期待出力による自動クリア判定
- 進捗はブラウザのlocalStorageに保存

## 必要環境

- Node.js 18以上（依存パッケージなし。npm install不要）
- Rustはあれば使う、なくても動く：
  - ローカルに`rustc`があればローカルでコンパイル・実行（高速・オフライン可）
  - なければRust Playground APIをサーバー経由で利用（インターネット接続が必要）

## 使い方

```bash
git clone https://github.com/MaitaTomoya/rust-200-steps.git
cd rust-200-steps
node server.js
```

起動するとターミナルにURLが表示されるので、ブラウザで開く（デフォルトは http://localhost:3939 ）。
ポートは環境変数PORTで変更できる。

```bash
PORT=8080 node server.js
```

ローカル実行に切り替えたい場合はRustをインストールして再起動する：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## ディレクトリ構成

```
rust-tutor/
├── server.js              # HTTPサーバー（静的配信＋/api/run）
├── public/
│   ├── index.html
│   ├── app.js             # フロントエンドロジック
│   ├── app-register.js    # 教材登録用グローバル関数
│   ├── styles.css
│   └── content/           # 教材データ（chapter01.js〜chapter20.js）
├── scripts/
│   ├── validate.js        # 教材データの構造検証
│   └── check-solutions.js # 模範解答のコンパイル・実行検証
└── CONTENT_SPEC.md        # 教材データ作成仕様
```

## 教材の検証

```bash
# 構造検証（ID連番、必須フィールド、禁止APIなど）
node scripts/validate.js

# 模範解答が実際にコンパイル・実行でき、期待出力と一致するか検証
node scripts/check-solutions.js          # 全250ステップ
node scripts/check-solutions.js 41 60    # ステップ41〜60のみ
```

## カリキュラム

| 章 | テーマ |
|----|--------|
| 1 | はじめてのRust |
| 2 | データ型と演算 |
| 3 | 制御フロー |
| 4 | 関数 |
| 5 | 所有権 |
| 6 | 参照と借用 |
| 7 | 構造体とメソッド |
| 8 | enumとパターンマッチ |
| 9 | コレクション |
| 10 | エラー処理 |
| 11 | ジェネリクス |
| 12 | トレイト |
| 13 | ライフタイム |
| 14 | クロージャとイテレータ |
| 15 | スマートポインタ |
| 16 | モジュールとクレート |
| 17 | 文字列操作と実践テクニック |
| 18 | 並行処理 |
| 19 | 発展トピック |
| 20 | 総合演習 |
| 21 | よくあるエラー：構文と基本 |
| 22 | よくあるエラー：所有権と借用 |
| 23 | よくあるエラー：match・Option・Result |
| 24 | よくあるエラー：トレイトとジェネリクス |
| 25 | よくあるエラー：実行時と論理 |
