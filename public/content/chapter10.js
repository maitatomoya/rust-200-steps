// 第10章：エラー処理
registerChapter({
  number: 10,
  title: "エラー処理",
  description: "panic!による回復不能エラーとResult型による回復可能エラーを区別し、matchや?演算子で安全にエラーを処理・伝播する方法を学びます。",
  steps: [
    {
      id: 91,
      title: "panic!と回復不能エラー",
      explanation: `<p>プログラムのエラーには2種類あります。「ファイルが見つからない」のように<strong>起きても対処できるエラー（回復可能）</strong>と、「配列の範囲外アクセス」のように<strong>プログラムのバグであり続行が危険なエラー（回復不能）</strong>です。Rustはこの2つを明確に区別し、回復不能エラーには<strong>panic（パニック）</strong>という仕組みを使います。</p>
<p>panicが起きるとプログラムはエラーメッセージを表示して即座に終了します。自分で意図的に起こすには<code>panic!</code>マクロを使います。</p>
<pre><code>fn main() {
    panic!("重大な問題が発生しました");
}</code></pre>
<p>また、これまでに登場した次の操作も内部でpanicを起こします。</p>
<table>
<tr><th>panicする操作</th><th>例</th></tr>
<tr><td>Vecや配列の範囲外アクセス</td><td>v[99]</td></tr>
<tr><td>0による整数除算</td><td>10 / 0</td></tr>
<tr><td>panic!マクロの呼び出し</td><td>panic!("メッセージ")</td></tr>
</table>
<p>panicのメッセージには「どのファイルの何行目で起きたか」が表示されます。さらに環境変数RUST_BACKTRACE=1を付けて実行すると、そこに至るまでの関数呼び出しの履歴（バックトレース）も見られます。</p>
<p>大切な考え方は、<strong>panicは「バグの検出」のためにあり、通常のエラー処理に使わない</strong>ということです。「ユーザーの入力が不正だった」程度でプログラム全体を止めるべきではありません。そうした回復可能なエラーのための仕組みが、次のステップで学ぶResult型です。</p>`,
      task: `まずこのまま実行して、範囲外アクセスによるpanicのエラーメッセージを観察してください。その後、インデックスを範囲内（0〜2）に直して、正常に値が表示されるようにしてください。`,
      code: `fn main() {
    let v = vec![1, 2, 3];
    // まずこのまま実行して、panicのメッセージ（発生場所と理由）を観察しよう
    // TODO: 観察したら、インデックスを範囲内（0〜2）に直す
    let value = v[99];
    println!("取り出した値: {}", value);
}`,
      solution: `fn main() {
    let v = vec![1, 2, 3];
    // 範囲内のインデックスに直せばpanicは起きない
    let value = v[2];
    println!("取り出した値: {}", value);
}`,
      hints: [
        `panicのメッセージには「index out of bounds」（範囲外）という理由と発生行が表示されます。まず読んでみましょう。`,
        `vの要素は3つなので、使えるインデックスは0、1、2です。v[2]なら3が取り出せます。`
      ],
      expectedOutput: "取り出した値: 3"
    },
    {
      id: 92,
      title: "Result型とは",
      explanation: `<p>回復可能なエラーを表すのが<strong>Result型</strong>です。第8章で学んだOptionとよく似たenumで、標準ライブラリで次のように定義されています。</p>
<pre><code>enum Result&lt;T, E&gt; {
    Ok(T),   // 成功。中に成功時の値が入る
    Err(E),  // 失敗。中にエラーの情報が入る
}</code></pre>
<p><code>T</code>と<code>E</code>は「あとで具体的な型に置き換わる仮の名前」です。例えば<code>Result&lt;i32, String&gt;</code>なら「成功ならi32が、失敗ならStringのエラーメッセージが入る」という意味になります。</p>
<p>Optionとの違いを整理しましょう。</p>
<table>
<tr><th>型</th><th>成功</th><th>失敗</th><th>使いどころ</th></tr>
<tr><td>Option&lt;T&gt;</td><td>Some(値)</td><td>None（情報なし）</td><td>値が「ある/ない」だけ分かればよい</td></tr>
<tr><td>Result&lt;T, E&gt;</td><td>Ok(値)</td><td>Err(エラー情報)</td><td>「なぜ失敗したか」を伝えたい</td></tr>
</table>
<p>失敗しうる関数は、戻り値の型を<code>Result</code>にして、成功なら<code>Ok(値)</code>、失敗なら<code>Err(エラー情報)</code>を返します。</p>
<pre><code>fn check_age(age: i32) -&gt; Result&lt;i32, String&gt; {
    if age &gt;= 0 {
        Ok(age)
    } else {
        Err(String::from("年齢は0以上で指定してください"))
    }
}</code></pre>
<p>呼び出し側は戻り値を見れば「失敗する可能性がある関数だ」とひと目で分かります。例外（try/catch）を持つ言語と違い、Rustではエラーの可能性が<strong>型として明示される</strong>のが最大の特徴です。</p>`,
      task: `まず実行して<code>Ok(20)</code>の表示を観察してください。その後、<code>check_age(-5)</code>の結果を<code>err_result</code>に受け取り、<code>{:?}</code>で表示する行を追加してください。`,
      code: `// 失敗する可能性のある関数は、Resultを返すように書く
fn check_age(age: i32) -> Result<i32, String> {
    if age >= 0 {
        Ok(age)
    } else {
        Err(String::from("年齢は0以上で指定してください"))
    }
}

fn main() {
    let ok_result = check_age(20);
    println!("{:?}", ok_result);
    // TODO: check_age(-5)の結果をerr_resultに入れて、{:?}で表示する
}`,
      solution: `// 失敗する可能性のある関数は、Resultを返すように書く
fn check_age(age: i32) -> Result<i32, String> {
    if age >= 0 {
        Ok(age)
    } else {
        Err(String::from("年齢は0以上で指定してください"))
    }
}

fn main() {
    let ok_result = check_age(20);
    println!("{:?}", ok_result);
    // 失敗するとErr(エラーメッセージ)が返ってくる
    let err_result = check_age(-5);
    println!("{:?}", err_result);
}`,
      hints: [
        `ok_resultと同じ書き方で、引数だけ-5に変えた2行を追加します。`,
        `let err_result = check_age(-5); println!("{:?}", err_result); でErrの中身が確認できます。`
      ],
      expectedOutput: "Ok(20)"
    },
    {
      id: 93,
      title: "matchでResultをさばく",
      explanation: `<p>ResultはOkとErrの2バリアントを持つenumなので、第8章で学んだ<code>match</code>がそのまま使えます。これがResult処理の最も基本的な形です。</p>
<pre><code>fn divide(a: f64, b: f64) -&gt; Result&lt;f64, String&gt; {
    if b == 0.0 {
        Err(String::from("0で割ることはできません"))
    } else {
        Ok(a / b)
    }
}

fn main() {
    match divide(10.0, 2.0) {
        Ok(result) =&gt; println!("結果: {}", result),
        Err(message) =&gt; println!("エラー: {}", message),
    }
}</code></pre>
<p>ポイントは3つあります。</p>
<ul>
<li><code>Ok(result)</code>のように書くと、成功時の値が変数<code>result</code>に取り出されます（Optionの<code>Some(x)</code>と同じパターンマッチ）。</li>
<li>matchは<strong>全バリアントの処理を強制</strong>します。Errの処理を書き忘れるとコンパイルエラーになるため、「エラー処理のし忘れ」が原理的に起きません。</li>
<li>浮動小数点数の除算（<code>10.0 / 0.0</code>）は実はpanicせず無限大になりますが、業務ロジックとしては0除算をエラー扱いしたいことが多いため、この例では自分でチェックしてErrを返しています。</li>
</ul>
<p>try/catchのある言語では「どの関数が例外を投げるか」がコードから見えにくいのに対し、Rustでは<strong>戻り値のResultをmatchでさばく</strong>という一貫した形になります。この「エラーも普通の値として扱う」感覚がRustのエラー処理の核心です。</p>`,
      task: `<code>divide(10.0, 4.0)</code>と<code>divide(1.0, 0.0)</code>の結果をそれぞれ<code>match</code>で処理し、成功なら「結果: 」、失敗なら「エラー: 」に続けて中身を表示してください。`,
      code: `fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err(String::from("0で割ることはできません"))
    } else {
        Ok(a / b)
    }
}

fn main() {
    // TODO: divide(10.0, 4.0)の結果をmatchで処理する
    // Okなら「結果: {}」、Errなら「エラー: {}」と表示する

    // TODO: divide(1.0, 0.0)も同じようにmatchで処理する
}`,
      solution: `fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err(String::from("0で割ることはできません"))
    } else {
        Ok(a / b)
    }
}

fn main() {
    // matchはOkとErrの両方の処理を書かないとコンパイルエラーになる
    match divide(10.0, 4.0) {
        Ok(result) => println!("結果: {}", result),
        Err(message) => println!("エラー: {}", message),
    }
    match divide(1.0, 0.0) {
        Ok(result) => println!("結果: {}", result),
        Err(message) => println!("エラー: {}", message),
    }
}`,
      hints: [
        `OptionのSome/Noneをmatchでさばいたのと同じ形で、Ok(値)とErr(メッセージ)の2つの腕を書きます。`,
        `match divide(10.0, 4.0) { Ok(result) => ..., Err(message) => ... } の形です。10.0 / 4.0の結果は2.5になります。`
      ],
      expectedOutput: "エラー: 0で割ることはできません"
    },
    {
      id: 94,
      title: "unwrapとexpect（使いどころと危険性）",
      explanation: `<p>Resultを毎回matchでさばくのは丁寧ですが、コードが長くなります。「成功しているはず」の場面向けに、中身を一発で取り出すメソッドが<strong>unwrap</strong>と<strong>expect</strong>です。</p>
<pre><code>let value = some_result.unwrap();
let value = some_result.expect("設定の読み込みに失敗しました");</code></pre>
<p>どちらも、中身が<code>Ok</code>なら値を取り出し、<code>Err</code>なら<strong>panicしてプログラムを止めます</strong>。違いはpanic時のメッセージだけで、<code>expect</code>は自分で書いたメッセージが表示されるため、原因の特定が楽になります。OptionのSome/Noneに対しても同じように使えます。</p>
<table>
<tr><th>メソッド</th><th>Okのとき</th><th>Errのとき</th></tr>
<tr><td>unwrap()</td><td>中の値を返す</td><td>panic（定型メッセージ）</td></tr>
<tr><td>expect("説明")</td><td>中の値を返す</td><td>panic（自分の説明付き）</td></tr>
</table>
<p>使ってよい場面の目安は次のとおりです。</p>
<ul>
<li><strong>使ってよい</strong>：学習用・使い捨てのコード、失敗が論理的にありえないと確信できる箇所（その根拠をexpectのメッセージに書く）</li>
<li><strong>避けるべき</strong>：ユーザー入力や外部データなど、失敗が普通に起こりうる処理。ここでpanicするとサービス全体が落ちる</li>
</ul>
<p>実務のコードレビューでは「このunwrapは本当に安全か？」が定番の指摘ポイントです。迷ったらmatchや後で学ぶ<code>?</code>演算子で正しく処理しましょう。</p>`,
      task: `まず実行して<code>unwrap</code>によるpanicを観察してください。その後、(1)panicする行を<code>find_user(1)</code>に直し、(2)TODOの位置に<code>expect</code>を使って<code>find_user(1)</code>の結果を取り出す行を追加してください。`,
      code: `fn find_user(id: i32) -> Result<String, String> {
    if id == 1 {
        Ok(String::from("田中"))
    } else {
        Err(String::from("ユーザーが見つかりません"))
    }
}

fn main() {
    // まず実行してpanicを観察しよう。Errをunwrapするとpanicする
    // TODO: 観察したら、引数を1に直してpanicしないようにする
    let name = find_user(999).unwrap();
    println!("ユーザー名: {}", name);

    // TODO: find_user(1)の結果をexpect("ユーザー取得に失敗しました")で取り出し、
    // 「ユーザー名: {}」の形式で表示する
}`,
      solution: `fn find_user(id: i32) -> Result<String, String> {
    if id == 1 {
        Ok(String::from("田中"))
    } else {
        Err(String::from("ユーザーが見つかりません"))
    }
}

fn main() {
    // Okを返す呼び出しならunwrapで中身を取り出せる
    let name = find_user(1).unwrap();
    println!("ユーザー名: {}", name);

    // expectはpanic時に表示されるメッセージを自分で指定できる
    let name2 = find_user(1).expect("ユーザー取得に失敗しました");
    println!("ユーザー名: {}", name2);
}`,
      hints: [
        `find_user(999)はErrを返すので、unwrapするとそこでpanicします。まずエラーメッセージを読んでみましょう。`,
        `2つ目はlet name2 = find_user(1).expect("ユーザー取得に失敗しました"); のように書きます。Okの場合、expectはunwrapと同じように中の値を返します。`
      ],
      expectedOutput: "ユーザー名: 田中"
    },
    {
      id: 95,
      title: "?演算子",
      explanation: `<p>「Resultを受け取り、Errならそのまま呼び出し元に返し、Okなら中身を使って処理を続ける」というパターンは非常によく登場します。matchで毎回書くと冗長です。</p>
<pre><code>// このパターン、何度も書くのは大変
let score = match get_score(name) {
    Ok(s) =&gt; s,
    Err(e) =&gt; return Err(e),
};</code></pre>
<p>これを1文字で書けるのが<strong>?演算子</strong>です。上の5行は次の1行と同じ意味になります。</p>
<pre><code>let score = get_score(name)?;</code></pre>
<p><code>?</code>の動きは次のとおりです。</p>
<ul>
<li>結果が<code>Ok(値)</code>なら、中の値を取り出して式の値にする（処理は続行）</li>
<li>結果が<code>Err(e)</code>なら、<strong>その場で関数を抜けて</strong><code>Err(e)</code>を呼び出し元に返す（早期リターン）</li>
</ul>
<p>重要な制約が1つあります。<code>?</code>は「Errを返す」動きをするため、<strong>Resultを返す関数の中でしか使えません</strong>。戻り値が<code>()</code>のままのmainなどで使うとコンパイルエラーになります（該当ステップの関数の戻り値の型を確認しましょう）。</p>
<table>
<tr><th>書き方</th><th>行数</th><th>意味</th></tr>
<tr><td>matchで分岐して早期return</td><td>4〜5行</td><td>Errなら返す、Okなら続行</td></tr>
<tr><td>?演算子</td><td>式の末尾に1文字</td><td>まったく同じ</td></tr>
</table>
<p>unwrapと違い、<code>?</code>は<strong>panicせずエラーを上位に引き継ぐ</strong>のがポイントです。Rustらしいエラー処理の中心となる道具なので、ここでしっかり手に馴染ませましょう。</p>`,
      task: `<code>double_score</code>関数の中のmatch5行を、<code>?</code>演算子を使った1行（<code>let score = get_score(name)?;</code>の形）に書き換えてください。動作が変わらないことも確認しましょう。`,
      code: `fn get_score(name: &str) -> Result<i32, String> {
    if name == "数学" {
        Ok(90)
    } else {
        Err(String::from("科目が見つかりません"))
    }
}

fn double_score(name: &str) -> Result<i32, String> {
    // TODO: このmatchを?演算子を使った1行に書き換える
    let score = match get_score(name) {
        Ok(s) => s,
        Err(e) => return Err(e),
    };
    Ok(score * 2)
}

fn main() {
    match double_score("数学") {
        Ok(v) => println!("2倍の点数: {}", v),
        Err(e) => println!("エラー: {}", e),
    }
    match double_score("音楽") {
        Ok(v) => println!("2倍の点数: {}", v),
        Err(e) => println!("エラー: {}", e),
    }
}`,
      solution: `fn get_score(name: &str) -> Result<i32, String> {
    if name == "数学" {
        Ok(90)
    } else {
        Err(String::from("科目が見つかりません"))
    }
}

fn double_score(name: &str) -> Result<i32, String> {
    // ?はErrなら即return、Okなら中身を取り出して続行する
    let score = get_score(name)?;
    Ok(score * 2)
}

fn main() {
    match double_score("数学") {
        Ok(v) => println!("2倍の点数: {}", v),
        Err(e) => println!("エラー: {}", e),
    }
    match double_score("音楽") {
        Ok(v) => println!("2倍の点数: {}", v),
        Err(e) => println!("エラー: {}", e),
    }
}`,
      hints: [
        `?はResultを返す式の直後に付けます。double_scoreの戻り値がResultなので、この関数の中では?が使えます。`,
        `matchの5行を丸ごと消して、let score = get_score(name)?; の1行に置き換えます。`
      ],
      expectedOutput: "2倍の点数: 180"
    },
    {
      id: 96,
      title: "エラーを伝播する関数を書く",
      explanation: `<p>前のステップでは用意された関数を書き換えましたが、今回は<strong>エラーを伝播（でんぱ：下位のエラーを上位へ引き継ぐこと）する関数を自分で設計</strong>します。実務でのエラー処理は、ほぼこの形の積み重ねです。</p>
<p>設計の手順は次の3つです。</p>
<ol>
<li>戻り値の型を<code>Result&lt;成功時の型, エラーの型&gt;</code>にする</li>
<li>失敗しうる処理の呼び出しには<code>?</code>を付ける</li>
<li>最後まで成功したら<code>Ok(結果)</code>で包んで返す</li>
</ol>
<pre><code>fn total_price(item1: &amp;str, item2: &amp;str) -&gt; Result&lt;i32, String&gt; {
    let price1 = get_price(item1)?; // 失敗したらここでErrを返して終了
    let price2 = get_price(item2)?; // 同上
    Ok(price1 + price2)             // 両方成功したときだけここに到達
}</code></pre>
<p>このように<code>?</code>を複数並べると、「途中のどこで失敗しても、最初のエラーがそのまま呼び出し元へ届く」という流れが数行で書けます。matchの入れ子で書いた場合と比べると、成功時の処理の流れ（価格を2つ取って足す）が一直線に読めるのが分かります。</p>
<p>エラーをどこで最終処理するかも設計のポイントです。途中の関数は<code>?</code>で伝播に徹し、<strong>最終的にユーザーへ表示する場所（今回はmain）でmatchを使って処理する</strong>のが定石です。エラーメッセージの組み立てには、第9章で学んだ<code>format!</code>がここでも活躍します。</p>`,
      task: `2つの商品名を受け取り合計金額を<code>Result&lt;i32, String&gt;</code>で返す関数<code>total_price</code>を作成してください。<code>get_price</code>の呼び出しには<code>?</code>を使い、どちらかが見つからなければエラーが伝播するようにします。`,
      code: `fn get_price(item: &str) -> Result<i32, String> {
    match item {
        "コーヒー" => Ok(300),
        "紅茶" => Ok(250),
        _ => Err(format!("{}は取り扱いがありません", item)),
    }
}

// TODO: 2つの商品名を受け取り、合計金額をResult<i32, String>で返す
// 関数total_priceを書く。get_priceの呼び出しには?を使うこと

fn main() {
    match total_price("コーヒー", "紅茶") {
        Ok(total) => println!("合計金額: {}円", total),
        Err(e) => println!("エラー: {}", e),
    }
    match total_price("コーヒー", "ケーキ") {
        Ok(total) => println!("合計金額: {}円", total),
        Err(e) => println!("エラー: {}", e),
    }
}`,
      solution: `fn get_price(item: &str) -> Result<i32, String> {
    match item {
        "コーヒー" => Ok(300),
        "紅茶" => Ok(250),
        _ => Err(format!("{}は取り扱いがありません", item)),
    }
}

// どちらかの商品が見つからなければ、?がErrをそのまま呼び出し元へ返す
fn total_price(item1: &str, item2: &str) -> Result<i32, String> {
    let price1 = get_price(item1)?;
    let price2 = get_price(item2)?;
    Ok(price1 + price2)
}

fn main() {
    match total_price("コーヒー", "紅茶") {
        Ok(total) => println!("合計金額: {}円", total),
        Err(e) => println!("エラー: {}", e),
    }
    match total_price("コーヒー", "ケーキ") {
        Ok(total) => println!("合計金額: {}円", total),
        Err(e) => println!("エラー: {}", e),
    }
}`,
      hints: [
        `関数の形はfn total_price(item1: &str, item2: &str) -> Result<i32, String> です。戻り値がResultだから中で?が使えます。`,
        `get_price(item1)?とget_price(item2)?で2つの価格を取り出し、最後にOk(price1 + price2)を返します。`
      ],
      expectedOutput: "合計金額: 550円"
    },
    {
      id: 97,
      title: "文字列のparseとResult",
      explanation: `<p>Resultを返す標準ライブラリの代表例が、文字列を数値に変換する<strong>parseメソッド</strong>です。ユーザー入力や設定ファイルの文字列を数値として使う場面で必ず登場します。</p>
<pre><code>let n = "42".parse::&lt;i32&gt;();   // Ok(42)
let bad = "abc".parse::&lt;i32&gt;(); // Err(ParseIntError { ... })</code></pre>
<p><code>parse::&lt;i32&gt;()</code>という書き方は初登場です。parseは「何の型へ変換するか」を指定する必要があり、<code>::&lt;型&gt;</code>という記法（見た目から<strong>ターボフィッシュ</strong>と呼ばれます）で変換先を指定します。次のように、受け取る変数の型注釈で指定する書き方も同じ意味です。</p>
<pre><code>let n: i32 = "42".parse().unwrap(); // 型注釈から変換先を推論</code></pre>
<p>戻り値は<code>Result&lt;i32, ParseIntError&gt;</code>です。ParseIntErrorは標準ライブラリが用意しているエラー型で、「数値として解釈できなかった」ことを表します。変換できたかどうかだけが重要な場面では、<code>Err(_)</code>のようにアンダースコアでエラーの中身を無視するmatchがよく使われます。</p>
<table>
<tr><th>入力</th><th>parse::&lt;i32&gt;()の結果</th></tr>
<tr><td>"42"</td><td>Ok(42)</td></tr>
<tr><td>"abc"</td><td>Err(...)</td></tr>
<tr><td>"3.14"</td><td>Err(...)（i32としては解釈不可。f64ならOk）</td></tr>
<tr><td>" 42 "（空白入り）</td><td>Err(...)（前後の空白も許されない）</td></tr>
</table>
<p>「文字列を数値にする処理は失敗しうるので、戻り値はResultになっている」——この感覚がつかめれば、標準ライブラリの他のAPIもぐっと読みやすくなります。</p>`,
      task: `<code>ok_text</code>と<code>bad_text</code>のそれぞれについて、<code>parse::&lt;i32&gt;()</code>の結果を<code>match</code>で処理してください。成功なら「変換成功: 数値」、失敗なら「変換失敗: 元の文字列」と表示します。`,
      code: `fn main() {
    let ok_text = "42";
    let bad_text = "abc";

    // TODO: ok_text.parse::<i32>()の結果をmatchで処理する
    // Ok(n)なら「変換成功: {}」、Err(_)なら「変換失敗: {}」（元の文字列）と表示

    // TODO: bad_textも同じようにmatchで処理する

    // 型注釈で変換先を指定する書き方（このまま実行して観察しよう）
    let n: i32 = "100".parse().unwrap();
    println!("100 + 1 = {}", n + 1);
}`,
      solution: `fn main() {
    let ok_text = "42";
    let bad_text = "abc";

    // parseはResultを返す。エラーの中身が不要ならErr(_)で無視できる
    match ok_text.parse::<i32>() {
        Ok(n) => println!("変換成功: {}", n),
        Err(_) => println!("変換失敗: {}", ok_text),
    }

    match bad_text.parse::<i32>() {
        Ok(n) => println!("変換成功: {}", n),
        Err(_) => println!("変換失敗: {}", bad_text),
    }

    // 型注釈で変換先を指定する書き方（このまま実行して観察しよう）
    let n: i32 = "100".parse().unwrap();
    println!("100 + 1 = {}", n + 1);
}`,
      hints: [
        `match ok_text.parse::<i32>() { Ok(n) => ..., Err(_) => ... } の形で書きます。`,
        `エラーの詳しい中身は今回使わないので、Err(_)とアンダースコアで受け流せます。失敗時は元の文字列（ok_textやbad_text）を表示します。`
      ],
      expectedOutput: "変換失敗: abc"
    },
    {
      id: 98,
      title: "独自エラー型をenumで作る",
      explanation: `<p>これまでエラー型には<code>String</code>を使ってきましたが、実務では不十分な場面が出てきます。文字列では「どの種類のエラーか」をプログラムで判別しにくく、書き間違いにも気づけないからです。そこで<strong>enumで独自のエラー型を定義</strong>します。第8章のenumの知識がそのまま活きます。</p>
<pre><code>#[derive(Debug)]
enum AtmError {
    InsufficientBalance, // 残高不足
    InvalidAmount,       // 不正な金額
}

fn withdraw(balance: i32, amount: i32) -&gt; Result&lt;i32, AtmError&gt; {
    if amount &lt;= 0 {
        return Err(AtmError::InvalidAmount);
    }
    if amount &gt; balance {
        return Err(AtmError::InsufficientBalance);
    }
    Ok(balance - amount)
}</code></pre>
<p><code>#[derive(Debug)]</code>は構造体の章でも使った属性で、<code>{:?}</code>での表示を可能にします。エラー型には付けておくのが定番です。</p>
<p>エラーをenumにする利点は、呼び出し側のmatchで<strong>エラーの種類ごとに異なる対応</strong>ができることです。</p>
<pre><code>match withdraw(1000, 2000) {
    Ok(rest) =&gt; println!("残高: {}", rest),
    Err(AtmError::InsufficientBalance) =&gt; println!("残高不足です"),
    Err(AtmError::InvalidAmount) =&gt; println!("金額が不正です"),
}</code></pre>
<table>
<tr><th>エラー型</th><th>種類の判別</th><th>書き間違い</th></tr>
<tr><td>String</td><td>文字列比較が必要で不安定</td><td>コンパイラは気づけない</td></tr>
<tr><td>独自enum</td><td>matchで確実に分岐できる</td><td>コンパイルエラーで検出</td></tr>
</table>
<p>「起こりうる失敗をenumのバリアントとして列挙する」のは、Rustらしいエラー設計の第一歩です。</p>`,
      task: `残高不足を表す<code>InsufficientBalance</code>と不正な金額を表す<code>InvalidAmount</code>の2バリアントを持つ<code>enum AtmError</code>を定義して、プログラムをコンパイルが通る状態にしてください。`,
      code: `// TODO: 2種類のエラーを表すenum AtmErrorを定義する
// バリアント: InsufficientBalance（残高不足）、InvalidAmount（不正な金額）
// #[derive(Debug)]も付けておくこと

fn withdraw(balance: i32, amount: i32) -> Result<i32, AtmError> {
    if amount <= 0 {
        return Err(AtmError::InvalidAmount);
    }
    if amount > balance {
        return Err(AtmError::InsufficientBalance);
    }
    Ok(balance - amount)
}

fn main() {
    match withdraw(1000, 300) {
        Ok(rest) => println!("引き出し成功。残高: {}円", rest),
        Err(AtmError::InsufficientBalance) => println!("エラー: 残高不足です"),
        Err(AtmError::InvalidAmount) => println!("エラー: 金額が不正です"),
    }
    match withdraw(1000, 2000) {
        Ok(rest) => println!("引き出し成功。残高: {}円", rest),
        Err(AtmError::InsufficientBalance) => println!("エラー: 残高不足です"),
        Err(AtmError::InvalidAmount) => println!("エラー: 金額が不正です"),
    }
}`,
      solution: `// エラーの種類をenumのバリアントとして列挙する
#[derive(Debug)]
enum AtmError {
    InsufficientBalance, // 残高不足
    InvalidAmount,       // 不正な金額
}

fn withdraw(balance: i32, amount: i32) -> Result<i32, AtmError> {
    if amount <= 0 {
        return Err(AtmError::InvalidAmount);
    }
    if amount > balance {
        return Err(AtmError::InsufficientBalance);
    }
    Ok(balance - amount)
}

fn main() {
    match withdraw(1000, 300) {
        Ok(rest) => println!("引き出し成功。残高: {}円", rest),
        Err(AtmError::InsufficientBalance) => println!("エラー: 残高不足です"),
        Err(AtmError::InvalidAmount) => println!("エラー: 金額が不正です"),
    }
    match withdraw(1000, 2000) {
        Ok(rest) => println!("引き出し成功。残高: {}円", rest),
        Err(AtmError::InsufficientBalance) => println!("エラー: 残高不足です"),
        Err(AtmError::InvalidAmount) => println!("エラー: 金額が不正です"),
    }
}`,
      hints: [
        `第8章で学んだenumの定義と同じ形です。データを持たないバリアントを2つ並べるだけで完成します。`,
        `#[derive(Debug)] を1行目に付け、enum AtmError { InsufficientBalance, InvalidAmount } と定義します。`
      ],
      expectedOutput: "エラー: 残高不足です"
    },
    {
      id: 99,
      title: "OptionとResultの変換（ok_or・ok）",
      explanation: `<p>Optionを返す関数とResultを返す関数を組み合わせて使っていると、「型を揃えたい」場面が出てきます。そのための相互変換メソッドが<strong>ok_or</strong>と<strong>ok</strong>です。名前が紛らわしいので、向きをしっかり整理しましょう。</p>
<table>
<tr><th>メソッド</th><th>変換の向き</th><th>変換結果</th></tr>
<tr><td>option.ok_or(エラー値)</td><td>Option → Result</td><td>Some(v)はOk(v)に、Noneは指定したErr(エラー値)になる</td></tr>
<tr><td>result.ok()</td><td>Result → Option</td><td>Ok(v)はSome(v)に、Err(e)はNoneになる（エラー情報は捨てられる）</td></tr>
</table>
<pre><code>let found: Option&lt;i32&gt; = Some(5);
let r: Result&lt;i32, String&gt; = found.ok_or(String::from("見つかりません"));
// r は Ok(5)

let parsed: Option&lt;i32&gt; = "42".parse::&lt;i32&gt;().ok();
// parsed は Some(42)。"abc"ならNone</code></pre>
<p>使いどころの典型は次の2つです。</p>
<ul>
<li><strong>ok_or</strong>：Optionを返す処理（VecのgetやHashMapのgetなど）の結果を、Resultを返す関数の中で<code>?</code>に繋げたいとき。Noneに「エラーの理由」を与えてResultに格上げします。</li>
<li><strong>ok</strong>：エラーの詳細はどうでもよく、「値が取れたかどうか」だけ知りたいとき。parseの結果をOptionとして軽く扱う場面などで便利です。</li>
</ul>
<p>「OptionとResultは対立する型ではなく、いつでも行き来できる仲間」と理解できると、標準ライブラリのメソッド一覧を見たときの見通しが一気に良くなります。</p>`,
      task: `(1)<code>find_index(&amp;v, 20)</code>と<code>find_index(&amp;v, 99)</code>の結果を<code>ok_or</code>で<code>Result&lt;usize, String&gt;</code>に変換して<code>{:?}</code>で表示し、(2)<code>"42".parse::&lt;i32&gt;()</code>の結果を<code>.ok()</code>でOptionに変換して表示してください。`,
      code: `// Vecの中からtargetの位置を探す（見つからなければNone）
fn find_index(v: &Vec<i32>, target: i32) -> Option<usize> {
    let mut i = 0;
    while i < v.len() {
        if v[i] == target {
            return Some(i);
        }
        i += 1;
    }
    None
}

fn main() {
    let v = vec![10, 20, 30];

    // TODO: find_index(&v, 20)の結果をok_orでResult<usize, String>に変換し、
    // {:?}で表示する（エラー値はString::from("見つかりません")）

    // TODO: find_index(&v, 99)も同じように変換して表示する

    // TODO: "42".parse::<i32>()の結果を.ok()でOptionに変換し、{:?}で表示する
}`,
      solution: `// Vecの中からtargetの位置を探す（見つからなければNone）
fn find_index(v: &Vec<i32>, target: i32) -> Option<usize> {
    let mut i = 0;
    while i < v.len() {
        if v[i] == target {
            return Some(i);
        }
        i += 1;
    }
    None
}

fn main() {
    let v = vec![10, 20, 30];

    // Option -> Result：Noneにエラーの理由を与えて格上げする
    let found: Result<usize, String> = find_index(&v, 20).ok_or(String::from("見つかりません"));
    println!("{:?}", found);

    let not_found: Result<usize, String> = find_index(&v, 99).ok_or(String::from("見つかりません"));
    println!("{:?}", not_found);

    // Result -> Option：エラーの詳細を捨てて「取れたかどうか」だけにする
    let as_option = "42".parse::<i32>().ok();
    println!("{:?}", as_option);
}`,
      hints: [
        `ok_orはOptionのメソッドで、引数にはNoneのときに使うエラー値を渡します。find_index(&v, 20).ok_or(String::from("見つかりません")) の形です。`,
        `20はインデックス1にあるのでOk(1)、99は無いのでErr("見つかりません")になります。最後のparseは"42".parse::<i32>().ok()でSome(42)になります。`
      ],
      expectedOutput: "Some(42)"
    },
    {
      id: 100,
      title: "総合演習：安全な除算計算機",
      explanation: `<p>第10章の総仕上げとして、この章の道具を総動員した<strong>安全な除算計算機</strong>を作ります。文字列で受け取った2つの数値を割り算し、どんな入力でもpanicせずに結果かエラーを返すプログラムです。</p>
<p>起こりうる失敗は2種類あります。これをステップ98で学んだ独自エラー型で表現します。</p>
<ul>
<li><strong>ParseFailed</strong>：入力が数値に変換できない（"abc"など）</li>
<li><strong>DivideByZero</strong>：0で割ろうとした</li>
</ul>
<p>設計は2段構えにします。役割の小さい関数に分けるのは、エラー処理でも読みやすさの基本です。</p>
<ol>
<li><code>to_number</code>：文字列をf64に変換する。parseの結果をmatchでさばき、失敗を自分たちのエラー型<code>ParseFailed</code>に<strong>翻訳</strong>して返す</li>
<li><code>safe_divide</code>：<code>to_number</code>を<code>?</code>で2回呼んで数値を取り出し、0除算をチェックしてから割り算する</li>
</ol>
<pre><code>fn to_number(text: &amp;str) -&gt; Result&lt;f64, CalcError&gt; {
    match text.parse::&lt;f64&gt;() {
        Ok(n) =&gt; Ok(n),
        Err(_) =&gt; Err(CalcError::ParseFailed),
    }
}</code></pre>
<p>このように「下位のエラー（ParseFloatError）を自分のエラー型に変換してから伝播する」のは、実務のRustコードで毎日見かけるパターンです。mainでは結果をmatchでさばき、エラーの種類ごとに分かりやすいメッセージを表示します。panicする箇所が1つもない、堅牢なプログラムの完成です。</p>`,
      task: `(1)文字列をf64に変換し失敗時は<code>CalcError::ParseFailed</code>を返す関数<code>to_number</code>と、(2)<code>?</code>で2つの数値を取り出し、0除算なら<code>CalcError::DivideByZero</code>を返す関数<code>safe_divide</code>を完成させてください。`,
      code: `#[derive(Debug)]
enum CalcError {
    ParseFailed,  // 数値に変換できない
    DivideByZero, // 0除算
}

// TODO: 文字列をf64に変換する関数to_numberを書く
// text.parse::<f64>()をmatchでさばき、Err(_)ならErr(CalcError::ParseFailed)を返す

// TODO: 2つの文字列を受け取るsafe_divide(a_text, b_text)を書く
// to_numberを?で2回呼び、bが0.0ならErr(CalcError::DivideByZero)、
// そうでなければOk(a / b)を返す

fn main() {
    let cases = vec![("10", "4"), ("10", "0"), ("abc", "2")];
    for &(a, b) in &cases {
        match safe_divide(a, b) {
            Ok(result) => println!("{} / {} = {}", a, b, result),
            Err(CalcError::ParseFailed) => println!("{} / {} : 数値に変換できません", a, b),
            Err(CalcError::DivideByZero) => println!("{} / {} : 0では割れません", a, b),
        }
    }
}`,
      solution: `#[derive(Debug)]
enum CalcError {
    ParseFailed,  // 数値に変換できない
    DivideByZero, // 0除算
}

// parseの失敗を、自分たちのエラー型に翻訳して返す
fn to_number(text: &str) -> Result<f64, CalcError> {
    match text.parse::<f64>() {
        Ok(n) => Ok(n),
        Err(_) => Err(CalcError::ParseFailed),
    }
}

// ?で変換エラーを伝播し、0除算は自分でチェックする
fn safe_divide(a_text: &str, b_text: &str) -> Result<f64, CalcError> {
    let a = to_number(a_text)?;
    let b = to_number(b_text)?;
    if b == 0.0 {
        return Err(CalcError::DivideByZero);
    }
    Ok(a / b)
}

fn main() {
    let cases = vec![("10", "4"), ("10", "0"), ("abc", "2")];
    for &(a, b) in &cases {
        match safe_divide(a, b) {
            Ok(result) => println!("{} / {} = {}", a, b, result),
            Err(CalcError::ParseFailed) => println!("{} / {} : 数値に変換できません", a, b),
            Err(CalcError::DivideByZero) => println!("{} / {} : 0では割れません", a, b),
        }
    }
}`,
      hints: [
        `to_numberの戻り値はResult<f64, CalcError>です。ステップ97のparseのmatchとほぼ同じ形で、Err(_)のときに返す値だけ変えます。`,
        `safe_divideはfn safe_divide(a_text: &str, b_text: &str) -> Result<f64, CalcError> の形です。ステップ96のtotal_priceと同じ構成で書けます。`,
        `?で2つの数値を取り出したあと、if b == 0.0 { return Err(CalcError::DivideByZero); } を挟んでからOk(a / b)を返します。`
      ],
      expectedOutput: "10 / 4 = 2.5"
    }
  ]
});
