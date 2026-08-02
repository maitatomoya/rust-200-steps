// 第25章：よくあるエラー：実行時と論理
registerChapter({
  number: 25,
  title: "よくあるエラー：実行時と論理",
  description: "コンパイルは通るのに実行するとパニックする、あるいは間違った答えを出す。そんな厄介なバグの見つけ方と直し方を訓練し、最後は複数のバグを抱えたプログラムを完全修復します。",
  steps: [
    {
      id: 241,
      title: "RefCellの実行時パニック（BorrowMutError）",
      explanation: `<p>この章では、コンパイルは成功するのに<strong>実行時にパニックしたり、間違った結果を出したりするバグ</strong>を扱います。コンパイラが守ってくれない領域なので、エラーメッセージと出力を自分の目で読み解く力が問われます。</p>
<p>最初は<code>RefCell</code>（借用ルールの検査をコンパイル時ではなく実行時に行う型）です。<code>borrow()</code>で不変借用、<code>borrow_mut()</code>で可変借用を取りますが、ルール自体は通常の借用と同じで「不変借用が生きている間に可変借用は取れない」。違反するとコンパイルエラーではなく<strong>実行時パニック</strong>になります。</p>
<pre><code>thread 'main' panicked at src/main.rs:12:10:
already borrowed: BorrowMutError
note: run with RUST_BACKTRACE=1 environment variable to display a backtrace</code></pre>
<p>読み方のポイントは2つです。1行目の<code>src/main.rs:12:10</code>が<strong>パニックした行と桁</strong>（ここに<code>borrow_mut()</code>があるはず）、2行目の<code>already borrowed</code>が「すでに（不変）借用されている」という原因です。逆に<code>borrow()</code>側で落ちると<code>already mutably borrowed: BorrowError</code>になります。</p>
<p>探すべきは「まだ生きている借用ガード」です。<code>borrow()</code>が返す値は変数に入れると<strong>スコープを抜けるまで借用を保持し続ける</strong>ため、ブロック<code>{ }</code>で囲んで早めに返却するのが定番の修正です。</p>
<pre><code>{
    let first = data.borrow();
    println!("{}", first[0]);
} // ブロックを抜けた時点で借用が返却される
data.borrow_mut().push(4); // ここではもう安全</code></pre>
<p><code>drop(first);</code>と明示的に破棄する方法もあります。<code>RefCell</code>を使うコードでパニックしたら、まず「借用ガードの寿命」を疑いましょう。</p>`,
      task: `このコードは実行すると<code>BorrowMutError</code>でパニックします。不変借用<code>first</code>の寿命をブロックで区切り、パニックせず最後まで実行されるように修正してください。`,
      code: `use std::cell::RefCell;

fn main() {
    let data = RefCell::new(vec![1, 2, 3]);

    // 不変借用を変数に保持したまま…
    let first = data.borrow();
    println!("先頭: {}", first[0]);

    // 可変借用を取ろうとして実行時パニック！
    // already borrowed: BorrowMutError
    data.borrow_mut().push(4);

    println!("要素数: {}", first.len());
}
`,
      solution: `use std::cell::RefCell;

fn main() {
    let data = RefCell::new(vec![1, 2, 3]);

    // ブロックで囲むことで、抜けた時点で借用が返却される
    {
        let first = data.borrow();
        println!("先頭: {}", first[0]);
    }

    // 不変借用はもう存在しないので、可変借用を取れる
    data.borrow_mut().push(4);

    let after = data.borrow();
    println!("要素数: {}", after.len());
}
`,
      hints: [
        `borrow()の戻り値を変数に入れると、その変数のスコープが終わるまで不変借用が続きます。borrow_mut()を呼ぶ前に借用を終わらせましょう。`,
        `firstを使う部分を{ }のブロックで囲むと、ブロックの終わりで借用が返却されます。`,
        `最後のprintln!はブロックの外に出るので、borrow()を取り直した別の変数（例：after）で要素数を表示します。`
      ],
      expectedOutput: "要素数: 4"
    },
    {
      id: 242,
      title: "Mutexの二重ロックでデッドロック",
      explanation: `<p>次は<strong>エラーメッセージすら出ない</strong>バグ、デッドロック（互いにロックの解放を待ち続けて永遠に停止する状態）です。第18章で学んだ<code>Mutex</code>は、<code>lock()</code>が返す<code>MutexGuard</code>がスコープを抜けて破棄されるまでロックを保持し続けます。</p>
<p>問題は<strong>同じスレッドで2回<code>lock()</code>を呼ぶ</strong>ケースです。1回目のガードが生きたまま2回目の<code>lock()</code>を呼ぶと、2回目は「誰かがロックを解放するのを待つ」状態に入りますが、その「誰か」は自分自身。自分は待っているので永遠に解放されず、プログラムは沈黙します。</p>
<pre><code>$ cargo run
   Compiling app v0.1.0
    Finished dev profile ...
     Running target/debug/app
（何も表示されないまま止まる。CPUも使っていない）</code></pre>
<p>見つけ方のポイントは症状の観察です。</p>
<table>
<tr><th>症状</th><th>疑うべきバグ</th></tr>
<tr><td>出力が止まりCPU使用率も低い</td><td>デッドロック（ロック待ち）</td></tr>
<tr><td>出力が止まりCPU使用率が高い</td><td>無限ループ（ステップ249で扱います）</td></tr>
</table>
<p>修正はRefCellのときと同じ発想で、<strong>ガードの寿命を短くする</strong>ことです。</p>
<pre><code>{
    let mut a = counter.lock().unwrap();
    *a += 1;
} // ここでガードが破棄され、ロックが解放される
let b = counter.lock().unwrap(); // 取り直せる</code></pre>
<p>実務では「ロックを取ったままロックを取る別の関数を呼んでいた」という間接的な二重ロックが典型例です。<code>lock()</code>の呼び出し箇所を洗い出し、ガードの生存範囲が重なっていないかを確認する習慣をつけましょう。なお公式ドキュメントでは、同一スレッドでの再ロックはデッドロックまたはパニックになると定められています。</p>`,
      task: `このコードは同じスレッドで<code>lock()</code>を2回呼ぶためデッドロックし、永遠に終了しません。1回目のガードをブロックで囲んで先に解放し、最後まで実行されるように修正してください。`,
      code: `use std::sync::Mutex;

fn main() {
    let counter = Mutex::new(0);

    // 1回目のロック（ガードaが生きている間はロックされたまま）
    let mut a = counter.lock().unwrap();
    *a += 1;

    // 同じスレッドで2回目のロック
    // → aが解放されるのを待ち続けてデッドロック（何も表示されず止まる）
    let b = counter.lock().unwrap();
    println!("counter = {}", *b);
}
`,
      solution: `use std::sync::Mutex;

fn main() {
    let counter = Mutex::new(0);

    // ブロックで囲み、使い終わったらすぐロックを解放する
    {
        let mut a = counter.lock().unwrap();
        *a += 1;
    } // ここでガードaが破棄され、ロックが解放される

    // ロックは解放済みなので、取り直しても待たされない
    let b = counter.lock().unwrap();
    println!("counter = {}", *b);
}
`,
      hints: [
        `lock()が返すMutexGuardは、破棄されるまでロックを持ち続けます。2回目のlock()の前に1回目のガードを破棄する必要があります。`,
        `*a += 1;までの処理を{ }のブロックで囲むと、ブロックの終わりでガードが破棄されます。`,
        `drop(a);と書いて明示的に破棄する方法でも構いません。`
      ],
      expectedOutput: "counter = 1"
    },
    {
      id: 243,
      title: "整数オーバーフロー（attempt to add with overflow）",
      explanation: `<p>整数型には表せる範囲があります。<code>u8</code>なら0〜255。この範囲を計算結果が超えることを<strong>オーバーフロー</strong>と呼びます。Rustの面白いところは、ビルドモードで挙動が変わる点です。</p>
<ul>
<li><strong>debugビルド</strong>（cargo run）：パニックして即座に知らせてくれる</li>
<li><strong>releaseビルド</strong>（--release）：パニックせず値が一周する（255+1が0になる。ラップアラウンドと呼びます）</li>
</ul>
<pre><code>thread 'main' panicked at src/main.rs:8:9:
attempt to add with overflow</code></pre>
<p><code>attempt to add with overflow</code>は「足し算でオーバーフローした」の意味です。<code>subtract</code>（引き算。u8の0-1などで発生）や<code>multiply</code>（掛け算）のこともあります。パニック行の計算に使われている<strong>型の上限・下限</strong>を確認するのが原因特定の第一歩です。なお<code>250u8 + 10</code>のように両辺がリテラル定数だと、rustcは実行前に<code>error: this arithmetic operation will overflow</code>というコンパイルエラーで検出してくれます。厄介なのは今回のように<strong>実行時にしか値が決まらない計算</strong>で、これはdebugビルドの実行時パニックとして現れます。</p>
<p>修正には2つの方針があります。1つ目は<strong>オーバーフローを想定した専用メソッド</strong>を使うこと。</p>
<table>
<tr><th>メソッド</th><th>戻り値</th><th>挙動</th></tr>
<tr><td><code>checked_add</code></td><td><code>Option&lt;T&gt;</code></td><td>溢れたら<code>None</code></td></tr>
<tr><td><code>saturating_add</code></td><td><code>T</code></td><td>溢れたら上限値（u8なら255）で止まる</td></tr>
<tr><td><code>wrapping_add</code></td><td><code>T</code></td><td>溢れたら一周する（意図的なとき用）</td></tr>
</table>
<pre><code>match stock.checked_add(a) {
    Some(s) =&gt; stock = s,
    None =&gt; println!("上限を超えます"),
}</code></pre>
<p>2つ目は<strong>より大きな型で計算する</strong>こと。<code>a as u32</code>のように変換してから足せば260も余裕で表現できます。「その変数が現実に取りうる最大値はいくつか」を考えて型を選ぶのが根本的な対策です。</p>`,
      task: `入荷分を合計すると120+90+50=260となり、<code>u8</code>の上限255を超えてdebugビルドではパニックします。<code>checked_add</code>で溢れを検出してメッセージを表示し、さらに<code>u32</code>で計算した正しい合計260も表示してください。`,
      code: `fn main() {
    // トラック3台分の入荷数（実行時に決まる値という想定）
    let arrivals: [u8; 3] = [120, 90, 50];
    let mut stock: u8 = 0;

    for a in arrivals {
        // 120+90=210までは平気だが、+50で260となりu8の上限255を超える
        // → debugビルドでは attempt to add with overflow でパニック
        stock += a;
    }

    println!("在庫合計: {}", stock);
}
`,
      solution: `fn main() {
    // トラック3台分の入荷数（実行時に決まる値という想定）
    let arrivals: [u8; 3] = [120, 90, 50];
    let mut stock: u8 = 0;

    for a in arrivals {
        // checked_addは溢れるとNoneを返すので、パニックせずに処理できる
        match stock.checked_add(a) {
            Some(s) => stock = s,
            None => println!("在庫がu8の上限(255)を超えるため加算を中止します"),
        }
    }
    println!("u8での在庫: {}", stock);

    // より大きな型に変換してから計算すれば、そもそも溢れない
    let mut total: u32 = 0;
    for a in arrivals {
        total += a as u32;
    }
    println!("u32で計算: {}", total);
}
`,
      hints: [
        `u8で表せるのは0〜255です。合計260は表現できないため、debugビルドでは3周目の加算でパニックします。`,
        `stock.checked_add(a)はOption<u8>を返します。matchでSome(s)とNoneに分岐し、Someのときだけstock = s;と更新しましょう。`,
        `別のループでa as u32と変換しながらu32の変数に足せば、正しい合計260が得られます。`
      ],
      expectedOutput: "u32で計算: 260"
    },
    {
      id: 244,
      title: "浮動小数点を==で比較してはいけない",
      explanation: `<p>今度はパニックすらしない、静かな論理バグです。次のコードは何を表示するでしょうか。</p>
<pre><code>let sum = 0.1 + 0.2;
if sum == 0.3 {
    println!("等しい");
} else {
    println!("等しくない？ 実際の値: {}", sum);
}</code></pre>
<p>直感に反して、出力はこうなります。</p>
<pre><code>等しくない？ 実際の値: 0.30000000000000004</code></pre>
<p>原因は浮動小数点数（<code>f64</code>）の内部表現です。コンピュータは数を2進数で持ちますが、<strong>0.1や0.2は2進数では無限小数</strong>になり、正確に表現できません（10進数で1/3が0.333…になるのと同じ理屈です）。ごくわずかな誤差を含んだ近似値同士を足すので、結果は0.3ぴったりにはならず、<code>==</code>は<code>false</code>になります。</p>
<p>この種のバグは「たまに条件分岐が期待と逆に動く」という形で現れ、発見が遅れがちです。見つけるコツは、疑わしい値を<code>{:.17}</code>のように<strong>桁数を増やして表示してみる</strong>こと。0.30000000000000004のような尻尾が見えたら確定です。</p>
<p>修正の定石は「差の絶対値が十分小さければ等しいとみなす」比較です。</p>
<pre><code>let diff = (sum - expected).abs();
if diff &lt; 1e-10 {
    println!("ほぼ等しい");
}</code></pre>
<p>許容誤差（イプシロンと呼びます）は扱う数値の大きさに合わせて選びます。また、金額計算のように誤差が許されない場面では、そもそも浮動小数点を使わず「銭単位の整数」で持つのが実務の定番です。</p>`,
      task: `このコードは<code>==</code>比較が失敗し、「等しくない」側が表示されてしまいます。差の絶対値が<code>1e-10</code>未満なら等しいとみなす比較に書き換え、「0.1 + 0.2 はほぼ0.3です」と表示してください。`,
      code: `fn main() {
    let sum = 0.1 + 0.2;

    // 誤差のせいでこの比較はfalseになる
    if sum == 0.3 {
        println!("0.1 + 0.2 はほぼ0.3です");
    } else {
        println!("0.1 + 0.2 は 0.3 ではない？ 実際の値: {}", sum);
    }
}
`,
      solution: `fn main() {
    let sum: f64 = 0.1 + 0.2;
    let expected = 0.3;

    // 差の絶対値が十分小さければ「等しい」とみなす
    if (sum - expected).abs() < 1e-10 {
        println!("0.1 + 0.2 はほぼ0.3です");
    } else {
        println!("等しくありません");
    }

    // 桁数を増やして表示すると誤差の正体が見える
    println!("実際の値: {:.17}", sum);
}
`,
      hints: [
        `0.1も0.2も2進数では正確に表せないため、和は0.3ぴったりになりません。==での一致判定は使えません。`,
        `(sum - 0.3).abs()で差の絶対値を求め、それが1e-10より小さいかどうかで判定します。`,
        `absはf64のメソッドです。比較演算子は<を使います。`
      ],
      expectedOutput: "0.1 + 0.2 はほぼ0.3です"
    },
    {
      id: 245,
      title: "文字列のバイト境界パニック（日本語スライス）",
      explanation: `<p>Rustの文字列（<code>&amp;str</code>や<code>String</code>）はUTF-8のバイト列で、<strong>スライスの添字は文字数ではなくバイト位置</strong>を指します。英数字は1文字1バイトですが、日本語の多くは1文字3バイトです。文字の途中のバイト位置でスライスすると、コンパイルは通るのに実行時にパニックします。</p>
<pre><code>thread 'main' panicked at src/main.rs:6:17:
byte index 5 is not a char boundary; it is inside 'は' (bytes 4..7) of Rustは楽しい</code></pre>
<p>このメッセージはかなり親切です。読み解くと、</p>
<ul>
<li><code>byte index 5 is not a char boundary</code>：バイト位置5は文字の境界ではない</li>
<li><code>it is inside 'は' (bytes 4..7)</code>：位置5は「は」（4〜6バイト目を占める）の内部にある</li>
</ul>
<p>つまり「Rust」が0〜3バイト、「は」が4〜6バイトなので、<code>&amp;s[0..5]</code>は「は」を真っ二つに切ろうとしていたわけです。</p>
<p>修正の定石は<strong>バイト位置ではなく文字単位で扱う</strong>ことです。</p>
<pre><code>// 先頭5文字を取り出す（バイト数を数えなくてよい）
let head: String = s.chars().take(5).collect();</code></pre>
<p><code>chars()</code>は文字（<code>char</code>）のイテレータを返すので、<code>take(5)</code>で先頭5文字だけ取り、<code>collect()</code>で<code>String</code>に集めます。どうしてもバイト位置でスライスしたい場合は、<code>s.is_char_boundary(7)</code>で境界かどうかを事前に確認できます。日本語を扱うプログラムでは「添字はバイト」の原則を忘れないでください。英語のテストデータでは動くのに日本語データで落ちる、というのがこのバグの典型的な現れ方です。</p>`,
      task: `このコードは「は」の途中のバイト位置5でスライスしようとしてパニックします。<code>chars().take(5)</code>を使って先頭5文字「Rustは」を安全に取り出し、「先頭5文字: Rustは」と表示してください。`,
      code: `fn main() {
    let s = "Rustは楽しい";

    // 「Rust」は4バイト、「は」は4〜6バイト目。位置5は「は」の途中！
    // → byte index 5 is not a char boundary でパニック
    let head = &s[0..5];
    println!("先頭: {}", head);
}
`,
      solution: `fn main() {
    let s = "Rustは楽しい";

    // 文字単位で先頭5文字を取り出せば、バイト境界を気にしなくてよい
    let head: String = s.chars().take(5).collect();
    println!("先頭5文字: {}", head);

    // バイト位置でスライスしたいときは、境界かどうかを先に確認する
    if s.is_char_boundary(7) {
        println!("バイト0..7: {}", &s[0..7]);
    }
}
`,
      hints: [
        `文字列スライスの添字はバイト位置です。日本語1文字は3バイトなので、中途半端な位置で切るとパニックします。`,
        `s.chars()で文字のイテレータを取り、take(5)で先頭5文字に絞ります。`,
        `collect()でStringに集めます。受け取る変数にlet head: String =と型注釈を付けましょう。`
      ],
      expectedOutput: "先頭5文字: Rustは"
    },
    {
      id: 246,
      title: "off-by-oneエラー（..と..=の取り違え）",
      explanation: `<p>境界の数え間違いで結果が1つずれるバグを<strong>off-by-oneエラー</strong>（1つずれエラー）と呼びます。あらゆる言語で最も頻発するバグの1つで、Rustでは範囲記法の<code>..</code>と<code>..=</code>の取り違えが典型です。</p>
<table>
<tr><th>記法</th><th>意味</th><th>例</th></tr>
<tr><td><code>a..b</code></td><td>aから<strong>bの手前まで</strong>（bを含まない）</td><td><code>1..5</code>は1,2,3,4</td></tr>
<tr><td><code>a..=b</code></td><td>aから<strong>bまで</strong>（bを含む）</td><td><code>1..=5</code>は1,2,3,4,5</td></tr>
</table>
<p>怖いのは、どちらもコンパイルが通り、実行もエラーなく完了することです。次の出力を見てください。</p>
<pre><code>1から100の合計: 4950</code></pre>
<p>正解は5050（ガウスの公式で101×50）ですが、<code>1..100</code>は100を含まないため100だけ足し損ねています。5050-100=4950。<strong>期待値を別の方法で概算しておき、実際の出力と突き合わせる</strong>のがこの種のバグの発見法です。境界の1つずれは「合計がちょうど端の値ぶんだけ違う」「件数が1件違う」という形で現れます。</p>
<p>逆方向のずれにも注意が必要です。配列の添字アクセスで<code>0..=v.len()</code>と書くと、存在しない位置<code>v.len()</code>にアクセスして今度はパニックします。</p>
<pre><code>index out of bounds: the len is 3 but the index is 3</code></pre>
<p>迷ったら「端の値（最初と最後）がループで実際に使われるか」を頭の中で1回転させて確かめる癖をつけましょう。テストを書くときも、境界のちょうど両端を必ず含めるのが定石です。</p>`,
      task: `1から100までの合計5050を求めたいのに、範囲の書き方が誤っているため4950になってしまいます。範囲記法を修正して「1から100の合計: 5050」と表示してください。`,
      code: `fn main() {
    // 1から100までの合計を求めたい（正解は5050）
    let mut sum = 0;

    // この範囲は100を含まないので、4950になってしまう
    for i in 1..100 {
        sum += i;
    }

    println!("1から100の合計: {}", sum);
}
`,
      solution: `fn main() {
    // 1から100までの合計を求めたい（正解は5050）
    let mut sum = 0;

    // ..=なら終端の100も含まれる
    for i in 1..=100 {
        sum += i;
    }

    println!("1から100の合計: {}", sum);
}
`,
      hints: [
        `a..bはbを含みません。1..100がカバーするのは1〜99です。`,
        `終端を含めたいときは..=を使います。`,
        `検算のコツ：1から100の合計は(1+100)×100÷2=5050と手計算で概算できます。出力と比べてみましょう。`
      ],
      expectedOutput: "1から100の合計: 5050"
    },
    {
      id: 247,
      title: "sort_byの比較関数ミスで順序が逆",
      explanation: `<p><code>sort_by</code>は比較クロージャを渡して並び順を自由に決められるメソッドですが、<strong>引数の順序を取り違えると昇順と降順が逆転</strong>します。これもコンパイルは通り、実行もエラーなく終わる論理バグです。</p>
<pre><code>ランキング: [60, 70, 88, 95]
1位: 60点</code></pre>
<p>ランキングの1位が最低点になっています。この「出力の形は正しいのに中身の順序がおかしい」パターンを見たら、真っ先に比較関数を疑いましょう。ルールは次の通りです。</p>
<table>
<tr><th>書き方</th><th>結果</th><th>覚え方</th></tr>
<tr><td><code>|a, b| a.cmp(b)</code></td><td>昇順（小→大）</td><td>前の要素aが小さければそのまま</td></tr>
<tr><td><code>|a, b| b.cmp(a)</code></td><td>降順（大→小）</td><td>引数を入れ替えると順序も逆になる</td></tr>
</table>
<p><code>cmp</code>は2値を比較して<code>Ordering</code>（Less・Equal・Greaterの3値をとるenum）を返すメソッドで、<code>sort_by</code>は「クロージャがLessを返したペアは前がaの順に並ぶ」と解釈します。<code>b.cmp(a)</code>にすると判定が反転するので降順になる、という仕組みです。</p>
<p>降順の書き方は他にもあります。</p>
<pre><code>v.sort();          // まず昇順に整列して
v.reverse();       // 全体を反転する
// または
v.sort_by(|a, b| b.cmp(a)); // 比較を逆にする</code></pre>
<p>この種のバグの検出法はシンプルで、<strong>ソート結果の先頭と末尾を確認する</strong>ことです。「最大のはずの先頭が最小になっていないか」を、手で作った小さなデータ（3〜4件で十分）で確かめてから本番データに使いましょう。</p>`,
      task: `テストの点数を高い順に並べて1位を表示したいのに、比較関数が昇順になっているため最低点が1位と表示されてしまいます。降順に修正して「1位: 95点」と表示してください。`,
      code: `fn main() {
    let mut scores = vec![70, 95, 60, 88];

    // 高い順（降順）に並べたいのに、これは昇順
    scores.sort_by(|a, b| a.cmp(b));

    println!("ランキング: {:?}", scores);
    println!("1位: {}点", scores[0]); // 60点が1位になってしまう
}
`,
      solution: `fn main() {
    let mut scores = vec![70, 95, 60, 88];

    // b.cmp(a)と引数を入れ替えると降順になる
    scores.sort_by(|a, b| b.cmp(a));

    println!("ランキング: {:?}", scores);
    println!("1位: {}点", scores[0]);
}
`,
      hints: [
        `a.cmp(b)は昇順です。降順にするには比較の向きを逆にします。`,
        `クロージャの中身をb.cmp(a)に変えるだけで順序が反転します。`,
        `sort()してからreverse()を呼ぶ方法でも同じ結果になります。`
      ],
      expectedOutput: "1位: 95点"
    },
    {
      id: 248,
      title: "シャドーイングによる意図しない型変化",
      explanation: `<p>シャドーイング（<code>let</code>による同名変数の再宣言）は型を変えながら値を加工できる便利な機能ですが、<strong>誤った変換をしても同名のままコードが流れてしまう</strong>という落とし穴があります。次の出力を見てください。</p>
<pre><code>1人分の合計: 500円</code></pre>
<p>設定値は<code>"3"</code>（3人）なのに1人分になっています。原因はこの行です。</p>
<pre><code>let count = "3";
let count = count.len(); // 数値化した「つもり」</code></pre>
<p><code>len()</code>は<strong>文字列のバイト数</strong>を返すメソッドです。"3"は1バイトなので<code>count</code>は1になり、以降の計算がすべて狂います。<code>parse()</code>と書くべきところで<code>len()</code>と書いてしまう、あるいは変換自体を忘れる。シャドーイングは同じ名前を使い続けられるぶん、こうした取り違えがコンパイルエラーにならず素通りします。</p>
<p>見つけ方と防ぎ方は3つあります。</p>
<ul>
<li><strong>値を途中で表示して追跡する</strong>：<code>println!("count = {:?}", count);</code>を変換直後に置けば、3のはずが1になっている瞬間を捕まえられます。</li>
<li><strong>シャドーイング時に型注釈を付ける</strong>：意図した型を明示すれば、誤った変換の多くはコンパイルエラーとして検出されます。</li>
<li><strong>加工結果には別の名前を付ける</strong>：<code>count_str</code>と<code>count</code>のように分ければ、取り違えは型エラーになります。</li>
</ul>
<pre><code>// 型注釈があれば、意図と違う型になった時点でE0308が出る
let count: usize = count.parse().expect("数値に変換できません");</code></pre>
<p>文字列から数値への変換は第9章で学んだ<code>parse()</code>が正解です。失敗する可能性があるので<code>Result</code>で返る点も思い出しておきましょう。</p>`,
      task: `文字列<code>"3"</code>を数値化するつもりで<code>len()</code>を使ってしまい、「1人分の合計: 500円」と誤った結果が出ています。<code>parse()</code>による正しい変換に修正し、「3人分の合計: 1500円」と表示してください。`,
      code: `fn main() {
    // 設定ファイルから読み込んだ人数（という想定の文字列）
    let count = "3";

    // 数値化したつもりが、len()は文字列のバイト数（=1）を返す！
    let count = count.len();

    let total = count * 500;
    println!("{}人分の合計: {}円", count, total); // 1人分の合計: 500円
}
`,
      solution: `fn main() {
    // 設定ファイルから読み込んだ人数（という想定の文字列）
    let count = "3";

    // parse()で文字列を数値に変換する。型注釈で意図した型を明示する
    let count: usize = count.parse().expect("数値に変換できません");

    let total = count * 500;
    println!("{}人分の合計: {}円", count, total);
}
`,
      hints: [
        `len()は「文字列が何バイトか」を返すメソッドで、文字列を数値に変換するものではありません。`,
        `文字列を数値にするにはparse()を使います。戻り値はResultなのでexpect()などで取り出します。`,
        `let count: usize =のように型注釈を付けると、変換ミスをコンパイラが検出しやすくなります。`
      ],
      expectedOutput: "3人分の合計: 1500円"
    },
    {
      id: 249,
      title: "無限ループ（条件の更新忘れ）",
      explanation: `<p><code>while</code>ループの条件に使っている変数を<strong>ループ本体の中で更新し忘れる</strong>と、条件が永遠に真のままになり無限ループに陥ります。実行すると同じ出力が延々と流れ続けます。</p>
<pre><code>残り: 5
残り: 5
残り: 5
残り: 5
（Ctrl+Cで強制終了するまで続く）</code></pre>
<p>症状の見分け方はステップ242の表の通りで、<strong>同じ出力が繰り返されCPU使用率が高い</strong>なら無限ループです（デッドロックは出力もCPU消費もなく静かに止まります）。端末では<code>Ctrl+C</code>で強制終了できます。</p>
<p>原因調査の手順は機械的です。</p>
<ol>
<li>止まらないループの<strong>条件式に登場する変数</strong>を特定する（ここでは<code>remaining</code>）</li>
<li>ループ本体の中でその変数が<strong>変更されている行を探す</strong></li>
<li>見つからなければ更新忘れが確定。あっても「条件が偽に向かう方向に」変わっているかを確認する（減らすべき変数を増やしていた、という逆方向バグもあります）</li>
</ol>
<pre><code>while remaining &gt; 0 {
    println!("残り: {}", remaining);
    remaining -= 1; // この1行を忘れると無限ループ
}</code></pre>
<p>予防策として、回数が決まっている繰り返しは<code>while</code>ではなく<code>for</code>と範囲を使うのが安全です。<code>for i in (1..=5).rev()</code>のように書けば、カウンタの更新はループ構文が自動で行うため、更新忘れという事故そのものが起こりません。<code>while</code>を書くときは「ループを1周するたびに、終了に一歩近づいているか」を必ず確認しましょう。</p>`,
      task: `このカウントダウンは<code>remaining</code>を減らし忘れているため無限ループになります。ループ内で<code>remaining</code>を1ずつ減らし、5から1まで表示したあと「完了」と表示されるように修正してください。`,
      code: `fn main() {
    let mut remaining = 5;

    // remainingがずっと5のままなので、この条件は永遠に真
    while remaining > 0 {
        println!("残り: {}", remaining);
        // カウンタを減らし忘れている！
    }

    println!("完了");
}
`,
      solution: `fn main() {
    let mut remaining = 5;

    while remaining > 0 {
        println!("残り: {}", remaining);
        remaining -= 1; // 毎周、終了条件に一歩近づける
    }

    println!("完了");
}
`,
      hints: [
        `whileの条件remaining > 0が偽になるためには、ループの中でremainingが減っていく必要があります。`,
        `println!の後にremaining -= 1;を追加しましょう。`,
        `修正後の出力は「残り: 5」から「残り: 1」まで表示され、最後に「完了」と出ます。`
      ],
      expectedOutput: "完了"
    },
    {
      id: 250,
      title: "卒業課題：エラーだらけのプログラムを完全修復する",
      explanation: `<p>いよいよ最終ステップです。テストの成績集計プログラムに<strong>この章で学んだバグが6個</strong>仕込まれています。1つ直すと次のバグが姿を現す、実務さながらのデバッグを体験してください。</p>
<p>複数バグの修復には順序があります。</p>
<ol>
<li><strong>まず実行して、最初の異常を観察する</strong>（パニックか、無限ループか、誤った出力か）</li>
<li><strong>1つ直したら必ず再実行する</strong>。まとめて直そうとすると、どの修正が効いたのか分からなくなります</li>
<li><strong>期待値を手計算しておく</strong>。パニックしない論理バグは、正解と突き合わせないと見つかりません</li>
</ol>
<p>今回のプログラムの期待値を先に計算しておきましょう。点数は82・95・78・91なので、合計は346、平均は346÷4=86.5。目標ライン85点以上なので「達成」。最高点は95で、首位は高橋さんです。</p>
<p>探すべきバグの種類を整理します（登場順ではありません）。</p>
<table>
<tr><th>種類</th><th>手がかり</th><th>学んだステップ</th></tr>
<tr><td>off-by-oneエラー</td><td>集計対象が1件足りない</td><td>246</td></tr>
<tr><td>整数オーバーフロー</td><td><code>attempt to add with overflow</code></td><td>243</td></tr>
<tr><td>浮動小数点の比較</td><td><code>==</code>での判定</td><td>244</td></tr>
<tr><td>ソート順の逆転</td><td>最高点のはずが最低点</td><td>247</td></tr>
<tr><td>無限ループ</td><td>カウンタの更新忘れ</td><td>249</td></tr>
<tr><td>バイト境界パニック</td><td>日本語のスライス</td><td>245</td></tr>
</table>
<p>ヒントを1つ。off-by-oneを直すと合計が346になり、今度は<code>u8</code>の上限255を超えてオーバーフローが顔を出します。</p>
<pre><code>thread 'main' panicked at src/main.rs:8:9:
attempt to add with overflow</code></pre>
<p>このように<strong>バグは別のバグを隠していることがある</strong>のです。1つ直すたびに再実行する習慣が、ここで効いてきます。落ち着いて、1つずつ。ここまで249ステップを歩いてきたあなたなら必ず直せます。</p>`,
      task: `6個のバグをすべて修正し、「平均点: 86.5」「クラス目標を達成」（85点以上）「最高点: 95」「首位: 高橋さん（頭文字: 高）」の4行が正しく表示されるようにしてください。`,
      code: `fn main() {
    let names = ["佐藤", "高橋", "鈴木", "田中"];
    let scores: [u8; 4] = [82, 95, 78, 91];

    // 全員の合計点を求める
    let mut total: u8 = 0;
    for i in 0..scores.len() - 1 {
        total += scores[i];
    }

    let average = total as f64 / scores.len() as f64;
    println!("平均点: {}", average);

    // クラス目標：平均85点以上
    if average == 85.0 {
        println!("クラス目標を達成");
    } else {
        println!("クラス目標に届かず");
    }

    // 点数を高い順に並べて最高点を表示する
    let mut ranking = scores.to_vec();
    ranking.sort_by(|a, b| a.cmp(b));
    println!("最高点: {}", ranking[0]);

    // 最高点の人を探して、名前と頭文字を表示する
    let mut best_index = 0;
    let mut i = 0;
    while i < scores.len() {
        if scores[i] > scores[best_index] {
            best_index = i;
        }
    }
    println!("首位: {}さん（頭文字: {}）", names[best_index], &names[best_index][0..1]);
}
`,
      solution: `fn main() {
    let names = ["佐藤", "高橋", "鈴木", "田中"];
    let scores: [u8; 4] = [82, 95, 78, 91];

    // 修正1：0..scores.len()で全員を集計する（off-by-one）
    // 修正2：合計はu8では溢れるのでu32で持つ（オーバーフロー）
    let mut total: u32 = 0;
    for i in 0..scores.len() {
        total += scores[i] as u32;
    }

    let average = total as f64 / scores.len() as f64;
    println!("平均点: {}", average);

    // 修正3：浮動小数点の==ではなく>=で「85点以上」を判定する
    if average >= 85.0 {
        println!("クラス目標を達成");
    } else {
        println!("クラス目標に届かず");
    }

    // 修正4：b.cmp(a)で降順にする（ソート順の逆転）
    let mut ranking = scores.to_vec();
    ranking.sort_by(|a, b| b.cmp(a));
    println!("最高点: {}", ranking[0]);

    // 修正5：カウンタiを更新する（無限ループ）
    let mut best_index = 0;
    let mut i = 0;
    while i < scores.len() {
        if scores[i] > scores[best_index] {
            best_index = i;
        }
        i += 1;
    }

    // 修正6：バイト位置のスライスではなく文字単位で頭文字を取る
    let initial: String = names[best_index].chars().take(1).collect();
    println!("首位: {}さん（頭文字: {}）", names[best_index], initial);
}
`,
      hints: [
        `まず実行し、最初に起きる異常から1つずつ直して再実行を繰り返しましょう。forの範囲、totalの型、==、sort_byの比較、whileのカウンタ、日本語のスライスの6箇所です。`,
        `合計346はu8の上限255を超えます。let mut total: u32 = 0;にして、足すときはscores[i] as u32と変換します。`,
        `「高橋」の頭文字はバイト位置の[0..1]ではパニックします。chars().take(1).collect::<String>()の形で取り出しましょう。`
      ],
      expectedOutput: "首位: 高橋さん（頭文字: 高）"
    }
  ]
});
