// 第7章：構造体とメソッド
registerChapter({
  number: 7,
  title: "構造体とメソッド",
  description: "関連するデータをひとまとめにする構造体（struct）と、そのデータに振る舞いを持たせるメソッドを学びます。",
  steps: [
    {
      id: 61,
      title: "structの定義",
      explanation: `<p>構造体（struct）とは、<strong>関連する複数の値をひとまとめにして名前を付けた独自の型</strong>です。たとえば「ユーザー」という概念は「名前」と「年齢」という複数のデータを持ちますが、これを別々の変数で管理すると、どの名前とどの年齢が対応するのか分からなくなります。構造体を使えば、意味のあるまとまりとして扱えます。</p>
<p>構造体は<code>struct</code>キーワードで定義します。中に並べる各データを<strong>フィールド</strong>と呼び、「フィールド名: 型」の形で書きます。</p>
<pre><code>struct User {
    name: String,
    age: u32,
}</code></pre>
<p>これまで学んだタプルもデータをまとめられますが、構造体との違いは次の通りです。</p>
<table>
<tr><th></th><th>タプル</th><th>構造体</th></tr>
<tr><td>各要素の名前</td><td>なし（位置でアクセス）</td><td>あり（フィールド名でアクセス）</td></tr>
<tr><td>型の名前</td><td>なし</td><td>あり（Userなど）</td></tr>
<tr><td>向いている場面</td><td>一時的な値の組</td><td>意味のあるデータのまとまり</td></tr>
</table>
<p>フィールド名が付くことで、コードを読んだときに「これは名前」「これは年齢」と一目で分かります。構造体の定義は関数の外（<code>fn main()</code>の外側）に書くのが一般的です。定義しただけではまだデータは作られず、「型の設計図」ができた状態です。実際に値を作る方法は次のステップで学びます。</p>`,
      task: `構造体<code>User</code>に、<code>String</code>型の<code>name</code>フィールドと<code>u32</code>型の<code>age</code>フィールドを定義して、コンパイルが通るようにしてください。`,
      code: `// TODO: nameフィールド（String型）とageフィールド（u32型）を持つように
// 構造体Userの定義を完成させる
struct User {
    // ここにフィールドを書く
}

fn main() {
    // mainの中はすでに完成している（インスタンスの作り方は次のステップで学ぶ）
    let user = User {
        name: String::from("Alice"),
        age: 30,
    };
    println!("名前：{}", user.name);
    println!("年齢：{}", user.age);
}`,
      solution: `// nameフィールド（String型）とageフィールド（u32型）を持つ構造体User
struct User {
    name: String,
    age: u32,
}

fn main() {
    let user = User {
        name: String::from("Alice"),
        age: 30,
    };
    println!("名前：{}", user.name);
    println!("年齢：{}", user.age);
}`,
      hints: [
        `フィールドは「フィールド名: 型」の形で書き、フィールド同士はカンマで区切ります。`,
        `mainの中でname（String）とage（u32）を使っているので、その2つをstructの波かっこの中に書きます。`
      ],
      expectedOutput: "名前：Alice"
    },
    {
      id: 62,
      title: "インスタンス生成とフィールドアクセス",
      explanation: `<p>構造体の定義は「設計図」でした。設計図から実際の値を作ることを<strong>インスタンス化</strong>と呼び、作られた値を<strong>インスタンス</strong>と呼びます。</p>
<p>インスタンスは「構造体名 { フィールド名: 値, ... }」の形で作ります。<strong>すべてのフィールドに値を与える必要があり</strong>、1つでも欠けるとコンパイルエラーになります。順番は定義と違っていても構いません。</p>
<pre><code>struct Book {
    title: String,
    pages: u32,
}

fn main() {
    let book = Book {
        title: String::from("Rust入門"),
        pages: 320,
    };
}</code></pre>
<p>フィールドの値を読むには<strong>ドット記法</strong>を使います。「インスタンス名.フィールド名」と書くだけです。</p>
<pre><code>println!("タイトル：{}", book.title);
println!("ページ数：{}", book.pages);</code></pre>
<p>ここで所有権の観点から1つ補足します。<code>book.title</code>は<code>String</code>型なので、<code>let t = book.title;</code>のように別の変数へ代入するとそのフィールドの所有権がムーブします。一方<code>println!</code>で表示するだけなら所有権は移動しません。前章で学んだ所有権のルールは、構造体のフィールドに対してもそのまま適用されると覚えておきましょう。</p>`,
      task: `<code>main</code>の中で、<code>title</code>が「Rust入門」、<code>pages</code>が320の<code>Book</code>インスタンスを作り、2つの<code>println!</code>が動くようにしてください。`,
      code: `struct Book {
    title: String,
    pages: u32,
}

fn main() {
    // TODO: titleが「Rust入門」、pagesが320のBookインスタンスbookを作る

    println!("タイトル：{}", book.title);
    println!("ページ数：{}", book.pages);
}`,
      solution: `struct Book {
    title: String,
    pages: u32,
}

fn main() {
    // titleが「Rust入門」、pagesが320のBookインスタンスを作る
    let book = Book {
        title: String::from("Rust入門"),
        pages: 320,
    };

    println!("タイトル：{}", book.title);
    println!("ページ数：{}", book.pages);
}`,
      hints: [
        `インスタンスは「let 変数名 = 構造体名 { フィールド名: 値, ... };」の形で作ります。`,
        `titleはString型なので、文字列リテラルではなくString::from("Rust入門")を渡します。`
      ],
      expectedOutput: "タイトル：Rust入門"
    },
    {
      id: 63,
      title: "mutなインスタンスとフィールド初期化省略記法",
      explanation: `<p>フィールドの値をあとから変更するには、<strong>インスタンス全体を<code>mut</code>で宣言</strong>する必要があります。「このフィールドだけ可変」という指定はできず、可変か不変かはインスタンス単位で決まります。</p>
<pre><code>let mut user = User {
    name: String::from("Bob"),
    age: 25,
};
user.age = 26; // mutが付いているので変更できる</code></pre>
<p><code>mut</code>を付け忘れた状態でフィールドに代入すると「cannot assign to <code>user.age</code>, as <code>user</code> is not declared as mutable」というコンパイルエラーになります。変数のときと同じルールです。</p>
<p>もう1つ、便利な書き方を紹介します。関数の引数から構造体を作るとき、<code>name: name</code>のように同じ名前を2回書くのは冗長です。<strong>フィールド名と変数名が同じ場合は1回だけ書けばよい</strong>という省略記法（フィールド初期化省略記法）があります。</p>
<pre><code>fn build_user(name: String, age: u32) -&gt; User {
    User {
        name,      // name: name と同じ意味
        age,       // age: age と同じ意味
    }
}</code></pre>
<p>実務のRustコードではこの省略記法が標準的に使われます。「フィールド名だけが書いてあったら、同名の変数の値が入る」と読めるようになっておきましょう。</p>`,
      task: `2箇所を修正してください。（1）<code>build_user</code>の中をフィールド初期化省略記法で書き換える。（2）<code>user.age</code>を変更できるように<code>mut</code>を付ける。`,
      code: `struct User {
    name: String,
    age: u32,
}

fn build_user(name: String, age: u32) -> User {
    // TODO: フィールド初期化省略記法を使って短く書き換える
    User {
        name: name,
        age: age,
    }
}

fn main() {
    // TODO: ageを変更できるようにmutを付ける
    let user = build_user(String::from("Bob"), 25);
    user.age = 26;
    println!("{}は{}歳になりました", user.name, user.age);
}`,
      solution: `struct User {
    name: String,
    age: u32,
}

fn build_user(name: String, age: u32) -> User {
    // フィールド名と変数名が同じなので省略記法が使える
    User { name, age }
}

fn main() {
    // フィールドを変更するのでmutを付ける
    let mut user = build_user(String::from("Bob"), 25);
    user.age = 26;
    println!("{}は{}歳になりました", user.name, user.age);
}`,
      hints: [
        `フィールド名と変数名が同じときは「name: name」を「name」とだけ書けます。`,
        `フィールドへの代入はインスタンス全体が可変である必要があります。「let mut user = ...」としてください。`
      ],
      expectedOutput: "Bobは26歳になりました"
    },
    {
      id: 64,
      title: "構造体更新記法..",
      explanation: `<p>「既存のインスタンスとほとんど同じで、一部のフィールドだけ違う」新しいインスタンスを作りたい場面はよくあります。全フィールドを書き写してもよいのですが、Rustには<strong>構造体更新記法</strong>という便利な書き方があります。</p>
<pre><code>let config2 = Config {
    title: String::from("設定画面"),
    ..config1   // 残りのフィールドはconfig1から持ってくる
};</code></pre>
<p><code>..config1</code>は「明示していない残りのフィールドは<code>config1</code>と同じ値にする」という意味で、<strong>必ず最後に書き、末尾にカンマは付けません</strong>。</p>
<p>ここで注意すべきなのが所有権です。更新記法は代入と同じように動くため、<code>String</code>のような<strong>ムーブされる型のフィールドが元のインスタンスから持ってこられると、元のインスタンスの一部（またはその全体としての利用）が使えなくなります</strong>。一方、<code>u32</code>のようなCopyな型のフィールドはコピーされるだけなので影響ありません。</p>
<table>
<tr><th>持ってくるフィールドの型</th><th>元のインスタンスへの影響</th></tr>
<tr><td>u32やboolなどCopyな型</td><td>コピーされるだけで影響なし</td></tr>
<tr><td>StringなどCopyでない型</td><td>ムーブされ、そのフィールドは使えなくなる</td></tr>
</table>
<p>今回の課題では<code>String</code>型の<code>title</code>を明示的に新しい値で指定するので、<code>config1</code>から持ってくるのはCopyな<code>u32</code>だけです。そのため<code>config1</code>は後からでも問題なく使えます。</p>`,
      task: `構造体更新記法<code>..</code>を使って、<code>config2</code>の作成コードを「<code>title</code>だけ新しく指定し、残りは<code>config1</code>から引き継ぐ」形に書き換えてください。`,
      code: `struct Config {
    width: u32,
    height: u32,
    title: String,
}

fn main() {
    let config1 = Config {
        width: 800,
        height: 600,
        title: String::from("デフォルト"),
    };

    // TODO: 構造体更新記法..を使って、titleだけ変えた新しいインスタンスを作る
    let config2 = Config {
        width: 800,
        height: 600,
        title: String::from("設定画面"),
    };

    println!("config2：{}x{}（{}）", config2.width, config2.height, config2.title);
    println!("config1のtitle：{}", config1.title);
}`,
      solution: `struct Config {
    width: u32,
    height: u32,
    title: String,
}

fn main() {
    let config1 = Config {
        width: 800,
        height: 600,
        title: String::from("デフォルト"),
    };

    // titleだけ新しく指定し、widthとheightはconfig1から引き継ぐ
    // 引き継がれるのはCopyなu32だけなので、config1はこの後も使える
    let config2 = Config {
        title: String::from("設定画面"),
        ..config1
    };

    println!("config2：{}x{}（{}）", config2.width, config2.height, config2.title);
    println!("config1のtitle：{}", config1.title);
}`,
      hints: [
        `変えたいフィールド（title）だけ先に書き、最後に「..config1」と書くと残りが引き継がれます。`,
        `「..config1」は必ず一番最後に書きます。末尾にカンマは付けません。`
      ],
      expectedOutput: "config2：800x600（設定画面）"
    },
    {
      id: 65,
      title: "タプル構造体とユニット構造体",
      explanation: `<p>構造体には、これまで学んだ「名前付きフィールドを持つ構造体」のほかに2つの仲間がいます。</p>
<h4>タプル構造体</h4>
<p><strong>フィールドに名前がなく、型だけを並べた構造体</strong>です。タプルに型名を付けたものと考えると分かりやすいでしょう。</p>
<pre><code>struct Point(i32, i32);
struct Rgb(u8, u8, u8);

let p = Point(3, 7);
println!("x={}, y={}", p.0, p.1); // タプルと同じく .0 .1 でアクセス</code></pre>
<p>重要なのは、<code>Point</code>と<code>Rgb</code>は中身の構成が似ていても<strong>まったく別の型</strong>として扱われる点です。座標を渡すべき関数に誤って色を渡す、といったミスをコンパイラが防いでくれます。ただのタプル<code>(i32, i32)</code>ではこの区別はできません。</p>
<h4>ユニット構造体</h4>
<p><strong>フィールドを1つも持たない構造体</strong>です。波かっこも丸かっこも書かず、名前だけで定義します。</p>
<pre><code>struct Marker;

let _m = Marker;</code></pre>
<p>データは持ちませんが「型として存在すること」自体に意味があり、後の章で学ぶトレイトと組み合わせる場面などで使われます。今は「こういう書き方もある」と知っておけば十分です。</p>
<table>
<tr><th>種類</th><th>定義例</th><th>アクセス方法</th></tr>
<tr><td>名前付きフィールド</td><td>struct User { name: String }</td><td>user.name</td></tr>
<tr><td>タプル構造体</td><td>struct Point(i32, i32);</td><td>p.0、p.1</td></tr>
<tr><td>ユニット構造体</td><td>struct Marker;</td><td>フィールドなし</td></tr>
</table>`,
      task: `タプル構造体<code>Point</code>のインスタンス<code>p</code>から、<code>.0</code>と<code>.1</code>を使ってx座標とy座標を取り出し、<code>println!</code>を完成させてください。`,
      code: `// タプル構造体：フィールドに名前がなく、型だけを並べる
struct Point(i32, i32);
struct Rgb(u8, u8, u8);

fn main() {
    let p = Point(3, 7);
    let red = Rgb(255, 0, 0);

    // TODO: pの1番目と2番目の値を .0 .1 で取り出して表示する
    println!("x={}, y={}", 0, 0);

    println!("赤のRGB値：({}, {}, {})", red.0, red.1, red.2);
}`,
      solution: `// タプル構造体：フィールドに名前がなく、型だけを並べる
struct Point(i32, i32);
struct Rgb(u8, u8, u8);

fn main() {
    let p = Point(3, 7);
    let red = Rgb(255, 0, 0);

    // タプルと同じく .0 .1 で各要素にアクセスできる
    println!("x={}, y={}", p.0, p.1);

    println!("赤のRGB値：({}, {}, {})", red.0, red.1, red.2);
}`,
      hints: [
        `タプル構造体の要素には、タプルと同じように「変数名.番号」でアクセスします。番号は0から始まります。`,
        `println!の引数の「0, 0」を「p.0, p.1」に書き換えます。`
      ],
      expectedOutput: "x=3, y=7"
    },
    {
      id: 66,
      title: "implとメソッド",
      explanation: `<p>構造体はデータをまとめるだけでなく、<strong>そのデータに関する処理（振る舞い）</strong>も一緒に定義できます。これを<strong>メソッド</strong>と呼び、<code>impl</code>ブロック（implはimplementation＝実装の略）の中に書きます。</p>
<pre><code>struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&amp;self) -&gt; u32 {
        self.width * self.height
    }
}</code></pre>
<p>メソッドは普通の関数とよく似ていますが、<strong>最初の引数が必ず<code>self</code>（自分自身）</strong>になります。<code>&amp;self</code>は「自分自身への参照」で、前章で学んだ借用と同じ仕組みです。メソッドの中では<code>self.width</code>のように自分のフィールドへアクセスできます。</p>
<p>呼び出しは<strong>ドット記法</strong>です。</p>
<pre><code>let rect = Rectangle { width: 10, height: 20 };
println!("面積は{}です", rect.area());</code></pre>
<p><code>rect.area()</code>と書くと、<code>rect</code>への参照が自動的に<code>self</code>として渡されます。関数<code>area(&amp;rect)</code>と書くのと実質同じですが、メソッド記法には「この処理はRectangleに属している」ということがコードの構造として表現できる利点があります。データと処理をセットで整理できるのが、構造体＋<code>impl</code>の大きな魅力です。</p>`,
      task: `<code>impl Rectangle</code>ブロックの中に、幅と高さを掛けた面積を返す<code>area</code>メソッド（<code>&amp;self</code>を取り<code>u32</code>を返す）を定義してください。`,
      code: `struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // TODO: 面積（width * height）を返すareaメソッドを定義する
    // 最初の引数は&self、戻り値の型はu32
}

fn main() {
    let rect = Rectangle {
        width: 10,
        height: 20,
    };
    println!("面積は{}です", rect.area());
}`,
      solution: `struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // 面積を返すメソッド。&selfで自分自身を借用する
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

fn main() {
    let rect = Rectangle {
        width: 10,
        height: 20,
    };
    println!("面積は{}です", rect.area());
}`,
      hints: [
        `メソッドの定義は「fn メソッド名(&self) -> 戻り値の型 { ... }」の形です。`,
        `メソッドの中では self.width と self.height で自分のフィールドにアクセスできます。`
      ],
      expectedOutput: "面積は200です"
    },
    {
      id: 67,
      title: "&selfと&mut selfの使い分け",
      explanation: `<p>メソッドの最初の引数<code>self</code>には、主に次の3つの書き方があります。前章で学んだ「不変参照と可変参照」の関係がそのまま当てはまります。</p>
<table>
<tr><th>書き方</th><th>意味</th><th>使う場面</th></tr>
<tr><td>&amp;self</td><td>不変借用</td><td>フィールドを読むだけのメソッド</td></tr>
<tr><td>&amp;mut self</td><td>可変借用</td><td>フィールドを変更するメソッド</td></tr>
<tr><td>self</td><td>所有権を取る</td><td>自分自身を消費する特殊な場合（まれ）</td></tr>
</table>
<p>フィールドを変更したいのに<code>&amp;self</code>で受け取ると、次のようなコンパイルエラーになります。</p>
<pre><code>fn increment(&amp;self) {
    self.count += 1;
    // error[E0594]: cannot assign to self.count,
    // which is behind a &amp; reference
}</code></pre>
<p>「<code>&amp;</code>参照の先には代入できない」というエラーです。これを直すには<code>&amp;mut self</code>にします。さらに、<strong>可変借用するメソッドを呼ぶには、インスタンス自体も<code>mut</code>で宣言されている必要があります</strong>。</p>
<pre><code>let mut counter = Counter { count: 0 };
counter.increment(); // mutなのでOK</code></pre>
<p>使い分けの指針はシンプルで、<strong>読むだけなら<code>&amp;self</code>、書き換えるなら<code>&amp;mut self</code></strong>です。迷ったらまず<code>&amp;self</code>で書き、コンパイラに怒られたら<code>&amp;mut self</code>に変える、という進め方でも問題ありません。エラーメッセージが正しい方向を教えてくれます。</p>`,
      task: `このコードはコンパイルエラーになります。エラーメッセージを確認し、<code>increment</code>メソッドの<code>self</code>の受け取り方を修正して動くようにしてください。`,
      code: `struct Counter {
    count: u32,
}

impl Counter {
    // このメソッドはコンパイルエラーになる。エラーを読んで直そう
    fn increment(&self) {
        self.count += 1;
    }

    fn value(&self) -> u32 {
        self.count
    }
}

fn main() {
    let mut counter = Counter { count: 0 };
    counter.increment();
    counter.increment();
    counter.increment();
    println!("現在のカウント：{}", counter.value());
}`,
      solution: `struct Counter {
    count: u32,
}

impl Counter {
    // フィールドを変更するので&mut selfで受け取る
    fn increment(&mut self) {
        self.count += 1;
    }

    // 読むだけなので&selfでよい
    fn value(&self) -> u32 {
        self.count
    }
}

fn main() {
    let mut counter = Counter { count: 0 };
    counter.increment();
    counter.increment();
    counter.increment();
    println!("現在のカウント：{}", counter.value());
}`,
      hints: [
        `incrementはself.countに代入（変更）しています。不変借用の&selfでは変更できません。`,
        `「&self」を「&mut self」に書き換えます。valueは読むだけなので&selfのままで大丈夫です。`
      ],
      expectedOutput: "現在のカウント：3"
    },
    {
      id: 68,
      title: "関連関数（new）",
      explanation: `<p><code>impl</code>ブロックには、<strong><code>self</code>を取らない関数</strong>も定義できます。これを<strong>関連関数</strong>と呼びます。メソッドが「インスタンスに対して呼ぶ」のに対し、関連関数は「型に対して呼ぶ」関数で、呼び出しには<code>::</code>を使います。</p>
<pre><code>impl Rectangle {
    // selfを取らないので関連関数
    fn new(width: u32, height: u32) -&gt; Rectangle {
        Rectangle { width, height }
    }
}

let rect = Rectangle::new(4, 6); // 型名::関数名で呼ぶ</code></pre>
<p>実はすでに<code>String::from("...")</code>という形で関連関数を使ってきました。<code>from</code>は<code>String</code>型の関連関数です。</p>
<p>関連関数の最も代表的な使い道が<strong>コンストラクタ（インスタンスを作って返す関数）</strong>で、慣習として<code>new</code>という名前を付けます。Rustには特別なコンストラクタ構文はなく、<code>new</code>はあくまで普通の関連関数ですが、次のような利点があります。</p>
<ul>
<li>呼び出し側が全フィールドを書かなくてよく、コードが短くなる</li>
<li>初期値のルール（たとえば「countは必ず0から始める」）を1箇所に集約できる</li>
<li>フィールド構成を後から変えても、呼び出し側の修正が最小限で済む</li>
</ul>
<table>
<tr><th></th><th>メソッド</th><th>関連関数</th></tr>
<tr><td>第1引数</td><td>&amp;selfなど</td><td>selfなし</td></tr>
<tr><td>呼び出し方</td><td>rect.area()</td><td>Rectangle::new(4, 6)</td></tr>
</table>`,
      task: `<code>impl Rectangle</code>の中に、幅と高さを受け取って<code>Rectangle</code>を返す関連関数<code>new</code>を定義し、<code>main</code>が動くようにしてください。`,
      code: `struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // TODO: widthとheightを受け取ってRectangleを返す関連関数newを定義する
    // ヒント：selfは取らない

    fn area(&self) -> u32 {
        self.width * self.height
    }
}

fn main() {
    // 型名::関数名の形で呼び出す
    let rect = Rectangle::new(4, 6);
    println!("{}x{}の面積は{}です", rect.width, rect.height, rect.area());
}`,
      solution: `struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // インスタンスを作って返す関連関数。慣習としてnewと名付ける
    fn new(width: u32, height: u32) -> Rectangle {
        Rectangle { width, height }
    }

    fn area(&self) -> u32 {
        self.width * self.height
    }
}

fn main() {
    let rect = Rectangle::new(4, 6);
    println!("{}x{}の面積は{}です", rect.width, rect.height, rect.area());
}`,
      hints: [
        `関連関数は「fn new(width: u32, height: u32) -> Rectangle { ... }」のように、selfなしで定義します。`,
        `関数の中身はRectangleのインスタンスを作って返すだけです。引数名とフィールド名が同じなので、ステップ63で学んだ省略記法が使えます。`
      ],
      expectedOutput: "4x6の面積は24です"
    },
    {
      id: 69,
      title: "derive(Debug)と{:?}・{:#?}",
      explanation: `<p>構造体のインスタンスを<code>println!("{}", user)</code>で表示しようとするとコンパイルエラーになります。さらに、デバッグ用の<code>{:?}</code>を使っても、そのままではエラーです。</p>
<pre><code>error[E0277]: User doesn't implement Debug
= help: the trait Debug is not implemented for User
= note: add #[derive(Debug)] to User or manually impl Debug for User</code></pre>
<p>「表示のしかたが定義されていない」というエラーです。エラーメッセージのhelpにある通り、構造体の定義の直前に<strong><code>#[derive(Debug)]</code></strong>という1行を付けると解決します。これは「デバッグ表示の機能を自動で実装してください」というコンパイラへの指示です（属性と呼ばれる記法です。仕組みの詳細は後の章のトレイトで学ぶので、今は「この1行で<code>{:?}</code>が使えるようになる」と理解すれば十分です）。</p>
<pre><code>#[derive(Debug)]
struct User {
    name: String,
    age: u32,
}</code></pre>
<p>表示には2つの形式があります。</p>
<table>
<tr><th>書式</th><th>出力</th><th>用途</th></tr>
<tr><td>{:?}</td><td>1行にまとめて表示</td><td>簡単な確認</td></tr>
<tr><td>{:#?}</td><td>フィールドごとに改行・整形して表示</td><td>フィールドが多いときの確認</td></tr>
</table>
<pre><code>println!("{:?}", user);
// User { name: "Alice", age: 30 }

println!("{:#?}", user);
// User {
//     name: "Alice",
//     age: 30,
// }</code></pre>
<p>開発中に「今この構造体はどんな値か」を確認する最も手軽な方法なので、デバッグの定番テクニックとして必ず覚えておきましょう。</p>`,
      task: `このコードはコンパイルエラーになります。エラーメッセージのhelpを参考に、<code>User</code>を<code>{:?}</code>と<code>{:#?}</code>で表示できるように1行追加してください。`,
      code: `// このままではコンパイルエラーになる。エラーのhelpを読んで直そう
struct User {
    name: String,
    age: u32,
}

fn main() {
    let user = User {
        name: String::from("Alice"),
        age: 30,
    };

    // {:?}はデバッグ表示。そのままではUserに表示機能がないためエラー
    println!("{:?}", user);
    println!("{:#?}", user);
}`,
      solution: `// #[derive(Debug)]でデバッグ表示機能を自動実装する
#[derive(Debug)]
struct User {
    name: String,
    age: u32,
}

fn main() {
    let user = User {
        name: String::from("Alice"),
        age: 30,
    };

    // {:?}は1行表示、{:#?}は整形表示
    println!("{:?}", user);
    println!("{:#?}", user);
}`,
      hints: [
        `コンパイルエラーのhelp欄に、追加すべき1行がそのまま書かれています。エラーメッセージをよく読んでみましょう。`,
        `struct Userの定義の直前の行に #[derive(Debug)] を追加します。`
      ],
      expectedOutput: "User { name: \"Alice\", age: 30 }"
    },
    {
      id: 70,
      title: "総合演習（Rectangleの面積・比較）",
      explanation: `<p>この章の総仕上げとして、長方形を表す<code>Rectangle</code>を題材に、学んだ要素をすべて組み合わせたプログラムを完成させます。使う知識は次の通りです。</p>
<ul>
<li><strong>structの定義</strong>（ステップ61）とインスタンス生成（ステップ62）</li>
<li><strong>implとメソッド</strong>（ステップ66）、<strong>&amp;self</strong>（ステップ67）</li>
<li><strong>関連関数new</strong>（ステップ68）</li>
<li><strong>derive(Debug)と{:?}</strong>（ステップ69）</li>
</ul>
<p>今回新しく作るのは、<strong>他の長方形と自分を比較するメソッド</strong>です。「自分の中にもう1つの長方形がすっぽり収まるか」を判定します。</p>
<pre><code>fn can_hold(&amp;self, other: &amp;Rectangle) -&gt; bool {
    self.width &gt; other.width &amp;&amp; self.height &gt; other.height
}</code></pre>
<p>注目してほしいのは引数の<code>other: &amp;Rectangle</code>です。比較のために相手を読むだけなので、所有権を奪わず<strong>参照で借りる</strong>のが適切です。もし<code>other: Rectangle</code>と書くと、呼び出した時点で相手のインスタンスがムーブされ、その後使えなくなってしまいます。前章で学んだ「読むだけなら借用」という原則が、メソッドの引数設計にもそのまま活きています。</p>
<p>呼び出す側は<code>rect1.can_hold(&amp;rect2)</code>のように<code>&amp;</code>を付けて渡します。<code>self</code>には<code>rect1</code>が、<code>other</code>には<code>&amp;rect2</code>が入るという対応関係を意識しながら完成させましょう。</p>`,
      task: `TODOを埋めてプログラムを完成させてください。（1）<code>new</code>関連関数、（2）<code>area</code>メソッド、（3）<code>can_hold</code>メソッド（幅と高さの両方が相手より大きいなら<code>true</code>）の3つを実装します。`,
      code: `#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // TODO(1): widthとheightからRectangleを作る関連関数new

    // TODO(2): 面積を返すareaメソッド

    // TODO(3): 自分の幅と高さが両方ともotherより大きいならtrueを返す
    // can_holdメソッド。引数はother: &Rectangle
}

fn main() {
    let rect1 = Rectangle::new(30, 50);
    let rect2 = Rectangle::new(10, 40);

    println!("rect1 = {:?}", rect1);
    println!("rect1の面積：{}", rect1.area());
    println!("rect2の面積：{}", rect2.area());
    println!("rect1はrect2を格納できる：{}", rect1.can_hold(&rect2));
}`,
      solution: `#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // インスタンスを作る関連関数
    fn new(width: u32, height: u32) -> Rectangle {
        Rectangle { width, height }
    }

    // 面積を返すメソッド
    fn area(&self) -> u32 {
        self.width * self.height
    }

    // 相手がすっぽり収まるか判定するメソッド。相手は参照で借りる
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

fn main() {
    let rect1 = Rectangle::new(30, 50);
    let rect2 = Rectangle::new(10, 40);

    println!("rect1 = {:?}", rect1);
    println!("rect1の面積：{}", rect1.area());
    println!("rect2の面積：{}", rect2.area());
    println!("rect1はrect2を格納できる：{}", rect1.can_hold(&rect2));
}`,
      hints: [
        `newとareaはステップ66と68で作ったものと同じ形です。まずこの2つを完成させましょう。`,
        `can_holdのシグネチャは「fn can_hold(&self, other: &Rectangle) -> bool」です。`,
        `本体は「自分のwidthが相手のwidthより大きい」かつ「自分のheightが相手のheightより大きい」を&&でつなげた式を返します。`
      ],
      expectedOutput: "rect1はrect2を格納できる：true"
    }
  ]
});
