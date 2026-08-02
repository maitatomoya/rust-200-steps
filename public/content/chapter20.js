// 第20章：総合演習
registerChapter({
  number: 20,
  title: "総合演習",
  description: "第1〜19章で学んだ知識を組み合わせて、実践的なプログラムを完成させます。各ステップでは骨組みが用意されているので、TODO部分を実装して動かしましょう。",
  steps: [
    {
      id: 191,
      title: "じゃんけん判定（enum＋match）",
      explanation: `<p>ここからは総合演習です。最初の題材はじゃんけんの勝敗判定。使う知識を整理しましょう。</p>
<table>
<tr><th>使う知識</th><th>章</th><th>この課題での役割</th></tr>
<tr><td>enum</td><td>第8章</td><td>手（グー・パー・チョキ）と勝敗を型で表現する</td></tr>
<tr><td>match・タプルパターン</td><td>第8章</td><td>手の組み合わせから勝敗を導く</td></tr>
<tr><td>derive（PartialEq、Copy）</td><td>第7・12章</td><td>手の比較とコピーを可能にする</td></tr>
</table>
<p>設計の考え方はこうです。じゃんけんの状態は「グー・パー・チョキ」の3つ、結果は「勝ち・負け・あいこ」の3つしかありません。こういう<strong>取りうる値が有限個に決まっているデータはenumで表す</strong>のがRustの鉄則です。文字列や数値で表すと「4番目の手」のような不正な値が混入しますが、enumなら型レベルで排除できます。</p>
<p>勝敗判定のロジックは、(自分, 相手)のタプルをmatchにかけるのが定石です。勝ちパターンは3通りしかないので、orパターン（<code>|</code>）でまとめて列挙します。</p>
<pre><code>match (player, opponent) {
    (Hand::Rock, Hand::Scissors)
    | (Hand::Paper, Hand::Rock)
    | (Hand::Scissors, Hand::Paper) =&gt; Outcome::Win,
    _ =&gt; Outcome::Lose,
}
</code></pre>
<p>あいこ（<code>player == opponent</code>）を先にifで処理してしまえば、残りは「勝ち3通りか、それ以外（負け）」だけになり、ロジックが単純になります。matchの網羅性チェック（すべてのパターンを扱わないとコンパイルエラーになる仕組み）のおかげで、判定漏れはコンパイラが検出してくれます。この「まず状態をenumで定義し、matchで処理を書く」流れは、この後の演習でも繰り返し登場する基本形です。</p>`,
      task: `<code>judge</code>関数のTODO部分を実装してください。あいこなら<code>Draw</code>、勝ちパターン3通りなら<code>Win</code>、それ以外は<code>Lose</code>を返します。`,
      code: `#[derive(Debug, Clone, Copy, PartialEq)]
enum Hand {
    Rock,     // グー
    Paper,    // パー
    Scissors, // チョキ
}

#[derive(Debug)]
enum Outcome {
    Win,
    Lose,
    Draw,
}

fn judge(player: Hand, opponent: Hand) -> Outcome {
    // TODO: 勝敗を判定する
    // 1. player == opponent ならOutcome::Draw
    // 2. (player, opponent)のタプルをmatchにかけ、
    //    勝ちの3パターンを|でまとめてOutcome::Win、それ以外をOutcome::Lose
    Outcome::Draw
}

fn label(outcome: &Outcome) -> &str {
    match outcome {
        Outcome::Win => "勝ち",
        Outcome::Lose => "負け",
        Outcome::Draw => "あいこ",
    }
}

fn main() {
    let games = [
        (Hand::Rock, Hand::Scissors),
        (Hand::Paper, Hand::Scissors),
        (Hand::Rock, Hand::Rock),
    ];

    for (p, o) in games {
        let result = judge(p, o);
        println!("{:?} vs {:?} => {}", p, o, label(&result));
    }
}
`,
      solution: `#[derive(Debug, Clone, Copy, PartialEq)]
enum Hand {
    Rock,     // グー
    Paper,    // パー
    Scissors, // チョキ
}

#[derive(Debug)]
enum Outcome {
    Win,
    Lose,
    Draw,
}

fn judge(player: Hand, opponent: Hand) -> Outcome {
    // あいこを先に処理すると残りのロジックが単純になる
    if player == opponent {
        return Outcome::Draw;
    }
    // 勝ちの3パターンをorパターンでまとめて列挙する
    match (player, opponent) {
        (Hand::Rock, Hand::Scissors)
        | (Hand::Paper, Hand::Rock)
        | (Hand::Scissors, Hand::Paper) => Outcome::Win,
        _ => Outcome::Lose,
    }
}

fn label(outcome: &Outcome) -> &str {
    match outcome {
        Outcome::Win => "勝ち",
        Outcome::Lose => "負け",
        Outcome::Draw => "あいこ",
    }
}

fn main() {
    let games = [
        (Hand::Rock, Hand::Scissors),
        (Hand::Paper, Hand::Scissors),
        (Hand::Rock, Hand::Rock),
    ];

    for (p, o) in games {
        let result = judge(p, o);
        println!("{:?} vs {:?} => {}", p, o, label(&result));
    }
}
`,
      hints: [
        `HandはPartialEqをderiveしているので、player == opponent であいこを判定できます。`,
        `タプルのmatchは match (player, opponent) { (Hand::Rock, Hand::Scissors) => ..., } の形です。`,
        `複数パターンを同じ腕にまとめるには、パターンを|でつなぎます。残りは_で受けます。`
      ],
      expectedOutput: "Rock vs Scissors => 勝ち"
    },
    {
      id: 192,
      title: "成績集計（Vec＋イテレータ）",
      explanation: `<p>次はデータ集計です。構造体のVecから統計情報を取り出します。</p>
<table>
<tr><th>使う知識</th><th>章</th><th>この課題での役割</th></tr>
<tr><td>struct</td><td>第7章</td><td>生徒（名前と点数）を1つの型にまとめる</td></tr>
<tr><td>Vec</td><td>第9章</td><td>生徒の一覧を保持する</td></tr>
<tr><td>イテレータ（map、filter、sum、max_by_key）</td><td>第13章</td><td>集計処理を宣言的に書く</td></tr>
</table>
<p>設計の考え方：forループでもすべて書けますが、イテレータチェーンを使うと「何をしたいか」がコードにそのまま現れます。3つの集計はそれぞれ定番の型があります。</p>
<ul>
<li><strong>平均点</strong>：<code>iter().map(|s| s.score).sum()</code>で合計を出し、要素数で割る。<code>sum()</code>は戻り値の型を推論できないため<code>let total: u32 = ...</code>のように型注釈が必要です。整数同士の割り算は切り捨てになるので、<code>as f64</code>で浮動小数点数に変換してから割ります。</li>
<li><strong>条件を満たす名前の一覧</strong>：<code>filter</code>で絞り込み、<code>map</code>で名前だけ取り出し、<code>collect()</code>でVecに集めます。</li>
<li><strong>最高得点者</strong>：<code>max_by_key(|s| s.score)</code>は「キーが最大の要素」を<code>Option</code>で返します（空のVecの可能性があるため）。</li>
</ul>
<pre><code>let passed: Vec&lt;&amp;str&gt; = students.iter()
    .filter(|s| s.score &gt;= 80)
    .map(|s| s.name.as_str())
    .collect();
</code></pre>
<p>1つ注意したいのは所有権です。<code>iter()</code>は要素への参照を返すので、集計後も<code>students</code>は使い続けられます。<code>into_iter()</code>にするとVecが消費されてしまうため、複数回集計するこの課題では<code>iter()</code>一択です。</p>`,
      task: `mainの3つのTODOを実装してください。(1)平均点（合計÷人数、f64で計算）、(2)80点以上の生徒名の<code>Vec&lt;&amp;str&gt;</code>、(3)<code>max_by_key</code>による最高得点者です。`,
      code: `struct Student {
    name: String,
    score: u32,
}

fn main() {
    let students = vec![
        Student { name: String::from("佐藤"), score: 82 },
        Student { name: String::from("鈴木"), score: 91 },
        Student { name: String::from("高橋"), score: 68 },
        Student { name: String::from("田中"), score: 75 },
    ];

    // TODO(1): 全員の合計点をsum()で求め、人数で割って平均点を計算する
    // 整数の割り算にならないよう、as f64で変換してから割ること
    let average = 0.0;
    println!("平均点: {}", average);

    // TODO(2): 80点以上の生徒の名前だけをVec<&str>に集める
    // filter -> map(|s| s.name.as_str()) -> collect
    let passed: Vec<&str> = vec![];
    println!("80点以上: {:?}", passed);

    // TODO(3): max_by_keyで最高得点の生徒を探す（Optionが返るのでunwrapする）
    let top = &students[0];
    println!("最高得点: {}（{}点）", top.name, top.score);
}
`,
      solution: `struct Student {
    name: String,
    score: u32,
}

fn main() {
    let students = vec![
        Student { name: String::from("佐藤"), score: 82 },
        Student { name: String::from("鈴木"), score: 91 },
        Student { name: String::from("高橋"), score: 68 },
        Student { name: String::from("田中"), score: 75 },
    ];

    // sum()は型推論できないため、totalに型注釈を付ける
    let total: u32 = students.iter().map(|s| s.score).sum();
    let average = total as f64 / students.len() as f64;
    println!("平均点: {}", average);

    // 参照のまま絞り込み、名前だけを取り出して集める
    let passed: Vec<&str> = students
        .iter()
        .filter(|s| s.score >= 80)
        .map(|s| s.name.as_str())
        .collect();
    println!("80点以上: {:?}", passed);

    // max_by_keyはOptionを返す（Vecが空の場合None）
    let top = students.iter().max_by_key(|s| s.score).unwrap();
    println!("最高得点: {}（{}点）", top.name, top.score);
}
`,
      hints: [
        `合計は let total: u32 = students.iter().map(|s| s.score).sum(); です。型注釈を忘れずに。`,
        `平均は total as f64 / students.len() as f64 とします。両方f64に変換するのがポイントです。`,
        `最高得点者は students.iter().max_by_key(|s| s.score).unwrap() で取り出せます。`
      ],
      expectedOutput: "最高得点: 鈴木（91点）"
    },
    {
      id: 193,
      title: "在庫管理（struct＋HashMap）",
      explanation: `<p>商品名をキーに在庫を管理するシステムを作ります。</p>
<table>
<tr><th>使う知識</th><th>章</th><th>この課題での役割</th></tr>
<tr><td>struct＋impl</td><td>第7章</td><td>在庫システムをItemとInventoryの2つの型で表す</td></tr>
<tr><td>HashMap</td><td>第9章</td><td>商品名から商品情報を高速に引く</td></tr>
<tr><td>Result</td><td>第10章</td><td>「在庫不足」「未登録」という失敗を型で伝える</td></tr>
<tr><td>可変参照（get_mut）</td><td>第6・9章</td><td>在庫数を直接書き換える</td></tr>
</table>
<p>設計の考え方：核心は<code>sell</code>（販売）メソッドの失敗をどう扱うかです。販売は「未登録の商品」「在庫不足」という2種類の理由で失敗します。こういうとき、戻り値を<code>Result&lt;u32, String&gt;</code>（成功なら売上金額、失敗なら理由）にすると、呼び出し側が失敗処理を<strong>忘れられなくなります</strong>。</p>
<p>実装では<code>HashMap</code>の<code>get_mut</code>がポイントです。<code>get</code>は不変参照しか返さないため在庫数を減らせません。<code>get_mut(name)</code>で<code>Option&lt;&amp;mut Item&gt;</code>を受け取り、matchで分岐します。</p>
<pre><code>match self.items.get_mut(name) {
    Some(item) =&gt; {
        // item.stockを検査し、足りれば減らしてOk(金額)
    }
    None =&gt; Err(format!("{}は登録されていません", name)),
}
</code></pre>
<p>もう1つの集計メソッド<code>total_value</code>では、<code>values()</code>（全部の値を巡回するイテレータ）と<code>map</code>・<code>sum</code>を組み合わせます。HashMapの巡回順序は不定ですが、合計値は順序に関係なく同じになるため安心して使えます。この「格納はHashMap、失敗はResult、集計はイテレータ」という組み合わせは、実務のデータ管理コードの縮図です。</p>`,
      task: `<code>sell</code>メソッドと<code>total_value</code>メソッドのTODOを実装してください。sellは未登録・在庫不足のときErr、成功時は在庫を減らして売上金額（単価×個数）をOkで返します。`,
      code: `use std::collections::HashMap;

struct Item {
    price: u32,
    stock: u32,
}

struct Inventory {
    items: HashMap<String, Item>,
}

impl Inventory {
    fn new() -> Self {
        Inventory { items: HashMap::new() }
    }

    fn add(&mut self, name: &str, price: u32, stock: u32) {
        self.items.insert(name.to_string(), Item { price, stock });
    }

    fn sell(&mut self, name: &str, quantity: u32) -> Result<u32, String> {
        // TODO: get_mutで商品を探して分岐する
        // - 見つからない: Err(format!("{}は登録されていません", name))
        // - 在庫がquantity未満: Err(format!("{}の在庫が足りません（残り{}個）", name, item.stock))
        // - 成功: 在庫を減らして Ok(item.price * quantity)
        Err(String::from("未実装"))
    }

    fn total_value(&self) -> u32 {
        // TODO: values()とmap、sumで「単価×在庫数」の総合計を返す
        0
    }
}

fn main() {
    let mut inv = Inventory::new();
    inv.add("りんご", 120, 10);
    inv.add("みかん", 80, 20);

    match inv.sell("りんご", 3) {
        Ok(amount) => println!("売上: {}円", amount),
        Err(e) => println!("エラー: {}", e),
    }
    match inv.sell("みかん", 100) {
        Ok(amount) => println!("売上: {}円", amount),
        Err(e) => println!("エラー: {}", e),
    }
    println!("在庫総額: {}円", inv.total_value());
}
`,
      solution: `use std::collections::HashMap;

struct Item {
    price: u32,
    stock: u32,
}

struct Inventory {
    items: HashMap<String, Item>,
}

impl Inventory {
    fn new() -> Self {
        Inventory { items: HashMap::new() }
    }

    fn add(&mut self, name: &str, price: u32, stock: u32) {
        self.items.insert(name.to_string(), Item { price, stock });
    }

    // 失敗理由をResultで呼び出し側に伝える
    fn sell(&mut self, name: &str, quantity: u32) -> Result<u32, String> {
        // 在庫を書き換えるためget_mutで可変参照を取る
        match self.items.get_mut(name) {
            Some(item) => {
                if item.stock < quantity {
                    Err(format!("{}の在庫が足りません（残り{}個）", name, item.stock))
                } else {
                    item.stock -= quantity;
                    Ok(item.price * quantity)
                }
            }
            None => Err(format!("{}は登録されていません", name)),
        }
    }

    // 合計は巡回順序に依存しないのでHashMapでも安全に集計できる
    fn total_value(&self) -> u32 {
        self.items.values().map(|item| item.price * item.stock).sum()
    }
}

fn main() {
    let mut inv = Inventory::new();
    inv.add("りんご", 120, 10);
    inv.add("みかん", 80, 20);

    match inv.sell("りんご", 3) {
        Ok(amount) => println!("売上: {}円", amount),
        Err(e) => println!("エラー: {}", e),
    }
    match inv.sell("みかん", 100) {
        Ok(amount) => println!("売上: {}円", amount),
        Err(e) => println!("エラー: {}", e),
    }
    println!("在庫総額: {}円", inv.total_value());
}
`,
      hints: [
        `sellではまず self.items.get_mut(name) をmatchにかけ、SomeとNoneで分岐します。`,
        `Someの腕の中でさらにif item.stock < quantityをチェックし、足りれば item.stock -= quantity; してからOkを返します。`,
        `total_valueは self.items.values().map(|item| item.price * item.stock).sum() の1行で書けます。`
      ],
      expectedOutput: "在庫総額: 2440円"
    },
    {
      id: 194,
      title: "テキスト統計（文字列処理＋HashMap）",
      explanation: `<p>文章中の単語の出現回数を数え、頻出単語ランキングを作ります。</p>
<table>
<tr><th>使う知識</th><th>章</th><th>この課題での役割</th></tr>
<tr><td>文字列処理（split_whitespace）</td><td>第9章</td><td>文章を単語に分割する</td></tr>
<tr><td>HashMapとentry API</td><td>第9章</td><td>単語ごとの出現回数を数える</td></tr>
<tr><td>Vecへの変換とsort_by</td><td>第9・13章</td><td>順序が不定なHashMapを並べ替える</td></tr>
</table>
<p>設計の考え方：出現回数のカウントには<code>entry</code> APIの定番イディオムを使います。</p>
<pre><code>*counts.entry(word).or_insert(0) += 1;
</code></pre>
<p>「キーがあればその値への可変参照を、なければ0を挿入してその参照を返す」ので、初回も2回目以降も同じ1行で処理できます。先頭の<code>*</code>は参照の指す先を書き換えるための参照外しです。</p>
<p>次が本課題の設計上の急所です。<strong>HashMapの巡回順序は実行のたびに変わる</strong>ため、そのまま出力するとランキングになりません。そこで、いったん<code>Vec</code>に移してからソートします。</p>
<pre><code>let mut pairs: Vec&lt;(&amp;str, u32)&gt; = counts.into_iter().collect();
pairs.sort_by(|a, b| b.1.cmp(&amp;a.1).then(a.0.cmp(b.0)));
</code></pre>
<p><code>sort_by</code>の比較関数では、まず出現回数を降順（<code>b.1.cmp(&amp;a.1)</code>と逆順に比較）で並べ、<code>then</code>で「回数が同じなら単語のアルファベット順」という第2キーを指定しています。第2キーまで決めておかないと同数の単語の順序が不定のままになる、という点は実務のソート処理でも頻出の注意点です。最後に<code>iter().take(3)</code>で上位3件だけを取り出せば完成です。</p>`,
      task: `2つのTODOを実装してください。(1)entry APIで単語の出現回数を数える、(2)Vecに変換して「回数の降順、同数なら単語の昇順」でソートする、の2つです。`,
      code: `use std::collections::HashMap;

fn main() {
    let text = "the quick brown fox jumps over the lazy dog the fox";

    let mut counts: HashMap<&str, u32> = HashMap::new();
    // TODO(1): split_whitespace()で単語に分割し、
    // entry APIで出現回数を数える（*counts.entry(word).or_insert(0) += 1;）

    println!("単語数: {}", text.split_whitespace().count());
    println!("種類数: {}", counts.len());

    // TODO(2): countsをVec<(&str, u32)>に変換し、
    // 回数の降順（同数なら単語の昇順）でソートする
    let pairs: Vec<(&str, u32)> = vec![];

    println!("頻出トップ3:");
    for (word, count) in pairs.iter().take(3) {
        println!("{}: {}回", word, count);
    }
}
`,
      solution: `use std::collections::HashMap;

fn main() {
    let text = "the quick brown fox jumps over the lazy dog the fox";

    let mut counts: HashMap<&str, u32> = HashMap::new();
    // entry APIによる出現回数カウントの定番イディオム
    for word in text.split_whitespace() {
        *counts.entry(word).or_insert(0) += 1;
    }

    println!("単語数: {}", text.split_whitespace().count());
    println!("種類数: {}", counts.len());

    // HashMapの順序は不定なので、Vecに移してからソートする
    let mut pairs: Vec<(&str, u32)> = counts.into_iter().collect();
    // 第1キー：回数の降順、第2キー：単語の昇順
    pairs.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(b.0)));

    println!("頻出トップ3:");
    for (word, count) in pairs.iter().take(3) {
        println!("{}: {}回", word, count);
    }
}
`,
      hints: [
        `カウントは for word in text.split_whitespace() のループの中で、entryのイディオムを1行書くだけです。`,
        `Vecへの変換は counts.into_iter().collect() です。ソートするのでlet mut pairsにします。`,
        `降順にするには比較の向きを逆にして b.1.cmp(&a.1) とします。.then(a.0.cmp(b.0))で第2キーを足せます。`
      ],
      expectedOutput: "the: 3回"
    },
    {
      id: 195,
      title: "エラー処理付き計算パイプライン（Result＋?）",
      explanation: `<p>「文字列を数値に変換し、割り算し、結果を加工する」という多段の処理を、エラーに強いパイプラインとして組み立てます。</p>
<table>
<tr><th>使う知識</th><th>章</th><th>この課題での役割</th></tr>
<tr><td>Result</td><td>第10章</td><td>各段階の失敗を表現する</td></tr>
<tr><td>?演算子</td><td>第10章</td><td>失敗を呼び出し元へ即座に伝播する</td></tr>
<tr><td>parseとmap_err</td><td>第9・10章</td><td>変換失敗を独自のエラーメッセージに変える</td></tr>
</table>
<p>設計の考え方：多段処理のエラーハンドリングは、matchを入れ子にすると急速に読めなくなります（いわゆるネスト地獄）。Rustの答えが<code>?</code>演算子です。「<code>Ok</code>なら中身を取り出して続行、<code>Err</code>ならその場で関数から<code>Err</code>を返す」を1文字で表現します。</p>
<pre><code>fn calc(a_str: &amp;str, b_str: &amp;str) -&gt; Result&lt;f64, String&gt; {
    let a = parse_number(a_str)?;   // 失敗したらここで即return
    let b = parse_number(b_str)?;
    let result = divide(a, b)?;
    Ok(result * 100.0)
}
</code></pre>
<p>この書き方の利点は、<strong>正常系の流れが上から下へ一直線に読める</strong>ことです。エラー処理のコードが本筋を邪魔しません。</p>
<p>もう1つの道具が<code>map_err</code>です。<code>parse::&lt;f64&gt;()</code>の失敗は<code>ParseFloatError</code>という型で返りますが、パイプライン全体のエラー型は<code>String</code>に統一したい。そこで<code>map_err(|_| format!(...))</code>でエラー型を変換します。<code>?</code>を使うには「関数の戻り値のエラー型と、?を付ける式のエラー型が一致している（か変換可能である）」必要がある、という点がこの課題の急所です。すべての段のエラー型を<code>String</code>に揃えることで、<code>?</code>が3箇所とも素直につながります。</p>`,
      task: `<code>calc</code>関数のTODOを実装してください。<code>parse_number</code>で2つの文字列を数値化し、<code>divide</code>で割り、結果を100倍して<code>Ok</code>で返します。エラー処理はすべて<code>?</code>演算子で行うこと。`,
      code: `// 文字列をf64に変換する。失敗したら独自メッセージのErrにする
fn parse_number(s: &str) -> Result<f64, String> {
    s.trim().parse::<f64>().map_err(|_| format!("「{}」は数値に変換できません", s))
}

// 0除算をエラーとして扱う割り算
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err(String::from("0で割ることはできません"))
    } else {
        Ok(a / b)
    }
}

fn calc(a_str: &str, b_str: &str) -> Result<f64, String> {
    // TODO: ?演算子を使って次のパイプラインを実装する
    // 1. a_strをparse_numberで数値化
    // 2. b_strをparse_numberで数値化
    // 3. divideで割り算
    // 4. 結果を100.0倍してOkで返す
    Err(String::from("未実装"))
}

fn main() {
    for (a, b) in [("10", "4"), ("10", "0"), ("abc", "2")] {
        match calc(a, b) {
            Ok(v) => println!("{} / {} の100倍 = {}", a, b, v),
            Err(e) => println!("エラー: {}", e),
        }
    }
}
`,
      solution: `// 文字列をf64に変換する。失敗したら独自メッセージのErrにする
fn parse_number(s: &str) -> Result<f64, String> {
    s.trim().parse::<f64>().map_err(|_| format!("「{}」は数値に変換できません", s))
}

// 0除算をエラーとして扱う割り算
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err(String::from("0で割ることはできません"))
    } else {
        Ok(a / b)
    }
}

// どの段階で失敗しても?がErrを即座に呼び出し元へ返す
fn calc(a_str: &str, b_str: &str) -> Result<f64, String> {
    let a = parse_number(a_str)?;
    let b = parse_number(b_str)?;
    let result = divide(a, b)?;
    Ok(result * 100.0)
}

fn main() {
    for (a, b) in [("10", "4"), ("10", "0"), ("abc", "2")] {
        match calc(a, b) {
            Ok(v) => println!("{} / {} の100倍 = {}", a, b, v),
            Err(e) => println!("エラー: {}", e),
        }
    }
}
`,
      hints: [
        `let a = parse_number(a_str)?; のように、Resultを返す式の末尾に?を付けると中身が取り出せます。`,
        `divideも同様に let result = divide(a, b)?; とつなげます。`,
        `最後は Ok(result * 100.0) を返します。関数の戻り値はResultなのでOkで包むのを忘れずに。`
      ],
      expectedOutput: "エラー: 0で割ることはできません"
    },
    {
      id: 196,
      title: "図書館の貸出管理（struct＋enum＋Vec）",
      explanation: `<p>本の「貸出中か、貸出可能か」という状態遷移を持つシステムを作ります。</p>
<table>
<tr><th>使う知識</th><th>章</th><th>この課題での役割</th></tr>
<tr><td>データ付きenum</td><td>第8章</td><td>Borrowed(String)で「誰が借りているか」ごと状態を表す</td></tr>
<tr><td>struct＋Vec</td><td>第7・9章</td><td>蔵書の一覧を管理する</td></tr>
<tr><td>iter_mut().find()</td><td>第13章</td><td>タイトルで本を検索して可変参照を得る</td></tr>
<tr><td>Result</td><td>第10章</td><td>貸出・返却の失敗を型で伝える</td></tr>
</table>
<p>設計の考え方：この課題の核心は状態の表現です。<code>is_borrowed: bool</code>と<code>borrower: String</code>の2フィールドで表すこともできますが、それだと「貸出中でないのに借り手の名前が残っている」という矛盾した状態が作れてしまいます。データ付きenumなら、<code>Borrowed(String)</code>のときにだけ借り手が存在することが型で保証されます。</p>
<pre><code>enum Status {
    Available,
    Borrowed(String), // 借りている人の名前を状態に埋め込む
}
</code></pre>
<p>実装面のポイントは検索です。<code>Vec</code>から条件に合う要素の<strong>可変参照</strong>を得るには<code>iter_mut().find(|b| b.title == title)</code>を使います。戻り値は<code>Option&lt;&amp;mut Book&gt;</code>なので、「見つからない」ケースの処理をコンパイラが強制してきます。</p>
<p>貸出処理では、見つかった本の状態をさらにmatchで分岐します。<code>Status::Borrowed(who)</code>とパターンマッチすれば借り手の名前が取り出せるので、「誰々さんが貸出中です」という具体的なエラーメッセージを作れます。enumにデータを埋め込んだ設計の恩恵がここで効いてきます。検索の失敗と状態の不整合、2種類の失敗をどちらも<code>Result</code>のErrに落とし込むのがこの課題のゴールです。</p>`,
      task: `<code>borrow_book</code>（貸出）と<code>return_book</code>（返却）のTODOを実装してください。存在しない本、貸出中の本の貸出、未貸出の本の返却はそれぞれErrにします。`,
      code: `#[derive(Debug, PartialEq)]
enum Status {
    Available,
    Borrowed(String), // 借りている人の名前
}

struct Book {
    title: String,
    status: Status,
}

struct Library {
    books: Vec<Book>,
}

impl Library {
    fn new() -> Self {
        Library { books: Vec::new() }
    }

    fn add(&mut self, title: &str) {
        self.books.push(Book { title: title.to_string(), status: Status::Available });
    }

    // タイトルで本を探して可変参照を返す（実装済みのヘルパー）
    fn find_mut(&mut self, title: &str) -> Option<&mut Book> {
        self.books.iter_mut().find(|b| b.title == title)
    }

    fn borrow_book(&mut self, title: &str, user: &str) -> Result<(), String> {
        // TODO: find_mutで本を探し、
        // - 見つからない: Err(format!("「{}」は蔵書にありません", title))
        // - Borrowed(who): Err(format!("「{}」は{}さんが貸出中です", title, who))
        // - Available: statusをBorrowed(user.to_string())にしてOk(())
        Err(String::from("未実装"))
    }

    fn return_book(&mut self, title: &str) -> Result<(), String> {
        // TODO: find_mutで本を探し、
        // - 見つからない: Err(format!("「{}」は蔵書にありません", title))
        // - Available: Err(format!("「{}」は貸し出されていません", title))
        // - Borrowed: statusをAvailableに戻してOk(())
        Err(String::from("未実装"))
    }
}

fn main() {
    let mut lib = Library::new();
    lib.add("Rust入門");
    lib.add("プログラミング言語Rust");

    match lib.borrow_book("Rust入門", "田中") {
        Ok(()) => println!("Rust入門を貸出しました"),
        Err(e) => println!("エラー: {}", e),
    }
    match lib.borrow_book("Rust入門", "鈴木") {
        Ok(()) => println!("Rust入門を貸出しました"),
        Err(e) => println!("エラー: {}", e),
    }
    match lib.return_book("Rust入門") {
        Ok(()) => println!("Rust入門が返却されました"),
        Err(e) => println!("エラー: {}", e),
    }
    match lib.borrow_book("存在しない本", "佐藤") {
        Ok(()) => println!("貸出しました"),
        Err(e) => println!("エラー: {}", e),
    }
}
`,
      solution: `#[derive(Debug, PartialEq)]
enum Status {
    Available,
    Borrowed(String), // 借りている人の名前
}

struct Book {
    title: String,
    status: Status,
}

struct Library {
    books: Vec<Book>,
}

impl Library {
    fn new() -> Self {
        Library { books: Vec::new() }
    }

    fn add(&mut self, title: &str) {
        self.books.push(Book { title: title.to_string(), status: Status::Available });
    }

    // タイトルで本を探して可変参照を返す（実装済みのヘルパー）
    fn find_mut(&mut self, title: &str) -> Option<&mut Book> {
        self.books.iter_mut().find(|b| b.title == title)
    }

    fn borrow_book(&mut self, title: &str, user: &str) -> Result<(), String> {
        match self.find_mut(title) {
            None => Err(format!("「{}」は蔵書にありません", title)),
            Some(book) => match &book.status {
                // データ付きenumから借り手の名前を取り出せる
                Status::Borrowed(who) => {
                    Err(format!("「{}」は{}さんが貸出中です", title, who))
                }
                Status::Available => {
                    book.status = Status::Borrowed(user.to_string());
                    Ok(())
                }
            },
        }
    }

    fn return_book(&mut self, title: &str) -> Result<(), String> {
        match self.find_mut(title) {
            None => Err(format!("「{}」は蔵書にありません", title)),
            Some(book) => {
                if book.status == Status::Available {
                    Err(format!("「{}」は貸し出されていません", title))
                } else {
                    book.status = Status::Available;
                    Ok(())
                }
            }
        }
    }
}

fn main() {
    let mut lib = Library::new();
    lib.add("Rust入門");
    lib.add("プログラミング言語Rust");

    match lib.borrow_book("Rust入門", "田中") {
        Ok(()) => println!("Rust入門を貸出しました"),
        Err(e) => println!("エラー: {}", e),
    }
    match lib.borrow_book("Rust入門", "鈴木") {
        Ok(()) => println!("Rust入門を貸出しました"),
        Err(e) => println!("エラー: {}", e),
    }
    match lib.return_book("Rust入門") {
        Ok(()) => println!("Rust入門が返却されました"),
        Err(e) => println!("エラー: {}", e),
    }
    match lib.borrow_book("存在しない本", "佐藤") {
        Ok(()) => println!("貸出しました"),
        Err(e) => println!("エラー: {}", e),
    }
}
`,
      hints: [
        `まず self.find_mut(title) をmatchにかけ、NoneとSome(book)で分岐します。`,
        `Some(book)の中では match &book.status でさらに分岐します。&を付けて借用するのがポイントです（Stringを持つenumなので）。`,
        `Borrowed(who)のパターンで借り手の名前が取り出せます。Availableの腕では book.status = Status::Borrowed(user.to_string()); と代入します。`
      ],
      expectedOutput: "エラー: 「Rust入門」は田中さんが貸出中です"
    },
    {
      id: 197,
      title: "トレイトで多態（図形の面積）",
      explanation: `<p>種類の異なる図形をひとまとめに扱い、同じ呼び出しで異なる計算を実行させます。いわゆるポリモーフィズム（多態性：同じインターフェースで型ごとに異なる振る舞いをさせること）の実践です。</p>
<table>
<tr><th>使う知識</th><th>章</th><th>この課題での役割</th></tr>
<tr><td>トレイト定義と実装</td><td>第12章</td><td>Shapeという共通インターフェースを定める</td></tr>
<tr><td>デフォルト実装</td><td>第12章</td><td>describeを全図形で共有する</td></tr>
<tr><td>トレイトオブジェクト（Box&lt;dyn Trait&gt;）</td><td>第12章</td><td>異なる型を1つのVecに混在させる</td></tr>
<tr><td>イテレータ</td><td>第13章</td><td>全図形の面積を合計する</td></tr>
</table>
<p>設計の考え方：まず「すべての図形に共通する操作は何か」を考えます。ここでは「名前を返す」「面積を計算する」の2つです。これをトレイトのメソッドとして宣言し、各図形が自分の計算式で実装します。</p>
<p>一方、「(名前)の面積は(値)」という説明文の組み立ては全図形で共通です。こういう共通処理はデフォルト実装（トレイト側に書く実装）にすると、各図形で書くのは差分だけになります。</p>
<pre><code>trait Shape {
    fn name(&amp;self) -&gt; String;
    fn area(&amp;self) -&gt; f64;
    fn describe(&amp;self) -&gt; String {
        format!("{}の面積は{:.2}", self.name(), self.area())
    }
}
</code></pre>
<p>次に、長方形・円・三角形という別々の型を1つのVecに入れる方法です。<code>Vec&lt;Box&lt;dyn Shape&gt;&gt;</code>とすることで、「Shapeを実装した何か」をヒープに置いて統一的に扱えます。<code>shape.describe()</code>と呼ぶと、実行時にその実体の型のメソッドが選ばれます（動的ディスパッチ）。円の面積には<code>std::f64::consts::PI</code>を使いましょう。手書きの3.14より正確で、意図も明確になります。</p>`,
      task: `TODOは2箇所です。(1)<code>Shape</code>トレイトに<code>describe</code>のデフォルト実装を追加、(2)<code>Circle</code>と<code>Triangle</code>への<code>Shape</code>実装（円はπ×半径×半径、三角形は底辺×高さ÷2）を書いてください。`,
      code: `trait Shape {
    fn name(&self) -> String;
    fn area(&self) -> f64;

    // TODO(1): describeのデフォルト実装を追加する
    // format!("{}の面積は{:.2}", self.name(), self.area()) を返す
}

struct Rectangle { width: f64, height: f64 }
struct Circle { radius: f64 }
struct Triangle { base: f64, height: f64 }

impl Shape for Rectangle {
    fn name(&self) -> String { String::from("長方形") }
    fn area(&self) -> f64 { self.width * self.height }
}

// TODO(2): CircleにShapeを実装する（名前は"円"、面積はPI * radius * radius）
// 円周率はstd::f64::consts::PIを使う

// TODO(2): TriangleにShapeを実装する（名前は"三角形"、面積はbase * height / 2.0）

fn main() {
    let shapes: Vec<Box<dyn Shape>> = vec![
        Box::new(Rectangle { width: 3.0, height: 4.0 }),
        Box::new(Circle { radius: 2.0 }),
        Box::new(Triangle { base: 6.0, height: 5.0 }),
    ];

    for shape in &shapes {
        println!("{}", shape.describe());
    }

    let total: f64 = shapes.iter().map(|s| s.area()).sum();
    println!("合計面積: {:.2}", total);
}
`,
      solution: `trait Shape {
    fn name(&self) -> String;
    fn area(&self) -> f64;

    // 全図形で共通の処理はデフォルト実装として共有する
    fn describe(&self) -> String {
        format!("{}の面積は{:.2}", self.name(), self.area())
    }
}

struct Rectangle { width: f64, height: f64 }
struct Circle { radius: f64 }
struct Triangle { base: f64, height: f64 }

impl Shape for Rectangle {
    fn name(&self) -> String { String::from("長方形") }
    fn area(&self) -> f64 { self.width * self.height }
}

impl Shape for Circle {
    fn name(&self) -> String { String::from("円") }
    // 円周率は標準ライブラリの定数を使う
    fn area(&self) -> f64 { std::f64::consts::PI * self.radius * self.radius }
}

impl Shape for Triangle {
    fn name(&self) -> String { String::from("三角形") }
    fn area(&self) -> f64 { self.base * self.height / 2.0 }
}

fn main() {
    // 異なる型をトレイトオブジェクトとして1つのVecに混在させる
    let shapes: Vec<Box<dyn Shape>> = vec![
        Box::new(Rectangle { width: 3.0, height: 4.0 }),
        Box::new(Circle { radius: 2.0 }),
        Box::new(Triangle { base: 6.0, height: 5.0 }),
    ];

    for shape in &shapes {
        println!("{}", shape.describe());
    }

    let total: f64 = shapes.iter().map(|s| s.area()).sum();
    println!("合計面積: {:.2}", total);
}
`,
      hints: [
        `デフォルト実装は、トレイト定義の中にfnの本体まで書くだけです。実装側では何も書かなければそれが使われます。`,
        `CircleへのimplはRectangleの実装をお手本にできます。impl Shape for Circle { ... } の形です。`,
        `円の面積は std::f64::consts::PI * self.radius * self.radius です。`
      ],
      expectedOutput: "長方形の面積は12.00"
    },
    {
      id: 198,
      title: "簡易スタックマシン（enum＋Vec＋match）",
      explanation: `<p>命令列を順に実行する小さな仮想マシンを作ります。実はこれ、多くのプログラミング言語処理系や仮想マシン（JVMやWebAssemblyなど）の心臓部と同じ構造です。</p>
<table>
<tr><th>使う知識</th><th>章</th><th>この課題での役割</th></tr>
<tr><td>データ付きenum</td><td>第8章</td><td>Push(i64)のように値を持つ命令を表現する</td></tr>
<tr><td>Vecのpush/pop</td><td>第9章</td><td>スタック（後入れ先出しのデータ構造）として使う</td></tr>
<tr><td>Option→Resultの変換（ok_or_else）</td><td>第10章</td><td>空スタックからのpopをエラーにする</td></tr>
<tr><td>?演算子</td><td>第10章</td><td>エラーを実行ループから即座に脱出させる</td></tr>
</table>
<p>設計の考え方：スタックマシンの動作原理は単純です。<code>Push</code>は値をスタックに積み、<code>Add</code>などの演算命令は上から2つ取り出して計算し、結果を積み直します。例えば「2 3 Add」を実行すると、スタックは[2]→[2,3]→[5]と変化します。</p>
<p>実装の急所は<code>pop</code>の失敗処理です。<code>Vec::pop()</code>は<code>Option&lt;i64&gt;</code>を返すため、空スタックなら<code>None</code>です。これを<code>ok_or_else</code>で<code>Result</code>に変換すれば、<code>?</code>演算子で実行ループから即座に脱出できます。</p>
<pre><code>fn pop(stack: &amp;mut Vec&lt;i64&gt;) -&gt; Result&lt;i64, String&gt; {
    stack.pop().ok_or_else(|| String::from("スタックが空です"))
}
</code></pre>
<p>もう1つ、引き算では取り出す順番に注意が必要です。スタックの一番上にあるのは「後に積んだ方」なので、先にpopした値が右オペランド（bの側）になります。<code>a - b</code>を計算するなら、bを先に、aを後にpopします。この種の「順序の罠」はスタックマシン実装の定番のつまずきどころなので、慎重に確認しながら実装しましょう。</p>`,
      task: `<code>run</code>関数の<code>Add</code>・<code>Sub</code>・<code>Mul</code>のTODOを実装してください。それぞれ2つpopして計算し、結果をpushします。popの順序（先にpopした方が右オペランド）に注意してください。`,
      code: `enum Instruction {
    Push(i64),
    Add,
    Sub,
    Mul,
    Print,
}

// 空スタックからのpopをResultのエラーに変換するヘルパー
fn pop(stack: &mut Vec<i64>) -> Result<i64, String> {
    stack.pop().ok_or_else(|| String::from("スタックが空です"))
}

fn run(program: &[Instruction]) -> Result<(), String> {
    let mut stack: Vec<i64> = Vec::new();
    for inst in program {
        match inst {
            Instruction::Push(v) => stack.push(*v),
            Instruction::Add => {
                // TODO: 2つpopして和をpushする
                // let b = pop(&mut stack)?; let a = pop(&mut stack)?; stack.push(a + b);
            }
            Instruction::Sub => {
                // TODO: 2つpopして差(a - b)をpushする
                // 先にpopした方がb（右オペランド）になることに注意
            }
            Instruction::Mul => {
                // TODO: 2つpopして積をpushする
            }
            Instruction::Print => {
                let v = pop(&mut stack)?;
                println!("結果: {}", v);
                stack.push(v);
            }
        }
    }
    Ok(())
}

fn main() {
    // (2 + 3) * 4 - 5 = 15 を計算するプログラム
    let program = vec![
        Instruction::Push(2),
        Instruction::Push(3),
        Instruction::Add,
        Instruction::Push(4),
        Instruction::Mul,
        Instruction::Push(5),
        Instruction::Sub,
        Instruction::Print,
    ];

    if let Err(e) = run(&program) {
        println!("実行エラー: {}", e);
    }

    // 空スタックに対する演算はエラーになる
    if let Err(e) = run(&[Instruction::Add]) {
        println!("実行エラー: {}", e);
    }
}
`,
      solution: `enum Instruction {
    Push(i64),
    Add,
    Sub,
    Mul,
    Print,
}

// 空スタックからのpopをResultのエラーに変換するヘルパー
fn pop(stack: &mut Vec<i64>) -> Result<i64, String> {
    stack.pop().ok_or_else(|| String::from("スタックが空です"))
}

fn run(program: &[Instruction]) -> Result<(), String> {
    let mut stack: Vec<i64> = Vec::new();
    for inst in program {
        match inst {
            Instruction::Push(v) => stack.push(*v),
            Instruction::Add => {
                let b = pop(&mut stack)?;
                let a = pop(&mut stack)?;
                stack.push(a + b);
            }
            Instruction::Sub => {
                // 後に積んだ方が先に出てくるので、先にpopした値が右オペランド
                let b = pop(&mut stack)?;
                let a = pop(&mut stack)?;
                stack.push(a - b);
            }
            Instruction::Mul => {
                let b = pop(&mut stack)?;
                let a = pop(&mut stack)?;
                stack.push(a * b);
            }
            Instruction::Print => {
                let v = pop(&mut stack)?;
                println!("結果: {}", v);
                stack.push(v);
            }
        }
    }
    Ok(())
}

fn main() {
    // (2 + 3) * 4 - 5 = 15 を計算するプログラム
    let program = vec![
        Instruction::Push(2),
        Instruction::Push(3),
        Instruction::Add,
        Instruction::Push(4),
        Instruction::Mul,
        Instruction::Push(5),
        Instruction::Sub,
        Instruction::Print,
    ];

    if let Err(e) = run(&program) {
        println!("実行エラー: {}", e);
    }

    // 空スタックに対する演算はエラーになる
    if let Err(e) = run(&[Instruction::Add]) {
        println!("実行エラー: {}", e);
    }
}
`,
      hints: [
        `AddのTODOにあるコメントの3行がそのまま実装です。SubとMulも同じ形で、演算子だけ変えます。`,
        `Subでは a - b の順です。b（後に積まれた値）を先にpopし、a を後にpopします。`,
        `pop(&mut stack)?の?により、スタックが空ならrun全体がErrを返して終了します。`
      ],
      expectedOutput: "結果: 15"
    },
    {
      id: 199,
      title: "イテレータパズル（チェーンを読み解き修正する）",
      explanation: `<p>今回は「書く」より「読む」訓練です。すでに動いているが<strong>結果が間違っている</strong>イテレータチェーンを読み解き、修正します。他人のコードのバグ探しは実務そのものです。</p>
<table>
<tr><th>使う知識</th><th>章</th><th>この課題での役割</th></tr>
<tr><td>map・filter・take</td><td>第13章</td><td>チェーンの各段の意味を読み取る</td></tr>
<tr><td>クロージャ</td><td>第13章</td><td>各アダプタに渡す処理を理解する</td></tr>
</table>
<p>イテレータチェーンを読むコツは、<strong>データの流れを1要素ずつ追う</strong>ことです。重要な原則として、アダプタの並び順が結果を変えます。次の2つを比べてみましょう。</p>
<pre><code>// A: 2倍してから偶数を残す
(1..=10).map(|x| x * 2).filter(|x| x % 2 == 0)

// B: 偶数を残してから2倍する
(1..=10).filter(|x| x % 2 == 0).map(|x| x * 2)
</code></pre>
<p>Aでは全要素が2倍され、2倍された値はすべて偶数なので<strong>何もフィルタされません</strong>（10要素すべて通過、合計110）。Bでは偶数の5要素だけが2倍されます（合計60）。「偶数だけを2倍して合計したい」ならBが正解です。</p>
<p><code>take(n)</code>（最初のn個だけ通す）も位置に敏感です。<code>filter</code>の前に置くと「最初のn個の中から条件に合うもの」、後に置くと「条件に合うものの中から最初のn個」という違いが生まれます。</p>
<p>デバッグの実践的な手順は次の通りです。(1)目標を日本語で言い直す（「偶数だけを、2倍して、合計」）、(2)日本語の語順とチェーンの並びを見比べる、(3)食い違っている段を入れ替える。イテレータチェーンは上から順に日本語として読めるのが正しい姿、と覚えておくとレビューでも威力を発揮します。</p>`,
      task: `2つのチェーンにはどちらも「アダプタの順番」のバグがあります。パズル1は「1〜10の偶数だけを2倍して合計60」、パズル2は「4文字以上の単語を大文字にして最初の2つ」が目標です。順番を修正してください。`,
      code: `fn main() {
    // パズル1
    // 目標：1から10のうち偶数だけを2倍して合計する（正しい答えは60）
    // しかし現在は110が表示されてしまう。なぜかを考えて修正すること
    let result: i32 = (1..=10)
        .map(|x| x * 2)
        .filter(|x| x % 2 == 0)
        .sum();
    println!("合計: {}", result);

    // パズル2
    // 目標：4文字以上の単語を大文字にして、最初の2つを取り出す
    // 正しい答えは ["RUST", "PYTHON"] だが、現在は["RUST"]になってしまう
    let words = ["rust", "go", "python", "c", "kotlin"];
    let result2: Vec<String> = words
        .iter()
        .map(|w| w.to_uppercase())
        .take(2)
        .filter(|w| w.len() >= 4)
        .collect();
    println!("単語: {:?}", result2);
}
`,
      solution: `fn main() {
    // パズル1
    // 修正：先に偶数だけを残し、それから2倍する
    // （2倍を先にすると全要素が偶数になり、filterが何も除外しなくなる）
    let result: i32 = (1..=10)
        .filter(|x| x % 2 == 0)
        .map(|x| x * 2)
        .sum();
    println!("合計: {}", result);

    // パズル2
    // 修正：先に4文字以上へ絞り込んでからtake(2)する
    // （take(2)を先にすると"rust"と"go"の2つしか後段に流れない）
    let words = ["rust", "go", "python", "c", "kotlin"];
    let result2: Vec<String> = words
        .iter()
        .filter(|w| w.len() >= 4)
        .map(|w| w.to_uppercase())
        .take(2)
        .collect();
    println!("単語: {:?}", result2);
}
`,
      hints: [
        `パズル1：x * 2の結果はすべて偶数です。つまりfilterがまったく仕事をしていません。filterを先に動かしましょう。`,
        `パズル2：take(2)が早すぎる位置にあると、"rust"と"go"の2つだけが後段に渡ります。絞り込みの後にtakeを置きます。`,
        `修正後のパズル2の順番はfilter -> map -> take -> collectです。`
      ],
      expectedOutput: "合計: 60"
    },
    {
      id: 200,
      title: "卒業課題：家計簿ミニアプリ",
      explanation: `<p>いよいよ最後のステップです。支出の登録・カテゴリ別集計・レポート整形出力を備えた家計簿ミニアプリを完成させます。200ステップで学んだ知識の集大成です。</p>
<table>
<tr><th>使う知識</th><th>章</th><th>この課題での役割</th></tr>
<tr><td>enum＋derive（Hash、Eq）</td><td>第8・12章</td><td>カテゴリを型で表し、HashMapのキーにする</td></tr>
<tr><td>struct＋Vec</td><td>第7・9章</td><td>支出記録の一覧を保持する</td></tr>
<tr><td>HashMap＋entry</td><td>第9章</td><td>カテゴリ別の合計金額を集計する</td></tr>
<tr><td>イテレータ</td><td>第13章</td><td>合計金額の計算</td></tr>
<tr><td>フォーマット指定子</td><td>第2章〜</td><td>桁揃えされた読みやすいレポートを作る</td></tr>
</table>
<p>設計の考え方を2点だけ補足します。</p>
<p>第一に、enumをHashMapのキーにするには<code>#[derive(PartialEq, Eq, Hash)]</code>が必要です。HashMapはキーのハッシュ値と等価比較で要素を管理するためです。集計自体はステップ194と同じentryイディオムが使えます。今回のキーは<code>Copy</code>なenumなので、<code>e.category</code>をそのままキーにできます。</p>
<p>第二に、<strong>出力順の制御</strong>です。HashMapの巡回順序は不定なので、レポートでは<code>Category::all()</code>が返す固定順の配列で回し、<code>totals.get(&amp;cat)</code>で金額を引きます。記録が1件もないカテゴリは<code>None</code>になるため、<code>copied().unwrap_or(0)</code>で0円として扱います。</p>
<pre><code>for cat in Category::all() {
    let amount = totals.get(&amp;cat).copied().unwrap_or(0);
    println!("{}: {}円", cat.label(), amount);
}
</code></pre>
<p>整形には<code>{:&gt;6}</code>（右寄せ6桁）のようなフォーマット指定子を使うと、金額の桁が揃った実用的なレポートになります。ここまで完走したあなたは、所有権・型システム・エラー処理というRustの3本柱を使って小さなアプリケーションを組み立てられるようになりました。次は公式ドキュメント「The Rust Programming Language」を読みながら、Cargoでの本格的なプロジェクト作りに進みましょう。</p>`,
      task: `2つのTODOを実装してください。(1)<code>total_by_category</code>：entryイディオムでカテゴリ別合計の<code>HashMap</code>を作る、(2)<code>report</code>内のカテゴリ別集計の出力：<code>Category::all()</code>の固定順で回し、未使用カテゴリは0円と表示します。`,
      code: `use std::collections::HashMap;

// HashMapのキーにするためEqとHashをderiveしている
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
enum Category {
    Food,
    Transport,
    Entertainment,
    Other,
}

impl Category {
    fn label(&self) -> &str {
        match self {
            Category::Food => "食費",
            Category::Transport => "交通費",
            Category::Entertainment => "娯楽費",
            Category::Other => "その他",
        }
    }

    // レポートの表示順を固定するための配列
    fn all() -> [Category; 4] {
        [Category::Food, Category::Transport, Category::Entertainment, Category::Other]
    }
}

struct Entry {
    day: u32,
    memo: String,
    category: Category,
    amount: u32,
}

struct Ledger {
    entries: Vec<Entry>,
}

impl Ledger {
    fn new() -> Self {
        Ledger { entries: Vec::new() }
    }

    fn add(&mut self, day: u32, memo: &str, category: Category, amount: u32) {
        self.entries.push(Entry {
            day,
            memo: memo.to_string(),
            category,
            amount,
        });
    }

    fn total(&self) -> u32 {
        self.entries.iter().map(|e| e.amount).sum()
    }

    fn total_by_category(&self) -> HashMap<Category, u32> {
        // TODO(1): entriesを巡回し、entryイディオムで
        // カテゴリごとの合計金額をHashMapに集計して返す
        HashMap::new()
    }

    fn report(&self) {
        println!("=== 家計簿レポート ===");
        for e in &self.entries {
            println!("{:>2}日 {} {:>6}円 [{}]", e.day, e.memo, e.amount, e.category.label());
        }

        println!("--- カテゴリ別集計 ---");
        let totals = self.total_by_category();
        // TODO(2): Category::all()の順に巡回し、
        // totals.get(&cat).copied().unwrap_or(0) で金額を取り出して
        // 「(ラベル): (金額)円」の形式で出力する

        println!("合計: {}円", self.total());
    }
}

fn main() {
    let mut ledger = Ledger::new();
    ledger.add(1, "スーパー", Category::Food, 3200);
    ledger.add(3, "電車", Category::Transport, 440);
    ledger.add(5, "映画", Category::Entertainment, 1900);
    ledger.add(7, "カフェ", Category::Food, 650);
    ledger.add(10, "文房具", Category::Other, 300);

    ledger.report();
}
`,
      solution: `use std::collections::HashMap;

// HashMapのキーにするためEqとHashをderiveしている
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
enum Category {
    Food,
    Transport,
    Entertainment,
    Other,
}

impl Category {
    fn label(&self) -> &str {
        match self {
            Category::Food => "食費",
            Category::Transport => "交通費",
            Category::Entertainment => "娯楽費",
            Category::Other => "その他",
        }
    }

    // レポートの表示順を固定するための配列
    fn all() -> [Category; 4] {
        [Category::Food, Category::Transport, Category::Entertainment, Category::Other]
    }
}

struct Entry {
    day: u32,
    memo: String,
    category: Category,
    amount: u32,
}

struct Ledger {
    entries: Vec<Entry>,
}

impl Ledger {
    fn new() -> Self {
        Ledger { entries: Vec::new() }
    }

    fn add(&mut self, day: u32, memo: &str, category: Category, amount: u32) {
        self.entries.push(Entry {
            day,
            memo: memo.to_string(),
            category,
            amount,
        });
    }

    fn total(&self) -> u32 {
        self.entries.iter().map(|e| e.amount).sum()
    }

    // カテゴリ別の合計をentryイディオムで集計する
    fn total_by_category(&self) -> HashMap<Category, u32> {
        let mut map = HashMap::new();
        for e in &self.entries {
            *map.entry(e.category).or_insert(0) += e.amount;
        }
        map
    }

    fn report(&self) {
        println!("=== 家計簿レポート ===");
        for e in &self.entries {
            println!("{:>2}日 {} {:>6}円 [{}]", e.day, e.memo, e.amount, e.category.label());
        }

        println!("--- カテゴリ別集計 ---");
        let totals = self.total_by_category();
        // HashMapの順序は不定なので、固定順の配列で巡回する
        for cat in Category::all() {
            let amount = totals.get(&cat).copied().unwrap_or(0);
            println!("{}: {}円", cat.label(), amount);
        }

        println!("合計: {}円", self.total());
    }
}

fn main() {
    let mut ledger = Ledger::new();
    ledger.add(1, "スーパー", Category::Food, 3200);
    ledger.add(3, "電車", Category::Transport, 440);
    ledger.add(5, "映画", Category::Entertainment, 1900);
    ledger.add(7, "カフェ", Category::Food, 650);
    ledger.add(10, "文房具", Category::Other, 300);

    ledger.report();
}
`,
      hints: [
        `total_by_categoryはステップ194と同じ形です。for e in &self.entries の中で *map.entry(e.category).or_insert(0) += e.amount; とします。`,
        `CategoryはCopyなので、e.categoryをそのままentryのキーとして渡せます。`,
        `レポートのループは for cat in Category::all() です。get(&cat)はOption<&u32>を返すので、copied().unwrap_or(0)でu32に変換します。`
      ],
      expectedOutput: "食費: 3850円"
    }
  ]
});
