// 第24章：よくあるエラー：トレイトとジェネリクス
registerChapter({
  number: 24,
  title: "よくあるエラー：トレイトとジェネリクス",
  description: "Display未実装、derive忘れ、トレイト境界の不足、ライフタイム注釈の欠落など、トレイトとジェネリクスまわりで頻出するエラーを実際に起こし、メッセージを読んで修正する訓練をします。",
  steps: [
    {
      id: 231,
      title: "E0277：{}で構造体を表示できない（Display未実装）",
      explanation: `<p>自作の構造体を<code>println!("{}", ...)</code>で表示しようとすると、初心者が必ず一度は出会うエラーになります。</p>
<pre><code>error[E0277]: \`User\` doesn't implement \`std::fmt::Display\`
 --&gt; src/main.rs:8:20
  |
8 |     println!("{}", user);
  |                    ^^^^ \`User\` cannot be formatted with the default formatter
  |
  = help: the trait \`std::fmt::Display\` is not implemented for \`User\`
  = note: in format strings you may be able to use \`{:?}\`
          (or {:#?} for pretty-print) instead</code></pre>
<p>E0277は「必要なトレイトが実装されていない」エラーで、この章で繰り返し登場します。注目すべきは最後の<strong>note行</strong>で、「<code>{:?}</code>を使えばよいかもしれない」と代替案まで提示してくれています。フォーマット指定子とトレイトの対応を整理しましょう。</p>
<table>
<tr><th>指定子</th><th>必要なトレイト</th><th>用途</th></tr>
<tr><td><code>{}</code></td><td>Display</td><td>ユーザー向けの表示。自分で実装する必要がある</td></tr>
<tr><td><code>{:?}</code></td><td>Debug</td><td>開発者向けの表示。<code>#[derive(Debug)]</code>で自動実装できる</td></tr>
<tr><td><code>{:#?}</code></td><td>Debug</td><td>フィールドを改行して整形表示</td></tr>
</table>
<p>i32やStringに<code>{}</code>が使えるのは、標準ライブラリがDisplayを実装済みだからです。自作型には「人間向けの表示形式」をRustが勝手に決められないため、Displayは自動導出（derive）できません。デバッグ目的なら<code>#[derive(Debug)]</code>を付けて<code>{:?}</code>で表示するのが最速の解決策です（Displayを自分で実装する方法は本章の最終ステップで扱います）。</p>`,
      task: `コンパイルしてエラーのhelp行とnote行を読み、<code>#[derive(Debug)]</code>を付けて<code>{:?}</code>で表示するように直してください。`,
      code: `struct User {
    name: String,
    age: u32,
}

fn main() {
    let user = User {
        name: String::from("木村"),
        age: 28,
    };
    // UserはDisplayを実装していないため{}で表示できずE0277になる
    println!("{}", user);
}
`,
      solution: `#[derive(Debug)]
struct User {
    name: String,
    age: u32,
}

fn main() {
    let user = User {
        name: String::from("木村"),
        age: 28,
    };
    println!("{:?}", user);
}
`,
      hints: [
        `note行の「you may be able to use {:?} instead」が答えへの近道です。`,
        `構造体定義の直前に<code>#[derive(Debug)]</code>を付け、フォーマット指定子を<code>{:?}</code>に変えます。`
      ],
      expectedOutput: "age: 28 }"
    },
    {
      id: 232,
      title: "E0599：derive(Clone)忘れでcloneできない",
      explanation: `<p>構造体を複製しようと<code>clone()</code>を呼んだのに、Cloneを導出し忘れていると次のエラーになります。</p>
<pre><code>error[E0599]: no method named \`clone\` found for struct \`Point\`
              in the current scope
 --&gt; src/main.rs:10:17
  |
1  | struct Point {
  | ------------ method \`clone\` not found for this struct
...
10 |     let p2 = p1.clone();
  |                 ^^^^^ method not found in \`Point\`
  |
help: consider annotating \`Point\` with \`#[derive(Clone)]\`</code></pre>
<p>E0599は「そのメソッドが見つからない」エラーです。メソッド名のtypoでも出ますが、今回のように<strong>トレイトを実装していないためメソッドが生えていない</strong>ケースが非常に多く、その場合はhelp行が「<code>#[derive(Clone)]</code>を付けてはどうか」と正確な修正案を出してくれます。エラーメッセージのhelp行は当てずっぽうではなく、コンパイラが原因を特定した上での提案なので、まず素直に試す価値があります。</p>
<p>ここでderive（自動導出）の仕組みを整理しておきましょう。<code>clone()</code>はCloneトレイトのメソッドで、<code>#[derive(Clone)]</code>と書くと「全フィールドをcloneする実装」をコンパイラが自動生成します。これが機能するのは<strong>全フィールドの型自身がCloneを実装している</strong>ときだけです（i32もStringも実装済み）。deriveは複数並べられます。</p>
<pre><code>#[derive(Debug, Clone)]
struct Point {
    x: i32,
    y: i32,
}</code></pre>
<p>なお、i32のような小さい型だけの構造体なら<code>Copy</code>も一緒に導出でき、その場合は代入してもムーブせず暗黙にコピーされるようになります。</p>`,
      task: `コンパイルしてエラーのhelp行を読み、その提案どおり<code>Clone</code>を導出して複製できるようにしてください。`,
      code: `#[derive(Debug)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p1 = Point { x: 1, y: 2 };
    // CloneがderiveされていないためcloneメソッドがなくE0599になる
    let p2 = p1.clone();
    println!("{:?} {:?}", p1, p2);
}
`,
      solution: `#[derive(Debug, Clone)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p1 = Point { x: 1, y: 2 };
    let p2 = p1.clone();
    println!("{:?} {:?}", p1, p2);
}
`,
      hints: [
        `help行に「consider annotating Point with #[derive(Clone)]」と修正案がそのまま書かれています。`,
        `既にある<code>#[derive(Debug)]</code>に<code>Clone</code>を追記して<code>#[derive(Debug, Clone)]</code>とします。`
      ],
      expectedOutput: "Point { x: 1, y: 2 } Point { x: 1, y: 2 }"
    },
    {
      id: 233,
      title: "E0277：トレイト境界を満たさない型を渡す",
      explanation: `<p>ジェネリック関数には<code>T: PartialOrd</code>のような<strong>トレイト境界</strong>（型引数が満たすべき条件）が付いていることがあります。条件を満たさない型を渡すとE0277です。</p>
<pre><code>error[E0277]: the trait bound \`Item: PartialOrd\` is not satisfied
  --&gt; src/main.rs:12:21
   |
12 |     let expensive = max_of(Item { price: 300 }, Item { price: 500 });
   |                     ^^^^^^ the trait \`PartialOrd\` is not implemented for \`Item\`
   |
note: required by a bound in \`max_of\`
help: consider annotating \`Item\` with \`#[derive(PartialEq, PartialOrd)]\`</code></pre>
<p>読み方のポイントは2つです。</p>
<ul>
<li><strong>1行目</strong>：「<code>Item: PartialOrd</code>という境界が満たされていない」。つまりItem型が比較可能でない</li>
<li><strong>note行</strong>：「<code>max_of</code>の境界が要求している」。どの関数のどの条件に引っかかったかが分かる</li>
</ul>
<p>PartialOrdは<code>&lt;</code>や<code>&gt;</code>による大小比較を可能にするトレイトです。help行の提案どおり<code>#[derive(PartialEq, PartialOrd)]</code>で導出できますが、<strong>PartialOrdの導出にはPartialEq（==による等価比較）の導出が前提</strong>になる点に注意してください。片方だけ書くと別のエラーになります。</p>
<p>構造体にPartialOrdを導出すると、<strong>フィールドの定義順</strong>で辞書式に比較されます。今回のItemはpriceフィールドだけなので、priceの大小がそのままItemの大小になります。「エラーが出た関数側を直す」のではなく「渡す型に足りないトレイトを実装する」という方向の修正である点が、これまでのステップとの違いです。</p>`,
      task: `コンパイルしてエラーのnote行とhelp行を読み、<code>Item</code>に必要なトレイトを導出して比較できるようにしてください。`,
      code: `#[derive(Debug)]
struct Item {
    price: u32,
}

fn max_of<T: PartialOrd>(a: T, b: T) -> T {
    if a > b {
        a
    } else {
        b
    }
}

fn main() {
    // ItemはPartialOrdを実装していないため境界を満たせずE0277になる
    let expensive = max_of(Item { price: 300 }, Item { price: 500 });
    println!("{:?}", expensive);
}
`,
      solution: `#[derive(Debug, PartialEq, PartialOrd)]
struct Item {
    price: u32,
}

fn max_of<T: PartialOrd>(a: T, b: T) -> T {
    if a > b {
        a
    } else {
        b
    }
}

fn main() {
    let expensive = max_of(Item { price: 300 }, Item { price: 500 });
    println!("{:?}", expensive);
}
`,
      hints: [
        `note行が「max_ofの境界T: PartialOrdが要求している」と教えてくれています。直すのは関数ではなくItem側です。`,
        `<code>#[derive(Debug, PartialEq, PartialOrd)]</code>とします。PartialOrdの導出にはPartialEqも必要です。`
      ],
      expectedOutput: "Item { price: 500 }"
    },
    {
      id: 234,
      title: "E0072：再帰型のサイズが決まらない（Boxで解決）",
      explanation: `<p>enumの中に自分自身を直接入れると、コンパイラが型のサイズを計算できずエラーになります。</p>
<pre><code>error[E0072]: recursive type \`List\` has infinite size
 --&gt; src/main.rs:2:1
  |
2 | enum List {
  | ^^^^^^^^^
3 |     Node(i32, List),
  |               ---- recursive without indirection
  |
help: insert some indirection (e.g., a \`Box\`, \`Rc\`, or \`&amp;\`)
      to break the cycle
  |
3 |     Node(i32, Box&lt;List&gt;),
  |               ++++    +</code></pre>
<p>「infinite size（無限のサイズ）」が原因の核心です。Rustは型のサイズをコンパイル時に確定させる必要がありますが、Listの中にListが丸ごと入っていると「Listのサイズ＝i32＋Listのサイズ」という無限の入れ子になり、サイズが計算できません。</p>
<p>help行が完璧な答えを出しています。「indirection（間接参照）を挟め」、具体的には<code>Box&lt;List&gt;</code>にせよ、と修正後のコードまで表示されます。<code>Box&lt;T&gt;</code>は値をヒープ（実行時に確保されるメモリ領域）に置き、スタックにはそのポインタだけを持つ型です。ポインタのサイズは中身に関係なく固定なので、<code>Box&lt;List&gt;</code>を挟んだ瞬間にListのサイズが確定します。</p>
<p>修正時は定義だけでなく、値を作る側も<code>Box::new(...)</code>で包む必要があります。なお、<code>&amp;List</code>を持つ再帰参照のパターンでmatchすると中身は参照として取り出されますが、関数呼び出しの引数では<code>&amp;Box&lt;List&gt;</code>が自動的に<code>&amp;List</code>へ変換される（Deref変換）ため、再帰関数は自然に書けます。</p>`,
      task: `コンパイルしてhelp行の提案を読み、<code>Node</code>の2番目の要素を<code>Box&lt;List&gt;</code>に変え、値を作る側も<code>Box::new</code>で包んでください。`,
      code: `// Listの中にListが直接入っているためサイズが無限になりE0072になる
enum List {
    Node(i32, List),
    End,
}

fn sum(list: &List) -> i32 {
    match list {
        List::Node(value, rest) => value + sum(rest),
        List::End => 0,
    }
}

fn main() {
    let list = List::Node(1, List::Node(2, List::Node(3, List::End)));
    println!("合計: {}", sum(&list));
}
`,
      solution: `enum List {
    Node(i32, Box<List>),
    End,
}

fn sum(list: &List) -> i32 {
    match list {
        List::Node(value, rest) => value + sum(rest),
        List::End => 0,
    }
}

fn main() {
    let list = List::Node(
        1,
        Box::new(List::Node(2, Box::new(List::Node(3, Box::new(List::End))))),
    );
    println!("合計: {}", sum(&list));
}
`,
      hints: [
        `help行が「Box&lt;List&gt;にせよ」と修正後の形まで表示しています。Boxはヒープへのポインタなのでサイズが固定になります。`,
        `定義を<code>Node(i32, Box&lt;List&gt;)</code>にしたら、mainの値の構築も各Nodeを<code>Box::new(...)</code>で包みます。`
      ],
      expectedOutput: "合計: 6"
    },
    {
      id: 235,
      title: "E0106：構造体の参照にライフタイム注釈がない",
      explanation: `<p>構造体のフィールドに参照（<code>&amp;str</code>など）を持たせようとすると、いきなりこのエラーに出会います。</p>
<pre><code>error[E0106]: missing lifetime specifier
 --&gt; src/main.rs:2:11
  |
2 |     part: &amp;str,
  |           ^ expected named lifetime parameter
  |
help: consider introducing a named lifetime parameter
  |
1 ~ struct Excerpt&lt;'a&gt; {
2 ~     part: &amp;'a str,
  |</code></pre>
<p>「missing lifetime specifier（ライフタイム指定子が無い）」が原因、help行が修正後のコードそのものです。<code>~</code>の付いた行が「このように書き換えよ」という提案になっています。</p>
<p>なぜ注釈が必要なのでしょうか。参照は「他の誰かが所有する値を借りているだけ」なので、<strong>元の値より長生きしてはいけません</strong>。構造体が参照を持つ場合、「この構造体は、借りている値が生きている間しか存在できない」という制約を型に書き込む必要があり、それがライフタイムパラメータ<code>&lt;'a&gt;</code>です。関数の引数では省略規則により書かずに済むことが多いのですが、<strong>構造体の定義では省略できません</strong>。</p>
<pre><code>struct Excerpt&lt;'a&gt; {
    part: &amp;'a str,
}</code></pre>
<p>読み方は「Excerptはあるライフタイム'aに対して定義され、partは少なくとも'aの間有効な参照」です。これで借用チェッカーは「Excerptのインスタンスが、参照元のnovelより長生きしていないか」を検査できるようになります。もし注釈を書きたくなければ、参照ではなく<code>String</code>を所有させるという設計も選べます。</p>`,
      task: `コンパイルしてhelp行の提案を読み、<code>Excerpt</code>にライフタイムパラメータ<code>&lt;'a&gt;</code>を導入してコンパイルを通してください。`,
      code: `// フィールドの参照にライフタイム注釈がないためE0106になる
struct Excerpt {
    part: &str,
}

fn main() {
    let novel = String::from("吾輩は猫である。名前はまだ無い。");
    let first = novel.split('。').next().unwrap();
    let excerpt = Excerpt { part: first };
    println!("冒頭: {}", excerpt.part);
}
`,
      solution: `struct Excerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("吾輩は猫である。名前はまだ無い。");
    let first = novel.split('。').next().unwrap();
    let excerpt = Excerpt { part: first };
    println!("冒頭: {}", excerpt.part);
}
`,
      hints: [
        `help行の「consider introducing a named lifetime parameter」の下に、修正後のコードが表示されています。`,
        `<code>struct Excerpt&lt;'a&gt; { part: &amp;'a str, }</code>とします。使う側のコードは変更不要です。`
      ],
      expectedOutput: "冒頭: 吾輩は猫である"
    },
    {
      id: 236,
      title: "E0597：参照が値より長生きしてしまう",
      explanation: `<p>ライフタイム注釈が正しくても、<strong>使い方</strong>が参照の寿命を超えているとエラーになります。ライフタイム関連で最もよく見るE0597です。</p>
<pre><code>error[E0597]: \`s2\` does not live long enough
  --&gt; src/main.rs:11:39
   |
10 |         let s2 = String::from("やあ");
   |             -- binding \`s2\` declared here
11 |         result = longest(s1.as_str(), s2.as_str());
   |                                       ^^^^^^^^^^^ borrowed value does not
   |                                                   live long enough
12 |     }
   |     - \`s2\` dropped here while still borrowed
13 |     println!("長い方: {}", result);
   |                            ------ borrow later used here</code></pre>
<p>E0597のメッセージは<strong>3点セット</strong>で読みます。</p>
<ol>
<li><strong>declared here</strong>：借りられている値（s2）の宣言位置</li>
<li><strong>dropped here while still borrowed</strong>：値が破棄される位置。内側ブロックの閉じ括弧でs2は破棄される</li>
<li><strong>borrow later used here</strong>：破棄の後で参照を使っている位置。ここが矛盾の発生点</li>
</ol>
<p><code>longest</code>の署名<code>fn longest&lt;'a&gt;(x: &amp;'a str, y: &amp;'a str) -&gt; &amp;'a str</code>は「返す参照は<strong>両方の引数のうち短い方の寿命</strong>までしか有効でない」と宣言しています。s2は内側ブロックで消えるので、resultもそこまでしか使えないのに、外側のprintln!で使おうとして矛盾が生じました。</p>
<p>修正の考え方は2方向あります。<strong>使う側を借用の範囲内に移す</strong>（println!をブロック内へ）か、<strong>値の寿命を延ばす</strong>（s2を外側で宣言する）かです。今回は前者で直します。借用チェッカーとの付き合い方は常に「参照の使用箇所を、元の値の生存範囲に収める」ことに尽きます。</p>`,
      task: `コンパイルしてエラーの3点セット（宣言・破棄・使用）を確認し、<code>result</code>の宣言と<code>println!</code>を内側ブロックの中に移して直してください。`,
      code: `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let s1 = String::from("こんにちは、世界");
    let result;
    {
        let s2 = String::from("やあ");
        // s2はこのブロックの終わりで破棄されるのに、
        // resultが外で使われるためE0597になる
        result = longest(s1.as_str(), s2.as_str());
    }
    println!("長い方: {}", result);
}
`,
      solution: `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let s1 = String::from("こんにちは、世界");
    {
        let s2 = String::from("やあ");
        let result = longest(s1.as_str(), s2.as_str());
        println!("長い方: {}", result);
    }
}
`,
      hints: [
        `「dropped here while still borrowed」と「borrow later used here」の位置関係を見ると、破棄の後に使っていることが分かります。`,
        `println!とresultの宣言を内側ブロックの中に移せば、s2が生きている間に使い終わります。`
      ],
      expectedOutput: "長い方: こんにちは、世界"
    },
    {
      id: 237,
      title: "E0107：型引数の数が合わない",
      explanation: `<p>ジェネリック型に渡す型引数の数を間違えると、E0107になります。</p>
<pre><code>error[E0107]: struct takes 2 generic arguments but 1 generic argument
              was supplied
 --&gt; src/main.rs:8:16
  |
8 |     let entry: Pair&lt;i32&gt; = Pair {
  |                ^^^^ --- supplied 1 generic argument
  |                |
  |                expected 2 generic arguments
  |
note: struct defined here, with 2 generic parameters: \`A\`, \`B\`
help: add missing generic argument
  |
8 |     let entry: Pair&lt;i32, B&gt; = Pair {</code></pre>
<p>メッセージは算数の答え合わせのように明快です。「2個必要なのに1個しか渡されていない」。note行で<strong>定義側のパラメータ名（A・B）</strong>まで教えてくれるので、何が欠けているかすぐ特定できます。help行の<code>Pair&lt;i32, B&gt;</code>の<code>B</code>は「ここに2番目の型を書け」という穴埋めの印です。</p>
<p><code>Pair&lt;A, B&gt;</code>のように型パラメータが2つある型は、使うときも必ず2つの具体型を渡します。今回はfirstに整数、secondにStringを入れているので<code>Pair&lt;i32, String&gt;</code>が正解です。標準ライブラリでも同じことが起こります。</p>
<table>
<tr><th>型</th><th>必要な型引数</th><th>例</th></tr>
<tr><td>Vec&lt;T&gt;</td><td>1個</td><td><code>Vec&lt;i32&gt;</code></td></tr>
<tr><td>HashMap&lt;K, V&gt;</td><td>2個</td><td><code>HashMap&lt;String, i32&gt;</code></td></tr>
<tr><td>Result&lt;T, E&gt;</td><td>2個</td><td><code>Result&lt;i32, String&gt;</code></td></tr>
</table>
<p>なお、型注釈自体を省略して<code>let entry = Pair { ... };</code>と書けば、コンパイラがフィールドの値から型を推論してくれるため、このエラー自体を回避できる場面も多くあります。</p>`,
      task: `コンパイルしてエラーの「expected 2 generic arguments」を確認し、型注釈を<code>Pair&lt;i32, String&gt;</code>に直してください。`,
      code: `struct Pair<A, B> {
    first: A,
    second: B,
}

fn main() {
    // Pairは型引数を2つ取るのに1つしか書いていないためE0107になる
    let entry: Pair<i32> = Pair {
        first: 1,
        second: String::from("りんご"),
    };
    println!("{}: {}", entry.first, entry.second);
}
`,
      solution: `struct Pair<A, B> {
    first: A,
    second: B,
}

fn main() {
    let entry: Pair<i32, String> = Pair {
        first: 1,
        second: String::from("りんご"),
    };
    println!("{}: {}", entry.first, entry.second);
}
`,
      hints: [
        `note行に「2 generic parameters: A, B」とあります。secondフィールドに入れている値の型が2つ目の型引数です。`,
        `<code>Pair&lt;i32, String&gt;</code>とします。あるいは型注釈を丸ごと削って推論に任せることもできます。`
      ],
      expectedOutput: "1: りんご"
    },
    {
      id: 238,
      title: "E0282：型注釈が必要（collectの変換先）",
      explanation: `<p>イテレータの<code>collect</code>は「集めた要素を何に変換するか」を型から決めるメソッドです。変換先が分からないと推論が止まり、E0282になります。</p>
<pre><code>error[E0282]: type annotations needed
 --&gt; src/main.rs:4:9
  |
4 |     let evens = numbers.iter().filter(|&amp;&amp;n| n % 2 == 0).collect();
  |         ^^^^^
  |
help: consider giving \`evens\` an explicit type
  |
4 |     let evens: Vec&lt;_&gt; = numbers.iter()...</code></pre>
<p>「type annotations needed（型注釈が必要）」は、コンパイラの型推論が<strong>手がかり不足で確定できなかった</strong>ことを意味します。collectはVecにもHashMapにもStringにも変換できる万能メソッドなので、目的の型をこちらから伝える必要があるのです。伝え方は2通りあります。</p>
<table>
<tr><th>方法</th><th>書き方</th></tr>
<tr><td>変数に型注釈</td><td><code>let evens: Vec&lt;i32&gt; = ...collect();</code></td></tr>
<tr><td>ターボフィッシュ</td><td><code>...collect::&lt;Vec&lt;i32&gt;&gt;()</code></td></tr>
</table>
<p>help行の<code>Vec&lt;_&gt;</code>のアンダースコアは「要素型は推論に任せる」という意味の穴埋め記号で、コンテナの種類（Vec）さえ伝えれば要素型は文脈から決まる、というヒントです。</p>
<p>もう1つ注意点があります。<code>numbers.iter()</code>が生み出すのは<code>&amp;i32</code>（参照）なので、<code>Vec&lt;i32&gt;</code>に集めたい場合は<code>copied()</code>（参照を外して値をコピーするアダプタ）を挟みます。「iterは参照を返す」ことを忘れると、今度はE0308の型不一致に出会うことになります。</p>`,
      task: `コンパイルしてhelp行を確認し、<code>evens</code>に<code>Vec&lt;i32&gt;</code>の型注釈を付けてください。要素が参照のままにならないよう<code>copied()</code>も挟みます。`,
      code: `fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    // collectの変換先が決められないためE0282になる
    let evens = numbers.iter().filter(|&&n| n % 2 == 0).collect();
    println!("偶数: {:?}", evens);
}
`,
      solution: `fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    let evens: Vec<i32> = numbers.iter().filter(|&&n| n % 2 == 0).copied().collect();
    println!("偶数: {:?}", evens);
}
`,
      hints: [
        `help行が「evensに明示的な型を与えよ」と提案しています。集めたいのはi32のVecです。`,
        `<code>let evens: Vec&lt;i32&gt; = numbers.iter().filter(...).copied().collect();</code>とします。iterの要素は&amp;i32なのでcopied()で値に戻します。`
      ],
      expectedOutput: "偶数: [2, 4]"
    },
    {
      id: 239,
      title: "E0382：into_iterでムーブした後に使う（iterとの違い）",
      explanation: `<p>イテレータの作り方を間違えると、元のVecが使えなくなります。所有権の章で学んだE0382が、イテレータ経由で再登場します。</p>
<pre><code>error[E0382]: borrow of moved value: \`names\`
 --&gt; src/main.rs:5:34
  |
2 |     let names = vec![String::from("佐藤"), String::from("鈴木")];
  |         ----- move occurs because \`names\` has type \`Vec&lt;String&gt;\`,
  |               which does not implement the \`Copy\` trait
3 |     let lengths: Vec&lt;usize&gt; = names.into_iter().map(|name| name.len()).collect();
  |                                     ----------- \`names\` moved due to this method call
5 |     println!("元のリスト: {:?}", names);
  |                                  ^^^^^ value borrowed here after move
  |
note: \`into_iter\` takes ownership of the receiver \`self\`, which moves \`names\`</code></pre>
<p>注目はnote行です。「<strong>into_iterはselfの所有権を取る（ムーブする）</strong>」と明言されています。3種類のイテレータ生成メソッドの違いを整理しましょう。</p>
<table>
<tr><th>メソッド</th><th>要素の型</th><th>元のVec</th><th>使いどころ</th></tr>
<tr><td><code>iter()</code></td><td><code>&amp;T</code>（不変参照）</td><td>その後も使える</td><td>読むだけ</td></tr>
<tr><td><code>iter_mut()</code></td><td><code>&amp;mut T</code>（可変参照）</td><td>その後も使える</td><td>要素を書き換える</td></tr>
<tr><td><code>into_iter()</code></td><td><code>T</code>（所有権ごと）</td><td><strong>消費されて使えない</strong></td><td>要素を別の場所へ移す・最後の変換</td></tr>
</table>
<p>今回は文字数を数えたいだけ、つまり<strong>読むだけ</strong>なので<code>iter()</code>が適切です。<code>name</code>は<code>&amp;String</code>になりますが、<code>len()</code>は参照からそのまま呼べます。into_iterが必要になるのは「Vec&lt;String&gt;の中身を別のVecや構造体に移し替える」ような、要素の所有権自体を渡したい場面です。迷ったらまずiter()で書き、所有権が必要だとコンパイラに言われたらinto_iterを検討する、という順序が安全です。</p>`,
      task: `コンパイルしてnote行の「into_iter takes ownership」を確認し、<code>into_iter()</code>を<code>iter()</code>に変えて、元の<code>names</code>も表示できるようにしてください。`,
      code: `fn main() {
    let names = vec![String::from("佐藤"), String::from("鈴木")];
    // into_iterがnamesの所有権を奪うため、後で使えずE0382になる
    let lengths: Vec<usize> = names.into_iter().map(|name| name.len()).collect();
    println!("元のリスト: {:?}", names);
    println!("文字数: {:?}", lengths);
}
`,
      solution: `fn main() {
    let names = vec![String::from("佐藤"), String::from("鈴木")];
    let lengths: Vec<usize> = names.iter().map(|name| name.len()).collect();
    println!("元のリスト: {:?}", names);
    println!("文字数: {:?}", lengths);
}
`,
      hints: [
        `note行が「into_iterは所有権を取る」と原因を明言しています。読むだけならiter()で十分です。`,
        `<code>names.iter().map(|name| name.len())</code>とします。nameは&amp;Stringですがlen()はそのまま呼べます。`
      ],
      expectedOutput: "文字数: [6, 6]"
    },
    {
      id: 240,
      title: "総合演習：トレイト境界を整えて完成させる",
      explanation: `<p>この章の総仕上げです。今回のコードには、この章で学んだエラーが3種類同時に潜んでいます。コンパイラは複数のエラーをまとめて報告するので、<strong>上から1つずつ</strong>潰していきましょう。</p>
<table>
<tr><th>エラー</th><th>原因</th><th>修正</th></tr>
<tr><td>E0369（比較できない）</td><td><code>print_larger</code>の<code>T</code>に境界がなく<code>&gt;</code>が使えない</td><td><code>T: PartialOrd</code>を追加</td></tr>
<tr><td>E0277（表示できない）</td><td><code>T</code>に<code>Display</code>境界がなく<code>{}</code>で表示できない</td><td><code>+ Display</code>を追加</td></tr>
<tr><td>E0277（Score表示不可）</td><td><code>Score</code>がDisplay未実装</td><td>Displayを自分で実装</td></tr>
</table>
<p>複数の境界は<code>+</code>でつなぎます：<code>fn print_larger&lt;T: PartialOrd + Display&gt;(a: T, b: T)</code>。「比較もしたいし表示もしたい」という関数本体の要求を、そのまま境界として宣言するわけです。</p>
<p>そして今回は、ステップ231で後回しにした<strong>Displayの手動実装</strong>に挑戦します。書き方はほぼ定型文です。</p>
<pre><code>use std::fmt;

impl fmt::Display for Score {
    fn fmt(&amp;self, f: &amp;mut fmt::Formatter&lt;'_&gt;) -&gt; fmt::Result {
        write!(f, "{}: {}点", self.subject, self.point)
    }
}</code></pre>
<p><code>write!</code>はprintln!の親戚で、画面ではなくフォーマッタ<code>f</code>に書き込むマクロです。これを実装すると<code>{}</code>での表示が可能になり、derive(Debug)の機械的な出力と違って「人間に見せたい形式」を自分で設計できます。境界を整え、Displayを実装して、3種類の呼び出しがすべて動くプログラムを完成させましょう。</p>`,
      task: `<code>print_larger</code>に<code>T: PartialOrd + Display</code>の境界を追加し、さらに<code>Score</code>に<code>Display</code>を実装（形式は「教科: 点数点」）して、すべての呼び出しが動くようにしてください。`,
      code: `use std::fmt::Display;

struct Score {
    subject: String,
    point: u32,
}

// Tに境界がないため、比較(E0369)も{}での表示(E0277)もできない
fn print_larger<T>(a: T, b: T) {
    if a > b {
        println!("大きい方: {}", a);
    } else {
        println!("大きい方: {}", b);
    }
}

fn main() {
    print_larger(10, 25);
    print_larger(String::from("apple"), String::from("banana"));
    let s = Score {
        subject: String::from("数学"),
        point: 85,
    };
    // ScoreはDisplay未実装なのでE0277になる
    println!("{}", s);
}
`,
      solution: `use std::fmt;
use std::fmt::Display;

struct Score {
    subject: String,
    point: u32,
}

impl fmt::Display for Score {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}点", self.subject, self.point)
    }
}

fn print_larger<T: PartialOrd + Display>(a: T, b: T) {
    if a > b {
        println!("大きい方: {}", a);
    } else {
        println!("大きい方: {}", b);
    }
}

fn main() {
    print_larger(10, 25);
    print_larger(String::from("apple"), String::from("banana"));
    let s = Score {
        subject: String::from("数学"),
        point: 85,
    };
    println!("{}", s);
}
`,
      hints: [
        `関数本体がTに要求しているのは「&gt;で比較できる」と「{}で表示できる」の2つ。それぞれPartialOrdとDisplayです。`,
        `境界は<code>fn print_larger&lt;T: PartialOrd + Display&gt;(a: T, b: T)</code>のように+でつなぎます。`,
        `ScoreへのDisplay実装は解説の定型文のとおり、<code>impl fmt::Display for Score</code>の中で<code>write!(f, "{}: {}点", ...)</code>を書きます。`
      ],
      expectedOutput: "数学: 85点"
    }
  ]
});
