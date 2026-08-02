// 第13章：ライフタイム
registerChapter({
  number: 13,
  title: "ライフタイム",
  description: "参照が有効な期間を表す「ライフタイム」を学び、借用チェッカーと協力して安全な参照を書けるようになります。",
  steps: [
    {
      id: 121,
      title: "ライフタイムはなぜ必要か（ダングリング参照の復習）",
      explanation: `<p>ライフタイム（lifetime）とは、<strong>参照が有効でいられる期間</strong>のことです。Rustのすべての参照はライフタイムを持っており、コンパイラはこれを使って「もう存在しない値を指す参照」＝<strong>ダングリング参照</strong>を防ぎます。</p>
<p>所有権の章で学んだとおり、値はスコープを抜けると破棄されます。もし破棄された値への参照が残っていたら、それは無効なメモリを指すことになります。C言語などではこれが重大なバグの原因になりますが、Rustでは<strong>コンパイル時に</strong>検出されます。</p>
<pre><code>fn main() {
    let r;                // rの宣言
    {
        let x = 5;        // xはこの内側ブロックで生まれる
        r = &amp;x;        // rはxへの参照
    }                     // ここでxは破棄される
    println!("r: {}", r); // エラー！rは破棄済みのxを指している
}</code></pre>
<p>このコードをコンパイルすると次のようなエラーが出ます。</p>
<pre><code>error[E0597]: 'x' does not live long enough
（xの生存期間が十分に長くない）</code></pre>
<p>エラーメッセージの読み方のポイントは以下のとおりです。</p>
<table>
<tr><th>フレーズ</th><th>意味</th></tr>
<tr><td>does not live long enough</td><td>参照される値の寿命が、参照より短い</td></tr>
<tr><td>borrowed value</td><td>借用されている値（ここではx）</td></tr>
<tr><td>dropped here</td><td>この位置で値が破棄された</td></tr>
</table>
<p>直し方の基本は「<strong>参照される値を、参照と同じかそれより長く生かす</strong>」ことです。値の宣言位置を外側のスコープに移すか、参照を使う処理を値が生きている間に済ませます。</p>`,
      task: `このコードはコンパイルエラーになります。エラーメッセージを読み、変数<code>x</code>の宣言を外側のスコープに移動して、ダングリング参照を解消してください。`,
      code: `fn main() {
    let r;
    {
        let x = 5;
        r = &x; // xは内側のブロックの終わりで破棄される
    }
    // ここではxはもう存在しないのに、rはxを指している
    println!("r: {}", r);
}`,
      solution: `fn main() {
    // xをrと同じスコープで宣言すれば、rが使われる間ずっとxは生きている
    let x = 5;
    let r = &x;
    println!("r: {}", r);
}`,
      hints: [
        `エラーの原因は「参照される値x」が「参照r」より先に破棄されることです。xの寿命を延ばす方法を考えましょう。`,
        `内側のブロック{ }を取り払い、let x = 5;をrより前の行でmain直下に書けば、xはmainの終わりまで生きます。`
      ],
      expectedOutput: "r: 5"
    },
    {
      id: 122,
      title: "借用チェッカーの動き",
      explanation: `<p>ダングリング参照を検出しているのは、コンパイラの中の<strong>借用チェッカー（borrow checker）</strong>という仕組みです。借用チェッカーは、すべての値と参照について「どこからどこまで生きているか」を追跡し、次のルールに違反していないか検査します。</p>
<ul>
<li>参照のライフタイムは、参照される値のライフタイムより長くてはいけない</li>
<li>不変借用（<code>&amp;T</code>）が生きている間、可変借用（<code>&amp;mut T</code>）は作れない（逆も同様）</li>
</ul>
<p>重要なのは、現在のRustでは参照の生存期間が「宣言からスコープの終わりまで」ではなく<strong>「宣言から最後に使われた場所まで」</strong>と判定されることです。これをNLL（Non-Lexical Lifetimes：非字句的ライフタイム）と呼びます。</p>
<pre><code>fn main() {
    let mut s = String::from("hello");
    let r = &amp;s;            // 不変借用が始まる
    println!("{}", r);        // ← rの最後の使用。ここで借用は終わる
    s.push_str(" world");     // OK！もう不変借用は生きていない
}</code></pre>
<p>逆に、不変借用<code>r</code>がまだ使われる前に<code>s</code>を書き換えようとすると、「不変借用中に可変借用はできない」というエラーになります。</p>
<pre><code>error[E0502]: cannot borrow 's' as mutable
because it is also borrowed as immutable
（sは不変借用されているので、可変借用できない）</code></pre>
<p>つまり借用チェッカーとの付き合い方のコツは、<strong>「参照を使い終えてから値を変更する」ように処理の順番を並べ替える</strong>ことです。多くの借用エラーは、行の順番を入れ替えるだけで解決します。</p>`,
      task: `このコードは不変借用<code>r</code>が生きている間に<code>s</code>を変更しているためエラーになります。<code>r</code>を使う<code>println!</code>を<code>push_str</code>より前に移動して、借用の期間が重ならないように直してください。`,
      code: `fn main() {
    let mut s = String::from("hello");
    let r = &s; // 不変借用が始まる
    s.push_str(" world"); // エラー！不変借用中に可変借用はできない
    println!("r = {}", r); // rはここまで生きている
    println!("s = {}", s);
}`,
      solution: `fn main() {
    let mut s = String::from("hello");
    let r = &s; // 不変借用が始まる
    println!("r = {}", r); // rの最後の使用。ここで不変借用は終わる
    s.push_str(" world"); // OK！もう借用は終わっているので変更できる
    println!("s = {}", s);
}`,
      hints: [
        `参照の生存期間は「最後に使われた場所」までです。rの最後の使用を早めれば、借用は早く終わります。`,
        `println!("r = {}", r);の行をpush_strの行より上に移動しましょう。`
      ],
      expectedOutput: "s = hello world"
    },
    {
      id: 123,
      title: "ライフタイム注釈の構文'a",
      explanation: `<p>借用チェッカーは多くの場合、ライフタイムを自動で推論します。しかし関数の引数と戻り値のように<strong>複数の参照が関わる場面</strong>では、「どの参照とどの参照が同じ期間生きるべきか」をコンパイラに伝える必要があります。そのための記法が<strong>ライフタイム注釈</strong>です。</p>
<pre><code>&amp;i32        // ただの参照
&amp;'a i32     // ライフタイム'a付きの参照
&amp;'a mut i32 // ライフタイム'a付きの可変参照</code></pre>
<p>ライフタイム注釈は<code>'a</code>のように<strong>アポストロフィ＋小文字の名前</strong>で書きます。慣習的に<code>'a</code>、<code>'b</code>と短い名前を使います。関数で使うときは、ジェネリクスと同じように山かっこの中で宣言します。</p>
<pre><code>fn pick&lt;'a&gt;(x: &amp;'a str, y: &amp;'a str) -&gt; &amp;'a str {
    x
}</code></pre>
<p>ここで大切な心構えがあります。ライフタイム注釈は<strong>参照の寿命を変えたり延ばしたりするものではありません</strong>。すでにある寿命の関係を「説明するラベル」にすぎません。上の例は「引数xとy、戻り値は、すべて同じ期間'aの間有効な参照です」という<strong>約束</strong>をコンパイラに伝えています。</p>
<table>
<tr><th>記法</th><th>意味</th></tr>
<tr><td><code>&lt;'a&gt;</code></td><td>ライフタイムパラメータ'aの宣言</td></tr>
<tr><td><code>x: &amp;'a str</code></td><td>xは期間'aの間有効な文字列スライスへの参照</td></tr>
<tr><td><code>-&gt; &amp;'a str</code></td><td>戻り値も期間'aの間有効</td></tr>
</table>
<p>変数の型注釈が「値の種類」を説明するように、ライフタイム注釈は「参照の有効期間の関係」を説明する、と覚えましょう。</p>`,
      task: `まずコードをそのまま実行して出力を確認してください。次に、<code>pick</code>関数が<code>x</code>ではなく<code>y</code>を返すように変更して再実行し、出力の変化を確認してください。`,
      code: `// 'aはライフタイムパラメータ。「xもyも戻り値も同じ期間'aの間有効」と宣言している
fn pick<'a>(x: &'a str, y: &'a str) -> &'a str {
    x // TODO: 出力を確認したら、ここをyに変えて再実行する
}

fn main() {
    let s1 = String::from("Rust");
    let s2 = String::from("Book");
    let picked = pick(&s1, &s2);
    println!("選ばれたのは: {}", picked);
}`,
      solution: `// 'aはライフタイムパラメータ。「xもyも戻り値も同じ期間'aの間有効」と宣言している
fn pick<'a>(x: &'a str, y: &'a str) -> &'a str {
    y // xを返してもyを返しても、シグネチャの約束'aを満たしている
}

fn main() {
    let s1 = String::from("Rust");
    let s2 = String::from("Book");
    let picked = pick(&s1, &s2);
    println!("選ばれたのは: {}", picked);
}`,
      hints: [
        `ライフタイム注釈があるおかげで、xとyのどちらを返してもコンパイルが通ります。どちらも期間'aの参照だからです。`,
        `pick関数の本体のxをyに書き換えるだけです。シグネチャは変更不要です。`
      ],
      expectedOutput: "選ばれたのは: Book"
    },
    {
      id: 124,
      title: "関数でライフタイム注釈（longest関数）",
      explanation: `<p>ライフタイム注釈が本当に必要になる典型例が、<strong>2つの文字列スライスのうち長い方を返す</strong><code>longest</code>関数です。まず注釈なしで書いてみると、コンパイルエラーになります。</p>
<pre><code>fn longest(x: &amp;str, y: &amp;str) -&gt; &amp;str {
    if x.len() &gt; y.len() { x } else { y }
}
// error[E0106]: missing lifetime specifier
// （ライフタイム指定子がありません）</code></pre>
<p>なぜエラーになるのでしょうか。戻り値は実行時の条件によって<code>x</code>になることも<code>y</code>になることもあります。コンパイラは<strong>戻り値の参照がxとyのどちらの寿命に縛られるのか、コンパイル時には判断できない</strong>のです。そこで、私たちがライフタイム注釈で関係を宣言します。</p>
<pre><code>fn longest&lt;'a&gt;(x: &amp;'a str, y: &amp;'a str) -&gt; &amp;'a str {
    if x.len() &gt; y.len() { x } else { y }
}</code></pre>
<p>この注釈の意味は「<strong>戻り値の参照は、xとyの両方が有効な期間の間だけ有効</strong>」です。実際には、'aには「xの寿命とyの寿命のうち短い方（重なっている期間）」が当てはまります。呼び出し側は、その期間内でしか戻り値を使えなくなります。</p>
<p>書き方の手順は次の3ステップです。</p>
<ol>
<li>関数名の直後に<code>&lt;'a&gt;</code>を追加してライフタイムパラメータを宣言する</li>
<li>関係づけたい引数の<code>&amp;</code>の直後に<code>'a</code>を書く（<code>&amp;'a str</code>）</li>
<li>戻り値の型にも<code>'a</code>を書く（<code>-&gt; &amp;'a str</code>）</li>
</ol>
<p>なお<code>.len()</code>はバイト数を返すため、日本語のような多バイト文字では文字数と一致しない点にも注意しましょう（「こんにちは」は15バイトです）。</p>`,
      task: `<code>longest</code>関数はライフタイム注釈がないためコンパイルエラーになります。ライフタイムパラメータ<code>'a</code>を宣言し、2つの引数と戻り値に注釈を付けてコンパイルを通してください。`,
      code: `// TODO: この関数にライフタイム注釈'aを追加してコンパイルを通す
// エラー: error[E0106]: missing lifetime specifier
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("こんにちは");
    let s2 = String::from("やあ");
    let result = longest(&s1, &s2);
    println!("長いのは: {}", result);
}`,
      solution: `// 「戻り値はxとyの両方が有効な期間だけ有効」と宣言する
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("こんにちは");
    let s2 = String::from("やあ");
    let result = longest(&s1, &s2);
    println!("長いのは: {}", result);
}`,
      hints: [
        `戻り値がxかyか実行するまで分からないので、両方の引数と戻り値を同じライフタイム'aで結びつける必要があります。`,
        `関数名の後ろに<'a>を書き、各引数を&'a str、戻り値を-> &'a strにします。`
      ],
      expectedOutput: "長いのは: こんにちは"
    },
    {
      id: 125,
      title: "ライフタイムが合わないエラーを読んで直す",
      explanation: `<p>前のステップで作った<code>longest</code>関数は、「戻り値は<strong>xとyのうち寿命が短い方</strong>に縛られる」という約束を持っています。この約束が守れない呼び出し方をすると、コンパイルエラーになります。</p>
<pre><code>fn main() {
    let s1 = String::from("long string is long");
    let result;
    {
        let s2 = String::from("xyz");
        result = longest(s1.as_str(), s2.as_str());
    } // ← ここでs2が破棄される
    println!("長いのは: {}", result); // エラー！
}</code></pre>
<pre><code>error[E0597]: 's2' does not live long enough
（s2の生存期間が十分に長くない）</code></pre>
<p>実行時の値を考えれば、長いのは<code>s1</code>なので<code>result</code>は本当は<code>s1</code>を指しており、動きそうに見えます。しかしコンパイラは<strong>実行時にどちらが返るかを知りません</strong>。シグネチャの約束どおり「resultはs2が破棄された後は使えない」と判断するのです。これはライフタイムの重要な性質です。<strong>借用チェッカーは実際の値ではなく、シグネチャに書かれた約束だけを見て検査します</strong>。</p>
<p>エラーを直す方針は2つあります。</p>
<table>
<tr><th>方針</th><th>やり方</th></tr>
<tr><td>参照される値を長生きさせる</td><td>s2の宣言を外側のスコープへ移動する</td></tr>
<tr><td>参照を短命にする</td><td>println!を内側のブロックの中へ移動する</td></tr>
</table>
<p>今回は前者、つまりs2を外側のスコープで宣言する方法で直してみましょう。どちらの方針も「参照が、参照される値より長生きしない」形に持ち込む点は同じです。</p>`,
      task: `このコードは<code>s2</code>の寿命が足りずコンパイルエラーになります。エラーメッセージを確認したうえで、<code>s2</code>の宣言を内側のブロックから外に出し、ブロック<code>{ }</code>を取り払って直してください。`,
      code: `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("long string is long");
    let result;
    {
        let s2 = String::from("xyz");
        result = longest(s1.as_str(), s2.as_str());
    } // ここでs2が破棄されるので、resultはこの後使えない
    println!("長いのは: {}", result); // エラー: s2 does not live long enough
}`,
      solution: `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("long string is long");
    // s2をresultを使う場所と同じスコープで宣言すれば約束を守れる
    let s2 = String::from("xyz");
    let result = longest(s1.as_str(), s2.as_str());
    println!("長いのは: {}", result);
}`,
      hints: [
        `longestの戻り値は「s1とs2のうち短い方の寿命」に縛られます。s2が破棄された後にresultを使うのが問題です。`,
        `内側のブロック{ }を削除し、let s2 = ...とresultへの代入をmain直下に並べれば、s2はprintln!の時点でも生きています。`
      ],
      expectedOutput: "長いのは: long string is long"
    },
    {
      id: 126,
      title: "構造体に参照を持たせる",
      explanation: `<p>ここまで構造体のフィールドには<code>String</code>や<code>i32</code>のような<strong>所有する型</strong>だけを使ってきました。実はフィールドに<strong>参照</strong>を持たせることもできますが、その場合はライフタイム注釈が必須になります。</p>
<pre><code>struct Excerpt&lt;'a&gt; {
    part: &amp;'a str,
}</code></pre>
<p>この注釈の意味は「<strong>Excerptのインスタンスは、partフィールドが参照している値より長生きできない</strong>」です。注釈がないと次のエラーになります。</p>
<pre><code>error[E0106]: missing lifetime specifier
help: consider introducing a named lifetime parameter
（名前付きライフタイムパラメータの導入を検討してください）</code></pre>
<p>書き方はジェネリック構造体とよく似ています。</p>
<ol>
<li>構造体名の後ろに<code>&lt;'a&gt;</code>を付けて宣言する</li>
<li>参照フィールドの型を<code>&amp;'a str</code>のように注釈する</li>
</ol>
<p>使う場面のイメージを持ちましょう。たとえば長い文書の一部分だけを扱いたいとき、<code>String</code>で持つと文字列のコピー（クローン）が必要ですが、参照で持てば<strong>元のデータを指すだけ</strong>で済み、メモリ効率が良くなります。</p>
<table>
<tr><th>フィールドの型</th><th>特徴</th></tr>
<tr><td><code>String</code></td><td>所有する。構造体が生きている限り常に有効。コピーコストあり</td></tr>
<tr><td><code>&amp;'a str</code></td><td>借用する。軽量だが、元の値より長生きできない制約が付く</td></tr>
</table>
<p>迷ったら所有する型（String）を使うのが簡単ですが、参照を持つ設計ができるとパフォーマンスを意識したコードが書けるようになります。</p>`,
      task: `構造体<code>Excerpt</code>は参照フィールドを持つのにライフタイム注釈がないためエラーになります。構造体に<code>&lt;'a&gt;</code>を宣言し、フィールドの型を<code>&amp;'a str</code>に直してコンパイルを通してください。`,
      code: `// TODO: この構造体にライフタイム注釈'aを追加してコンパイルを通す
// エラー: error[E0106]: missing lifetime specifier
struct Excerpt {
    part: &str,
}

fn main() {
    let novel = String::from("わたしはRustを学んでいる");
    let excerpt = Excerpt { part: &novel };
    println!("抜粋: {}", excerpt.part);
}`,
      solution: `// 「Excerptはpartが参照する値より長生きできない」という宣言
struct Excerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("わたしはRustを学んでいる");
    let excerpt = Excerpt { part: &novel }; // excerptはnovelより長生きできない
    println!("抜粋: {}", excerpt.part);
}`,
      hints: [
        `参照をフィールドに持つ構造体は、「その参照がいつまで有効か」を型の一部として宣言する必要があります。`,
        `struct Excerpt<'a>と宣言し、フィールドをpart: &'a strに変更します。main側の変更は不要です。`
      ],
      expectedOutput: "抜粋: わたしはRustを学んでいる"
    },
    {
      id: 127,
      title: "ライフタイム省略規則（3つのルール）",
      explanation: `<p>「参照を受け取って参照を返す関数は今まで注釈なしで書けていたのに？」と疑問に思ったかもしれません。実はコンパイラには<strong>ライフタイム省略規則（lifetime elision rules）</strong>という3つのルールがあり、パターンに当てはまる場合は注釈を自動で補ってくれます。</p>
<table>
<tr><th>ルール</th><th>内容</th></tr>
<tr><td>ルール1</td><td>引数の各参照に、それぞれ別のライフタイムが割り当てられる</td></tr>
<tr><td>ルール2</td><td>引数の参照が<strong>1つだけ</strong>なら、そのライフタイムが戻り値にも適用される</td></tr>
<tr><td>ルール3</td><td>メソッドで<code>&amp;self</code>か<code>&amp;mut self</code>があるなら、selfのライフタイムが戻り値に適用される</td></tr>
</table>
<p>例で確認しましょう。引数の参照が1つの関数はルール1と2で完全に決まるため、注釈を省略できます。</p>
<pre><code>fn first_five(s: &amp;str) -&gt; &amp;str          // 省略形
fn first_five&lt;'a&gt;(s: &amp;'a str) -&gt; &amp;'a str // コンパイラの解釈</code></pre>
<p>一方、<code>longest(x: &amp;str, y: &amp;str) -&gt; &amp;str</code>はルール1で<code>'a</code>と<code>'b</code>という別々のライフタイムが割り当てられ、ルール2（引数が1つのとき）もルール3（メソッドのとき）も適用できません。戻り値のライフタイムが決められないため、<strong>手書きの注釈が必要だった</strong>のです。</p>
<p>まとめると、注釈を書くべきかの判断は次のようになります。</p>
<ul>
<li>参照の引数が1つ→省略できる</li>
<li>参照の引数が複数で参照を返す→注釈が必要（ルール2が使えない）</li>
<li><code>&amp;self</code>を取るメソッド→ほとんど省略できる（ルール3）</li>
</ul>
<p>省略規則は「よくあるパターンの定型作業をコンパイラが肩代わりする」仕組みであり、推測に失敗する場合は必ずエラーで知らせてくれます。暗黙のうちに間違った寿命が付く心配はありません。</p>`,
      task: `<code>first_five</code>関数は引数の参照が1つだけなので、省略規則により注釈なしで書けます。ライフタイム注釈<code>'a</code>をすべて削除して、省略形に書き直してください。`,
      code: `// TODO: この関数は省略規則が適用できる。'aの注釈をすべて削除して簡潔に書き直す
fn first_five<'a>(s: &'a str) -> &'a str {
    &s[..5]
}

fn main() {
    let text = String::from("hello rust");
    println!("最初の5文字: {}", first_five(&text));
}`,
      solution: `// 引数の参照が1つだけなので、ルール1と2により注釈を省略できる
// コンパイラは fn first_five<'a>(s: &'a str) -> &'a str と解釈する
fn first_five(s: &str) -> &str {
    &s[..5]
}

fn main() {
    let text = String::from("hello rust");
    println!("最初の5文字: {}", first_five(&text));
}`,
      hints: [
        `ルール2により、引数の参照が1つだけの関数は、そのライフタイムが自動的に戻り値へ引き継がれます。`,
        `<'a>の宣言と、&'a strの'aを2か所削除して、fn first_five(s: &str) -> &strにします。`
      ],
      expectedOutput: "最初の5文字: hello"
    },
    {
      id: 128,
      title: "'staticライフタイム",
      explanation: `<p><code>'static</code>は特別なライフタイムで、「<strong>プログラムの実行期間全体にわたって有効</strong>」という意味です。代表例は<strong>文字列リテラル</strong>です。文字列リテラルはプログラムのバイナリに直接埋め込まれるため、いつでも参照できます。</p>
<pre><code>let s: &amp;'static str = "私はずっと生きている";</code></pre>
<p>この性質を使うと、「関数からローカル変数への参照は返せない」問題を、リテラルに限って解決できます。</p>
<pre><code>// エラーになる例：ローカル変数への参照を返している
fn make_greeting() -&gt; &amp;str {
    let s = String::from("こんにちは");
    &amp;s // sは関数の終わりで破棄される！
}

// OKな例：リテラルは'staticなのでいつ返しても安全
fn make_greeting() -&gt; &amp;'static str {
    "こんにちは"
}</code></pre>
<p>注意したいのは、コンパイラのエラーメッセージがときどき「<code>'static</code>を付けてみては」と提案してくることです。しかし多くの場合、本当の問題はダングリング参照やライフタイムの不一致であり、<strong>'staticを付けるのは対症療法にしかなりません</strong>。次の基準で考えましょう。</p>
<table>
<tr><th>状況</th><th>適切な対応</th></tr>
<tr><td>返したい値が文字列リテラル</td><td><code>&amp;'static str</code>を返してよい</td></tr>
<tr><td>関数内で組み立てたStringを返したい</td><td>参照ではなく<code>String</code>を所有権ごと返す</td></tr>
<tr><td>引数の参照をそのまま返したい</td><td><code>'a</code>で引数と戻り値を結びつける</td></tr>
</table>
<p>「その参照は本当にプログラム全体で有効か？」を自問し、YESのときだけ<code>'static</code>を使うのが正しい姿勢です。</p>`,
      task: `<code>make_greeting</code>はローカル変数への参照を返そうとしてエラーになります。今回は固定の挨拶文なので、<code>String</code>を作るのをやめて文字列リテラルを<code>&amp;'static str</code>として返す形に直してください。`,
      code: `// このコードはコンパイルエラーになる
// エラー: cannot return reference to local variable 's'
// TODO: 文字列リテラルを&'static strとして返す形に直す
fn make_greeting() -> &str {
    let s = String::from("こんにちは");
    &s // sは関数の終わりで破棄されるのに、その参照を返している
}

fn main() {
    println!("挨拶: {}", make_greeting());
}`,
      solution: `// 文字列リテラルはプログラム全体で有効（'static）なので、参照を返しても安全
fn make_greeting() -> &'static str {
    "こんにちは"
}

fn main() {
    println!("挨拶: {}", make_greeting());
}`,
      hints: [
        `ローカル変数sは関数の終わりで破棄されるため、その参照は返せません。しかし文字列リテラルなら破棄されることがありません。`,
        `戻り値の型を&'static strにして、本体は"こんにちは"というリテラルをそのまま返します。let文は不要です。`
      ],
      expectedOutput: "挨拶: こんにちは"
    },
    {
      id: 129,
      title: "ジェネリクス＋トレイト境界＋ライフタイムの総合シグネチャ",
      explanation: `<p>これまで学んだ<strong>ジェネリクス</strong>、<strong>トレイト境界</strong>、<strong>ライフタイム</strong>は、1つの関数シグネチャの中で組み合わせて使えます。The Rust Book（Rust公式の入門書）にも登場する集大成の形を見てみましょう。</p>
<pre><code>use std::fmt::Display;

fn longest_with_note&lt;'a, T: Display&gt;(
    x: &amp;'a str,
    y: &amp;'a str,
    note: T,
) -&gt; &amp;'a str {
    println!("メモ: {}", note);
    if x.len() &gt; y.len() { x } else { y }
}</code></pre>
<p>山かっこの中を分解すると、それぞれ役割が異なります。</p>
<table>
<tr><th>部品</th><th>役割</th></tr>
<tr><td><code>'a</code></td><td>ライフタイムパラメータ。x・y・戻り値の有効期間を結びつける</td></tr>
<tr><td><code>T</code></td><td>型パラメータ。noteの型を呼び出しごとに変えられる</td></tr>
<tr><td><code>T: Display</code></td><td>トレイト境界。Tは{}で表示できる型に限定される</td></tr>
</table>
<p>書き方のルールは次の2つだけです。</p>
<ol>
<li>ライフタイムパラメータと型パラメータは<strong>同じ山かっこ</strong>に入れる</li>
<li>順序は<strong>ライフタイムが先、型パラメータが後</strong>（<code>&lt;'a, T&gt;</code>）</li>
</ol>
<p>ライフタイムは「参照の有効期間」に関するジェネリクス、型パラメータは「値の型」に関するジェネリクスです。どちらも「呼び出しごとに具体的な中身が決まるパラメータ」という点で仲間なので、同じ場所で宣言する設計になっています。この形が読めれば、標準ライブラリのドキュメントに出てくる複雑なシグネチャもぐっと読みやすくなります。</p>`,
      task: `関数<code>longest_with_note</code>にライフタイムパラメータ<code>'a</code>と型パラメータ<code>T</code>（トレイト境界<code>T: Display</code>付き）を宣言し、引数と戻り値に注釈を付けてコンパイルを通してください。`,
      code: `use std::fmt::Display;

// TODO: <'a, T: Display>を宣言し、x・y・戻り値に'aを注釈してコンパイルを通す
fn longest_with_note(x: &str, y: &str, note: T) -> &str {
    println!("メモ: {}", note);
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("プログラミング");
    let s2 = String::from("Rust");
    let result = longest_with_note(&s1, &s2, "バイト数で比較します");
    println!("長いのは: {}", result);
}`,
      solution: `use std::fmt::Display;

// ライフタイムが先、型パラメータが後の順で同じ山かっこに宣言する
fn longest_with_note<'a, T: Display>(x: &'a str, y: &'a str, note: T) -> &'a str {
    println!("メモ: {}", note);
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("プログラミング");
    let s2 = String::from("Rust");
    let result = longest_with_note(&s1, &s2, "バイト数で比較します");
    println!("長いのは: {}", result);
}`,
      hints: [
        `ライフタイムパラメータと型パラメータは同じ山かっこに、'aを先にして<'a, T: Display>の順で宣言します。`,
        `引数はx: &'a str、y: &'a str、戻り値は-> &'a strです。noteはT型のままで注釈は不要です。`
      ],
      expectedOutput: "長いのは: プログラミング"
    },
    {
      id: 130,
      title: "総合演習：ライフタイムエラーをすべて直す",
      explanation: `<p>この章で学んだことを総動員して、複数のライフタイムエラーを含むコードを修理しましょう。振り返りとして、要点を整理します。</p>
<table>
<tr><th>場面</th><th>必要な対応</th></tr>
<tr><td>参照を複数受け取り参照を返す関数</td><td><code>fn f&lt;'a&gt;(x: &amp;'a str, y: &amp;'a str) -&gt; &amp;'a str</code></td></tr>
<tr><td>参照をフィールドに持つ構造体</td><td><code>struct S&lt;'a&gt; { field: &amp;'a str }</code></td></tr>
<tr><td>値が参照より先に破棄される</td><td>値の宣言を外側のスコープへ移す</td></tr>
<tr><td>引数の参照が1つだけの関数</td><td>省略規則により注釈不要</td></tr>
</table>
<p>エラーを直すときの手順も再確認しておきましょう。</p>
<ol>
<li>エラーコード（<code>E0106</code>や<code>E0597</code>など）とメッセージを読む</li>
<li><code>missing lifetime specifier</code>なら注釈を追加する</li>
<li><code>does not live long enough</code>なら値と参照の寿命関係を図に描き、値を長生きさせるか参照を短命にする</li>
</ol>
<p>コンパイラのエラーメッセージには<code>help:</code>として修正案が添えられていることが多く、慣れるとエラーメッセージ自体が最高の教材になります。ライフタイムは最初は難しく感じますが、実務のコードで自分がゼロから注釈を書く場面は意外と少なく、<strong>「エラーが出たときに意味を理解して対処できる」ことがいちばん大切なスキル</strong>です。この演習でその力を確かめましょう。</p>
<pre><code>// 今回直すエラーは3種類
// 1. 構造体の参照フィールドに注釈がない（E0106）
// 2. 関数のシグネチャに注釈がない（E0106）
// 3. 参照される値が先に破棄される（E0597）</code></pre>`,
      task: `このコードには3か所のライフタイム関連エラーがあります。(1)構造体<code>Book</code>への注釈追加、(2)<code>longer_title</code>関数への注釈追加、(3)<code>t2</code>のスコープ修正、をすべて行ってコンパイルを通してください。`,
      code: `// 総合演習：3か所のライフタイム関連エラーをすべて直す

// エラー1: 参照フィールドに注釈がない
struct Book {
    title: &str,
    author: &str,
}

// エラー2: 複数の参照引数から参照を返すのに注釈がない
fn longer_title(x: &str, y: &str) -> &str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let t1 = String::from("Rustプログラミング入門");
    let result;
    {
        let t2 = String::from("入門");
        result = longer_title(&t1, &t2);
    } // エラー3: t2がここで破棄されるのでresultが使えない
    println!("長いタイトル: {}", result);

    let book = Book { title: "The Rust Book", author: "Steve" };
    println!("{} 著者: {}", book.title, book.author);
}`,
      solution: `// 総合演習：3か所のライフタイム関連エラーを修正済み

// 修正1: 構造体にライフタイムパラメータを宣言
struct Book<'a> {
    title: &'a str,
    author: &'a str,
}

// 修正2: 引数と戻り値を'aで結びつける
fn longer_title<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let t1 = String::from("Rustプログラミング入門");
    // 修正3: t2を外側のスコープで宣言して、resultより長生きさせる
    let t2 = String::from("入門");
    let result = longer_title(&t1, &t2);
    println!("長いタイトル: {}", result);

    let book = Book { title: "The Rust Book", author: "Steve" };
    println!("{} 著者: {}", book.title, book.author);
}`,
      hints: [
        `エラー1と2はE0106（注釈がない）なので、ステップ124と126で学んだ形をそのまま適用します。`,
        `構造体はstruct Book<'a>とtitle: &'a str、関数はfn longer_title<'a>(x: &'a str, y: &'a str) -> &'a strです。`,
        `エラー3はE0597（寿命不足）です。内側のブロックを取り払い、t2をmain直下で宣言しましょう。`
      ],
      expectedOutput: "長いタイトル: Rustプログラミング入門"
    }
  ]
});
