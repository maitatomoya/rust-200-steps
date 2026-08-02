// 第5章：所有権
registerChapter({
  number: 5,
  title: "所有権",
  description: "Rustの最重要概念である所有権を学びます。ムーブ・Copy・clone・関数と所有権の関係を、コンパイルエラーを読み解きながら体得します。",
  steps: [
    {
      id: 41,
      title: "所有権とは何か・ムーブの体験",
      explanation: `<p>所有権（ownership）は、Rustがガベージコレクタなしでメモリ安全を実現するための仕組みです。まずは3つのルールを覚えましょう。</p>
<table>
<tr><th>ルール</th><th>内容</th></tr>
<tr><td>1</td><td>Rustの各値は「所有者」と呼ばれる変数を持つ</td></tr>
<tr><td>2</td><td>所有者は同時に1つだけ</td></tr>
<tr><td>3</td><td>所有者がスコープを抜けると値は破棄される</td></tr>
</table>
<p><code>String</code>型はヒープ（実行時にサイズが変わるデータを置くメモリ領域）に文字列データを保持します。<code>String</code>を別の変数に代入すると、データはコピーされず<strong>所有権が移動</strong>します。これを<strong>ムーブ（move）</strong>と呼びます。</p>
<pre><code>let s1 = String::from("hello");
let s2 = s1; // 所有権がs1からs2へムーブ
// 以降、s1は使えない。使えるのはs2だけ</code></pre>
<p>ムーブは「高コストなディープコピーを暗黙に行わない」「同じヒープ領域を2つの変数が解放してしまう二重解放バグを防ぐ」というRustの設計思想の表れです。他言語の「浅いコピー」に似ていますが、決定的な違いは<strong>元の変数が無効化される</strong>ことです。</p>
<p>このステップではまず、ムーブ後の新しい所有者<code>s2</code>だけを使う正常なコードを実行して動きを観察します。次のステップで、ムーブ後に元の変数を使うとどうなるかを体験します。</p>`,
      task: `まずそのまま実行して出力を確認しましょう。次に、<code>String::from("hello")</code>の文字列を<code>"Rust"</code>に書き換えて再実行し、ムーブ後の変数<code>s2</code>から新しい値が出力されることを確認してください。`,
      code: `fn main() {
    // s1が文字列"hello"の所有者になる
    let s1 = String::from("hello");

    // 所有権がs1からs2へムーブする
    let s2 = s1;

    // ムーブ後はs2だけが値を使える
    println!("s2の値: {}", s2);
}`,
      solution: `fn main() {
    // s1が文字列"Rust"の所有者になる
    let s1 = String::from("Rust");

    // 所有権がs1からs2へムーブする
    let s2 = s1;

    // ムーブ後はs2だけが値を使える
    println!("s2の値: {}", s2);
}`,
      hints: [
        "String::from(\"hello\")の\"hello\"の部分を\"Rust\"に書き換えるだけです。",
        "変更後もprintln!はs2を出力します。ムーブによってs2が新しい所有者になっているためです。"
      ],
      expectedOutput: "s2の値: Rust"
    },
    {
      id: 42,
      title: "ムーブ後の使用エラーを直す",
      explanation: `<p>前のステップで学んだとおり、ムーブが起きると元の変数は無効になります。無効になった変数を使おうとすると、コンパイラは<strong>E0382</strong>というエラーを出します。実際のエラーメッセージを読んでみましょう。</p>
<pre><code>error[E0382]: borrow of moved value: 's1'
 --&gt; src/main.rs:4:20
  |
2 |     let s1 = String::from("こんにちは");
  |         -- move occurs because 's1' has type 'String',
  |            which does not implement the 'Copy' trait
3 |     let s2 = s1;
  |              -- value moved here
4 |     println!("{}", s1);
  |                    ^^ value borrowed here after move</code></pre>
<p>Rustのエラーメッセージは非常に親切で、読み方のコツは次の3点です。</p>
<ul>
<li><strong>1行目</strong>：エラーの種類（ここでは「ムーブ済みの値s1を使った」）</li>
<li><strong>value moved here</strong>：どの行でムーブが起きたか</li>
<li><strong>value borrowed here after move</strong>：どの行で無効な変数を使ったか</li>
</ul>
<p>直し方は状況によって複数あります。今回は「新しい所有者を使う」という一番シンプルな方法で直します。後のステップでは<code>clone</code>（複製）や参照という別の解決策も学びます。エラーメッセージを恐れず、コンパイラを「ペアプログラミングの相棒」として読み解く習慣をつけましょう。</p>`,
      task: `このコードはコンパイルエラーになります。エラーメッセージを読み、ムーブ後の<code>s1</code>ではなく新しい所有者を出力するように直してください。`,
      code: `fn main() {
    let s1 = String::from("こんにちは");
    let s2 = s1; // ここで所有権がs2へムーブ

    // エラー！ ムーブ済みのs1は使えない
    println!("{}", s1);
}`,
      solution: `fn main() {
    let s1 = String::from("こんにちは");
    let s2 = s1; // ここで所有権がs2へムーブ

    // 新しい所有者s2を使えばコンパイルが通る
    println!("{}", s2);
}`,
      hints: [
        "ムーブが起きた後、値の所有者はどの変数になっていますか？",
        "println!の引数をs1から新しい所有者の変数名に書き換えましょう。"
      ],
      expectedOutput: "こんにちは"
    },
    {
      id: 43,
      title: "Copy型（整数はムーブされない）",
      explanation: `<p>「代入するとムーブされる」なら、これまでの章で書いた整数の代入はなぜエラーにならなかったのでしょうか。答えは、整数などの単純な型が<strong>Copyトレイト</strong>（値が自動的にコピーされる性質）を持っているからです。</p>
<pre><code>let x = 5;
let y = x; // xの値がコピーされる（ムーブではない）
println!("x = {}, y = {}", x, y); // 両方使える！</code></pre>
<p>Copy型はスタック（サイズが固定で高速なメモリ領域）に収まる小さな値で、コピーのコストがほぼゼロです。主なCopy型を整理します。</p>
<table>
<tr><th>分類</th><th>型の例</th><th>代入時の挙動</th></tr>
<tr><td>整数</td><td><code>i32</code>、<code>u64</code>など</td><td>コピー</td></tr>
<tr><td>浮動小数点数</td><td><code>f64</code>、<code>f32</code></td><td>コピー</td></tr>
<tr><td>真偽値</td><td><code>bool</code></td><td>コピー</td></tr>
<tr><td>文字</td><td><code>char</code></td><td>コピー</td></tr>
<tr><td>ヒープを使う型</td><td><code>String</code>など</td><td><strong>ムーブ</strong></td></tr>
</table>
<p>前ステップのエラーメッセージにあった「does not implement the 'Copy' trait」という一文は、「この型はCopyではないのでムーブされた」という意味だったのです。判断基準はシンプルで、<strong>ヒープ上のデータを所有する型はムーブ、スタックだけで完結する単純な型はコピー</strong>と覚えましょう。</p>`,
      task: `整数のコピーを確認するコードが動いています。TODO部分に、<code>char</code>型の変数<code>c1</code>を別の変数<code>c2</code>に代入し、両方を出力するコードを追加して、charもCopy型であることを確かめてください。`,
      code: `fn main() {
    // i32はCopy型なので、代入してもxは有効なまま
    let x = 5;
    let y = x;
    println!("x = {}, y = {}", x, y);

    let c1 = 'A';
    // TODO: c1をc2に代入し、
    // println!("c1 = {}, c2 = {}", c1, c2); で両方出力する
}`,
      solution: `fn main() {
    // i32はCopy型なので、代入してもxは有効なまま
    let x = 5;
    let y = x;
    println!("x = {}, y = {}", x, y);

    let c1 = 'A';
    // charもCopy型なので、代入後もc1は有効なまま
    let c2 = c1;
    println!("c1 = {}, c2 = {}", c1, c2);
}`,
      hints: [
        "整数のx・yと同じ書き方で、let c2 = c1; と代入します。",
        "charはCopy型なので、代入後もc1をそのままprintln!に渡せます。"
      ],
      expectedOutput: "x = 5, y = 5"
    },
    {
      id: 44,
      title: "String型と&strの違い（導入）",
      explanation: `<p>Rustには文字列を表す型が主に2つあります。<code>String</code>と<code>&amp;str</code>（文字列スライス）です。混乱しやすいポイントなので、まず全体像を押さえましょう。</p>
<table>
<tr><th></th><th><code>String</code></th><th><code>&amp;str</code></th></tr>
<tr><td>データの場所</td><td>ヒープ</td><td>どこかにあるデータへの参照</td></tr>
<tr><td>所有権</td><td>持つ（所有者になる）</td><td>持たない（借りているだけ）</td></tr>
<tr><td>変更</td><td><code>mut</code>なら可能</td><td>不可</td></tr>
<tr><td>作り方の例</td><td><code>String::from("a")</code></td><td>リテラル<code>"a"</code></td></tr>
</table>
<p>ソースコードに直接書いた<code>"hello"</code>のような<strong>文字列リテラル</strong>の型は<code>&amp;str</code>です。プログラム本体に埋め込まれた文字列データを指しているだけなので、所有権を持たず、内容を変更することもできません。</p>
<p>一方<code>String</code>は自分でヒープ上のデータを所有しているため、<code>push_str</code>（文字列の追記）などで内容を伸ばせます。<code>&amp;str</code>から<code>String</code>を作るには<code>String::from(リテラル)</code>または<code>リテラル.to_string()</code>を使います。</p>
<pre><code>let literal = "hello";              // &amp;str
let mut owned = String::from(literal); // String
owned.push_str(" world");           // Stringは追記できる</code></pre>
<p>「所有して変更したいならString、読むだけなら&amp;str」というのがRustの基本的な使い分けです。<code>&amp;str</code>の詳しい仕組み（スライス）は第6章で学びます。</p>`,
      task: `このコードは<code>&amp;str</code>型の変数に<code>push_str</code>しようとしてコンパイルエラーになります。TODOの行を<code>String::from</code>を使って直し、<code>String</code>型として追記できるようにしてください。`,
      code: `fn main() {
    // literalの型は&str（文字列リテラル）
    let literal = "Rustは楽しい";

    // TODO: String::fromを使ってString型に変換する
    let mut owned = literal;

    // エラー！ &strには追記できない
    owned.push_str("！");

    println!("literal: {}", literal);
    println!("owned: {}", owned);
}`,
      solution: `fn main() {
    // literalの型は&str（文字列リテラル）
    let literal = "Rustは楽しい";

    // String::fromで所有権を持つString型に変換する
    let mut owned = String::from(literal);

    // Stringなら追記できる
    owned.push_str("！");

    println!("literal: {}", literal);
    println!("owned: {}", owned);
}`,
      hints: [
        "push_strで内容を変更できるのはString型だけです。ownedをString型にする必要があります。",
        "let mut owned = String::from(literal); のように書くと、&strからStringを作れます。"
      ],
      expectedOutput: "owned: Rustは楽しい！"
    },
    {
      id: 45,
      title: "cloneで値を複製する",
      explanation: `<p>「ムーブ後も元の変数を使いたい」場合の解決策の1つが<code>clone</code>メソッドです。<code>clone</code>はヒープ上のデータごと丸ごと複製（ディープコピー）するので、複製後は元の変数と新しい変数がそれぞれ独立したデータを所有します。</p>
<pre><code>let s1 = String::from("hello");
let s2 = s1.clone(); // ヒープのデータごと複製
println!("{} {}", s1, s2); // 両方使える</code></pre>
<p>ムーブとcloneの違いを整理します。</p>
<table>
<tr><th></th><th>ムーブ（<code>let s2 = s1;</code>）</th><th>clone（<code>let s2 = s1.clone();</code>）</th></tr>
<tr><td>データの複製</td><td>されない（所有権だけ移動）</td><td>される（ディープコピー）</td></tr>
<tr><td>元の変数</td><td>無効になる</td><td>有効なまま</td></tr>
<tr><td>コスト</td><td>ほぼゼロ</td><td>データ量に比例して増える</td></tr>
</table>
<p>cloneは便利ですが「とりあえずclone」を続けると、大きなデータのコピーが積み重なり性能低下の原因になります。Rustでは<code>clone</code>を書いた場所が「ここでコピーコストが発生する」と一目で分かるため、意図的に使う分には問題ありません。まずはcloneでエラーを解決できるようになり、第6章で学ぶ「参照」でコピー自体を避ける方法へステップアップしましょう。</p>`,
      task: `このコードはムーブ後の<code>s1</code>を使っているためコンパイルエラーになります。<code>clone</code>を使って、<code>s1</code>と<code>s2</code>の両方を出力できるように直してください。`,
      code: `fn main() {
    let s1 = String::from("データ");

    // TODO: s1を今後も使いたい。cloneを使うように直す
    let s2 = s1;

    // エラー！ s1はムーブ済み
    println!("s1 = {}, s2 = {}", s1, s2);
}`,
      solution: `fn main() {
    let s1 = String::from("データ");

    // cloneでヒープのデータごと複製する（s1は有効なまま）
    let s2 = s1.clone();

    println!("s1 = {}, s2 = {}", s1, s2);
}`,
      hints: [
        "代入の右辺でs1のデータを複製すれば、所有権はムーブしません。",
        "let s2 = s1.clone(); と書きます。"
      ],
      expectedOutput: "s1 = データ, s2 = データ"
    },
    {
      id: 46,
      title: "関数に渡すと所有権が移る（エラー修正）",
      explanation: `<p>ムーブは代入だけでなく、<strong>関数に値を渡すとき</strong>にも起こります。関数の引数に<code>String</code>を渡すと、所有権は関数の中の引数変数へムーブし、呼び出し元の変数は無効になります。</p>
<pre><code>fn print_message(msg: String) {
    println!("メッセージ: {}", msg);
} // ここでmsgがスコープを抜け、文字列は破棄される

fn main() {
    let s = String::from("hello");
    print_message(s);   // 所有権が関数へムーブ
    // println!("{}", s); // エラー！ sはもう使えない
}</code></pre>
<p>エラーメッセージには次のように表示されます。</p>
<pre><code>error[E0382]: borrow of moved value: 's'
  |
  |     print_message(s);
  |                   - value moved here
  |     println!("もう一度: {}", s);
  |                              ^ value borrowed here after move</code></pre>
<p>「value moved here」が関数呼び出しの行を指していることに注目してください。代入のときとまったく同じ仕組みでムーブが起きています。関数呼び出し後も値を使いたい場合、この章の知識では<code>clone</code>で複製を渡すのが解決策です。第6章では、所有権を渡さずに「貸すだけ」で済む参照というより良い方法を学びます。</p>`,
      task: `このコードは関数呼び出しで<code>s</code>の所有権がムーブするためコンパイルエラーになります。関数には<code>clone</code>した複製を渡すように直し、呼び出し後も<code>s</code>を使えるようにしてください。`,
      code: `fn print_message(msg: String) {
    println!("メッセージ: {}", msg);
}

fn main() {
    let s = String::from("所有権");

    // ここでsの所有権が関数へムーブしてしまう
    print_message(s);

    // エラー！ sはムーブ済み
    println!("もう一度: {}", s);
}`,
      solution: `fn print_message(msg: String) {
    println!("メッセージ: {}", msg);
}

fn main() {
    let s = String::from("所有権");

    // 複製を渡せば、sの所有権は手元に残る
    print_message(s.clone());

    println!("もう一度: {}", s);
}`,
      hints: [
        "関数に渡すのを「sそのもの」ではなく「sの複製」にすれば、sは有効なままです。",
        "print_message(s.clone()); のように呼び出します。"
      ],
      expectedOutput: "もう一度: 所有権"
    },
    {
      id: 47,
      title: "戻り値で所有権を返す",
      explanation: `<p>関数へムーブした所有権は、<strong>戻り値として返す</strong>ことで呼び出し元に取り戻せます。「値を預けて、加工して、返してもらう」というイメージです。</p>
<pre><code>fn add_suffix(mut s: String) -&gt; String {
    s.push_str("語");
    s // 所有権ごと呼び出し元へ返す
}

fn main() {
    let s = String::from("日本");
    let s = add_suffix(s); // 返ってきた所有権を受け取り直す
    println!("{}", s); // 日本語
}</code></pre>
<p>ここで2つのポイントがあります。</p>
<ul>
<li><strong>引数の<code>mut s: String</code></strong>：所有権を受け取った関数側では、引数に<code>mut</code>を付ければ自由に変更できます。所有者は関数なので、呼び出し元の宣言が<code>mut</code>かどうかは関係ありません。</li>
<li><strong><code>let s = add_suffix(s);</code></strong>：戻り値を同名の変数で受けています。これは第1章で学んだシャドーイング（同名変数の再宣言による上書き）の実用例です。</li>
</ul>
<p>ただし、この「渡して返す」方式は、すべての関数が値を返さなければならず記述が冗長になります。Rustが用意しているスマートな解決策が第6章の<strong>参照と借用</strong>です。このステップは「参照がなぜ必要か」を実感するための布石でもあります。</p>`,
      task: `関数<code>shout</code>の中身を実装してください。受け取った<code>s</code>の末尾に<code>"!!!"</code>を追記し、<code>s</code>を戻り値として返します。引数を変更するには<code>mut</code>が必要な点に注意してください。`,
      code: `// TODO: sの末尾に"!!!"を追記して、sを返すように実装する
// ヒント: 引数を変更するにはシグネチャの工夫が必要
fn shout(s: String) -> String {
    s
}

fn main() {
    let s = String::from("進め");

    // 戻り値で所有権を受け取り直す（シャドーイング）
    let s = shout(s);

    println!("{}", s);
}`,
      solution: `// 所有権を受け取り、変更してから所有権ごと返す
fn shout(mut s: String) -> String {
    s.push_str("!!!");
    s
}

fn main() {
    let s = String::from("進め");

    // 戻り値で所有権を受け取り直す（シャドーイング）
    let s = shout(s);

    println!("{}", s);
}`,
      hints: [
        "引数の宣言をmut s: Stringにすると、関数の中でsを変更できます。",
        "s.push_str(\"!!!\"); で追記し、最後の行にセミコロンなしで s と書けば戻り値になります。"
      ],
      expectedOutput: "進め!!!"
    },
    {
      id: 48,
      title: "スコープとdrop",
      explanation: `<p>所有権ルールの3つ目「所有者がスコープを抜けると値は破棄される」を詳しく見ましょう。変数がスコープ（<code>{ }</code>で囲まれた有効範囲）の終わりに達すると、Rustは自動的に<code>drop</code>という後片付け処理を呼び、ヒープのメモリを解放します。</p>
<pre><code>fn main() {
    let outer = String::from("外側");
    {
        let inner = String::from("内側");
        println!("{}", inner);
    } // ← ここでinnerがdropされ、メモリが解放される
    println!("{}", outer);
} // ← ここでouterがdropされる</code></pre>
<p>ガベージコレクタを持つ言語は「いつかどこかで」メモリを回収しますが、Rustは<strong>スコープの終わりという決まった場所で確実に解放</strong>します。これが「GCなしでメモリ安全」の正体です。</p>
<p>さらに、標準ライブラリの<code>drop()</code>関数を呼べば、スコープの終わりを待たずに<strong>明示的に値を手放す</strong>こともできます。</p>
<pre><code>let s = String::from("大きなデータ");
drop(s); // ここで即座に解放
// 以降、sは使えない（ムーブと同じ扱い）</code></pre>
<p><code>drop(s)</code>は「sの所有権をdrop関数へムーブして、そのまま破棄する」動きです。そのため、drop後にsを使うとE0382（ムーブ後の使用）エラーになります。所有権・スコープ・dropは三位一体の仕組みだと理解しましょう。</p>`,
      task: `このコードは<code>drop(s)</code>で解放した後の<code>s</code>を使っているためコンパイルエラーになります。最後の<code>println!</code>を、<code>s</code>を使わずに<code>"dropの後はsを使えない"</code>と出力するように直してください。`,
      code: `fn main() {
    let s = String::from("先に解放");
    println!("dropの前: {}", s);

    // 明示的に所有権を手放して解放する
    drop(s);

    // エラー！ dropに所有権がムーブ済み
    println!("dropの後: {}", s);
}`,
      solution: `fn main() {
    let s = String::from("先に解放");
    println!("dropの前: {}", s);

    // 明示的に所有権を手放して解放する
    drop(s);

    // drop後はsを使えないので、sを含まない文字列を出力する
    println!("dropの後はsを使えない");
}`,
      hints: [
        "drop(s)は「sの所有権をdrop関数へムーブする」ので、以降sはムーブ後と同じ扱いです。",
        "最後の行を println!(\"dropの後はsを使えない\"); に書き換えます。"
      ],
      expectedOutput: "dropの後はsを使えない"
    },
    {
      id: 49,
      title: "ムーブ演習（複数のエラーを直す）",
      explanation: `<p>ここまでに学んだムーブの知識を総動員して、複数のコンパイルエラーを直す演習です。実務のコンパイルエラーも、1つずつ順番に潰していくのが基本です。手順を確認しましょう。</p>
<ol>
<li>エラーメッセージの<strong>エラー番号と1行目</strong>で種類を把握する（E0382ならムーブ関連）</li>
<li><strong>value moved here</strong>でムーブが起きた行を特定する</li>
<li>目的に合った解決策を選ぶ</li>
</ol>
<p>この章で学んだ解決策を整理します。</p>
<table>
<tr><th>状況</th><th>解決策</th></tr>
<tr><td>元の変数はもう不要</td><td>新しい所有者の変数を使う</td></tr>
<tr><td>両方の変数を使いたい</td><td><code>clone()</code>で複製する</td></tr>
<tr><td>関数に渡した後も使いたい</td><td><code>clone()</code>を渡す、または戻り値で返してもらう</td></tr>
<tr><td>Copy型（整数など）</td><td>そもそもムーブしないので対処不要</td></tr>
</table>
<p>なお、<code>rustc</code>は複数のエラーがあると一度にまとめて報告してくれますが、<strong>最初のエラーを直すと後続のエラーが変化する</strong>こともあります。上から順に1つずつ直して再コンパイルする習慣をつけると、混乱せずに済みます。</p>`,
      task: `このコードには2箇所のムーブエラーがあります。(1)<code>a</code>と<code>b</code>の両方を出力できるように、(2)関数<code>take</code>を呼んだ後も<code>c</code>を出力できるように、それぞれ<code>clone</code>を使って直してください。`,
      code: `fn take(s: String) {
    println!("takeが受け取った: {}", s);
}

fn main() {
    let a = String::from("apple");
    let b = a; // TODO: aとbを両方使えるように直す

    // エラー1: aはムーブ済み
    println!("a = {}", a);
    println!("b = {}", b);

    let c = String::from("cherry");
    take(c); // TODO: 呼び出し後もcを使えるように直す

    // エラー2: cはムーブ済み
    println!("c = {}", c);
}`,
      solution: `fn take(s: String) {
    println!("takeが受け取った: {}", s);
}

fn main() {
    let a = String::from("apple");
    let b = a.clone(); // 複製すればaは有効なまま

    println!("a = {}", a);
    println!("b = {}", b);

    let c = String::from("cherry");
    take(c.clone()); // 複製を渡せばcは有効なまま

    println!("c = {}", c);
}`,
      hints: [
        "エラー1は代入によるムーブ、エラー2は関数呼び出しによるムーブです。どちらもcloneで解決できます。",
        "let b = a.clone(); と take(c.clone()); の2箇所を書き換えます。"
      ],
      expectedOutput: "takeが受け取った: cherry"
    },
    {
      id: 50,
      title: "総合演習：所有権を操る",
      explanation: `<p>第5章の総合演習です。この章で学んだことを振り返りましょう。</p>
<ul>
<li><strong>所有権の3ルール</strong>：値の所有者は1つ、スコープを抜けたら破棄</li>
<li><strong>ムーブ</strong>：<code>String</code>の代入・関数への受け渡しで所有権が移動し、元の変数は無効になる（E0382）</li>
<li><strong>Copy型</strong>：整数・<code>bool</code>・<code>char</code>などはコピーされ、ムーブしない</li>
<li><strong>clone</strong>：ヒープのデータごと複製して、元の変数を有効なまま保つ</li>
<li><strong>戻り値</strong>：関数へ渡した所有権は戻り値で返せる</li>
<li><strong>drop</strong>：スコープの終わりで自動解放、<code>drop()</code>で明示解放</li>
</ul>
<p>今回は「名前を受け取って挨拶文を作って返す関数」を軸に、clone・ムーブ・Copy型を1つのプログラムに組み合わせます。データの流れを追いながら実装してください。</p>
<pre><code>let name = String::from("Rustacean");
let backup = name.clone();     // 複製を確保
let greeting = build_greeting(name); // nameはムーブ
// nameはもう使えないが、backupとgreetingは使える</code></pre>
<p>「この行の後、この変数はまだ生きているか？」を常に意識するのがRust上達の近道です。次章では所有権を移動させずに値を使う<strong>参照と借用</strong>を学び、cloneに頼らない書き方へ進化させます。</p>`,
      task: `関数<code>build_greeting</code>を実装してください。受け取った<code>name</code>の末尾に<code>"、こんにちは！"</code>を追記して返します。<code>main</code>のTODOでは、ムーブされる前の<code>name</code>から<code>clone</code>で<code>backup</code>を作ってください。`,
      code: `// TODO: nameの末尾に"、こんにちは！"を追記して返す
fn build_greeting(name: String) -> String {
    name
}

fn main() {
    let name = String::from("Rustacean");

    // TODO: nameがムーブされる前に、cloneでbackupを作る
    let backup = String::from("仮");

    // nameの所有権はbuild_greetingへムーブする
    let greeting = build_greeting(name);

    println!("{}", greeting);
    println!("元の名前: {}", backup);

    // i32はCopy型なのでムーブしない
    let count = 3;
    let copied = count;
    println!("count = {}, copied = {}", count, copied);
}`,
      solution: `// 所有権を受け取り、挨拶文にして所有権ごと返す
fn build_greeting(mut name: String) -> String {
    name.push_str("、こんにちは！");
    name
}

fn main() {
    let name = String::from("Rustacean");

    // ムーブされる前に複製を確保しておく
    let backup = name.clone();

    // nameの所有権はbuild_greetingへムーブする
    let greeting = build_greeting(name);

    println!("{}", greeting);
    println!("元の名前: {}", backup);

    // i32はCopy型なのでムーブしない
    let count = 3;
    let copied = count;
    println!("count = {}, copied = {}", count, copied);
}`,
      hints: [
        "build_greetingはステップ47のshout関数と同じ構造です。引数にmutを付けてpush_strし、最後にnameを返します。",
        "backupは let backup = name.clone(); で作ります。build_greeting(name)より前の行に書くことが重要です。"
      ],
      expectedOutput: "Rustacean、こんにちは！"
    }
  ]
});
