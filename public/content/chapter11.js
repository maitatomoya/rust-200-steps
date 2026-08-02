// 第11章：ジェネリクス
registerChapter({
  number: 11,
  title: "ジェネリクス",
  description: "型を抽象化するジェネリクスを学び、重複のない柔軟なコードを書けるようになります。OptionやResultの正体もここで明らかになります。",
  steps: [
    {
      id: 101,
      title: "なぜジェネリクスが必要か（重複コードの問題）",
      explanation: `<p>これまでの章では、関数の引数や構造体のフィールドに<code>i32</code>や<code>String</code>といった具体的な型を指定してきました。しかし「同じロジックを複数の型に対して使いたい」場面では、型ごとに関数を複製することになります。</p>
<pre><code>// i32のVecから最大値を探す
fn largest_i32(list: &amp;Vec&lt;i32&gt;) -&gt; i32 {
    let mut largest = list[0];
    for item in list {
        if *item &gt; largest {
            largest = *item;
        }
    }
    largest
}

// f64のVecから最大値を探す（中身はまったく同じ！）
fn largest_f64(list: &amp;Vec&lt;f64&gt;) -&gt; f64 {
    let mut largest = list[0];
    for item in list {
        if *item &gt; largest {
            largest = *item;
        }
    }
    largest
}</code></pre>
<p>2つの関数は<strong>型の名前が違うだけで、中身は1文字も違いません</strong>。このような重複には次の問題があります。</p>
<ul>
<li>ロジックを修正するとき、すべてのコピーを直す必要がある（修正漏れの温床）</li>
<li>対応したい型が増えるたびに関数が増える</li>
<li>テストもコピーの数だけ必要になる</li>
</ul>
<p>この問題を解決するのが<strong>ジェネリクス（generics：型を後から差し込めるようにする仕組み）</strong>です。実はすでに使ってきた<code>Vec&lt;i32&gt;</code>や<code>Option&lt;T&gt;</code>の山かっこがまさにジェネリクスです。この章では自分でジェネリックな関数・構造体・enumを定義できるようになります。まずはこのステップで「重複のつらさ」を体験しておきましょう。</p>`,
      task: `コード中のTODO部分に、<code>char</code>のVecから最大値を探す<code>largest_char</code>関数を追加してください（既存の2つの関数をまねてOKです）。重複のつらさを体で感じるのが目的です。`,
      code: `fn largest_i32(list: &Vec<i32>) -> i32 {
    let mut largest = list[0];
    for item in list {
        if *item > largest {
            largest = *item;
        }
    }
    largest
}

fn largest_f64(list: &Vec<f64>) -> f64 {
    let mut largest = list[0];
    for item in list {
        if *item > largest {
            largest = *item;
        }
    }
    largest
}

// TODO: ここにlargest_char関数を追加する（&Vec<char>を受け取りcharを返す）

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    println!("最大のi32: {}", largest_i32(&numbers));

    let floats = vec![1.5, 3.2, 0.8];
    println!("最大のf64: {}", largest_f64(&floats));

    let chars = vec!['y', 'm', 'a', 'q'];
    // TODO: largest_charを呼び出して「最大のchar: y」と表示する
}
`,
      solution: `fn largest_i32(list: &Vec<i32>) -> i32 {
    let mut largest = list[0];
    for item in list {
        if *item > largest {
            largest = *item;
        }
    }
    largest
}

fn largest_f64(list: &Vec<f64>) -> f64 {
    let mut largest = list[0];
    for item in list {
        if *item > largest {
            largest = *item;
        }
    }
    largest
}

fn largest_char(list: &Vec<char>) -> char {
    let mut largest = list[0];
    for item in list {
        if *item > largest {
            largest = *item;
        }
    }
    largest
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    println!("最大のi32: {}", largest_i32(&numbers));

    let floats = vec![1.5, 3.2, 0.8];
    println!("最大のf64: {}", largest_f64(&floats));

    let chars = vec!['y', 'm', 'a', 'q'];
    println!("最大のchar: {}", largest_char(&chars));
}
`,
      hints: [
        `largest_i32関数をコピーして、型の部分だけをcharに書き換えれば動きます。`,
        `charも数値と同じように大小比較ができます（文字コード順）。関数のシグネチャと戻り値の型を両方charにするのを忘れずに。`
      ],
      expectedOutput: "最大のchar: y"
    },
    {
      id: 102,
      title: "ジェネリック関数 fn foo<T>",
      explanation: `<p>前のステップの重複を解消するのが<strong>ジェネリック関数</strong>です。関数名の直後に<code>&lt;T&gt;</code>と書くと「この関数はTという<strong>型パラメータ</strong>（あとから具体的な型が差し込まれる場所）を持つ」という宣言になります。</p>
<pre><code>// Tはどんな型でもよい。Vecの先頭要素を取り出して返す
fn first&lt;T&gt;(mut v: Vec&lt;T&gt;) -&gt; T {
    v.remove(0)
}

fn main() {
    let n = first(vec![10, 20, 30]);      // Tはi32と推論される
    let c = first(vec!['a', 'b', 'c']);   // Tはcharと推論される
    println!("{} {}", n, c);
}</code></pre>
<p>ポイントを整理します。</p>
<ul>
<li><code>&lt;T&gt;</code>の宣言は<strong>関数名の直後</strong>に書く。宣言したTは引数・戻り値・本体で型として使える</li>
<li><code>T</code>という名前は慣習で、type（型）の頭文字。<code>U</code>や<code>Item</code>など別の名前でもよいが、1文字の大文字が一般的</li>
<li>呼び出し時に型を書く必要はほとんどない。コンパイラが引数から<strong>型推論</strong>してくれる</li>
</ul>
<p>重要なのは、ジェネリック関数の中では「Tが何型か」を仮定できないことです。たとえば<code>v.remove(0)</code>のような「どんな型でも成立する操作」はできますが、<code>T + T</code>のような足し算や大小比較はできません（どんな型が来るか分からないため）。この制限を突破する方法はステップ109と第12章で学びます。</p>`,
      task: `コンパイルエラーになっています。<code>first</code>関数がi32専用のため、charのVecを渡せません。関数をジェネリックにして、どの型のVecでも先頭要素を返せるように修正してください。`,
      code: `// この関数はi32専用。charやStringのVecには使えない
fn first(mut v: Vec<i32>) -> i32 {
    v.remove(0)
}

fn main() {
    let n = first(vec![10, 20, 30]);
    println!("最初の数値: {}", n);

    // ここでコンパイルエラー！ firstはVec<i32>しか受け取れない
    let c = first(vec!['あ', 'い', 'う']);
    println!("最初の文字: {}", c);

    let s = first(vec![String::from("Rust"), String::from("Go")]);
    println!("最初の文字列: {}", s);
}
`,
      solution: `// 型パラメータTを宣言し、どの型のVecでも扱えるようにする
fn first<T>(mut v: Vec<T>) -> T {
    v.remove(0)
}

fn main() {
    let n = first(vec![10, 20, 30]);
    println!("最初の数値: {}", n);

    let c = first(vec!['あ', 'い', 'う']);
    println!("最初の文字: {}", c);

    let s = first(vec![String::from("Rust"), String::from("Go")]);
    println!("最初の文字列: {}", s);
}
`,
      hints: [
        `関数名firstの直後に型パラメータの宣言を追加し、引数と戻り値のi32をその型パラメータに置き換えます。`,
        `宣言は「fn 関数名」と「(引数)」の間に山かっこで書きます。引数はVecのT版、戻り値はTになります。`
      ],
      expectedOutput: "最初の文字列: Rust"
    },
    {
      id: 103,
      title: "ジェネリック構造体 Point<T>",
      explanation: `<p>関数だけでなく<strong>構造体</strong>もジェネリックにできます。構造体名の直後に<code>&lt;T&gt;</code>を書き、フィールドの型としてTを使います。</p>
<pre><code>struct Point&lt;T&gt; {
    x: T,
    y: T,
}

fn main() {
    let integer = Point { x: 5, y: 10 };     // Point&lt;i32&gt;
    let float = Point { x: 1.5, y: 4.2 };    // Point&lt;f64&gt;
    println!("({}, {})", integer.x, integer.y);
}</code></pre>
<p>ここで注意すべき重要なルールがあります。<code>Point&lt;T&gt;</code>の定義では<code>x</code>と<code>y</code>が<strong>同じT</strong>なので、1つのインスタンスの中で異なる型を混ぜることはできません。</p>
<pre><code>// これはコンパイルエラー！
// xでTはi32と決まったのに、yにf64を入れようとしている
let wont_work = Point { x: 5, y: 4.0 };</code></pre>
<p>エラーメッセージは「expected integer, found floating-point number」のようになります。「Tは1つのインスタンスにつき1つの型に確定する」という感覚をつかんでください。実はこの仕組みはすでに使っています。<code>Vec&lt;i32&gt;</code>は「Tをi32にしたVec」であり、i32のVecにStringをpushできないのはこのルールのおかげです。ジェネリクスは柔軟さと型安全性を両立させる仕組みなのです。</p>
<p>なお、異なる型を混ぜたい場合の解決策（複数の型パラメータ）は次のステップで学びます。</p>`,
      task: `<code>Point</code>構造体をジェネリックにして、i32の点とf64の点の両方を作れるようにしてください。TODOのコメントに従って修正します。`,
      code: `// TODO: この構造体をジェネリックにする（今はi32専用）
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let integer = Point { x: 5, y: 10 };
    println!("integer: x={}, y={}", integer.x, integer.y);

    // TODO: コメントを外すとエラーになる。構造体をジェネリックにして動かす
    // let float = Point { x: 1.5, y: 4.2 };
    // println!("float: x={}, y={}", float.x, float.y);
}
`,
      solution: `// 型パラメータTを持つジェネリック構造体
struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    let integer = Point { x: 5, y: 10 };
    println!("integer: x={}, y={}", integer.x, integer.y);

    let float = Point { x: 1.5, y: 4.2 };
    println!("float: x={}, y={}", float.x, float.y);
}
`,
      hints: [
        `構造体名Pointの直後に型パラメータの宣言を付け、フィールドxとyの型をその型パラメータにします。`,
        `ジェネリック関数と同じ書き方です。struct Pointの直後に山かっこでTを宣言し、x: T、y: Tとします。`
      ],
      expectedOutput: "float: x=1.5, y=4.2"
    },
    {
      id: 104,
      title: "複数の型パラメータ <T, U>",
      explanation: `<p>前のステップで「1つのTには1つの型しか入らない」ことを学びました。では、xとyに<strong>異なる型</strong>を持たせたい場合はどうするか。答えは簡単で、型パラメータを<strong>カンマ区切りで複数宣言</strong>します。</p>
<pre><code>struct Pair&lt;T, U&gt; {
    first: T,
    second: U,
}

fn main() {
    // TとUが同じ型でもよい
    let both_int = Pair { first: 5, second: 10 };
    // 異なる型でもよい
    let mixed = Pair { first: "score", second: 98 };
    println!("{} {}", both_int.first, mixed.second);
}</code></pre>
<p>型パラメータが2つあれば、組み合わせは自由です。「TとUは<strong>別の型でもよい</strong>」のであって「必ず別の型」ではない点に注意してください。</p>
<p>関数でも同じように複数の型パラメータを使えます。</p>
<pre><code>fn make_pair&lt;T, U&gt;(a: T, b: U) -&gt; Pair&lt;T, U&gt; {
    Pair { first: a, second: b }
}</code></pre>
<p>実はおなじみの<code>Result&lt;T, E&gt;</code>も型パラメータを2つ持つ型です（成功時の型Tと失敗時の型E）。また<code>HashMap&lt;K, V&gt;</code>もキーの型Kと値の型Vの2つを持ちます。型パラメータの名前は自由ですが、意味が伝わる頭文字（EはError、KはKey、VはValue）を使う慣習があります。ただし、型パラメータを増やしすぎると読みにくくなるので、必要な数だけにとどめるのが良い設計です。</p>`,
      task: `コンパイルエラーを修正してください。<code>Pair</code>は型パラメータが1つしかないため、<code>first</code>と<code>second</code>に異なる型を入れられません。型パラメータを2つに増やして解決します。`,
      code: `// 型パラメータが1つなので、firstとsecondは同じ型でなければならない
struct Pair<T> {
    first: T,
    second: T,
}

fn main() {
    // ここでコンパイルエラー！ i32とf64を混ぜようとしている
    let p1 = Pair { first: 5, second: 1.5 };
    println!("p1: {} と {}", p1.first, p1.second);

    let p2 = Pair { first: String::from("score"), second: 98 };
    println!("p2: {} と {}", p2.first, p2.second);
}
`,
      solution: `// 型パラメータを2つにして、異なる型の組み合わせを許可する
struct Pair<T, U> {
    first: T,
    second: U,
}

fn main() {
    let p1 = Pair { first: 5, second: 1.5 };
    println!("p1: {} と {}", p1.first, p1.second);

    let p2 = Pair { first: String::from("score"), second: 98 };
    println!("p2: {} と {}", p2.first, p2.second);
}
`,
      hints: [
        `型パラメータはカンマ区切りで複数宣言できます。firstとsecondにそれぞれ別のパラメータを割り当てましょう。`,
        `struct Pairの山かっこ内をTとUの2つにして、first: T、second: Uとします。`
      ],
      expectedOutput: "p2: score と 98"
    },
    {
      id: 105,
      title: "enumとジェネリクス（Option・Resultの正体）",
      explanation: `<p>enumもジェネリックにできます。そして実は、これまでずっと使ってきた<code>Option</code>と<code>Result</code>は、標準ライブラリが定義している<strong>ただのジェネリックenum</strong>です。定義を見てみましょう。</p>
<pre><code>// 標準ライブラリでの定義（イメージ）
enum Option&lt;T&gt; {
    Some(T),
    None,
}

enum Result&lt;T, E&gt; {
    Ok(T),
    Err(E),
}</code></pre>
<p>魔法のような特別な型だと思っていたかもしれませんが、種明かしをすればこれだけです。<code>Option&lt;i32&gt;</code>は「Someの中身がi32であるOption」、<code>Result&lt;String, io::Error&gt;</code>は「成功ならString、失敗ならio::Errorを持つResult」という意味だったのです。</p>
<p>ジェネリックenumの威力は「<strong>あらゆる型に対して同じ考え方を再利用できる</strong>」ことです。「値があるかないか」という概念はi32にもStringにも独自の構造体にも当てはまります。Optionが1つ定義されているだけで、すべての型に「値がないかもしれない」状態を表現できます。</p>
<p>自分でジェネリックenumを定義するときの文法も、構造体と同じです。enum名の直後に型パラメータを宣言し、バリアント（enumの各選択肢）の中でその型を使います。今回は学習のためにOptionそっくりの<code>MyOption&lt;T&gt;</code>を自作して、Optionの正体を確かめてみましょう。</p>`,
      task: `Optionの正体を確かめるため、自作の<code>MyOption&lt;T&gt;</code>を完成させてください。TODO部分で、バリアントに型パラメータ<code>T</code>の値を持たせます。`,
      code: `// TODO: Someバリアントが型Tの値を持てるようにする
enum MyOption<T> {
    Some,  // ← ここを修正（Tの値を持たせる）
    None,
}

fn main() {
    // TODO: 上の修正が終わったら、以下がそのまま動く
    let a: MyOption<i32> = MyOption::Some(42);
    let b: MyOption<String> = MyOption::Some(String::from("hello"));
    let c: MyOption<i32> = MyOption::None;

    match a {
        MyOption::Some(n) => println!("aの値: {}", n),
        MyOption::None => println!("aは値なし"),
    }
    match b {
        MyOption::Some(s) => println!("bの値: {}", s),
        MyOption::None => println!("bは値なし"),
    }
    match c {
        MyOption::Some(n) => println!("cの値: {}", n),
        MyOption::None => println!("cは値なし"),
    }
}
`,
      solution: `// 標準ライブラリのOptionと同じ構造のジェネリックenum
enum MyOption<T> {
    Some(T),
    None,
}

fn main() {
    let a: MyOption<i32> = MyOption::Some(42);
    let b: MyOption<String> = MyOption::Some(String::from("hello"));
    let c: MyOption<i32> = MyOption::None;

    match a {
        MyOption::Some(n) => println!("aの値: {}", n),
        MyOption::None => println!("aは値なし"),
    }
    match b {
        MyOption::Some(s) => println!("bの値: {}", s),
        MyOption::None => println!("bは値なし"),
    }
    match c {
        MyOption::Some(n) => println!("cの値: {}", n),
        MyOption::None => println!("cは値なし"),
    }
}
`,
      hints: [
        `enumのバリアントに値を持たせる書き方は第7章で学んだとおり、バリアント名の後ろに丸かっこで型を書きます。`,
        `Someバリアントを「Some(T)」に変更すれば、型パラメータTの値を1つ持てるようになります。`
      ],
      expectedOutput: "bの値: hello"
    },
    {
      id: 106,
      title: "implでジェネリックメソッド",
      explanation: `<p>ジェネリック構造体にメソッドを定義するには、<code>impl</code>にも型パラメータの宣言が必要です。書き方は<code>impl&lt;T&gt; Point&lt;T&gt;</code>となります。</p>
<pre><code>struct Point&lt;T&gt; {
    x: T,
    y: T,
}

impl&lt;T&gt; Point&lt;T&gt; {
    // xフィールドへの参照を返すゲッターメソッド
    fn x(&amp;self) -&gt; &amp;T {
        &amp;self.x
    }
}</code></pre>
<p>「なぜ<code>impl</code>の直後にも<code>&lt;T&gt;</code>を書くのか？」と疑問に思うかもしれません。これは<strong>宣言と使用の区別</strong>です。</p>
<table>
<tr><th>場所</th><th>意味</th></tr>
<tr><td><code>impl&lt;T&gt;</code>の部分</td><td>「これからTという型パラメータを使います」という<strong>宣言</strong></td></tr>
<tr><td><code>Point&lt;T&gt;</code>の部分</td><td>宣言したTを「どのPointに実装するか」の指定に<strong>使用</strong></td></tr>
</table>
<p><code>impl&lt;T&gt; Point&lt;T&gt;</code>と書くと「あらゆる型TのPointに対してこのメソッドを実装する」という意味になります。つまり<code>Point&lt;i32&gt;</code>にも<code>Point&lt;f64&gt;</code>にも<code>Point&lt;String&gt;</code>にも、同じメソッドが使えるようになります。</p>
<p>メソッドの戻り値<code>&amp;T</code>にも注目してください。Tの所有権を奪わずに中身を見せるため、参照を返しています。Tがどんな型か分からない以上、勝手にコピーはできないからです（i32ならコピーは安いですが、Stringかもしれません）。所有権の章で学んだ考え方がここでも生きています。</p>`,
      task: `<code>Point&lt;T&gt;</code>に、<code>y</code>フィールドへの参照を返すメソッド<code>y</code>を追加してください。すでにある<code>x</code>メソッドを参考にできます。`,
      code: `struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }

    // TODO: ここにyフィールドへの参照を返すメソッドyを追加する
}

fn main() {
    let p = Point { x: 5, y: 10 };
    println!("p.x = {}", p.x());
    // TODO: yメソッドを使って「p.y = 10」と表示する

    let q = Point { x: 1.5, y: 2.5 };
    println!("q.x = {}", q.x());
}
`,
      solution: `struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }

    fn y(&self) -> &T {
        &self.y
    }
}

fn main() {
    let p = Point { x: 5, y: 10 };
    println!("p.x = {}", p.x());
    println!("p.y = {}", p.y());

    let q = Point { x: 1.5, y: 2.5 };
    println!("q.x = {}", q.x());
}
`,
      hints: [
        `xメソッドと同じ形で、返すフィールドだけをyに変えます。`,
        `シグネチャはxメソッドと同じく、selfの参照を受け取ってTの参照を返します。本体はself.yに&を付けて返します。`
      ],
      expectedOutput: "q.x = 1.5"
    },
    {
      id: 107,
      title: "特定の型だけのメソッド impl Point<f64>",
      explanation: `<p>前のステップの<code>impl&lt;T&gt; Point&lt;T&gt;</code>は「すべての型のPoint」にメソッドを実装しました。これに対して、<strong>特定の型のPointにだけ</strong>メソッドを実装することもできます。</p>
<pre><code>// f64のPointにだけ実装する。implの後の&lt;T&gt;宣言は不要
impl Point&lt;f64&gt; {
    fn distance_from_origin(&amp;self) -&gt; f64 {
        (self.x * self.x + self.y * self.y).sqrt()
    }
}</code></pre>
<p>ポイントは2つあります。</p>
<ul>
<li><code>impl</code>の直後に<code>&lt;T&gt;</code>が<strong>ない</strong>こと。型パラメータを宣言せず、具体型f64を直接指定している</li>
<li>このメソッドの中では「Tはf64」と確定しているので、<code>sqrt()</code>（平方根を求めるf64のメソッド）のような<strong>f64特有の操作が使える</strong></li>
</ul>
<p>この使い分けは実務でも重要です。「どんな型でも成立する操作」は<code>impl&lt;T&gt;</code>に、「特定の型でしか意味を持たない操作」は<code>impl Point&lt;f64&gt;</code>のような具体型のimplに書きます。両方を同時に定義してもかまいません。</p>
<pre><code>let p = Point { x: 3.0, y: 4.0 };   // Point&lt;f64&gt;
p.distance_from_origin();            // OK

let q = Point { x: 3, y: 4 };        // Point&lt;i32&gt;
// q.distance_from_origin();         // エラー！ i32のPointにこのメソッドはない</code></pre>
<p>このように、同じ構造体でも型パラメータの中身によって使えるメソッドが変わります。標準ライブラリでもこの技法は多用されており、たとえば<code>Vec&lt;u8&gt;</code>（バイト列）にだけ存在するメソッドなどがあります。</p>`,
      task: `<code>Point&lt;f64&gt;</code>にだけ、原点からの距離を返すメソッド<code>distance_from_origin</code>を実装してください。距離は「xの2乗とyの2乗の和の平方根」で、平方根は<code>sqrt()</code>で求められます。`,
      code: `struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn new(x: T, y: T) -> Point<T> {
        Point { x, y }
    }
}

// TODO: ここにPoint<f64>専用のimplブロックを書き、
// distance_from_originメソッド（&selfを受け取りf64を返す）を実装する

fn main() {
    let p = Point::new(3.0, 4.0);
    // TODO: 上の実装が終わったらコメントを外す
    // println!("原点からの距離: {}", p.distance_from_origin());

    let q = Point::new(3, 4);
    println!("整数の点: ({}, {})", q.x, q.y);
}
`,
      solution: `struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn new(x: T, y: T) -> Point<T> {
        Point { x, y }
    }
}

// f64のPointにだけ距離計算メソッドを実装する
impl Point<f64> {
    fn distance_from_origin(&self) -> f64 {
        (self.x * self.x + self.y * self.y).sqrt()
    }
}

fn main() {
    let p = Point::new(3.0, 4.0);
    println!("原点からの距離: {}", p.distance_from_origin());

    let q = Point::new(3, 4);
    println!("整数の点: ({}, {})", q.x, q.y);
}
`,
      hints: [
        `implの直後に型パラメータの宣言を書かず、Pointの山かっこにf64を直接指定します。`,
        `本体は self.x * self.x + self.y * self.y を丸かっこで囲み、.sqrt()を呼び出して返します。3の2乗＋4の2乗＝25の平方根なので結果は5です。`
      ],
      expectedOutput: "原点からの距離: 5"
    },
    {
      id: 108,
      title: "単相化とゼロコスト抽象化",
      explanation: `<p>「ジェネリクスを使うと、実行時に型を判定する分だけ遅くなるのでは？」と心配になるかもしれません。答えは<strong>ノー</strong>です。Rustのジェネリクスは実行時のコストが一切かかりません。その理由が<strong>単相化（monomorphization：モノモーフィゼーション）</strong>です。</p>
<p>単相化とは、コンパイラが「ジェネリックなコードが実際にどの型で使われているか」を調べ、<strong>型ごとの専用コードをコンパイル時に生成する</strong>仕組みです。</p>
<pre><code>fn wrap&lt;T&gt;(value: T) -&gt; Option&lt;T&gt; {
    Some(value)
}

fn main() {
    let a = wrap(5);      // i32で使用
    let b = wrap(2.5);    // f64で使用
}</code></pre>
<p>このコードをコンパイルすると、コンパイラは内部的に次のような専用関数を作ります（イメージ）。</p>
<pre><code>// コンパイラが自動生成するコードのイメージ
fn wrap_i32(value: i32) -&gt; Option&lt;i32&gt; { Some(value) }
fn wrap_f64(value: f64) -&gt; Option&lt;f64&gt; { Some(value) }</code></pre>
<p>つまり、第101ステップで手書きしていた「型ごとのコピー」を、<strong>コンパイラが代わりにやってくれる</strong>のです。ソースコードは1つ、実行速度は手書きの専用関数と同じ。これが「<strong>ゼロコスト抽象化</strong>（抽象化のために実行時コストを払わない）」というRustの設計哲学です。</p>
<table>
<tr><th>方式</th><th>採用言語の例</th><th>実行時コスト</th></tr>
<tr><td>単相化</td><td>Rust、C++</td><td>なし（型ごとに専用コードを生成）</td></tr>
<tr><td>型消去</td><td>Java</td><td>キャストなどのコストがかかる場合がある</td></tr>
<tr><td>実行時の型判定</td><td>Python等の動的言語</td><td>毎回の型チェックが必要</td></tr>
</table>
<p>トレードオフとして、使う型の数だけコードが生成されるためコンパイル時間とバイナリサイズは増えます。それでも実行速度を優先するのがRustの選択です。</p>`,
      task: `コードを実行して、1つの<code>wrap</code>関数が3つの型で使われている様子を確認してください。その後、<code>bool</code>型の値<code>true</code>を包む<code>d</code>を追加し、4つすべてを表示してください。`,
      code: `// この1つの関数から、コンパイラが型ごとの専用コードを生成する（単相化）
fn wrap<T>(value: T) -> Option<T> {
    Some(value)
}

fn main() {
    let a = wrap(5);                      // wrapのi32版が生成される
    let b = wrap(2.5);                    // wrapのf64版が生成される
    let c = wrap(String::from("Rust"));   // wrapのString版が生成される
    // TODO: boolのtrueを包むdを追加する

    // TODO: 末尾に {:?} を1つ追加してdも表示する
    println!("{:?} {:?} {:?}", a, b, c);
}
`,
      solution: `// この1つの関数から、コンパイラが型ごとの専用コードを生成する（単相化）
fn wrap<T>(value: T) -> Option<T> {
    Some(value)
}

fn main() {
    let a = wrap(5);                      // wrapのi32版が生成される
    let b = wrap(2.5);                    // wrapのf64版が生成される
    let c = wrap(String::from("Rust"));   // wrapのString版が生成される
    let d = wrap(true);                   // wrapのbool版が生成される

    println!("{:?} {:?} {:?} {:?}", a, b, c, d);
}
`,
      hints: [
        `dの追加はa〜cと同じ書き方です。wrap(true)を呼び出すだけで、コンパイラがbool版を自動生成します。`,
        `println!のフォーマット文字列に4つ目の {:?} を追加し、引数リストの末尾にdを加えます。`
      ],
      expectedOutput: "Some(5) Some(2.5) Some(\"Rust\") Some(true)"
    },
    {
      id: 109,
      title: "型制約が必要になる場面（トレイトへの橋渡し）",
      explanation: `<p>いよいよ第101ステップの重複コードをジェネリクスで書き直します。しかし、素直に書くとコンパイルエラーになります。</p>
<pre><code>fn largest&lt;T&gt;(list: &amp;Vec&lt;T&gt;) -&gt; T {
    let mut largest = list[0];
    for item in list {
        if *item &gt; largest {   // ここでエラー！
            largest = *item;
        }
    }
    largest
}</code></pre>
<p>エラーの内容は「binary operation cannot be applied to type T（この二項演算は型Tに適用できない）」。理由はステップ102で触れたとおり、<strong>Tにはどんな型でも入り得る</strong>からです。i32なら比較できますが、比較のしようがない型が渡されるかもしれません。コンパイラは「すべてのTで安全」と保証できないコードを拒否します。</p>
<p>解決策は、Tに<strong>制約（トレイト境界）</strong>を付けて「比較できる型だけ受け付ける」と宣言することです。</p>
<pre><code>fn largest&lt;T: PartialOrd + Copy&gt;(list: &amp;Vec&lt;T&gt;) -&gt; T</code></pre>
<ul>
<li><code>T: PartialOrd</code>は「Tは大小比較（&lt;や&gt;）ができる型に限る」という制約</li>
<li><code>T: Copy</code>は「Tは代入時にコピーされる型に限る」という制約（<code>list[0]</code>の値の取り出しに必要）</li>
<li><code>+</code>で複数の制約を同時に指定できる</li>
</ul>
<p>この<code>PartialOrd</code>や<code>Copy</code>の正体が<strong>トレイト</strong>です。トレイトは「型が持つ能力」を表す仕組みで、次章のテーマです。ここでは「ジェネリクスで具体的な操作をするには、トレイトによる制約が必要になる」という必然性を押さえてください。ジェネリクスとトレイトはセットで使われる、Rustの型システムの両輪です。</p>`,
      task: `コンパイルエラーになっています。<code>largest</code>関数の型パラメータ<code>T</code>に<code>PartialOrd</code>と<code>Copy</code>の2つの制約を付けて、コンパイルが通るように修正してください。`,
      code: `// 制約がないため、比較演算の部分でコンパイルエラーになる
fn largest<T>(list: &Vec<T>) -> T {
    let mut largest = list[0];
    for item in list {
        if *item > largest {
            largest = *item;
        }
    }
    largest
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    println!("最大の数値: {}", largest(&numbers));

    let chars = vec!['y', 'm', 'a', 'q'];
    println!("最大の文字: {}", largest(&chars));
}
`,
      solution: `// PartialOrd（比較可能）とCopy（コピー可能）の制約を付ける
fn largest<T: PartialOrd + Copy>(list: &Vec<T>) -> T {
    let mut largest = list[0];
    for item in list {
        if *item > largest {
            largest = *item;
        }
    }
    largest
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    println!("最大の数値: {}", largest(&numbers));

    let chars = vec!['y', 'm', 'a', 'q'];
    println!("最大の文字: {}", largest(&chars));
}
`,
      hints: [
        `型パラメータの宣言部分で、Tの後ろにコロンを付けて制約を書きます。複数の制約はプラス記号でつなぎます。`,
        `Tの宣言を「T: PartialOrd + Copy」に書き換えます。関数の他の部分は変更不要です。`
      ],
      expectedOutput: "最大の文字: y"
    },
    {
      id: 110,
      title: "総合演習：ジェネリックなスタックを作る",
      explanation: `<p>この章の総仕上げとして、<strong>どんな型でも積めるスタック</strong>を作ります。スタックとは「後入れ先出し（LIFO：Last In, First Out）」のデータ構造で、本を積み上げるように、最後に載せたものを最初に取り出します。関数呼び出しの管理やブラウザの「戻る」機能など、あらゆる場面で使われる基本構造です。</p>
<p>この演習では、章で学んだ要素をすべて組み合わせます。</p>
<ul>
<li><strong>ジェネリック構造体</strong>：<code>Stack&lt;T&gt;</code>は内部に<code>Vec&lt;T&gt;</code>を持つ</li>
<li><strong>impl&lt;T&gt;によるメソッド定義</strong>：<code>new</code>、<code>push</code>、<code>pop</code>、<code>len</code></li>
<li><strong>ジェネリックenumの活用</strong>：<code>pop</code>は空の可能性があるため<code>Option&lt;T&gt;</code>を返す</li>
</ul>
<p>設計のポイントは<code>pop</code>の戻り値です。空のスタックから取り出そうとしたときにプログラムを停止させるのではなく、<code>Option&lt;T&gt;</code>で「なかったかもしれない」ことを型で表現します。これはVecの<code>pop</code>メソッドと同じ設計で、実は<code>Vec::pop</code>をそのまま活用できます。</p>
<pre><code>struct Stack&lt;T&gt; {
    items: Vec&lt;T&gt;,
}

impl&lt;T&gt; Stack&lt;T&gt; {
    fn new() -&gt; Stack&lt;T&gt; {
        Stack { items: Vec::new() }
    }
    // pushとpopを実装していく
}</code></pre>
<p>「自作の型なのに、i32でもStringでも同じように使える」体験がこの演習のゴールです。標準ライブラリのVecやHashMapが提供している便利さを、自分の手で再現してみましょう。</p>`,
      task: `<code>Stack&lt;T&gt;</code>の<code>push</code>メソッド（要素を積む）と<code>pop</code>メソッド（最後の要素を取り出して<code>Option&lt;T&gt;</code>で返す）を実装し、mainのTODOを完成させてください。内部の<code>Vec</code>の同名メソッドが利用できます。`,
      code: `struct Stack<T> {
    items: Vec<T>,
}

impl<T> Stack<T> {
    fn new() -> Stack<T> {
        Stack { items: Vec::new() }
    }

    // TODO: pushメソッドを実装する（&mut selfとitem: Tを受け取り、items(Vec)に追加する）

    // TODO: popメソッドを実装する（&mut selfを受け取りOption<T>を返す。Vecのpopが使える）

    fn len(&self) -> usize {
        self.items.len()
    }
}

fn main() {
    let mut stack = Stack::new();
    stack.push(10);
    stack.push(20);
    stack.push(30);
    println!("要素数: {}", stack.len());

    // TODO: popの結果をmatchで処理し、
    // Someなら「取り出した値: 30」、Noneなら「スタックは空です」と表示する

    println!("残りの要素数: {}", stack.len());

    // Stringでも同じスタックが使えることを確認
    let mut words: Stack<String> = Stack::new();
    words.push(String::from("Rust"));
    match words.pop() {
        Some(w) => println!("単語: {}", w),
        None => println!("単語なし"),
    }
}
`,
      solution: `struct Stack<T> {
    items: Vec<T>,
}

impl<T> Stack<T> {
    fn new() -> Stack<T> {
        Stack { items: Vec::new() }
    }

    fn push(&mut self, item: T) {
        self.items.push(item);
    }

    fn pop(&mut self) -> Option<T> {
        self.items.pop()
    }

    fn len(&self) -> usize {
        self.items.len()
    }
}

fn main() {
    let mut stack = Stack::new();
    stack.push(10);
    stack.push(20);
    stack.push(30);
    println!("要素数: {}", stack.len());

    match stack.pop() {
        Some(n) => println!("取り出した値: {}", n),
        None => println!("スタックは空です"),
    }

    println!("残りの要素数: {}", stack.len());

    // Stringでも同じスタックが使えることを確認
    let mut words: Stack<String> = Stack::new();
    words.push(String::from("Rust"));
    match words.pop() {
        Some(w) => println!("単語: {}", w),
        None => println!("単語なし"),
    }
}
`,
      hints: [
        `pushは自身を変更するので&mut selfが必要です。本体はself.items.push(item)の1行です。`,
        `popも&mut selfを受け取り、self.items.pop()の結果をそのまま返せばOKです。VecのpopはもともとOptionを返します。`,
        `mainのmatchは、下にあるwordsのmatchとまったく同じ形で書けます。`
      ],
      expectedOutput: "取り出した値: 30"
    }
  ]
});
