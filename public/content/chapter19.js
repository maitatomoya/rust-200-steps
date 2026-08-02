// 第19章：発展トピック
registerChapter({
  number: 19,
  title: "発展トピック",
  description: "constとstatic、型変換トレイト、演算子オーバーロード、newtypeやBuilderといった実務で頻出する設計パターンを学び、型システムを最大限に活用したAPI設計の引き出しを増やします。",
  steps: [
    {
      id: 181,
      title: "constとstaticの違い",
      explanation: `<p>Rustにはグローバルに使える値を定義する方法として<code>const</code>（定数）と<code>static</code>（静的変数）の2つがあります。どちらも型注釈が必須で、命名は大文字のスネークケース（例：<code>MAX_SIZE</code>）が慣習です。</p>
<table>
<tr><th></th><th>const</th><th>static</th></tr>
<tr><td>実体</td><td>使用箇所にインライン展開される（メモリ上の固定住所を持たない）</td><td>プログラム全体で1つのメモリ領域を持つ</td></tr>
<tr><td>ライフタイム</td><td>概念なし（コンパイル時に埋め込み）</td><td>常に<code>'static</code>（プログラム終了まで生存）</td></tr>
<tr><td>可変性</td><td>常に不変</td><td><code>static mut</code>は存在するが<code>unsafe</code>が必要（原則使わない）</td></tr>
<tr><td>主な用途</td><td>数値・設定値などほとんどの定数</td><td>参照を配りたい大きなデータ、グローバルな状態</td></tr>
</table>
<p>基本的には<code>const</code>を選び、「同じアドレスの実体が1つ必要」という明確な理由があるときだけ<code>static</code>を使う、と覚えておけば十分です。関数の外側（モジュールのトップレベル）に書けば、ファイル内のどこからでも参照できます。</p>
<pre><code>const MAX_RETRY: u32 = 3;
static GREETING: &amp;str = "こんにちは";

fn main() {
    println!("{}（最大{}回まで再試行）", GREETING, MAX_RETRY);
}
</code></pre>
<p><code>static GREETING: &amp;str</code>のように文字列リテラルを持たせる場合、参照のライフタイムは自動的に<code>'static</code>と解釈されます。なお<code>let</code>と違い、<code>const</code>や<code>static</code>の右辺には「コンパイル時に計算できる式」しか書けません（関数呼び出しは原則不可。<code>const fn</code>という例外もあります）。</p>`,
      task: `TODOコメントの位置に、消費税率を表す<code>const TAX_RATE</code>（f64型、値0.10）と、アプリ名を表す<code>static APP_NAME</code>（&amp;str型、値"家計簿アプリ"）を定義して、コンパイルが通るようにしてください。`,
      code: `// TODO: ここにconstでTAX_RATE（f64型、0.10）を定義する

// TODO: ここにstaticでAPP_NAME（&str型、"家計簿アプリ"）を定義する

fn main() {
    let price = 1200.0;
    let total = price * (1.0 + TAX_RATE);
    println!("アプリ名: {}", APP_NAME);
    println!("税込価格: {:.0}円", total);
}
`,
      solution: `// 消費税率（コンパイル時に埋め込まれる定数）
const TAX_RATE: f64 = 0.10;

// アプリ名（プログラム全体で1つの実体を持つ静的変数）
static APP_NAME: &str = "家計簿アプリ";

fn main() {
    let price = 1200.0;
    let total = price * (1.0 + TAX_RATE);
    println!("アプリ名: {}", APP_NAME);
    println!("税込価格: {:.0}円", total);
}
`,
      hints: [
        `constもstaticも「名前: 型 = 値;」の形で、型注釈を省略できません。関数の外側に書きます。`,
        `const TAX_RATE: f64 = 0.10; のように書きます。staticの方は型を&strにして文字列リテラルを代入します。`
      ],
      expectedOutput: "税込価格: 1320円"
    },
    {
      id: 182,
      title: "型エイリアスtype",
      explanation: `<p><code>type</code>キーワードを使うと、既存の型に別名（型エイリアス）を付けられます。長くて読みにくい型に意味のある名前を与え、コードの意図を伝わりやすくするのが目的です。</p>
<pre><code>type Point = (f64, f64);
type Scores = Vec&lt;i32&gt;;

fn midpoint(a: Point, b: Point) -&gt; Point {
    ((a.0 + b.0) / 2.0, (a.1 + b.1) / 2.0)
}
</code></pre>
<p>重要なのは、型エイリアスは<strong>新しい型を作るわけではない</strong>という点です。<code>Point</code>は<code>(f64, f64)</code>の完全な別名なので、両者は自由に混ぜて使えますし、コンパイラも区別しません。「別の型として区別してほしい」場合は次々ステップで学ぶnewtypeパターンを使います。</p>
<table>
<tr><th>手法</th><th>新しい型になるか</th><th>用途</th></tr>
<tr><td>型エイリアス<code>type</code></td><td>ならない（ただの別名）</td><td>長い型の省略、意図の明示</td></tr>
<tr><td>newtype（タプル構造体）</td><td>なる（型チェックで区別される）</td><td>型安全性の強化</td></tr>
</table>
<p>実務で特によく見るのは、エラー型を固定した<code>Result</code>のエイリアスです。標準ライブラリの<code>std::io::Result&lt;T&gt;</code>も、実は<code>Result&lt;T, std::io::Error&gt;</code>のエイリアスとして定義されています。</p>
<pre><code>type AppResult&lt;T&gt; = Result&lt;T, String&gt;;

fn load_config() -&gt; AppResult&lt;u32&gt; {
    Ok(42)
}
</code></pre>
<p>戻り値の型をどこでも<code>AppResult&lt;T&gt;</code>と書けるようになり、エラー型を後から変更するときも<code>type</code>宣言の1箇所を直すだけで済みます。</p>`,
      task: `TODOの位置に、<code>(f64, f64)</code>のエイリアス<code>Point</code>と、<code>Result&lt;f64, String&gt;</code>のエイリアス<code>CalcResult</code>を定義して、コンパイルが通るようにしてください。`,
      code: `// TODO: (f64, f64)のエイリアスPointを定義する

// TODO: Result<f64, String>のエイリアスCalcResultを定義する（Result<f64, String>の別名）

fn distance(a: Point, b: Point) -> f64 {
    ((a.0 - b.0).powi(2) + (a.1 - b.1).powi(2)).sqrt()
}

fn safe_div(a: f64, b: f64) -> CalcResult {
    if b == 0.0 {
        Err(String::from("0除算です"))
    } else {
        Ok(a / b)
    }
}

fn main() {
    let origin: Point = (0.0, 0.0);
    let p: Point = (3.0, 4.0);
    println!("距離: {}", distance(origin, p));

    match safe_div(10.0, 2.0) {
        Ok(v) => println!("商: {}", v),
        Err(e) => println!("エラー: {}", e),
    }
}
`,
      solution: `// 座標を表すタプルに意味のある名前を付ける
type Point = (f64, f64);

// エラー型をStringに固定したResultの別名
type CalcResult = Result<f64, String>;

fn distance(a: Point, b: Point) -> f64 {
    ((a.0 - b.0).powi(2) + (a.1 - b.1).powi(2)).sqrt()
}

fn safe_div(a: f64, b: f64) -> CalcResult {
    if b == 0.0 {
        Err(String::from("0除算です"))
    } else {
        Ok(a / b)
    }
}

fn main() {
    let origin: Point = (0.0, 0.0);
    let p: Point = (3.0, 4.0);
    println!("距離: {}", distance(origin, p));

    match safe_div(10.0, 2.0) {
        Ok(v) => println!("商: {}", v),
        Err(e) => println!("エラー: {}", e),
    }
}
`,
      hints: [
        `型エイリアスは「type 新しい名前 = 既存の型;」の形で、関数の外側に書きます。`,
        `type Point = (f64, f64); と type CalcResult = Result<f64, String>; の2行を追加します。`
      ],
      expectedOutput: "距離: 5"
    },
    {
      id: 183,
      title: "演算子オーバーロード（std::ops::Add）",
      explanation: `<p>Rustでは<code>+</code>や<code>*</code>などの演算子の振る舞いを、自作の型に対して定義できます。これを演算子オーバーロード（演算子の意味を型ごとに上書きする仕組み）と呼びます。実体は<code>std::ops</code>モジュールのトレイト実装で、<code>+</code>は<code>Add</code>トレイトに対応します。</p>
<pre><code>use std::ops::Add;

impl Add for Vec2 {
    type Output = Vec2;

    fn add(self, other: Vec2) -&gt; Vec2 {
        Vec2 { x: self.x + other.x, y: self.y + other.y }
    }
}
</code></pre>
<p>ここで初めて登場するのが<code>type Output = Vec2;</code>という関連型（トレイト実装ごとに1つ決まる型）です。<code>Add</code>トレイトは「足し算の結果が何型になるか」を実装側に決めさせる設計になっており、<code>a + b</code>と書くとコンパイラが<code>a.add(b)</code>に変換し、その戻り値は<code>Output</code>型になります。</p>
<table>
<tr><th>演算子</th><th>トレイト</th><th>メソッド</th></tr>
<tr><td>a + b</td><td>std::ops::Add</td><td>add</td></tr>
<tr><td>a - b</td><td>std::ops::Sub</td><td>sub</td></tr>
<tr><td>a * b</td><td>std::ops::Mul</td><td>mul</td></tr>
<tr><td>a == b</td><td>PartialEq</td><td>eq（通常はderiveで済ませる）</td></tr>
</table>
<p>注意点として、<code>add(self, ...)</code>は所有権を取るため、演算後も元の値を使いたい型には<code>#[derive(Clone, Copy)]</code>を付けるのが定石です。また、演算子の意味を直感に反する形で定義する（<code>+</code>で引き算をするなど）のは混乱のもとなので避けましょう。ベクトル、行列、金額など「数学的に足し算が自然な型」にだけ使うのが良い設計です。</p>`,
      task: `<code>Vec2</code>に<code>Add</code>トレイトを実装し、<code>a + b</code>が成分ごとの和を返すようにしてください。`,
      code: `use std::ops::Add;

#[derive(Debug, Clone, Copy)]
struct Vec2 {
    x: f64,
    y: f64,
}

// TODO: Vec2にAddトレイトを実装する
// 関連型Outputと、fn add(self, other: Vec2) -> Vec2 が必要
impl Add for Vec2 {
}

fn main() {
    let a = Vec2 { x: 1.0, y: 2.0 };
    let b = Vec2 { x: 3.0, y: 4.0 };
    let c = a + b;
    println!("合計: ({}, {})", c.x, c.y);
}
`,
      solution: `use std::ops::Add;

#[derive(Debug, Clone, Copy)]
struct Vec2 {
    x: f64,
    y: f64,
}

// +演算子をVec2に定義する（成分ごとの和）
impl Add for Vec2 {
    // 足し算の結果の型を関連型で指定する
    type Output = Vec2;

    fn add(self, other: Vec2) -> Vec2 {
        Vec2 {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

fn main() {
    let a = Vec2 { x: 1.0, y: 2.0 };
    let b = Vec2 { x: 3.0, y: 4.0 };
    let c = a + b;
    println!("合計: ({}, {})", c.x, c.y);
}
`,
      hints: [
        `implブロックの中に「type Output = Vec2;」と「fn add(self, other: Vec2) -> Vec2」の2つを書きます。`,
        `addの本体では、self.x + other.x と self.y + other.y を使って新しいVec2を作って返します。`
      ],
      expectedOutput: "合計: (4, 6)"
    },
    {
      id: 184,
      title: "FromとInto",
      explanation: `<p><code>From</code>と<code>Into</code>は「ある型から別の型への変換」を表す標準トレイトです。第9章で使った<code>String::from("abc")</code>も、実は<code>From&lt;&amp;str&gt;</code>の実装を呼んでいたのです。</p>
<pre><code>impl From&lt;Celsius&gt; for Fahrenheit {
    fn from(c: Celsius) -&gt; Fahrenheit {
        Fahrenheit(c.0 * 9.0 / 5.0 + 32.0)
    }
}
</code></pre>
<p>最大のポイントは、<strong><code>From</code>を実装すると<code>Into</code>が自動で手に入る</strong>ことです。標準ライブラリに「<code>From&lt;T&gt;</code>が実装されていれば<code>T</code>側に<code>Into</code>を自動実装する」という包括実装（ブランケット実装）があるためで、自分で実装するのは常に<code>From</code>側、というのが鉄則です。</p>
<table>
<tr><th></th><th>From</th><th>Into</th></tr>
<tr><td>呼び方</td><td>Fahrenheit::from(c)</td><td>c.into()</td></tr>
<tr><td>自分で実装するか</td><td>する</td><td>しない（Fromから自動導出）</td></tr>
<tr><td>型推論</td><td>変換先が明確</td><td>変換先の型注釈が必要なことが多い</td></tr>
</table>
<p><code>into()</code>は「変換先が文脈から分かるとき」に便利です。ただし<code>let f = c.into();</code>だけでは変換先が決まらないため、<code>let f: Fahrenheit = c.into();</code>のように型注釈を添えます。</p>
<p>この変換は「必ず成功する変換」に使うのがルールです。失敗する可能性がある変換（範囲チェックが必要な場合など）は、次のステップで学ぶ<code>TryFrom</code>を使います。関数の引数を<code>impl Into&lt;String&gt;</code>のように受けると、呼び出し側が<code>&amp;str</code>でも<code>String</code>でも渡せる柔軟なAPIになる、という応用も頻出です。</p>`,
      task: `摂氏（Celsius）から華氏（Fahrenheit）への変換を<code>From</code>トレイトで実装し、<code>into()</code>でも変換できることを確認してください。変換式は「摂氏×9÷5＋32」です。`,
      code: `struct Celsius(f64);
struct Fahrenheit(f64);

// TODO: From<Celsius> for Fahrenheit を実装する
// 変換式: 華氏 = 摂氏 * 9.0 / 5.0 + 32.0

fn main() {
    let boiling = Celsius(100.0);
    // Fromを実装するとintoが自動で使えるようになる
    let f: Fahrenheit = boiling.into();
    println!("華氏: {}度", f.0);

    let f2 = Fahrenheit::from(Celsius(0.0));
    println!("華氏: {}度", f2.0);
}
`,
      solution: `struct Celsius(f64);
struct Fahrenheit(f64);

// 摂氏から華氏への変換を定義する
// Fromを実装すると、Celsius側のinto()も自動で使えるようになる
impl From<Celsius> for Fahrenheit {
    fn from(c: Celsius) -> Fahrenheit {
        Fahrenheit(c.0 * 9.0 / 5.0 + 32.0)
    }
}

fn main() {
    let boiling = Celsius(100.0);
    let f: Fahrenheit = boiling.into();
    println!("華氏: {}度", f.0);

    let f2 = Fahrenheit::from(Celsius(0.0));
    println!("華氏: {}度", f2.0);
}
`,
      hints: [
        `implの形は「impl From<変換元> for 変換先」です。中にfn from(値: 変換元) -> 変換先 を書きます。`,
        `タプル構造体の中身にはc.0でアクセスできます。Fahrenheit(c.0 * 9.0 / 5.0 + 32.0)を返しましょう。`
      ],
      expectedOutput: "華氏: 212度"
    },
    {
      id: 185,
      title: "TryFromとTryInto",
      explanation: `<p>前のステップの<code>From</code>は「必ず成功する変換」専用でした。では、失敗するかもしれない変換はどうするか。そこで使うのが<code>TryFrom</code>と<code>TryInto</code>です。「try」が付く分、戻り値が<code>Result</code>になります。</p>
<pre><code>impl TryFrom&lt;i64&gt; for Age {
    type Error = String;

    fn try_from(value: i64) -&gt; Result&lt;Age, Self::Error&gt; {
        if (0..=150).contains(&amp;value) {
            Ok(Age(value as u32))
        } else {
            Err(format!("{}は年齢として不正です", value))
        }
    }
}
</code></pre>
<p>関連型<code>Error</code>で「失敗時のエラー型」を宣言し、<code>try_from</code>は<code>Result&lt;変換先, エラー型&gt;</code>を返します。<code>From</code>と同様、<code>TryFrom</code>を実装すれば<code>TryInto</code>（<code>value.try_into()</code>）が自動で手に入ります。Rust 2021エディションではどちらもプレリュード（自動でインポートされる標準の型・トレイト群）に含まれるため、<code>use</code>宣言なしで使えます。</p>
<table>
<tr><th></th><th>From / Into</th><th>TryFrom / TryInto</th></tr>
<tr><td>失敗の可能性</td><td>なし</td><td>あり</td></tr>
<tr><td>戻り値</td><td>変換先の値そのもの</td><td>Result&lt;変換先, Error&gt;</td></tr>
<tr><td>代表例</td><td>String::from("a")</td><td>u8::try_from(300i32)（範囲外でErr）</td></tr>
</table>
<p>標準ライブラリでも、大きい整数型から小さい整数型への変換（<code>i64</code>から<code>u8</code>など）には<code>TryFrom</code>が実装済みです。<code>as</code>による変換は範囲外の値を黙って切り詰めてしまうのに対し、<code>try_from</code>は失敗を<code>Err</code>として教えてくれるので、外部から来た値の変換では<code>try_from</code>を選ぶ方が安全です。</p>`,
      task: `<code>Age</code>に<code>TryFrom&lt;i64&gt;</code>を実装してください。0〜150の範囲なら<code>Ok(Age(...))</code>、範囲外なら「(値)は年齢として不正です」という<code>Err</code>を返します。`,
      code: `struct Age(u32);

// TODO: TryFrom<i64> for Age を実装する
// 関連型 type Error = String; を宣言し、
// 0..=150 の範囲ならOk(Age(value as u32))、
// 範囲外なら Err(format!("{}は年齢として不正です", value)) を返す

fn main() {
    match Age::try_from(30) {
        Ok(age) => println!("年齢: {}歳", age.0),
        Err(e) => println!("エラー: {}", e),
    }
    match Age::try_from(-5) {
        Ok(age) => println!("年齢: {}歳", age.0),
        Err(e) => println!("エラー: {}", e),
    }
}
`,
      solution: `struct Age(u32);

// 失敗する可能性のある変換はTryFromで表現する
impl TryFrom<i64> for Age {
    // 失敗時のエラー型を関連型で宣言する
    type Error = String;

    fn try_from(value: i64) -> Result<Age, Self::Error> {
        if (0..=150).contains(&value) {
            Ok(Age(value as u32))
        } else {
            Err(format!("{}は年齢として不正です", value))
        }
    }
}

fn main() {
    match Age::try_from(30) {
        Ok(age) => println!("年齢: {}歳", age.0),
        Err(e) => println!("エラー: {}", e),
    }
    match Age::try_from(-5) {
        Ok(age) => println!("年齢: {}歳", age.0),
        Err(e) => println!("エラー: {}", e),
    }
}
`,
      hints: [
        `implブロックには「type Error = String;」と「fn try_from(value: i64) -> Result<Age, Self::Error>」の2つを書きます。`,
        `範囲チェックは (0..=150).contains(&value) が便利です。if式でOkとErrを出し分けましょう。`
      ],
      expectedOutput: "エラー: -5は年齢として不正です"
    },
    {
      id: 186,
      title: "Defaultトレイト",
      explanation: `<p><code>Default</code>トレイトは「その型の標準的な初期値」を定義する仕組みです。<code>Default::default()</code>を呼ぶと初期値が手に入ります。数値型は0、<code>bool</code>は<code>false</code>、<code>String</code>は空文字列、<code>Vec</code>は空のベクタ、というように標準ライブラリの主要な型はすべて実装済みです。</p>
<p>全フィールドの型が<code>Default</code>を実装していれば、自作の構造体には<code>#[derive(Default)]</code>と書くだけで自動実装できます。</p>
<pre><code>#[derive(Debug, Default)]
struct Config {
    host: String,   // 初期値は""
    port: u16,      // 初期値は0
    verbose: bool,  // 初期値はfalse
}
</code></pre>
<p>真価を発揮するのは、第7章で学んだ構造体更新記法（<code>..</code>で残りのフィールドを別の値から補う書き方）との組み合わせです。「一部だけ指定して残りはデフォルト」が1行で書けます。</p>
<pre><code>let config = Config {
    port: 8080,
    ..Default::default()
};
</code></pre>
<p>derive任せではなく「ポートの初期値は8080にしたい」など独自の初期値が必要なら、手動で実装します。</p>
<pre><code>impl Default for Config {
    fn default() -&gt; Self {
        Config { host: String::from("localhost"), port: 8080, verbose: false }
    }
}
</code></pre>
<p>関数の引数に「省略可能な設定」を渡したいとき、Rustにはデフォルト引数がない代わりに「<code>Default</code>を実装した設定構造体を受け取る」パターンが広く使われています。後のステップで学ぶBuilderパターンとも相性の良い、実務頻出のトレイトです。</p>`,
      task: `<code>Config</code>に<code>Default</code>をderiveし、<code>main</code>のTODO部分で「<code>port</code>だけ8080に指定し、残りはデフォルト値」の<code>Config</code>を構造体更新記法で作ってください。`,
      code: `// TODO: DebugとDefaultをderiveする
#[derive(Debug)]
struct Config {
    host: String,
    port: u16,
    verbose: bool,
}

fn main() {
    let default_config = Config::default();
    println!("デフォルト: {:?}", default_config);

    // TODO: portだけ8080にして、残りは..Default::default()で補う
    let custom = Config::default();

    println!("ポート: {}", custom.port);
    println!("詳細ログ: {}", custom.verbose);
}
`,
      solution: `// Defaultをderiveすると全フィールドが各型の初期値になる
#[derive(Debug, Default)]
struct Config {
    host: String,
    port: u16,
    verbose: bool,
}

fn main() {
    let default_config = Config::default();
    println!("デフォルト: {:?}", default_config);

    // 一部のフィールドだけ指定し、残りは構造体更新記法で補う
    let custom = Config {
        port: 8080,
        ..Default::default()
    };

    println!("ポート: {}", custom.port);
    println!("詳細ログ: {}", custom.verbose);
}
`,
      hints: [
        `deriveの括弧の中はカンマ区切りで複数書けます。#[derive(Debug, Default)]とします。`,
        `構造体更新記法は Config { port: 8080, ..Default::default() } の形です。..の後ろに補完元の式を書きます。`
      ],
      expectedOutput: "ポート: 8080"
    },
    {
      id: 187,
      title: "newtypeパターン（型安全な単位）",
      explanation: `<p>newtypeパターンとは、既存の型をフィールド1つのタプル構造体で包んで<strong>新しい型</strong>を作る手法です。ステップ182の型エイリアスと違い、コンパイラが別の型として区別してくれるのが決定的な違いです。</p>
<pre><code>struct Meters(f64);
struct Feet(f64);

fn set_altitude(height: Meters) { /* ... */ }
</code></pre>
<p>この設計なら、<code>set_altitude(Feet(1000.0))</code>と書いた瞬間にコンパイルエラーになります。「メートルとフィートを取り違えたまま実行されてしまう」という種類のバグを、実行前に型システムが排除してくれるわけです。実際、単位の取り違えは火星探査機マーズ・クライメイト・オービターの喪失事故の原因になったほど深刻なバグの源です。</p>
<table>
<tr><th>手法</th><th>Metersに(f64, f64)を渡すと</th><th>コスト</th></tr>
<tr><td>type Meters = f64;</td><td>f64なら何でも通ってしまう</td><td>なし</td></tr>
<tr><td>struct Meters(f64);</td><td>コンパイルエラーで検出</td><td>実行時コストはゼロ（薄いラッパー）</td></tr>
</table>
<p>中身には<code>.0</code>でアクセスします。newtypeはただの構造体なので、メソッドを生やしたり、ステップ183で学んだ演算子オーバーロードを実装したりもできます。「<code>Meters</code>同士の足し算は許すが、<code>Meters + Feet</code>は許さない」という制約も自然に表現できます。</p>
<pre><code>impl Meters {
    fn to_feet(self) -&gt; Feet {
        Feet(self.0 * 3.28084)
    }
}
</code></pre>
<p>ID、金額、単位付きの数値など「同じ<code>f64</code>や<code>u64</code>でも意味が違う値」を扱うとき、newtypeで包んでおくとAPIの誤用をコンパイラが防いでくれます。</p>`,
      task: `<code>Meters</code>に、(1)<code>Add</code>トレイト（Meters同士の和）と、(2)フィートへ変換する<code>to_feet</code>メソッド（1m＝3.28084ft）を実装してください。`,
      code: `use std::ops::Add;

#[derive(Debug, Clone, Copy)]
struct Meters(f64);

#[derive(Debug, Clone, Copy)]
struct Feet(f64);

// TODO: MetersにAddを実装する（Meters同士を足すとMetersになる）

impl Meters {
    // TODO: to_feetメソッドを実装する（self.0 * 3.28084 をFeetで包んで返す）
}

fn main() {
    let a = Meters(100.0);
    let b = Meters(23.0);
    let total = a + b;
    println!("合計: {}m", total.0);

    let f = total.to_feet();
    println!("フィート: {:.2}ft", f.0);
}
`,
      solution: `use std::ops::Add;

#[derive(Debug, Clone, Copy)]
struct Meters(f64);

#[derive(Debug, Clone, Copy)]
struct Feet(f64);

// Meters同士の足し算だけを許可する（Meters + Feetは型エラーになる）
impl Add for Meters {
    type Output = Meters;

    fn add(self, other: Meters) -> Meters {
        Meters(self.0 + other.0)
    }
}

impl Meters {
    // 単位変換は明示的なメソッド呼び出しでのみ行える
    fn to_feet(self) -> Feet {
        Feet(self.0 * 3.28084)
    }
}

fn main() {
    let a = Meters(100.0);
    let b = Meters(23.0);
    let total = a + b;
    println!("合計: {}m", total.0);

    let f = total.to_feet();
    println!("フィート: {:.2}ft", f.0);
}
`,
      hints: [
        `AddはステップI183と同じ形です。type Output = Meters; と fn add(self, other: Meters) -> Meters を書きます。`,
        `newtypeの中身はself.0で取り出せます。addではMeters(self.0 + other.0)を返します。`,
        `to_feetは fn to_feet(self) -> Feet { Feet(self.0 * 3.28084) } です。`
      ],
      expectedOutput: "合計: 123m"
    },
    {
      id: 188,
      title: "Builderパターン",
      explanation: `<p>フィールドが多く、その大半に妥当なデフォルト値がある構造体を作るとき、コンストラクタ関数の引数が延々と並ぶのは辛いものです。そこで使われるのがBuilderパターン（設定を1つずつメソッドで積み上げ、最後に<code>build</code>で完成品を得る構築手法）です。</p>
<pre><code>let req = HttpRequestBuilder::new("https://example.com")
    .method("POST")
    .timeout(10)
    .build();
</code></pre>
<p>Rustでの定番の書き方は「<code>self</code>の所有権を取って<code>Self</code>を返す」スタイルです。</p>
<pre><code>fn timeout(mut self, secs: u64) -&gt; Self {
    self.timeout_secs = secs;
    self
}
</code></pre>
<p>ポイントを整理します。</p>
<ul>
<li><code>mut self</code>：第7章のメソッドは<code>&amp;self</code>や<code>&amp;mut self</code>が中心でしたが、Builderでは所有権ごと受け取り、書き換えてそのまま返します。これにより<code>.method(...).timeout(...)</code>とメソッドチェーンでつなげられます。</li>
<li><code>new</code>：必須項目（ここではURL）だけを引数に取り、残りはデフォルト値で初期化します。</li>
<li><code>build</code>：Builderを消費（所有権を取得）して完成品の構造体を返します。以後Builderは使えなくなるので、設定途中の中途半端な状態が残りません。</li>
</ul>
<p>標準ライブラリでも<code>std::thread::Builder</code>、<code>std::process::Command</code>がこのパターンです。「必須項目はnewの引数で強制し、任意項目はメソッドで積む」という役割分担により、引数10個のコンストラクタよりはるかに読みやすく、後から設定項目を追加しても既存コードが壊れない拡張性も得られます。</p>`,
      task: `<code>HttpRequestBuilder</code>に、<code>timeout</code>（timeout_secsを設定）、<code>retries</code>（retriesを設定）、<code>build</code>（HttpRequestを組み立てて返す）の3メソッドを追加して、mainのチェーンが動くようにしてください。`,
      code: `#[derive(Debug)]
struct HttpRequest {
    method: String,
    url: String,
    timeout_secs: u64,
    retries: u32,
}

struct HttpRequestBuilder {
    method: String,
    url: String,
    timeout_secs: u64,
    retries: u32,
}

impl HttpRequestBuilder {
    fn new(url: &str) -> Self {
        HttpRequestBuilder {
            method: String::from("GET"),
            url: url.to_string(),
            timeout_secs: 30,
            retries: 0,
        }
    }

    fn method(mut self, m: &str) -> Self {
        self.method = m.to_string();
        self
    }

    // TODO: timeoutメソッドを追加する（secs: u64を受け取りtimeout_secsを設定）

    // TODO: retriesメソッドを追加する（n: u32を受け取りretriesを設定）

    // TODO: buildメソッドを追加する（selfを消費してHttpRequestを返す）
}

fn main() {
    let req = HttpRequestBuilder::new("https://example.com")
        .method("POST")
        .timeout(10)
        .retries(3)
        .build();

    println!("{} {} (timeout={}s, retries={})",
        req.method, req.url, req.timeout_secs, req.retries);
}
`,
      solution: `#[derive(Debug)]
struct HttpRequest {
    method: String,
    url: String,
    timeout_secs: u64,
    retries: u32,
}

struct HttpRequestBuilder {
    method: String,
    url: String,
    timeout_secs: u64,
    retries: u32,
}

impl HttpRequestBuilder {
    // 必須項目のURLだけを受け取り、残りはデフォルト値で初期化する
    fn new(url: &str) -> Self {
        HttpRequestBuilder {
            method: String::from("GET"),
            url: url.to_string(),
            timeout_secs: 30,
            retries: 0,
        }
    }

    // mut selfで所有権を受け取り、書き換えて返すことでチェーンできる
    fn method(mut self, m: &str) -> Self {
        self.method = m.to_string();
        self
    }

    fn timeout(mut self, secs: u64) -> Self {
        self.timeout_secs = secs;
        self
    }

    fn retries(mut self, n: u32) -> Self {
        self.retries = n;
        self
    }

    // Builderを消費して完成品を返す
    fn build(self) -> HttpRequest {
        HttpRequest {
            method: self.method,
            url: self.url,
            timeout_secs: self.timeout_secs,
            retries: self.retries,
        }
    }
}

fn main() {
    let req = HttpRequestBuilder::new("https://example.com")
        .method("POST")
        .timeout(10)
        .retries(3)
        .build();

    println!("{} {} (timeout={}s, retries={})",
        req.method, req.url, req.timeout_secs, req.retries);
}
`,
      hints: [
        `timeoutとretriesは、すでにあるmethodメソッドとまったく同じ形です。引数の型と設定先だけが違います。`,
        `buildは fn build(self) -> HttpRequest の形で、selfの各フィールドを使ってHttpRequestを組み立てます。`,
        `buildの引数はmut selfではなくselfで十分です（書き換えずに移し替えるだけなので）。`
      ],
      expectedOutput: "POST https://example.com (timeout=10s, retries=3)"
    },
    {
      id: 189,
      title: "AsRef<str>で柔軟なAPI",
      explanation: `<p>「<code>&amp;str</code>でも<code>String</code>でも受け取れる関数」を作りたい、というのはAPI設計でよくある要望です。これを実現するのが<code>AsRef</code>トレイト（安価な参照変換を表すトレイト）です。<code>AsRef&lt;str&gt;</code>を実装した型は、<code>as_ref()</code>を呼ぶと<code>&amp;str</code>を取り出せます。</p>
<pre><code>fn shout&lt;S: AsRef&lt;str&gt;&gt;(text: S) -&gt; String {
    text.as_ref().to_uppercase()
}

fn main() {
    shout("hello");                 // &amp;str
    shout(String::from("rust"));    // String
    shout(&amp;String::from("ok"));    // &amp;String
}
</code></pre>
<p>第11章のジェネリクスと第12章のトレイト境界の知識がそのまま活きています。<code>S: AsRef&lt;str&gt;</code>という境界を付けたジェネリック関数にすることで、<code>&amp;str</code>・<code>String</code>・<code>&amp;String</code>のどれを渡してもコンパイルが通り、関数内では<code>as_ref()</code>で統一的に<code>&amp;str</code>として扱えます。</p>
<table>
<tr><th>引数の受け方</th><th>&amp;strを渡す</th><th>Stringを渡す</th><th>特徴</th></tr>
<tr><td>fn f(s: &amp;str)</td><td>そのまま</td><td>&amp;を付けて渡す</td><td>最もシンプル。まずはこれで十分</td></tr>
<tr><td>fn f&lt;S: AsRef&lt;str&gt;&gt;(s: S)</td><td>そのまま</td><td>そのまま（所有権ごと）</td><td>呼び出し側が最も柔軟</td></tr>
</table>
<p>標準ライブラリではファイルパスを受け取るAPIが<code>AsRef&lt;Path&gt;</code>を多用しており、<code>&amp;str</code>・<code>String</code>・<code>PathBuf</code>のどれでもパスとして渡せるのはこの仕組みのおかげです。なお、関数内部で所有権付きの<code>String</code>が必要な場合は<code>Into&lt;String&gt;</code>境界（ステップ184）を使う、という使い分けも覚えておくと便利です。</p>`,
      task: `関数<code>shout</code>を、<code>&amp;str</code>でも<code>String</code>でも受け取れるように<code>AsRef&lt;str&gt;</code>境界のジェネリック関数へ書き換えてください。`,
      code: `// TODO: この関数をジェネリックにして、&strでもStringでも受け取れるようにする
// ヒント: fn shout<S: AsRef<str>>(text: S) -> String の形にして、
//         関数内ではtext.as_ref()で&strを取り出す
fn shout(text: &str) -> String {
    text.to_uppercase()
}

fn main() {
    let s1 = "hello";
    let s2 = String::from("rust");

    println!("{}", shout(s1));
    // 現在のシグネチャでは&s2と書く必要があるが、
    // AsRef<str>にすればStringをそのまま渡せる
    println!("{}", shout(s2));
}
`,
      solution: `// AsRef<str>境界により、&str・String・&Stringのどれでも受け取れる
fn shout<S: AsRef<str>>(text: S) -> String {
    // as_ref()で統一的に&strとして扱う
    text.as_ref().to_uppercase()
}

fn main() {
    let s1 = "hello";
    let s2 = String::from("rust");

    println!("{}", shout(s1));
    // Stringをそのまま渡せる（所有権ごと渡る）
    println!("{}", shout(s2));
}
`,
      hints: [
        `関数名の直後に<S: AsRef<str>>と型パラメータを宣言し、引数の型をSにします。`,
        `関数本体では text.as_ref() が&strを返すので、その後ろに.to_uppercase()をつなげます。`
      ],
      expectedOutput: "HELLO"
    },
    {
      id: 190,
      title: "総合演習：型安全な設定オブジェクト",
      explanation: `<p>この章の総仕上げとして、サーバー設定オブジェクトの構築APIを作ります。この章で学んだ道具が総動員されます。</p>
<table>
<tr><th>使う道具</th><th>役割</th></tr>
<tr><td>newtype（ステップ187）</td><td>Port(u16)で「ただの数値」とポート番号を区別する</td></tr>
<tr><td>TryFrom（ステップ185）</td><td>1〜65535の範囲チェック付きでPortを生成する</td></tr>
<tr><td>Default（ステップ186）</td><td>Builderの初期値（localhost:8080）を定義する</td></tr>
<tr><td>Builder（ステップ188）</td><td>メソッドチェーンで設定を積み上げる</td></tr>
<tr><td>AsRef&lt;str&gt;（ステップ189）</td><td>hostに&amp;strでもStringでも渡せるようにする</td></tr>
</table>
<p>設計上の見どころは、Builderの<code>port</code>メソッドが<code>Result&lt;Self, String&gt;</code>を返す点です。検証に失敗する可能性のある設定はこのように<code>Result</code>を返し、第10章で学んだ<code>?</code>演算子や<code>expect</code>で処理します。</p>
<pre><code>fn port(mut self, port: i64) -&gt; Result&lt;Self, String&gt; {
    self.port = Port::try_from(port)?;
    Ok(self)
}
</code></pre>
<p><code>?</code>は<code>Port::try_from</code>が<code>Err</code>を返したらそれをそのまま関数の呼び出し元へ返し、<code>Ok</code>なら中身を取り出します。呼び出し側のチェーンでは<code>Result</code>を挟むため、<code>.port(3000)?</code>や<code>.expect(...)</code>でつなぎます。</p>
<p>このように「不正な値はそもそも構築できない」設計にしておくと、構築後の<code>ServerConfig</code>には検証済みの値しか入っていないことが型レベルで保証されます。「不正な状態を表現できないようにする」（make invalid states unrepresentable）というRustらしい設計思想の実践です。</p>`,
      task: `TODOが2箇所あります。(1)<code>Port</code>への<code>TryFrom&lt;i64&gt;</code>実装（1〜65535ならOk、範囲外は「ポート番号(値)は範囲外です」のErr）、(2)Builderの<code>port</code>メソッド（<code>Port::try_from</code>と<code>?</code>を使い<code>Result&lt;Self, String&gt;</code>を返す）を実装してください。`,
      code: `#[derive(Debug, Clone, Copy)]
struct Port(u16);

// TODO(1): TryFrom<i64> for Port を実装する
// 1..=65535の範囲ならOk(Port(value as u16))、
// 範囲外なら Err(format!("ポート番号{}は範囲外です", value))

#[derive(Debug)]
struct ServerConfig {
    host: String,
    port: Port,
    verbose: bool,
}

struct ServerConfigBuilder {
    host: String,
    port: Port,
    verbose: bool,
}

impl Default for ServerConfigBuilder {
    fn default() -> Self {
        ServerConfigBuilder {
            host: String::from("localhost"),
            port: Port(8080),
            verbose: false,
        }
    }
}

impl ServerConfigBuilder {
    fn host<S: AsRef<str>>(mut self, host: S) -> Self {
        self.host = host.as_ref().to_string();
        self
    }

    // TODO(2): portメソッドを実装する
    // fn port(mut self, port: i64) -> Result<Self, String>
    // Port::try_from(port)?で検証し、成功したらOk(self)を返す

    fn verbose(mut self, v: bool) -> Self {
        self.verbose = v;
        self
    }

    fn build(self) -> ServerConfig {
        ServerConfig {
            host: self.host,
            port: self.port,
            verbose: self.verbose,
        }
    }
}

fn main() {
    let config = ServerConfigBuilder::default()
        .host("example.com")
        .port(3000)
        .expect("ポート設定に失敗")
        .verbose(true)
        .build();

    println!("ホスト: {}", config.host);
    println!("ポート: {}", config.port.0);
    println!("詳細ログ: {}", config.verbose);

    match ServerConfigBuilder::default().port(99999) {
        Ok(_) => println!("設定成功"),
        Err(e) => println!("エラー: {}", e),
    }
}
`,
      solution: `#[derive(Debug, Clone, Copy)]
struct Port(u16);

// 範囲チェック付きの変換：不正なポート番号はそもそも作れない
impl TryFrom<i64> for Port {
    type Error = String;

    fn try_from(value: i64) -> Result<Port, Self::Error> {
        if (1..=65535).contains(&value) {
            Ok(Port(value as u16))
        } else {
            Err(format!("ポート番号{}は範囲外です", value))
        }
    }
}

#[derive(Debug)]
struct ServerConfig {
    host: String,
    port: Port,
    verbose: bool,
}

struct ServerConfigBuilder {
    host: String,
    port: Port,
    verbose: bool,
}

// Builderの初期値をDefaultで定義する
impl Default for ServerConfigBuilder {
    fn default() -> Self {
        ServerConfigBuilder {
            host: String::from("localhost"),
            port: Port(8080),
            verbose: false,
        }
    }
}

impl ServerConfigBuilder {
    // AsRef<str>境界で&strでもStringでも受け取れる
    fn host<S: AsRef<str>>(mut self, host: S) -> Self {
        self.host = host.as_ref().to_string();
        self
    }

    // 検証に失敗しうる設定はResultを返す
    fn port(mut self, port: i64) -> Result<Self, String> {
        self.port = Port::try_from(port)?;
        Ok(self)
    }

    fn verbose(mut self, v: bool) -> Self {
        self.verbose = v;
        self
    }

    fn build(self) -> ServerConfig {
        ServerConfig {
            host: self.host,
            port: self.port,
            verbose: self.verbose,
        }
    }
}

fn main() {
    let config = ServerConfigBuilder::default()
        .host("example.com")
        .port(3000)
        .expect("ポート設定に失敗")
        .verbose(true)
        .build();

    println!("ホスト: {}", config.host);
    println!("ポート: {}", config.port.0);
    println!("詳細ログ: {}", config.verbose);

    match ServerConfigBuilder::default().port(99999) {
        Ok(_) => println!("設定成功"),
        Err(e) => println!("エラー: {}", e),
    }
}
`,
      hints: [
        `TryFromの実装はステップ185のAgeとほぼ同じ形です。範囲だけ1..=65535に変わります。`,
        `portメソッドの中は「self.port = Port::try_from(port)?;」と「Ok(self)」の2行です。`,
        `?演算子は、try_fromがErrを返したときにそのErrをportメソッドの戻り値として即座に返します。`
      ],
      expectedOutput: "エラー: ポート番号99999は範囲外です"
    }
  ]
});
