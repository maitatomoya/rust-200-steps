// 第1章：はじめてのRust
registerChapter({
  number: 1,
  title: "はじめてのRust",
  description: "Rustプログラムの基本構造から変数・定数・式までを学び、最初の一歩を踏み出します。",
  steps: [
    {
      id: 1,
      title: "Hello Worldとprintln!",
      explanation: `<p>プログラミング言語を学ぶ最初の一歩は、画面に文字を表示することです。Rustのプログラムは必ず<code>fn main()</code>という関数から実行が始まります。<code>fn</code>は「function（関数）」の略で、<code>main</code>はプログラムの入り口（エントリーポイント）となる特別な名前です。</p>
<pre><code>fn main() {
    println!("Hello, world!");
}</code></pre>
<p>文字を表示しているのは<code>println!</code>です。名前の末尾に<code>!</code>が付いていることに注目してください。これはRustの「マクロ（コンパイル時にコードを生成する仕組み）」であることを示す印です。普通の関数と区別するために<code>!</code>が付きます。いまの段階では「<code>println!</code>は改行付きで文字列を表示する命令で、<code>!</code>はマクロの印」と覚えておけば十分です。</p>
<p>構文のポイントを整理します。</p>
<ul>
<li>関数の本体は<code>{</code>と<code>}</code>で囲む</li>
<li>表示したい文字列は<code>"</code>（ダブルクォート）で囲む</li>
<li>命令の終わりには<code>;</code>（セミコロン）を付ける</li>
</ul>
<p>この3点はRustのほぼすべてのコードに登場する基本ルールです。まずは動くコードをそのまま実行し、次に文字列を書き換えて、変更が出力に反映されることを体験しましょう。</p>`,
      task: `まずコードをそのまま実行して出力を確認しましょう。次に、表示される文字列を<code>Hello, Rust!</code>に書き換えて再実行してください。`,
      code: `fn main() {
    // TODO: 実行して出力を確認したら、文字列を「Hello, Rust!」に書き換える
    println!("Hello, world!");
}`,
      solution: `fn main() {
    println!("Hello, Rust!");
}`,
      hints: [
        `変更するのはダブルクォートで囲まれた文字列の部分だけです。`,
        `println!("Hello, Rust!"); のように、worldをRustに書き換えます。大文字小文字と記号も正確に。`
      ],
      expectedOutput: "Hello, Rust!"
    },
    {
      id: 2,
      title: "コンパイルとエラーを体験する",
      explanation: `<p>Rustは「コンパイル言語」です。書いたコードは<code>rustc</code>というコンパイラによって機械語に変換（コンパイル）されてから実行されます。このとき文法の誤りや型の不一致があると、実行前に「コンパイルエラー」として指摘されます。</p>
<p>エラーと聞くと身構えてしまいますが、Rustのコンパイラは世界でも屈指の親切さで知られています。エラーメッセージには次の情報が含まれます。</p>
<ul>
<li><strong>エラーの種類</strong>：<code>error[E0425]</code>のような番号付きの分類</li>
<li><strong>場所</strong>：ファイル名と行番号、そして<code>^^^</code>で問題の箇所を指し示す矢印</li>
<li><strong>help</strong>：「もしかして<code>println</code>では？」のような修正候補の提案</li>
</ul>
<p>たとえば次のコードは<code>println!</code>のつづりが間違っているためコンパイルできません。</p>
<pre><code>fn main() {
    pritnln!("こんにちは"); // つづりが違う！
}</code></pre>
<p>このときコンパイラは「<code>cannot find macro pritnln in this scope</code>（pritnlnというマクロは見つかりません）」と報告し、多くの場合<code>help: a macro with a similar name exists: println</code>と正しい名前まで教えてくれます。</p>
<p>エラーは失敗ではなく、コンパイラとの対話です。「エラーメッセージを恐れず読む」習慣は、Rust学習で最も価値のあるスキルの1つです。まずはわざと壊れたコードを実行してエラーを観察し、それを直すという流れを体験しましょう。</p>`,
      task: `このコードはコンパイルエラーになります。まず実行してエラーメッセージを読み、helpの提案を参考にタイポ（つづりの誤り）を修正して<code>コンパイルは友達</code>と表示させてください。`,
      code: `fn main() {
    // このコードにはつづりの誤りが1か所あります
    // まず実行してエラーメッセージを観察しましょう
    pritnln!("コンパイルは友達");
}`,
      solution: `fn main() {
    println!("コンパイルは友達");
}`,
      hints: [
        `エラーメッセージの中の「cannot find macro」に続く名前と、正しいマクロ名を見比べてみましょう。`,
        `pritnlnのtとnの位置が入れ替わっています。正しくはprintlnです。`
      ],
      expectedOutput: "コンパイルは友達"
    },
    {
      id: 3,
      title: "println!のプレースホルダ{}",
      explanation: `<p><code>println!</code>は固定の文字列を表示するだけでなく、値を埋め込んで表示できます。埋め込む場所を示すのが<code>{}</code>で、これを「プレースホルダ（値の置き場所）」と呼びます。</p>
<pre><code>fn main() {
    println!("{}は{}年に公開されました", "Rust", 2015);
}</code></pre>
<p>このコードは「Rustは2015年に公開されました」と表示します。<code>{}</code>が2つあり、カンマ区切りで渡した値が前から順番に埋め込まれます。文字列でも数値でも同じ<code>{}</code>で表示できるのが便利なところです。</p>
<p>順番を明示したいときは<code>{0}</code>や<code>{1}</code>のように番号を書くこともできます。番号は渡した値の並び順（0始まり）に対応します。</p>
<pre><code>fn main() {
    // 同じ値を2回使うこともできる
    println!("{0}と{1}、やっぱり{0}", "米", "パン");
    // 出力：米とパン、やっぱり米
}</code></pre>
<p>プレースホルダの数と渡す値の数が合わないとコンパイルエラーになります。ここもRustらしい安全設計で、他の言語にありがちな「表示してみたら値が欠けていた」という実行時の事故を、コンパイルの時点で防いでくれます。</p>
<p>今後の学習では変数の中身を確認するために<code>println!</code>を頻繁に使います。<code>{}</code>の使い方はここでしっかり手になじませておきましょう。</p>`,
      task: `プレースホルダ<code>{}</code>を2つ使って、<code>Rustは2015年に公開されました</code>と表示してください。値として<code>"Rust"</code>と<code>2015</code>を渡します。`,
      code: `fn main() {
    // TODO: {}を2つ使い、"Rust"と2015を埋め込んで
    // 「Rustは2015年に公開されました」と表示する
    println!("は年に公開されました");
}`,
      solution: `fn main() {
    println!("{}は{}年に公開されました", "Rust", 2015);
}`,
      hints: [
        `文字列の中の値を入れたい位置に{}を書き、カンマの後ろに値を順番に並べます。`,
        `println!("{}は{}年に公開されました", 値1, 値2); の形です。値1は"Rust"、値2は2015です。`
      ],
      expectedOutput: "Rustは2015年に公開されました"
    },
    {
      id: 4,
      title: "コメントの書き方",
      explanation: `<p>コメントとは、コンパイラに無視される「人間のためのメモ」です。コードの意図や背景を書き残すことで、未来の自分やチームメンバーの理解を助けます。Rustのコメントには主に2種類あります。</p>
<table>
<tr><th>書き方</th><th>名前</th><th>範囲</th></tr>
<tr><td><code>// メモ</code></td><td>行コメント</td><td>その行の<code>//</code>以降すべて</td></tr>
<tr><td><code>/* メモ */</code></td><td>ブロックコメント</td><td><code>/*</code>から<code>*/</code>まで（複数行可）</td></tr>
</table>
<pre><code>fn main() {
    // これは行コメント。この行はコンパイラに無視される
    println!("こんにちは"); // コードの後ろにも書ける

    /* これはブロックコメント。
       複数行にまたがるメモに便利 */
    println!("さようなら");
}</code></pre>
<p>Rustの現場では行コメント<code>//</code>が主流です。また<code>///</code>で始まる「ドキュメンテーションコメント」という特別なコメントもあり、関数などの説明を書くとツールが自動でドキュメントを生成してくれます（詳しくは後の章で扱います）。</p>
<p>コメントのもう1つの実用的な使い方が「コメントアウト」です。コードの行頭に<code>//</code>を付けて一時的に無効化するテクニックで、動作の切り分けやデバッグで日常的に使います。</p>
<p>良いコメントは「何をしているか」よりも「なぜそうしているか」を書くと価値が高まります。コードを読めば分かることを繰り返すのではなく、コードだけでは伝わらない意図を残しましょう。</p>`,
      task: `このコードには、コメントにするべきメモがそのまま書かれているためコンパイルエラーになります。メモの行を行コメントにして、<code>コメントを使いこなそう</code>と表示させてください。`,
      code: `fn main() {
    ここは自由にメモを書いてよい場所のはず
    println!("コメントを使いこなそう");
}`,
      solution: `fn main() {
    // ここは自由にメモを書いてよい場所のはず
    println!("コメントを使いこなそう");
}`,
      hints: [
        `日本語のメモがコードとして解釈されてエラーになっています。コンパイラに無視させるにはどうすればよいでしょうか。`,
        `メモの行の先頭に//を付けると、その行はコメントになりコンパイラに無視されます。`
      ],
      expectedOutput: "コメントを使いこなそう"
    },
    {
      id: 5,
      title: "変数let",
      explanation: `<p>変数とは、値に名前を付けて保管しておく仕組みです。Rustでは<code>let</code>キーワードで変数を宣言します。</p>
<pre><code>fn main() {
    let language = "Rust";
    let year = 2015;
    println!("{}は{}年生まれ", language, year);
}</code></pre>
<p><code>let 名前 = 値;</code>という形で、値に名前を「束縛（bind）」します。Rustでは代入というより束縛という言葉がよく使われますが、最初は「名前を付ける」と理解すれば十分です。</p>
<p>注目すべきは、型（値の種類）を書いていないのにエラーにならない点です。Rustは「型推論」という仕組みを持ち、<code>"Rust"</code>なら文字列、<code>2015</code>なら整数と、コンパイラが文脈から型を自動で判断してくれます。静的型付け言語（すべての値の型がコンパイル時に確定する言語）でありながら、記述は簡潔に保てるのがRustの魅力です。</p>
<p>変数名にはルールと慣習があります。</p>
<ul>
<li>使えるのは英数字とアンダースコア。数字始まりは不可</li>
<li>慣習として<code>snake_case</code>（小文字をアンダースコアでつなぐ）を使う。例：<code>user_name</code></li>
<li>大文字始まりやキャメルケース（<code>userName</code>）はRustでは警告の対象</li>
</ul>
<p>宣言した変数は<code>println!</code>のプレースホルダにそのまま渡せます。変数を使うと同じ値を何度も書かずに済み、変更にも強いコードになります。</p>`,
      task: `<code>let</code>で変数<code>language</code>を宣言して<code>"Rust"</code>を束縛し、プレースホルダを使って<code>私は今Rustを学んでいます</code>と表示してください。`,
      code: `fn main() {
    // TODO: 変数languageを宣言して"Rust"を束縛する

    // TODO: {}にlanguageを埋め込んで表示する
    println!("私は今を学んでいます");
}`,
      solution: `fn main() {
    let language = "Rust";
    println!("私は今{}を学んでいます", language);
}`,
      hints: [
        `変数の宣言はlet 名前 = 値;の形です。文字列はダブルクォートで囲みます。`,
        `let language = "Rust"; と宣言し、println!("私は今{}を学んでいます", language); で表示します。`
      ],
      expectedOutput: "私は今Rustを学んでいます"
    },
    {
      id: 6,
      title: "不変性とmut",
      explanation: `<p>Rustの変数には、他の多くの言語と大きく異なる特徴があります。<strong><code>let</code>で宣言した変数は、初期状態では値を変更できない（不変・immutable）</strong>のです。</p>
<pre><code>fn main() {
    let count = 1;
    count = 2; // コンパイルエラー！
}</code></pre>
<p>このコードは「<code>cannot assign twice to immutable variable</code>（不変変数に2回代入はできません）」というエラーになります。値を変更したい場合は、宣言時に<code>mut</code>（mutable＝可変の略）を付けます。</p>
<pre><code>fn main() {
    let mut count = 1;
    println!("最初のcount: {}", count);
    count = 2; // mutを付けたのでOK
    println!("変更後のcount: {}", count);
}</code></pre>
<p>なぜデフォルトが不変なのでしょうか。理由は「安全性」です。</p>
<ul>
<li>意図しない場所で値が書き換わるバグをコンパイル時点で防げる</li>
<li><code>mut</code>が付いた変数だけ注意して読めばよく、コードの見通しが良くなる</li>
<li>変更されない前提が保証されるため、コンパイラの最適化や並行処理の安全性にもつながる</li>
</ul>
<p>「基本は不変、変更が必要なときだけ<code>mut</code>を付ける」というスタイルは、Rustの設計思想を象徴しています。エラーメッセージにも<code>help: consider making this binding mutable: mut count</code>のように修正方法が提示されるので、落ち着いて読めば必ず直せます。</p>`,
      task: `このコードは不変変数への再代入でコンパイルエラーになります。エラーメッセージを確認してから<code>mut</code>を追加して修正し、<code>countは2</code>と表示させてください。`,
      code: `fn main() {
    // このコードはコンパイルエラーになります
    // エラーメッセージを読んでから修正しましょう
    let count = 1;
    println!("countは{}", count);
    count = 2;
    println!("countは{}", count);
}`,
      solution: `fn main() {
    let mut count = 1;
    println!("countは{}", count);
    count = 2;
    println!("countは{}", count);
}`,
      hints: [
        `エラーメッセージのhelp行に修正のヒントが書かれています。変数を「可変」にする必要があります。`,
        `letとcountの間にmutを入れて、let mut count = 1;とします。`
      ],
      expectedOutput: "countは2"
    },
    {
      id: 7,
      title: "定数const",
      explanation: `<p>プログラム全体で変わらない値には「定数」を使います。Rustでは<code>const</code>キーワードで定数を宣言します。</p>
<pre><code>const MAX_HP: u32 = 100;

fn main() {
    println!("最大HPは{}です", MAX_HP);
}</code></pre>
<p>定数には<code>let</code>と異なるルールがあります。</p>
<table>
<tr><th>項目</th><th>let変数</th><th>const定数</th></tr>
<tr><td>型注釈（型の明示）</td><td>省略可（型推論あり）</td><td><strong>必須</strong></td></tr>
<tr><td>mutで可変にできるか</td><td>できる</td><td>できない（常に不変）</td></tr>
<tr><td>値の決まるタイミング</td><td>実行時でもよい</td><td>コンパイル時に確定する式のみ</td></tr>
<tr><td>宣言できる場所</td><td>関数の中</td><td>関数の外（グローバル）でも可</td></tr>
<tr><td>名前の慣習</td><td>snake_case</td><td><strong>SCREAMING_SNAKE_CASE</strong>（全大文字）</td></tr>
</table>
<p><code>MAX_HP: u32</code>の<code>: u32</code>が型注釈です。<code>u32</code>は「符号なし32ビット整数（0以上の整数）」を表す型で、詳しくは第2章で学びます。定数では型推論に頼れないため、必ずこの形で型を書きます。</p>
<p>定数を使う利点は、マジックナンバー（意味の分からない生の数値）をなくせることです。コードのあちこちに<code>100</code>と書く代わりに<code>MAX_HP</code>と書けば、意味が明確になり、値の変更も1か所で済みます。設定値や上限値など「プログラム中で意味を持つ固定値」は定数にする習慣を付けましょう。</p>`,
      task: `型注釈付きの定数<code>MAX_HP</code>（型は<code>u32</code>、値は<code>100</code>）を宣言し、<code>最大HPは100です</code>と表示してください。`,
      code: `// TODO: ここに定数MAX_HP（u32型、値100）を宣言する

fn main() {
    // TODO: MAX_HPを使って「最大HPは100です」と表示する
    println!("最大HPはです");
}`,
      solution: `const MAX_HP: u32 = 100;

fn main() {
    println!("最大HPは{}です", MAX_HP);
}`,
      hints: [
        `定数はconst 名前: 型 = 値;の形で宣言します。型注釈は省略できません。`,
        `const MAX_HP: u32 = 100;と書き、println!("最大HPは{}です", MAX_HP);で表示します。`
      ],
      expectedOutput: "最大HPは100です"
    },
    {
      id: 8,
      title: "シャドーイング",
      explanation: `<p>Rustでは、同じ名前の変数を<code>let</code>でもう一度宣言できます。これを「シャドーイング（同名変数の再宣言による上書き）」と呼びます。新しい変数が古い変数を「影で覆い隠す（shadow）」イメージです。</p>
<pre><code>fn main() {
    let x = 5;
    let x = x + 1;  // 古いxを使って新しいxを作る
    let x = x * 2;  // さらに上書き
    println!("xは{}", x); // xは12
}</code></pre>
<p>「<code>mut</code>と何が違うの？」と思うかもしれません。重要な違いが2つあります。</p>
<table>
<tr><th>観点</th><th>mutによる再代入</th><th>シャドーイング</th></tr>
<tr><td>実体</td><td>同じ変数の値を書き換える</td><td><strong>新しい変数を作り直す</strong></td></tr>
<tr><td>型の変更</td><td>できない</td><td><strong>できる</strong></td></tr>
<tr><td>再代入後の不変性</td><td>ずっと可変のまま</td><td>宣言し直した後はまた不変</td></tr>
</table>
<p>型を変えられるのがシャドーイングの強力な点です。</p>
<pre><code>fn main() {
    let spaces = "   ";        // 文字列型
    let spaces = spaces.len(); // 数値型に変身！
    println!("スペースは{}個", spaces);
}</code></pre>
<p>「文字列として受け取った値を数値に変換して同じ名前で使い続ける」のはRustの定番パターンです。<code>spaces_str</code>と<code>spaces_num</code>のような別名を量産せずに済み、しかも変換後はまた不変に戻るため安全です。使いどころは「同じ意味の値を段階的に加工するとき」と覚えておきましょう。</p>`,
      task: `シャドーイングを使って変数<code>value</code>を2回宣言し直してください。1回目は<code>value * 2</code>、2回目は<code>value + 1</code>で上書きし、<code>最終的なvalueは11</code>と表示させます。`,
      code: `fn main() {
    let value = 5;
    // TODO: シャドーイングでvalueをvalue * 2で宣言し直す

    // TODO: シャドーイングでvalueをvalue + 1で宣言し直す

    println!("最終的なvalueは{}", value);
}`,
      solution: `fn main() {
    let value = 5;
    let value = value * 2;
    let value = value + 1;
    println!("最終的なvalueは{}", value);
}`,
      hints: [
        `シャドーイングはmutを使わず、もう一度letから書き始めるのがポイントです。`,
        `let value = value * 2;のように、右辺で古いvalueを使って新しいvalueを宣言します。5×2＋1＝11になるはずです。`
      ],
      expectedOutput: "最終的なvalueは11"
    },
    {
      id: 9,
      title: "文と式の違い",
      explanation: `<p>Rustを深く理解する鍵が「文（statement）」と「式（expression）」の区別です。</p>
<ul>
<li><strong>文</strong>：何かを実行するが、<strong>値を返さない</strong>。例：<code>let x = 5;</code></li>
<li><strong>式</strong>：評価されると<strong>値を返す</strong>。例：<code>5 + 3</code>、関数呼び出し、そして<code>{}</code>ブロックも！</li>
</ul>
<p>Rustは「式指向言語」と呼ばれ、多くの構文が式として値を返します。特に重要なのが、<code>{}</code>で囲んだブロックが式になることです。</p>
<pre><code>fn main() {
    let y = {
        let x = 3;
        x + 1  // セミコロンがない＝この値がブロックの値になる
    };
    println!("yは{}", y); // yは4
}</code></pre>
<p>ブロックの最後の行に注目してください。<code>x + 1</code>には<strong>セミコロンが付いていません</strong>。Rustではここが決定的に重要です。</p>
<table>
<tr><th>書き方</th><th>意味</th><th>ブロックの値</th></tr>
<tr><td><code>x + 1</code>（セミコロンなし）</td><td>式</td><td><code>x + 1</code>の計算結果</td></tr>
<tr><td><code>x + 1;</code>（セミコロンあり）</td><td>文</td><td><code>()</code>（ユニット型＝「値なし」を表す特別な値）</td></tr>
</table>
<p>セミコロンを付けると式は文に変わり、ブロックは<code>()</code>を返します。<code>()</code>を<code>{}</code>で表示しようとするとコンパイルエラーになるため、「最後のセミコロンを消し忘れて型エラー」はRust初心者が必ず一度は踏む道です。逆にこの仕組みを理解すれば、後の章で学ぶif式や関数の戻り値がスッと頭に入ります。</p>`,
      task: `このコードはブロックの最後にセミコロンがあるため、<code>result</code>が値なしの<code>()</code>になりコンパイルエラーです。セミコロンを1つ削除してブロックを式にし、<code>resultは30</code>と表示させてください。`,
      code: `fn main() {
    // このコードはコンパイルエラーになります
    let result = {
        let base = 10;
        base * 3; // このセミコロンが原因！
    };
    println!("resultは{}", result);
}`,
      solution: `fn main() {
    let result = {
        let base = 10;
        base * 3
    };
    println!("resultは{}", result);
}`,
      hints: [
        `ブロックの値は「セミコロンの付いていない最後の式」で決まります。今は全部の行が文になっています。`,
        `base * 3;のセミコロンを削除してbase * 3にすると、この計算結果がブロックの値としてresultに束縛されます。`
      ],
      expectedOutput: "resultは30"
    },
    {
      id: 10,
      title: "総合演習：自己紹介カードを整形出力",
      explanation: `<p>第1章の総仕上げとして、これまで学んだ要素を全部使い、自己紹介カードを整形して出力するプログラムを完成させます。使う知識を振り返りましょう。</p>
<table>
<tr><th>ステップ</th><th>学んだこと</th><th>この演習での使いどころ</th></tr>
<tr><td>1〜3</td><td>println!とプレースホルダ{}</td><td>カードの各行の表示</td></tr>
<tr><td>5</td><td>letによる変数宣言</td><td>名前・職業などの束縛</td></tr>
<tr><td>7</td><td>constと型注釈</td><td>開始年・現在年の定数化</td></tr>
<tr><td>9</td><td>ブロック式</td><td>経験年数の計算</td></tr>
</table>
<p>完成イメージは次のような枠付きのカードです。</p>
<pre><code>==============================
名前: フェリス
職業: プログラマー
経験年数: 3年
ひとこと: Rustは楽しい！
==============================</code></pre>
<p>設計のポイントを2つ紹介します。1つ目は、枠線のような繰り返し使う文字列を変数にまとめることです。同じ文字列を2回書かずに済み、あとで枠のデザインを変えるときも1か所の修正で済みます。</p>
<p>2つ目は、経験年数をブロック式で計算することです。</p>
<pre><code>let years = {
    // 計算の途中経過をブロックの中に閉じ込める
    CURRENT_YEAR - START_YEAR
};</code></pre>
<p>計算に使う一時的な値をブロックの中に閉じ込めると、外側のスコープ（変数が見える範囲）を汚さずに済みます。小さなプログラムでも「値の意味に名前を付け、関係する処理をまとめる」姿勢が、読みやすいコードへの近道です。</p>`,
      task: `TODOの箇所を埋めて自己紹介カードを完成させてください。定数<code>CURRENT_YEAR</code>の宣言、経験年数のブロック式（セミコロンなしの最終行）、ひとこと<code>Rustは楽しい！</code>の表示の3か所です。`,
      code: `const START_YEAR: i32 = 2023;
// TODO: 定数CURRENT_YEAR（i32型、値2026）を宣言する

fn main() {
    let border = "==============================";
    let name = "フェリス";
    let job = "プログラマー";
    let years = {
        // TODO: 経験年数（CURRENT_YEAR - START_YEAR）を
        // ブロックの値になるように書く（セミコロンに注意）
    };
    let comment = "Rustは楽しい！";

    println!("{}", border);
    println!("名前: {}", name);
    println!("職業: {}", job);
    println!("経験年数: {}年", years);
    // TODO: 「ひとこと: Rustは楽しい！」の行を表示する
    println!("{}", border);
}`,
      solution: `const START_YEAR: i32 = 2023;
const CURRENT_YEAR: i32 = 2026;

fn main() {
    let border = "==============================";
    let name = "フェリス";
    let job = "プログラマー";
    let years = {
        CURRENT_YEAR - START_YEAR
    };
    let comment = "Rustは楽しい！";

    println!("{}", border);
    println!("名前: {}", name);
    println!("職業: {}", job);
    println!("経験年数: {}年", years);
    println!("ひとこと: {}", comment);
    println!("{}", border);
}`,
      hints: [
        `定数はconst 名前: 型 = 値;、ブロック式は最後の行のセミコロンを付けないのがポイントでした。`,
        `ブロックの中はCURRENT_YEAR - START_YEARの1行（セミコロンなし）だけでOKです。`,
        `ひとことの行はprintln!("ひとこと: {}", comment);です。変数commentはすでに宣言されています。`
      ],
      expectedOutput: "ひとこと: Rustは楽しい！"
    }
  ]
});
