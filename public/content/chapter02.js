// 第2章：データ型と演算
registerChapter({
  number: 2,
  title: "データ型と演算",
  description: "整数・浮動小数点・bool・charなどの基本型と、タプル・配列・型変換・オーバーフローまで、Rustの型システムの土台を学びます。",
  steps: [
    {
      id: 11,
      title: "整数型（i32、u32、i64など）",
      explanation: `<p>Rustの整数型は「符号の有無」と「ビット数（データの大きさ）」の組み合わせで細かく分かれています。符号あり（負の数も扱える）は<code>i</code>、符号なし（0以上のみ）は<code>u</code>で始まります。</p>
<table>
<tr><th>ビット数</th><th>符号あり</th><th>符号なし</th><th>符号ありの範囲</th></tr>
<tr><td>8</td><td><code>i8</code></td><td><code>u8</code></td><td>-128〜127</td></tr>
<tr><td>16</td><td><code>i16</code></td><td><code>u16</code></td><td>-32768〜32767</td></tr>
<tr><td>32</td><td><code>i32</code></td><td><code>u32</code></td><td>約-21億〜約21億</td></tr>
<tr><td>64</td><td><code>i64</code></td><td><code>u64</code></td><td>約±922京</td></tr>
</table>
<p>他に128ビットの<code>i128</code>/<code>u128</code>、実行環境のポインタ幅に合わせた<code>isize</code>/<code>usize</code>もあります。型注釈を省略した整数リテラルは<strong>デフォルトで<code>i32</code></strong>になります。<code>i32</code>は多くのCPUで高速に扱え、日常の計算に十分な範囲を持つためです。</p>
<pre><code>fn main() {
    let a = -42;            // 型注釈なし→i32
    let b: u32 = 42;        // 型注釈で指定
    let c: i64 = 9000000000; // 90億はi32に収まらないのでi64
    println!("{} {} {}", a, b, c);
}</code></pre>
<p>90億のようにi32の範囲（約21億まで）を超える値は、<code>i64</code>など大きな型を明示する必要があります。また読みやすさのために<code>9_000_000_000</code>のようにアンダースコアで桁区切りもできます。</p>
<p>型を選ぶ基準はシンプルで、「迷ったら<code>i32</code>、大きな値なら<code>i64</code>、負にならないことを型で保証したいなら<code>u</code>系」です。年齢や個数のような値に<code>u32</code>を使うと、負の値の混入をコンパイラが防いでくれます。</p>`,
      task: `TODOの2行を追加してください。<code>u32</code>型の変数<code>b</code>（値42）と、<code>i64</code>型の変数<code>c</code>（値9000000000）を型注釈付きで宣言し、出力を完成させます。`,
      code: `fn main() {
    let a: i32 = -42;
    // TODO: u32型の変数b（値42）を型注釈付きで宣言する

    // TODO: i64型の変数c（値9000000000）を型注釈付きで宣言する

    println!("i32のa: {}", a);
    println!("u32のb: {}", b);
    println!("i64のc: {}", c);
}`,
      solution: `fn main() {
    let a: i32 = -42;
    let b: u32 = 42;
    let c: i64 = 9000000000;
    println!("i32のa: {}", a);
    println!("u32のb: {}", b);
    println!("i64のc: {}", c);
}`,
      hints: [
        `型注釈はlet 名前: 型 = 値;の形です。定数constで書いた形と同じです。`,
        `let b: u32 = 42;とlet c: i64 = 9000000000;の2行を追加します。90億はi32の範囲を超えるためi64が必要です。`
      ],
      expectedOutput: "i64のc: 9000000000"
    },
    {
      id: 12,
      title: "浮動小数点型",
      explanation: `<p>小数を扱うのが浮動小数点型です。Rustには2種類あります。</p>
<table>
<tr><th>型</th><th>サイズ</th><th>精度</th><th>用途</th></tr>
<tr><td><code>f32</code></td><td>32ビット</td><td>約7桁（単精度）</td><td>メモリ節約やGPU計算など</td></tr>
<tr><td><code>f64</code></td><td>64ビット</td><td>約15桁（倍精度）</td><td><strong>デフォルト。迷ったらこちら</strong></td></tr>
</table>
<p>小数リテラルは型注釈なしだと<code>f64</code>になります。現代のCPUではf64もf32もほぼ同速で、精度の高いf64が標準とされています。</p>
<pre><code>fn main() {
    let pi = 3.14159;      // f64
    let radius = 2.0;      // 「2」ではなく「2.0」と書く点に注意
    let area = pi * radius * radius;
    println!("円の面積は{}", area);       // 12.56636
    println!("円の面積は{:.2}", area);    // 12.57（小数第2位まで）
}</code></pre>
<p>2つ目の<code>println!</code>にある<code>{:.2}</code>は「小数点以下2桁で四捨五入して表示する」書式指定です。<code>{:.1}</code>なら1桁になります。金額や測定値の表示で頻出するので覚えておきましょう。</p>
<p>注意点として、浮動小数点数は内部的に2進数で近似表現されるため、<code>0.1 + 0.2</code>が正確に<code>0.3</code>にならないなどの誤差が起こり得ます。これはRust固有ではなくIEEE 754という国際規格に従うすべての言語共通の性質です。お金の計算のように誤差が許されない場面では整数（たとえば「円」ではなく「銭」単位）で扱うのが実務の定石です。</p>`,
      task: `半径2.0の円の面積（<code>pi * radius * radius</code>）を計算し、書式指定<code>{:.2}</code>を使って<code>円の面積は12.57</code>と表示してください。`,
      code: `fn main() {
    let pi = 3.14159;
    let radius = 2.0;
    // TODO: 面積を計算して変数areaに束縛する

    // TODO: {:.2}を使って「円の面積は12.57」と表示する
    println!("円の面積は");
}`,
      solution: `fn main() {
    let pi = 3.14159;
    let radius = 2.0;
    let area = pi * radius * radius;
    println!("円の面積は{:.2}", area);
}`,
      hints: [
        `面積はlet area = pi * radius * radius;で計算できます。`,
        `小数第2位までの表示はprintln!("円の面積は{:.2}", area);のように{}の中に:.2を書きます。`
      ],
      expectedOutput: "円の面積は12.57"
    },
    {
      id: 13,
      title: "数値演算と整数除算の罠",
      explanation: `<p>Rustの四則演算は<code>+</code> <code>-</code> <code>*</code> <code>/</code>、余りは<code>%</code>で計算します。ここに初心者が必ず一度はハマる罠があります。<strong>整数同士の割り算は、結果も整数になり小数部分が切り捨てられる</strong>のです。</p>
<pre><code>fn main() {
    println!("{}", 7 / 2);     // 3   ←3.5ではない！
    println!("{}", 7 % 2);     // 1   （余り）
    println!("{}", 7.0 / 2.0); // 3.5 （浮動小数点なら小数になる）
}</code></pre>
<p><code>7 / 2</code>が<code>3</code>になるのは、整数型の世界では答えも整数でなければならないためです。切り捨てと余りはセットで、<code>7 = 2 * 3 + 1</code>という関係になっています。余り<code>%</code>は「偶数・奇数の判定」や「N回ごとに処理する」といった場面で活躍します。</p>
<p>もう1つ重要なルールがあります。Rustは<strong>異なる型同士の演算を許しません</strong>。</p>
<pre><code>fn main() {
    let a = 7;    // i32
    let b = 2.0;  // f64
    // let c = a / b; // コンパイルエラー！i32とf64は混ぜられない
}</code></pre>
<p>多くの言語は暗黙のうちに型を変換して計算しますが、それが原因の分かりにくいバグも生みます。Rustは「変換するならプログラマが明示せよ」という設計で、変換の方法（<code>as</code>）はステップ18で学びます。現時点では「小数の結果が欲しい計算は最初から<code>7.0 / 2.0</code>のように小数で書く」と覚えておきましょう。</p>`,
      task: `平均を計算するコードですが、整数除算のせいで3と表示されてしまいます。リテラルを浮動小数点数（<code>3.0</code>、<code>4.0</code>、<code>2.0</code>）に書き換えて、<code>平均は3.5</code>と表示させてください。`,
      code: `fn main() {
    println!("7 / 2 = {}", 7 / 2);
    println!("7 % 2 = {}", 7 % 2);

    // TODO: 3と4の平均を正しく3.5にしたい。
    // 整数のままだと(3 + 4) / 2 = 3になってしまう。
    // リテラルを浮動小数点数に書き換えよう
    let average = (3 + 4) / 2;
    println!("平均は{}", average);
}`,
      solution: `fn main() {
    println!("7 / 2 = {}", 7 / 2);
    println!("7 % 2 = {}", 7 % 2);

    let average = (3.0 + 4.0) / 2.0;
    println!("平均は{}", average);
}`,
      hints: [
        `整数同士の割り算は小数が切り捨てられます。計算の全体を浮動小数点数で行う必要があります。`,
        `(3.0 + 4.0) / 2.0のように、3つの数すべてを小数リテラルにします。1つでも整数が混ざると型エラーになります。`
      ],
      expectedOutput: "平均は3.5"
    },
    {
      id: 14,
      title: "bool型",
      explanation: `<p><code>bool</code>型は<code>true</code>（真）か<code>false</code>（偽）の2値だけを持つ型です。「条件が成り立つかどうか」を表現し、後の章で学ぶif文の条件判定の主役になります。</p>
<p>boolの値は比較演算子で作るのが基本です。</p>
<table>
<tr><th>演算子</th><th>意味</th><th>例（結果）</th></tr>
<tr><td><code>==</code></td><td>等しい</td><td><code>5 == 5</code>（true）</td></tr>
<tr><td><code>!=</code></td><td>等しくない</td><td><code>5 != 3</code>（true）</td></tr>
<tr><td><code>&lt;</code> / <code>&lt;=</code></td><td>より小さい／以下</td><td><code>3 &lt; 5</code>（true）</td></tr>
<tr><td><code>&gt;</code> / <code>&gt;=</code></td><td>より大きい／以上</td><td><code>3 &gt; 5</code>（false）</td></tr>
</table>
<p>さらに、boolどうしを組み合わせる論理演算子があります。</p>
<ul>
<li><code>&amp;&amp;</code>（かつ）：両方trueのときだけtrue</li>
<li><code>||</code>（または）：どちらかがtrueならtrue</li>
<li><code>!</code>（否定）：trueとfalseを反転</li>
</ul>
<pre><code>fn main() {
    let age = 20;
    let is_adult = age &gt;= 18;         // 比較の結果はbool
    let has_ticket = true;
    let can_enter = is_adult &amp;&amp; has_ticket; // 両方trueならtrue
    println!("成人か: {}", is_adult);
    println!("入場できる: {}", can_enter);
}</code></pre>
<p>ポイントは、<code>age &gt;= 18</code>のような比較式そのものが値（bool）を返す「式」だということです。比較結果に<code>is_adult</code>のような名前を付けて変数に束縛すると、条件の意味がコードから読み取れるようになります。「boolの変数名はis_やhas_で始める」のは多くの言語で通用する良い習慣です。</p>`,
      task: `TODOの2行を完成させてください。<code>age &gt;= 18</code>の比較結果を<code>is_adult</code>に束縛し、<code>is_adult &amp;&amp; has_ticket</code>の結果を<code>can_enter</code>に束縛して、<code>入場できる: true</code>と表示させます。`,
      code: `fn main() {
    let age = 20;
    let has_ticket = true;

    // TODO: ageが18以上かどうかの比較結果をis_adultに束縛する
    let is_adult = false;

    // TODO: is_adultかつhas_ticketの結果をcan_enterに束縛する
    let can_enter = false;

    println!("成人か: {}", is_adult);
    println!("入場できる: {}", can_enter);
}`,
      solution: `fn main() {
    let age = 20;
    let has_ticket = true;

    let is_adult = age >= 18;
    let can_enter = is_adult && has_ticket;

    println!("成人か: {}", is_adult);
    println!("入場できる: {}", can_enter);
}`,
      hints: [
        `「以上」の比較は>=、「かつ」は&&を使います。比較式や論理式はそのままboolの値になります。`,
        `let is_adult = age >= 18;とlet can_enter = is_adult && has_ticket;に書き換えます。falseを直接書く必要はありません。`
      ],
      expectedOutput: "入場できる: true"
    },
    {
      id: 15,
      title: "char型",
      explanation: `<p><code>char</code>型は「1文字」を表す型です。文字列（複数文字の並び）とは別物で、リテラルの書き方も異なります。</p>
<table>
<tr><th>種類</th><th>囲み方</th><th>例</th></tr>
<tr><td>char（1文字）</td><td>シングルクォート</td><td><code>'R'</code>、<code>'あ'</code></td></tr>
<tr><td>文字列</td><td>ダブルクォート</td><td><code>"Rust"</code>、<code>"あ"</code></td></tr>
</table>
<p><code>"あ"</code>のように1文字でもダブルクォートなら文字列であり、charとは型が違います。この区別はコンパイラが厳密にチェックします。</p>
<p>Rustのcharの特筆すべき点は、<strong>4バイト（32ビット）のUnicodeスカラー値</strong>だという点です。C言語のcharが1バイト（実質ASCII文字のみ）なのに対し、Rustのcharはひらがな、漢字、アラビア文字、絵文字まで、1文字として自然に扱えます。</p>
<pre><code>fn main() {
    let initial = 'R';   // 英字
    let hiragana = 'あ'; // ひらがなもOK
    let kanji = '錆';    // 漢字もOK（錆＝Rustの意味）
    println!("{} {} {}", initial, hiragana, kanji);
}</code></pre>
<p>ただし1つ注意があります。人間が「1文字」と感じる単位（書記素クラスタ）とcharは常に一致するわけではありません。たとえば国旗の絵文字や一部の結合文字は複数のcharの組み合わせで表現されます。「charはUnicodeのコードポイント1つ分」という正確な理解は、後の章で文字列の内部構造を学ぶときに効いてきます。</p>
<p>まずは「1文字はシングルクォート、文字列はダブルクォート」をしっかり区別できるようになりましょう。</p>`,
      task: `char型の変数を2つ宣言してください。<code>initial</code>に<code>'R'</code>、<code>kanji</code>に<code>'錆'</code>を束縛し、<code>Rustの頭文字はR、漢字では錆</code>と表示させます。クォートの種類に注意してください。`,
      code: `fn main() {
    // TODO: char型の変数initialに文字'R'を束縛する

    // TODO: char型の変数kanjiに文字'錆'を束縛する

    println!("Rustの頭文字は{}、漢字では{}", initial, kanji);
}`,
      solution: `fn main() {
    let initial = 'R';
    let kanji = '錆';
    println!("Rustの頭文字は{}、漢字では{}", initial, kanji);
}`,
      hints: [
        `charのリテラルはシングルクォートで囲みます。ダブルクォートだと文字列になってしまいます。`,
        `let initial = 'R';とlet kanji = '錆';の2行を追加します。`
      ],
      expectedOutput: "Rustの頭文字はR、漢字では錆"
    },
    {
      id: 16,
      title: "タプル",
      explanation: `<p>タプルは「複数の値を1つにまとめる」最もシンプルな複合型です。丸カッコの中にカンマ区切りで値を並べて作ります。<strong>異なる型を混ぜられる</strong>のが特徴です。</p>
<pre><code>fn main() {
    let profile = ("フェリス", 13); // 文字列と整数の組
    // 方法1：ドット記法（0始まりの番号でアクセス）
    println!("名前: {}", profile.0);
    println!("年齢: {}", profile.1);
}</code></pre>
<p>要素の取り出し方は2通りあります。1つ目は上の例の<code>profile.0</code>のようなドット記法です。番号は0から始まります。</p>
<p>2つ目は「分配束縛（destructuring：まとめた値を一度にバラして変数に束縛すること）」です。</p>
<pre><code>fn main() {
    let profile = ("フェリス", 13);
    // 方法2：分配束縛でそれぞれに名前を付ける
    let (name, age) = profile;
    println!("{}は{}歳です", name, age);
}</code></pre>
<p><code>let (name, age) = profile;</code>と書くと、タプルの1番目が<code>name</code>、2番目が<code>age</code>に一度に束縛されます。番号よりも意味のある名前でアクセスできるため、コードが読みやすくなります。</p>
<p>タプルの使いどころは「一時的に値をセットで持ち運びたいとき」です。たとえば後の章で学ぶ関数から「成功したかどうかと結果の値」のような複数の値を返す場面で活躍します。ただし要素が3つ4つと増えて意味が分かりにくくなってきたら、各要素に名前を付けられる構造体（後の章で学習）への乗り換えを検討するのがRustの流儀です。</p>`,
      task: `タプル<code>profile</code>を分配束縛で変数<code>name</code>と<code>age</code>に分解し、<code>フェリスは13歳です</code>と表示してください。ドット記法の行はそのまま動きます。`,
      code: `fn main() {
    let profile = ("フェリス", 13);

    // TODO: 分配束縛でprofileをnameとageに分解する

    println!("{}は{}歳です", name, age);
    println!("ドット記法でもアクセス: {}", profile.0);
}`,
      solution: `fn main() {
    let profile = ("フェリス", 13);

    let (name, age) = profile;

    println!("{}は{}歳です", name, age);
    println!("ドット記法でもアクセス: {}", profile.0);
}`,
      hints: [
        `分配束縛はletの左側をタプルと同じ形にします。カッコの中に変数名をカンマ区切りで並べます。`,
        `let (name, age) = profile;と書くと、1番目がname、2番目がageに束縛されます。`
      ],
      expectedOutput: "フェリスは13歳です"
    },
    {
      id: 17,
      title: "配列",
      explanation: `<p>配列は「<strong>同じ型</strong>の値を<strong>固定個数</strong>並べる」複合型です。タプルとの違いを整理しましょう。</p>
<table>
<tr><th>観点</th><th>タプル</th><th>配列</th></tr>
<tr><td>要素の型</td><td>バラバラでよい</td><td>すべて同じ</td></tr>
<tr><td>個数</td><td>固定</td><td>固定（あとから増減できない）</td></tr>
<tr><td>アクセス</td><td><code>.0</code>や分配束縛</td><td><code>[インデックス]</code></td></tr>
</table>
<pre><code>fn main() {
    let scores = [80, 92, 75, 60, 88]; // 5教科の点数
    println!("最初の点数: {}", scores[0]); // 0始まり
    println!("3番目の点数: {}", scores[2]);
    println!("科目数: {}", scores.len());  // 要素数は.len()
}</code></pre>
<p>要素へは<code>scores[0]</code>のように角カッコとインデックス（0始まりの番号）でアクセスします。要素数は<code>.len()</code>メソッドで取得できます。型を明示する場合は<code>let scores: [i32; 5] = ...</code>のように「[要素の型; 個数]」と書き、個数まで型の一部になるのがRustの配列の特徴です。</p>
<p>安全性の面でも配列は興味深い存在です。範囲外のインデックス、たとえば<code>scores[10]</code>にアクセスするとどうなるでしょうか。C言語ではメモリの無関係な領域を読んでしまう危険な動作（未定義動作）になりますが、Rustでは実行時にチェックされ「パニック（安全にプログラムを停止する仕組み）」が発生します。不正なメモリアクセスが決して起こらないのです。</p>
<p>なお、実務では個数を増減できる<code>Vec</code>（ベクタ）のほうが出番が多いのですが、これは後の章のお楽しみです。まずは固定長の配列で「同じ型の値の並び」に慣れましょう。</p>`,
      task: `5教科の点数の配列から、インデックスで最初（<code>scores[0]</code>）と最後（<code>scores[4]</code>）の点数を取り出し、さらに<code>.len()</code>で<code>科目数: 5</code>と表示してください。`,
      code: `fn main() {
    let scores = [80, 92, 75, 60, 88];

    // TODO: インデックスで最初の点数（80）を表示する
    println!("最初の点数: {}", 0);

    // TODO: インデックスで最後の点数（88）を表示する
    println!("最後の点数: {}", 0);

    // TODO: .len()で科目数を表示する
    println!("科目数: {}", 0);
}`,
      solution: `fn main() {
    let scores = [80, 92, 75, 60, 88];

    println!("最初の点数: {}", scores[0]);

    println!("最後の点数: {}", scores[4]);

    println!("科目数: {}", scores.len());
}`,
      hints: [
        `インデックスは0から始まるので、5個の要素の最後は4番です。`,
        `scores[0]、scores[4]、scores.len()の3つをそれぞれprintln!の引数に渡します。`
      ],
      expectedOutput: "科目数: 5"
    },
    {
      id: 18,
      title: "型変換as",
      explanation: `<p>ステップ13で学んだとおり、Rustは異なる型同士の演算を許しません。では整数と小数を混ぜて計算したいときはどうするのでしょうか。答えが<code>as</code>キーワードによる明示的な型変換（キャスト）です。</p>
<pre><code>fn main() {
    let total: i32 = 7;
    let people: i32 = 2;
    // as f64でi32をf64に変換してから割り算する
    let average = total as f64 / people as f64;
    println!("1人あたり{}個", average); // 3.5
}</code></pre>
<p><code>値 as 型</code>と書くと、その場で型を変換した値が得られます。整数からf64への変換は値がそのまま保たれる安全な方向です。一方、逆方向には注意が必要です。</p>
<pre><code>fn main() {
    let pi = 3.9;
    let truncated = pi as i32;
    println!("{}", truncated); // 3（四捨五入ではなく切り捨て！）
}</code></pre>
<p><code>as</code>による変換の注意点をまとめます。</p>
<ul>
<li><strong>小数→整数</strong>：小数部分は切り捨て（3.9→3、-3.9→-3）。四捨五入ではない</li>
<li><strong>大きい型→小さい型</strong>：収まらない場合、上位ビットが切り落とされ値が変わる（例：<code>300 as u8</code>は44になる）</li>
<li><strong>暗黙変換は一切ない</strong>：変換はすべて<code>as</code>などで明示する</li>
</ul>
<p>「変換で情報が失われる可能性がある操作は、プログラマが書いて明示する」というのがRustの一貫した思想です。コードを読む人は<code>as</code>を見た瞬間に「ここで型が変わる、値が変わるかもしれない」と分かります。この明示性が、暗黙変換由来の不可解なバグからコードを守ってくれます。</p>`,
      task: `このコードは整数除算のため<code>1人あたり3個</code>と表示されてしまいます。<code>as f64</code>を使って割り算を浮動小数点で行い、<code>1人あたり3.5個</code>と表示させてください。`,
      code: `fn main() {
    let total: i32 = 7;
    let people: i32 = 2;

    // TODO: as f64を使って浮動小数点の割り算に変える
    let average = total / people;
    println!("1人あたり{}個", average);

    let pi = 3.9;
    let truncated = pi as i32;
    println!("3.9をi32にすると{}", truncated);
}`,
      solution: `fn main() {
    let total: i32 = 7;
    let people: i32 = 2;

    let average = total as f64 / people as f64;
    println!("1人あたり{}個", average);

    let pi = 3.9;
    let truncated = pi as i32;
    println!("3.9をi32にすると{}", truncated);
}`,
      hints: [
        `割り算の前に、両方の値をf64に変換する必要があります。変換は「値 as 型」の形です。`,
        `total as f64 / people as f64と書きます。片方だけの変換では型が揃わずコンパイルエラーになります。`
      ],
      expectedOutput: "1人あたり3.5個"
    },
    {
      id: 19,
      title: "オーバーフローと型の限界（i32::MAX、checked_add）",
      explanation: `<p>整数型には表現できる値の限界があります。限界値は型に組み込まれた定数で確認できます。</p>
<pre><code>fn main() {
    println!("{}", i32::MAX); // 2147483647（約21億）
    println!("{}", i32::MIN); // -2147483648
    println!("{}", u8::MAX);  // 255
}</code></pre>
<p>限界を超える計算をすると「オーバーフロー（桁あふれ）」が起こります。Rustの動作は実行モードで異なります。</p>
<table>
<tr><th>ビルドモード</th><th>オーバーフロー時の動作</th></tr>
<tr><td>デバッグビルド（開発時）</td><td>パニックして即停止（バグに早く気づける）</td></tr>
<tr><td>リリースビルド（本番用）</td><td>ラップアラウンド（MAXの次はMINに一周する）</td></tr>
</table>
<p>「気づかず一周した値」は深刻なバグや脆弱性の温床です。そこでRustは安全に計算する手段を用意しています。代表が<code>checked_add</code>で、結果を<code>Option</code>という「値があるかもしれないし、ないかもしれない」ことを表す型で返します。成功なら<code>Some(結果)</code>、オーバーフローなら<code>None</code>です。</p>
<pre><code>fn main() {
    let max = i32::MAX;
    let a = max.checked_add(1); // あふれる → None
    let b = 100i32.checked_add(1); // 成功 → Some(101)
    println!("{:?} {:?}", a, b);
}</code></pre>
<p><code>{:?}</code>は「デバッグ表示」という書式指定で、<code>Option</code>のように<code>{}</code>では表示できない型の中身を確認できます。<code>100i32</code>は「i32型の100」を表すサフィックス（型の後ろ書き）付きリテラルです。Optionの本格的な使い方（中身の取り出し方）は後の章で学びます。ここでは「Rustは危険な計算を型で教えてくれる」ことを体感しましょう。他にも<code>checked_mul</code>（掛け算）、<code>saturating_add</code>（限界で止める加算）などの仲間がいます。</p>`,
      task: `<code>i32::MAX</code>を表示したあと、<code>checked_add(1)</code>を使って安全に足し算を試み、結果を<code>{:?}</code>で表示してください。<code>max + 1 の結果: None</code>と表示されれば成功です。`,
      code: `fn main() {
    let max = i32::MAX;
    println!("i32の最大値: {}", max);

    // TODO: max.checked_add(1)の結果を変数safeに束縛する

    // TODO: {:?}を使って「max + 1 の結果: None」と表示する
    println!("max + 1 の結果: ");

    let ok = 100i32.checked_add(1);
    println!("100 + 1 の結果: {:?}", ok);
}`,
      solution: `fn main() {
    let max = i32::MAX;
    println!("i32の最大値: {}", max);

    let safe = max.checked_add(1);

    println!("max + 1 の結果: {:?}", safe);

    let ok = 100i32.checked_add(1);
    println!("100 + 1 の結果: {:?}", ok);
}`,
      hints: [
        `checked_addは値のメソッドとしてmax.checked_add(1)の形で呼び出します。結果はOptionなので{}では表示できません。`,
        `let safe = max.checked_add(1);と束縛し、println!("max + 1 の結果: {:?}", safe);で表示します。下のokの行が書き方の見本です。`
      ],
      expectedOutput: "max + 1 の結果: None"
    },
    {
      id: 20,
      title: "総合演習：BMI計算機",
      explanation: `<p>第2章の総仕上げとして、BMI（体格指数）を計算するプログラムを作ります。BMIは「体重(kg) ÷ 身長(m)の2乗」で求められる健康指標で、18.5以上25.0未満が標準範囲とされています。この演習で使う知識を確認しましょう。</p>
<table>
<tr><th>ステップ</th><th>学んだこと</th><th>この演習での使いどころ</th></tr>
<tr><td>11</td><td>整数型</td><td>身長をcm単位の整数で受け取る</td></tr>
<tr><td>12</td><td>f64と{:.1}</td><td>BMIの計算と小数第1位表示</td></tr>
<tr><td>13</td><td>整数除算の罠</td><td>cm→mの変換で罠を回避</td></tr>
<tr><td>14</td><td>boolと比較・論理演算子</td><td>標準範囲かどうかの判定</td></tr>
<tr><td>18</td><td>as変換</td><td>整数の身長をf64に変換</td></tr>
</table>
<p>処理の流れは次のとおりです。</p>
<ol>
<li>身長170cm（整数）を<code>as f64</code>でf64に変換し、100.0で割ってメートルにする</li>
<li>体重60.0kgを身長(m)の2乗で割ってBMIを求める</li>
<li><code>{:.1}</code>で小数第1位まで表示する</li>
<li>比較演算子と<code>&amp;&amp;</code>で「18.5以上かつ25.0未満」を判定してboolで表示する</li>
</ol>
<p>特に注意したいのが手順1です。<code>height_cm / 100</code>と整数のまま割ると170/100＝1（切り捨て）になり、BMIが大きく狂います。「単位変換では整数除算の罠に気をつける」——これは実務のコードレビューでも定番の指摘ポイントです。</p>
<pre><code>// 判定式のイメージ（18.5以上かつ25.0未満）
let is_standard = 18.5 &lt;= bmi &amp;&amp; bmi &lt; 25.0;</code></pre>
<p>計算・変換・判定・整形出力という「小さくても完結したプログラム」の型を、ここで一度自分の手で組み上げてみましょう。</p>`,
      task: `TODOの3か所を埋めてBMI計算機を完成させてください。cm→m変換（<code>as f64</code>と100.0で割る）、BMI計算、標準範囲（18.5以上25.0未満）の判定です。<code>BMI: 20.8</code>と表示されれば成功です。`,
      code: `fn main() {
    let weight = 60.0;
    let height_cm = 170;

    // TODO: height_cmをf64に変換し、100.0で割ってメートルにする
    let height_m = 0.0;

    // TODO: BMI（weight ÷ height_mの2乗）を計算する
    let bmi = 0.0;

    println!("身長: {}cm", height_cm);
    println!("体重: {}kg", weight);
    println!("BMI: {:.1}", bmi);

    // TODO: 18.5以上かつ25.0未満かどうかを判定する
    let is_standard = false;
    println!("標準体重の範囲内: {}", is_standard);
}`,
      solution: `fn main() {
    let weight = 60.0;
    let height_cm = 170;

    let height_m = height_cm as f64 / 100.0;

    let bmi = weight / (height_m * height_m);

    println!("身長: {}cm", height_cm);
    println!("体重: {}kg", weight);
    println!("BMI: {:.1}", bmi);

    let is_standard = 18.5 <= bmi && bmi < 25.0;
    println!("標準体重の範囲内: {}", is_standard);
}`,
      hints: [
        `cm→m変換はheight_cm as f64 / 100.0です。整数のまま100で割ると切り捨てで1になってしまいます。`,
        `BMIはweight / (height_m * height_m)で計算します。カッコで2乗のまとまりを明確にしましょう。`,
        `判定は18.5 <= bmi && bmi < 25.0です。「以上」は<=、「未満」は<、「かつ」は&&を使います。`
      ],
      expectedOutput: "BMI: 20.8"
    }
  ]
});
