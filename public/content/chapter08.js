// 第8章：enumとパターンマッチ
registerChapter({
  number: 8,
  title: "enumとパターンマッチ",
  description: "取りうる値を列挙するenumと、それを安全にさばくmatch式を学び、Rustにnullがない理由であるOption型を理解します。",
  steps: [
    {
      id: 71,
      title: "enumの定義",
      explanation: `<p>enum（列挙型）とは、<strong>「取りうる値の候補をすべて列挙して定義する型」</strong>です。たとえば方角は「北・南・東・西」の4つしかありません。こうした「いくつかの決まった選択肢のどれか1つ」を表すのにenumが最適です。</p>
<pre><code>enum Direction {
    North,
    South,
    East,
    West,
}</code></pre>
<p>列挙された各候補（<code>North</code>など）を<strong>バリアント</strong>と呼びます。値を作るには<code>::</code>でバリアントを指定します。</p>
<pre><code>let dir = Direction::North;</code></pre>
<p>「方角を文字列で持てばいいのでは？」と思うかもしれませんが、文字列だと<code>"Norht"</code>のようなタイプミスもコンパイルが通ってしまいます。enumなら存在しないバリアントを書いた時点でコンパイルエラーになり、<strong>不正な値がプログラムに入り込む余地がなくなります</strong>。</p>
<table>
<tr><th></th><th>文字列で表現</th><th>enumで表現</th></tr>
<tr><td>タイプミス</td><td>実行するまで気づけない</td><td>コンパイルエラーで即発覚</td></tr>
<tr><td>候補の一覧性</td><td>コードを全部読まないと不明</td><td>定義を見れば一目瞭然</td></tr>
</table>
<p>構造体と同じく、enumも<code>#[derive(Debug)]</code>を付ければ<code>{:?}</code>でバリアント名を表示できます（前章ステップ69の復習です）。構造体が「複数のデータをまとめて持つ（AかつB）」のに対し、enumは「複数の候補のどれか1つ（AまたはB）」を表す、という対比で覚えましょう。</p>`,
      task: `<code>Direction</code>のバリアントに<code>East</code>と<code>West</code>を追加し、<code>d3</code>と<code>d4</code>にそれぞれ<code>East</code>と<code>West</code>の値を作って、4つの方角が表示されるようにしてください。`,
      code: `#[derive(Debug)]
enum Direction {
    North,
    South,
    // TODO: EastとWestのバリアントを追加する
}

fn main() {
    let d1 = Direction::North;
    let d2 = Direction::South;
    // TODO: d3にEast、d4にWestの値を作る

    println!("d1 = {:?}", d1);
    println!("d2 = {:?}", d2);
    println!("d3 = {:?}", d3);
    println!("d4 = {:?}", d4);
}`,
      solution: `#[derive(Debug)]
enum Direction {
    North,
    South,
    East,
    West,
}

fn main() {
    let d1 = Direction::North;
    let d2 = Direction::South;
    let d3 = Direction::East;
    let d4 = Direction::West;

    println!("d1 = {:?}", d1);
    println!("d2 = {:?}", d2);
    println!("d3 = {:?}", d3);
    println!("d4 = {:?}", d4);
}`,
      hints: [
        `バリアントはenumの波かっこの中にカンマ区切りで並べます。NorthやSouthと同じ書き方です。`,
        `enumの値は「let d3 = Direction::East;」のように「enum名::バリアント名」で作ります。`
      ],
      expectedOutput: "d3 = East"
    },
    {
      id: 72,
      title: "データを持つenum",
      explanation: `<p>Rustのenumが他言語の列挙型と一線を画すのは、<strong>各バリアントがデータを持てる</strong>ことです。しかも、バリアントごとに異なる形のデータを持たせられます。</p>
<pre><code>enum Message {
    Quit,                       // データなし（ユニット構造体と同じ形）
    Move { x: i32, y: i32 },    // 名前付きフィールド（構造体と同じ形）
    Write(String),              // 値を1つ持つ（タプル構造体と同じ形）
}</code></pre>
<p>この<code>Message</code>型は「終了指示」「座標付きの移動指示」「文字列付きの書き込み指示」という<strong>形の異なる3種類のデータを、1つの型として扱える</strong>ことを意味します。前章で学んだ構造体3種類（ユニット・名前付き・タプル）の書き方が、そのままバリアントの書き方に対応しているのが分かるでしょうか。</p>
<p>データ付きのバリアントは、次のように値を添えて作ります。</p>
<pre><code>let m1 = Message::Quit;
let m2 = Message::Move { x: 10, y: 20 };
let m3 = Message::Write(String::from("こんにちは"));</code></pre>
<p>もしenumを使わずに表現しようとすると、指示の種類ごとに別々の構造体を定義することになり、「どれか1つを受け取る関数」を書くのが難しくなります。enumなら<code>Message</code>型の引数1つで3種類すべてを受け取れます。中に入っているデータを取り出す方法は、この後のステップで学ぶ<code>match</code>が担当します。まずは「バリアントごとに違う形のデータを持てる」ことを手を動かして確認しましょう。</p>`,
      task: `<code>m2</code>に「x座標10、y座標20の<code>Move</code>」、<code>m3</code>に「文字列こんにちはを持つ<code>Write</code>」の値を作ってください。`,
      code: `#[derive(Debug)]
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
}

fn main() {
    let m1 = Message::Quit;
    // TODO: m2にMove（x: 10, y: 20）の値を作る

    // TODO: m3にWrite（String::fromで作った「こんにちは」）の値を作る

    println!("m1 = {:?}", m1);
    println!("m2 = {:?}", m2);
    println!("m3 = {:?}", m3);
}`,
      solution: `#[derive(Debug)]
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
}

fn main() {
    let m1 = Message::Quit;
    // 名前付きフィールドを持つバリアントは構造体と同じ書き方
    let m2 = Message::Move { x: 10, y: 20 };
    // 値を1つ持つバリアントはタプル構造体と同じ書き方
    let m3 = Message::Write(String::from("こんにちは"));

    println!("m1 = {:?}", m1);
    println!("m2 = {:?}", m2);
    println!("m3 = {:?}", m3);
}`,
      hints: [
        `Moveバリアントは構造体と同じ形なので「Message::Move { x: 10, y: 20 }」と書きます。`,
        `Writeバリアントはタプル構造体と同じ形なので「Message::Write(String::from("こんにちは"))」と書きます。`
      ],
      expectedOutput: "m2 = Move { x: 10, y: 20 }"
    },
    {
      id: 73,
      title: "matchの基本",
      explanation: `<p>enumの値が「どのバリアントか」によって処理を分けるには、<strong><code>match</code>式</strong>を使います。<code>match</code>は値をパターンと順に照合し、最初に一致した腕（アーム）の処理を実行します。</p>
<pre><code>fn print_direction(dir: Direction) {
    match dir {
        Direction::North =&gt; println!("北に進みます"),
        Direction::South =&gt; println!("南に進みます"),
        Direction::East =&gt; println!("東に進みます"),
        Direction::West =&gt; println!("西に進みます"),
    }
}</code></pre>
<p>構文のポイントは次の通りです。</p>
<ul>
<li>「パターン =&gt; 処理」の1組を<strong>アーム</strong>と呼び、カンマで区切って並べる</li>
<li>上から順に照合され、<strong>最初に一致したアームだけ</strong>が実行される</li>
<li>ifと違い、照合対象を波かっこの前に1回書くだけでよい</li>
</ul>
<p><code>match</code>の最大の特徴は<strong>網羅性チェック</strong>です。すべてのバリアントを扱っていないと、コンパイラが「このバリアントの場合が抜けている」とエラーで教えてくれます。if-elseの連鎖では「else ifを1本書き忘れる」バグが起こりがちですが、<code>match</code>ではコンパイルの時点で漏れが検出されます。この安全性こそ、Rustでenumと<code>match</code>がセットで多用される理由です（網羅性については後のステップでエラーを実際に体験します）。</p>
<p>複数の処理を行いたいアームは、<code>=&gt;</code>の後を波かっこで囲んでブロックにすることもできます。</p>`,
      task: `<code>print_direction</code>の<code>match</code>に、<code>East</code>（「東に進みます」）と<code>West</code>（「西に進みます」）のアームを追加して、4方向すべてに対応させてください。`,
      code: `enum Direction {
    North,
    South,
    East,
    West,
}

fn print_direction(dir: Direction) {
    match dir {
        Direction::North => println!("北に進みます"),
        Direction::South => println!("南に進みます"),
        // TODO: EastとWestのアームを追加する
        // （追加しないと網羅性エラーでコンパイルできない）
    }
}

fn main() {
    print_direction(Direction::North);
    print_direction(Direction::South);
    print_direction(Direction::East);
    print_direction(Direction::West);
}`,
      solution: `enum Direction {
    North,
    South,
    East,
    West,
}

fn print_direction(dir: Direction) {
    match dir {
        Direction::North => println!("北に進みます"),
        Direction::South => println!("南に進みます"),
        Direction::East => println!("東に進みます"),
        Direction::West => println!("西に進みます"),
    }
}

fn main() {
    print_direction(Direction::North);
    print_direction(Direction::South);
    print_direction(Direction::East);
    print_direction(Direction::West);
}`,
      hints: [
        `アームは「パターン => 処理,」の形で、既存の2本と同じように並べます。`,
        `Direction::East => println!("東に進みます"), のように書きます。Westも同様です。`
      ],
      expectedOutput: "東に進みます"
    },
    {
      id: 74,
      title: "matchは式（値を返す）",
      explanation: `<p><code>match</code>は文（実行するだけのもの）ではなく<strong>式（値を返すもの）</strong>です。各アームの<code>=&gt;</code>の右側に書いた式の値が、そのまま<code>match</code>全体の値になります。これはifが式であるのと同じ考え方です。</p>
<pre><code>fn value_in_yen(coin: Coin) -&gt; u32 {
    match coin {
        Coin::One =&gt; 1,
        Coin::Five =&gt; 5,
        Coin::Ten =&gt; 10,
        Coin::Fifty =&gt; 50,
    }
}</code></pre>
<p>この関数では、<code>match</code>式の値がそのまま関数の戻り値になっています。関数本体の最後の式には<code>return</code>もセミコロンも不要という、第4章で学んだルール通りです。変数への代入にも使えます。</p>
<pre><code>let label = match coin {
    Coin::One =&gt; "一円玉",
    Coin::Five =&gt; "五円玉",
    Coin::Ten =&gt; "十円玉",
    Coin::Fifty =&gt; "五十円玉",
};</code></pre>
<p>注意点は2つあります。</p>
<ul>
<li><strong>すべてのアームが同じ型の値を返す</strong>必要がある（あるアームはu32、別のアームは文字列、は不可）</li>
<li>matchの結果を変数に代入する場合は、閉じ波かっこの後に<strong>セミコロンが必要</strong></li>
</ul>
<p>「バリアントごとに対応する値へ変換する」処理は実務でも頻出で、matchを式として使うと余計な可変変数を使わずに簡潔に書けます。</p>`,
      task: `<code>value_in_yen</code>の<code>match</code>を完成させて、各硬貨の金額（One=1、Five=5、Ten=10、Fifty=50）を返すようにしてください。`,
      code: `enum Coin {
    One,
    Five,
    Ten,
    Fifty,
}

fn value_in_yen(coin: Coin) -> u32 {
    // TODO: matchを式として使い、各バリアントに対応する金額を返す
    // One => 1, Five => 5, Ten => 10, Fifty => 50
    match coin {
        Coin::One => 1,
    }
}

fn main() {
    println!("一円玉：{}円", value_in_yen(Coin::One));
    println!("五円玉：{}円", value_in_yen(Coin::Five));
    println!("十円玉：{}円", value_in_yen(Coin::Ten));
    println!("五十円玉：{}円", value_in_yen(Coin::Fifty));

    let total = value_in_yen(Coin::One)
        + value_in_yen(Coin::Five)
        + value_in_yen(Coin::Ten)
        + value_in_yen(Coin::Fifty);
    println!("合計：{}円", total);
}`,
      solution: `enum Coin {
    One,
    Five,
    Ten,
    Fifty,
}

fn value_in_yen(coin: Coin) -> u32 {
    // matchは式なので、この式の値がそのまま関数の戻り値になる
    match coin {
        Coin::One => 1,
        Coin::Five => 5,
        Coin::Ten => 10,
        Coin::Fifty => 50,
    }
}

fn main() {
    println!("一円玉：{}円", value_in_yen(Coin::One));
    println!("五円玉：{}円", value_in_yen(Coin::Five));
    println!("十円玉：{}円", value_in_yen(Coin::Ten));
    println!("五十円玉：{}円", value_in_yen(Coin::Fifty));

    let total = value_in_yen(Coin::One)
        + value_in_yen(Coin::Five)
        + value_in_yen(Coin::Ten)
        + value_in_yen(Coin::Fifty);
    println!("合計：{}円", total);
}`,
      hints: [
        `アームの右側にprintln!ではなく数値をそのまま書くと、その値がmatch式の値になります。`,
        `4つのバリアントすべてにアームを書かないと網羅性エラーになります。すべてのアームはu32を返す必要があります。`
      ],
      expectedOutput: "合計：66円"
    },
    {
      id: 75,
      title: "パターンで中の値を束縛する",
      explanation: `<p>ステップ72で「バリアントはデータを持てる」と学びましたが、そのデータを取り出す方法がまだでした。答えは<code>match</code>のパターンです。パターンの中に変数名を書くと、<strong>バリアントが持つデータがその変数に束縛（バインド）されて</strong>、アームの処理内で使えるようになります。</p>
<pre><code>match msg {
    Message::Quit =&gt; println!("終了します"),
    Message::Move { x, y } =&gt; println!("({}, {})へ移動します", x, y),
    Message::Write(text) =&gt; println!("書き込み：{}", text),
}</code></pre>
<ul>
<li><code>Message::Move { x, y }</code>：名前付きフィールドは<strong>フィールド名をそのまま変数名</strong>として取り出せる</li>
<li><code>Message::Write(text)</code>：タプル形式のデータは<strong>好きな変数名</strong>（ここではtext）を付けて取り出せる</li>
</ul>
<p>つまりパターンは「形の照合」と「データの取り出し」を同時に行っています。「もしMoveなら、そのxとyを使って処理する」という条件分岐と変数宣言が1行で書けるわけです。</p>
<p>ここで重要な安全性のポイントがあります。束縛した変数は<strong>そのアームの中でしか使えません</strong>。「Moveのときのx」をQuitのアームで参照することは構文上不可能です。他言語で起こりがちな「種類の確認を忘れて中身にアクセスしてしまう」バグが、言語の仕組みとして防がれています。これがenumに直接フィールドアクセスする構文が存在しない理由でもあります。中のデータには、必ずパターンを通してアクセスするのです。</p>`,
      task: `<code>process</code>の<code>match</code>に、<code>Move</code>のアーム（xとyを取り出して「(x, y)へ移動します」と表示）と<code>Write</code>のアーム（文字列を取り出して「書き込み：文字列」と表示）を追加してください。`,
      code: `enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
}

fn process(msg: Message) {
    match msg {
        Message::Quit => println!("終了します"),
        // TODO: Moveのアームを追加。xとyを束縛して
        // 「(10, 20)へ移動します」の形式で表示する

        // TODO: Writeのアームを追加。中の文字列をtextという名前で束縛して
        // 「書き込み：こんにちは」の形式で表示する
    }
}

fn main() {
    process(Message::Quit);
    process(Message::Move { x: 10, y: 20 });
    process(Message::Write(String::from("こんにちは")));
}`,
      solution: `enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
}

fn process(msg: Message) {
    match msg {
        Message::Quit => println!("終了します"),
        // 名前付きフィールドはフィールド名で束縛する
        Message::Move { x, y } => println!("({}, {})へ移動します", x, y),
        // タプル形式のデータは好きな変数名で束縛する
        Message::Write(text) => println!("書き込み：{}", text),
    }
}

fn main() {
    process(Message::Quit);
    process(Message::Move { x: 10, y: 20 });
    process(Message::Write(String::from("こんにちは")));
}`,
      hints: [
        `Moveのパターンは「Message::Move { x, y }」と書きます。アームの中でxとyがそのまま使えます。`,
        `Writeのパターンは「Message::Write(text)」と書きます。textにStringの値が束縛されます。`
      ],
      expectedOutput: "(10, 20)へ移動します"
    },
    {
      id: 76,
      title: "Option型とは（nullがないRust）",
      explanation: `<p>多くの言語には「値が存在しない」ことを表すnull（やnil）があります。しかしnullは「nullかもしれない値を、普通の値と同じように使えてしまう」ため、実行時エラー（いわゆるヌルポ）の温床でした。null参照の発明者自身が「10億ドルの過ち」と呼んだほどです。</p>
<p><strong>Rustにはnullがありません。</strong>代わりに「値があるかもしれないし、ないかもしれない」状態を、標準ライブラリのenumである<strong><code>Option&lt;T&gt;</code></strong>型で表します。</p>
<pre><code>enum Option&lt;T&gt; {
    Some(T),    // 値がある（中にT型の値が入っている）
    None,       // 値がない
}</code></pre>
<p><code>T</code>は「任意の型が入る」という意味の記号で、<code>Option&lt;i32&gt;</code>なら「i32があるかもしれない型」と読みます（この仕組み自体は後の章のジェネリクスで学ぶので、今は読み方だけで大丈夫です）。<code>Option</code>と<code>Some</code>、<code>None</code>はよく使われるため、<code>Option::Some</code>と書かなくても<code>Some</code>だけで使える特別扱いになっています。</p>
<pre><code>let some_number = Some(5);              // 型は推論でOption&lt;i32&gt;になる
let absent: Option&lt;i32&gt; = None;   // Noneだけでは型が分からないので注釈が必要</code></pre>
<p>nullとの決定的な違いは、<strong><code>Option&lt;i32&gt;</code>と<code>i32</code>が別の型</strong>だということです。<code>Some(5) + 1</code>のような計算はコンパイルエラーになり、中の値を使うには必ず「値がない場合」の処理を書かされます。「nullチェック忘れ」がコンパイルの時点で不可能になっているのです。</p>`,
      task: `まずそのまま実行して出力を観察してください。次に、<code>some_number</code>の中身を5から42に変えて再実行し、表示が<code>Some(42)</code>に変わることを確認してください。`,
      code: `fn main() {
    // 値がある状態：Someで包む
    let some_number = Some(5);

    // 値がない状態：None（型注釈がないと何のOptionか分からない）
    let absent: Option<i32> = None;

    // Optionは{:?}でそのまま表示できる
    println!("some_number = {:?}", some_number);
    println!("absent = {:?}", absent);

    // TODO: まず実行して出力を観察し、その後Some(5)をSome(42)に
    // 変えて再実行してみよう
}`,
      solution: `fn main() {
    // 値がある状態：Someで包む
    let some_number = Some(42);

    // 値がない状態：None（型注釈がないと何のOptionか分からない）
    let absent: Option<i32> = None;

    // Optionは{:?}でそのまま表示できる
    println!("some_number = {:?}", some_number);
    println!("absent = {:?}", absent);
}`,
      hints: [
        `最初のコードはそのまま動きます。まず実行して、SomeとNoneがどう表示されるか確認しましょう。`,
        `Some(5)のかっこの中の数値を42に書き換えるだけです。`
      ],
      expectedOutput: "some_number = Some(42)"
    },
    {
      id: 77,
      title: "OptionをmatchでさばくOption<i32>の加算",
      explanation: `<p><code>Option&lt;i32&gt;</code>の中の数値に1を足したい、と思っても<code>x + 1</code>とは書けません。<code>Option&lt;i32&gt;</code>と<code>i32</code>は別の型だからです。</p>
<pre><code>let five = Some(5);
let six = five + 1;
// error[E0369]: cannot add integer to Option&lt;i32&gt;</code></pre>
<p>では、どうやって中の値を使うのか。<code>Option</code>はただのenumなので、答えはこの章で学んできた<strong><code>match</code></strong>です。<code>Some</code>と<code>None</code>の2つのバリアントをパターンでさばきます。</p>
<pre><code>fn plus_one(x: Option&lt;i32&gt;) -&gt; Option&lt;i32&gt; {
    match x {
        None =&gt; None,
        Some(i) =&gt; Some(i + 1),
    }
}</code></pre>
<p>ポイントを整理します。</p>
<ul>
<li><code>Some(i)</code>のパターンで<strong>中のi32が変数iに束縛される</strong>（ステップ75と同じ仕組み）</li>
<li>計算した結果は<code>Some(i + 1)</code>と<strong>再びSomeで包んで返す</strong>ことで、「値がないかもしれない」性質を保つ</li>
<li><code>None</code>のときは足し算のしようがないので<code>None</code>をそのまま返す</li>
</ul>
<p>もし<code>None</code>のアームを書き忘れると、網羅性チェックでコンパイルエラーになります。つまり<strong>「値がない場合の扱い」を書き忘れることが構造的に不可能</strong>です。これがnullのある言語との最大の違いで、Option＋matchの組み合わせはRustプログラミングの根幹となるパターンです。</p>`,
      task: `<code>plus_one</code>関数を完成させてください。<code>None</code>なら<code>None</code>を返し、<code>Some(i)</code>なら中の値に1を足して<code>Some</code>で包んで返します。`,
      code: `// TODO: matchを使ってplus_oneを完成させる
// Noneが来たらNoneを、Some(i)が来たらSome(i + 1)を返す
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        // ここに2本のアームを書く
    }
}

fn main() {
    let five = Some(5);
    let six = plus_one(five);
    let none = plus_one(None);

    println!("six = {:?}", six);
    println!("none = {:?}", none);
}`,
      solution: `// Option<i32>を受け取り、値があれば1を足して返す
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        // 値がなければ足し算できないのでNoneのまま返す
        None => None,
        // 中の値をiに束縛し、1を足して再びSomeで包む
        Some(i) => Some(i + 1),
    }
}

fn main() {
    let five = Some(5);
    let six = plus_one(five);
    let none = plus_one(None);

    println!("six = {:?}", six);
    println!("none = {:?}", none);
}`,
      hints: [
        `アームは「None => None,」と「Some(i) => Some(i + 1),」の2本です。`,
        `Some(i)のパターンで中の値がiに束縛されるので、i + 1を計算してSomeで包み直します。戻り値の型がOption<i32>なので、i + 1だけを返すことはできません。`
      ],
      expectedOutput: "six = Some(6)"
    },
    {
      id: 78,
      title: "_プレースホルダと網羅性チェック（エラー体験）",
      explanation: `<p>これまで何度か触れてきた<code>match</code>の<strong>網羅性チェック</strong>を、今回は実際にエラーとして体験します。バリアントの一部しか扱っていない<code>match</code>は、次のようなコンパイルエラーになります。</p>
<pre><code>error[E0004]: non-exhaustive patterns:
              Weather::Cloudy and Weather::Snowy not covered
  = note: the matched value is of type Weather</code></pre>
<p>「CloudyとSnowyのパターンが扱われていない」と、<strong>足りないバリアントを名指しで</strong>教えてくれます。修正方法は2つあります。</p>
<ul>
<li><strong>足りないアームをすべて追加する</strong>：各バリアントで処理を変えたいとき</li>
<li><strong><code>_</code>（アンダースコア）プレースホルダを使う</strong>：残り全部を同じ処理でまとめたいとき</li>
</ul>
<pre><code>match weather {
    Weather::Sunny =&gt; println!("晴れです"),
    Weather::Rainy =&gt; println!("雨です"),
    _ =&gt; println!("その他の天気です"),  // 残りすべてに一致
}</code></pre>
<p><code>_</code>は「どんな値にも一致するが、値は使わない」という特別なパターンで、<strong>必ず最後のアーム</strong>に置きます（matchは上から照合されるため、先頭に置くと後のアームに到達できなくなります）。</p>
<p>ただし<code>_</code>には注意点があります。便利な反面、<strong>後からバリアントを追加したときに<code>_</code>が黙って吸収してしまい、コンパイラが漏れを教えてくれなくなる</strong>のです。「新しいバリアントを追加したら対応箇所をすべて見直したい」場面では、あえて<code>_</code>を使わず全バリアントを列挙するのが実務での定石です。</p>`,
      task: `まず実行して網羅性エラーのメッセージを観察してください。その後、<code>_</code>プレースホルダのアームを最後に追加して「その他の天気です」と表示するように修正してください。`,
      code: `enum Weather {
    Sunny,
    Cloudy,
    Rainy,
    Snowy,
}

fn describe(weather: Weather) {
    // このmatchは網羅されていないためコンパイルエラーになる
    // TODO: まず実行してエラーメッセージを読み、
    // _プレースホルダのアームを追加して修正する
    match weather {
        Weather::Sunny => println!("晴れです"),
        Weather::Rainy => println!("雨です"),
    }
}

fn main() {
    describe(Weather::Sunny);
    describe(Weather::Cloudy);
    describe(Weather::Rainy);
    describe(Weather::Snowy);
}`,
      solution: `enum Weather {
    Sunny,
    Cloudy,
    Rainy,
    Snowy,
}

fn describe(weather: Weather) {
    match weather {
        Weather::Sunny => println!("晴れです"),
        Weather::Rainy => println!("雨です"),
        // _は残りすべてのパターンに一致する。必ず最後に置く
        _ => println!("その他の天気です"),
    }
}

fn main() {
    describe(Weather::Sunny);
    describe(Weather::Cloudy);
    describe(Weather::Rainy);
    describe(Weather::Snowy);
}`,
      hints: [
        `エラーメッセージには、どのバリアントが扱われていないかが具体的に書かれています。まず読んでみましょう。`,
        `最後のアームとして「_ => println!("その他の天気です"),」を追加します。`
      ],
      expectedOutput: "その他の天気です"
    },
    {
      id: 79,
      title: "if letとlet else",
      explanation: `<p><code>Option</code>を<code>match</code>でさばくとき、「<code>Some</code>のときだけ処理したい。<code>None</code>のときは何もしない」という場面では、<code>_ =&gt; ()</code>という空のアームを書くことになり、少し冗長です。</p>
<pre><code>match config_max {
    Some(max) =&gt; println!("最大値は{}です", max),
    _ =&gt; (),
}</code></pre>
<p>この「1パターンだけ処理したい」場合の簡潔な書き方が<strong><code>if let</code></strong>です。</p>
<pre><code>if let Some(max) = config_max {
    println!("最大値は{}です", max);
}</code></pre>
<p>「もし<code>config_max</code>が<code>Some(max)</code>のパターンに一致したら、<code>max</code>を束縛してブロックを実行する」と読みます。一致しなければ何も起きません（<code>else</code>ブロックを付けることもできます）。網羅性チェックは行われないため、「他のパターンを無視してよい」場面専用です。</p>
<p>もう1つ、<strong><code>let else</code></strong>という構文もあります。「パターンに一致したら変数を束縛して<strong>処理を続行</strong>、一致しなければ<code>else</code>ブロックで<strong>早期リターン</strong>する」という流れを表現します。</p>
<pre><code>fn describe(value: Option&lt;i32&gt;) {
    let Some(v) = value else {
        println!("値がありません");
        return;
    };
    println!("値は{}です", v); // ここではvがそのまま使える
}</code></pre>
<p><code>else</code>ブロックは<code>return</code>などで<strong>必ず関数から抜ける</strong>必要があります。<code>if let</code>と違い、束縛した変数をブロックの外（関数の残り全体）で使えるのが利点で、ネストを浅く保ったまま「なければ即終了」を表現できます。</p>`,
      task: `2箇所を書き換えてください。（1）<code>main</code>の<code>match</code>を<code>if let</code>に書き換える。（2）<code>describe</code>の<code>match</code>を<code>let else</code>を使った早期リターンに書き換える。`,
      code: `fn main() {
    let config_max: Option<u8> = Some(3);

    // TODO(1): このmatchをif letで書き換える
    match config_max {
        Some(max) => println!("最大値は{}に設定されています", max),
        _ => (),
    }

    describe(Some(10));
    describe(None);
}

fn describe(value: Option<i32>) {
    // TODO(2): このmatchをlet elseで書き換える
    // Noneなら「値がありません」と表示してreturnし、
    // Some(v)ならvを束縛して最後のprintln!で使う
    match value {
        None => {
            println!("値がありません");
        }
        Some(v) => {
            println!("値は{}です", v);
        }
    }
}`,
      solution: `fn main() {
    let config_max: Option<u8> = Some(3);

    // Someのときだけ処理したいのでif letが簡潔
    if let Some(max) = config_max {
        println!("最大値は{}に設定されています", max);
    }

    describe(Some(10));
    describe(None);
}

fn describe(value: Option<i32>) {
    // 一致しなければelseブロックで必ず関数から抜ける
    let Some(v) = value else {
        println!("値がありません");
        return;
    };
    // ここから先はvをそのまま使える
    println!("値は{}です", v);
}`,
      hints: [
        `if letは「if let パターン = 対象 { 処理 }」の形です。matchの2本のアームが1つのifにまとまります。`,
        `let elseは「let Some(v) = value else { ...; return; };」の形です。elseブロックの最後は必ずreturnで関数を抜けます。`,
        `let elseの後の行では、束縛したvを普通の変数として使えます。`
      ],
      expectedOutput: "最大値は3に設定されています"
    },
    {
      id: 80,
      title: "総合演習（信号機・コイン集計）",
      explanation: `<p>この章の総仕上げです。enumと<code>match</code>、そして前章の<code>impl</code>を組み合わせた2つの小さなプログラムを完成させます。</p>
<h4>題材1：信号機</h4>
<p>信号の色をenumで表し、色ごとの点灯秒数を返す<strong>メソッド</strong>を実装します。ポイントは、<strong>enumにも構造体と同じように<code>impl</code>ブロックでメソッドを定義できる</strong>ことです。</p>
<pre><code>impl TrafficLight {
    fn duration_secs(&amp;self) -&gt; u32 {
        match self {
            TrafficLight::Red =&gt; 30,
            TrafficLight::Yellow =&gt; 3,
            TrafficLight::Green =&gt; 25,
        }
    }
}</code></pre>
<p><code>self</code>は<code>&amp;self</code>（参照）ですが、<code>match self</code>にそのままバリアントのパターンを書けます。参照に対するmatchでは、パターン照合が自動的に参照の先を見てくれるためです（マッチエルゴノミクスと呼ばれる仕組みです。「参照でもmatchは普通に書ける」と覚えておけば十分です）。</p>
<h4>題材2：コイン集計</h4>
<p>硬貨をenumで表し、<code>match</code>を式として使って金額に変換する関数を作り、複数枚の合計を計算します。ステップ74の応用です。</p>
<p>この章で学んだことを整理すると、次のようになります。</p>
<table>
<tr><th>学んだこと</th><th>役割</th></tr>
<tr><td>enum</td><td>取りうる候補を型として列挙する</td></tr>
<tr><td>match</td><td>網羅性を保証しながら候補ごとに処理を分ける</td></tr>
<tr><td>パターン束縛</td><td>バリアントの中のデータを安全に取り出す</td></tr>
<tr><td>Option</td><td>「値がないかもしれない」をnullなしで表す</td></tr>
</table>`,
      task: `2つのTODOを完成させてください。（1）<code>duration_secs</code>メソッド（Red=30秒、Yellow=3秒、Green=25秒）。（2）<code>value_in_yen</code>関数（Ten=10、Fifty=50、Hundred=100、FiveHundred=500）。`,
      code: `enum TrafficLight {
    Red,
    Yellow,
    Green,
}

impl TrafficLight {
    // TODO(1): 点灯秒数を返すメソッドduration_secsを完成させる
    // Red => 30, Yellow => 3, Green => 25
    fn duration_secs(&self) -> u32 {
        match self {
            TrafficLight::Red => 30,
        }
    }
}

enum Coin {
    Ten,
    Fifty,
    Hundred,
    FiveHundred,
}

// TODO(2): 硬貨の金額を返す関数を完成させる
// Ten => 10, Fifty => 50, Hundred => 100, FiveHundred => 500
fn value_in_yen(coin: Coin) -> u32 {
    match coin {
        Coin::Ten => 10,
    }
}

fn main() {
    let red = TrafficLight::Red;
    let yellow = TrafficLight::Yellow;
    let green = TrafficLight::Green;
    println!("赤信号：{}秒", red.duration_secs());
    println!("黄信号：{}秒", yellow.duration_secs());
    println!("青信号：{}秒", green.duration_secs());

    let total = value_in_yen(Coin::Ten)
        + value_in_yen(Coin::Fifty)
        + value_in_yen(Coin::Hundred)
        + value_in_yen(Coin::FiveHundred);
    println!("財布の合計：{}円", total);
}`,
      solution: `enum TrafficLight {
    Red,
    Yellow,
    Green,
}

impl TrafficLight {
    // enumにもimplでメソッドを定義できる
    // &selfに対するmatchでもバリアントのパターンがそのまま書ける
    fn duration_secs(&self) -> u32 {
        match self {
            TrafficLight::Red => 30,
            TrafficLight::Yellow => 3,
            TrafficLight::Green => 25,
        }
    }
}

enum Coin {
    Ten,
    Fifty,
    Hundred,
    FiveHundred,
}

// matchを式として使い、硬貨を金額に変換する
fn value_in_yen(coin: Coin) -> u32 {
    match coin {
        Coin::Ten => 10,
        Coin::Fifty => 50,
        Coin::Hundred => 100,
        Coin::FiveHundred => 500,
    }
}

fn main() {
    let red = TrafficLight::Red;
    let yellow = TrafficLight::Yellow;
    let green = TrafficLight::Green;
    println!("赤信号：{}秒", red.duration_secs());
    println!("黄信号：{}秒", yellow.duration_secs());
    println!("青信号：{}秒", green.duration_secs());

    let total = value_in_yen(Coin::Ten)
        + value_in_yen(Coin::Fifty)
        + value_in_yen(Coin::Hundred)
        + value_in_yen(Coin::FiveHundred);
    println!("財布の合計：{}円", total);
}`,
      hints: [
        `duration_secsもvalue_in_yenも、ステップ74で作ったvalue_in_yenと同じ「matchを式として使う」形です。足りないアームを追加しましょう。`,
        `どちらも全バリアントのアームを書かないと網羅性エラーになります。エラーメッセージが足りないバリアントを教えてくれます。`,
        `合計は10+50+100+500です。実行して確認しましょう。`
      ],
      expectedOutput: "財布の合計：660円"
    }
  ]
});
