// 第9章：コレクション
registerChapter({
  number: 9,
  title: "コレクション",
  description: "可変長の配列Vec、文字列String、キーと値のペアを管理するHashMapという、Rustで最もよく使う3つのコレクションを学びます。",
  steps: [
    {
      id: 81,
      title: "Vec::newとpush",
      explanation: `<p>これまで学んだ配列（<code>[i32; 3]</code>など）は要素数が固定でした。実務では「要素をあとから追加したい」場面が多く、そこで使うのが<strong>Vec（ベクタ）</strong>です。Vecはヒープ領域（実行時にサイズを変えられるメモリ領域）にデータを置くため、要素数を自由に増減できます。</p>
<p>空のVecは<code>Vec::new()</code>で作り、<code>push</code>メソッドで末尾に要素を追加します。要素を追加するにはVec自体が変更されるので、変数は<code>mut</code>で宣言する必要があります。</p>
<pre><code>fn main() {
    let mut v: Vec&lt;i32&gt; = Vec::new();
    v.push(1);
    v.push(2);
    println!("{:?}", v); // [1, 2]
}</code></pre>
<p><code>Vec&lt;i32&gt;</code>の<code>&lt;i32&gt;</code>は「i32を入れるVec」という意味の型パラメータです。<code>Vec::new()</code>だけでは何の型を入れるか分からないため、変数側に型注釈を書きます。ただし、直後に<code>push(1)</code>のように要素を追加すれば、コンパイラが型を推論してくれるので注釈を省略できることも多いです。</p>
<table>
<tr><th>比較項目</th><th>配列 [T; N]</th><th>Vec&lt;T&gt;</th></tr>
<tr><td>要素数</td><td>コンパイル時に固定</td><td>実行時に増減できる</td></tr>
<tr><td>置き場所</td><td>スタック</td><td>ヒープ</td></tr>
<tr><td>追加・削除</td><td>不可</td><td>push / popなどで可能</td></tr>
</table>
<p>迷ったらVecを使う、と覚えておくと実務でも困りません。</p>`,
      task: `<code>Vec::new()</code>で空のベクタ<code>v</code>を作り、<code>push</code>で10、20、30の3つを順に追加して、<code>[10, 20, 30]</code>と表示されるようにしてください。`,
      code: `fn main() {
    // TODO: Vec::new()で空のベクタを作り、10、20、30を順にpushする
    let mut v: Vec<i32> = Vec::new();

    println!("{:?}", v);
}`,
      solution: `fn main() {
    // 空のベクタを作り、要素を1つずつ追加する
    let mut v: Vec<i32> = Vec::new();
    v.push(10);
    v.push(20);
    v.push(30);
    println!("{:?}", v);
}`,
      hints: [
        `要素を追加できるようにするには、変数をmutで宣言しておく必要があります（初期コードではすでにmutになっています）。`,
        `v.push(10); のように、pushを3回呼び出せば末尾に順番に追加されます。`
      ],
      expectedOutput: "[10, 20, 30]"
    },
    {
      id: 82,
      title: "vec!マクロとインデックスアクセス",
      explanation: `<p>最初から入れる要素が決まっている場合は、<code>push</code>を繰り返すより<strong>vec!マクロ</strong>を使うほうが簡潔です。マクロ（コンパイル時にコードを生成する仕組み。<code>println!</code>と同じ仲間）なので、名前の後ろに<code>!</code>が付きます。</p>
<pre><code>fn main() {
    let numbers = vec![10, 20, 30];
    println!("{}", numbers[0]); // 10
    println!("{}", numbers[2]); // 30
}</code></pre>
<p>要素の取り出しは配列と同じく<code>[インデックス]</code>で行い、先頭は0番目です。<code>numbers[2]</code>は「3番目の要素」を指す点に注意してください。</p>
<p>文字列を入れることもできます。<code>vec!["a", "b"]</code>とすると<code>Vec&lt;&amp;str&gt;</code>（文字列スライスのベクタ）になります。</p>
<table>
<tr><th>書き方</th><th>意味</th></tr>
<tr><td>vec![1, 2, 3]</td><td>1、2、3を持つベクタを作る</td></tr>
<tr><td>vec![0; 5]</td><td>0を5個並べたベクタを作る（初期値; 個数）</td></tr>
<tr><td>v[i]</td><td>i番目の要素を取り出す（範囲外だとpanic）</td></tr>
</table>
<p>1つ注意があります。<code>v[100]</code>のように存在しないインデックスへアクセスすると、プログラムは<strong>panic（実行時の強制終了）</strong>します。C言語のように不正なメモリを読んでしまう心配はありませんが、プログラムは止まります。範囲外の可能性がある場合の安全な書き方は、次のステップで学びます。</p>`,
      task: `<code>vec!</code>マクロで"りんご"、"みかん"、"ぶどう"の3つを持つベクタ<code>fruits</code>を作り、1番目と3番目の果物が表示されるようにしてください。`,
      code: `fn main() {
    // TODO: vec!マクロで"りんご"、"みかん"、"ぶどう"を持つベクタfruitsを作る

    println!("最初の果物は{}です", fruits[0]);
    println!("3番目の果物は{}です", fruits[2]);
}`,
      solution: `fn main() {
    // vec!マクロなら初期値をまとめて指定できる
    let fruits = vec!["りんご", "みかん", "ぶどう"];
    println!("最初の果物は{}です", fruits[0]);
    println!("3番目の果物は{}です", fruits[2]);
}`,
      hints: [
        `vec![要素1, 要素2, 要素3] の形で、初期値入りのベクタを1行で作れます。`,
        `let fruits = vec!["りんご", "みかん", "ぶどう"]; と書けば、fruits[0]が"りんご"になります。`
      ],
      expectedOutput: "3番目の果物はぶどうです"
    },
    {
      id: 83,
      title: "getとOption（範囲外アクセスの安全な扱い）",
      explanation: `<p>前のステップで、<code>v[10]</code>のような範囲外アクセスはpanicすると学びました。「範囲外かもしれない」場面で安全に要素を取り出すには<strong>getメソッド</strong>を使います。</p>
<p><code>v.get(i)</code>の戻り値は、第8章で学んだ<code>Option</code>型です。要素があれば<code>Some(&amp;要素)</code>、範囲外なら<code>None</code>が返り、panicは起きません。</p>
<pre><code>fn main() {
    let v = vec![100, 200, 300];
    match v.get(0) {
        Some(value) =&gt; println!("値: {}", value),
        None =&gt; println!("範囲外です"),
    }
}</code></pre>
<p>戻り値が<code>&amp;i32</code>（要素への参照）である点にも注目してください。Vecの中身の所有権を奪わず、覗き見るだけなので参照が返ります。<code>println!</code>で表示する分には参照のままで問題ありません。</p>
<table>
<tr><th>書き方</th><th>要素がある場合</th><th>範囲外の場合</th></tr>
<tr><td>v[i]</td><td>要素そのもの</td><td>panicして強制終了</td></tr>
<tr><td>v.get(i)</td><td>Some(&amp;要素)</td><td>None（安全に処理を続けられる）</td></tr>
</table>
<p>使い分けの目安は「インデックスが必ず範囲内だと分かっているなら<code>[]</code>、ユーザー入力や計算結果など範囲外の可能性があるなら<code>get</code>」です。Optionを返すAPI設計はRust標準ライブラリ全体に共通するスタイルなので、ここで慣れておくと公式ドキュメントも読みやすくなります。</p>`,
      task: `<code>v[10]</code>によるpanicを避けるため、<code>v.get(10)</code>と<code>match</code>を使って、範囲外の場合は「インデックス10は範囲外です」と表示されるように書き換えてください。`,
      code: `fn main() {
    let v = vec![100, 200, 300];
    match v.get(1) {
        Some(value) => println!("インデックス1の値: {}", value),
        None => println!("インデックス1は範囲外です"),
    }
    // TODO: 下の行はv[10]でpanicしてしまう。
    // 上と同じようにv.get(10)とmatchを使い、panicしない形に書き換える
    println!("インデックス10の値: {}", v[10]);
}`,
      solution: `fn main() {
    let v = vec![100, 200, 300];
    match v.get(1) {
        Some(value) => println!("インデックス1の値: {}", value),
        None => println!("インデックス1は範囲外です"),
    }
    // getならSome/Noneで安全に分岐でき、panicしない
    match v.get(10) {
        Some(value) => println!("インデックス10の値: {}", value),
        None => println!("インデックス10は範囲外です"),
    }
}`,
      hints: [
        `getは要素があればSome、なければNoneを返すので、matchで両方の場合を書けば安全になります。`,
        `すでに書かれているv.get(1)のmatchをそっくり真似して、数字とメッセージだけ10用に変えましょう。`
      ],
      expectedOutput: "インデックス10は範囲外です"
    },
    {
      id: 84,
      title: "Vecをforで走査する（&vとiter）",
      explanation: `<p>Vecの全要素を順に処理するには<code>for</code>ループを使います。ここで第6章の所有権の知識が効いてきます。実は<code>for x in v</code>と書くと、<strong>Vecの所有権がforループにムーブ</strong>され、ループの後でvを使うとコンパイルエラーになります。</p>
<pre><code>fn main() {
    let v = vec![1, 2, 3];
    for x in v { }        // vはここにムーブされる
    // println!("{}", v.len()); // エラー：vはもう使えない
}</code></pre>
<p>ループの後もVecを使いたい場合は、<strong>参照でループ</strong>します。書き方は2つあり、意味は同じです。</p>
<pre><code>for x in &amp;v { }       // 参照でループ（よく使う書き方）
for x in v.iter() { } // iter()メソッドを使う書き方</code></pre>
<p>このときループ変数<code>x</code>の型は<code>&amp;i32</code>（要素への参照）になりますが、<code>println!</code>や比較はそのまま行えます。</p>
<table>
<tr><th>書き方</th><th>xの型</th><th>ループ後のv</th></tr>
<tr><td>for x in v</td><td>i32（所有権ごと取り出す）</td><td>使えない（ムーブ済み）</td></tr>
<tr><td>for x in &amp;v</td><td>&amp;i32（参照）</td><td>引き続き使える</td></tr>
<tr><td>for x in &amp;mut v</td><td>&amp;mut i32（可変参照）</td><td>使える。要素の書き換えも可</td></tr>
</table>
<p>実務では「基本は<code>&amp;v</code>でループする」と覚えておけば、所有権のトラブルをほぼ避けられます。エラーメッセージに出てくるmove（ムーブ）という単語を見たら、この表を思い出してください。</p>`,
      task: `このコードは<code>for</code>で<code>v</code>の所有権がムーブされるため、最後の<code>v.len()</code>でコンパイルエラーになります。参照でループするように直して、エラーを解消してください。`,
      code: `fn main() {
    let v = vec![10, 20, 30];
    // このままではvの所有権がforにムーブされ、下のv.len()がエラーになる
    // TODO: 参照でループするように直す
    for x in v {
        println!("値: {}", x);
    }
    println!("要素数: {}", v.len());
}`,
      solution: `fn main() {
    let v = vec![10, 20, 30];
    // &vで参照を渡せば、所有権はムーブされない
    for x in &v {
        println!("値: {}", x);
    }
    println!("要素数: {}", v.len());
}`,
      hints: [
        `forにVecをそのまま渡すと所有権がムーブされます。所有権を渡さない方法は第7章で学んだ「参照」です。`,
        `for x in &v とするか、for x in v.iter() とすれば、ループ後もvを使えます。`
      ],
      expectedOutput: "要素数: 3"
    },
    {
      id: 85,
      title: "Vecの集計（sum・max・len）",
      explanation: `<p>Vecには集計に便利なメソッドが揃っています。ここでは合計・最大値・要素数の3つを押さえます。</p>
<pre><code>fn main() {
    let v = vec![3, 1, 4];
    let total: i32 = v.iter().sum();
    println!("合計: {}", total);      // 8
    println!("要素数: {}", v.len());  // 3
    match v.iter().max() {
        Some(m) =&gt; println!("最大値: {}", m), // 4
        None =&gt; println!("空です"),
    }
}</code></pre>
<p>ポイントが2つあります。1つ目は<code>sum</code>の書き方です。<code>v.iter().sum()</code>は「何の型で合計するか」をコンパイラが決められないため、<code>let total: i32 = ...</code>のように<strong>受け取る変数に型注釈</strong>を付けます。<code>iter()</code>は前のステップで学んだ、要素を参照で順に取り出す仕組みです。</p>
<p>2つ目は<code>max</code>の戻り値が<code>Option</code>であることです。空のVecには最大値が存在しないため、<code>Some(最大値への参照)</code>または<code>None</code>が返ります。ここでも「失敗しうる操作はOptionを返す」というRustの一貫した設計が見えます。</p>
<table>
<tr><th>メソッド</th><th>戻り値</th><th>備考</th></tr>
<tr><td>v.iter().sum()</td><td>合計値</td><td>受け取り側に型注釈が必要</td></tr>
<tr><td>v.iter().max()</td><td>Option&lt;&amp;T&gt;</td><td>空ならNone。最小値はmin()</td></tr>
<tr><td>v.len()</td><td>usize</td><td>要素数。空判定はis_empty()</td></tr>
</table>`,
      task: `テストの点数リストについて、<code>iter().sum()</code>で合計を、<code>iter().max()</code>で最大値を求め、合計・要素数・最大値の3つが表示されるようにしてください。`,
      code: `fn main() {
    let scores = vec![70, 95, 60, 88];
    // TODO: iter().sum()で合計を求める（let total: i32 = ...と型注釈を付ける）
    let total: i32 = 0;
    println!("合計: {}", total);
    println!("要素数: {}", scores.len());
    // TODO: iter().max()で最大値を取得し、matchでSome/Noneを処理して表示する
}`,
      solution: `fn main() {
    let scores = vec![70, 95, 60, 88];
    // sumは受け取る変数の型注釈で合計の型を決める
    let total: i32 = scores.iter().sum();
    println!("合計: {}", total);
    println!("要素数: {}", scores.len());
    // maxは空のVecの可能性を考えてOptionを返す
    match scores.iter().max() {
        Some(m) => println!("最大値: {}", m),
        None => println!("空のベクタです"),
    }
}`,
      hints: [
        `合計はlet total: i32 = scores.iter().sum(); の形です。型注釈を忘れるとコンパイルエラーになります。`,
        `maxの戻り値はOptionなので、ステップ83と同じようにmatchでSomeとNoneに分けて処理します。`
      ],
      expectedOutput: "合計: 313"
    },
    {
      id: 86,
      title: "Stringの連結（push_str・push・format!）",
      explanation: `<p>Stringも実はコレクションの仲間で、「文字（バイト）を集めた可変長のデータ」です。文字列を組み立てる代表的な方法を3つ学びます。</p>
<pre><code>fn main() {
    let mut s = String::from("Hello");
    s.push_str(", world"); // 文字列を末尾に追加
    s.push('!');           // 1文字を末尾に追加
    println!("{}", s);     // Hello, world!
}</code></pre>
<p><code>push_str</code>は文字列（<code>&amp;str</code>）を、<code>push</code>は<strong>1文字（char型、シングルクォートで書く）</strong>を追加します。名前が似ているので混同しやすい点に注意してください。どちらも元のStringを書き換えるため<code>mut</code>が必要です。</p>
<p>もう1つの定番が<code>format!</code>マクロです。<code>println!</code>と同じ書式で、画面に出力する代わりに<strong>新しいStringを作って返します</strong>。複数の値を組み合わせた文字列を作るときに最も読みやすい方法です。</p>
<pre><code>let name = String::from("Rust");
let msg = format!("こんにちは、{}さん", name);</code></pre>
<table>
<tr><th>方法</th><th>用途</th><th>元の変数</th></tr>
<tr><td>push_str("...")</td><td>文字列を末尾に足す</td><td>mutが必要</td></tr>
<tr><td>push('c')</td><td>1文字を末尾に足す</td><td>mutが必要</td></tr>
<tr><td>format!("{}...", x)</td><td>新しいStringを組み立てる</td><td>新しい値を返す</td></tr>
</table>
<p>なお<code>format!</code>は引数の所有権を奪わない（参照として使う）ので、上の例の<code>name</code>はその後も使えます。</p>`,
      task: `<code>push_str</code>で", Rust"を、<code>push</code>で'!'を追加して"Hello, Rust!"を完成させてください。さらに<code>format!</code>で「こんにちは、世界さん」という<code>greeting</code>を作ってください。`,
      code: `fn main() {
    let mut s = String::from("Hello");
    // TODO: push_strで", Rust"を追加し、pushで'!'を1文字追加する

    println!("{}", s);

    let name = String::from("世界");
    // TODO: format!を使って「こんにちは、{}さん」の形のgreetingを作る
    let greeting = String::new();
    println!("{}", greeting);
}`,
      solution: `fn main() {
    let mut s = String::from("Hello");
    // push_strは文字列、pushは1文字（シングルクォート）を追加する
    s.push_str(", Rust");
    s.push('!');
    println!("{}", s);

    let name = String::from("世界");
    // format!はprintln!と同じ書式で新しいStringを作る
    let greeting = format!("こんにちは、{}さん", name);
    println!("{}", greeting);
}`,
      hints: [
        `push_strにはダブルクォートの文字列を、pushにはシングルクォートの1文字を渡します。`,
        `greetingはlet greeting = format!("こんにちは、{}さん", name); のように書けます。`
      ],
      expectedOutput: "Hello, Rust!"
    },
    {
      id: 87,
      title: "HashMapの基本（insert・get）",
      explanation: `<p><strong>HashMap</strong>は「キーと値のペア」を保存するコレクションです。他言語の辞書（Python）や連想配列（PHP）、Map（JavaScript）に相当します。「名前から点数を引く」「商品名から価格を引く」のような検索が得意です。</p>
<p>VecやStringと違い、使う前に<code>use</code>宣言（標準ライブラリから型を持ち込む記述）が必要です。</p>
<pre><code>use std::collections::HashMap;

fn main() {
    let mut map: HashMap&lt;String, i32&gt; = HashMap::new();
    map.insert(String::from("数学"), 90);

    match map.get("数学") {
        Some(score) =&gt; println!("点数: {}", score),
        None =&gt; println!("未登録です"),
    }
}</code></pre>
<p><code>HashMap&lt;String, i32&gt;</code>は「キーがString、値がi32」という意味です。<code>insert(キー, 値)</code>で登録し、同じキーに再度insertすると値は上書きされます。</p>
<p><code>get</code>の戻り値はVecのときと同じく<code>Option</code>です。存在しないキーを引いてもpanicせず、<code>None</code>が返ります。キーが<code>String</code>でも、<code>get("数学")</code>のように<code>&amp;str</code>で検索できるのは便利なポイントです。</p>
<p>1つ重要な注意があります。HashMapは<strong>要素の並び順を保証しません</strong>。登録した順に取り出せるとは限らず、実行のたびに順序が変わることもあります。順序が必要な場面での扱いはステップ89で確認します。</p>`,
      task: `<code>HashMap::new()</code>で<code>scores</code>を作り、"数学"→90と"英語"→75を<code>insert</code>してください。そして<code>get</code>と<code>match</code>で"数学"の点数を「数学の点数: 90」の形式で表示してください。`,
      code: `use std::collections::HashMap;

fn main() {
    // TODO: mutを付けてHashMapを作り、"数学"→90、"英語"→75をinsertする
    let scores: HashMap<String, i32> = HashMap::new();

    // TODO: getで"数学"の点数を取り出し、matchで「数学の点数: 90」の形式で表示する
    println!("{:?}", scores.get("数学"));
}`,
      solution: `use std::collections::HashMap;

fn main() {
    let mut scores: HashMap<String, i32> = HashMap::new();
    scores.insert(String::from("数学"), 90);
    scores.insert(String::from("英語"), 75);

    // getはOptionを返すので、matchで安全に取り出す
    match scores.get("数学") {
        Some(score) => println!("数学の点数: {}", score),
        None => println!("数学の点数は登録されていません"),
    }
}`,
      hints: [
        `insertで書き換えるので、let mut scores = ... とmutを付けるのを忘れずに。`,
        `キーはString型なので、insertにはString::from("数学")のように渡します。getは&strのまま"数学"で検索できます。`
      ],
      expectedOutput: "数学の点数: 90"
    },
    {
      id: 88,
      title: "entry().or_insert",
      explanation: `<p>HashMapを使っていると「キーがなければ初期値を入れ、あれば何もしない（または更新する）」という処理が頻繁に登場します。これを1行で書けるのが<strong>entryメソッド</strong>です。</p>
<pre><code>use std::collections::HashMap;

fn main() {
    let mut map: HashMap&lt;String, i32&gt; = HashMap::new();
    map.insert(String::from("A"), 5);

    map.entry(String::from("A")).or_insert(0); // 既にあるので何もしない
    map.entry(String::from("B")).or_insert(0); // ないので0を挿入
}</code></pre>
<p><code>entry(キー)</code>は「そのキーの場所」を表す値を返し、<code>or_insert(初期値)</code>は<strong>キーが無いときだけ</strong>初期値を挿入します。既にある場合、値は変更されません。</p>
<p>さらに重要なのは、<code>or_insert</code>が<strong>その値への可変参照（&amp;mut）を返す</strong>ことです。これを使うと「無ければ0で作り、あればそれを増やす」というカウント処理が簡潔に書けます。</p>
<pre><code>let count = map.entry(String::from("A")).or_insert(0);
*count += 1; // *（デリファレンス）で参照の中身を書き換える</code></pre>
<p><code>count</code>は<code>&amp;mut i32</code>なので、中身を書き換えるには第7章で学んだ<code>*</code>（参照の指す先の値を取り出す演算子）を付けます。</p>
<table>
<tr><th>書き方</th><th>キーがある場合</th><th>キーがない場合</th></tr>
<tr><td>insert(k, v)</td><td>上書きする</td><td>挿入する</td></tr>
<tr><td>entry(k).or_insert(v)</td><td>何もしない（既存値への&amp;mutを返す）</td><td>vを挿入（その&amp;mutを返す）</td></tr>
</table>`,
      task: `まず実行して、<code>or_insert(100)</code>がりんごの在庫を上書きしないことを観察してください。その後TODOの位置に、<code>entry().or_insert(0)</code>の戻り値を使ってりんごの在庫を1増やす処理を追加してください。`,
      code: `use std::collections::HashMap;

fn main() {
    let mut stock: HashMap<String, i32> = HashMap::new();
    stock.insert(String::from("りんご"), 5);

    // まず実行して観察：りんごは既にあるので100にはならない
    stock.entry(String::from("りんご")).or_insert(100);
    stock.entry(String::from("みかん")).or_insert(3);

    // TODO: entry().or_insert(0)の戻り値（&mut i32）を変数で受け取り、
    // *を使ってりんごの在庫を1増やす

    println!("りんご: {}", stock["りんご"]);
    println!("みかん: {}", stock["みかん"]);
}`,
      solution: `use std::collections::HashMap;

fn main() {
    let mut stock: HashMap<String, i32> = HashMap::new();
    stock.insert(String::from("りんご"), 5);

    // りんごは既にあるので値は変わらず、みかんは3で新規挿入される
    stock.entry(String::from("りんご")).or_insert(100);
    stock.entry(String::from("みかん")).or_insert(3);

    // or_insertは値への可変参照を返すので、*で中身を書き換えられる
    let count = stock.entry(String::from("りんご")).or_insert(0);
    *count += 1;

    println!("りんご: {}", stock["りんご"]);
    println!("みかん: {}", stock["みかん"]);
}`,
      hints: [
        `or_insertの戻り値をlet count = ...; で受け取ると、countは値への可変参照になります。`,
        `可変参照の中身を増やすには *count += 1; のように*を付けます。りんごは5から6になるはずです。`
      ],
      expectedOutput: "りんご: 6"
    },
    {
      id: 89,
      title: "演習：単語カウント",
      explanation: `<p>前ステップの<code>entry().or_insert</code>が最も輝く定番問題、<strong>単語の出現回数カウント</strong>に挑戦します。テキスト処理やログ集計など、実務でも頻出のパターンです。</p>
<p>まず文字列を単語に分けるには<code>split_whitespace()</code>を使います。空白（スペース、タブ、改行）で区切って、単語を1つずつ取り出せるので、そのまま<code>for</code>ループに渡せます。</p>
<pre><code>let text = "a b a";
for word in text.split_whitespace() {
    println!("{}", word); // a、b、aの順に表示
}</code></pre>
<p>カウントの考え方はこうです。単語を1つ取り出すたびに、「その単語のカウントが無ければ0で作り、可変参照を受け取って1増やす」を繰り返します。</p>
<pre><code>let count = counts.entry(word).or_insert(0);
*count += 1;</code></pre>
<p>これだけで、初めて見る単語は0+1=1、2回目以降は既存の値+1になります。if文でキーの有無を調べる必要はありません。</p>
<p>結果の確認方法に1つ注意があります。HashMapを<code>for</code>で走査すると<strong>順序が実行のたびに変わる</strong>可能性があるため、このステップでは特定のキーを<code>get</code>で引いて確認します。全件を安定した順で表示したい場合は、キーをVecに集めて<code>sort()</code>してから表示するのが定石です。</p>`,
      task: `<code>split_whitespace()</code>と<code>for</code>ループ、<code>entry().or_insert(0)</code>を組み合わせて、テキスト中の単語の出現回数を<code>counts</code>に集計してください。appleが3回、bananaが2回と表示されれば成功です。`,
      code: `use std::collections::HashMap;

fn main() {
    let text = "apple banana apple cherry banana apple";
    let mut counts: HashMap<&str, i32> = HashMap::new();

    // TODO: textをsplit_whitespace()で単語に分け、forループで回しながら
    // entry(word).or_insert(0)と*count += 1で出現回数を数える

    match counts.get("apple") {
        Some(n) => println!("appleの出現回数: {}", n),
        None => println!("appleは出現しませんでした"),
    }
    match counts.get("banana") {
        Some(n) => println!("bananaの出現回数: {}", n),
        None => println!("bananaは出現しませんでした"),
    }
}`,
      solution: `use std::collections::HashMap;

fn main() {
    let text = "apple banana apple cherry banana apple";
    let mut counts: HashMap<&str, i32> = HashMap::new();

    // 単語ごとに「無ければ0で作って、1増やす」を繰り返す
    for word in text.split_whitespace() {
        let count = counts.entry(word).or_insert(0);
        *count += 1;
    }

    // HashMapの走査順は不定なので、特定のキーをgetで確認する
    match counts.get("apple") {
        Some(n) => println!("appleの出現回数: {}", n),
        None => println!("appleは出現しませんでした"),
    }
    match counts.get("banana") {
        Some(n) => println!("bananaの出現回数: {}", n),
        None => println!("bananaは出現しませんでした"),
    }
}`,
      hints: [
        `for word in text.split_whitespace() { ... } で単語を1つずつ取り出せます。`,
        `ループの中身はステップ88の2行（or_insert(0)で可変参照を受け取り、*で+1）と同じ形です。`
      ],
      expectedOutput: "appleの出現回数: 3"
    },
    {
      id: 90,
      title: "総合演習：成績リストの平均と最高点",
      explanation: `<p>第9章の総仕上げとして、テストの成績リストから<strong>受験者数・平均点・最高点</strong>を求めるプログラムを完成させます。使うのはこの章で学んだ知識だけです。</p>
<p><strong>平均点の計算</strong>では型に注意が必要です。合計は<code>i32</code>、要素数<code>len()</code>は<code>usize</code>と型が異なるうえ、整数同士の割り算では小数点以下が切り捨てられてしまいます。そこで<code>as f64</code>（型変換）で両方を小数型に変換してから割ります。</p>
<pre><code>let total: i32 = v.iter().sum();
let average = total as f64 / v.len() as f64;
println!("{:.1}", average); // {:.1}は小数第1位まで表示する書式</code></pre>
<p><strong>最高点</strong>は、ステップ85の<code>max()</code>でも求められますが、今回はforループで自力実装してみましょう。アルゴリズムの基本形として、他言語でも一生使える考え方です。</p>
<ol>
<li>最初の要素を「暫定の最大値」として変数に入れる（<code>mut</code>で宣言）</li>
<li>参照ループ（<code>&amp;v</code>）で全要素を見ていく</li>
<li>暫定の最大値より大きい要素が見つかったら入れ替える</li>
</ol>
<p>ループで<code>for &amp;s in &amp;v</code>と書くと、参照<code>&amp;i32</code>から値<code>i32</code>を取り出しながら回せます（パターンによる分解）。<code>for s in &amp;v</code>として<code>s</code>を参照のまま比較しても構いません。どちらでも動きます。</p>`,
      task: `成績リスト<code>scores</code>について、(1)<code>iter().sum()</code>と<code>as f64</code>で平均点を計算し、(2)forループで最高点を求めて、受験者数・平均点・最高点を表示してください。`,
      code: `fn main() {
    let scores = vec![85, 72, 90, 64, 98, 77];

    // TODO: iter().sum()で合計を求め、as f64で変換して平均を計算する
    let average = 0.0;

    // TODO: 最初の要素を暫定の最大値にして、forループで最高点を求める
    let highest = 0;

    println!("受験者数: {}人", scores.len());
    println!("平均点: {:.1}", average);
    println!("最高点: {}", highest);
}`,
      solution: `fn main() {
    let scores = vec![85, 72, 90, 64, 98, 77];

    // 合計はi32、要素数はusizeなので、両方f64に変換してから割る
    let total: i32 = scores.iter().sum();
    let average = total as f64 / scores.len() as f64;

    // 最初の要素を暫定1位にして、より大きい値が出たら入れ替える
    let mut highest = scores[0];
    for &s in &scores {
        if s > highest {
            highest = s;
        }
    }

    println!("受験者数: {}人", scores.len());
    println!("平均点: {:.1}", average);
    println!("最高点: {}", highest);
}`,
      hints: [
        `平均はlet total: i32 = scores.iter().sum(); のあと、total as f64 / scores.len() as f64 で計算します。`,
        `最高点はlet mut highest = scores[0]; から始めて、参照ループで比較します。`,
        `for &s in &scores { if s > highest { highest = s; } } の形が書ければ完成です。`
      ],
      expectedOutput: "平均点: 81.0"
    }
  ]
});
