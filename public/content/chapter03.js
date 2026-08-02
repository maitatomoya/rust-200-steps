// 第3章：制御フロー
registerChapter({
  number: 3,
  title: "制御フロー",
  description: "if式、loop、while、forといったRustの制御フローを学びます。「ifが式である」というRustらしい特徴と、ループを自在に操るbreak・continue・ラベルを習得します。",
  steps: [
    {
      id: 21,
      title: "if式の基本",
      explanation: `<p>プログラムの流れを条件によって分岐させるには<code>if</code>を使います。Rustの<code>if</code>には、他の言語経験者がつまずきやすい重要なルールが2つあります。</p>
<ul>
<li>条件式を囲む丸カッコ<code>( )</code>は<strong>不要</strong>（付けると警告が出る）</li>
<li>条件式は<strong>必ず<code>bool</code>型</strong>でなければならない</li>
</ul>
<p>CやJavaScriptでは<code>if (1) { ... }</code>のように数値を条件に書けますが、Rustでは「0以外は真」といった暗黙の変換は一切行われません。数値を条件にしたい場合は、比較演算子を使って明示的に<code>bool</code>を作ります。</p>
<pre><code>fn main() {
    let temperature = 30;
    if temperature >= 25 {
        println!("今日は夏日です");
    }
}</code></pre>
<p>主な比較演算子は次のとおりです。結果はすべて<code>bool</code>型になります。</p>
<table>
<tr><th>演算子</th><th>意味</th><th>例</th></tr>
<tr><td><code>==</code></td><td>等しい</td><td><code>a == b</code></td></tr>
<tr><td><code>!=</code></td><td>等しくない</td><td><code>a != b</code></td></tr>
<tr><td><code>&lt;</code> / <code>&lt;=</code></td><td>より小さい／以下</td><td><code>a &lt; b</code></td></tr>
<tr><td><code>></code> / <code>>=</code></td><td>より大きい／以上</td><td><code>a > b</code></td></tr>
</table>
<p>複数の条件を組み合わせるには、論理積<code>&amp;&amp;</code>（かつ）と論理和<code>||</code>（または）を使います。この「条件は必ずbool」という厳格さが、書き間違いによるバグをコンパイル時に防いでくれます。</p>`,
      task: `初期コードは<code>if</code>の条件に数値をそのまま書いているためコンパイルエラーになります。「<code>number</code>が5より大きいか」を判定する正しい条件式に修正してください。`,
      code: `fn main() {
    let number = 10;
    // Rustではifの条件は必ずbool型でなければならない
    // TODO: コンパイルエラーを修正して「numberが5より大きいか」を判定する
    if number {
        println!("{}は5より大きい", number);
    }
}`,
      solution: `fn main() {
    let number = 10;
    // 比較演算子でbool型の条件式を作る
    if number > 5 {
        println!("{}は5より大きい", number);
    }
}`,
      hints: [
        `Rustは数値を自動でboolに変換しません。「5より大きい」という比較の結果はbool型になります。`,
        `比較演算子<code>></code>を使って<code>number > 5</code>のように書きます。`
      ],
      expectedOutput: "10は5より大きい"
    },
    {
      id: 22,
      title: "else ifで複数の分岐",
      explanation: `<p>条件が3つ以上に分かれる場合は<code>else if</code>を連ねます。上から順に条件が評価され、<strong>最初に真になったブロックだけ</strong>が実行されます。どの条件にも当てはまらなかった場合は最後の<code>else</code>ブロックが実行されます。</p>
<pre><code>fn main() {
    let number = 6;
    if number % 4 == 0 {
        println!("4で割り切れる");
    } else if number % 3 == 0 {
        println!("3で割り切れる");
    } else if number % 2 == 0 {
        println!("2で割り切れる");
    } else {
        println!("2でも3でも4でも割り切れない");
    }
}</code></pre>
<p>この例で<code>number</code>が6のとき、6は3でも2でも割り切れますが、出力は「3で割り切れる」だけです。<code>else if number % 2 == 0</code>まで評価が進まないためです。<strong>条件を書く順番が結果を左右する</strong>点に注意しましょう。</p>
<p>成績判定のように「90以上ならA、80以上ならB、70以上ならC」と範囲で分岐する場合も、大きい値の条件から順に書くのが定石です。もし<code>score >= 70</code>を先に書いてしまうと、95点でも最初の条件に捕まって「C」と判定されてしまいます。</p>
<p>なお、<code>else if</code>が4つ5つと増えてきたら、後の章で学ぶ<code>match</code>式を使うほうが読みやすくなります。今は「分岐が多いときの受け皿がもう1つある」とだけ覚えておいてください。</p>`,
      task: `点数<code>score</code>に応じて評価を出力するプログラムを完成させてください。90以上は「評価はA」、80以上は「評価はB」、70以上は「評価はC」、それ未満は「評価はD」です。<code>else if</code>を使って分岐を追加しましょう。`,
      code: `fn main() {
    let score = 75;
    // TODO: else ifを追加して4段階の評価にする
    // 90以上: 評価はA / 80以上: 評価はB / 70以上: 評価はC / それ未満: 評価はD
    if score >= 90 {
        println!("評価はA");
    } else {
        println!("評価はD");
    }
}`,
      solution: `fn main() {
    let score = 75;
    // 大きい値の条件から順に並べるのがポイント
    if score >= 90 {
        println!("評価はA");
    } else if score >= 80 {
        println!("評価はB");
    } else if score >= 70 {
        println!("評価はC");
    } else {
        println!("評価はD");
    }
}`,
      hints: [
        `条件は大きい値（90以上）から小さい値（70以上）の順に並べます。順番を逆にすると先の条件に捕まってしまいます。`,
        `<code>} else if score >= 80 {</code>のように、elseとifをつなげて書きます。`
      ],
      expectedOutput: "評価はC"
    },
    {
      id: 23,
      title: "ifは式である（letと組み合わせ）",
      explanation: `<p>Rustの大きな特徴として、<code>if</code>は「文」ではなく<strong>「式」</strong>です。式とは値を生み出すもののことで、つまり<code>if</code>全体が1つの値になります。これを利用すると、条件に応じた値を変数にそのまま束縛できます。</p>
<pre><code>fn main() {
    let condition = true;
    let number = if condition { 5 } else { 6 };
    println!("numberの値: {}", number);
}</code></pre>
<p>他の言語の三項演算子<code>condition ? 5 : 6</code>に相当する書き方ですが、Rustには三項演算子はなく、この<code>if</code>式がその役割を担います。</p>
<p>重要なルールが2つあります。</p>
<ul>
<li><strong>各ブロックの最後の式がそのブロックの値になる</strong>。<code>{ 5 }</code>と書けばブロックの値は5です（セミコロンは付けない）。</li>
<li><strong>ifとelseの両方の値は同じ型でなければならない</strong>。次のコードはコンパイルエラーです。</li>
</ul>
<pre><code>// エラー例：ifブロックは整数、elseブロックは文字列で型が一致しない
let number = if condition { 5 } else { "six" };</code></pre>
<p>変数の型はコンパイル時に1つに確定している必要があるため、分岐によって型が変わることは許されません。また、値を受け取る使い方をする場合は<code>else</code>を省略できません。<code>else</code>がないと条件が偽のときの値が存在しなくなるからです。</p>`,
      task: `<code>if</code>式を使って変数<code>message</code>に値を束縛してください。<code>is_weekend</code>が<code>true</code>なら「今日は休み」、<code>false</code>なら「今日は仕事」という文字列にします。`,
      code: `fn main() {
    let is_weekend = true;
    // TODO: if式を使ってmessageに値を束縛する
    // is_weekendがtrueなら"今日は休み"、falseなら"今日は仕事"
    let message = "";
    println!("{}", message);
}`,
      solution: `fn main() {
    let is_weekend = true;
    // if式全体が1つの値になるので、そのままletで束縛できる
    let message = if is_weekend { "今日は休み" } else { "今日は仕事" };
    println!("{}", message);
}`,
      hints: [
        `<code>let 変数名 = if 条件 { 値1 } else { 値2 };</code>という形で書けます。`,
        `ブロック内の値にセミコロンを付けないことと、行末の<code>;</code>を忘れないことに注意してください。`
      ],
      expectedOutput: "今日は休み"
    },
    {
      id: 24,
      title: "loopとbreak",
      explanation: `<p>Rustには3種類のループがあります。まずは最もシンプルな<code>loop</code>から学びます。</p>
<table>
<tr><th>種類</th><th>用途</th></tr>
<tr><td><code>loop</code></td><td>無限ループ。<code>break</code>で明示的に抜ける</td></tr>
<tr><td><code>while</code></td><td>条件が真の間だけ繰り返す</td></tr>
<tr><td><code>for</code></td><td>コレクションや範囲の各要素を順に処理する</td></tr>
</table>
<p><code>loop</code>は「抜け出す条件を自分で書くまで永遠に繰り返す」ループです。他の言語で見かける<code>while (true)</code>に相当しますが、Rustでは専用のキーワードが用意されています。</p>
<pre><code>fn main() {
    let mut attempts = 0;
    loop {
        attempts += 1;
        println!("{}回目の試行", attempts);
        if attempts == 3 {
            break; // ループを抜ける
        }
    }
    println!("完了");
}</code></pre>
<p><code>break</code>はループを即座に終了させ、ループの次の行へ処理を進めます。<code>break</code>を書き忘れると本当に無限ループになり、プログラムが止まらなくなるので注意してください（実行が終わらない場合は停止ボタンやCtrl+Cで止めます）。</p>
<p>「終了条件が事前に決めにくい処理（リトライ処理や、ユーザーの操作を待ち続けるゲームループなど）」では、<code>while</code>より<code>loop</code>+<code>break</code>のほうが意図が明確になります。コンパイラも<code>loop</code>を「意図的な無限ループ」と理解するため、後述する「値を返すbreak」のような便利な機能が使えます。</p>`,
      task: `初期コードは<code>break</code>がないため無限ループになってしまいます。<code>count</code>が3になったら<code>if</code>と<code>break</code>でループを抜けるようにし、最後の「ループ終了」の行のコメントを外してください。`,
      code: `fn main() {
    let mut count = 0;
    loop {
        count += 1;
        println!("count = {}", count);
        // TODO: countが3になったらbreakでループを抜ける
        // 注意: このまま実行すると無限ループになります
        break; // 仮のbreak（1回で抜けてしまう）。条件付きに書き換える
    }
    // TODO: breakを条件付きにしたら、次の行のコメントを外す
    // println!("ループ終了");
}`,
      solution: `fn main() {
    let mut count = 0;
    loop {
        count += 1;
        println!("count = {}", count);
        // countが3に達したらループを抜ける
        if count == 3 {
            break;
        }
    }
    println!("ループ終了");
}`,
      hints: [
        `breakを無条件に書くと1回で抜けてしまいます。「3になったときだけ」抜けるにはifで囲みます。`,
        `<code>if count == 3 { break; }</code>のように書きます。`
      ],
      expectedOutput: "ループ終了"
    },
    {
      id: 25,
      title: "breakで値を返す",
      explanation: `<p><code>loop</code>もまた<strong>式</strong>です。つまり<code>loop</code>全体が値を持つことができます。ループから抜けるときに<code>break 値;</code>と書くと、その値が<code>loop</code>式の評価結果になります。</p>
<pre><code>fn main() {
    let mut counter = 0;
    let result = loop {
        counter += 1;
        if counter == 10 {
            break counter * 2; // この値がloop式の値になる
        }
    };
    println!("result = {}", result);
}</code></pre>
<p>このプログラムは<code>counter</code>が10になった時点で<code>counter * 2</code>すなわち20を返し、それが<code>result</code>に束縛されます。</p>
<p>この機能が便利なのは「何度か試行して、成功したらその結果を使いたい」という場面です。ループの外に<code>mut</code>な変数を用意して結果を書き込む方法もありますが、<code>break 値</code>を使えば結果の受け渡しが1か所にまとまり、変数を不必要に可変にせずに済みます。</p>
<p>なお、値を返せるのは<code>loop</code>だけです。<code>while</code>や<code>for</code>の<code>break</code>に値を渡すことはできません。<code>while</code>や<code>for</code>は「条件が偽になって終わる」「要素が尽きて終わる」という、<code>break</code>を経由しない終わり方があるため、返す値を保証できないからです。単なる<code>break;</code>はユニット型<code>()</code>（値がないことを表す型。第4章で詳しく学びます）を返す扱いになります。</p>`,
      task: `初期コードは<code>break;</code>が値を返していないため、<code>result</code>を<code>{}</code>で表示できずコンパイルエラーになります。<code>break</code>で<code>counter * 2</code>を返すように修正してください。`,
      code: `fn main() {
    let mut counter = 0;
    // loopは式なので、breakに渡した値をletで受け取れる
    let result = loop {
        counter += 1;
        if counter == 10 {
            // TODO: counter * 2を返すように修正する
            break;
        }
    };
    println!("result = {}", result);
}`,
      solution: `fn main() {
    let mut counter = 0;
    // breakに渡した値がloop式全体の値になる
    let result = loop {
        counter += 1;
        if counter == 10 {
            break counter * 2;
        }
    };
    println!("result = {}", result);
}`,
      hints: [
        `<code>break;</code>だけだとloop式の値はユニット型<code>()</code>になり、数値として表示できません。`,
        `<code>break 式;</code>の形で、breakの後ろに返したい値を書きます。`
      ],
      expectedOutput: "result = 20"
    },
    {
      id: 26,
      title: "whileで条件付きループ",
      explanation: `<p><code>while</code>は「条件が真である間だけ」繰り返すループです。毎回の繰り返しの<strong>前に</strong>条件を評価し、偽になった時点でループを終了します。</p>
<pre><code>fn main() {
    let mut number = 3;
    while number > 0 {
        println!("残り{}", number);
        number -= 1;
    }
    println!("終了!");
}</code></pre>
<p><code>if</code>と同じく、条件に丸カッコは不要で、条件は必ず<code>bool</code>型です。</p>
<p><code>loop</code>+<code>if</code>+<code>break</code>でも同じ動きは書けますが、比較すると<code>while</code>のほうがずっと簡潔です。</p>
<table>
<tr><th>loop + breakで書いた場合</th><th>whileで書いた場合</th></tr>
<tr><td><pre><code>loop {
    if number == 0 {
        break;
    }
    println!("残り{}", number);
    number -= 1;
}</code></pre></td><td><pre><code>while number > 0 {
    println!("残り{}", number);
    number -= 1;
}</code></pre></td></tr>
</table>
<p>「継続する条件」が最初から明確なときは<code>while</code>を選びましょう。</p>
<p>よくあるミスは、ループ内で条件に関わる変数を更新し忘れることです。上の例で<code>number -= 1;</code>を書き忘れると条件が永遠に真のままとなり、無限ループになります。<code>while</code>を書いたら「この条件はいつか必ず偽になるか？」を自問する習慣をつけてください。</p>`,
      task: `カウントダウンを完成させてください。<code>number</code>が0より大きい間、「5!」「4!」...のように値を出力しながら1ずつ減らし、ループを抜けたら「発射!」と出力します。`,
      code: `fn main() {
    let mut number = 5;
    // TODO: whileループでカウントダウンする
    // numberが0より大きい間、"{}!"の形式で出力して1ずつ減らす
    println!("{}!", number);
    println!("発射!");
}`,
      solution: `fn main() {
    let mut number = 5;
    // numberが0より大きい間だけ繰り返す
    while number > 0 {
        println!("{}!", number);
        number -= 1;
    }
    println!("発射!");
}`,
      hints: [
        `「0より大きい間繰り返す」は<code>while number > 0</code>と書けます。`,
        `ループの中で<code>number -= 1;</code>を忘れると無限ループになります。`
      ],
      expectedOutput: "発射!"
    },
    {
      id: 27,
      title: "forとRange（0..5、1..=10）",
      explanation: `<p>決まった回数の繰り返しには<code>for</code>と<strong>Range（範囲）</strong>を組み合わせるのがRust流です。Rangeは「ここからここまで」という連続した整数の並びを表す書き方です。</p>
<pre><code>fn main() {
    for i in 0..5 {
        println!("i = {}", i); // 0, 1, 2, 3, 4
    }
    for n in 1..=5 {
        println!("n = {}", n); // 1, 2, 3, 4, 5
    }
}</code></pre>
<p>2種類のRangeの違いを正確に覚えてください。</p>
<table>
<tr><th>書き方</th><th>名前</th><th>含まれる値</th></tr>
<tr><td><code>0..5</code></td><td>半開区間</td><td>0, 1, 2, 3, 4（<strong>5は含まない</strong>）</td></tr>
<tr><td><code>1..=5</code></td><td>閉区間</td><td>1, 2, 3, 4, 5（<strong>5を含む</strong>）</td></tr>
</table>
<p><code>0..5</code>が「5を含まない」のは一見不便に思えますが、「要素数5のデータを添字0から4まで処理する」という場面にぴったり一致するため、プログラミングでは半開区間が標準的に使われます。一方、「1から10まで合計する」のように終端も含めたいときは<code>..=</code>を使います。</p>
<p>C言語スタイルの<code>for (int i = 0; i &lt; 5; i++)</code>という構文はRustにはありません。カウンタの初期化・条件・更新を手書きするとオフバイワンエラー（境界を1つ間違えるバグ）が起きやすいため、Rangeで範囲そのものを宣言する設計になっています。</p>`,
      task: `2つの<code>for</code>ループを完成させてください。1つ目は<code>0..5</code>で0から4までを「i = 0」の形式で出力、2つ目は<code>1..=10</code>で1から10までを<code>sum</code>に合計し、最後に「合計 = 55」と出力されるようにします。`,
      code: `fn main() {
    // TODO: 0..5を使って「i = 0」から「i = 4」まで出力する

    let mut sum = 0;
    // TODO: 1..=10を使って1から10までをsumに加算する

    println!("合計 = {}", sum);
}`,
      solution: `fn main() {
    // 0..5は0, 1, 2, 3, 4（5は含まない）
    for i in 0..5 {
        println!("i = {}", i);
    }

    let mut sum = 0;
    // 1..=10は1から10まで（10を含む）
    for n in 1..=10 {
        sum += n;
    }
    println!("合計 = {}", sum);
}`,
      hints: [
        `forの基本形は<code>for 変数 in 範囲 { ... }</code>です。`,
        `終端を含めたい合計の計算には<code>1..=10</code>（イコール付き）を使います。<code>1..10</code>だと合計が45になってしまいます。`
      ],
      expectedOutput: "合計 = 55"
    },
    {
      id: 28,
      title: "continueとループラベル",
      explanation: `<p><code>break</code>がループを終了させるのに対し、<code>continue</code>は「今回の繰り返しだけをスキップして、次の繰り返しに進む」命令です。</p>
<pre><code>fn main() {
    for i in 1..=5 {
        if i % 2 == 0 {
            continue; // 偶数のときは以降を飛ばして次のiへ
        }
        println!("奇数: {}", i);
    }
}</code></pre>
<p>次に、ループが入れ子（ネスト）になった場合を考えます。内側のループで<code>break</code>を書くと、抜けられるのは<strong>内側のループだけ</strong>です。外側のループまで一気に抜けたいときは<strong>ループラベル</strong>を使います。ラベルはシングルクォート始まりの名前（例：<code>'outer</code>）をループの前に付け、<code>break 'outer;</code>のようにどのループを抜けるか指定します。</p>
<pre><code>fn main() {
    'outer: for x in 1..=3 {
        for y in 1..=3 {
            if x * y > 4 {
                break 'outer; // 内側だけでなく外側のループごと抜ける
            }
            println!("{} x {} = {}", x, y, x * y);
        }
    }
    println!("探索終了");
}</code></pre>
<p><code>continue 'outer;</code>のように<code>continue</code>にもラベルを付けられます。二重ループからの脱出は、他の言語ではフラグ変数を用意して二段階で抜けるような回りくどいコードになりがちですが、Rustではラベルで直接意図を表現できます。</p>`,
      task: `2か所を修正してください。(1) 1つ目のループで、<code>i</code>が偶数のときは<code>continue</code>でスキップして奇数だけ出力する。(2) 2つ目の二重ループで、<code>break</code>を<code>break 'outer</code>に変更して外側のループごと抜ける。`,
      code: `fn main() {
    // (1) 奇数だけ出力する
    for i in 1..=5 {
        // TODO: iが偶数(i % 2 == 0)ならcontinueでスキップする
        println!("奇数: {}", i);
    }

    // (2) 掛け算の結果が4を超えたら探索全体を打ち切る
    'outer: for x in 1..=3 {
        for y in 1..=3 {
            if x * y > 4 {
                // TODO: 外側のループごと抜けるようにbreakを修正する
                break;
            }
            println!("{} x {} = {}", x, y, x * y);
        }
    }
}`,
      solution: `fn main() {
    // (1) 奇数だけ出力する
    for i in 1..=5 {
        // 偶数はスキップして次の繰り返しへ
        if i % 2 == 0 {
            continue;
        }
        println!("奇数: {}", i);
    }

    // (2) 掛け算の結果が4を超えたら探索全体を打ち切る
    'outer: for x in 1..=3 {
        for y in 1..=3 {
            if x * y > 4 {
                // ラベルを指定して外側のループを抜ける
                break 'outer;
            }
            println!("{} x {} = {}", x, y, x * y);
        }
    }
}`,
      hints: [
        `偶数の判定は<code>i % 2 == 0</code>です。この条件が真のとき<code>continue;</code>を実行します。`,
        `ラベル付きのbreakは<code>break 'outer;</code>と書きます。ラベル名の前のシングルクォートを忘れずに。`
      ],
      expectedOutput: "2 x 2 = 4"
    },
    {
      id: 29,
      title: "配列をforで走査",
      explanation: `<p>第2章で学んだ配列は、<code>for</code>ループと組み合わせることで真価を発揮します。配列の要素を先頭から順に取り出して処理することを<strong>走査（そうさ）</strong>と呼びます。</p>
<pre><code>fn main() {
    let temperatures = [22, 25, 19, 30];
    for temp in temperatures {
        println!("気温: {}度", temp);
    }
    println!("観測地点数: {}", temperatures.len());
}</code></pre>
<p><code>for temp in temperatures</code>と書くと、各繰り返しで<code>temp</code>に要素が1つずつ入ります。<code>temperatures.len()</code>は要素数を返すメソッドです。</p>
<p>添字を使って<code>for i in 0..temperatures.len()</code>と書き、<code>temperatures[i]</code>でアクセスする方法もありますが、Rustでは要素を直接取り出す書き方が推奨されます。理由は2つあります。</p>
<ul>
<li>添字の範囲を間違える余地がなく、<strong>境界外アクセスの心配がない</strong></li>
<li>「i番目」という間接的な表現が消え、コードの意図が明確になる</li>
</ul>
<p>1つ注意点として、<code>len()</code>の戻り値は<code>usize</code>型（添字やサイズ専用の符号なし整数型）です。<code>i32</code>の変数と混ぜて計算するときは、第2章で学んだ<code>as</code>で型を揃える必要があります。</p>
<pre><code>let total: i32 = 90;
let count = temperatures.len() as i32; // usizeをi32に変換
println!("平均: {}", total / count);</code></pre>`,
      task: `<code>for</code>ループで配列<code>scores</code>の全要素を走査してください。各要素を「点数: 85」の形式で出力しながら<code>total</code>に加算し、最後に合計と平均が表示されるようにします。`,
      code: `fn main() {
    let scores = [85, 92, 78, 60, 95];
    let mut total = 0;
    // TODO: forループでscoresの全要素を走査する
    // 各要素を「点数: {}」の形式で出力し、totalに加算する

    println!("合計 = {}", total);
    println!("平均 = {}", total / scores.len() as i32);
}`,
      solution: `fn main() {
    let scores = [85, 92, 78, 60, 95];
    let mut total = 0;
    // 配列の要素を1つずつ取り出して処理する
    for score in scores {
        println!("点数: {}", score);
        total += score;
    }
    println!("合計 = {}", total);
    println!("平均 = {}", total / scores.len() as i32);
}`,
      hints: [
        `配列の走査は<code>for score in scores { ... }</code>と書けます。各繰り返しでscoreに要素が入ります。`,
        `ループの中で出力と<code>total += score;</code>の両方を行います。`
      ],
      expectedOutput: "合計 = 410"
    },
    {
      id: 30,
      title: "総合演習：FizzBuzz",
      explanation: `<p>第3章の総仕上げとして、プログラミングの定番問題<strong>FizzBuzz</strong>に挑戦します。ルールは次のとおりです。</p>
<ol>
<li>1から順に数を数える</li>
<li>3の倍数のときは数の代わりに「Fizz」と言う</li>
<li>5の倍数のときは「Buzz」と言う</li>
<li>3と5の両方の倍数（つまり15の倍数）のときは「FizzBuzz」と言う</li>
<li>それ以外は数そのものを言う</li>
</ol>
<p>単純に見えますが、この問題には本章で学んだ要素がすべて詰まっています。<code>for</code>と<code>1..=15</code>で範囲を繰り返し、<code>if</code>／<code>else if</code>／<code>else</code>で分岐し、<code>%</code>（剰余演算子。割り算の余りを返す）で倍数を判定します。</p>
<p>最大の落とし穴は<strong>条件を判定する順番</strong>です。15は3の倍数でもあるため、もし<code>i % 3 == 0</code>を最初に判定すると、15のときも「Fizz」と出力されて「FizzBuzz」に到達しません。<code>else if</code>は最初に真になった分岐しか実行しないので、<strong>最も条件が厳しい「3と5の両方の倍数」を最初に</strong>判定する必要があります。これはステップ22で学んだ「条件の順番が結果を左右する」の実践です。</p>
<p>判定には<code>i % 15 == 0</code>と書く方法と、論理積を使って<code>i % 3 == 0 &amp;&amp; i % 5 == 0</code>と書く方法があり、どちらでも正解です。後者のほうが「3と5の両方の倍数」という仕様がそのまま読み取れるという利点があります。</p>`,
      task: `1から15までの数について、3と5の両方の倍数なら「FizzBuzz」、3の倍数なら「Fizz」、5の倍数なら「Buzz」、それ以外は数値そのものを出力するプログラムを完成させてください。`,
      code: `fn main() {
    for i in 1..=15 {
        // TODO: if / else if / elseで分岐する
        // 3と5の両方の倍数: FizzBuzz / 3の倍数: Fizz / 5の倍数: Buzz / それ以外: 数値
        println!("{}", i);
    }
}`,
      solution: `fn main() {
    for i in 1..=15 {
        // 最も条件が厳しい「両方の倍数」を最初に判定するのがポイント
        if i % 3 == 0 && i % 5 == 0 {
            println!("FizzBuzz");
        } else if i % 3 == 0 {
            println!("Fizz");
        } else if i % 5 == 0 {
            println!("Buzz");
        } else {
            println!("{}", i);
        }
    }
}`,
      hints: [
        `「3の倍数」は<code>i % 3 == 0</code>で判定できます。まずどの条件を最初に判定すべきか考えましょう。`,
        `「3と5の両方の倍数」の判定を最初に書かないと、15のとき「Fizz」で止まってしまいます。`,
        `両方の倍数は<code>i % 3 == 0 &amp;&amp; i % 5 == 0</code>、または<code>i % 15 == 0</code>で判定できます。`
      ],
      expectedOutput: "FizzBuzz"
    }
  ]
});
