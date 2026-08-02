// 第4章：関数
registerChapter({
  number: 4,
  title: "関数",
  description: "処理に名前を付けて再利用する「関数」を学びます。引数と戻り値の型注釈、「最後の式が戻り値になる」というRust独特のルール、そして再帰まで、関数のすべての基本を習得します。",
  steps: [
    {
      id: 31,
      title: "fnの定義と呼び出し",
      explanation: `<p>ここまでのコードはすべて<code>main</code>関数の中に書いてきました。実は<code>main</code>も関数の1つで、プログラムの入り口として最初に実行される特別な関数です。</p>
<p><strong>関数</strong>とは、一連の処理に名前を付けてまとめたものです。<code>fn</code>キーワード（functionの略）で定義し、<code>関数名()</code>で呼び出します。</p>
<pre><code>fn main() {
    say_hello(); // 関数の呼び出し
    say_hello(); // 何度でも呼び出せる
}

// 関数の定義
fn say_hello() {
    println!("こんにちは!");
}</code></pre>
<p>関数を使う利点は次のとおりです。</p>
<ul>
<li>同じ処理を何度も書かずに済む（再利用）</li>
<li>処理に名前が付くので、コードが読みやすくなる</li>
<li>修正が1か所で済む</li>
</ul>
<p>Rustの関数について覚えておきたいルールが2つあります。</p>
<ul>
<li>関数名は<strong>スネークケース</strong>（すべて小文字、単語間はアンダースコア）で付けるのが慣習です。例：<code>calculate_total</code>、<code>print_report</code></li>
<li>関数の<strong>定義の位置は呼び出しより後でもかまいません</strong>。C言語のような前方宣言は不要で、コンパイラがファイル全体を見て関数を見つけてくれます。</li>
</ul>
<p>関数はどれだけ小さくても価値があります。「この数行は何をしているのか」をコメントで説明したくなったら、それは関数に切り出して名前を付けるサインです。</p>`,
      task: `「こんにちは、Rust!」と出力する<code>greet</code>関数を定義し、<code>main</code>関数から呼び出してください。`,
      code: `fn main() {
    // TODO: greet関数を呼び出す
}

// TODO: ここに"こんにちは、Rust!"と出力するgreet関数を定義する
`,
      solution: `fn main() {
    greet();
}

// あいさつを出力する関数
fn greet() {
    println!("こんにちは、Rust!");
}`,
      hints: [
        `関数の定義は<code>fn 関数名() { 処理 }</code>、呼び出しは<code>関数名();</code>です。`,
        `mainの外に<code>fn greet() { println!("こんにちは、Rust!"); }</code>を書き、mainの中で<code>greet();</code>と呼び出します。`
      ],
      expectedOutput: "こんにちは、Rust!"
    },
    {
      id: 32,
      title: "引数（型注釈必須）",
      explanation: `<p>関数に外から値を渡すには<strong>引数（ひきすう）</strong>を使います。引数は関数名の後ろの丸カッコの中に<code>名前: 型</code>の形で宣言します。</p>
<pre><code>fn main() {
    print_price("りんご", 150);
}

fn print_price(name: &amp;str, price: i32) {
    println!("{}は{}円です", name, price);
}</code></pre>
<p>ここで最重要のルールがあります。<strong>関数の引数には型注釈が必須</strong>です。<code>let x = 5;</code>のように変数では型推論に任せられましたが、引数では省略できません。</p>
<table>
<tr><th>場所</th><th>型注釈</th><th>例</th></tr>
<tr><td>letの変数</td><td>省略可（推論される）</td><td><code>let x = 5;</code></td></tr>
<tr><td>関数の引数</td><td><strong>必須</strong></td><td><code>fn f(x: i32)</code></td></tr>
</table>
<p>これは意図的な設計です。関数の定義に型が明記されていれば、関数の中身を読まなくても「何を受け取る関数か」が一目で分かり、コンパイラも呼び出し側のミス（型の合わない値を渡すなど）を正確に指摘できます。関数のシグネチャ（名前・引数・戻り値の並び）は、その関数の「取扱説明書」の役割を果たすのです。</p>
<p>複数の引数はカンマで区切り、それぞれに型を書きます。呼び出すときは宣言と同じ順番で値を渡します。なお、文字列リテラルを受け取る引数の型<code>&amp;str</code>は後の章で詳しく学ぶので、今は数値の引数に集中しましょう。</p>`,
      task: `初期コードは引数の型注釈が抜けているためコンパイルエラーになります。<code>age</code>と<code>b</code>に<code>i32</code>の型注釈を追加して修正してください。`,
      code: `fn main() {
    print_age(25);
    print_sum(3, 4);
}

// TODO: 引数の型注釈がないためコンパイルエラーになる。i32を指定して修正する
fn print_age(age) {
    println!("年齢は{}歳", age);
}

// TODO: 2つ目の引数にも型注釈が必要
fn print_sum(a: i32, b) {
    println!("{} + {} = {}", a, b, a + b);
}`,
      solution: `fn main() {
    print_age(25);
    print_sum(3, 4);
}

// 引数には必ず型注釈を書く
fn print_age(age: i32) {
    println!("年齢は{}歳", age);
}

fn print_sum(a: i32, b: i32) {
    println!("{} + {} = {}", a, b, a + b);
}`,
      hints: [
        `引数は<code>名前: 型</code>の形で宣言します。letと違って型の省略はできません。`,
        `<code>fn print_age(age: i32)</code>、<code>fn print_sum(a: i32, b: i32)</code>のように修正します。`
      ],
      expectedOutput: "3 + 4 = 7"
    },
    {
      id: 33,
      title: "戻り値の型 ->",
      explanation: `<p>関数から呼び出し元へ値を返すには<strong>戻り値</strong>を使います。戻り値の型は、引数リストの後ろに<code>-></code>（ハイフンと大なり記号）を付けて宣言します。</p>
<pre><code>fn main() {
    let area = rectangle_area(3, 5);
    println!("面積は{}", area);
}

// i32型の値を返す関数
fn rectangle_area(width: i32, height: i32) -> i32 {
    width * height
}</code></pre>
<p>関数の本体の最後に置かれた<code>width * height</code>という式の値が、そのまま戻り値になります（この仕組みは次のステップで詳しく学びます）。</p>
<p>引数と同じく、<strong>戻り値の型も省略できません</strong>。値を返す関数なのに<code>-> 型</code>を書かないと、Rustは「この関数は何も返さない」と解釈します。その状態で値を返そうとすると、次のようなコンパイルエラーになります。</p>
<pre><code>error[E0308]: mismatched types
 --> main.rs:7:5
  |
6 | fn double(x: i32) {
  |    ------          help: try adding a return type: -> i32
7 |     x * 2
  |     ^^^^^ expected (), found i32</code></pre>
<p>エラーメッセージの<code>expected (), found i32</code>は「何も返さないはず（<code>()</code>）なのにi32が返ってきた」という意味です。注目すべきは<code>help:</code>行で、コンパイラ自身が「<code>-> i32</code>を追加してみては」と解決策を提案してくれています。Rustのエラーメッセージは非常に親切なので、エラーが出たら<code>help:</code>行を必ず読む習慣をつけましょう。</p>`,
      task: `初期コードは<code>double</code>関数に戻り値の型注釈がないためコンパイルエラーになります。<code>-> i32</code>を追加して修正してください。`,
      code: `fn main() {
    let doubled = double(21);
    println!("2倍すると{}", doubled);
}

// TODO: 戻り値の型注釈がないためコンパイルエラーになる。-> i32を追加する
fn double(x: i32) {
    x * 2
}`,
      solution: `fn main() {
    let doubled = double(21);
    println!("2倍すると{}", doubled);
}

// -> i32で「i32型の値を返す」と宣言する
fn double(x: i32) -> i32 {
    x * 2
}`,
      hints: [
        `値を返す関数には、引数リストの後ろに<code>-> 型</code>の宣言が必要です。`,
        `<code>fn double(x: i32) -> i32 {</code>のように書きます。`
      ],
      expectedOutput: "2倍すると42"
    },
    {
      id: 34,
      title: "最後の式が戻り値になる",
      explanation: `<p>Rustの関数には<code>return</code>を書かずに値を返す独特のルールがあります。<strong>関数本体の最後に置かれた「式」が、そのまま戻り値になる</strong>のです。</p>
<p>このルールを理解するには、<strong>式</strong>と<strong>文</strong>の区別が鍵になります。</p>
<table>
<tr><th></th><th>意味</th><th>例</th></tr>
<tr><td>式</td><td>評価すると値を生む</td><td><code>x + 1</code>、<code>5</code>、<code>if a { 1 } else { 2 }</code></td></tr>
<tr><td>文</td><td>値を生まない命令</td><td><code>let x = 5;</code>、<code>x + 1;</code>（セミコロン付き）</td></tr>
</table>
<p>重要なのは、<strong>式の末尾にセミコロンを付けると文に変わる</strong>という点です。<code>x + 1</code>は「x+1という値」ですが、<code>x + 1;</code>は「x+1を計算して捨てる命令」になり、値を生みません。</p>
<pre><code>fn add_one(x: i32) -> i32 {
    x + 1   // セミコロンなし: この式の値が戻り値になる
}</code></pre>
<p>もしうっかりセミコロンを付けると、関数は「i32を返す」と宣言しているのに実際は何も返さないことになり、次のエラーが出ます。</p>
<pre><code>error[E0308]: mismatched types
  |
  | fn add_one(x: i32) -> i32 {
  |    -------            --- expected i32
  |     x + 1;
  |          - help: remove this semicolon to return this value</code></pre>
<p>「セミコロンを外せば値が返ります」と教えてくれています。このエラーはRust初心者が最も多く遭遇するものの1つなので、ここで確実に対処法を身につけておきましょう。</p>`,
      task: `初期コードは戻り値にするつもりの式にセミコロンが付いているためコンパイルエラーになります。エラーメッセージを確認してから、セミコロンを外して修正してください。`,
      code: `fn main() {
    let result = add_one(41);
    println!("答えは{}", result);
}

fn add_one(x: i32) -> i32 {
    // TODO: セミコロンが原因でコンパイルエラーになる。修正する
    x + 1;
}`,
      solution: `fn main() {
    let result = add_one(41);
    println!("答えは{}", result);
}

fn add_one(x: i32) -> i32 {
    // 最後の式にはセミコロンを付けない。この式の値が戻り値になる
    x + 1
}`,
      hints: [
        `セミコロンを付けると「式」が「文」に変わり、値を返さなくなります。`,
        `<code>x + 1;</code>のセミコロンを削除して<code>x + 1</code>にします。`
      ],
      expectedOutput: "答えは42"
    },
    {
      id: 35,
      title: "早期return",
      explanation: `<p>「最後の式が戻り値になる」のが基本ですが、<strong>関数の途中で処理を打ち切って値を返したい</strong>場合もあります。そのときは<code>return</code>キーワードを使います。<code>return 値;</code>を実行すると、それ以降のコードは実行されず、即座に呼び出し元へ戻ります。これを<strong>早期return</strong>（early return）と呼びます。</p>
<pre><code>fn abs_value(n: i32) -> i32 {
    if n &lt; 0 {
        return -n; // 負の数なら符号を反転してすぐ返す
    }
    n // ここに来るのはnが0以上のときだけ
}</code></pre>
<p>この関数は、<code>n</code>が負なら<code>return -n;</code>で早々に脱出し、そうでなければ最後の式<code>n</code>を返します。</p>
<p>早期returnの利点は、<strong>例外的な条件を先に片付けることで、後に続くコードのネスト（字下げの深さ）を減らせる</strong>ことです。「無効な入力ならすぐ返す」「特殊なケースを先にさばく」というガード節のスタイルは、実務のコードでも頻繁に使われます。</p>
<p>使い分けの目安は次のとおりです。</p>
<table>
<tr><th>場面</th><th>書き方</th></tr>
<tr><td>関数の最後で値を返す</td><td>セミコロンなしの式（Rustの慣習）</td></tr>
<tr><td>途中で打ち切って返す</td><td><code>return 値;</code></td></tr>
</table>
<p>なお、上の例は<code>if</code>式を使って<code>if n &lt; 0 { -n } else { n }</code>と書くこともできます。どちらも正しいRustですが、条件が増えてきたときに早期returnの読みやすさが効いてきます。</p>`,
      task: `絶対値を返す<code>abs_value</code>関数を完成させてください。<code>n</code>が負（0未満）の場合は<code>return</code>で<code>-n</code>を早期に返します。初期コードはコンパイルは通りますが、負の数の絶対値が正しく計算されません。`,
      code: `fn main() {
    println!("-7の絶対値は{}", abs_value(-7));
    println!("3の絶対値は{}", abs_value(3));
}

fn abs_value(n: i32) -> i32 {
    // TODO: nが負(0未満)ならreturnで-nを早期に返す
    n
}`,
      solution: `fn main() {
    println!("-7の絶対値は{}", abs_value(-7));
    println!("3の絶対値は{}", abs_value(3));
}

fn abs_value(n: i32) -> i32 {
    // 負の数は符号を反転して早期に返す（ガード節）
    if n < 0 {
        return -n;
    }
    n
}`,
      hints: [
        `「負の数のときだけ」特別な値を返すので、ifとreturnを組み合わせます。`,
        `関数の先頭に<code>if n &lt; 0 { return -n; }</code>を追加します。最後の<code>n</code>はそのまま残します。`
      ],
      expectedOutput: "-7の絶対値は7"
    },
    {
      id: 36,
      title: "タプルで複数の値を返す",
      explanation: `<p>関数の戻り値は1つだけですが、「最小値と最大値の両方が欲しい」など複数の結果を返したい場面はよくあります。そこで活躍するのが第2章で学んだ<strong>タプル</strong>です。複数の値をタプルに詰めて「1つの値」として返せば、実質的に複数の値を返せます。</p>
<pre><code>fn main() {
    let (quotient, remainder) = div_mod(17, 5);
    println!("17 / 5 = {} 余り {}", quotient, remainder);
}

// 商と余りをまとめて返す
fn div_mod(a: i32, b: i32) -> (i32, i32) {
    (a / b, a % b)
}</code></pre>
<p>ポイントは2つあります。</p>
<ul>
<li>戻り値の型は<code>-> (i32, i32)</code>のようにタプル型で宣言する</li>
<li>受け取る側は<code>let (quotient, remainder) = ...</code>という<strong>分配（パターンによる分解）</strong>で、要素をそれぞれ別の変数に一度に取り出せる</li>
</ul>
<p>タプルのまま受け取って<code>result.0</code>、<code>result.1</code>とアクセスすることもできますが、<code>.0</code>や<code>.1</code>では中身の意味が分からなくなりがちです。分配を使って意味のある名前を付けるほうが読みやすいコードになります。</p>
<p>他の言語では複数の値を返すために配列や専用クラスを用意することがありますが、Rustではタプルが「その場限りの値の組」を表す軽量な手段として標準的に使われます。なお、返す値に名前を付けて構造的に扱いたい場合は、後の章で学ぶ構造体がより適切な選択になります。</p>`,
      task: `2つの数の小さい方と大きい方をタプル<code>(i32, i32)</code>で返す<code>min_max</code>関数を完成させてください。初期コードは引数をそのままの順で返しているため、<code>min_max(8, 3)</code>の結果が正しくありません。<code>if</code>式で大小を判定しましょう。`,
      code: `fn main() {
    let (min, max) = min_max(8, 3);
    println!("最小値: {}, 最大値: {}", min, max);
}

// 小さい方と大きい方を(小, 大)のタプルで返す
fn min_max(a: i32, b: i32) -> (i32, i32) {
    // TODO: aとbの大小を判定して(小さい方, 大きい方)の順で返す
    (a, b)
}`,
      solution: `fn main() {
    let (min, max) = min_max(8, 3);
    println!("最小値: {}, 最大値: {}", min, max);
}

// 小さい方と大きい方を(小, 大)のタプルで返す
fn min_max(a: i32, b: i32) -> (i32, i32) {
    // if式は値を返すので、タプルをそのまま分岐できる
    if a < b {
        (a, b)
    } else {
        (b, a)
    }
}`,
      hints: [
        `第3章で学んだ「ifは式」を思い出しましょう。if式でタプルそのものを返せます。`,
        `<code>if a &lt; b { (a, b) } else { (b, a) }</code>のように書きます。セミコロンを付けないことに注意してください。`
      ],
      expectedOutput: "最小値: 3, 最大値: 8"
    },
    {
      id: 37,
      title: "ユニット型()",
      explanation: `<p>これまで「値を返さない関数」と呼んできたものは、正確には<strong>ユニット型<code>()</code></strong>という特別な値を返しています。ユニット型は「意味のある値がないこと」を表す型で、値も型もどちらも<code>()</code>と書きます（要素が0個のタプルと考えると覚えやすいでしょう）。</p>
<pre><code>// この2つの宣言はまったく同じ意味
fn log_message() { println!("記録しました"); }
fn log_message2() -> () { println!("記録しました"); }</code></pre>
<p>戻り値の型を書かない関数は、暗黙的に<code>-> ()</code>と宣言したのと同じです。また、セミコロンで終わる文も<code>()</code>を生みます。ステップ34のセミコロンのエラーで<code>expected i32, found ()</code>と表示されたのは、「i32が欲しいのにユニット型が来た」という意味だったのです。</p>
<p>ユニット型の値を<code>println!</code>で表示するときは注意が必要です。<code>{}</code>（Display形式）では表示できず、配列のときにも使った<code>{:?}</code>（Debug形式）を使う必要があります。</p>
<table>
<tr><th>書き方</th><th>結果</th></tr>
<tr><td><code>println!("{}", unit_value)</code></td><td>コンパイルエラー（Display未対応）</td></tr>
<tr><td><code>println!("{:?}", unit_value)</code></td><td><code>()</code>と表示される</td></tr>
</table>
<p>「何もない」を型として明示的に扱うのはRustらしい設計です。他の言語のvoidと似ていますが、<code>()</code>は実際に変数に入れられる正真正銘の「値」である点が異なります。この性質は、後の章でジェネリクスやResult型を学ぶときに効いてきます。</p>`,
      task: `初期コードは、ユニット型<code>()</code>を<code>{}</code>で表示しようとしているためコンパイルエラーになります。<code>{:?}</code>に変更して、戻り値が<code>()</code>であることを確認してください。`,
      code: `fn main() {
    let result = print_message();
    // TODO: ユニット型()は{}で表示できないためコンパイルエラーになる
    // {:?}に変更して、()が表示されることを確認する
    println!("戻り値: {}", result);
}

// 戻り値の型を書かない関数は、暗黙的にユニット型()を返す
fn print_message() {
    println!("メッセージを表示します");
}`,
      solution: `fn main() {
    let result = print_message();
    // ユニット型はDebug形式{:?}でなら表示できる
    println!("戻り値: {:?}", result);
}

// 戻り値の型を書かない関数は、暗黙的にユニット型()を返す
fn print_message() {
    println!("メッセージを表示します");
}`,
      hints: [
        `ユニット型<code>()</code>はDisplay形式<code>{}</code>に対応していません。`,
        `配列を表示したときと同じく、Debug形式の<code>{:?}</code>を使います。`
      ],
      expectedOutput: "戻り値: ()"
    },
    {
      id: 38,
      title: "スコープと変数の可視性",
      explanation: `<p><strong>スコープ</strong>とは、変数が有効な（使える）範囲のことです。Rustでは波カッコ<code>{ }</code>で囲まれた<strong>ブロック</strong>がスコープの単位になります。変数は宣言された場所からブロックの終わりまで有効で、ブロックを抜けると使えなくなります。</p>
<pre><code>fn main() {
    let x = 10; // xはmain関数の終わりまで有効
    {
        let y = 20; // yはこの内側ブロックの中だけで有効
        println!("{} {}", x, y); // 内側からは外側のxも見える
    }
    // ここでyを使うとエラー: cannot find value y in this scope
}</code></pre>
<p>ルールをまとめると次のとおりです。</p>
<ul>
<li>内側のブロックからは<strong>外側の変数が見える</strong></li>
<li>外側からは<strong>内側の変数は見えない</strong>（ブロックを抜けた時点で破棄される）</li>
<li>関数はそれぞれ独立したスコープを持ち、<strong>他の関数の変数は見えない</strong>。関数間で値をやり取りする手段は引数と戻り値だけです</li>
</ul>
<p>さらにRustでは、ブロックも<strong>式</strong>です。ブロックの最後にセミコロンなしの式を置くと、それがブロック全体の値になります。</p>
<pre><code>let z = {
    let a = 2;
    let b = 3;
    a * b // このブロックの値は6
};</code></pre>
<p>「一時変数を使った計算をひとまとめにして結果だけ受け取る」という書き方で、関数の「最後の式が戻り値」というルールも、実はこのブロックの性質そのものです。変数の生存範囲を狭く保つことは、後に学ぶ所有権の理解にも直結する重要な習慣です。</p>`,
      task: `初期コードは、内側のブロックで宣言した<code>y</code>をブロックの外で使っているためコンパイルエラーになります。エラーを確認したら、最後の行を<code>x</code>だけを出力する形に修正してください。`,
      code: `fn main() {
    let x = 10;
    {
        let y = 20;
        println!("ブロック内: x = {}, y = {}", x, y);
    }
    // TODO: yはブロックの外では使えないためコンパイルエラーになる
    // xだけを出力するように修正する
    println!("ブロック外: x = {}, y = {}", x, y);
}`,
      solution: `fn main() {
    let x = 10;
    {
        let y = 20;
        // 内側のブロックからは外側のxも見える
        println!("ブロック内: x = {}, y = {}", x, y);
    }
    // yはブロックを抜けた時点で破棄されているので、xだけを出力する
    println!("ブロック外: x = {}", x);
}`,
      hints: [
        `<code>y</code>は内側のブロックが終わった時点で破棄され、外からは見えません。`,
        `最後の行を<code>println!("ブロック外: x = {}", x);</code>に修正します。`
      ],
      expectedOutput: "ブロック外: x = 10"
    },
    {
      id: 39,
      title: "再帰関数（階乗）",
      explanation: `<p><strong>再帰関数</strong>とは、自分自身を呼び出す関数のことです。「大きな問題を、同じ形のより小さな問題に分解して解く」という考え方をそのままコードにできます。</p>
<p>定番の例が<strong>階乗</strong>です。nの階乗（n!）は1からnまでの整数をすべて掛けた値で、5! = 5×4×3×2×1 = 120です。ここで「5! = 5×4!」「4! = 4×3!」と、階乗は一回り小さい階乗を使って定義できることに注目してください。</p>
<pre><code>fn factorial(n: u64) -> u64 {
    if n &lt;= 1 {
        1 // 基底ケース: これ以上分解しない
    } else {
        n * factorial(n - 1) // 再帰ケース: 一回り小さい問題に任せる
    }
}</code></pre>
<p>再帰関数には必ず2つの要素が必要です。</p>
<table>
<tr><th>要素</th><th>役割</th><th>階乗での例</th></tr>
<tr><td>基底ケース</td><td>再帰を止める終了条件</td><td>nが1以下なら1を返す</td></tr>
<tr><td>再帰ケース</td><td>小さくした問題で自分を呼ぶ</td><td><code>n * factorial(n - 1)</code></td></tr>
</table>
<p><strong>基底ケースを忘れると無限に自分を呼び続け</strong>、関数呼び出しの記録を積む領域（スタック）を使い果たしてクラッシュします（スタックオーバーフロー）。再帰を書くときは「必ず基底ケースに到達するか」を最初に確認しましょう。</p>
<p>型に<code>u64</code>（64ビット符号なし整数）を使っているのは、階乗が急激に大きくなるためです。20!は約243京に達し、<code>i32</code>では9!までしか扱えません。同じ計算は<code>for</code>ループでも書けますが、再帰は問題の数学的な構造がそのまま読み取れるという利点があります。</p>`,
      task: `階乗を計算する<code>factorial</code>関数を完成させてください。基底ケース（<code>n</code>が1以下なら1を返す）と再帰ケース（<code>n * factorial(n - 1)</code>）を<code>if</code>式で実装します。`,
      code: `fn main() {
    println!("5! = {}", factorial(5));
    println!("10! = {}", factorial(10));
}

fn factorial(n: u64) -> u64 {
    // TODO: 基底ケース(nが1以下なら1)と
    // 再帰ケース(n * factorial(n - 1))をif式で実装する
    1
}`,
      solution: `fn main() {
    println!("5! = {}", factorial(5));
    println!("10! = {}", factorial(10));
}

fn factorial(n: u64) -> u64 {
    if n <= 1 {
        // 基底ケース: 再帰を止める
        1
    } else {
        // 再帰ケース: 一回り小さい階乗に分解する
        n * factorial(n - 1)
    }
}`,
      hints: [
        `再帰にはまず「止まる条件」が必要です。nが1以下のときは再帰せずに1を返します。`,
        `if式で<code>if n &lt;= 1 { 1 } else { n * factorial(n - 1) }</code>と書けます。`
      ],
      expectedOutput: "5! = 120"
    },
    {
      id: 40,
      title: "総合演習：摂氏・華氏変換関数群",
      explanation: `<p>第4章の総仕上げとして、温度変換を行う関数群を作ります。日本で使う摂氏（℃）とアメリカなどで使う華氏（℉）は、次の式で相互に変換できます。</p>
<table>
<tr><th>変換</th><th>公式</th></tr>
<tr><td>摂氏→華氏</td><td>F = C × 9 ÷ 5 + 32</td></tr>
<tr><td>華氏→摂氏</td><td>C = (F − 32) × 5 ÷ 9</td></tr>
</table>
<p>実装では本章で学んだことを総動員します。</p>
<ul>
<li><code>fn</code>で関数を定義し、引数に型注釈を付ける（ステップ31・32）</li>
<li><code>-> f64</code>で戻り値の型を宣言する（ステップ33）</li>
<li>最後の式にセミコロンを付けず、その値を返す（ステップ34）</li>
</ul>
<p>温度は小数になり得るので、型には<code>f64</code>（64ビット浮動小数点数）を使います。ここで1つ重要な注意があります。<code>f64</code>の計算式には<code>9.0</code>や<code>32.0</code>のように<strong>小数点付きのリテラル</strong>を使ってください。Rustは整数と浮動小数点数を暗黙に混ぜられないため、<code>c * 9 / 5</code>のように整数リテラルを混ぜるとコンパイルエラーになります。</p>
<pre><code>fn celsius_to_fahrenheit(c: f64) -> f64 {
    c * 9.0 / 5.0 + 32.0
}</code></pre>
<p>このように「変換」という小さな責務ごとに関数を分けておくと、mainは「何をしているか」だけが並ぶ読みやすいコードになります。検算のヒント：摂氏0度は華氏32度、摂氏100度（沸点）は華氏212度です。実装できたら数値を変えて、この対応が成り立つか確認してみましょう。</p>`,
      task: `2つの変換関数を完成させてください。<code>celsius_to_fahrenheit</code>は摂氏を華氏に（F = C × 9.0 ÷ 5.0 + 32.0）、<code>fahrenheit_to_celsius</code>は華氏を摂氏に（C = (F − 32.0) × 5.0 ÷ 9.0）変換します。`,
      code: `fn main() {
    let celsius = 25.0;
    let fahrenheit = celsius_to_fahrenheit(celsius);
    println!("摂氏{}度は華氏{}度", celsius, fahrenheit);

    let f = 212.0;
    let c = fahrenheit_to_celsius(f);
    println!("華氏{}度は摂氏{}度", f, c);
}

// 摂氏を華氏に変換する: F = C * 9.0 / 5.0 + 32.0
fn celsius_to_fahrenheit(c: f64) -> f64 {
    // TODO: 変換式を実装する
    0.0
}

// 華氏を摂氏に変換する: C = (F - 32.0) * 5.0 / 9.0
fn fahrenheit_to_celsius(f: f64) -> f64 {
    // TODO: 変換式を実装する
    0.0
}`,
      solution: `fn main() {
    let celsius = 25.0;
    let fahrenheit = celsius_to_fahrenheit(celsius);
    println!("摂氏{}度は華氏{}度", celsius, fahrenheit);

    let f = 212.0;
    let c = fahrenheit_to_celsius(f);
    println!("華氏{}度は摂氏{}度", f, c);
}

// 摂氏を華氏に変換する
fn celsius_to_fahrenheit(c: f64) -> f64 {
    c * 9.0 / 5.0 + 32.0
}

// 華氏を摂氏に変換する
fn fahrenheit_to_celsius(f: f64) -> f64 {
    (f - 32.0) * 5.0 / 9.0
}`,
      hints: [
        `公式をそのままRustの式に置き換えます。f64の計算なので9.0や32.0のように小数点付きで書きます。`,
        `最後の式にセミコロンを付けないことで、その値が戻り値になります。`,
        `検算: 摂氏25度は華氏77度、華氏212度は摂氏100度になれば正解です。`
      ],
      expectedOutput: "摂氏25度は華氏77度"
    }
  ]
});
