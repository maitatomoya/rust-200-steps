// 第17章：文字列操作と実践テクニック
registerChapter({
  number: 17,
  title: "文字列操作と実践テクニック",
  description: "format!によるフォーマット指定、parse、文字列の分割・検索・変換、ベクタの並べ替えや絞り込みなど、実務で頻出するテクニックを総合的に学びます。",
  steps: [
    {
      id: 161,
      title: "format!とフォーマット指定（幅寄せ・小数桁数）",
      explanation: `<p><code>format!</code>マクロは<code>println!</code>と同じ書式で文字列（<code>String</code>）を作るマクロです。画面に出力する代わりに値として文字列を受け取れるため、レポートの整形やメッセージの組み立てに使います。</p>
<p>プレースホルダ<code>{}</code>の中にコロンを書くと、フォーマット指定（表示方法の細かい指示）を追加できます。代表的な指定を表にまとめます。</p>
<table>
<tr><th>指定</th><th>意味</th><th>例（値=42）</th></tr>
<tr><td><code>{:>8}</code></td><td>幅8で右寄せ</td><td><code>      42</code></td></tr>
<tr><td><code>{:&lt;8}</code></td><td>幅8で左寄せ</td><td><code>42      </code></td></tr>
<tr><td><code>{:^8}</code></td><td>幅8で中央寄せ</td><td><code>   42   </code></td></tr>
<tr><td><code>{:08}</code></td><td>幅8でゼロ埋め</td><td><code>00000042</code></td></tr>
<tr><td><code>{:.2}</code></td><td>小数点以下2桁（四捨五入）</td><td><code>42.00</code></td></tr>
<tr><td><code>{:>8.2}</code></td><td>幅8右寄せ＋小数2桁の組み合わせ</td><td><code>   42.00</code></td></tr>
</table>
<p>幅と小数桁は組み合わせられます。金額の表を右端で揃えたいときは<code>{:>8.2}</code>のように書きます。</p>
<pre><code>let price = 123.456;
let s = format!("価格:{:>10.2}円", price);
// s は "価格:    123.46円" になる（幅10・右寄せ・小数2桁）</code></pre>
<p><code>format!</code>は新しい<code>String</code>を返すだけで元の値は変更しません。<code>println!</code>・<code>format!</code>・後で学ぶ<code>write!</code>はすべて同じフォーマット構文を共有しているので、ここで覚えた指定はそのまま使い回せます。</p>`,
      task: `TODOの行を修正し、<code>price</code>を「幅8・右寄せ・小数点以下2桁」で出力してください。さらに<code>format!</code>で作る文字列も小数点以下2桁になるように直してください。`,
      code: `fn main() {
    let price = 123.456;
    // TODO: 幅8で右寄せ、小数点以下2桁で表示する
    println!("{}", price);
    // TODO: 小数点以下2桁の文字列を作る
    let s = format!("合計:{}", price);
    println!("{}", s);
}`,
      solution: `fn main() {
    let price = 123.456;
    // 幅8で右寄せ、小数点以下2桁で表示する
    println!("{:>8.2}", price);
    // 小数点以下2桁の文字列を作る
    let s = format!("合計:{:.2}", price);
    println!("{}", s);
}`,
      hints: [
        `プレースホルダの中にコロンを書き、その後ろに指定を続けます。右寄せは不等号、幅は数字、小数桁はドットと数字です。`,
        `幅8・右寄せ・小数2桁は「コロン、右向き不等号、8、ドット、2」の順に並べます。`,
        `2つ目のTODOは幅指定なしで「コロン、ドット、2」だけで十分です。`
      ],
      expectedOutput: "合計:123.46"
    },
    {
      id: 162,
      title: "parseと型注釈・turbofish",
      explanation: `<p>文字列を数値に変換するには<code>parse</code>メソッドを使います。<code>parse</code>は「どの型に変換するか」を自分では決められないため、変換先の型を必ず何らかの方法で伝える必要があります。</p>
<pre><code>// 方法1：変数に型注釈を付ける
let n: i32 = "42".parse().unwrap();

// 方法2：turbofish（ターボフィッシュ）構文で型を直接指定する
let m = "3.14".parse::&lt;f64&gt;().unwrap();</code></pre>
<p>turbofishとは<code>::&lt;型&gt;</code>という記法のことで、見た目が魚に似ていることからこう呼ばれます。メソッド呼び出しの途中で型を指定したいときに使います。どちらの方法でも結果は同じなので、読みやすい方を選べば構いません。</p>
<p><code>parse</code>の戻り値は<code>Result&lt;T, E&gt;</code>です。<code>"abc"</code>のように数値へ変換できない文字列を渡すと<code>Err</code>が返ります。これまで学んだとおり、確実に成功すると分かっている場面では<code>unwrap</code>、失敗に備えるなら<code>match</code>や<code>unwrap_or</code>で処理します。</p>
<table>
<tr><th>書き方</th><th>特徴</th></tr>
<tr><td><code>let n: i32 = s.parse().unwrap();</code></td><td>変数の型注釈から変換先を推論</td></tr>
<tr><td><code>s.parse::&lt;i32&gt;().unwrap()</code></td><td>式の途中で型を明示。式をそのまま使うときに便利</td></tr>
<tr><td><code>s.parse::&lt;i32&gt;().unwrap_or(0)</code></td><td>失敗時に既定値0を使う安全な形</td></tr>
</table>
<p>型を一切伝えないと、コンパイラは「type annotations needed（型注釈が必要）」というエラーを出します。次の課題ではこのエラーを実際に修正します。</p>`,
      task: `このコードは「type annotations needed」というコンパイルエラーになります。1つ目は<strong>型注釈</strong>、2つ目は<strong>turbofish</strong>を使って、それぞれ変換先の型を指定してエラーを修正してください。`,
      code: `fn main() {
    let s = "42";
    // エラー：変換先の型が分からない（型注釈で解決する）
    let n = s.parse().unwrap();
    // エラー：こちらはturbofishで解決する
    let m = "3.14".parse().unwrap();
    println!("n + 8 = {}", n + 8);
    println!("m * 2.0 = {}", m * 2.0);
}`,
      solution: `fn main() {
    let s = "42";
    // 型注釈で変換先をi32に指定する
    let n: i32 = s.parse().unwrap();
    // turbofishで変換先をf64に指定する
    let m = "3.14".parse::<f64>().unwrap();
    println!("n + 8 = {}", n + 8);
    println!("m * 2.0 = {}", m * 2.0);
}`,
      hints: [
        `parseは変換先の型が決まらないとコンパイルできません。i32とf64のどちらに変換したいかをコードで伝えます。`,
        `1つ目は「let n: i32 = ...」のように変数名の後ろに型を書きます。`,
        `2つ目はparseの直後にコロン2つと山かっこで型を指定するturbofish構文を使います。`
      ],
      expectedOutput: "n + 8 = 50"
    },
    {
      id: 163,
      title: "charsとbytes・UTF-8と日本語文字列の長さ",
      explanation: `<p>Rustの文字列はUTF-8というエンコーディング（文字をバイト列で表現する方式）で保存されています。英数字は1文字1バイトですが、<strong>日本語の多くの文字は1文字3バイト</strong>を使います。このため「長さ」を数える方法が2つに分かれます。</p>
<table>
<tr><th>メソッド</th><th>数えるもの</th><th>"Rust入門"の場合</th></tr>
<tr><td><code>s.len()</code></td><td>バイト数</td><td>10（英字4＋漢字3×2）</td></tr>
<tr><td><code>s.chars().count()</code></td><td>文字数</td><td>6</td></tr>
</table>
<pre><code>let s = "Rust入門";
println!("{}", s.len());           // 10（バイト数）
println!("{}", s.chars().count()); // 6（文字数）</code></pre>
<p><code>chars()</code>は文字（<code>char</code>型）を1つずつ返すイテレータ、<code>bytes()</code>はバイト（<code>u8</code>型）を1つずつ返すイテレータです。第13章で学んだイテレータメソッドがそのまま使えるので、<code>count</code>・<code>filter</code>・<code>next</code>などと組み合わせられます。</p>
<pre><code>for c in s.chars() {
    print!("[{}]", c); // [R][u][s][t][入][門]
}
let first = s.chars().next().unwrap(); // 最初の1文字を取り出す</code></pre>
<p>注意点として、Rustの文字列は<code>s[0]</code>のように整数の添字で1文字を取り出すことが<strong>できません</strong>。UTF-8では文字ごとにバイト数が違うため、位置指定が曖昧になるからです。1文字目が欲しいときは<code>s.chars().next()</code>、n文字目なら<code>s.chars().nth(n)</code>を使うのがRust流です。日本語を扱うプログラムでは<code>len()</code>と<code>chars().count()</code>の混同がバグの定番なので、必ず区別して覚えてください。</p>`,
      task: `TODOの2か所を埋めてください。(1)<code>chars().count()</code>で文字数を出力する。(2)<code>chars()</code>のforループで1文字ずつ<code>[文字]</code>の形式で出力する。実行してバイト数と文字数の違いを確認しましょう。`,
      code: `fn main() {
    let s = "Rust入門";
    println!("len = {}", s.len());
    // TODO: chars().count()で文字数を出力する
    println!("chars = {}", 0);
    // TODO: charsのforループで1文字ずつ [文字] の形式で出力する

    println!();
    let first = s.chars().next().unwrap();
    println!("first = {}", first);
}`,
      solution: `fn main() {
    let s = "Rust入門";
    println!("len = {}", s.len());
    // 文字数を数える
    println!("chars = {}", s.chars().count());
    // 1文字ずつ取り出して表示する
    for c in s.chars() {
        print!("[{}]", c);
    }
    println!();
    let first = s.chars().next().unwrap();
    println!("first = {}", first);
}`,
      hints: [
        `len()はバイト数、chars().count()は文字数です。日本語1文字は3バイトなので結果がずれます。`,
        `文字数は s.chars().count() をそのままプレースホルダに渡します。`,
        `ループは for c in s.chars() と書き、中で print!("[{}]", c) を呼びます。`
      ],
      expectedOutput: "chars = 6"
    },
    {
      id: 164,
      title: "splitとsplit_whitespace",
      explanation: `<p>文字列を区切り文字で分割するには<code>split</code>を使います。<code>split</code>は分割結果を1つずつ返すイテレータを返すので、forループで回すか、<code>collect</code>で<code>Vec</code>に集められます。</p>
<pre><code>let csv = "apple,banana,cherry";
for item in csv.split(',') {
    println!("{}", item); // apple / banana / cherry
}

// Vecに集める場合はcollectの変換先の型注釈が必要
let items: Vec&lt;&amp;str&gt; = csv.split(',').collect();</code></pre>
<p>分割結果の型が<code>&amp;str</code>（元の文字列への参照）である点に注目してください。<code>split</code>はコピーを作らず、元の文字列の一部分を指す参照を返すため高速です。</p>
<p>空白での分割には専用の<code>split_whitespace</code>があります。<code>split(' ')</code>との違いは重要です。</p>
<table>
<tr><th>メソッド</th><th>連続する空白</th><th>前後の空白</th></tr>
<tr><td><code>split(' ')</code></td><td>空文字列<code>""</code>が混ざる</td><td>空文字列が混ざる</td></tr>
<tr><td><code>split_whitespace()</code></td><td>1つの区切りとして扱う</td><td>無視される</td></tr>
</table>
<pre><code>let text = "  hello   rust  ";
// split(' ')だと ["", "", "hello", "", "", "rust", "", ""] になってしまう
let words: Vec&lt;&amp;str&gt; = text.split_whitespace().collect();
// ["hello", "rust"] だけが得られる</code></pre>
<p>人間が入力したテキストは空白の個数が揃っていないことが多いため、単語の分割には<code>split_whitespace</code>を選ぶのが実務の定石です。カンマ区切りデータのように区切り文字が厳密な場合は<code>split(',')</code>を使います。</p>`,
      task: `TODOの2か所を埋めてください。(1)<code>csv</code>をカンマで分割してforループで1件ずつ出力する。(2)<code>text</code>を<code>split_whitespace()</code>で分割して<code>Vec</code>に集め、単語数を出力する。`,
      code: `fn main() {
    let csv = "apple,banana,cherry";
    // TODO: カンマで分割して「item: 名前」の形式で1件ずつ出力する

    let text = "  hello   rust  world ";
    // TODO: split_whitespace()で分割してVecに集める
    let words: Vec<&str> = Vec::new();
    println!("words = {:?}", words);
    println!("count = {}", words.len());
}`,
      solution: `fn main() {
    let csv = "apple,banana,cherry";
    // カンマで分割して1件ずつ出力する
    for item in csv.split(',') {
        println!("item: {}", item);
    }
    let text = "  hello   rust  world ";
    // 空白で分割する（連続空白や前後の空白は無視される）
    let words: Vec<&str> = text.split_whitespace().collect();
    println!("words = {:?}", words);
    println!("count = {}", words.len());
}`,
      hints: [
        `splitの引数には区切り文字をシングルクォートの文字リテラルで渡します。`,
        `forループは for item in csv.split(',') の形です。`,
        `Vecに集めるには text.split_whitespace().collect() を代入します。型注釈は既に書かれています。`
      ],
      expectedOutput: "count = 3"
    },
    {
      id: 165,
      title: "trim系・replace・to_uppercase",
      explanation: `<p>文字列の掃除と変換に使う定番メソッドをまとめて学びます。いずれも<strong>元の文字列は変更せず、新しい値を返す</strong>点が共通です（<code>&amp;str</code>は不変なので当然ですが、忘れやすいポイントです）。</p>
<table>
<tr><th>メソッド</th><th>働き</th><th>戻り値</th></tr>
<tr><td><code>trim()</code></td><td>前後の空白・改行を除去</td><td><code>&amp;str</code></td></tr>
<tr><td><code>trim_start()</code></td><td>先頭側だけ除去</td><td><code>&amp;str</code></td></tr>
<tr><td><code>trim_end()</code></td><td>末尾側だけ除去</td><td><code>&amp;str</code></td></tr>
<tr><td><code>replace(a, b)</code></td><td>aをすべてbに置換</td><td><code>String</code></td></tr>
<tr><td><code>to_uppercase()</code></td><td>大文字に変換</td><td><code>String</code></td></tr>
<tr><td><code>to_lowercase()</code></td><td>小文字に変換</td><td><code>String</code></td></tr>
</table>
<p><code>trim</code>は参照を返すだけなのに対し、<code>replace</code>や<code>to_uppercase</code>は文字が変わるため新しい<code>String</code>を作って返します。戻り値の型の違いは「コピーが発生するかどうか」の違いでもあります。</p>
<pre><code>let raw = "  Hello, Rust!  ";
let trimmed = raw.trim();               // "Hello, Rust!"（参照のみ）
let replaced = trimmed.replace("Rust", "World"); // 新しいString
let upper = replaced.to_uppercase();    // "HELLO, WORLD!"</code></pre>
<p>メソッドは数珠つなぎ（メソッドチェーン）にできます。ユーザー入力の正規化では<code>s.trim().to_lowercase()</code>という組み合わせが頻出です。<code>replace</code>は一致するすべての箇所を置換することにも注意してください。最初の1件だけ置換したい場合は<code>replacen(a, b, 1)</code>という兄弟メソッドがあります。</p>`,
      task: `TODOの3か所を埋めてください。(1)<code>raw</code>の前後の空白を<code>trim()</code>で除去する。(2)その結果の「Rust」を「World」に<code>replace</code>する。(3)置換結果を<code>to_uppercase()</code>で大文字にして出力する。`,
      code: `fn main() {
    let raw = "  Hello, Rust!  ";
    // TODO: 前後の空白を除去する
    let trimmed = raw;
    println!("[{}]", trimmed);
    // TODO: "Rust" を "World" に置換する
    let replaced = String::from(trimmed);
    println!("{}", replaced);
    // TODO: replacedを大文字にして出力する
    println!("{}", replaced);
    println!("{}", "ABC".to_lowercase());
}`,
      solution: `fn main() {
    let raw = "  Hello, Rust!  ";
    // 前後の空白を除去する
    let trimmed = raw.trim();
    println!("[{}]", trimmed);
    // "Rust" を "World" に置換する（新しいStringが返る）
    let replaced = trimmed.replace("Rust", "World");
    println!("{}", replaced);
    // 大文字に変換して出力する
    println!("{}", replaced.to_uppercase());
    println!("{}", "ABC".to_lowercase());
}`,
      hints: [
        `trimは引数なしで呼ぶだけで前後の空白を取り除いた参照を返します。`,
        `replaceは replace("置換前", "置換後") の形で、新しいStringを返します。`,
        `大文字化は replaced.to_uppercase() をそのままprintln!に渡せます。`
      ],
      expectedOutput: "HELLO, WORLD!"
    },
    {
      id: 166,
      title: "contains・starts_with・findで検索",
      explanation: `<p>文字列の検索には目的別に3つのメソッドを使い分けます。</p>
<table>
<tr><th>メソッド</th><th>調べること</th><th>戻り値</th></tr>
<tr><td><code>contains(pat)</code></td><td>どこかに含まれるか</td><td><code>bool</code></td></tr>
<tr><td><code>starts_with(pat)</code></td><td>先頭がpatで始まるか</td><td><code>bool</code></td></tr>
<tr><td><code>ends_with(pat)</code></td><td>末尾がpatで終わるか</td><td><code>bool</code></td></tr>
<tr><td><code>find(pat)</code></td><td>最初に現れる位置</td><td><code>Option&lt;usize&gt;</code></td></tr>
</table>
<p><code>find</code>だけ戻り値が<code>Option&lt;usize&gt;</code>である点が重要です。見つかれば<code>Some(位置)</code>、見つからなければ<code>None</code>が返るので、第8章で学んだ<code>match</code>や<code>if let</code>で安全に取り出します。</p>
<pre><code>let log = "ERROR: file not found";

if log.starts_with("ERROR") {
    println!("エラー行です");
}
println!("{}", log.contains("not")); // true

match log.find("file") {
    Some(pos) =&gt; println!("位置: {}", pos), // 位置: 7
    None =&gt; println!("見つかりません"),
}</code></pre>
<p>注意点が2つあります。第一に、<code>find</code>が返す位置は<strong>バイト単位</strong>です。前ステップで学んだとおり日本語は1文字3バイトなので、日本語を含む文字列では「何文字目」とは一致しません。第二に、これらの検索は大文字と小文字を区別します。区別せず検索したいときは<code>log.to_lowercase().contains("error")</code>のように正規化してから調べるのが定石です。ログ解析では「行頭の種別判定に<code>starts_with</code>、キーワードの有無に<code>contains</code>」という使い分けが典型です。</p>`,
      task: `TODOの3か所を埋めてください。(1)<code>starts_with</code>で「ERROR」から始まるか判定する。(2)<code>contains</code>で「not」を含むか出力する。(3)<code>find</code>で「file」の位置を<code>match</code>で取り出して出力する。`,
      code: `fn main() {
    let log = "ERROR: file not found";
    // TODO: "ERROR" で始まる場合に「エラー行です」と出力する
    if true {
        println!("エラー行です");
    }
    // TODO: "not" を含むかどうかをcontainsで出力する
    println!("contains not = {}", false);
    // TODO: findで "file" の位置を調べ、matchでSome/Noneを処理する
    println!("fileの位置: ?");
}`,
      solution: `fn main() {
    let log = "ERROR: file not found";
    // "ERROR" で始まるか判定する
    if log.starts_with("ERROR") {
        println!("エラー行です");
    }
    // "not" を含むか調べる
    println!("contains not = {}", log.contains("not"));
    // "file" の位置（バイト位置）を調べる
    match log.find("file") {
        Some(pos) => println!("fileの位置: {}", pos),
        None => println!("見つかりません"),
    }
}`,
      hints: [
        `starts_withとcontainsはどちらもboolを返すので、ifの条件やprintln!にそのまま書けます。`,
        `findの戻り値はOptionなので、match log.find("file") で Some(pos) と None の2つの腕を書きます。`,
        `"ERROR: " は7バイトなので、fileの位置は7になるはずです。`
      ],
      expectedOutput: "fileの位置: 7"
    },
    {
      id: 167,
      title: "sortとsort_by・sort_by_key",
      explanation: `<p>ベクタの並べ替えは<code>sort</code>系メソッドで行います。いずれも<strong>ベクタ自身を直接並べ替える</strong>ため、対象の変数は<code>mut</code>で宣言する必要があります。</p>
<table>
<tr><th>メソッド</th><th>並べ方</th><th>使いどころ</th></tr>
<tr><td><code>sort()</code></td><td>昇順（小さい順）</td><td>基本の並べ替え</td></tr>
<tr><td><code>sort_by(cmp)</code></td><td>比較クロージャで自由に指定</td><td>降順や複合条件</td></tr>
<tr><td><code>sort_by_key(f)</code></td><td>キーを取り出す関数の結果で昇順</td><td>「長さ順」「特定フィールド順」</td></tr>
</table>
<p><code>sort_by</code>には「2つの要素を受け取り順序を返すクロージャ」を渡します。<code>a.cmp(b)</code>が昇順、引数を入れ替えた<code>b.cmp(a)</code>が降順という対称性を覚えると迷いません。</p>
<pre><code>let mut nums = vec![30, 5, 12, 8];
nums.sort();                        // [5, 8, 12, 30]
nums.sort_by(|a, b| b.cmp(a));      // [30, 12, 8, 5]（降順）

let mut words = vec!["banana", "fig", "cherry"];
words.sort_by_key(|w| w.len());     // 文字列の長さ順
// ["fig", "banana", "cherry"]</code></pre>
<p><code>sort_by_key</code>は「各要素からキーを1つ取り出す」クロージャを渡す形で、降順比較を書くより意図が読み取りやすいのが利点です。なおRustの<code>sort</code>は安定ソート（同順位の要素の元の並びを保つ方式）なので、上の例で長さ6の<code>banana</code>と<code>cherry</code>は元の順番のまま並びます。浮動小数点数（<code>f64</code>）は<code>NaN</code>の存在により単純な<code>sort()</code>ができず、<code>sort_by(|a, b| a.partial_cmp(b).unwrap())</code>と書く必要がある点も知っておくと役立ちます。</p>`,
      task: `TODOの2か所を埋めてください。(1)<code>sort_by</code>で<code>nums</code>を降順に並べ替える。(2)<code>sort_by_key</code>で<code>words</code>を文字列の長さ順に並べ替える。`,
      code: `fn main() {
    let mut nums = vec![30, 5, 12, 8];
    nums.sort();
    println!("{:?}", nums);
    // TODO: sort_byで降順（大きい順）に並べ替える

    println!("{:?}", nums);
    let mut words = vec!["banana", "fig", "cherry"];
    // TODO: sort_by_keyで文字列の長さ順に並べ替える

    println!("{:?}", words);
}`,
      solution: `fn main() {
    let mut nums = vec![30, 5, 12, 8];
    nums.sort();
    println!("{:?}", nums);
    // 降順は引数を入れ替えて比較する
    nums.sort_by(|a, b| b.cmp(a));
    println!("{:?}", nums);
    let mut words = vec!["banana", "fig", "cherry"];
    // 文字列の長さをキーにして並べ替える
    words.sort_by_key(|w| w.len());
    println!("{:?}", words);
}`,
      hints: [
        `降順にするには比較の向きを逆にします。a.cmp(b)ではなくbからaを比較します。`,
        `sort_byのクロージャは2引数で、nums.sort_by(|a, b| b.cmp(a)) の形です。`,
        `sort_by_keyのクロージャは1引数で、要素からキー（ここでは長さ）を返します。`
      ],
      expectedOutput: `["fig", "banana", "cherry"]`
    },
    {
      id: 168,
      title: "dedup・retain・position",
      explanation: `<p>ベクタの整理に使う3つのメソッドを学びます。</p>
<table>
<tr><th>メソッド</th><th>働き</th><th>備考</th></tr>
<tr><td><code>dedup()</code></td><td><strong>連続する</strong>重複要素を1つにまとめる</td><td>全体の重複除去には先にsortが必要</td></tr>
<tr><td><code>retain(f)</code></td><td>条件を満たす要素だけ残す</td><td>filterと違い、その場で削除する</td></tr>
<tr><td><code>iter().position(f)</code></td><td>条件を満たす最初の要素の添字</td><td>戻り値は<code>Option&lt;usize&gt;</code></td></tr>
</table>
<p><code>dedup</code>の「連続する」という条件は見落としやすい罠です。<code>[1, 2, 1]</code>に<code>dedup</code>しても1は離れているため消えません。ベクタ全体から重複をなくしたいときは<code>sort</code>してから<code>dedup</code>する、という2段構えが定石です。</p>
<pre><code>let mut v = vec![1, 1, 2, 3, 3, 3, 4];
v.dedup();               // [1, 2, 3, 4]
v.retain(|&amp;x| x % 2 == 0); // [2, 4] 偶数だけ残す</code></pre>
<p><code>retain</code>は第13章の<code>filter</code>と似ていますが、<code>filter</code>がイテレータを介して新しいコレクションを作るのに対し、<code>retain</code>は元のベクタをその場で書き換えます。メモリ割り当てが発生しないため「同じ変数を使い続けたい」場面で効率的です。</p>
<pre><code>let idx = v.iter().position(|&amp;x| x == 4);
// 見つかれば Some(添字)、なければ None</code></pre>
<p><code>position</code>はイテレータのメソッドなので<code>iter()</code>を挟んで呼びます。文字列の<code>find</code>がバイト位置を返したのに対し、こちらは要素の添字を返します。クロージャの引数が<code>&amp;x</code>とパターンで参照を外している点は、第13章で学んだイテレータの書き方と同じです。</p>`,
      task: `TODOの3か所を埋めてください。(1)<code>dedup()</code>で連続する重複を除去する。(2)<code>retain</code>で偶数だけ残す。(3)<code>position</code>で値4の添字を調べて出力する。`,
      code: `fn main() {
    let mut v = vec![1, 1, 2, 3, 3, 3, 4];
    // TODO: 連続する重複を除去する

    println!("dedup: {:?}", v);
    // TODO: retainで偶数（x % 2 == 0）だけ残す

    println!("retain: {:?}", v);
    // TODO: positionで値が4の要素の添字を調べる
    let idx: Option<usize> = None;
    println!("position: {:?}", idx);
}`,
      solution: `fn main() {
    let mut v = vec![1, 1, 2, 3, 3, 3, 4];
    // 連続する重複を除去する
    v.dedup();
    println!("dedup: {:?}", v);
    // 偶数だけ残す（その場で書き換える）
    v.retain(|&x| x % 2 == 0);
    println!("retain: {:?}", v);
    // 値が4の要素の添字を調べる
    let idx: Option<usize> = v.iter().position(|&x| x == 4);
    println!("position: {:?}", idx);
}`,
      hints: [
        `dedupは引数なしで呼ぶだけです。ソート済みの並びなら全重複が消えます。`,
        `retainのクロージャは「残したい条件」を返します。参照を外すため引数はアンパサンド付きのパターンにします。`,
        `positionは v.iter().position(...) の形で、クロージャで探したい条件を書きます。`
      ],
      expectedOutput: "retain: [2, 4]"
    },
    {
      id: 169,
      title: "実践演習：CSV風文字列のパースと集計",
      explanation: `<p>この章で学んだテクニックを組み合わせて、CSV風データ（カンマ区切りテキスト）の集計プログラムを作ります。実務でも設定ファイルやログの簡易パースは頻出タスクです。処理の流れは次の3段階です。</p>
<ol>
<li><code>lines()</code>で1行ずつ取り出す（<code>lines</code>は改行区切りのイテレータを返す）</li>
<li>各行を<code>split(',')</code>で列に分割し、<code>collect</code>で<code>Vec&lt;&amp;str&gt;</code>に集める</li>
<li>数値の列を<code>parse</code>で変換して計算する</li>
</ol>
<pre><code>let data = "りんご,120,3";
let cols: Vec&lt;&amp;str&gt; = data.split(',').collect();
let name = cols[0];                       // "りんご"
let price: i32 = cols[1].parse().unwrap(); // 120
let qty: i32 = cols[2].parse().unwrap();   // 3
println!("{}: {}円", name, price * qty);   // りんご: 360円</code></pre>
<p>列へのアクセスに添字<code>cols[0]</code>を使えるのは、<code>collect</code>で<code>Vec</code>に変換したからです。イテレータのままでは添字アクセスはできません。</p>
<p>実務のコードでは<code>unwrap</code>ではなく<code>Result</code>を丁寧に処理しますが、データの形式が確実に分かっている練習ではまず<code>unwrap</code>で骨格を作り、後から安全にしていく進め方で構いません。また、本格的なCSV（引用符やカンマを含む値があるもの）の処理には専用クレートを使うのが実務の判断ですが、単純な区切りテキストなら今回の方法で十分です。合計を保持する変数を<code>mut</code>で用意し、各行の小計を足し込んでいくパターンも定番なので身につけておきましょう。</p>`,
      task: `果物の「名前,単価,個数」データを集計します。TODOの3か所を埋めて、(1)単価と個数を<code>parse</code>で数値化、(2)小計（単価×個数）を計算して出力、(3)合計に足し込む処理を完成させてください。`,
      code: `fn main() {
    let data = "りんご,120,3
みかん,80,5
バナナ,100,2";
    let mut total = 0;
    for line in data.lines() {
        let cols: Vec<&str> = line.split(',').collect();
        let name = cols[0];
        // TODO: cols[1]（単価）とcols[2]（個数）をi32にparseする
        let price: i32 = 0;
        let qty: i32 = 0;
        // TODO: 小計 = 単価 * 個数 を計算する
        let sub = 0;
        println!("{}: {}円", name, sub);
        // TODO: totalに小計を足し込む
    }
    println!("合計: {}円", total);
}`,
      solution: `fn main() {
    let data = "りんご,120,3
みかん,80,5
バナナ,100,2";
    let mut total = 0;
    for line in data.lines() {
        let cols: Vec<&str> = line.split(',').collect();
        let name = cols[0];
        // 単価と個数を数値に変換する
        let price: i32 = cols[1].parse().unwrap();
        let qty: i32 = cols[2].parse().unwrap();
        // 小計を計算する
        let sub = price * qty;
        println!("{}: {}円", name, sub);
        // 合計に足し込む
        total += sub;
    }
    println!("合計: {}円", total);
}`,
      hints: [
        `parseは cols[1].parse().unwrap() の形です。変数側にi32の型注釈が既にあるのでturbofishは不要です。`,
        `小計は price * qty、合計への加算は total += sub と書きます。`,
        `期待する結果は りんご360円、みかん400円、バナナ200円、合計960円です。`
      ],
      expectedOutput: "合計: 960円"
    },
    {
      id: 170,
      title: "総合演習：テキストレポート整形",
      explanation: `<p>章の総仕上げとして、データのパース・並べ替え・フォーマット指定を組み合わせた「売上レポート整形」を作ります。目指す出力は次のような、列が揃った表です。</p>
<pre><code>name    |   sales
----------------
apple   |    1250
banana  |     300
cherry  |      80
total   |    1630</code></pre>
<p>使う道具はすべて学習済みです。</p>
<table>
<tr><th>工程</th><th>使う道具</th></tr>
<tr><td>行の分解</td><td><code>lines()</code>と<code>split(',')</code></td></tr>
<tr><td>数値化</td><td><code>parse</code>＋型注釈</td></tr>
<tr><td>データの保持</td><td><code>Vec&lt;(String, i32)&gt;</code>（タプルのベクタ）</td></tr>
<tr><td>降順の並べ替え</td><td><code>sort_by</code>と<code>cmp</code></td></tr>
<tr><td>列揃え</td><td><code>{:&lt;8}</code>（左寄せ）と<code>{:>8}</code>（右寄せ）</td></tr>
</table>
<p>タプルのベクタを並べ替えるときは、クロージャの中でタプルの要素に<code>a.1</code>のように番号でアクセスします。<code>cmp</code>の引数は参照が必要なので<code>b.1.cmp(&amp;a.1)</code>と書く点に注意してください（<code>a.1</code>は<code>i32</code>の値そのものなので、参照にするためにアンパサンドを付けます）。</p>
<pre><code>items.sort_by(|a, b| b.1.cmp(&amp;a.1)); // 2番目の要素で降順</code></pre>
<p>また、名前の列は<code>&amp;str</code>のままだと所有権の管理が複雑になるため、<code>to_string()</code>で<code>String</code>に変換してからベクタへ入れます。「借用のままで済ませるか、所有させるか」の判断は第5〜6章で学んだ所有権の考え方の実践です。迷ったら所有させる（<code>String</code>にする）方が初心者には安全です。</p>`,
      task: `売上データを金額の大きい順に並べたレポートを完成させます。TODOの3か所を埋めてください。(1)<code>parse</code>で金額を数値化してタプルを<code>push</code>、(2)<code>sort_by</code>で金額の降順に並べ替え、(3)<code>{:&lt;8}</code>と<code>{:&gt;8}</code>で列を揃えて出力します。`,
      code: `fn main() {
    let data = "banana,300
apple,1250
cherry,80";
    let mut items: Vec<(String, i32)> = Vec::new();
    for line in data.lines() {
        let cols: Vec<&str> = line.split(',').collect();
        // TODO: cols[1]をi32にparseし、(名前のString, 金額)をitemsにpushする

    }
    // TODO: 金額（タプルの2番目）の降順に並べ替える

    println!("{:<8}|{:>8}", "name", "sales");
    println!("----------------");
    let mut total = 0;
    for (name, value) in &items {
        // TODO: 名前を幅8左寄せ、金額を幅8右寄せで出力する

        total += value;
    }
    println!("total   |{:>8}", total);
}`,
      solution: `fn main() {
    let data = "banana,300
apple,1250
cherry,80";
    let mut items: Vec<(String, i32)> = Vec::new();
    for line in data.lines() {
        let cols: Vec<&str> = line.split(',').collect();
        // 名前は所有権を持つStringに変換して保持する
        let value: i32 = cols[1].parse().unwrap();
        items.push((cols[0].to_string(), value));
    }
    // 金額の大きい順（降順）に並べ替える
    items.sort_by(|a, b| b.1.cmp(&a.1));
    println!("{:<8}|{:>8}", "name", "sales");
    println!("----------------");
    let mut total = 0;
    for (name, value) in &items {
        // 名前は左寄せ、金額は右寄せで列を揃える
        println!("{:<8}|{:>8}", name, value);
        total += value;
    }
    println!("total   |{:>8}", total);
}`,
      hints: [
        `pushするタプルは (cols[0].to_string(), value) の形です。valueは型注釈付きでparseします。`,
        `降順の並べ替えは items.sort_by(|a, b| b.1.cmp(&a.1)) です。cmpの引数には参照を渡します。`,
        `出力の書式はヘッダ行と同じ "{:<8}|{:>8}" が使えます。`
      ],
      expectedOutput: "apple   |    1250"
    }
  ]
});
