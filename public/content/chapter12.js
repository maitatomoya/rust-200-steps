// 第12章：トレイト
registerChapter({
  number: 12,
  title: "トレイト",
  description: "型の「能力」を定義するトレイトを学びます。ジェネリクスと組み合わせることで、柔軟かつ型安全な抽象化が完成します。",
  steps: [
    {
      id: 111,
      title: "トレイトの定義と実装",
      explanation: `<p><strong>トレイト（trait）</strong>とは、「この型はこういう振る舞いができる」という<strong>能力の定義</strong>です。他言語のインターフェースに似た仕組みで、前章の最後に登場した<code>PartialOrd</code>や<code>Copy</code>もトレイトでした。まずは自分でトレイトを定義してみましょう。</p>
<pre><code>// 「要約できる」という能力を定義する
trait Summary {
    // メソッドのシグネチャ（名前・引数・戻り値）だけを書く
    fn summarize(&amp;self) -&gt; String;
}</code></pre>
<p>トレイトの定義には<strong>メソッドの本体を書かず、シグネチャだけをセミコロンで終わらせます</strong>。「summarizeというメソッドを持つこと」だけを約束し、具体的な中身は型ごとに決めるためです。</p>
<p>型にトレイトを実装するには<code>impl トレイト名 for 型名</code>と書きます。</p>
<pre><code>struct Article {
    title: String,
    content: String,
}

impl Summary for Article {
    fn summarize(&amp;self) -&gt; String {
        format!("{}: {}", self.title, self.content)
    }
}</code></pre>
<p>通常のメソッド定義（<code>impl Article</code>）との違いは<code>Summary for</code>の部分だけです。実装後は普通のメソッドと同じように<code>article.summarize()</code>と呼び出せます。</p>
<p>トレイトの価値は「<strong>異なる型に共通の能力を持たせられる</strong>」ことです。記事もツイートも動画も、型としてはバラバラでも「要約できる」という能力を共有できます。この共通能力を軸に、型をまたいで動くコードが書けるようになります（ステップ113以降）。なお、トレイトを実装するときは定義されたメソッドを<strong>すべて</strong>実装する必要があり、1つでも欠けるとコンパイルエラーになります。</p>`,
      task: `トレイト<code>Summary</code>を<code>Article</code>に実装してください。<code>summarize</code>メソッドは「タイトル: 本文」の形式の<code>String</code>を返すようにします。`,
      code: `// 「要約できる」という能力の定義
trait Summary {
    fn summarize(&self) -> String;
}

struct Article {
    title: String,
    content: String,
}

// TODO: ここにArticleへのSummaryの実装を書く
// summarizeは format!("{}: {}", self.title, self.content) を返す

fn main() {
    let article = Article {
        title: String::from("Rust入門"),
        content: String::from("トレイトを学ぶ"),
    };
    println!("要約: {}", article.summarize());
}
`,
      solution: `// 「要約できる」という能力の定義
trait Summary {
    fn summarize(&self) -> String;
}

struct Article {
    title: String,
    content: String,
}

// ArticleにSummaryの能力を与える
impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{}: {}", self.title, self.content)
    }
}

fn main() {
    let article = Article {
        title: String::from("Rust入門"),
        content: String::from("トレイトを学ぶ"),
    };
    println!("要約: {}", article.summarize());
}
`,
      hints: [
        `implブロックの書き出しは「impl Summary for Article」です。通常のimplに「トレイト名 for」が加わった形です。`,
        `ブロックの中に、トレイト定義と同じシグネチャのsummarizeを書き、本体でformat!の結果を返します。`
      ],
      expectedOutput: "要約: Rust入門: トレイトを学ぶ"
    },
    {
      id: 112,
      title: "デフォルト実装",
      explanation: `<p>トレイトのメソッドには、シグネチャだけでなく<strong>本体（デフォルト実装）</strong>を書くこともできます。デフォルト実装があるメソッドは、実装側で書かなければそのまま使われ、書けば上書き（オーバーライド）されます。</p>
<pre><code>trait Summary {
    // 本体なし：実装側が必ず書く必要がある
    fn author(&amp;self) -&gt; String;

    // 本体あり：書かなければこのデフォルトが使われる
    fn summarize(&amp;self) -&gt; String {
        format!("{}さんの投稿をもっと読む", self.author())
    }
}</code></pre>
<p>注目すべきは、デフォルト実装の中から<code>self.author()</code>という<strong>未実装のメソッドを呼んでいる</strong>点です。「authorさえ実装してくれれば、summarizeはこちらで組み立てます」という設計ができるのです。実装側の負担を最小限にしつつ、共通処理を一箇所にまとめられます。</p>
<pre><code>impl Summary for Tweet {
    // authorだけ実装すれば、summarizeはデフォルトが使える
    fn author(&amp;self) -&gt; String {
        format!("@{}", self.username)
    }
}</code></pre>
<p>この技法は標準ライブラリでも多用されています。たとえば大小比較の<code>PartialOrd</code>トレイトは、中核のメソッドを1つ実装するだけで<code>&lt;</code>、<code>&gt;</code>、<code>&lt;=</code>、<code>&gt;=</code>に対応するメソッドすべてがデフォルト実装として手に入る構造になっています。</p>
<table>
<tr><th>メソッドの種類</th><th>実装側の義務</th><th>上書き</th></tr>
<tr><td>本体なし（必須メソッド）</td><td>必ず実装する</td><td>-</td></tr>
<tr><td>本体あり（デフォルト実装）</td><td>実装しなくてよい</td><td>可能</td></tr>
</table>`,
      task: `<code>Tweet</code>には<code>author</code>だけを実装し（<code>summarize</code>はデフォルト実装に任せる）、<code>Article</code>には<code>author</code>と<code>summarize</code>の両方を実装して（デフォルトを上書き）、動作の違いを確認してください。`,
      code: `trait Summary {
    fn author(&self) -> String;

    // デフォルト実装
    fn summarize(&self) -> String {
        format!("{}さんの投稿をもっと読む", self.author())
    }
}

struct Tweet {
    username: String,
    content: String,
}

struct Article {
    title: String,
}

// TODO: TweetにSummaryを実装する。authorは format!("@{}", self.username) を返す。
// summarizeは実装しない（デフォルトに任せる）

// TODO: ArticleにSummaryを実装する。authorは String::from("編集部") を返し、
// summarizeも実装して format!("記事「{}」", self.title) を返す（上書き）

fn main() {
    let tweet = Tweet {
        username: String::from("rustacean"),
        content: String::from("Rustは楽しい"),
    };
    println!("本文: {}", tweet.content);
    println!("{}", tweet.summarize());

    let article = Article {
        title: String::from("トレイト入門"),
    };
    println!("{}", article.summarize());
}
`,
      solution: `trait Summary {
    fn author(&self) -> String;

    // デフォルト実装
    fn summarize(&self) -> String {
        format!("{}さんの投稿をもっと読む", self.author())
    }
}

struct Tweet {
    username: String,
    content: String,
}

struct Article {
    title: String,
}

// authorだけ実装。summarizeはデフォルト実装が使われる
impl Summary for Tweet {
    fn author(&self) -> String {
        format!("@{}", self.username)
    }
}

// summarizeも実装してデフォルトを上書きする
impl Summary for Article {
    fn author(&self) -> String {
        String::from("編集部")
    }

    fn summarize(&self) -> String {
        format!("記事「{}」", self.title)
    }
}

fn main() {
    let tweet = Tweet {
        username: String::from("rustacean"),
        content: String::from("Rustは楽しい"),
    };
    println!("本文: {}", tweet.content);
    println!("{}", tweet.summarize());

    let article = Article {
        title: String::from("トレイト入門"),
    };
    println!("{}", article.summarize());
}
`,
      hints: [
        `Tweetのimplブロックにはauthorだけを書きます。summarizeを書かなくても呼び出せるのがデフォルト実装の効果です。`,
        `Articleのimplブロックにはauthorとsummarizeの両方を書きます。同名メソッドを書くとデフォルトより優先されます。`
      ],
      expectedOutput: "@rustaceanさんの投稿をもっと読む"
    },
    {
      id: 113,
      title: "impl Trait引数",
      explanation: `<p>トレイトの真価は、<strong>「特定の能力を持つ型なら何でも受け取れる関数」</strong>を書けることです。もっとも簡単な書き方が<code>impl Trait</code>構文です。</p>
<pre><code>// Summaryを実装した型なら何でも受け取れる
fn notify(item: &amp;impl Summary) {
    println!("速報！ {}", item.summarize());
}</code></pre>
<p><code>item: &amp;impl Summary</code>は「Summaryを実装した何らかの型への参照」という意味です。この関数には<code>Article</code>も<code>Tweet</code>も渡せます。</p>
<pre><code>notify(&amp;article);   // OK
notify(&amp;tweet);     // OK
notify(&amp;42);        // エラー！ i32はSummaryを実装していない</code></pre>
<p>重要なのは、関数の中で使えるのが<strong>トレイトで定義されたメソッドだけ</strong>という点です。<code>notify</code>の中で<code>item.summarize()</code>は呼べますが、<code>item.title</code>のようなArticle固有のフィールドには触れません。渡されるのがArticleとは限らないからです。これは制限であると同時に保護でもあります。「summarizeさえあれば動く」ことが関数のシグネチャから読み取れ、呼び出す側も実装する側も安心して変更できます。</p>
<p>引数の型を具体型からトレイトに変えることは、実務での設計にも直結します。たとえば「Articleを受け取って通知する関数」より「要約できるものを受け取って通知する関数」の方が、将来VideoやPodcastといった型が増えても<strong>関数を一切変更せずに対応できます</strong>。この「具体ではなく能力に依存する」考え方は、良い設計の基本原則として知られています。</p>`,
      task: `関数<code>notify</code>の引数を、<code>Article</code>専用から「<code>Summary</code>を実装した型なら何でも受け取れる」形に変更し、<code>Tweet</code>も渡せるようにしてください。`,
      code: `trait Summary {
    fn summarize(&self) -> String;
}

struct Article {
    title: String,
}

struct Tweet {
    username: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("記事「{}」", self.title)
    }
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("@{}のツイート", self.username)
    }
}

// TODO: 引数の型を変更して、Summaryを実装した型なら何でも受け取れるようにする
fn notify(item: &Article) {
    println!("速報！ {}", item.summarize());
}

fn main() {
    let article = Article {
        title: String::from("Rust 1.0リリース"),
    };
    let tweet = Tweet {
        username: String::from("rustacean"),
    };

    notify(&article);
    // ここでコンパイルエラー！ notifyはArticleしか受け取れない
    notify(&tweet);
}
`,
      solution: `trait Summary {
    fn summarize(&self) -> String;
}

struct Article {
    title: String,
}

struct Tweet {
    username: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("記事「{}」", self.title)
    }
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("@{}のツイート", self.username)
    }
}

// Summaryを実装した型なら何でも受け取れる
fn notify(item: &impl Summary) {
    println!("速報！ {}", item.summarize());
}

fn main() {
    let article = Article {
        title: String::from("Rust 1.0リリース"),
    };
    let tweet = Tweet {
        username: String::from("rustacean"),
    };

    notify(&article);
    notify(&tweet);
}
`,
      hints: [
        `引数の型注釈を「具体的な型」から「implキーワード＋トレイト名」に変えます。参照の&は残します。`,
        `notifyのシグネチャの&Articleの部分を、&の後にimpl Summaryが続く形に書き換えるだけです。`
      ],
      expectedOutput: "速報！ @rustaceanのツイート"
    },
    {
      id: 114,
      title: "トレイト境界 <T: Trait>",
      explanation: `<p><code>impl Trait</code>構文は、実は<strong>トレイト境界（trait bound）</strong>と呼ばれる正式な構文の省略形です。前章のステップ109で登場した<code>T: PartialOrd</code>と同じものです。</p>
<pre><code>// impl Trait構文（省略形）
fn notify(item: &amp;impl Summary) { ... }

// トレイト境界構文（正式形）：意味はまったく同じ
fn notify&lt;T: Summary&gt;(item: &amp;T) { ... }</code></pre>
<p><code>&lt;T: Summary&gt;</code>は「型パラメータTは、Summaryを実装した型に限る」という制約です。ジェネリクス（どんな型でも）とトレイト（この能力を持つ）が合体し、「<strong>この能力を持つ型なら、どんな型でも</strong>」を表現できます。</p>
<p>では、どちらを使えばよいのでしょうか。簡単な場合は<code>impl Trait</code>で十分ですが、トレイト境界にしかできないことがあります。代表例が「<strong>複数の引数を同じ型に強制する</strong>」ことです。</p>
<pre><code>// aとbは「それぞれ」Summaryを実装していればよく、別の型でもよい
fn show_two(a: &amp;impl Summary, b: &amp;impl Summary)

// aとbは必ず「同じ型T」でなければならない
fn show_two&lt;T: Summary&gt;(a: &amp;T, b: &amp;T)</code></pre>
<p><code>impl Trait</code>は出現するたびに独立した型を意味するため、「同じ型で」という制約は表現できません。トレイト境界なら、Tという名前を通じて複数の引数を結び付けられます。</p>
<table>
<tr><th>書き方</th><th>向いている場面</th></tr>
<tr><td><code>&amp;impl Trait</code></td><td>引数が少なくシンプルな関数</td></tr>
<tr><td><code>&lt;T: Trait&gt;</code></td><td>複数の引数を同じ型にしたい、型パラメータを戻り値でも使いたい</td></tr>
</table>`,
      task: `<code>notify</code>を<code>impl Trait</code>構文からトレイト境界構文<code>&lt;T: Summary&gt;</code>に書き換えてください。さらに、同じ型の2件を受け取って両方表示する<code>notify_two</code>をトレイト境界で完成させてください。`,
      code: `trait Summary {
    fn summarize(&self) -> String;
}

struct Article {
    title: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("記事「{}」", self.title)
    }
}

// TODO: impl Trait構文からトレイト境界構文<T: Summary>に書き換える
fn notify(item: &impl Summary) {
    println!("お知らせ: {}", item.summarize());
}

// TODO: トレイト境界を使って、同じ型Tの2つの参照aとbを受け取り、
// 「1件目: 」「2件目: 」に続けてそれぞれのsummarizeを表示する関数notify_twoを作る

fn main() {
    let a1 = Article {
        title: String::from("Rust入門"),
    };
    let a2 = Article {
        title: String::from("所有権の話"),
    };

    notify(&a1);
    notify_two(&a1, &a2);
}
`,
      solution: `trait Summary {
    fn summarize(&self) -> String;
}

struct Article {
    title: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("記事「{}」", self.title)
    }
}

// トレイト境界構文。意味は&impl Summaryと同じ
fn notify<T: Summary>(item: &T) {
    println!("お知らせ: {}", item.summarize());
}

// aとbは必ず同じ型Tになる
fn notify_two<T: Summary>(a: &T, b: &T) {
    println!("1件目: {}", a.summarize());
    println!("2件目: {}", b.summarize());
}

fn main() {
    let a1 = Article {
        title: String::from("Rust入門"),
    };
    let a2 = Article {
        title: String::from("所有権の話"),
    };

    notify(&a1);
    notify_two(&a1, &a2);
}
`,
      hints: [
        `関数名の直後に山かっこでT: Summaryを宣言し、引数の型を&Tにします。`,
        `notify_twoも同じ形で、引数を2つ（a: &T, b: &T）にします。本体はsummarizeを2回呼んで表示するだけです。`
      ],
      expectedOutput: "2件目: 記事「所有権の話」"
    },
    {
      id: 115,
      title: "複数境界とwhere句",
      explanation: `<p>1つの型パラメータに<strong>複数のトレイト境界</strong>を付けるには、<code>+</code>でつなぎます。前章の<code>T: PartialOrd + Copy</code>もこの形でした。</p>
<pre><code>use std::fmt::Debug;

// Tは「Debugで表示できて」かつ「Cloneで複製できる」型に限る
fn show_twice&lt;T: Debug + Clone&gt;(value: T) {
    let copy = value.clone();
    println!("{:?} {:?}", value, copy);
}</code></pre>
<p><code>Debug</code>は<code>{:?}</code>での表示を可能にするトレイト、<code>Clone</code>は<code>.clone()</code>での複製を可能にするトレイトです。境界に書いたトレイトのメソッドだけが関数内で使えます。</p>
<p>型パラメータと境界が増えると、シグネチャが読みにくくなります。そこで用意されているのが<strong>where句</strong>です。境界を関数シグネチャの後ろにまとめて書けます。</p>
<pre><code>// 山かっこ内に全部書くと読みにくい
fn show_pair&lt;T: Debug + Clone, U: Debug&gt;(a: T, b: U) { ... }

// where句なら境界が縦に並んで読みやすい
fn show_pair&lt;T, U&gt;(a: T, b: U)
where
    T: Debug + Clone,
    U: Debug,
{ ... }</code></pre>
<p>2つの書き方は<strong>意味が完全に同じ</strong>です。使い分けの目安は次のとおりです。</p>
<ul>
<li>境界が1〜2個で短い：山かっこ内に直接書く</li>
<li>型パラメータが複数、境界が長い：where句で整理する</li>
</ul>
<p>where句は標準ライブラリのドキュメントでも頻繁に登場するため、読めるようになっておくと公式ドキュメントの理解が一気に楽になります。</p>`,
      task: `コンパイルエラーになっています。<code>show_pair</code>の中で<code>clone</code>と<code>{:?}</code>表示を使っているのに、型パラメータに境界がありません。where句を使って<code>T</code>に<code>Debug + Clone</code>、<code>U</code>に<code>Debug</code>の境界を追加してください。`,
      code: `use std::fmt::Debug;

// 境界がないため、cloneも{:?}表示もできずコンパイルエラーになる
fn show_pair<T, U>(a: T, b: U) {
    let a_copy = a.clone();
    println!("a: {:?} (複製: {:?}) / b: {:?}", a, a_copy, b);
}

fn main() {
    show_pair(vec![1, 2, 3], 'x');
    show_pair(String::from("Rust"), 100);
}
`,
      solution: `use std::fmt::Debug;

// where句で境界をまとめて書く
fn show_pair<T, U>(a: T, b: U)
where
    T: Debug + Clone,
    U: Debug,
{
    let a_copy = a.clone();
    println!("a: {:?} (複製: {:?}) / b: {:?}", a, a_copy, b);
}

fn main() {
    show_pair(vec![1, 2, 3], 'x');
    show_pair(String::from("Rust"), 100);
}
`,
      hints: [
        `whereキーワードは引数リストの閉じかっこと本体の開きかっこの間に書きます。`,
        `where句には「T: Debug + Clone,」と「U: Debug,」の2行を書きます。cloneにはClone、{:?}表示にはDebugが必要です。`
      ],
      expectedOutput: "a: [1, 2, 3] (複製: [1, 2, 3]) / b: 'x'"
    },
    {
      id: 116,
      title: "戻り値のimpl Trait",
      explanation: `<p><code>impl Trait</code>は引数だけでなく<strong>戻り値の型</strong>にも使えます。「Summaryを実装した何かを返す」という意味になります。</p>
<pre><code>fn make_tweet() -&gt; impl Summary {
    Tweet {
        username: String::from("rustacean"),
        content: String::from("勉強中"),
    }
}</code></pre>
<p>呼び出し側から見ると、戻り値が具体的に何型なのかは見えず、「Summaryのメソッドが使える何か」としてだけ扱えます。これには次の利点があります。</p>
<ul>
<li><strong>実装の隠蔽</strong>：内部でTweetを返しているという事実を隠せる。後で別の型に差し替えても、呼び出し側のコードは壊れない</li>
<li><strong>書けない型・書きたくない型を返せる</strong>：後の章で学ぶクロージャなど、名前を書けない型を返すときに必須になる</li>
</ul>
<p>ただし重要な制限があります。<strong>1つの関数からは1種類の具体型しか返せません</strong>。</p>
<pre><code>// これはコンパイルエラー！
fn make_summary(is_tweet: bool) -&gt; impl Summary {
    if is_tweet {
        Tweet { ... }      // こちらはTweet
    } else {
        Article { ... }    // こちらはArticle。型が一致しない！
    }
}</code></pre>
<p>なぜなら<code>impl Trait</code>は「呼び出し側に型名を隠す」だけで、コンパイラ自身は<strong>単相化のためにただ1つの具体型を知っている必要がある</strong>からです（前章のステップ108を思い出してください）。分岐によって異なる型を返したい場合は、後の章で学ぶ別の仕組み（トレイトオブジェクト）が必要になります。今は「impl Traitの戻り値は1種類の型だけ」と覚えておけば十分です。</p>`,
      task: `関数<code>make_tweet</code>の戻り値の型を具体型<code>Tweet</code>から<code>impl Summary</code>に変更してください。変更後も<code>summarize</code>が呼べること、逆に<code>username</code>フィールドには触れなくなることを確認しましょう。`,
      code: `trait Summary {
    fn summarize(&self) -> String;
}

struct Tweet {
    username: String,
    content: String,
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("@{}: {}", self.username, self.content)
    }
}

// TODO: 戻り値の型をTweetからimpl Summaryに変更する
fn make_tweet() -> Tweet {
    Tweet {
        username: String::from("rustacean"),
        content: String::from("impl Traitを学習中"),
    }
}

fn main() {
    let t = make_tweet();
    println!("{}", t.summarize());

    // 注意: 戻り値をimpl Summaryにすると、次の行はエラーになる（消しておくこと）
    println!("ユーザー名: {}", t.username);
}
`,
      solution: `trait Summary {
    fn summarize(&self) -> String;
}

struct Tweet {
    username: String,
    content: String,
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("@{}: {}", self.username, self.content)
    }
}

// 「Summaryを実装した何か」を返す。具体型は呼び出し側から隠される
fn make_tweet() -> impl Summary {
    Tweet {
        username: String::from("rustacean"),
        content: String::from("impl Traitを学習中"),
    }
}

fn main() {
    let t = make_tweet();
    println!("{}", t.summarize());
}
`,
      hints: [
        `矢印の後の戻り値型を、implキーワード＋トレイト名に書き換えます。関数本体はそのままで大丈夫です。`,
        `impl Summaryを返すと、tは「Summaryの能力を持つ何か」になり、Tweet固有のフィールドusernameへのアクセスはエラーになります。その行を削除しましょう。`
      ],
      expectedOutput: "@rustacean: impl Traitを学習中"
    },
    {
      id: 117,
      title: "deriveできるトレイト一覧",
      explanation: `<p>これまで<code>#[derive(Debug)]</code>を「おまじない」として使ってきましたが、正体はトレイトの<strong>自動実装</strong>です。<code>derive（導出）</code>属性を付けると、コンパイラがそのトレイトの実装コードを自動生成してくれます。deriveできる主なトレイトを整理しましょう。</p>
<table>
<tr><th>トレイト</th><th>与えられる能力</th><th>使う場面</th></tr>
<tr><td><code>Debug</code></td><td><code>{:?}</code>で表示できる</td><td>デバッグ出力全般</td></tr>
<tr><td><code>Clone</code></td><td><code>.clone()</code>で複製できる</td><td>所有権を渡しつつ手元にも残したい</td></tr>
<tr><td><code>Copy</code></td><td>代入時に自動コピーされる</td><td>i32のような小さな値型（Cloneも必須）</td></tr>
<tr><td><code>PartialEq</code></td><td><code>==</code>と<code>!=</code>で比較できる</td><td>等価比較、assert_eq!</td></tr>
<tr><td><code>Eq</code></td><td>完全な等価関係の印</td><td>HashMapのキーにする（PartialEqも必須）</td></tr>
<tr><td><code>PartialOrd</code></td><td><code>&lt;</code>や<code>&gt;</code>で比較できる</td><td>大小比較、ソート</td></tr>
<tr><td><code>Ord</code></td><td>完全な順序の印</td><td>ソート、最大最小（PartialOrd等も必須）</td></tr>
<tr><td><code>Hash</code></td><td>ハッシュ値を計算できる</td><td>HashMapのキーにする</td></tr>
<tr><td><code>Default</code></td><td><code>Default::default()</code>で初期値を作れる</td><td>デフォルト値からの構築</td></tr>
</table>
<p>deriveは複数まとめて指定できます。</p>
<pre><code>#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}</code></pre>
<p>自動生成される実装は素直なものです。たとえば<code>PartialEq</code>なら「<strong>全フィールドが等しければ等しい</strong>」、<code>Clone</code>なら「全フィールドをcloneする」という実装になります。だからこそ、deriveには条件があります。<strong>全フィールドがそのトレイトを実装していること</strong>です。フィールドに比較できない型が混ざっていると<code>PartialEq</code>はderiveできません。特別な比較ルールが必要な場合は、deriveせずに手で実装することもできます（次のステップで手実装を体験します）。</p>`,
      task: `コンパイルエラーになっています。<code>Point</code>に<code>Clone</code>と<code>PartialEq</code>をderiveで追加して、<code>.clone()</code>と<code>==</code>を使えるようにしてください。`,
      code: `// Debugしかderiveしていないため、cloneと==がエラーになる
#[derive(Debug)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p1 = Point { x: 1, y: 2 };
    let p2 = p1.clone();
    let p3 = Point { x: 9, y: 9 };

    println!("p1 = {:?}", p1);
    println!("p1 == p2 : {}", p1 == p2);
    println!("p1 == p3 : {}", p1 == p3);
}
`,
      solution: `// deriveで3つのトレイトを自動実装する
#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p1 = Point { x: 1, y: 2 };
    let p2 = p1.clone();
    let p3 = Point { x: 9, y: 9 };

    println!("p1 = {:?}", p1);
    println!("p1 == p2 : {}", p1 == p2);
    println!("p1 == p3 : {}", p1 == p3);
}
`,
      hints: [
        `derive属性の丸かっこの中はカンマ区切りで複数指定できます。`,
        `.clone()にはClone、==にはPartialEqが必要です。#[derive(Debug, Clone, PartialEq)]とします。`
      ],
      expectedOutput: "p1 == p2 : true"
    },
    {
      id: 118,
      title: "Displayを実装する",
      explanation: `<p><code>{:?}</code>で使う<code>Debug</code>はderiveできますが、<code>{}</code>で使う<strong><code>Display</code>トレイトはderiveできません</strong>。「人間向けの表示形式」は開発者が意図を持って決めるべき、というRustの設計判断です。Displayは手で実装します。</p>
<pre><code>use std::fmt;

struct Point {
    x: i32,
    y: i32,
}

impl fmt::Display for Point {
    fn fmt(&amp;self, f: &amp;mut fmt::Formatter) -&gt; fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}</code></pre>
<p>初めて見る要素を1つずつ確認しましょう。</p>
<ul>
<li><code>use std::fmt;</code>：フォーマット関連の機能を持つ標準モジュールを読み込む</li>
<li><code>fmt::Formatter</code>：出力先を表す構造体。「ここに書き込んでください」と渡されるバッファのようなもの</li>
<li><code>write!</code>マクロ：<code>println!</code>の親戚。画面ではなく第1引数の出力先に書き込む。書式指定の書き方は<code>format!</code>と同じ</li>
<li><code>fmt::Result</code>：書き込みの成否を表す型。<code>write!</code>の戻り値をそのまま返せばよい（write!の後にセミコロンを付けないのがポイント）</li>
</ul>
<p>Displayを実装すると、2つの恩恵があります。1つ目は<code>println!("{}", p)</code>のように<code>{}</code>で表示できること。2つ目は<strong><code>to_string()</code>メソッドが自動的に手に入る</strong>ことです。標準ライブラリに「Displayを実装したすべての型にto_stringを提供する」実装があるためです。トレイトを1つ実装すると連鎖的に能力が増える、Rustらしい仕組みです。</p>`,
      task: `<code>Point</code>に<code>Display</code>トレイトを実装してください。<code>fmt</code>メソッドの中で<code>write!</code>マクロを使い、「(x, y)」の形式で書き込みます。実装後、<code>{}</code>での表示と<code>to_string()</code>の両方を確認します。`,
      code: `use std::fmt;

struct Point {
    x: i32,
    y: i32,
}

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // TODO: write!マクロでfに「(x, y)」の形式で書き込む
        // 書式はformat!と同じ。write!(f, ...) の形で書き、セミコロンは付けない
    }
}

fn main() {
    let p = Point { x: 3, y: 7 };
    println!("座標: {}", p);

    // Displayを実装するとto_string()も自動で使えるようになる
    let s = p.to_string();
    println!("文字列化: {}", s);
}
`,
      solution: `use std::fmt;

struct Point {
    x: i32,
    y: i32,
}

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

fn main() {
    let p = Point { x: 3, y: 7 };
    println!("座標: {}", p);

    // Displayを実装するとto_string()も自動で使えるようになる
    let s = p.to_string();
    println!("文字列化: {}", s);
}
`,
      hints: [
        `write!の第1引数は出力先のf、第2引数以降はformat!と同じ書式指定と値です。`,
        `write!(f, "({}, {})", self.x, self.y) と書きます。末尾にセミコロンを付けないことで、write!の結果（fmt::Result）がそのまま戻り値になります。`
      ],
      expectedOutput: "座標: (3, 7)"
    },
    {
      id: 119,
      title: "PartialOrdを使ったlargest関数",
      explanation: `<p>前章のステップ109で書いた<code>largest</code>関数を、トレイトを学んだ今あらためて理解しましょう。</p>
<pre><code>fn largest&lt;T: PartialOrd + Copy&gt;(list: &amp;Vec&lt;T&gt;) -&gt; T {
    let mut largest = list[0];
    for item in list {
        if *item &gt; largest {
            largest = *item;
        }
    }
    largest
}</code></pre>
<p>2つの境界の役割が今なら正確に説明できます。</p>
<table>
<tr><th>境界</th><th>関数内で可能になる操作</th></tr>
<tr><td><code>T: PartialOrd</code></td><td><code>&gt;</code>による比較。比較演算子は内部でPartialOrdのメソッド呼び出しに変換される</td></tr>
<tr><td><code>T: Copy</code></td><td><code>list[0]</code>や<code>*item</code>で、参照先の値を所有権の移動なしに取り出せる</td></tr>
</table>
<p>名前の「Partial（部分的）」が気になった人のために補足すると、f64の<code>NaN</code>（非数：0.0/0.0などの結果）は「どの値と比べても大きくも小さくも等しくもない」特殊な値です。このように<strong>比較が成立しないペアが存在し得る</strong>ため、順序が「部分的」という名前になっています。i32やcharのように常に比較できる型は、より強い<code>Ord</code>も実装しています。</p>
<p>また、<code>T: Copy</code>の制約があるため、この<code>largest</code>はi32やcharでは動きますが、Copyを実装しないStringのVecには使えません。制約を緩める設計（参照<code>&amp;T</code>を返す方式）もあり得ますが、まずは「境界が要求する能力と、関数内で使う操作が対応している」という感覚を固めましょう。境界は多すぎれば使える型が減り、少なすぎればコンパイルエラーになります。<strong>必要最小限の境界を付ける</strong>のが良い設計です。</p>`,
      task: `<code>largest</code>を参考に、最小値を返す<code>smallest</code>関数を実装してください。トレイト境界も自分で書き、数値と文字の両方で動くことを確認します。`,
      code: `fn largest<T: PartialOrd + Copy>(list: &Vec<T>) -> T {
    let mut largest = list[0];
    for item in list {
        if *item > largest {
            largest = *item;
        }
    }
    largest
}

// TODO: 最小値を返すsmallest関数を実装する
// largestと同じトレイト境界が必要。比較の向きだけが変わる

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    println!("最大の数値: {}", largest(&numbers));
    // TODO: smallestで「最小の数値: 25」と表示する

    let chars = vec!['y', 'm', 'a', 'q'];
    println!("最大の文字: {}", largest(&chars));
    // TODO: smallestで「最小の文字: a」と表示する
}
`,
      solution: `fn largest<T: PartialOrd + Copy>(list: &Vec<T>) -> T {
    let mut largest = list[0];
    for item in list {
        if *item > largest {
            largest = *item;
        }
    }
    largest
}

fn smallest<T: PartialOrd + Copy>(list: &Vec<T>) -> T {
    let mut smallest = list[0];
    for item in list {
        if *item < smallest {
            smallest = *item;
        }
    }
    smallest
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    println!("最大の数値: {}", largest(&numbers));
    println!("最小の数値: {}", smallest(&numbers));

    let chars = vec!['y', 'm', 'a', 'q'];
    println!("最大の文字: {}", largest(&chars));
    println!("最小の文字: {}", smallest(&chars));
}
`,
      hints: [
        `largest関数をコピーして、変数名と比較演算子の向きを変えるだけで完成します。`,
        `小なり比較もPartialOrdが提供するので、境界はlargestと同じ「T: PartialOrd + Copy」で大丈夫です。`
      ],
      expectedOutput: "最小の数値: 25"
    },
    {
      id: 120,
      title: "総合演習：要約可能なコンテンツ（記事とツイート）",
      explanation: `<p>この章の総仕上げです。「要約できるコンテンツ」を扱うミニ通知システムを作ります。登場する要素はすべてこの章で学んだものです。</p>
<ul>
<li><strong>トレイト定義</strong>：<code>Summary</code>トレイトは、必須メソッド<code>summarize_author</code>（投稿者名を返す）と、それを利用する<strong>デフォルト実装</strong>付きの<code>summarize</code>を持つ</li>
<li><strong>2つの型への実装</strong>：<code>Article</code>（記事）はsummarizeを<strong>上書き</strong>してタイトルと著者を表示、<code>Tweet</code>はauthorだけ実装して<strong>デフォルトに任せる</strong></li>
<li><strong>impl Trait引数</strong>：<code>notify</code>関数はSummaryを実装した型なら何でも受け取り、通知を表示する</li>
</ul>
<p>構造を図にすると次のようになります。</p>
<pre><code>Summary トレイト
├── summarize_author()  … 必須（各型が実装する）
└── summarize()         … デフォルト実装あり
        │
   ┌────┴────┐
Article        Tweet
（両方実装＝上書き）（authorのみ＝デフォルト利用）
        │
        └→ notify(&amp;impl Summary) がどちらも受け取れる</code></pre>
<p>この形は、実務のコード設計の縮図です。共通の振る舞いをトレイトに切り出し、共通処理はデフォルト実装へ、型ごとの個性は各実装へ、利用側はトレイトにだけ依存する。この分業ができると、新しいコンテンツ型（動画、ポッドキャスト等）を追加するとき、<strong>既存コードを一切変更せずに</strong>トレイトを実装するだけで通知システムに組み込めます。ジェネリクスとトレイトはRustの抽象化の核心です。ここまで理解できていれば、標準ライブラリのドキュメントに出てくるシグネチャの大半が読めるようになっているはずです。</p>`,
      task: `TODOに従って、(1)<code>Tweet</code>に<code>summarize_author</code>だけを実装し、(2)<code>Article</code>には<code>summarize</code>の上書きも加え、(3)<code>notify</code>関数を<code>impl Trait</code>引数で完成させてください。`,
      code: `trait Summary {
    fn summarize_author(&self) -> String;

    // デフォルト実装：summarize_authorを利用する
    fn summarize(&self) -> String {
        format!("({}の投稿をもっと読む)", self.summarize_author())
    }
}

struct Article {
    title: String,
    author: String,
    content: String,
}

struct Tweet {
    username: String,
    content: String,
}

// TODO(1): TweetにSummaryを実装する。
// summarize_authorは format!("@{}", self.username) を返す。summarizeは実装しない

// TODO(2): ArticleにSummaryを実装する。
// summarize_authorは self.author.clone() を返す。
// さらにsummarizeを上書きし、format!("{}（著者: {}）", self.title, self.author) を返す

// TODO(3): Summaryを実装した型なら何でも受け取れるnotify関数を作る。
// 「新着: 」に続けてitem.summarize()を表示する

fn main() {
    let article = Article {
        title: String::from("Rustのトレイト完全ガイド"),
        author: String::from("山田"),
        content: String::from("トレイトは型の能力を定義する仕組みで..."),
    };
    let tweet = Tweet {
        username: String::from("rustacean"),
        content: String::from("トレイト境界がやっと分かった！"),
    };

    println!("記事の本文: {}", article.content);
    println!("ツイートの本文: {}", tweet.content);

    notify(&article);
    notify(&tweet);
}
`,
      solution: `trait Summary {
    fn summarize_author(&self) -> String;

    // デフォルト実装：summarize_authorを利用する
    fn summarize(&self) -> String {
        format!("({}の投稿をもっと読む)", self.summarize_author())
    }
}

struct Article {
    title: String,
    author: String,
    content: String,
}

struct Tweet {
    username: String,
    content: String,
}

// Tweetはauthorだけ実装し、summarizeはデフォルトに任せる
impl Summary for Tweet {
    fn summarize_author(&self) -> String {
        format!("@{}", self.username)
    }
}

// Articleはsummarizeを上書きして独自の形式にする
impl Summary for Article {
    fn summarize_author(&self) -> String {
        self.author.clone()
    }

    fn summarize(&self) -> String {
        format!("{}（著者: {}）", self.title, self.author)
    }
}

// Summaryを実装した型なら何でも通知できる
fn notify(item: &impl Summary) {
    println!("新着: {}", item.summarize());
}

fn main() {
    let article = Article {
        title: String::from("Rustのトレイト完全ガイド"),
        author: String::from("山田"),
        content: String::from("トレイトは型の能力を定義する仕組みで..."),
    };
    let tweet = Tweet {
        username: String::from("rustacean"),
        content: String::from("トレイト境界がやっと分かった！"),
    };

    println!("記事の本文: {}", article.content);
    println!("ツイートの本文: {}", tweet.content);

    notify(&article);
    notify(&tweet);
}
`,
      hints: [
        `Tweetのimplブロックはステップ112のTweetとほぼ同じです。summarize_authorの1つだけを書きます。`,
        `Articleのimplブロックにはsummarize_authorとsummarizeの2つを書きます。同名メソッドを書けばデフォルト実装より優先されます。`,
        `notifyはステップ113と同じ形です。引数は&の後にimpl Summaryを続けます。`
      ],
      expectedOutput: "新着: (@rustaceanの投稿をもっと読む)"
    }
  ]
});
