// 第16章：モジュールとクレート
registerChapter({
  number: 16,
  title: "モジュールとクレート",
  description: "modによるコードの整理、pubによる公開制御、useによるパスの持ち込みを学び、大きくなったプログラムを見通しよく分割する方法を身につけます。",
  steps: [
    {
      id: 151,
      title: "modでコードを整理する",
      explanation: `<p>プログラムが大きくなると、関数を1つのファイルに平らに並べるだけでは見通しが悪くなります。Rustでは<code>mod</code>（モジュール）でコードを<strong>意味のまとまりごとにグループ化</strong>できます。</p>
<pre><code>mod math {
    pub fn add(a: i32, b: i32) -&gt; i32 {
        a + b
    }
}

fn main() {
    let result = math::add(3, 4); // モジュール名::関数名 で呼ぶ
    println!("{}", result);
}</code></pre>
<p>ポイントは次の3つです。</p>
<ul>
<li><code>mod モジュール名 { }</code>でモジュールを定義する。中には関数、構造体、enum、さらに別のmodも入れられる</li>
<li>外から呼ぶときは<code>math::add(3, 4)</code>のように<code>::</code>（パス区切り）でたどる</li>
<li>モジュールの中身は<strong>デフォルトで非公開</strong>なので、外から使う関数には<code>pub</code>（公開の印）を付ける。詳しくは次のステップで学びます</li>
</ul>
<p>関連する用語も整理しておきましょう。</p>
<table>
<tr><th>用語</th><th>意味</th></tr>
<tr><td>クレート</td><td>コンパイルの単位。実行ファイルになるバイナリクレートと、ライブラリクレートがある</td></tr>
<tr><td>モジュール</td><td>クレート内のコードを整理する入れ子構造</td></tr>
<tr><td>パス</td><td>math::addのように項目の場所を示す道筋</td></tr>
</table>
<p>実務ではモジュールを別ファイル（<code>math.rs</code>など）に分割しますが、本教材ではファイル内に<code>mod { }</code>を直接書く<strong>インラインモジュール</strong>で学びます。仕組みはどちらも同じです。</p>`,
      task: `<code>math</code>モジュールに引き算の関数<code>sub</code>を追加し、mainから呼び出して「10 - 4 = 6」も出力されるようにしてください。`,
      code: `// mathモジュール：計算関連の関数をまとめる
mod math {
    pub fn add(a: i32, b: i32) -> i32 {
        a + b
    }

    // TODO: 引き算をするpubな関数subを追加しよう
}

fn main() {
    println!("3 + 4 = {}", math::add(3, 4));

    // TODO: math::subを呼び出して「10 - 4 = 6」と出力しよう
}`,
      solution: `// mathモジュール：計算関連の関数をまとめる
mod math {
    pub fn add(a: i32, b: i32) -> i32 {
        a + b
    }

    pub fn sub(a: i32, b: i32) -> i32 {
        a - b
    }
}

fn main() {
    println!("3 + 4 = {}", math::add(3, 4));
    println!("10 - 4 = {}", math::sub(10, 4));
}`,
      hints: [
        `subはaddとほぼ同じ形です。pub fn sub(a: i32, b: i32) -> i32 { a - b }をmathモジュールの中に書きます。`,
        `mainからはmath::sub(10, 4)で呼び出せます。pubを忘れるとコンパイルエラーになります。`
      ],
      expectedOutput: "10 - 4 = 6"
    },
    {
      id: 152,
      title: "pubと公開制御（エラー体験）",
      explanation: `<p>モジュールの中身は<strong>デフォルトですべて非公開（private）</strong>です。外部から使いたいものにだけ<code>pub</code>を付けます。非公開の関数を外から呼ぶと次のエラーになります。</p>
<pre><code>error[E0603]: function 'internal_helper' is private</code></pre>
<p>「なぜわざわざ隠すのか」と思うかもしれませんが、これは<strong>カプセル化</strong>（内部の実装詳細を隠し、外部には安定した窓口だけを見せる設計）のためです。</p>
<table>
<tr><th>公開範囲</th><th>書き方</th><th>意味</th></tr>
<tr><td>非公開</td><td>fn helper()</td><td>同じモジュール内（と子モジュール）からのみ使える</td></tr>
<tr><td>公開</td><td>pub fn api()</td><td>モジュールの外からも使える</td></tr>
</table>
<pre><code>mod secret {
    pub fn public_api() {   // 外部への窓口
        internal_helper();  // 同じモジュール内なら非公開でも呼べる
    }

    fn internal_helper() {  // 内部実装。外からは見えない
    }
}</code></pre>
<p>非公開にしておけば、内部実装は<strong>いつでも自由に書き換えられます</strong>。外部が依存しているのは<code>pub</code>な窓口だけなので、内部を変更しても呼び出し側のコードは壊れません。逆に一度<code>pub</code>にしたものは外部が依存するため、簡単には変更できなくなります。<strong>「迷ったら非公開にしておき、必要になってからpubにする」</strong>のが設計の鉄則です。</p>
<p>なお、親モジュールの項目は子モジュールから自由に見えますが、子モジュールの非公開項目は親から見えません。公開制御は「外へ出る方向」にだけ壁を作るイメージです。</p>`,
      task: `このコードはmainから非公開関数を直接呼んでいるためコンパイルエラー（E0603）になります。エラーメッセージを確認したあと、mainからは<code>public_api()</code>だけを呼ぶ形に修正してください。<code>internal_helper</code>は非公開のまま残すこと。`,
      code: `mod secret {
    pub fn public_api() {
        internal_helper(); // 同じモジュール内なら非公開でも呼べる
        println!("公開関数が呼ばれました");
    }

    fn internal_helper() {
        println!("内部処理を実行");
    }
}

fn main() {
    // エラー：internal_helperは非公開（private）
    secret::internal_helper();
    secret::public_api();
}`,
      solution: `mod secret {
    pub fn public_api() {
        internal_helper(); // 同じモジュール内なら非公開でも呼べる
        println!("公開関数が呼ばれました");
    }

    fn internal_helper() {
        println!("内部処理を実行");
    }
}

fn main() {
    // 外部からは公開された窓口だけを使う
    secret::public_api();
}`,
      hints: [
        `エラーの原因はmainのsecret::internal_helper()です。非公開関数はモジュールの外から呼べません。`,
        `internal_helperにpubを付ける方法もありますが、今回は内部実装を隠したまま、mainの呼び出し行を削除するのが正解です。`
      ],
      expectedOutput: "公開関数が呼ばれました"
    },
    {
      id: 153,
      title: "ネストしたモジュール",
      explanation: `<p>モジュールの中にはさらにモジュールを入れられます。これを<strong>ネスト</strong>（入れ子）といい、フォルダの中にフォルダを作るのと同じ感覚でコードを階層化できます。</p>
<pre><code>mod restaurant {
    pub mod front_of_house {   // 接客部門
        pub fn greet() {
            println!("いらっしゃいませ");
        }
    }

    pub mod kitchen {           // 調理部門
        pub fn cook() {
            println!("調理中です");
        }
    }
}

fn main() {
    restaurant::front_of_house::greet(); // パスを::でたどる
}</code></pre>
<p>注意すべきは<code>pub</code>の付け方です。ネストした関数を外から呼ぶには、<strong>そこまでの経路上のすべてに<code>pub</code>が必要</strong>です。</p>
<table>
<tr><th>場所</th><th>pubの要否</th></tr>
<tr><td>mod restaurant</td><td>mainと同じ階層にあるので不要（兄弟同士は見える）</td></tr>
<tr><td>pub mod front_of_house</td><td>必要（restaurantの外から入るため）</td></tr>
<tr><td>pub fn greet</td><td>必要（front_of_houseの外から呼ぶため）</td></tr>
</table>
<p>「建物の入口が開いていても、部屋のドアが閉まっていれば入れない」とイメージすると分かりやすいでしょう。途中のどこか1箇所でも<code>pub</code>が抜けているとE0603エラーになります。</p>
<p>モジュール階層はクレートを根とする<strong>木構造</strong>になっており、<code>crate::restaurant::kitchen::cook</code>のようにルートからの完全なパスで表せます。この木構造を意識できると、次以降のステップで学ぶパス指定がすんなり理解できます。</p>`,
      task: `<code>restaurant</code>モジュールの中に<code>kitchen</code>モジュールを追加し、その中に「調理中です」と出力する<code>cook</code>関数を定義して、mainから呼び出してください。<code>pub</code>の付け忘れに注意しましょう。`,
      code: `mod restaurant {
    pub mod front_of_house {
        pub fn greet() {
            println!("いらっしゃいませ");
        }
    }

    // TODO: kitchenモジュールを追加し、中に「調理中です」と
    // 出力するcook関数を定義しよう（pubを忘れずに）
}

fn main() {
    restaurant::front_of_house::greet();

    // TODO: kitchenのcookを呼び出そう
}`,
      solution: `mod restaurant {
    pub mod front_of_house {
        pub fn greet() {
            println!("いらっしゃいませ");
        }
    }

    pub mod kitchen {
        pub fn cook() {
            println!("調理中です");
        }
    }
}

fn main() {
    restaurant::front_of_house::greet();
    restaurant::kitchen::cook();
}`,
      hints: [
        `front_of_houseと同じ形でpub mod kitchen { }をrestaurantの中に書き、その中にpub fn cook()を定義します。`,
        `modとfnの両方にpubが必要です。どちらかを忘れるとE0603エラーになります。`,
        `mainからの呼び出しはrestaurant::kitchen::cook();です。`
      ],
      expectedOutput: "調理中です"
    },
    {
      id: 154,
      title: "useで持ち込む",
      explanation: `<p>ネストが深くなると、毎回<code>restaurant::front_of_house::greet()</code>と書くのは冗長です。<code>use</code>を使うと、パスを現在のスコープに<strong>持ち込んで</strong>短い名前で使えるようになります。</p>
<pre><code>mod shapes {
    pub mod circle {
        pub fn area(r: f64) -&gt; f64 {
            3.141592653589793 * r * r
        }
    }
}

use shapes::circle; // circleをこのスコープに持ち込む

fn main() {
    println!("{}", circle::area(2.0)); // 短く書ける
}</code></pre>
<p><code>use</code>は「ファイルシステムのショートカットを作る」ようなものです。実体は移動せず、短い別名でアクセスできるようになるだけです。</p>
<h4>どこまで持ち込むかの慣習</h4>
<table>
<tr><th>対象</th><th>慣習</th><th>例</th></tr>
<tr><td>関数</td><td>親モジュールまで持ち込み、モジュール名::関数名で呼ぶ</td><td>use shapes::circle; → circle::area(...)</td></tr>
<tr><td>構造体・enum</td><td>型そのものまで持ち込む</td><td>use std::collections::HashMap; → HashMap::new()</td></tr>
</table>
<p>関数を<code>use shapes::circle::area;</code>とフルに持ち込んで<code>area(2.0)</code>と書くことも文法上は可能ですが、<strong>どこで定義された関数か分かりにくくなる</strong>ため、親モジュールで止めるのがRustの慣習です。すでに何度も書いてきた<code>use std::collections::HashMap;</code>は、実はこの構造体の慣習に従った書き方だったのです。</p>
<p><code>use</code>を書く場所は通常<strong>ファイルの先頭</strong>です。そのスコープ全体で有効になります。</p>`,
      task: `<code>use</code>を使って<code>shapes::circle</code>と<code>shapes::square</code>を持ち込み、mainの呼び出しを<code>circle::area(2.0)</code>、<code>square::area(3.0)</code>と短く書き換えてください。`,
      code: `mod shapes {
    pub mod circle {
        pub fn area(r: f64) -> f64 {
            3.141592653589793 * r * r
        }
    }

    pub mod square {
        pub fn area(side: f64) -> f64 {
            side * side
        }
    }
}

// TODO: useでshapes::circleとshapes::squareを持ち込もう

fn main() {
    // TODO: useを使って短いパスで呼び出そう
    println!("円の面積: {:.2}", shapes::circle::area(2.0));
    println!("正方形の面積: {:.2}", shapes::square::area(3.0));
}`,
      solution: `mod shapes {
    pub mod circle {
        pub fn area(r: f64) -> f64 {
            3.141592653589793 * r * r
        }
    }

    pub mod square {
        pub fn area(side: f64) -> f64 {
            side * side
        }
    }
}

// 親モジュールまで持ち込むのが関数の慣習
use shapes::circle;
use shapes::square;

fn main() {
    println!("円の面積: {:.2}", circle::area(2.0));
    println!("正方形の面積: {:.2}", square::area(3.0));
}`,
      hints: [
        `use shapes::circle;とuse shapes::square;の2行をmodの後、mainの前に書きます。`,
        `持ち込んだ後はcircle::area(2.0)、square::area(3.0)と書けます。円と正方形のどちらのareaかが読み手に伝わる書き方です。`
      ],
      expectedOutput: "円の面積: 12.57"
    },
    {
      id: 155,
      title: "パス指定（crate::、self::、super::）",
      explanation: `<p>モジュールの中から別の場所の項目を参照するとき、パスの書き方には<strong>絶対パス</strong>と<strong>相対パス</strong>があります。ファイルシステムの<code>/home/user</code>と<code>../user</code>の関係とよく似ています。</p>
<table>
<tr><th>キーワード</th><th>起点</th><th>ファイルシステムでの例え</th></tr>
<tr><td>crate::</td><td>クレートルート（このファイルの一番外側）</td><td>/（ルート）からの絶対パス</td></tr>
<tr><td>self::</td><td>現在のモジュール</td><td>./（現在のフォルダ）</td></tr>
<tr><td>super::</td><td>親モジュール</td><td>../（1つ上のフォルダ）</td></tr>
</table>
<pre><code>fn root_message() {}          // クレートルートの関数

mod parent {
    pub fn parent_message() {}

    pub mod child {
        pub fn run() {
            super::parent_message(); // 親モジュール（parent）の関数
            crate::root_message();   // ルートの関数（絶対パス）
            self::child_message();   // 自分（child）の関数
        }

        fn child_message() {}
    }
}</code></pre>
<p>使い分けの目安は次のとおりです。</p>
<ul>
<li><code>crate::</code>：どこから見ても同じ意味になる絶対パス。コードを別のモジュールへ移動してもパスが壊れにくい</li>
<li><code>super::</code>：「親の隣にある兄弟モジュール」を呼ぶときに便利。親子ごと移動しても壊れない</li>
<li><code>self::</code>：現在のモジュールを明示する。省略しても同じ意味になることが多く、実際は省略されがち</li>
</ul>
<p>なお<code>super::</code>は<code>super::super::</code>のように重ねて2つ上をたどることもできます。「モジュール木のどこに自分がいて、どこへ向かうパスなのか」を意識するのがコツです。</p>`,
      task: `<code>child::run</code>の中の<code>TODO</code>を埋めて、<code>super::</code>で親の関数を、<code>crate::</code>でルートの関数を、<code>self::</code>で自分のモジュールの関数を呼び出してください。`,
      code: `fn root_message() {
    println!("crateルートから呼ばれました");
}

mod parent {
    pub fn parent_message() {
        println!("parentモジュールの関数");
    }

    pub mod child {
        pub fn run() {
            // TODO: super::で親モジュールのparent_messageを呼ぶ

            // TODO: crate::でルートのroot_messageを呼ぶ

            // TODO: self::で自分のモジュールのchild_messageを呼ぶ
        }

        fn child_message() {
            println!("childモジュールの関数");
        }
    }
}

fn main() {
    parent::child::run();
}`,
      solution: `fn root_message() {
    println!("crateルートから呼ばれました");
}

mod parent {
    pub fn parent_message() {
        println!("parentモジュールの関数");
    }

    pub mod child {
        pub fn run() {
            // 親モジュール（parent）へは super::
            super::parent_message();

            // クレートルートへは crate::（絶対パス）
            crate::root_message();

            // 自分自身のモジュールは self::（省略も可能）
            self::child_message();
        }

        fn child_message() {
            println!("childモジュールの関数");
        }
    }
}

fn main() {
    parent::child::run();
}`,
      hints: [
        `childの親はparentなので、super::parent_message();で呼べます。`,
        `ルートの関数はcrate::root_message();です。crate::はどこに書いても同じ場所を指します。`,
        `同じモジュール内のchild_messageはself::child_message();と書きます（self::なしでも呼べますが今回は明示しましょう）。`
      ],
      expectedOutput: "childモジュールの関数"
    },
    {
      id: 156,
      title: "構造体・enumの公開ルール（pubフィールド）",
      explanation: `<p>構造体とenumでは<code>pub</code>の効き方が異なります。ここはつまずきやすいポイントです。</p>
<table>
<tr><th>対象</th><th>pubを付けたときの効果</th></tr>
<tr><td>構造体</td><td>構造体名だけが公開される。<strong>フィールドは個別にpubが必要</strong></td></tr>
<tr><td>enum</td><td>enumを公開すると<strong>全バリアントも自動で公開</strong>される</td></tr>
</table>
<pre><code>mod library {
    pub struct Book {
        pub title: String,   // 公開フィールド：外から読み書きできる
        page_count: u32,     // 非公開フィールド：外から触れない
    }

    pub enum Genre {         // enumはバリアントごとのpub指定は不要
        Novel,
        Technical,
    }
}</code></pre>
<p>非公開フィールドを外から<code>book.page_count</code>と触ると、<code>error[E0616]: field 'page_count' of struct 'Book' is private</code>というエラーになります。</p>
<p>非公開フィールドがあると、外部は<strong>構造体を直接初期化できません</strong>。そこで<code>Book::new(...)</code>のような<strong>公開されたコンストラクタ関数</strong>を用意します。また、値を読むための<strong>ゲッターメソッド</strong>（<code>pub fn pages(&amp;self) -&gt; u32</code>など）を提供するのが定番です。</p>
<pre><code>impl Book {
    pub fn new(title: &amp;str, pages: u32) -&gt; Book { ... }
    pub fn pages(&amp;self) -&gt; u32 { self.page_count }
}</code></pre>
<p>この設計により「ページ数は必ず正の値」といった<strong>不変条件</strong>（常に守られるべき条件）をモジュール内部で保証できます。外部が勝手にフィールドを書き換えられないからです。一方enumのバリアントは「選択肢の一覧」そのものが公開インターフェースなので、全部見えないと意味がなく、自動で公開される仕様になっています。</p>`,
      task: `このコードは非公開フィールド<code>page_count</code>に直接アクセスしているためコンパイルエラー（E0616）になります。ゲッターメソッド<code>pages()</code>を使う形に修正してください。`,
      code: `mod library {
    pub struct Book {
        pub title: String,
        page_count: u32, // 非公開フィールド
    }

    impl Book {
        pub fn new(title: &str, pages: u32) -> Book {
            Book {
                title: String::from(title),
                page_count: pages,
            }
        }

        pub fn pages(&self) -> u32 {
            self.page_count
        }
    }

    pub enum Genre {
        Novel,
        Technical,
    }
}

use library::{Book, Genre};

fn main() {
    let book = Book::new("Rust入門", 300);
    println!("タイトル: {}", book.title);

    // エラー：page_countは非公開フィールド
    println!("ページ数: {}", book.page_count);

    // enumはpubを付ければ全バリアントが公開される
    let genre = Genre::Technical;
    match genre {
        Genre::Novel => println!("ジャンル: 小説"),
        Genre::Technical => println!("ジャンル: 技術書"),
    }
}`,
      solution: `mod library {
    pub struct Book {
        pub title: String,
        page_count: u32, // 非公開フィールド
    }

    impl Book {
        pub fn new(title: &str, pages: u32) -> Book {
            Book {
                title: String::from(title),
                page_count: pages,
            }
        }

        pub fn pages(&self) -> u32 {
            self.page_count
        }
    }

    pub enum Genre {
        Novel,
        Technical,
    }
}

use library::{Book, Genre};

fn main() {
    let book = Book::new("Rust入門", 300);
    println!("タイトル: {}", book.title);

    // 非公開フィールドには公開されたゲッター経由でアクセスする
    println!("ページ数: {}", book.pages());

    // enumはpubを付ければ全バリアントが公開される
    let genre = Genre::Technical;
    match genre {
        Genre::Novel => println!("ジャンル: 小説"),
        Genre::Technical => println!("ジャンル: 技術書"),
    }
}`,
      hints: [
        `titleはpubなのでbook.titleでアクセスできますが、page_countは非公開です。`,
        `libraryモジュールには公開メソッドpages()が用意されています。book.page_countをbook.pages()に書き換えましょう。`
      ],
      expectedOutput: "ページ数: 300"
    },
    {
      id: 157,
      title: "useの慣習・as・ネスト{}記法",
      explanation: `<p><code>use</code>には知っておくと便利な記法がいくつかあります。</p>
<h4>ネスト{}記法：同じ場所からまとめて持ち込む</h4>
<pre><code>// 冗長な書き方
use std::collections::HashMap;
use std::collections::HashSet;

// {}でまとめる
use std::collections::{HashMap, HashSet};</code></pre>
<p><code>self</code>を使えば「親そのもの＋子」も1行にできます：<code>use std::io::{self, Write};</code>は<code>std::io</code>と<code>std::io::Write</code>の両方を持ち込みます。</p>
<h4>as：別名を付ける</h4>
<p>名前が衝突するときや長すぎるときは<code>as</code>で別名を付けます。</p>
<pre><code>use std::collections::BTreeMap as SortedMap;

let mut m: SortedMap&lt;i32, &amp;str&gt; = SortedMap::new();</code></pre>
<p>典型例は2つの<code>Result</code>型の衝突回避です：<code>use std::io::Result as IoResult;</code>とすれば標準の<code>Result</code>と共存できます。</p>
<h4>glob（*）は原則使わない</h4>
<pre><code>use std::collections::*; // どこから来た名前か分からなくなる</code></pre>
<p><code>*</code>はその場所の公開項目を全部持ち込みますが、名前の出所が追えなくなるため、テストコードや一部の定番（プレリュードパターン）以外では避けるのが慣習です。</p>
<table>
<tr><th>記法</th><th>用途</th></tr>
<tr><td>use a::{B, C};</td><td>同じ親から複数まとめて持ち込む</td></tr>
<tr><td>use a::{self, B};</td><td>親自身と子を同時に持ち込む</td></tr>
<tr><td>use a::B as C;</td><td>別名を付ける（衝突回避）</td></tr>
<tr><td>use a::*;</td><td>全部持ち込む（原則避ける）</td></tr>
</table>`,
      task: `2行の<code>use</code>をネスト<code>{}</code>記法で1行にまとめ、さらに<code>BTreeMap</code>を<code>as</code>で<code>SortedMap</code>という別名にして持ち込んでください。mainはそのまま動くはずです。`,
      code: `// TODO: 下の2行をネスト{}記法で1行にまとめよう
use std::collections::HashMap;
use std::collections::HashSet;

// TODO: BTreeMapをasでSortedMapという別名にして持ち込もう

fn main() {
    let mut scores: HashMap<String, i32> = HashMap::new();
    scores.insert(String::from("数学"), 90);
    println!("数学: {}", scores["数学"]);

    let mut tags: HashSet<&str> = HashSet::new();
    tags.insert("rust");
    tags.insert("rust"); // 重複は無視される
    println!("タグ数: {}", tags.len());

    // BTreeMapはキーの昇順で並ぶMap。別名SortedMapで使う
    let mut ranking: SortedMap<i32, &str> = SortedMap::new();
    ranking.insert(2, "銀");
    ranking.insert(1, "金");
    for (place, medal) in &ranking {
        println!("{}位: {}", place, medal);
    }
}`,
      solution: `// ネスト{}記法：同じ親からまとめて持ち込む
use std::collections::{HashMap, HashSet};

// as：別名を付けて持ち込む
use std::collections::BTreeMap as SortedMap;

fn main() {
    let mut scores: HashMap<String, i32> = HashMap::new();
    scores.insert(String::from("数学"), 90);
    println!("数学: {}", scores["数学"]);

    let mut tags: HashSet<&str> = HashSet::new();
    tags.insert("rust");
    tags.insert("rust"); // 重複は無視される
    println!("タグ数: {}", tags.len());

    // BTreeMapはキーの昇順で並ぶMap。別名SortedMapで使う
    let mut ranking: SortedMap<i32, &str> = SortedMap::new();
    ranking.insert(2, "銀");
    ranking.insert(1, "金");
    for (place, medal) in &ranking {
        println!("{}位: {}", place, medal);
    }
}`,
      hints: [
        `まとめる書き方はuse std::collections::{HashMap, HashSet};です。`,
        `別名はuse std::collections::BTreeMap as SortedMap;と書きます。以降はSortedMapという名前で使えます。`,
        `BTreeMapはキー順に整列するので、2→1の順にinsertしても出力は1位から表示されます。`
      ],
      expectedOutput: "1位: 金"
    },
    {
      id: 158,
      title: "標準ライブラリのモジュール構成（std::collections等）",
      explanation: `<p>これまで何度も書いてきた<code>use std::collections::HashMap;</code>の<code>std</code>は、Rustに付属する<strong>標準ライブラリクレート</strong>です。stdもこの章で学んだモジュール階層で整理されています。主なモジュールを知っておくと、目的の機能を探すときの地図になります。</p>
<table>
<tr><th>モジュール</th><th>役割</th><th>代表的な項目</th></tr>
<tr><td>std::collections</td><td>コレクション型</td><td>HashMap、HashSet、VecDeque、BTreeMap</td></tr>
<tr><td>std::cmp</td><td>比較</td><td>max、min、Ordering</td></tr>
<tr><td>std::fmt</td><td>整形と表示</td><td>Display、Debug</td></tr>
<tr><td>std::rc / std::cell</td><td>スマートポインタ</td><td>Rc、Weak、RefCell（前章で学習）</td></tr>
<tr><td>std::f64::consts</td><td>浮動小数点の数学定数</td><td>PI、E</td></tr>
<tr><td>std::option / std::result</td><td>OptionとResult</td><td>Option、Result</td></tr>
</table>
<p>ここで疑問が湧くかもしれません。「<code>Vec</code>や<code>Option</code>は<code>use</code>なしで使えたのはなぜ？」——答えは<strong>プレリュード</strong>（std::prelude）です。頻出の型（Vec、String、Option、Result等）は全ファイルに自動で持ち込まれるため、useを書かずに使えるのです。逆に言えば、プレリュード外のもの（HashMapなど）はuseが必要です。</p>
<pre><code>use std::cmp;
use std::collections::VecDeque;

cmp::max(10, 20);            // 20
let mut q = VecDeque::new(); // 両端キュー：先頭からも取り出せる
q.push_back("一人目");
q.pop_front();               // 先頭から取り出す</code></pre>
<p>公式ドキュメント（doc.rust-lang.org/std）はこのモジュール構成そのままに並んでいます。この地図が頭にあれば、ドキュメントを迷わず読めるようになります。</p>`,
      task: `<code>TODO</code>の2箇所を埋めてください。1つ目は<code>use</code>で<code>std::cmp</code>と<code>std::collections::VecDeque</code>を持ち込み、2つ目は<code>VecDeque</code>を使って待ち行列の先頭を取り出します。`,
      code: `// TODO: std::cmpとstd::collections::VecDequeを持ち込もう

fn main() {
    // std::cmp：比較ユーティリティ
    println!("max: {}", cmp::max(10, 20));
    println!("min: {}", cmp::min(10, 20));

    // std::collections::VecDeque：両端キュー（待ち行列に最適）
    let mut queue: VecDeque<&str> = VecDeque::new();
    queue.push_back("一人目");
    queue.push_back("二人目");

    // TODO: pop_front()で先頭を取り出し、if letでSomeなら
    // 「先頭: {}」と出力しよう

    // std::f64::consts：数学定数
    println!("円周率: {:.4}", std::f64::consts::PI);
}`,
      solution: `use std::cmp;
use std::collections::VecDeque;

fn main() {
    // std::cmp：比較ユーティリティ
    println!("max: {}", cmp::max(10, 20));
    println!("min: {}", cmp::min(10, 20));

    // std::collections::VecDeque：両端キュー（待ち行列に最適）
    let mut queue: VecDeque<&str> = VecDeque::new();
    queue.push_back("一人目");
    queue.push_back("二人目");

    // pop_front()はOptionを返すのでif letで受け取る
    if let Some(first) = queue.pop_front() {
        println!("先頭: {}", first);
    }

    // std::f64::consts：数学定数
    println!("円周率: {:.4}", std::f64::consts::PI);
}`,
      hints: [
        `useはuse std::cmp;とuse std::collections::VecDeque;の2行です。関数は親モジュールまで、型は型自身まで持ち込む慣習でしたね。`,
        `pop_front()の戻り値はOption<&str>です。if let Some(first) = queue.pop_front() { ... }で取り出せます。`
      ],
      expectedOutput: "先頭: 一人目"
    },
    {
      id: 159,
      title: "実践：計算機能をモジュールに整理",
      explanation: `<p>学んだ知識を使って、平らに並んだ関数群をモジュールに整理する<strong>リファクタリング</strong>（動作を変えずにコードの構造を改善すること）を実践します。実務でモジュール分割を行うときの基本手順そのものです。</p>
<h4>整理の手順</h4>
<ol>
<li><strong>グループを見つける</strong>：add/subは「基本計算」、power/averageは「応用計算」という2グループに分けられる</li>
<li><strong>modで包む</strong>：グループごとに<code>basic</code>、<code>advanced</code>モジュールを作り、全体を<code>calculator</code>で包む</li>
<li><strong>pubを付ける</strong>：外から使う関数と、経路上のmodすべてに<code>pub</code>を付ける</li>
<li><strong>useで持ち込む</strong>：呼び出し側は<code>use calculator::basic;</code>のように持ち込み、<code>basic::add(...)</code>と呼ぶ</li>
</ol>
<pre><code>mod calculator {
    pub mod basic {
        pub fn add(a: f64, b: f64) -&gt; f64 { a + b }
    }
    pub mod advanced {
        pub fn power(base: f64, exp: u32) -&gt; f64 { ... }
    }
}

use calculator::basic;

fn main() {
    println!("{}", basic::add(10.0, 3.0));
}</code></pre>
<p>モジュール名が付くことで、呼び出し側のコードは<code>basic::add</code>「基本計算の加算」のように<strong>読むだけで分類が伝わる</strong>ようになります。これがモジュール整理の最大の利益です。</p>
<p>実際のプロジェクトではこの<code>calculator</code>を<code>calculator.rs</code>という別ファイルに切り出し、元のファイルには<code>mod calculator;</code>と宣言だけを書きます。中身の構造は今回書くインライン版とまったく同じなので、ここでの練習がそのまま通用します。</p>`,
      task: `平らに並んだ4つの関数を、<code>calculator</code>モジュールの中の<code>basic</code>（add、sub）と<code>advanced</code>（power、average）に整理してください。mainは<code>use</code>を活用して<code>basic::add(...)</code>の形で呼び出すこと。`,
      code: `// TODO: 4つの関数をcalculatorモジュールの中の
// basic（add、sub）とadvanced（power、average）に整理しよう

fn add(a: f64, b: f64) -> f64 {
    a + b
}

fn sub(a: f64, b: f64) -> f64 {
    a - b
}

fn power(base: f64, exp: u32) -> f64 {
    let mut result = 1.0;
    for _ in 0..exp {
        result *= base;
    }
    result
}

fn average(values: &[f64]) -> f64 {
    if values.is_empty() {
        return 0.0;
    }
    let sum: f64 = values.iter().sum();
    sum / values.len() as f64
}

fn main() {
    println!("10 + 3 = {}", add(10.0, 3.0));
    println!("10 - 3 = {}", sub(10.0, 3.0));
    println!("2の10乗 = {}", power(2.0, 10));
    let data = [80.0, 90.0, 70.0];
    println!("平均 = {}", average(&data));
}`,
      solution: `mod calculator {
    // 基本計算
    pub mod basic {
        pub fn add(a: f64, b: f64) -> f64 {
            a + b
        }

        pub fn sub(a: f64, b: f64) -> f64 {
            a - b
        }
    }

    // 応用計算
    pub mod advanced {
        pub fn power(base: f64, exp: u32) -> f64 {
            let mut result = 1.0;
            for _ in 0..exp {
                result *= base;
            }
            result
        }

        pub fn average(values: &[f64]) -> f64 {
            if values.is_empty() {
                return 0.0;
            }
            let sum: f64 = values.iter().sum();
            sum / values.len() as f64
        }
    }
}

use calculator::advanced;
use calculator::basic;

fn main() {
    println!("10 + 3 = {}", basic::add(10.0, 3.0));
    println!("10 - 3 = {}", basic::sub(10.0, 3.0));
    println!("2の10乗 = {}", advanced::power(2.0, 10));
    let data = [80.0, 90.0, 70.0];
    println!("平均 = {}", advanced::average(&data));
}`,
      hints: [
        `mod calculator { pub mod basic { ... } pub mod advanced { ... } }という骨組みを先に作り、既存の関数を中へ移動させます。`,
        `移動した関数にはすべてpubを付けます。pub modとpub fnの両方が必要です。`,
        `use calculator::basic;とuse calculator::advanced;を書けば、mainではbasic::add(10.0, 3.0)のように呼べます。`
      ],
      expectedOutput: "2の10乗 = 1024"
    },
    {
      id: 160,
      title: "総合演習",
      explanation: `<p>この章の総仕上げとして、<strong>お店の在庫管理システム</strong>を作ります。この章で学んだすべての道具を組み合わせます。</p>
<table>
<tr><th>使う知識</th><th>この演習での使いどころ</th></tr>
<tr><td>ネストしたモジュール</td><td>store::inventory（在庫）とstore::report（レポート）の2部門</td></tr>
<tr><td>構造体のpubフィールド制御</td><td>Itemのnameは公開、stockは非公開にして直接変更を防ぐ</td></tr>
<tr><td>コンストラクタとゲッター</td><td>Item::new(...)とstock()メソッド</td></tr>
<tr><td>super::によるパス指定</td><td>reportモジュールから隣のinventoryモジュールを参照</td></tr>
<tr><td>use</td><td>mainから短いパスで使う</td></tr>
</table>
<p>設計の要は<strong>在庫数<code>stock</code>を非公開にする</strong>ことです。在庫の変更は必ず<code>sell</code>メソッドを通させることで、「在庫以上には売れない」というビジネスルールをモジュール内部で保証します。外部がうっかり<code>item.stock = 9999</code>と書き換える事故をコンパイラが防いでくれます。</p>
<pre><code>pub fn sell(&amp;mut self, count: u32) -&gt; bool {
    if count &lt;= self.stock {
        self.stock -= count;
        true            // 販売成功
    } else {
        false           // 在庫不足
    }
}</code></pre>
<p>もうひとつの見どころは、兄弟モジュール間の参照です。<code>report</code>モジュールの中では<code>use super::inventory::Item;</code>と書きます。<code>super::</code>で親（store）に上がり、そこから<code>inventory</code>へ降りるパスです。</p>
<p>「公開する窓口を絞り、ルールをモジュール内に閉じ込める」——この設計感覚は、ファイル分割された実際のRustプロジェクトでもそのまま通用します。</p>`,
      task: `<code>TODO</code>の3箇所を完成させてください。(1)<code>sell</code>メソッド（在庫が足りればtrueを返して減らす、不足ならfalse）、(2)<code>report</code>モジュールの<code>use super::...</code>、(3)mainの<code>use</code>宣言です。`,
      code: `mod store {
    pub mod inventory {
        pub struct Item {
            pub name: String,
            stock: u32, // 非公開：直接の書き換えを防ぐ
        }

        impl Item {
            pub fn new(name: &str, stock: u32) -> Item {
                Item {
                    name: String::from(name),
                    stock,
                }
            }

            pub fn stock(&self) -> u32 {
                self.stock
            }

            // TODO: sellメソッドを完成させる
            // 在庫がcount以上あれば減らしてtrue、不足ならfalseを返す
            pub fn sell(&mut self, count: u32) -> bool {
                false
            }
        }
    }

    pub mod report {
        // TODO: super::を使って隣のinventoryモジュールからItemを持ち込む

        pub fn print_item(item: &Item) {
            println!("{}: 在庫{}個", item.name, item.stock());
        }
    }
}

// TODO: useでstore::inventory::Itemとstore::reportを持ち込む

fn main() {
    let mut apple = Item::new("りんご", 10);
    report::print_item(&apple);

    if apple.sell(3) {
        println!("3個販売しました");
    }
    report::print_item(&apple);

    if !apple.sell(100) {
        println!("在庫不足で販売できません");
    }
}`,
      solution: `mod store {
    pub mod inventory {
        pub struct Item {
            pub name: String,
            stock: u32, // 非公開：直接の書き換えを防ぐ
        }

        impl Item {
            pub fn new(name: &str, stock: u32) -> Item {
                Item {
                    name: String::from(name),
                    stock,
                }
            }

            pub fn stock(&self) -> u32 {
                self.stock
            }

            // 在庫の変更は必ずこのメソッドを通す
            pub fn sell(&mut self, count: u32) -> bool {
                if count <= self.stock {
                    self.stock -= count;
                    true
                } else {
                    false
                }
            }
        }
    }

    pub mod report {
        // super::で親（store）に上がり、inventoryへ降りる
        use super::inventory::Item;

        pub fn print_item(item: &Item) {
            println!("{}: 在庫{}個", item.name, item.stock());
        }
    }
}

use store::inventory::Item;
use store::report;

fn main() {
    let mut apple = Item::new("りんご", 10);
    report::print_item(&apple);

    if apple.sell(3) {
        println!("3個販売しました");
    }
    report::print_item(&apple);

    if !apple.sell(100) {
        println!("在庫不足で販売できません");
    }
}`,
      hints: [
        `sellはif count <= self.stockで在庫を確認し、足りればself.stock -= count;してtrue、そうでなければfalseを返します。`,
        `reportモジュールの中ではuse super::inventory::Item;と書きます。superは親のstoreを指します。`,
        `mainの前にはuse store::inventory::Item;とuse store::report;の2行を書きます。型はItem自身まで、関数は親モジュールreportまで持ち込む慣習です。`
      ],
      expectedOutput: "りんご: 在庫7個"
    }
  ]
});
