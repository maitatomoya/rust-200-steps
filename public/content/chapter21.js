// 第21章：よくあるエラー：構文と基本
registerChapter({
  number: 21,
  title: "よくあるエラー：構文と基本",
  description: "実際のコンパイルエラーをわざと起こし、エラーメッセージを読んで直す訓練をします。この章では変数名・型・ムーブ・文字列など、基本文法にまつわる頻出エラー10種を扱います。",
  steps: [
    {
      id: 201,
      title: "E0425：名前が見つからない（typo）",
      explanation: `<p>この章からは「エラーを読む訓練」です。わざとエラーを起こしたコードをコンパイルし、メッセージを手がかりに修正します。最初はもっとも遭遇率の高い<strong>E0425（cannot find value）</strong>。原因の大半は変数名のタイプミスです。下のコードをコンパイルすると、次のエラーが出ます。</p>
<pre><code>error[E0425]: cannot find value \`mesage\` in this scope
 --&gt; main.rs:4:20
  |
4 |     println!("{}", mesage);
  |                    ^^^^^^ help: a local variable with a similar
  |                            name exists: \`message\`
</code></pre>
<p>rustcのエラーメッセージは、どれも同じ構造をしています。読む場所を覚えましょう。</p>
<table>
<tr><th>部分</th><th>意味</th></tr>
<tr><td><code>error[E0425]</code></td><td>エラー番号。<code>rustc --explain E0425</code>で公式の詳しい解説が読める</td></tr>
<tr><td><code>--&gt; main.rs:4:20</code></td><td>発生場所（ファイル名:行:列）。まずここに飛ぶ</td></tr>
<tr><td><code>^^^^^^</code></td><td>問題の式そのものを指す下線</td></tr>
<tr><td><code>help:</code></td><td>修正候補。<strong>最初に読むべき最重要行</strong></td></tr>
</table>
<p>今回のhelpは「似た名前の変数<code>message</code>が存在する」と、正しい綴りまで教えてくれています。E0425は変数名のtypoのほかに、関数名の間違いや、宣言より前の行で変数を使った場合にも出ます。「見つからない」と言われたら、まず<strong>綴り</strong>、次に<strong>宣言の位置（スコープ）</strong>を疑うのが定石です。</p>`,
      task: `コンパイルエラーの<code>help:</code>行を手がかりに、変数名のタイプミスを修正してプログラムを動かしてください。`,
      code: `fn main() {
    let message = String::from("Hello, Rust!");
    // エラー: cannot find value \`mesage\` in this scope
    println!("{}", mesage);
}
`,
      solution: `fn main() {
    let message = String::from("Hello, Rust!");
    println!("{}", message);
}
`,
      hints: [
        `宣言した変数名とprintln!で使っている変数名を1文字ずつ見比べましょう。`,
        `help行が「similar name exists: message」と正しい綴りを教えてくれています。`
      ],
      expectedOutput: "Hello, Rust!"
    },
    {
      id: 202,
      title: "セミコロン・波括弧の閉じ忘れ（expected ;）",
      explanation: `<p>次は構文エラーです。Rustの文（statement）は原則セミコロン<code>;</code>で終わります。忘れるとコンパイラは「次に来るはずの記号が来なかった」と報告します。</p>
<pre><code>error: expected \`;\`, found keyword \`let\`
 --&gt; main.rs:2:15
  |
2 |     let x = 10
  |               ^ help: add \`;\` here
3 |     let y = 20;
  |     --- unexpected token
</code></pre>
<p>注目してほしいのは2点です。</p>
<ul>
<li><strong>E番号がない</strong>：構文（パース）段階のエラーには<code>error[E0308]</code>のような番号が付かないことが多く、<code>error: expected ...</code>という形になります。</li>
<li><strong>報告位置は「次のトークン」</strong>：エラーの矢印は3行目の<code>let</code>を「unexpected token」と指していますが、本当の原因は<strong>その直前の行</strong>のセミコロン忘れです。構文エラーでは「指された場所の1つ前」を疑うのが鉄則です。</li>
</ul>
<p>波括弧<code>}</code>の閉じ忘れも同様で、「この開き括弧に対応する閉じ括弧がない」という形で、ファイルのずっと後ろ（多くは最終行）でエラーが報告されます。</p>
<pre><code>error: this file contains an unclosed delimiter
  |
1 | fn main() {
  |           - unclosed delimiter
</code></pre>
<p>構文エラーは連鎖して大量のエラーを生むことがあります。<strong>一番最初に表示されたエラーから直す</strong>と、後続のエラーがまとめて消えることがよくあります。</p>`,
      task: `セミコロンの付け忘れを修正して、合計を出力するプログラムを完成させてください。`,
      code: `fn main() {
    // エラー: expected \`;\`, found keyword \`let\`
    let x = 10
    let y = 20;
    println!("合計: {}", x + y);
}
`,
      solution: `fn main() {
    let x = 10;
    let y = 20;
    println!("合計: {}", x + y);
}
`,
      hints: [
        `エラーが指しているのは3行目ですが、原因はその直前の行にあります。`,
        `help行の「add ; here」の通り、10の直後にセミコロンを追加します。`
      ],
      expectedOutput: "合計: 30"
    },
    {
      id: 203,
      title: "E0308：型の不一致（i32とf64）",
      explanation: `<p><strong>E0308（mismatched types）</strong>は、Rustでもっとも頻繁に見るエラー番号です。「期待される型（expected）」と「実際の型（found）」が食い違うと発生します。</p>
<pre><code>error[E0308]: mismatched types
 --&gt; main.rs:3:24
  |
3 |     let average: f64 = count / 2;
  |                  ---   ^^^^^^^^^ expected \`f64\`, found \`i32\`
  |                  |
  |                  expected due to this
</code></pre>
<p>読み方の要点は<code>expected \`f64\`, found \`i32\`</code>の1行です。「f64が来るはずの場所にi32が来た」という意味で、さらに<code>expected due to this</code>が「f64を期待する根拠は型注釈<code>: f64</code>だ」と教えてくれます。</p>
<p>Rustは<strong>数値型を暗黙には変換しません</strong>。i32とf64の演算・代入は、たとえ安全に見えても自動では行われず、<code>as</code>による明示的なキャストが必要です。</p>
<table>
<tr><th>書き方</th><th>結果</th></tr>
<tr><td><code>let a: f64 = 5 / 2;</code></td><td>E0308（i32をf64に入れられない）</td></tr>
<tr><td><code>let a: f64 = 5 as f64 / 2.0;</code></td><td>OK。2.5になる</td></tr>
<tr><td><code>let a = 5 / 2;</code></td><td>OK。ただし整数除算で2になる点に注意</td></tr>
</table>
<p>もう1つの落とし穴が<strong>整数除算</strong>です。<code>count / 2</code>を先に計算してからf64へ変換すると、小数部分が切り捨てられた後の値（2）になってしまいます。<strong>先にf64へ変換してから割る</strong>のが正しい順序です。</p>`,
      task: `<code>count</code>を<code>as f64</code>でキャストし、平均値2.5が正しく出力されるように修正してください（先にキャストしてから割ること）。`,
      code: `fn main() {
    let count: i32 = 5;
    // エラー: mismatched types  expected \`f64\`, found \`i32\`
    let average: f64 = count / 2;
    println!("平均: {}", average);
}
`,
      solution: `fn main() {
    let count: i32 = 5;
    let average: f64 = count as f64 / 2.0;
    println!("平均: {}", average);
}
`,
      hints: [
        `Rustはi32からf64への変換を自動では行いません。as f64で明示的にキャストします。`,
        `count / 2をf64にしても整数除算の結果2が入るだけです。count as f64 / 2.0の順で計算しましょう。`
      ],
      expectedOutput: "平均: 2.5"
    },
    {
      id: 204,
      title: "E0384：mut忘れで再代入できない",
      explanation: `<p>Rustの変数はデフォルトで<strong>不変（immutable）</strong>です。<code>mut</code>を付けずに再代入しようとすると<strong>E0384</strong>が発生します。</p>
<pre><code>error[E0384]: cannot assign twice to immutable variable \`score\`
 --&gt; main.rs:3:5
  |
2 |     let score = 0;
  |         ----- first assignment to \`score\`
3 |     score = score + 10;
  |     ^^^^^^^^^^^^^^^^^^ cannot assign twice to immutable variable
  |
help: consider making this binding mutable: \`mut score\`
</code></pre>
<p>このエラーの読み方はシンプルです。<code>first assignment</code>（最初の代入＝letでの初期化）の位置と、2回目の代入の位置を両方示した上で、helpが「<code>mut score</code>にせよ」と修正方法まで提示しています。エラーメッセージの中では、<strong>let時の初期化も1回目の「代入」として数えられている</strong>点に注目してください。</p>
<p>修正の選択肢は2つあります。</p>
<ul>
<li><strong>mutを付ける</strong>：値を更新し続けたい場合。<code>let mut score = 0;</code></li>
<li><strong>シャドーイング（同名変数の再宣言による上書き）</strong>：<code>let score = score + 10;</code>のようにletを付けて新しい変数を作る。型を変えたいときにも使える</li>
</ul>
<p>「不変がデフォルト」はRustの安全性の柱で、コードを読む人は<code>mut</code>が付いていない変数を「以後変わらない」と信頼して読めます。mutは必要な場所にだけ付けるのが良いスタイルです。</p>`,
      task: `E0384のhelp行に従って変数を可変にし、スコアの加算が動くように修正してください。`,
      code: `fn main() {
    let score = 0;
    // エラー: cannot assign twice to immutable variable \`score\`
    score = score + 10;
    println!("スコア: {}", score);
}
`,
      solution: `fn main() {
    let mut score = 0;
    score = score + 10;
    println!("スコア: {}", score);
}
`,
      hints: [
        `Rustの変数はデフォルトで不変です。後から値を変えるには宣言時にあるキーワードが必要です。`,
        `help行の通り、let mut score = 0;と宣言します。`
      ],
      expectedOutput: "スコア: 10"
    },
    {
      id: 205,
      title: "E0382：ムーブ後の値を使ってしまう",
      explanation: `<p>所有権の代表的なエラー<strong>E0382（use of moved value / borrow of moved value）</strong>です。<code>String</code>のようなヒープを使う型は、代入すると所有権が<strong>ムーブ（移動）</strong>し、元の変数は使えなくなります。</p>
<pre><code>error[E0382]: borrow of moved value: \`original\`
 --&gt; main.rs:4:20
  |
2 |     let original = String::from("Rust");
  |         -------- move occurs because \`original\` has type \`String\`,
  |                  which does not implement the \`Copy\` trait
3 |     let copied = original;
  |                  -------- value moved here
4 |     println!("{}", original);
  |                    ^^^^^^^^ value borrowed here after move
</code></pre>
<p>このメッセージは<strong>物語のように時系列で読めます</strong>。</p>
<ol>
<li><code>move occurs because ...</code>：StringはCopyトレイトを実装していないので、代入はコピーではなくムーブになる</li>
<li><code>value moved here</code>：3行目の代入で所有権がcopiedへ移った</li>
<li><code>value borrowed here after move</code>：ムーブ後の4行目で使おうとした（ここがエラー）</li>
</ol>
<p>修正パターンは状況で選びます。</p>
<table>
<tr><th>パターン</th><th>使いどころ</th></tr>
<tr><td><code>clone()</code>で複製する</td><td>両方の変数で値を使いたいとき（複製コストは掛かる）</td></tr>
<tr><td>参照<code>&amp;</code>を渡す</td><td>所有権を移さず読むだけでよいとき</td></tr>
<tr><td>使う順序を入れ替える</td><td>ムーブ前に使い終えられるとき</td></tr>
</table>
<p>i32などのCopy型ではこのエラーが起きない（代入=コピーになる）ことも、メッセージ中の「does not implement the Copy trait」から読み取れます。</p>`,
      task: `<code>clone()</code>を使って複製を作り、<code>original</code>と<code>copied</code>の両方を出力できるように修正してください。`,
      code: `fn main() {
    let original = String::from("Rust");
    let copied = original;
    // エラー: borrow of moved value: \`original\`
    println!("original = {}", original);
    println!("copied = {}", copied);
}
`,
      solution: `fn main() {
    let original = String::from("Rust");
    let copied = original.clone();
    println!("original = {}", original);
    println!("copied = {}", copied);
}
`,
      hints: [
        `let copied = original;の時点で所有権がムーブし、originalは使えなくなっています。`,
        `両方の変数を生かしたいので、代入時にclone()で複製を作りましょう。`
      ],
      expectedOutput: "original = Rust"
    },
    {
      id: 206,
      title: "E0369：文字列を+で連結できない",
      explanation: `<p>文字列連結の<code>+</code>演算子には厳密なルールがあり、初心者が必ず一度はハマります。<code>&amp;str</code>同士を<code>+</code>でつなぐと<strong>E0369</strong>が発生します。</p>
<pre><code>error[E0369]: cannot add \`&amp;str\` to \`&amp;str\`
 --&gt; main.rs:3:33
  |
3 |     let greeting = "こんにちは、" + "世界！";
  |                    ------------- ^ ------- &amp;str
  |                    |             |
  |                    |             \`+\` cannot be used to concatenate
  |                    |             two \`&amp;str\` strings
  |                    &amp;str
  |
help: create an owned \`String\` from a string reference
</code></pre>
<p>Rustの<code>+</code>は「<strong>左辺がString、右辺が&amp;str</strong>」の組み合わせでのみ使えます。左辺のStringの所有権を受け取り、右辺の内容を追記して返す、という設計だからです。</p>
<table>
<tr><th>組み合わせ</th><th>結果</th></tr>
<tr><td><code>&amp;str + &amp;str</code></td><td>E0369（今回のエラー）</td></tr>
<tr><td><code>String + String</code></td><td>E0308（右辺は&amp;strであるべき）</td></tr>
<tr><td><code>String + &amp;str</code></td><td>OK</td></tr>
<tr><td><code>format!("{}{}", a, b)</code></td><td>OK。どの組み合わせでも使える</td></tr>
</table>
<p>修正は2通り。左辺を<code>String::from(...)</code>でStringにするか、<code>format!</code>マクロを使うかです。</p>
<pre><code>let a = String::from("こんにちは、") + "世界！";
let b = format!("{}{}", "こんにちは、", "世界！");
</code></pre>
<p><code>format!</code>は所有権を奪わず組み合わせも自由なので、実務では<code>format!</code>を第一候補にするのがおすすめです。</p>`,
      task: `左辺を<code>String::from</code>でStringに変えて、あいさつ文が出力されるように修正してください。`,
      code: `fn main() {
    // エラー: cannot add \`&str\` to \`&str\`
    let greeting = "こんにちは、" + "世界！";
    println!("{}", greeting);
}
`,
      solution: `fn main() {
    let greeting = String::from("こんにちは、") + "世界！";
    println!("{}", greeting);
}
`,
      hints: [
        `+演算子は「String + &str」の形でしか使えません。文字列リテラルは&str型です。`,
        `左辺をString::from("こんにちは、")に変えれば右辺の&strを連結できます。format!を使う方法もあります。`
      ],
      expectedOutput: "こんにちは、世界！"
    },
    {
      id: 207,
      title: "E0433：use宣言忘れ（HashMap）",
      explanation: `<p>標準ライブラリの型でも、プレリュード（use無しで使える基本セット）に含まれないものは<code>use</code>宣言が必要です。<code>HashMap</code>はその代表で、忘れると<strong>E0433（failed to resolve）</strong>が発生します。</p>
<pre><code>error[E0433]: failed to resolve: use of undeclared type \`HashMap\`
 --&gt; main.rs:2:22
  |
2 |     let mut scores = HashMap::new();
  |                      ^^^^^^^ use of undeclared type \`HashMap\`
  |
help: consider importing this struct
  |
1 + use std::collections::HashMap;
</code></pre>
<p>注目すべきはhelp以下の<code>1 + use std::collections::HashMap;</code>という表記です。これは「1行目にこの行を追加せよ」という<strong>差分（diff）形式の提案</strong>で、<code>+</code>は追加すべき行を意味します。rustcはフルパスまで調べて提案してくれるので、そのままコピーすれば直ることがほとんどです。</p>
<p>兄弟エラーに<strong>E0432（unresolved import）</strong>があります。違いを整理しておきましょう。</p>
<table>
<tr><th>番号</th><th>状況</th><th>例</th></tr>
<tr><td>E0433</td><td>useを書き忘れて型・モジュールが解決できない</td><td>use無しで<code>HashMap::new()</code></td></tr>
<tr><td>E0432</td><td>use宣言そのものが間違っている</td><td><code>use std::collection::HashMap;</code>（sが無いtypo）</td></tr>
</table>
<p>なお、useを書かずに<code>std::collections::HashMap::new()</code>とフルパスで書いても動きますが、何度も使う型はuseで持ち込むのが読みやすい書き方です。</p>`,
      task: `help行が提案しているuse宣言をファイルの先頭に追加して、HashMapを使えるようにしてください。`,
      code: `// エラー: failed to resolve: use of undeclared type \`HashMap\`
fn main() {
    let mut scores = HashMap::new();
    scores.insert("math", 90);
    println!("{:?}", scores.get("math"));
}
`,
      solution: `use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert("math", 90);
    println!("{:?}", scores.get("math"));
}
`,
      hints: [
        `HashMapはプレリュードに含まれないため、useで持ち込む必要があります。`,
        `help行の提案通り、ファイル先頭にuse std::collections::HashMap;を追加します。`
      ],
      expectedOutput: "Some(90)"
    },
    {
      id: 208,
      title: "E0599：そのメソッドは存在しない",
      explanation: `<p><strong>E0599（no method named）</strong>は「その型にそんなメソッドはない」というエラーです。原因はメソッド名のtypoか、他言語の名前を持ち込んでしまうこと。今回は他言語で一般的な<code>length()</code>を呼んでしまった例です。</p>
<pre><code>error[E0599]: no method named \`length\` found for struct
              \`Vec&lt;&amp;str&gt;\` in the current scope
 --&gt; main.rs:3:34
  |
3 |     println!("要素数: {}", names.length());
  |                                  ^^^^^^
  |
help: there is a method with a similar name: \`len\`
</code></pre>
<p>読み方のポイントは2つです。</p>
<ul>
<li><code>found for struct \`Vec&lt;&amp;str&gt;\`</code>：<strong>どの型に対して探したか</strong>が書かれています。意図と違う型が表示されていたら、メソッド名ではなく「レシーバの型」が間違っているサインです。</li>
<li><code>help: there is a method with a similar name</code>：似た名前のメソッドを提案してくれます。今回は<code>len</code>が正解です。</li>
</ul>
<p>他言語からの「輸入ミス」でE0599になりやすい名前を覚えておくと予防になります。</p>
<table>
<tr><th>他言語の名前</th><th>Rustでの正しい名前</th></tr>
<tr><td><code>length() / size()</code></td><td><code>len()</code></td></tr>
<tr><td><code>append() / add()</code></td><td>Vecなら<code>push()</code></td></tr>
<tr><td><code>toString()</code></td><td><code>to_string()</code>（スネークケース）</td></tr>
</table>
<p>E0599は「トレイトをuseしていないためメソッドが見えない」場合にも出ます。その場合はhelpに「the following trait is implemented but not in scope」と表示されるので、指示に従ってuseを追加します。</p>`,
      task: `メソッド名を正しいものに修正して、Vecの要素数を出力してください。`,
      code: `fn main() {
    let names = vec!["Alice", "Bob"];
    // エラー: no method named \`length\` found for struct \`Vec<&str>\`
    println!("要素数: {}", names.length());
}
`,
      solution: `fn main() {
    let names = vec!["Alice", "Bob"];
    println!("要素数: {}", names.len());
}
`,
      hints: [
        `Rustで要素数を返すメソッドはlength()ではありません。help行が正しい名前を提案しています。`,
        `Vecや文字列の長さはlen()で取得します。`
      ],
      expectedOutput: "要素数: 2"
    },
    {
      id: 209,
      title: "E0308：&strとStringの取り違え（関数引数）",
      explanation: `<p>E0308は関数呼び出しでも頻発します。特に多いのが、<code>String</code>を要求する関数に文字列リテラル（<code>&amp;str</code>型）を渡してしまうケースです。</p>
<pre><code>error[E0308]: mismatched types
 --&gt; main.rs:6:11
  |
6 |     greet("田中");
  |     ----- ^^^^^^ expected \`String\`, found \`&amp;str\`
  |     |
  |     arguments to this function are incorrect
  |
note: function defined here
 --&gt; main.rs:1:4
  |
1 | fn greet(name: String) {
</code></pre>
<p>ポイントは<code>note: function defined here</code>です。呼び出し側のエラーと合わせて、<strong>関数定義の場所も一緒に示してくれる</strong>ので、「呼び出しを直すか、定義を直すか」を見比べて判断できます。修正は2方向あります。</p>
<table>
<tr><th>修正方針</th><th>書き方</th><th>向いている場面</th></tr>
<tr><td>呼び出し側を合わせる</td><td><code>greet(String::from("田中"))</code></td><td>関数が所有権を必要とする場合</td></tr>
<tr><td>定義側を<code>&amp;str</code>にする</td><td><code>fn greet(name: &amp;str)</code></td><td>読むだけの関数（推奨）</td></tr>
</table>
<p>読むだけの関数は<code>&amp;str</code>で受けるのがRustの慣習です。理由は受け入れ範囲の広さで、<code>&amp;str</code>引数にはリテラルをそのまま渡せるうえ、<code>String</code>も<code>&amp;変数名</code>と参照にすれば<strong>Deref強制（&amp;Stringが自動で&amp;strに変換される仕組み）</strong>によりそのまま渡せます。逆にString引数はリテラルを受け取れず、呼び出し側に変換を強います。</p>`,
      task: `関数定義側を修正して<code>&amp;str</code>で受け取るようにし、リテラルとStringの両方を渡せることを確認してください。`,
      code: `// エラー: expected \`String\`, found \`&str\`
fn greet(name: String) {
    println!("こんにちは、{}さん", name);
}

fn main() {
    greet("田中");
    let owner = String::from("鈴木");
    greet(&owner);
}
`,
      solution: `fn greet(name: &str) {
    println!("こんにちは、{}さん", name);
}

fn main() {
    greet("田中");
    let owner = String::from("鈴木");
    greet(&owner);
}
`,
      hints: [
        `文字列リテラル"田中"の型は&strで、Stringではありません。`,
        `関数の引数をname: &strに変えると、リテラルも&Stringも（Deref強制で）両方渡せます。`
      ],
      expectedOutput: "こんにちは、田中さん"
    },
    {
      id: 210,
      title: "総合演習：基本エラーを順に直す",
      explanation: `<p>この章の総合演習です。1つのプログラムに、これまで学んだエラーが複数仕込まれています。実務でもエラーが複数同時に出ることは日常茶飯事で、直す手順にはコツがあります。</p>
<ol>
<li><strong>最初のエラーから直す</strong>：構文エラー（セミコロン忘れなど）は後続の解析を狂わせ、偽のエラーを量産します。リストの先頭から片付けます。</li>
<li><strong>1つ直すたびに再コンパイルする</strong>：エラーを直すと、隠れていた次のエラーが現れることがあります。まとめて直そうとせず、コンパイラと1往復ずつ対話します。</li>
<li><strong>help行を最初に読む</strong>：rustcのhelpは正答率が高く、コピーで直るものも多いです。</li>
</ol>
<p>今回仕込まれているのは次の3種類です。</p>
<table>
<tr><th>エラー</th><th>症状</th><th>復習ステップ</th></tr>
<tr><td>セミコロン忘れ</td><td>expected \`;\` が次の行を指す</td><td>202</td></tr>
<tr><td>E0384</td><td>mutの無い変数への再代入</td><td>204</td></tr>
<tr><td>E0425＋E0382</td><td>変数名typoを直すと、今度はムーブ済みの値の使用が発覚する</td><td>201・205</td></tr>
</table>
<p>3つ目が今回の山場です。<code>itme</code>というtypo（E0425）を<code>item</code>に直すと、今度は「<code>item</code>は<code>label</code>へムーブ済み」というE0382が現れます。<strong>エラーを1枚めくると次のエラーが出てくる</strong>体験こそ、この演習の狙いです。ムーブの解決には<code>clone()</code>を使いましょう。</p>`,
      task: `コンパイルエラーを1つずつ修正し、「りんご: 360円」と「ラベル: りんご」が出力されるようにしてください。typoを直した後に現れるムーブのエラーは<code>clone()</code>で解決します。`,
      code: `fn total_price(unit: i32, count: i32) -> i32 {
    unit * count
}

fn main() {
    let item = String::from("りんご");
    // エラー1: expected \`;\`
    let price = 120
    let count = 0;
    // エラー2: cannot assign twice to immutable variable
    count = count + 3;
    let label = item;
    // エラー3: cannot find value \`itme\`（直すと今度はムーブのエラーが出る）
    println!("{}: {}円", itme, total_price(price, count));
    println!("ラベル: {}", label);
}
`,
      solution: `fn total_price(unit: i32, count: i32) -> i32 {
    unit * count
}

fn main() {
    let item = String::from("りんご");
    let price = 120;
    let mut count = 0;
    count = count + 3;
    let label = item.clone();
    println!("{}: {}円", item, total_price(price, count));
    println!("ラベル: {}", label);
}
`,
      hints: [
        `まず120の後のセミコロン、次にcountのmutを直して再コンパイルしましょう。`,
        `itmeをitemに直すと、let label = item;でムーブ済みというE0382が出ます。`,
        `labelとitemの両方を使いたいので、let label = item.clone();と複製します。`
      ],
      expectedOutput: "りんご: 360円"
    }
  ]
});
