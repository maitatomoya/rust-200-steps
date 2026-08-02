// 第23章：よくあるエラー：match・Option・Result
registerChapter({
  number: 23,
  title: "よくあるエラー：match・Option・Result",
  description: "matchの網羅漏れ、unwrapによるパニック、?演算子の誤用など、値の分岐と失敗処理まわりで頻出するエラーを実際に起こし、メッセージを読んで修正する訓練をします。",
  steps: [
    {
      id: 221,
      title: "E0004：matchの網羅漏れ（non-exhaustive patterns）",
      explanation: `<p>この章では、match・Option・Resultまわりで実際によく遭遇するエラーを1つずつ起こし、コンパイラのメッセージを読み解いて修正する訓練をします。最初はmatchの網羅漏れです。次のようなエラーが出ます。</p>
<pre><code>error[E0004]: non-exhaustive patterns: \`&amp;Signal::Green\` not covered
 --&gt; src/main.rs:9:11
  |
9 |     match signal {
  |           ^^^^^^ pattern \`&amp;Signal::Green\` not covered
  |
help: ensure that all possible cases are being handled by adding a match arm
      with a wildcard pattern or an explicit pattern</code></pre>
<p>読み方のポイントは3つあります。</p>
<ul>
<li><strong>エラー番号</strong>：<code>error[E0004]</code>の角括弧内が番号です。ターミナルで<code>rustc --explain E0004</code>と打つと公式の詳細解説が読めます</li>
<li><strong>1行目の要約</strong>：「non-exhaustive patterns（網羅的でないパターン）」が原因、「<code>&amp;Signal::Green</code> not covered」が足りないパターンです</li>
<li><strong>help行</strong>：修正方法の提案です。「明示的なパターンか、ワイルドカードのアームを追加せよ」と書いてあります</li>
</ul>
<p>Rustのmatchは<strong>すべての可能性を扱わないとコンパイルエラー</strong>になります（網羅性チェック）。これはバグではなく安全機構で、enumにバリアントを追加したとき処理漏れをコンパイラが必ず検出してくれます。修正は「足りないアームを追加する」が基本です。<code>_ =&gt; ...</code>（ワイルドカード）でも通りますが、将来バリアントを追加したときに検知できなくなるため、バリアント数が少ないうちは明示的に列挙するのがおすすめです。</p>`,
      task: `コンパイルして<code>error[E0004]</code>を確認し、足りない<code>Signal::Green</code>のアームを追加して「進め」を返すようにしてください。`,
      code: `enum Signal {
    Red,
    Yellow,
    Green,
}

fn action(signal: &Signal) -> &str {
    // このmatchはGreenを扱っていないためE0004になる
    match signal {
        Signal::Red => "止まれ",
        Signal::Yellow => "注意",
    }
}

fn main() {
    let signals = [Signal::Red, Signal::Yellow, Signal::Green];
    for s in &signals {
        println!("{}", action(s));
    }
}
`,
      solution: `enum Signal {
    Red,
    Yellow,
    Green,
}

fn action(signal: &Signal) -> &str {
    match signal {
        Signal::Red => "止まれ",
        Signal::Yellow => "注意",
        Signal::Green => "進め",
    }
}

fn main() {
    let signals = [Signal::Red, Signal::Yellow, Signal::Green];
    for s in &signals {
        println!("{}", action(s));
    }
}
`,
      hints: [
        `エラーメッセージの「not covered」の後ろに、扱われていないパターンがそのまま書かれています。`,
        `matchに<code>Signal::Green => "進め",</code>のアームを追加します。`
      ],
      expectedOutput: "進め"
    },
    {
      id: 222,
      title: "unwrapによるパニック（Noneの取り出し）",
      explanation: `<p>今度はコンパイルは通るのに<strong>実行時に落ちる</strong>エラー、パニックです。<code>Option</code>が<code>None</code>のときに<code>unwrap</code>を呼ぶと次のように表示されてプログラムが強制終了します。</p>
<pre><code>thread 'main' panicked at src/main.rs:13:33:
called \`Option::unwrap()\` on a \`None\` value
note: run with \`RUST_BACKTRACE=1\` environment variable to display a backtrace</code></pre>
<p>読み方のポイントです。</p>
<ul>
<li><code>panicked at src/main.rs:13:33</code>：<strong>ファイル名:行:桁</strong>でパニックの発生位置が分かります。まずこの行を見に行きます</li>
<li><code>called Option::unwrap() on a None value</code>：原因の説明。「Noneに対してunwrapを呼んだ」</li>
<li><code>RUST_BACKTRACE=1</code>：環境変数を付けて再実行すると、呼び出し履歴（バックトレース）が見られます</li>
</ul>
<p><code>unwrap</code>は「中身があるはず」という楽観の表明で、外れると即パニックします。安全な代替手段を整理しましょう。</p>
<table>
<tr><th>書き方</th><th>Noneのときの挙動</th></tr>
<tr><td><code>match</code> / <code>if let</code></td><td>None用の処理を自分で書ける（最も丁寧）</td></tr>
<tr><td><code>unwrap_or(既定値)</code></td><td>既定値を返す</td></tr>
<tr><td><code>expect("説明")</code></td><td>パニックするが、自分の書いた説明が表示される</td></tr>
</table>
<p>「絶対にNoneにならない」と論理的に言い切れる場面以外では、matchや<code>unwrap_or</code>で明示的に処理するのが原則です。</p>`,
      task: `実行してパニックメッセージを確認し、<code>unwrap</code>をやめて<code>match</code>でSomeとNoneを処理してください。Noneのときは「偶数は見つかりませんでした」と表示します。`,
      code: `fn find_even(numbers: &[i32]) -> Option<i32> {
    for &n in numbers {
        if n % 2 == 0 {
            return Some(n);
        }
    }
    None
}

fn main() {
    let odds = [1, 3, 5];
    // 偶数が無いのでNoneが返り、unwrapで実行時パニックする
    let even = find_even(&odds).unwrap();
    println!("最初の偶数: {}", even);
}
`,
      solution: `fn find_even(numbers: &[i32]) -> Option<i32> {
    for &n in numbers {
        if n % 2 == 0 {
            return Some(n);
        }
    }
    None
}

fn main() {
    let odds = [1, 3, 5];
    match find_even(&odds) {
        Some(n) => println!("最初の偶数: {}", n),
        None => println!("偶数は見つかりませんでした"),
    }
}
`,
      hints: [
        `パニックメッセージの「src/main.rs:行:桁」が示す場所に、unwrapの呼び出しがあります。`,
        `<code>match find_even(&odds) { Some(n) => ..., None => ... }</code>の形に書き換えます。`
      ],
      expectedOutput: "偶数は見つかりませんでした"
    },
    {
      id: 223,
      title: "添字の範囲外アクセス（index out of bounds）",
      explanation: `<p>配列やVecに存在しない添字でアクセスすると、実行時パニックになります。</p>
<pre><code>thread 'main' panicked at src/main.rs:4:22:
index out of bounds: the len is 3 but the index is 3</code></pre>
<p>メッセージが非常に親切で、「<strong>the len is 3 but the index is 3</strong>（長さは3なのに添字が3）」と原因がそのまま書かれています。添字は0から始まるので、長さ3のVecで有効なのは<code>0, 1, 2</code>まで。<code>scores[3]</code>は4番目の要素を指すため範囲外です。この「長さと添字を混同する」ミスはoff-by-oneエラー（1つずれの間違い）と呼ばれ、あらゆる言語で頻出します。ちなみに固定長配列を定数の添字で範囲外アクセスした場合は、コンパイラが「this operation will panic at runtime」というエラーでコンパイル時に検出してくれますが、Vecや実行時に決まる添字ではこのように実行時まで分かりません。</p>
<p>修正パターンは3つあります。</p>
<ul>
<li><strong>正しい添字に直す</strong>：最後の要素なら<code>scores[scores.len() - 1]</code></li>
<li><strong><code>get</code>を使う</strong>：<code>scores.get(3)</code>は<code>Option&lt;&amp;i32&gt;</code>を返し、範囲外なら<code>None</code>。パニックせず安全に扱えます</li>
<li><strong><code>last</code>を使う</strong>：最後の要素専用。空のときは<code>None</code></li>
</ul>
<pre><code>match scores.get(3) {
    Some(v) =&gt; println!("得点: {}", v),
    None =&gt; println!("その番号の得点はありません"),
}</code></pre>
<p><code>[i]</code>の直接アクセスは「範囲内であることが文脈上明らか」なとき（forループの範囲内など）に限り、外部データ由来の添字には<code>get</code>を使うのが実務の定石です。</p>`,
      task: `実行してパニックを確認し、<code>scores[3]</code>を<code>get(3)</code>と<code>match</code>による安全なアクセスに書き換え、さらに<code>last()</code>で最後の得点を表示してください。`,
      code: `fn main() {
    let scores = vec![70, 85, 92];
    // 長さ3のVecに添字3でアクセスして実行時パニックする
    let value = scores[3];
    println!("得点: {}", value);
}
`,
      solution: `fn main() {
    let scores = vec![70, 85, 92];
    match scores.get(3) {
        Some(v) => println!("得点: {}", v),
        None => println!("その番号の得点はありません"),
    }
    if let Some(last) = scores.last() {
        println!("最後の得点: {}", last);
    }
}
`,
      hints: [
        `メッセージの「the len is 3 but the index is 3」が全てです。長さ3の配列の有効な添字は0〜2です。`,
        `<code>scores.get(3)</code>はOptionを返すのでmatchで受けます。最後の要素は<code>scores.last()</code>で取れます。`
      ],
      expectedOutput: "最後の得点: 92"
    },
    {
      id: 224,
      title: "E0308：matchアームの型不一致",
      explanation: `<p>matchは値を返す「式」なので、<strong>すべてのアームが同じ型を返す</strong>必要があります。型が混ざると次のエラーになります。</p>
<pre><code>error[E0308]: \`match\` arms have incompatible types
 --&gt; src/main.rs:6:16
  |
4 |       let message = match code {
5 |           200 =&gt; "OK",
  |                  ---- this is found to be of type \`&amp;str\`
6 |           404 =&gt; String::from("Not Found"),
  |                  ^^^^^^^^^^^^^^^^^^^^^^^^^ expected \`&amp;str\`, found \`String\`</code></pre>
<p>E0308はRustで最も頻繁に見る「型不一致（mismatched types）」の番号です。読み方のポイントは、コンパイラが<strong>期待した型（expected）と実際の型（found）を必ず対で教えてくれる</strong>ことです。ここでは最初のアーム<code>"OK"</code>から「このmatchは<code>&amp;str</code>を返す」と推論されたのに、次のアームが<code>String</code>を返したため衝突しています。下線と注釈で「どのアームが基準で、どのアームが違反したか」も示されています。</p>
<p>修正はどちらかに統一するだけです。</p>
<table>
<tr><th>方針</th><th>書き方</th><th>向いている場面</th></tr>
<tr><td>全部<code>&amp;str</code></td><td>文字列リテラルのまま</td><td>固定の文言を返すだけのとき</td></tr>
<tr><td>全部<code>String</code></td><td>各アームを<code>String::from(...)</code>や<code>format!(...)</code>に</td><td>動的に文字列を組み立てるアームがあるとき</td></tr>
</table>
<p>今回はすべて固定文言なので、<code>&amp;str</code>に統一するのが最も簡単です。</p>`,
      task: `コンパイルして<code>error[E0308]</code>のexpectedとfoundを読み、すべてのアームが<code>&amp;str</code>を返すように統一してください。`,
      code: `fn main() {
    let code = 404;
    // アームの型が&strとStringで混ざっているためE0308になる
    let message = match code {
        200 => "OK",
        404 => String::from("Not Found"),
        _ => "Unknown",
    };
    println!("{}", message);
}
`,
      solution: `fn main() {
    let code = 404;
    let message = match code {
        200 => "OK",
        404 => "Not Found",
        _ => "Unknown",
    };
    println!("{}", message);
}
`,
      hints: [
        `「expected &str, found String」は「&strのはずがStringだった」という意味です。基準は最初のアームの型です。`,
        `<code>String::from("Not Found")</code>を文字列リテラル<code>"Not Found"</code>に変えれば全アームが&strにそろいます。`
      ],
      expectedOutput: "Not Found"
    },
    {
      id: 225,
      title: "E0277：?演算子をResultを返さない関数で使う",
      explanation: `<p><code>?</code>演算子は「Errなら即座に呼び出し元へ返す」便利な記法ですが、<strong>ResultかOptionを返す関数の中でしか使えません</strong>。戻り値が<code>()</code>のmainで使うとこうなります。</p>
<pre><code>error[E0277]: the \`?\` operator can only be used in a function that returns
\`Result\` or \`Option\` (or another type that implements \`FromResidual\`)
 --&gt; src/main.rs:2:30
  |
1 | fn main() {
  | --------- this function should return \`Result\` or \`Option\` to accept \`?\`
2 |     let n: i32 = "42".parse()?;
  |                              ^ cannot use the \`?\` operator in a function
  |                                that returns \`()\`</code></pre>
<p>1行目が理由の全てで、さらに<code>fn main()</code>への注釈が「この関数がResultかOptionを返すべき」と修正先まで指しています。<code>?</code>はErrのとき<code>return Err(...)</code>を自動で行う糖衣構文（短縮記法）なので、返す先の型がResultでないと成立しない、と考えると腑に落ちます。</p>
<p>修正パターンは2つです。</p>
<ul>
<li><strong>mainの戻り値をResultにする</strong>：実は<code>fn main() -> Result&lt;(), E&gt;</code>と書けます。最後に<code>Ok(())</code>を返すのを忘れずに。Errで終わるとエラー表示とともに異常終了コードで終了します</li>
<li><strong>?を使う処理を別関数に切り出す</strong>：<code>fn run() -> Result&lt;(), E&gt;</code>を作り、mainからはmatchで結果を処理する</li>
</ul>
<pre><code>fn main() -&gt; Result&lt;(), std::num::ParseIntError&gt; {
    let n: i32 = "42".parse()?;
    Ok(())
}</code></pre>`,
      task: `コンパイルしてエラーを確認し、<code>main</code>の戻り値を<code>Result&lt;(), std::num::ParseIntError&gt;</code>に変えて<code>?</code>を使えるようにしてください。最後の<code>Ok(())</code>を忘れずに。`,
      code: `fn main() {
    // mainの戻り値が()なので?が使えずE0277になる
    let n: i32 = "42".parse()?;
    println!("n = {}", n);
}
`,
      solution: `use std::num::ParseIntError;

fn main() -> Result<(), ParseIntError> {
    let n: i32 = "42".parse()?;
    println!("n = {}", n);
    Ok(())
}
`,
      hints: [
        `エラー中の「this function should return Result or Option to accept ?」が修正方針そのものです。`,
        `<code>fn main() -> Result&lt;(), std::num::ParseIntError&gt;</code>とし、本体の最後に<code>Ok(())</code>を置きます。`
      ],
      expectedOutput: "n = 42"
    },
    {
      id: 226,
      title: "parseの失敗処理忘れ（ParseIntError）",
      explanation: `<p>文字列から数値への変換<code>parse</code>は<code>Result</code>を返します。変換できない文字列に<code>unwrap</code>を重ねると実行時パニックです。</p>
<pre><code>thread 'main' panicked at src/main.rs:4:36:
called \`Result::unwrap()\` on an \`Err\` value: ParseIntError { kind: InvalidDigit }</code></pre>
<p>前のステップのOptionと違い、Resultのパニックには<strong>Errの中身がそのまま表示される</strong>のが重要な違いです。<code>ParseIntError { kind: InvalidDigit }</code>から「整数のパース失敗、原因は不正な文字」まで読み取れます。<code>"3年A組"</code>のように数字以外を含む文字列は<code>i32</code>に変換できません。</p>
<p>ここで思い出したいのが<code>parse::&lt;i32&gt;()</code>のターボフィッシュ記法（<code>::&lt;型&gt;</code>で型引数を明示する書き方）です。parseは「どの型へ変換するか」を知る必要があり、変数の型注釈かターボフィッシュのどちらかで伝えます。そして失敗時の処理はmatchで書くのが基本形です。</p>
<pre><code>match input.parse::&lt;i32&gt;() {
    Ok(grade) =&gt; println!("学年: {}", grade),
    Err(e) =&gt; println!("数値に変換できません: {}", e),
}</code></pre>
<p><code>Err(e)</code>の<code>e</code>を<code>{}</code>で表示すると「invalid digit found in string」のような人間向けの説明になります。ユーザー入力や外部データのparseは必ず失敗し得るので、unwrapではなくmatchや<code>unwrap_or</code>系で受けるのが実務の鉄則です。</p>`,
      task: `実行してパニックメッセージの<code>Err</code>の中身を確認し、<code>match</code>でOkとErrを処理してください。Errのときは「数値に変換できません: 」に続けてエラー内容を表示します。`,
      code: `fn main() {
    let input = "3年A組";
    // 数字以外を含む文字列のparseはErrを返し、unwrapでパニックする
    let grade: i32 = input.parse().unwrap();
    println!("学年: {}", grade);
}
`,
      solution: `fn main() {
    let input = "3年A組";
    match input.parse::<i32>() {
        Ok(grade) => println!("学年: {}", grade),
        Err(e) => println!("数値に変換できません: {}", e),
    }
}
`,
      hints: [
        `パニックメッセージのErr値「ParseIntError { kind: InvalidDigit }」が失敗の種類を教えてくれています。`,
        `<code>input.parse::&lt;i32&gt;()</code>をmatchで受け、<code>Ok(grade)</code>と<code>Err(e)</code>の2アームを書きます。`
      ],
      expectedOutput: "数値に変換できません"
    },
    {
      id: 227,
      title: "ゼロ除算パニック（attempt to divide by zero）",
      explanation: `<p>整数をゼロで割ると実行時パニックになります。</p>
<pre><code>thread 'main' panicked at src/main.rs:7:41:
attempt to divide by zero</code></pre>
<p>メッセージは一目瞭然ですが、注意すべき点が2つあります。</p>
<ul>
<li><strong>パニックするのは整数除算だけ</strong>です。<code>f64</code>など浮動小数点の除算は<code>inf</code>や<code>NaN</code>になり、パニックしません（それはそれで別のバグの温床になります）</li>
<li>割る数がリテラルの<code>0</code>だとコンパイル時に検出されることもありますが、<strong>実行時に計算された値が0になるケース</strong>（今回のような「件数で割る」処理）はコンパイラには防げません</li>
</ul>
<p>「合計÷件数で平均を出す」処理は、<strong>件数が0件</strong>になり得る典型例です。修正パターンは2つあります。</p>
<table>
<tr><th>パターン</th><th>書き方</th></tr>
<tr><td>事前チェック</td><td><code>if count == 0</code>で分岐してから割る</td></tr>
<tr><td><code>checked_div</code></td><td><code>total.checked_div(count)</code>が<code>Option</code>を返す。0除算なら<code>None</code></td></tr>
</table>
<pre><code>match total.checked_div(count) {
    Some(avg) =&gt; println!("平均: {}", avg),
    None =&gt; println!("件数が0件です"),
}</code></pre>
<p>この章で学んできた「失敗し得る計算はOptionで受ける」という考え方が、除算にもそのまま適用できるわけです。</p>`,
      task: `実行してパニックを確認し、割る前に<code>count == 0</code>をチェックして、0件のときは「該当者がいないため平均は計算できません」と表示するように直してください。`,
      code: `fn main() {
    let scores: [i32; 3] = [80, 90, 70];
    // 95点以上の得点だけを集める（今回は0件になる）
    let passing: Vec<i32> = scores.iter().filter(|&&s| s >= 95).copied().collect();
    let total: i32 = passing.iter().sum();
    let count = passing.len() as i32;
    // countが0なのでゼロ除算の実行時パニックになる
    println!("95点以上の平均: {}", total / count);
}
`,
      solution: `fn main() {
    let scores: [i32; 3] = [80, 90, 70];
    // 95点以上の得点だけを集める（今回は0件になる）
    let passing: Vec<i32> = scores.iter().filter(|&&s| s >= 95).copied().collect();
    let total: i32 = passing.iter().sum();
    let count = passing.len() as i32;
    if count == 0 {
        println!("該当者がいないため平均は計算できません");
    } else {
        println!("95点以上の平均: {}", total / count);
    }
}
`,
      hints: [
        `パニック位置は割り算の行です。割る数countが実行時に0になっています。`,
        `<code>if count == 0 { ... } else { ... }</code>で分岐するか、<code>total.checked_div(count)</code>をmatchで受けます。`
      ],
      expectedOutput: "該当者がいないため平均は計算できません"
    },
    {
      id: 228,
      title: "E0425：if letで束縛した変数のスコープミス",
      explanation: `<p><code>if let</code>で取り出した変数をブロックの外で使おうとすると、「そんな変数は無い」と怒られます。</p>
<pre><code>error[E0425]: cannot find value \`port\` in this scope
 --&gt; src/main.rs:8:22
  |
8 |     println!("ポート: {}", port);
  |                            ^^^^ not found in this scope</code></pre>
<p>E0425は「名前が見つからない」エラーで、typo（打ち間違い）でも出ますが、今回は<strong>スコープ（変数が有効な範囲）の問題</strong>です。<code>if let Some(port) = config</code>で束縛された<code>port</code>が使えるのは、<strong>その直後の<code>{ }</code>ブロックの中だけ</strong>。ブロックを抜けた時点で<code>port</code>は消えます。「Someだったときにだけ存在する値」なので、外で無条件に使えないのは論理的にも当然です。</p>
<p>修正パターンを整理します。</p>
<ul>
<li><strong>使う処理をブロック内に移す</strong>：最も基本。<code>else</code>でNoneの場合の処理も書ける</li>
<li><strong><code>let-else</code>を使う</strong>：<code>let Some(port) = config else { return; };</code>と書くと、None時に早期リターンし、以降は<code>port</code>を裸の値として使える（取り出しに成功した前提でコードを平らに書ける記法）</li>
<li><strong><code>unwrap_or</code>で既定値を与える</strong>：<code>config.unwrap_or(3000)</code></li>
</ul>
<pre><code>if let Some(port) = config {
    println!("ポート: {}", port);
} else {
    println!("ポート設定がありません");
}</code></pre>`,
      task: `コンパイルして<code>error[E0425]</code>を確認し、<code>port</code>を使う処理を<code>if let</code>のブロック内に移動してください。<code>else</code>で「ポート設定がありません」も表示できるようにします。`,
      code: `fn main() {
    let config: Option<i32> = Some(8080);
    if let Some(port) = config {
        println!("設定を読み込みました");
    }
    // portはif letのブロック内でしか使えないためE0425になる
    println!("ポート: {}", port);
}
`,
      solution: `fn main() {
    let config: Option<i32> = Some(8080);
    if let Some(port) = config {
        println!("設定を読み込みました");
        println!("ポート: {}", port);
    } else {
        println!("ポート設定がありません");
    }
}
`,
      hints: [
        `変数portが有効なのは、if letの直後の波括弧の中だけです。`,
        `2つ目のprintln!をブロックの中に移動し、else節でNoneの場合のメッセージを表示します。`
      ],
      expectedOutput: "ポート: 8080"
    },
    {
      id: 229,
      title: "E0369：Optionのまま演算しようとする",
      explanation: `<p><code>Option&lt;i32&gt;</code>を普通の<code>i32</code>のつもりで足し算すると、演算子が使えないというエラーになります。</p>
<pre><code>error[E0369]: cannot add \`{integer}\` to \`Option&lt;i32&gt;\`
 --&gt; src/main.rs:5:23
  |
5 |     let total = stock + incoming;
  |                 ----- ^ -------- {integer}
  |                 |
  |                 Option&lt;i32&gt;
  |
note: the trait \`Add&lt;{integer}&gt;\` is not implemented for \`Option&lt;i32&gt;\`</code></pre>
<p>E0369は「その型にその演算子は適用できない」エラーです。下線の注釈で<strong>左辺が<code>Option&lt;i32&gt;</code>、右辺が整数</strong>と型を教えてくれています。<code>{integer}</code>は「まだ具体的な型が確定していない整数リテラル」を表すコンパイラの表記です。</p>
<p>原因は、<code>Option&lt;i32&gt;</code>が「i32が入っているかもしれない箱」であって、i32そのものではないことです。箱のまま足し算はできないので、<strong>先に中身を取り出す</strong>必要があります。取り出し方は状況で選びます。</p>
<table>
<tr><th>書き方</th><th>意味</th></tr>
<tr><td><code>stock.unwrap_or(0) + incoming</code></td><td>Noneなら0とみなして足す</td></tr>
<tr><td><code>stock.map(|n| n + incoming)</code></td><td>中身があるときだけ足し、結果もOptionのまま保つ</td></tr>
<tr><td><code>match</code>で分岐</td><td>Someのときの計算とNoneのときの扱いを個別に書く</td></tr>
</table>
<p>「Optionを外してよい境界はどこか」を意識し、計算の途中ではmapでOptionのまま運び、表示や集計の直前で取り出すのがきれいな設計です。</p>`,
      task: `コンパイルしてエラーの型注釈を読み、<code>unwrap_or(0)</code>で中身を取り出してから足し算するように直してください。`,
      code: `fn main() {
    let stock: Option<i32> = Some(10);
    let incoming = 5;
    // Option<i32>とi32はそのままでは足せないためE0369になる
    let total = stock + incoming;
    println!("在庫合計: {}", total);
}
`,
      solution: `fn main() {
    let stock: Option<i32> = Some(10);
    let incoming = 5;
    let total = stock.unwrap_or(0) + incoming;
    println!("在庫合計: {}", total);
}
`,
      hints: [
        `エラーの下線注釈を見ると、左辺がOption&lt;i32&gt;のままであることが分かります。足す前に中身のi32を取り出す必要があります。`,
        `<code>stock.unwrap_or(0)</code>は、Someなら中身を、Noneなら0を返します。`
      ],
      expectedOutput: "在庫合計: 15"
    },
    {
      id: 230,
      title: "総合演習：安全なエラー処理に書き直す",
      explanation: `<p>この章の総仕上げです。unwrap頼みで書かれた「動くこともあるが、すぐ落ちる」プログラムを、パニックしない安全な形に書き直します。今回のコードには、この章で学んだ落とし穴が3つ仕込まれています。</p>
<table>
<tr><th>落とし穴</th><th>学んだステップ</th><th>安全な書き方</th></tr>
<tr><td>parseの結果をunwrap</td><td>222・226</td><td>matchでErrを処理（不正データはスキップ）</td></tr>
<tr><td>0件のままの除算</td><td>227</td><td>割る前に<code>is_empty</code>で件数チェック</td></tr>
<tr><td>範囲外の添字アクセス</td><td>223</td><td><code>get</code>でOptionとして受ける</td></tr>
</table>
<p>実務のデータ処理では「一部のデータが壊れている」のは日常茶飯事です。1件の不正データで全体をパニックさせるのではなく、<strong>不正な行は報告してスキップし、有効なデータだけで処理を続行する</strong>のが堅牢な設計です。</p>
<pre><code>for s in &amp;inputs {
    match s.parse::&lt;i32&gt;() {
        Ok(n) =&gt; scores.push(n),
        Err(_) =&gt; println!("{} は数値ではないのでスキップします", s),
    }
}</code></pre>
<p><code>Err(_)</code>のアンダースコアは「エラーの中身は使わない」という明示です。エラー処理の設計は「落とすか、既定値で続けるか、スキップして報告するか」の選択の連続であり、その選択肢を型（OptionとResult）が強制的に意識させてくれるのがRustの強みです。3箇所すべてを直して、どんな入力でも落ちないプログラムを完成させましょう。</p>`,
      task: `3つのパニック要因（parseのunwrap・0件除算の可能性・添字3への直接アクセス）をすべて安全な書き方に直してください。不正な入力は「〜 は数値ではないのでスキップします」と報告し、4件目が無いときは「4件目のデータはありません」と表示します。`,
      code: `fn main() {
    let inputs = ["80", "abc", "90"];
    let mut scores = Vec::new();
    for s in &inputs {
        // "abc"のparseが失敗してパニックする
        scores.push(s.parse::<i32>().unwrap());
    }
    // scoresが空ならゼロ除算でパニックする
    let total: i32 = scores.iter().sum();
    let average = total / scores.len() as i32;
    println!("平均: {}", average);
    // 4件目は存在しないので添字アクセスならパニックする
    println!("4件目: {}", scores[3]);
}
`,
      solution: `fn main() {
    let inputs = ["80", "abc", "90"];
    let mut scores = Vec::new();
    for s in &inputs {
        match s.parse::<i32>() {
            Ok(n) => scores.push(n),
            Err(_) => println!("{} は数値ではないのでスキップします", s),
        }
    }
    if scores.is_empty() {
        println!("有効な得点がありません");
    } else {
        let total: i32 = scores.iter().sum();
        let average = total / scores.len() as i32;
        println!("平均: {}", average);
    }
    match scores.get(3) {
        Some(v) => println!("4件目: {}", v),
        None => println!("4件目のデータはありません"),
    }
}
`,
      hints: [
        `直す場所は3つです。parseのunwrap、除算の前の件数チェック、scores[3]の添字アクセス。`,
        `parseはmatchで受けてErrならスキップ、除算は<code>if scores.is_empty()</code>で分岐します。`,
        `<code>scores.get(3)</code>はOptionを返すので、matchでSomeとNoneを処理します。`
      ],
      expectedOutput: "平均: 85"
    }
  ]
});
