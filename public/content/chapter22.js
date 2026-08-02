// 第22章：よくあるエラー：所有権と借用
registerChapter({
  number: 22,
  title: "よくあるエラー：所有権と借用",
  description: "所有権と借用にまつわるコンパイルエラーは、Rust学習最大の壁です。この章では借用チェッカーが出す代表的なエラーを実際に起こし、メッセージを手がかりに修正する訓練をします。",
  steps: [
    {
      id: 211,
      title: "E0502：不変借用と可変借用の衝突",
      explanation: `<p>借用チェッカーの代表的エラー<strong>E0502</strong>です。Rustの借用ルール「<strong>不変参照は同時に何個でも可、ただし可変参照と共存は不可</strong>」に違反すると発生します。</p>
<pre><code>error[E0502]: cannot borrow \`numbers\` as mutable because it is
              also borrowed as immutable
 --&gt; main.rs:4:5
  |
3 |     let first = &amp;numbers[0];
  |                  ------- immutable borrow occurs here
4 |     numbers.push(4);
  |     ^^^^^^^^^^^^^^^ mutable borrow occurs here
5 |     println!("最初の要素: {}", first);
  |                                ----- immutable borrow later used here
</code></pre>
<p>E0502のメッセージは必ず<strong>3点セット</strong>で場所を示します。</p>
<ol>
<li><code>immutable borrow occurs here</code>：不変借用の開始地点（<code>&amp;numbers[0]</code>）</li>
<li><code>mutable borrow occurs here</code>：衝突した可変借用（<code>push</code>は内部で<code>&amp;mut self</code>を取る）</li>
<li><code>immutable borrow later used here</code>：不変借用が<strong>その後も使われている</strong>証拠</li>
</ol>
<p>3点目が重要です。Rustの借用は「最後に使われた場所」まで生きる（非字句ライフタイム、NLL）ので、<strong>もし5行目のprintln!が無ければこのコードはコンパイルできます</strong>。なぜ禁止かというと、pushはVecのメモリ再確保を引き起こすことがあり、その瞬間<code>first</code>が指す先が無効になる（ダングリング参照）からです。</p>
<p>修正パターンは主に2つです。</p>
<ul>
<li><strong>値をコピーして借用を作らない</strong>：i32はCopy型なので<code>let first = numbers[0];</code>とすれば借用が発生しない</li>
<li><strong>使う順序を変える</strong>：参照の利用をpushより前に済ませ、借用の生存期間を短くする</li>
</ul>`,
      task: `参照ではなく値のコピーを受け取るように修正して、pushと出力が両立するようにしてください（i32はCopy型であることを利用します）。`,
      code: `fn main() {
    let mut numbers = vec![1, 2, 3];
    let first = &numbers[0];
    // エラー: cannot borrow \`numbers\` as mutable because it is also borrowed as immutable
    numbers.push(4);
    println!("最初の要素: {}", first);
    println!("全体: {:?}", numbers);
}
`,
      solution: `fn main() {
    let mut numbers = vec![1, 2, 3];
    let first = numbers[0];
    numbers.push(4);
    println!("最初の要素: {}", first);
    println!("全体: {:?}", numbers);
}
`,
      hints: [
        `&numbers[0]の不変借用がprintln!まで生きているため、途中のpush（可変借用）と衝突しています。`,
        `i32はCopy型なので、&を外してlet first = numbers[0];とすれば借用自体が発生しません。`
      ],
      expectedOutput: "最初の要素: 1"
    },
    {
      id: 212,
      title: "E0499：可変借用を2つ作ってしまう",
      explanation: `<p><strong>E0499</strong>は「可変参照は同時に1つだけ」というルールへの違反です。同じ値への<code>&amp;mut</code>を2つ作り、両方をその後で使うと発生します。</p>
<pre><code>error[E0499]: cannot borrow \`text\` as mutable more than once at a time
 --&gt; main.rs:4:13
  |
3 |     let a = &amp;mut text;
  |             --------- first mutable borrow occurs here
4 |     let b = &amp;mut text;
  |             ^^^^^^^^^ second mutable borrow occurs here
5 |     a.push_str("!");
  |     - first borrow later used here
</code></pre>
<p>読み方はE0502と同じ3点セットです。<code>first mutable borrow</code>と<code>second mutable borrow</code>の位置、そして<strong>1つ目の借用がその後も使われている場所</strong>（<code>first borrow later used here</code>）が示されます。2つ目を作った時点ではなく、「1つ目がまだ生きているのに2つ目を作って両方使った」ことが問題なのです。</p>
<p>なぜ可変参照は1つだけなのでしょうか。2つの可変参照が同時に存在すると、片方の変更がもう片方の前提を壊す（データ競合の単一スレッド版）ことをコンパイル時に防げなくなるからです。このルールのおかげで、Rustは実行前に競合状態の芽を摘めます。</p>
<p>修正の基本は「<strong>使い終わってから次の借用を作る</strong>」ことです。NLL（非字句ライフタイム）により、借用は最後に使った行で終わります。</p>
<pre><code>let a = &amp;mut text;
a.push_str("!");      // ここでaの借用は終了
let b = &amp;mut text;    // だからこの行はOK
b.push_str("?");
</code></pre>
<p>そもそも参照を変数に取らず<code>text.push_str("!")</code>と直接呼べば、借用はその式の中だけで完結します。</p>`,
      task: `1つ目の可変参照を使い終えてから2つ目を作るように行を並べ替え、「Rust!?」が出力されるようにしてください。`,
      code: `fn main() {
    let mut text = String::from("Rust");
    let a = &mut text;
    // エラー: cannot borrow \`text\` as mutable more than once at a time
    let b = &mut text;
    a.push_str("!");
    b.push_str("?");
    println!("{}", b);
}
`,
      solution: `fn main() {
    let mut text = String::from("Rust");
    let a = &mut text;
    a.push_str("!");
    let b = &mut text;
    b.push_str("?");
    println!("{}", b);
}
`,
      hints: [
        `可変参照は同時に1つまでです。aを使い終わる前にbを作っているのが原因です。`,
        `a.push_str("!")をlet b = &mut text;より前に移動すれば、aの借用が先に終了します。`
      ],
      expectedOutput: "Rust!?"
    },
    {
      id: 213,
      title: "E0506：借用中の値への代入",
      explanation: `<p><strong>E0506（cannot assign to ... because it is borrowed）</strong>は、参照が生きている間に、参照先の変数そのものへ再代入しようとすると発生します。</p>
<pre><code>error[E0506]: cannot assign to \`status\` because it is borrowed
 --&gt; main.rs:4:5
  |
3 |     let view = &amp;status;
  |                ------- \`status\` is borrowed here
4 |     status = String::from("完了");
  |     ^^^^^^ \`status\` is assigned to here but it was borrowed
5 |     println!("{}", view);
  |                    ---- borrow later used here
</code></pre>
<p>ここでも「借用の開始」「問題の代入」「借用が後で使われる場所」の3点セットです。再代入が禁止される理由を考えてみましょう。<code>status</code>に新しいStringを代入すると、<strong>古いStringはその場でドロップ（破棄）されます</strong>。もし<code>view</code>がまだ古い値を指したままなら、5行目のprintln!は破棄済みメモリを読むことになります。E0506はこの「使用中の値の足元を掬う代入」を防いでいるのです。</p>
<p>修正パターンを整理します。</p>
<table>
<tr><th>パターン</th><th>書き方</th></tr>
<tr><td>参照を使い終えてから代入する</td><td>println!を代入より前へ移動</td></tr>
<tr><td>参照ではなく複製を持つ</td><td><code>let view = status.clone();</code></td></tr>
<tr><td>代入後は元の変数を直接使う</td><td>古い参照を使い続けない設計にする</td></tr>
</table>
<p>今回は「変更前の値を表示してから更新し、変更後の値も表示する」という自然な流れに直します。順序を変えるだけで借用チェッカーが通るのは、NLLが「参照の最後の使用地点」を正確に追跡しているおかげです。</p>`,
      task: `参照<code>view</code>の利用を再代入より前に移動し、変更前と変更後のステータスを両方出力できるようにしてください（変更後は<code>status</code>を直接表示します）。`,
      code: `fn main() {
    let mut status = String::from("準備中");
    let view = &status;
    // エラー: cannot assign to \`status\` because it is borrowed
    status = String::from("完了");
    println!("変更前: {}", view);
    println!("変更後: {}", status);
}
`,
      solution: `fn main() {
    let mut status = String::from("準備中");
    let view = &status;
    println!("変更前: {}", view);
    status = String::from("完了");
    println!("変更後: {}", status);
}
`,
      hints: [
        `viewがstatusを借用したまま、statusに新しい値を代入しているのが原因です。`,
        `println!("変更前: {}", view);を代入の前に移動すれば、借用が先に終わります。`
      ],
      expectedOutput: "変更後: 完了"
    },
    {
      id: 214,
      title: "E0507：参照の先から所有権を奪えない",
      explanation: `<p><strong>E0507（cannot move out of）</strong>は、「参照やインデックスの先にある値の所有権を持ち出そうとした」ときのエラーです。<code>Vec&lt;String&gt;</code>への添字アクセスが典型例です。</p>
<pre><code>error[E0507]: cannot move out of index of \`Vec&lt;String&gt;\`
 --&gt; main.rs:3:17
  |
3 |     let first = names[0];
  |                 ^^^^^^^^ move occurs because value has type \`String\`,
  |                          which does not implement the \`Copy\` trait
  |
help: consider borrowing here
  |
3 |     let first = &amp;names[0];
  |                 +
</code></pre>
<p><code>names[0]</code>と書くと、Rustはその要素を<strong>ムーブ（所有権ごと取り出す）</strong>しようとします。しかしVecから要素1つだけ抜き取ると、Vecの中に「空き穴」ができて全体が不正な状態になるため、コンパイラはこれを禁止します。メッセージの<code>move occurs because value has type String, which does not implement the Copy trait</code>が理由の説明で、<strong>i32のようなCopy型なら同じ書き方でもコピーになるので問題にならない</strong>ことも読み取れます。</p>
<p>help行の<code>+</code>記号は「この位置に<code>&amp;</code>を追加せよ」という差分形式の提案です。修正パターンは3つ覚えましょう。</p>
<table>
<tr><th>パターン</th><th>書き方</th><th>特徴</th></tr>
<tr><td>借用する</td><td><code>&amp;names[0]</code></td><td>コスト0。読むだけなら最善</td></tr>
<tr><td>複製する</td><td><code>names[0].clone()</code></td><td>所有権が欲しいとき。複製コストあり</td></tr>
<tr><td>取り除いて受け取る</td><td><code>names.remove(0)</code></td><td>Vecから本当に取り出したいとき</td></tr>
</table>`,
      task: `help行の提案通り<code>&amp;</code>を付けて借用に変え、最初の名前を出力できるようにしてください。`,
      code: `fn main() {
    let names = vec![String::from("Alice"), String::from("Bob")];
    // エラー: cannot move out of index of \`Vec<String>\`
    let first = names[0];
    println!("最初の名前: {}", first);
    println!("全員: {:?}", names);
}
`,
      solution: `fn main() {
    let names = vec![String::from("Alice"), String::from("Bob")];
    let first = &names[0];
    println!("最初の名前: {}", first);
    println!("全員: {:?}", names);
}
`,
      hints: [
        `names[0]はStringをVecからムーブしようとします。Vecに穴が空くため禁止されています。`,
        `読むだけなら&names[0]で借用すれば十分です。help行も&の追加を提案しています。`
      ],
      expectedOutput: "最初の名前: Alice"
    },
    {
      id: 215,
      title: "E0515：ローカル変数への参照を返す",
      explanation: `<p>関数内で作った値への<strong>参照</strong>を返そうとすると<strong>E0515</strong>が発生します。いわゆるダングリング参照（無効なメモリを指す参照）をコンパイル時に防ぐエラーです。</p>
<pre><code>error[E0515]: cannot return reference to local variable \`message\`
 --&gt; main.rs:3:5
  |
3 |     &amp;message
  |     ^^^^^^^^ returns a reference to data owned by the current function
</code></pre>
<p><code>returns a reference to data owned by the current function</code>が核心です。ローカル変数<code>message</code>は<strong>関数が終わった瞬間にドロップ（破棄）</strong>されます。その参照を呼び出し元へ返しても、指す先はもう存在しません。C言語なら未定義動作として実行時に化けるバグですが、Rustはコンパイル時に止めてくれます。</p>
<p>なお、ライフタイム注釈を付けずに<code>fn f() -&gt; &amp;String</code>と書いた場合は、先にE0106（missing lifetime specifier）が出ます。そのhelpに従って<code>&lt;'a&gt;</code>を付けても、今度はE0515に行き着きます。<strong>参照を返す設計そのものが成立していない</strong>ので、注釈では解決できないのです。</p>
<p>修正は「所有権ごと返す」が基本です。</p>
<pre><code>fn make_message() -&gt; String {
    let message = String::from("処理が完了しました");
    message  // 所有権をムーブして返す。コピーは発生しない
}
</code></pre>
<p>戻り値のムーブは軽量な操作（ヒープの中身はコピーされない）なので、性能を心配する必要はありません。関数の戻り値で参照が使えるのは、引数として受け取った参照をそのまま返すような場合に限られます。</p>`,
      task: `戻り値の型を<code>String</code>に変えて所有権ごと返すように修正し、メッセージを出力してください（ライフタイム注釈<code>&lt;'a&gt;</code>は不要になります）。`,
      code: `// エラー: cannot return reference to local variable \`message\`
fn make_message<'a>() -> &'a String {
    let message = String::from("処理が完了しました");
    &message
}

fn main() {
    let result = make_message();
    println!("{}", result);
}
`,
      solution: `fn make_message() -> String {
    let message = String::from("処理が完了しました");
    message
}

fn main() {
    let result = make_message();
    println!("{}", result);
}
`,
      hints: [
        `messageは関数終了時に破棄されるので、その参照を返すことはできません。`,
        `戻り値の型を&'a StringではなくStringにして、messageを所有権ごと返しましょう。`
      ],
      expectedOutput: "処理が完了しました"
    },
    {
      id: 216,
      title: "E0505：借用中の値をムーブしてしまう",
      explanation: `<p><strong>E0505（cannot move out of ... because it is borrowed）</strong>は、参照が生きているうちに、参照先の値の所有権を移動させると発生します。所有権を取る関数へ渡す場面が典型です。</p>
<pre><code>error[E0505]: cannot move out of \`data\` because it is borrowed
 --&gt; main.rs:8:13
  |
7 |     let view = &amp;data;
  |                ----- borrow of \`data\` occurs here
8 |     consume(data);
  |             ^^^^ move out of \`data\` occurs here
9 |     println!("参照: {}", view);
  |                          ---- borrow later used here
</code></pre>
<p>3点セットの読み方はもうお馴染みですね。「借用開始」「ムーブ地点」「借用がその後も使われる場所」です。<code>consume(data)</code>は引数の型が<code>String</code>（参照ではない）なので、<strong>呼び出しと同時に所有権が関数へムーブ</strong>します。ムーブ後の<code>data</code>は消えた扱いになるため、まだ生きている参照<code>view</code>が宙に浮いてしまう、というのが禁止の理由です。</p>
<p>E0502（借用中に可変借用）・E0506（借用中に代入）・E0505（借用中にムーブ）は三兄弟のようなもので、いずれも「<strong>参照が生きている間、参照先を壊す操作はできない</strong>」という同じ原則の現れです。修正の考え方も共通しています。</p>
<ul>
<li>参照の利用をムーブより<strong>前</strong>に終わらせる（今回はこれ）</li>
<li>関数へ参照<code>&amp;String</code>や<code>&amp;str</code>を渡す設計に変え、ムーブ自体を無くす</li>
<li><code>clone()</code>した複製を渡す</li>
</ul>`,
      task: `参照<code>view</code>を使う行を<code>consume</code>の呼び出しより前に移動して、借用とムーブが衝突しないようにしてください。`,
      code: `fn consume(text: String) {
    println!("消費: {}", text);
}

fn main() {
    let data = String::from("重要なデータ");
    let view = &data;
    // エラー: cannot move out of \`data\` because it is borrowed
    consume(data);
    println!("参照: {}", view);
}
`,
      solution: `fn consume(text: String) {
    println!("消費: {}", text);
}

fn main() {
    let data = String::from("重要なデータ");
    let view = &data;
    println!("参照: {}", view);
    consume(data);
}
`,
      hints: [
        `consume(data)はdataの所有権をムーブしますが、その時点で参照viewがまだ生きています。`,
        `println!("参照: {}", view);をconsumeの呼び出しより前に移動すれば、借用が先に終わります。`
      ],
      expectedOutput: "消費: 重要なデータ"
    },
    {
      id: 217,
      title: "forループでVecをムーブしてしまう（&忘れ）",
      explanation: `<p>forループの後でVecを使おうとしたら「ムーブ済み」と言われる。所有権エラーの中でも特に遭遇率が高いパターンです。</p>
<pre><code>error[E0382]: borrow of moved value: \`fruits\`
 --&gt; main.rs:7:28
  |
3 |     for fruit in fruits {
  |                  ------ \`fruits\` moved due to this implicit call
  |                         to \`.into_iter()\`
...
7 |     println!("合計{}種類", fruits.len());
  |                            ^^^^^^ value borrowed here after move
  |
help: consider borrowing to avoid moving into the for loop
  |
3 |     for fruit in &amp;fruits {
  |                  +
</code></pre>
<p>鍵は<code>moved due to this implicit call to .into_iter()</code>という一文です。<code>for x in コレクション</code>と書くと、Rustは暗黙に<code>into_iter()</code>を呼びます。<code>into_iter()</code>は<strong>コレクションの所有権を消費して</strong>、要素を所有権ごと取り出すイテレータを作るため、ループが終わった時点でVec全体が消えているのです。</p>
<table>
<tr><th>書き方</th><th>暗黙に呼ばれるもの</th><th>要素の型</th><th>ループ後のVec</th></tr>
<tr><td><code>for x in v</code></td><td><code>into_iter()</code></td><td><code>String</code>（所有権ごと）</td><td>使えない</td></tr>
<tr><td><code>for x in &amp;v</code></td><td><code>iter()</code></td><td><code>&amp;String</code>（参照）</td><td>使える</td></tr>
<tr><td><code>for x in &amp;mut v</code></td><td><code>iter_mut()</code></td><td><code>&amp;mut String</code></td><td>使える（要素を変更可）</td></tr>
</table>
<p>読むだけのループでは<code>&amp;</code>を付けて借用でイテレートするのが基本です。help行が示す通り<code>&amp;</code>を1文字足すだけで直ります。逆に「ループで要素を消費し尽くしてよい（その後Vecは使わない）」なら<code>for x in v</code>のままで問題ありません。</p>`,
      task: `forループを<code>&amp;fruits</code>に変えて借用でイテレートし、ループ後も<code>fruits.len()</code>が使えるようにしてください。`,
      code: `fn main() {
    let fruits = vec![String::from("りんご"), String::from("みかん")];
    for fruit in fruits {
        println!("{}", fruit);
    }
    // エラー: borrow of moved value: \`fruits\`
    println!("合計{}種類", fruits.len());
}
`,
      solution: `fn main() {
    let fruits = vec![String::from("りんご"), String::from("みかん")];
    for fruit in &fruits {
        println!("{}", fruit);
    }
    println!("合計{}種類", fruits.len());
}
`,
      hints: [
        `for fruit in fruitsはinto_iter()を呼び、Vec全体の所有権がループに消費されます。`,
        `for fruit in &fruitsと&を1文字足せば、借用のままイテレートできます。`
      ],
      expectedOutput: "合計2種類"
    },
    {
      id: 218,
      title: "E0596：mutでない変数から&mutは作れない",
      explanation: `<p><strong>E0596（cannot borrow ... as mutable）</strong>は、<code>mut</code>宣言されていない変数から可変参照<code>&amp;mut</code>を作ろうとしたときのエラーです。<code>&amp;mut</code>を要求する関数に渡す場面でよく出ます。</p>
<pre><code>error[E0596]: cannot borrow \`shopping\` as mutable, as it is not
              declared as mutable
 --&gt; main.rs:7:14
  |
7 |     add_item(&amp;mut shopping);
  |              ^^^^^^^^^^^^^ cannot borrow as mutable
  |
help: consider changing this to be mutable: \`mut shopping\`
</code></pre>
<p>E0384（mut無しで再代入）と似ていますが、区別しておきましょう。</p>
<table>
<tr><th>番号</th><th>やろうとしたこと</th><th>例</th></tr>
<tr><td>E0384</td><td>不変変数への<strong>再代入</strong></td><td><code>x = 5;</code></td></tr>
<tr><td>E0596</td><td>不変変数からの<strong>可変借用</strong></td><td><code>&amp;mut x</code>や<code>x.push(...)</code></td></tr>
</table>
<p>興味深いのは、<code>shopping.push(...)</code>のようなメソッド呼び出しでもE0596が出ることです。<code>push</code>のシグネチャは<code>fn push(&amp;mut self, ...)</code>なので、呼び出しの裏で暗黙に<code>&amp;mut shopping</code>が作られているからです。「変更系メソッドの呼び出し＝可変借用」という対応を頭に入れておくと、エラーの意味がすっと読めます。</p>
<p>修正はhelp行の通り、宣言に<code>mut</code>を足すだけです。ここで注意したいのは、直すのは<strong>使う側の行ではなく宣言の行</strong>だという点です。エラーの矢印は7行目を指していますが、helpは宣言（<code>let shopping</code>）の変更を提案しています。矢印の位置と修正すべき位置が違うのは、rustcのエラーではよくあることです。</p>`,
      task: `変数<code>shopping</code>の宣言に<code>mut</code>を追加して、<code>add_item</code>に可変参照を渡せるようにしてください。`,
      code: `fn add_item(list: &mut Vec<String>) {
    list.push(String::from("牛乳"));
}

fn main() {
    let shopping = Vec::new();
    // エラー: cannot borrow \`shopping\` as mutable, as it is not declared as mutable
    add_item(&mut shopping);
    println!("{:?}", shopping);
}
`,
      solution: `fn add_item(list: &mut Vec<String>) {
    list.push(String::from("牛乳"));
}

fn main() {
    let mut shopping = Vec::new();
    add_item(&mut shopping);
    println!("{:?}", shopping);
}
`,
      hints: [
        `&mut shoppingという可変参照を作るには、shopping自身がmutで宣言されている必要があります。`,
        `エラーの矢印は呼び出し行を指していますが、直すのは宣言行です。let mut shopping = Vec::new();とします。`
      ],
      expectedOutput: "[\"牛乳\"]"
    },
    {
      id: 219,
      title: "E0373：クロージャのmove忘れ（スレッド）",
      explanation: `<p>スレッドとクロージャを組み合わせたときの定番エラー<strong>E0373</strong>です。クロージャは外の変数を捕獲（キャプチャ）しますが、デフォルトでは<strong>参照で</strong>捕獲しようとします。これがスレッドと相性最悪なのです。</p>
<pre><code>error[E0373]: closure may outlive the current function, but it
              borrows \`message\`, which is owned by the current function
 --&gt; main.rs:5:32
  |
5 |     let handle = thread::spawn(|| {
  |                                ^^ may outlive borrowed value \`message\`
6 |         println!("{}", message);
  |                        ------- \`message\` is borrowed here
  |
help: to force the closure to take ownership of \`message\`, use
      the \`move\` keyword
  |
5 |     let handle = thread::spawn(move || {
  |                                ++++
</code></pre>
<p><code>closure may outlive the current function</code>（クロージャが今の関数より長生きするかもしれない）が核心です。生成されたスレッドが<strong>いつまで走るかコンパイラには分かりません</strong>。mainの変数<code>message</code>を参照で捕獲したまま、mainのスコープが先に終わったら、スレッドは破棄済みの変数を読むことになります。この可能性がある限りコンパイルは通りません。</p>
<p>help行の<code>++++</code>は「<code>move</code>という4文字を追加せよ」という差分提案です。<code>move</code>キーワードを付けると、クロージャは捕獲する変数の<strong>所有権を取り込む</strong>ようになり、スレッドがどれだけ長生きしても安全になります。</p>
<pre><code>thread::spawn(move || {
    println!("{}", message);  // messageの所有者はもうクロージャ自身
});
</code></pre>
<p>ただし、moveした変数はmain側では使えなくなります（使うとE0382）。複数スレッドで共有したい場合は、後の章で復習するArcの出番です。</p>`,
      task: `クロージャに<code>move</code>キーワードを付けて、<code>message</code>の所有権をスレッドに渡してください。`,
      code: `use std::thread;

fn main() {
    let message = String::from("スレッドからこんにちは");
    // エラー: closure may outlive the current function, but it borrows \`message\`
    let handle = thread::spawn(|| {
        println!("{}", message);
    });
    handle.join().unwrap();
}
`,
      solution: `use std::thread;

fn main() {
    let message = String::from("スレッドからこんにちは");
    let handle = thread::spawn(move || {
        println!("{}", message);
    });
    handle.join().unwrap();
}
`,
      hints: [
        `スレッドはmainより長生きする可能性があるため、参照でのキャプチャは許されません。`,
        `help行の提案通り、thread::spawn(move || { ... })とmoveを付けて所有権ごと渡します。`
      ],
      expectedOutput: "スレッドからこんにちは"
    },
    {
      id: 220,
      title: "総合演習：借用チェッカーと対話する",
      explanation: `<p>この章の総合演習です。1つのプログラムに借用・所有権のエラーが3つ仕込まれています。borrow checkerとの付き合い方のまとめとして、エラーメッセージの<strong>共通パターン</strong>を整理しておきましょう。</p>
<table>
<tr><th>メッセージの断片</th><th>意味</th><th>復習ステップ</th></tr>
<tr><td>borrowed as immutable / mutable</td><td>借用の衝突（E0502）</td><td>211</td></tr>
<tr><td>moved due to ... into_iter()</td><td>forループによるムーブ</td><td>217</td></tr>
<tr><td>cannot move out of index</td><td>Vec要素の持ち出し（E0507）</td><td>214</td></tr>
</table>
<p>借用エラーを直すときの思考手順は毎回同じです。</p>
<ol>
<li><strong>3点セットを特定する</strong>：借用（またはムーブ）の開始地点、衝突地点、借用が後で使われる地点</li>
<li><strong>「本当に所有権が要るか？」と自問する</strong>：読むだけなら参照<code>&amp;</code>、Copy型ならコピーで十分</li>
<li><strong>寿命を短くできないか考える</strong>：使う順序の入れ替えだけで解決することが多い</li>
</ol>
<p>今回の3つのエラーへの適用例です。1つ目のE0502は、要素がi32（Copy型）なので<code>&amp;</code>を外して値のコピーを取れば借用が消えます。2つ目のforループのムーブは<code>&amp;names</code>で借用イテレートに変えます。3つ目は2つ目を直した後に現れるE0507で、<code>&amp;names[0]</code>と借用すれば解決です。<strong>1つ直すたびに再コンパイルして、次のエラーと1つずつ対話する</strong>流れを体感してください。</p>`,
      task: `3つの借用・所有権エラーを順に修正し、最高点・科目一覧・合計点がすべて出力されるようにしてください。所有権を取らずに済む書き方（コピー・借用）を選ぶのがポイントです。`,
      code: `fn main() {
    let mut scores = vec![60, 75, 90];
    let best = &scores[2];
    // エラー1: cannot borrow \`scores\` as mutable because it is also borrowed as immutable
    scores.push(80);
    println!("最高点: {}", best);

    let names = vec![String::from("数学"), String::from("英語")];
    // エラー2: \`names\` moved due to this implicit call to \`.into_iter()\`
    for name in names {
        println!("科目: {}", name);
    }
    // エラー3（エラー2を直すと現れる）: cannot move out of index of \`Vec<String>\`
    let first = names[0];
    println!("最初の科目: {}", first);
    println!("科目数: {}", names.len());

    let total: i32 = scores.iter().sum();
    println!("合計: {}", total);
}
`,
      solution: `fn main() {
    let mut scores = vec![60, 75, 90];
    let best = scores[2];
    scores.push(80);
    println!("最高点: {}", best);

    let names = vec![String::from("数学"), String::from("英語")];
    for name in &names {
        println!("科目: {}", name);
    }
    let first = &names[0];
    println!("最初の科目: {}", first);
    println!("科目数: {}", names.len());

    let total: i32 = scores.iter().sum();
    println!("合計: {}", total);
}
`,
      hints: [
        `エラー1はi32がCopy型であることを利用し、&を外して値のコピーを受け取ります。`,
        `エラー2はfor name in &namesと借用でイテレートすれば、ループ後もnamesが使えます。`,
        `エラー3はlet first = &names[0];と借用すれば、Vecから要素をムーブせずに済みます。`
      ],
      expectedOutput: "合計: 305"
    }
  ]
});
