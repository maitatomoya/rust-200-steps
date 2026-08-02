// 第6章：参照と借用
registerChapter({
  number: 6,
  title: "参照と借用",
  description: "所有権を移動させずに値を使う「参照と借用」を学びます。可変参照のルール、ダングリング参照の防止、スライスまでを、コンパイルエラーと対話しながら習得します。",
  steps: [
    {
      id: 51,
      title: "参照&で借用する",
      explanation: `<p>第5章では、<code>String</code>を渡すたびに所有権がムーブし、<code>clone</code>で回避するのはコストがかかることを学びました。その根本的な解決策が<strong>参照（reference）</strong>です。</p>
<p>変数名の前に<code>&amp;</code>を付けると、<strong>所有権を移動させずに値を指し示す参照</strong>を作れます。参照を通じて値を使うことを<strong>借用（borrow）</strong>と呼びます。「所有者から値を借りて、使い終わったら返す」イメージです。</p>
<pre><code>let s = String::from("hello");
let r = &amp;s; // sへの参照を作る（借用）

println!("{}", s); // 所有者sはそのまま使える
println!("{}", r); // 参照rからも同じ値が読める</code></pre>
<p>ムーブとの違いを整理します。</p>
<table>
<tr><th></th><th>ムーブ（<code>let r = s;</code>）</th><th>借用（<code>let r = &amp;s;</code>）</th></tr>
<tr><td>所有権</td><td>rへ移動する</td><td>sに残る</td></tr>
<tr><td>元の変数s</td><td>使えなくなる</td><td>使える</td></tr>
<tr><td>データの複製</td><td>されない</td><td>されない</td></tr>
<tr><td>値の破棄</td><td>rのスコープ終了時</td><td>所有者sのスコープ終了時</td></tr>
</table>
<p>参照は所有権を持たないため、参照がスコープを抜けても値は破棄されません。破棄のタイミングを決めるのはあくまで所有者です。<code>println!</code>の<code>{}</code>は参照を渡しても中身の値を表示してくれるので、出力の見た目は同じになります。</p>`,
      task: `まずそのまま実行して、所有者<code>s</code>と参照<code>r</code>の両方から同じ値が出力されることを確認しましょう。次に、文字列を<code>"Rust入門"</code>に書き換えて再実行してください。`,
      code: `fn main() {
    let s = String::from("借用");

    // &sでsへの参照を作る（所有権はsに残る）
    let r = &s;

    // 所有者も参照も両方使える
    println!("s = {}", s);
    println!("r = {}", r);
}`,
      solution: `fn main() {
    let s = String::from("Rust入門");

    // &sでsへの参照を作る（所有権はsに残る）
    let r = &s;

    // 所有者も参照も両方使える
    println!("s = {}", s);
    println!("r = {}", r);
}`,
      hints: [
        "String::from(\"借用\")の中身を\"Rust入門\"に書き換えるだけです。",
        "参照rは所有権を奪わないので、sとrのどちらをprintln!に渡してもエラーになりません。"
      ],
      expectedOutput: "r = Rust入門"
    },
    {
      id: 52,
      title: "関数に参照を渡す（calculate_length）",
      explanation: `<p>参照が最も活躍するのは<strong>関数の引数</strong>です。第5章のステップ46では、関数に<code>String</code>を渡すと所有権がムーブしてしまい、<code>clone</code>で回避しました。参照を使えば、複製もムーブもせずに関数へ値を「貸す」ことができます。</p>
<p>The Rust Programming Language（通称The Book）でも登場する定番の例が<code>calculate_length</code>です。</p>
<pre><code>fn calculate_length(s: &amp;String) -&gt; usize {
    s.len()
} // sは参照なので、スコープを抜けても値は破棄されない

fn main() {
    let s = String::from("hello");
    let len = calculate_length(&amp;s); // &amp;sで「貸すだけ」
    println!("{}の長さは{}", s, len); // sはまだ使える！
}</code></pre>
<p>ポイントは2箇所の<code>&amp;</code>です。</p>
<ul>
<li><strong>関数側</strong>：引数の型を<code>&amp;String</code>（Stringへの参照）にする</li>
<li><strong>呼び出し側</strong>：<code>&amp;s</code>のように<code>&amp;</code>を付けて渡す</li>
</ul>
<p>関数の引数として所有権を借りることを特に「借用」と呼びます。借りているだけなので、関数が終わっても値は破棄されず、呼び出し元で引き続き使えます。<code>len()</code>は文字列のバイト数を返すメソッドで、参照経由でもそのまま呼び出せます。cloneのようなコピーコストが一切かからないのが参照の強みです。</p>`,
      task: `このコードは<code>calculate_length</code>に所有権をムーブさせているため、最後の<code>println!</code>でエラーになります。関数が<code>&amp;String</code>を受け取るように直し、呼び出し側も<code>&amp;</code>を付けて借用に変えてください。`,
      code: `// TODO: 所有権を奪わず、参照を受け取るように直す
fn calculate_length(s: String) -> usize {
    s.len()
}

fn main() {
    let s = String::from("hello");

    // TODO: 参照を渡すように直す
    let len = calculate_length(s);

    // エラー！ sはムーブ済み
    println!("「{}」の長さは{}バイト", s, len);
}`,
      solution: `// 参照を受け取るので、所有権は呼び出し元に残る
fn calculate_length(s: &String) -> usize {
    s.len()
}

fn main() {
    let s = String::from("hello");

    // &sで「貸すだけ」なので、sはこの後も使える
    let len = calculate_length(&s);

    println!("「{}」の長さは{}バイト", s, len);
}`,
      hints: [
        "直す場所は2箇所です。関数の引数の型と、呼び出し時の渡し方の両方に&が必要です。",
        "fn calculate_length(s: &String) -> usize と let len = calculate_length(&s); に書き換えます。"
      ],
      expectedOutput: "「hello」の長さは5バイト"
    },
    {
      id: 53,
      title: "可変参照&mut",
      explanation: `<p><code>&amp;</code>で作る普通の参照は<strong>不変参照</strong>と呼ばれ、値を読むことしかできません。借りた値を<strong>変更</strong>したい場合は、<strong>可変参照</strong><code>&amp;mut</code>を使います。</p>
<pre><code>fn add_world(s: &amp;mut String) {
    s.push_str(" world"); // 可変参照なら変更できる
}

fn main() {
    let mut s = String::from("hello"); // 所有者もmutが必要
    add_world(&amp;mut s); // &amp;mut sで可変借用
    println!("{}", s); // hello world
}</code></pre>
<p>可変参照を使うには3箇所の準備が必要です。忘れやすいのでチェックリストにしましょう。</p>
<table>
<tr><th>場所</th><th>書き方</th><th>意味</th></tr>
<tr><td>変数の宣言</td><td><code>let mut s = ...</code></td><td>そもそも変更可能な変数にする</td></tr>
<tr><td>関数の引数の型</td><td><code>s: &amp;mut String</code></td><td>可変参照を受け取ると宣言</td></tr>
<tr><td>呼び出し側</td><td><code>add_world(&amp;mut s)</code></td><td>可変で貸すことを明示</td></tr>
</table>
<p>不変参照<code>&amp;String</code>のまま<code>push_str</code>を呼ぶと、次のようなエラーになります。</p>
<pre><code>error[E0596]: cannot borrow '*s' as mutable,
              as it is behind a '&amp;' reference</code></pre>
<p>「<code>&amp;</code>参照の先にあるので可変で借用できない」という意味です。呼び出し側にも<code>&amp;mut</code>を書かせるのは、「この関数呼び出しで値が変更されるかもしれない」とコードを読む人に一目で伝えるためのRustの設計です。</p>`,
      task: `このコードは不変参照<code>&amp;String</code>経由で<code>push_str</code>しようとしてエラーになります。関数の引数と呼び出し側の両方を<code>&amp;mut</code>に直して、借用先で文字列を変更できるようにしてください。`,
      code: `// TODO: 変更できるように可変参照を受け取る
fn add_suffix(s: &String) {
    // エラー！ 不変参照の先は変更できない
    s.push_str("を学習中");
}

fn main() {
    let mut s = String::from("Rust");

    // TODO: 可変で貸すように直す
    add_suffix(&s);

    println!("{}", s);
}`,
      solution: `// 可変参照を受け取るので、借用先を変更できる
fn add_suffix(s: &mut String) {
    s.push_str("を学習中");
}

fn main() {
    let mut s = String::from("Rust");

    // &mut sで可変借用する
    add_suffix(&mut s);

    println!("{}", s);
}`,
      hints: [
        "関数の引数の型を&Stringから&mut Stringへ、呼び出しを&sから&mut sへ変えます。",
        "所有者のlet mut s = ...はすでにmut付きなので、直すのは関数側と呼び出し側の2箇所だけです。"
      ],
      expectedOutput: "Rustを学習中"
    },
    {
      id: 54,
      title: "可変参照は同時に1つだけ（エラー修正）",
      explanation: `<p>可変参照には重要な制限があります。<strong>同じ値への可変参照は、同時に1つしか存在できません</strong>。2つ作ろうとするとE0499エラーになります。</p>
<pre><code>error[E0499]: cannot borrow 's' as mutable
              more than once at a time
  |
  |     let r1 = &amp;mut s;
  |              ------ first mutable borrow occurs here
  |     let r2 = &amp;mut s;
  |              ^^^^^^ second mutable borrow occurs here
  |     println!("{} {}", r1, r2);
  |                       -- first borrow later used here</code></pre>
<p>なぜこんな制限があるのでしょうか。2箇所から同時に同じデータを書き換えられると、変更が競合して壊れたデータができる<strong>データ競合</strong>が起こり得ます。多くの言語では実行時にしか発見できないこのバグを、Rustはコンパイル時に禁止してしまうのです。</p>
<p>解決のカギは「<strong>同時に</strong>」の意味です。Rustのコンパイラは参照が<strong>最後に使われた場所</strong>までを借用期間とみなします（この仕組みをNLL：Non-Lexical Lifetimesと呼びます）。つまり、1つ目の可変参照を使い終わってから2つ目を作れば、借用期間が重ならないのでエラーになりません。</p>
<pre><code>let mut s = String::from("a");
let r1 = &amp;mut s;
r1.push_str("b");   // r1はここで使い終わり
let r2 = &amp;mut s;    // OK！ 借用期間が重ならない
r2.push_str("c");</code></pre>
<p>「使い終わってから次を借りる」が鉄則です。</p>`,
      task: `このコードは可変参照を同時に2つ作っているためE0499エラーになります。<code>r1</code>で<code>" world"</code>を追記し終えてから<code>r2</code>を作るように順番を入れ替え、最後は<code>r2</code>だけを出力するように直してください。`,
      code: `fn main() {
    let mut s = String::from("hello");

    let r1 = &mut s;
    let r2 = &mut s; // エラー！ 可変参照が同時に2つ

    r1.push_str(" world");
    println!("r1 = {}, r2 = {}", r1, r2);
}`,
      solution: `fn main() {
    let mut s = String::from("hello");

    // 1つ目の可変借用。使い終わるまでが借用期間
    let r1 = &mut s;
    r1.push_str(" world");

    // r1はもう使わないので、2つ目の可変借用を作れる
    let r2 = &mut s;
    println!("r2 = {}", r2);
}`,
      hints: [
        "可変参照は「借用期間が重ならなければ」複数回作れます。r1の仕事を先に終わらせましょう。",
        "let r1 = &mut s; r1.push_str(\" world\"); のあとに let r2 = &mut s; を移動し、println!ではr2だけを出力します。"
      ],
      expectedOutput: "r2 = hello world"
    },
    {
      id: 55,
      title: "不変参照と可変参照は混在できない（エラー修正）",
      explanation: `<p>借用にはもう1つルールがあります。<strong>不変参照が生きている間は、可変参照を作れません</strong>。混在させるとE0502エラーになります。</p>
<pre><code>error[E0502]: cannot borrow 's' as mutable because
              it is also borrowed as immutable
  |
  |     let r1 = &amp;s;
  |              -- immutable borrow occurs here
  |     let r2 = &amp;mut s;
  |              ^^^^^^ mutable borrow occurs here
  |     println!("{} {}", r1, r2);
  |                       -- immutable borrow later used here</code></pre>
<p>理由を考えてみましょう。不変参照を持っている人は「値は変わらない」と信じて読んでいます。その裏で可変参照が値を書き換えたら、読んでいる内容が突然変わってしまいます。この「読み手と書き手の競合」を防ぐため、Rustの借用ルールは次のように整理できます。</p>
<table>
<tr><th>組み合わせ</th><th>可否</th></tr>
<tr><td>不変参照を何個でも</td><td>OK（読むだけなら競合しない）</td></tr>
<tr><td>可変参照を1個だけ</td><td>OK</td></tr>
<tr><td>不変参照＋可変参照</td><td><strong>NG</strong>（読み書きが競合する）</td></tr>
</table>
<p>解決策は前ステップと同じ発想です。NLLにより、参照の借用期間は「最後に使った場所」までなので、<strong>不変参照を使い終えてから可変参照を作れば</strong>混在にはなりません。</p>
<pre><code>let r1 = &amp;s;
println!("{}", r1); // r1はここで使い終わり
let r2 = &amp;mut s;    // OK！</code></pre>`,
      task: `このコードは不変参照<code>r1</code>が生きている間に可変参照<code>r2</code>を作っているためE0502エラーになります。先に<code>r1</code>を出力して使い終えてから<code>r2</code>を作り、<code>"!"</code>を追記して<code>r2</code>を出力するように直してください。`,
      code: `fn main() {
    let mut s = String::from("Rust");

    let r1 = &s; // 不変借用
    let r2 = &mut s; // エラー！ 不変借用が生きている間は可変借用できない

    r2.push_str("!");
    println!("r1 = {}, r2 = {}", r1, r2);
}`,
      solution: `fn main() {
    let mut s = String::from("Rust");

    // 不変借用は、使い終わるまでが借用期間
    let r1 = &s;
    println!("r1 = {}", r1);

    // r1はもう使わないので、可変借用を作れる
    let r2 = &mut s;
    r2.push_str("!");
    println!("r2 = {}", r2);
}`,
      hints: [
        "不変参照r1の「最後の使用」を、可変参照r2を作るより前に済ませるのがポイントです。",
        "println!(\"r1 = {}\", r1); を先に実行し、そのあとで let r2 = &mut s; と r2.push_str(\"!\"); を行います。"
      ],
      expectedOutput: "r2 = Rust!"
    },
    {
      id: 56,
      title: "ダングリング参照をコンパイラが防ぐ",
      explanation: `<p><strong>ダングリング参照（dangling reference）</strong>とは、すでに解放されたメモリを指してしまっている参照のことです。C/C++では深刻なバグやセキュリティ脆弱性の温床ですが、Rustではコンパイラが<strong>作ること自体を禁止</strong>します。</p>
<pre><code>fn dangle() -&gt; &amp;String {
    let s = String::from("hello");
    &amp;s // sへの参照を返そうとする
} // ここでsはdropされる → 参照だけが残ってしまう！</code></pre>
<p>この関数は、ローカル変数<code>s</code>への参照を返そうとしています。しかし<code>s</code>は関数の終わりでdropされるため、返された参照は解放済みメモリを指すことになります。コンパイラは次のエラーで止めてくれます。</p>
<pre><code>error[E0106]: missing lifetime specifier
  |
  | fn dangle() -&gt; &amp;String {
  |                ^ expected named lifetime parameter
  = help: this function's return type contains
    a borrowed value, but there is no value
    for it to be borrowed from</code></pre>
<p>helpの「借用元となる値が存在しない」という指摘が核心です。関数内で作った値を外に渡したいなら、参照ではなく<strong>所有権ごと返す</strong>のが正解です（第5章ステップ47の復習です）。</p>
<pre><code>fn no_dangle() -&gt; String {
    let s = String::from("hello");
    s // 所有権ごとムーブして返す。破棄されない
}</code></pre>
<p>「値より長生きする参照は存在できない」がRustの大原則です。この原則の詳細な制御（ライフタイム注釈）は後の章で学びます。</p>`,
      task: `関数<code>make_string</code>はローカル変数への参照を返そうとしてE0106エラーになります。戻り値の型を<code>String</code>に変え、参照ではなく所有権ごと返すように直してください。`,
      code: `// TODO: 参照ではなく、所有権ごと返すように直す
fn make_string() -> &String {
    let s = String::from("値をそのまま返す");
    &s // エラー！ sは関数の終わりで破棄される
}

fn main() {
    let s = make_string();
    println!("{}", s);
}`,
      solution: `// 所有権ごとムーブして返すので、値は破棄されない
fn make_string() -> String {
    let s = String::from("値をそのまま返す");
    s
}

fn main() {
    let s = make_string();
    println!("{}", s);
}`,
      hints: [
        "関数内で作った値は、参照ではなく所有権ごと呼び出し元へ渡します。",
        "戻り値の型を&StringからStringに、最後の行を&sからsに変えます。"
      ],
      expectedOutput: "値をそのまま返す"
    },
    {
      id: 57,
      title: "スライスとは",
      explanation: `<p><strong>スライス（slice）</strong>とは、文字列や配列などの<strong>連続したデータの一部分を参照する</strong>仕組みです。参照の一種なので所有権を持たず、元のデータを「部分的に借りる」イメージです。</p>
<p>文字列<code>String</code>の一部を借りるには、<code>&amp;変数名[開始..終了]</code>という範囲記法を使います。範囲は第3章のfor文で使った<code>..</code>と同じで、<strong>終了位置は含まれません</strong>。</p>
<pre><code>let s = String::from("hello world");
let hello = &amp;s[0..5];  // 0〜4バイト目 → "hello"
let world = &amp;s[6..11]; // 6〜10バイト目 → "world"</code></pre>
<p>便利な省略記法もあります。</p>
<table>
<tr><th>書き方</th><th>意味</th></tr>
<tr><td><code>&amp;s[0..5]</code></td><td>0から5の手前まで</td></tr>
<tr><td><code>&amp;s[..5]</code></td><td>先頭から5の手前まで（0を省略）</td></tr>
<tr><td><code>&amp;s[6..]</code></td><td>6から末尾まで（終了を省略）</td></tr>
<tr><td><code>&amp;s[..]</code></td><td>全体</td></tr>
</table>
<p>1つ注意点があります。範囲の数値は<strong>文字数ではなくバイト数</strong>です。日本語のような多バイト文字（UTF-8では1文字3バイトなど）の途中で区切ると実行時にパニック（プログラムの強制終了）するため、この演習では半角英数字の文字列を使います。</p>
<p>スライスも借用の一種なので、前のステップまでに学んだ借用ルール（不変借用中は変更できない等）がそのまま適用されます。</p>`,
      task: `まずそのまま実行して出力を確認しましょう。次に、<code>hello</code>のスライスを省略記法<code>&amp;s[..5]</code>に、<code>world</code>のスライスを<code>&amp;s[6..]</code>に書き換えて、同じ結果になることを確かめてください。`,
      code: `fn main() {
    let s = String::from("hello world");

    // [開始..終了] 終了位置は含まれない
    let hello = &s[0..5];
    let world = &s[6..11];

    println!("hello = {}", hello);
    println!("world = {}", world);
}`,
      solution: `fn main() {
    let s = String::from("hello world");

    // 先頭からの場合は開始を、末尾までの場合は終了を省略できる
    let hello = &s[..5];
    let world = &s[6..];

    println!("hello = {}", hello);
    println!("world = {}", world);
}`,
      hints: [
        "開始が0のときは省略して[..5]、終了が末尾のときは省略して[6..]と書けます。",
        "省略記法に変えても、指している範囲は元のコードとまったく同じです。"
      ],
      expectedOutput: "world = world"
    },
    {
      id: 58,
      title: "文字列スライス&str",
      explanation: `<p>前ステップで作った文字列スライスの型が、第5章で予告した<code>&amp;str</code>です。ここで文字列の型の全体像がつながります。</p>
<ul>
<li><code>String</code>：ヒープ上の文字列データを<strong>所有</strong>する型</li>
<li><code>&amp;str</code>：文字列データの一部（または全部）を<strong>借用</strong>するスライス型</li>
<li>文字列リテラル<code>"hello"</code>：プログラムに埋め込まれたデータを指す<code>&amp;str</code></li>
</ul>
<p>この関係から、実務で重要な指針が導けます。<strong>関数の引数は<code>&amp;String</code>ではなく<code>&amp;str</code>で受け取るべき</strong>、という指針です。</p>
<pre><code>fn describe(s: &amp;str) -&gt; usize {
    s.len()
}

let owned = String::from("hello");
describe(&amp;owned);  // &amp;Stringを渡してもOK！
describe("hi");    // リテラル(&amp;str)もOK！</code></pre>
<p><code>&amp;String</code>を<code>&amp;str</code>の引数に渡せるのは、Rustが自動で型を変換してくれるためです（Deref強制と呼ばれる仕組み。今は「<code>&amp;String</code>は<code>&amp;str</code>に自動で変わる」とだけ覚えれば十分です）。逆方向の変換はないため、引数が<code>&amp;String</code>だとリテラルを渡せません。</p>
<table>
<tr><th>引数の型</th><th><code>&amp;String</code>を渡す</th><th>リテラル<code>&amp;str</code>を渡す</th></tr>
<tr><td><code>s: &amp;String</code></td><td>OK</td><td><strong>NG</strong></td></tr>
<tr><td><code>s: &amp;str</code></td><td>OK（自動変換）</td><td>OK</td></tr>
</table>
<p><code>&amp;str</code>で受ければ両方に対応でき、関数の使い勝手が上がります。標準ライブラリの関数もほぼこの流儀に従っています。</p>`,
      task: `関数<code>describe</code>の引数が<code>&amp;String</code>のため、文字列リテラルを渡している箇所でエラーになります。引数の型を<code>&amp;str</code>に変えて、<code>String</code>もリテラルも両方受け取れる関数に直してください。`,
      code: `// TODO: StringもリテラルもOKな型で受け取るように直す
fn describe(s: &String) -> usize {
    s.len()
}

fn main() {
    let owned = String::from("owned string");
    let literal = "literal";

    println!("ownedの長さ: {}", describe(&owned));

    // エラー！ &strは&Stringとして渡せない
    println!("literalの長さ: {}", describe(literal));
}`,
      solution: `// &strで受ければ、&Stringもリテラルも両方渡せる
fn describe(s: &str) -> usize {
    s.len()
}

fn main() {
    let owned = String::from("owned string");
    let literal = "literal";

    // &Stringは&strへ自動変換される
    println!("ownedの長さ: {}", describe(&owned));

    println!("literalの長さ: {}", describe(literal));
}`,
      hints: [
        "&Stringから&strへは自動変換されますが、逆はできません。広く受けられるのはどちらでしょうか。",
        "引数の型を s: &str に変えるだけで、呼び出し側は一切変更不要です。"
      ],
      expectedOutput: "literalの長さ: 7"
    },
    {
      id: 59,
      title: "配列スライス&[i32]",
      explanation: `<p>スライスは文字列専用ではありません。<strong>配列の一部分</strong>も同じ範囲記法で借用できます。<code>i32</code>の配列から作ったスライスの型は<code>&amp;[i32]</code>と書きます。</p>
<pre><code>let numbers = [10, 20, 30, 40, 50];
let middle = &amp;numbers[1..4]; // [20, 30, 40]を指すスライス
println!("要素数: {}", middle.len()); // 3</code></pre>
<p>文字列のときと同様、関数の引数はスライス型で受けるのが定石です。<code>&amp;[i32]</code>で受ければ、配列全体（<code>&amp;numbers</code>）でも一部分（<code>&amp;numbers[1..4]</code>）でも、さらにはサイズの異なる配列でも同じ関数で処理できます。</p>
<pre><code>fn sum(slice: &amp;[i32]) -&gt; i32 {
    let mut total = 0;
    for i in 0..slice.len() {
        total += slice[i]; // 添字アクセスは配列と同じ
    }
    total
}</code></pre>
<p>スライスでよく使う道具を整理します。</p>
<table>
<tr><th>操作</th><th>書き方</th><th>意味</th></tr>
<tr><td>長さ</td><td><code>slice.len()</code></td><td>要素数を返す</td></tr>
<tr><td>添字アクセス</td><td><code>slice[i]</code></td><td>i番目の要素（範囲外はパニック）</td></tr>
<tr><td>全体スライス</td><td><code>&amp;numbers[..]</code></td><td>配列全体を借用</td></tr>
</table>
<p>第2章で学んだ配列<code>[i32; 5]</code>は要素数まで型の一部だったため、要素数が違うと同じ関数で扱えませんでした。スライス<code>&amp;[i32]</code>は要素数を実行時に持つ参照なので、この制約から解放されます。これがスライスで関数を書く最大の利点です。</p>`,
      task: `関数<code>sum</code>のTODO部分を実装してください。<code>for</code>文で<code>slice</code>の全要素を<code>total</code>に足し合わせます。添字は<code>0..slice.len()</code>の範囲でループしましょう。`,
      code: `// 配列スライスを受け取り、合計を返す
fn sum(slice: &[i32]) -> i32 {
    let mut total = 0;
    // TODO: forでsliceの各要素をtotalに足す
    total
}

fn main() {
    let numbers = [10, 20, 30, 40, 50];

    // 添字1〜3の部分だけを借用する
    let middle = &numbers[1..4];

    println!("middleの要素数: {}", middle.len());
    println!("middleの合計: {}", sum(middle));
}`,
      solution: `// 配列スライスを受け取り、合計を返す
fn sum(slice: &[i32]) -> i32 {
    let mut total = 0;
    // 添字0からlen()の手前までループして足し込む
    for i in 0..slice.len() {
        total += slice[i];
    }
    total
}

fn main() {
    let numbers = [10, 20, 30, 40, 50];

    // 添字1〜3の部分だけを借用する
    let middle = &numbers[1..4];

    println!("middleの要素数: {}", middle.len());
    println!("middleの合計: {}", sum(middle));
}`,
      hints: [
        "第3章で学んだfor文と範囲(0..n)がそのまま使えます。スライスの要素数はslice.len()で取れます。",
        "for i in 0..slice.len() { total += slice[i]; } のように書きます。"
      ],
      expectedOutput: "middleの合計: 90"
    },
    {
      id: 60,
      title: "総合演習：first_word関数",
      explanation: `<p>第6章の総合演習は、The Bookの名物課題<strong>first_word</strong>（文字列の最初の単語を返す関数）です。この章の知識を総結集しましょう。</p>
<ul>
<li><strong>参照<code>&amp;</code></strong>：所有権を移動させずに値を借用する</li>
<li><strong>借用ルール</strong>：可変参照は同時に1つ、不変と可変は混在不可</li>
<li><strong>ダングリング防止</strong>：値より長生きする参照は作れない</li>
<li><strong>スライス</strong>：<code>&amp;str</code>と<code>&amp;[i32]</code>でデータの一部を借用する</li>
<li><strong>引数は<code>&amp;str</code>で受ける</strong>：Stringもリテラルも渡せる</li>
</ul>
<p>first_wordの戦略はこうです。文字列をバイト列に変換し、先頭から空白を探します。空白が見つかったらそこまでのスライスを、見つからなければ全体のスライスを返します。</p>
<pre><code>fn first_word(s: &amp;str) -&gt; &amp;str {
    let bytes = s.as_bytes(); // バイト列に変換
    for i in 0..bytes.len() {
        // 空白が見つかったら、そこまでを返す
        // b' 'はバイトリテラル（半角空白のバイト値）
    }
    // 見つからなければ全体を返す
}</code></pre>
<p>新しい道具を2つ補足します。<code>as_bytes()</code>は文字列をバイト列<code>&amp;[u8]</code>として見る（借用する）メソッド、<code>b' '</code>は半角空白1文字のバイト値（32）を表すバイトリテラルです。<code>bytes[i] == b' '</code>でi番目が空白かを判定できます。</p>
<p>戻り値が<code>&amp;str</code>である点にも注目してください。返すスライスは引数<code>s</code>の一部を借りているだけなので、ダングリング参照にはなりません。位置番号（usize）を返す設計よりも、元の文字列と切り離せないスライスを返す方が安全で、これこそがスライスの真価です。</p>`,
      task: `関数<code>first_word</code>のTODO部分を実装してください。(1)ループ内で<code>bytes[i]</code>が空白<code>b' '</code>と等しければ<code>&amp;s[..i]</code>を<code>return</code>で返す、(2)ループを抜けたら文字列全体のスライス<code>&amp;s[..]</code>を返す、の2箇所です。`,
      code: `// 最初の単語をスライスで返す
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();

    for i in 0..bytes.len() {
        // TODO: bytes[i]が空白(b' ')なら、&s[..i]をreturnで返す
    }

    // TODO: 空白がなければ、文字列全体のスライスを返す
    s
}

fn main() {
    let sentence = String::from("hello rust world");

    // &Stringを渡しても&strに自動変換される
    let word = first_word(&sentence);
    println!("最初の単語: {}", word);

    // リテラルも渡せる
    let single = first_word("onlyoneword");
    println!("単語のみ: {}", single);
}`,
      solution: `// 最初の単語をスライスで返す
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();

    for i in 0..bytes.len() {
        // 空白が見つかったら、先頭からその手前までを返す
        if bytes[i] == b' ' {
            return &s[..i];
        }
    }

    // 空白がなければ、文字列全体のスライスを返す
    &s[..]
}

fn main() {
    let sentence = String::from("hello rust world");

    // &Stringを渡しても&strに自動変換される
    let word = first_word(&sentence);
    println!("最初の単語: {}", word);

    // リテラルも渡せる
    let single = first_word("onlyoneword");
    println!("単語のみ: {}", single);
}`,
      hints: [
        "空白の判定は if bytes[i] == b' ' { ... } です。b' 'は半角空白のバイト値を表します。",
        "ループ内では return &s[..i]; で途中return、ループの後は &s[..] を最後の式として置きます。"
      ],
      expectedOutput: "最初の単語: hello"
    }
  ]
});
