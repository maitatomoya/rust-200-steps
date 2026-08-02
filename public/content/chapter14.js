// 第14章：クロージャとイテレータ
registerChapter({
  number: 14,
  title: "クロージャとイテレータ",
  description: "処理を値として扱う「クロージャ」と、データ加工の主役「イテレータ」を学び、簡潔で高速な関数型スタイルのコードを書けるようになります。",
  steps: [
    {
      id: 131,
      title: "クロージャの構文",
      explanation: `<p><strong>クロージャ（closure）</strong>とは、変数に代入したり関数に渡したりできる<strong>名前のない小さな関数</strong>です。縦棒<code>| |</code>の間に引数を書き、その後ろに本体を書きます。</p>
<pre><code>fn  add_one_fn (x: i32) -&gt; i32 { x + 1 }  // 関数
let add_one = |x: i32| -&gt; i32 { x + 1 };  // クロージャ（フル注釈）
let add_one = |x: i32|          x + 1;    // 型推論に任せた短い形
let add_one = |x|               x + 1;    // 引数の型も推論させる形</code></pre>
<p>関数と比べたときの構文上の違いを整理します。</p>
<table>
<tr><th>項目</th><th>関数</th><th>クロージャ</th></tr>
<tr><td>引数の囲み</td><td><code>( )</code></td><td><code>| |</code></td></tr>
<tr><td>型注釈</td><td>必須</td><td>省略可（推論される）</td></tr>
<tr><td>本体の波かっこ</td><td>必須</td><td>式が1つなら省略可</td></tr>
<tr><td>名前</td><td>必須</td><td>不要（変数に束縛して使う）</td></tr>
</table>
<p>クロージャは<code>let</code>で変数に束縛すれば、関数と同じように<code>add_one(5)</code>の形で呼び出せます。注意点として、型を省略したクロージャは<strong>最初に呼び出されたときの型で確定</strong>します。一度<code>i32</code>で呼んだクロージャを後から<code>f64</code>で呼ぶことはできません。</p>
<pre><code>let identity = |x| x;
let a = identity(5);       // ここでi32に確定
// let b = identity("hi"); // エラー！もうi32専用になっている</code></pre>
<p>クロージャの真価は次ステップ以降で学ぶ「環境のキャプチャ」と「イテレータとの組み合わせ」で発揮されます。まずは構文に慣れましょう。</p>`,
      task: `関数<code>add_one_fn</code>と同じ「1を足す」処理をするクロージャ<code>add_one</code>を定義して、コンパイルを通してください。`,
      code: `fn main() {
    // 関数版：1を足して返す
    fn add_one_fn(x: i32) -> i32 { x + 1 }

    // TODO: 同じ処理をするクロージャadd_oneを定義する
    // let add_one = ...;

    println!("関数: {}", add_one_fn(5));
    println!("クロージャ: {}", add_one(5));
}`,
      solution: `fn main() {
    // 関数版：1を足して返す
    fn add_one_fn(x: i32) -> i32 { x + 1 }

    // クロージャ版：|引数| 本体 の形で書き、変数に束縛する
    let add_one = |x: i32| x + 1;

    println!("関数: {}", add_one_fn(5));
    println!("クロージャ: {}", add_one(5));
}`,
      hints: [
        `クロージャは縦棒| |の間に引数を書き、その後ろに本体の式を書きます。本体が1つの式なら波かっこは不要です。`,
        `let add_one = |x: i32| x + 1;と書けば、add_one(5)で呼び出せます。`
      ],
      expectedOutput: "クロージャ: 6"
    },
    {
      id: 132,
      title: "環境のキャプチャ",
      explanation: `<p>クロージャが関数と決定的に違うのは、<strong>自分が定義されたスコープにある変数を使える</strong>ことです。これを<strong>環境のキャプチャ（capture）</strong>と呼びます。</p>
<pre><code>fn main() {
    let bonus = 10;
    // クロージャは外側の変数bonusをキャプチャして使える
    let add_bonus = |score| score + bonus;
    println!("{}", add_bonus(85)); // 95
}</code></pre>
<p>同じことを関数でやろうとするとエラーになります。関数は独立した存在で、外側のローカル変数にはアクセスできないからです。</p>
<pre><code>fn main() {
    let bonus = 10;
    fn add_bonus_fn(score: i32) -&gt; i32 {
        score + bonus // エラー！関数は外の変数を使えない
    }
}
// error[E0434]: can't capture dynamic environment in a fn item
// （fnアイテムの中では動的な環境をキャプチャできない）</code></pre>
<p>クロージャは環境の変数を、なるべく制約の軽い方法で自動的にキャプチャします。</p>
<table>
<tr><th>キャプチャ方法</th><th>いつ使われるか</th></tr>
<tr><td>不変借用（&amp;T）</td><td>読むだけのとき</td></tr>
<tr><td>可変借用（&amp;mut T）</td><td>変更するとき</td></tr>
<tr><td>所有権の移動</td><td>値を消費するとき、またはmoveを付けたとき</td></tr>
</table>
<p>上の例では<code>bonus</code>を読んでいるだけなので不変借用でキャプチャされます。つまり<code>add_bonus</code>を定義した後でも<code>bonus</code>をそのまま読めます。「クロージャ＝処理＋覚えている環境」というイメージを持つと理解しやすいでしょう。</p>`,
      task: `まずそのまま実行して出力を確認してください。次に<code>bonus</code>の値を<code>20</code>に変更して再実行し、クロージャがキャプチャしている値の変化が出力に反映されることを確認してください。`,
      code: `fn main() {
    let bonus = 10; // TODO: 出力を確認したら20に変えて再実行する
    // add_bonusは外側の変数bonusをキャプチャしている
    let add_bonus = |score| score + bonus;
    println!("最終スコア: {}", add_bonus(85));
}`,
      solution: `fn main() {
    let bonus = 20; // キャプチャされる値を変えると、クロージャの結果も変わる
    // add_bonusは外側の変数bonusをキャプチャしている
    let add_bonus = |score| score + bonus;
    println!("最終スコア: {}", add_bonus(85));
}`,
      hints: [
        `クロージャは引数scoreだけでなく、外側の変数bonusも参照しています。これがキャプチャです。`,
        `let bonus = 10;を let bonus = 20;に書き換えるだけです。85 + 20 = 105が出力されます。`
      ],
      expectedOutput: "最終スコア: 105"
    },
    {
      id: 133,
      title: "moveクロージャ",
      explanation: `<p>クロージャの前に<code>move</code>キーワードを付けると、キャプチャ方法が強制的に<strong>所有権の移動</strong>になります。</p>
<pre><code>let list = vec![1, 2, 3];
let show = move || println!("{:?}", list); // listの所有権がクロージャへ移る
// println!("{:?}", list); // エラー！listはもう使えない
show();</code></pre>
<p>このとき出るエラーは、所有権の章で学んだムーブのエラーそのものです。</p>
<pre><code>error[E0382]: borrow of moved value: 'list'
note: value moved into closure here
（値はここでクロージャの中にムーブされた）</code></pre>
<p><code>move</code>なしのクロージャは<code>list</code>を借用するだけなので、定義後も元の変数を使えます。違いを整理しましょう。</p>
<table>
<tr><th></th><th>moveなし</th><th>moveあり</th></tr>
<tr><td>キャプチャ方法</td><td>借用（読むだけなら&amp;T）</td><td>所有権の移動</td></tr>
<tr><td>元の変数</td><td>引き続き使える</td><td>使えなくなる（Copy型を除く）</td></tr>
<tr><td>クロージャの寿命</td><td>借用元より長生きできない</td><td>環境を自前で所有するので独立</td></tr>
</table>
<p>では<code>move</code>はいつ必要なのでしょうか。代表例は<strong>クロージャが定義元のスコープより長生きする場合</strong>です。たとえばクロージャを関数から返すときや、後の章で学ぶ別スレッドへ処理を渡すときは、借用のままだと参照先が先に破棄されてしまうため<code>move</code>が必須になります。逆に、同じスコープ内で使うだけなら<code>move</code>は不要なことがほとんどです。なお<code>i32</code>のような<code>Copy</code>型は<code>move</code>してもコピーされるだけなので、元の変数も使い続けられます。</p>`,
      task: `このコードは<code>move</code>によって<code>list</code>の所有権がクロージャに移った後で<code>list</code>を使っているためエラーになります。このクロージャは同じスコープで使うだけなので、<code>move</code>を削除して借用キャプチャに変え、エラーを解消してください。`,
      code: `fn main() {
    let list = vec![1, 2, 3];
    // moveによりlistの所有権はクロージャの中へ移動する
    let show = move || println!("リスト: {:?}", list);
    // エラー: borrow of moved value: 'list'
    println!("定義後もlistを使いたい: {:?}", list);
    show();
}`,
      solution: `fn main() {
    let list = vec![1, 2, 3];
    // moveを外すと、クロージャはlistを不変借用でキャプチャする
    let show = || println!("リスト: {:?}", list);
    // 借用なので、元の変数listもそのまま読める
    println!("定義後もlistを使いたい: {:?}", list);
    show();
}`,
      hints: [
        `moveクロージャは環境の変数の所有権を奪います。エラーメッセージのvalue moved into closure hereがその証拠です。`,
        `読むだけのクロージャならmoveを削除すれば不変借用になり、元のlistも使い続けられます。`
      ],
      expectedOutput: "リスト: [1, 2, 3]"
    },
    {
      id: 134,
      title: "Fn・FnMut・FnOnceの違い",
      explanation: `<p>クロージャは環境の扱い方によって、3つのトレイトのいずれか（複数のこともある）を実装します。この分類は、クロージャを関数の引数として受け取るときの<strong>トレイト境界</strong>として登場します。</p>
<table>
<tr><th>トレイト</th><th>環境の扱い</th><th>呼び出し回数</th><th>例</th></tr>
<tr><td><code>Fn</code></td><td>不変借用で読むだけ</td><td>何度でも</td><td>|| println!("{}", name)</td></tr>
<tr><td><code>FnMut</code></td><td>可変借用で変更する</td><td>何度でも（mutが必要）</td><td>|| count += 1</td></tr>
<tr><td><code>FnOnce</code></td><td>値を消費（ムーブ）する</td><td><strong>1回だけ</strong></td><td>|| drop_item(item)</td></tr>
</table>
<p>3つには包含関係があります。<code>Fn</code>を実装するクロージャは<code>FnMut</code>と<code>FnOnce</code>も実装し、<code>FnMut</code>を実装するものは<code>FnOnce</code>も実装します。「すべてのクロージャは少なくとも1回は呼べる（FnOnce）」と考えると自然です。</p>
<p>コードを書くうえで意識するポイントは2つです。</p>
<ol>
<li>環境を<strong>変更する</strong>クロージャは、束縛する変数にも<code>mut</code>が必要（<code>let mut increment = || count += 1;</code>）</li>
<li>環境の値を<strong>消費する</strong>クロージャは2回呼べない。2回目の呼び出しはムーブ済みエラーになる</li>
</ol>
<pre><code>let message = String::from("hi");
let consume = move || {
    let owned = message; // messageを消費するのでFnOnce
    println!("{}", owned);
};
consume();
// consume(); // エラー！use of moved value</code></pre>
<p>標準ライブラリのドキュメントで<code>F: Fn(i32) -&gt; i32</code>のような境界を見かけたら、「このクロージャは何度でも呼ばれる可能性があり、環境を変更しないものに限る」と読み取れるようになりましょう。</p>`,
      task: `まずそのまま実行して3種類のクロージャの動きを確認してください。次に<code>FnMut</code>の例である<code>increment()</code>の呼び出しを2回から3回に増やして再実行し、環境の<code>count</code>が呼び出しのたびに変化することを確認してください。`,
      code: `fn main() {
    // Fn: 環境を読むだけ。何度でも呼べる
    let name = String::from("Rust");
    let greet = || println!("こんにちは、{}", name);
    greet();
    greet();

    // FnMut: 環境を変更する。束縛にもmutが必要
    let mut count = 0;
    let mut increment = || {
        count += 1;
        println!("カウント: {}", count);
    };
    increment();
    increment();
    // TODO: incrementの呼び出しをもう1回増やして3回にする

    // FnOnce: 環境の値を消費する。1回しか呼べない
    let message = String::from("さようなら");
    let consume = move || {
        let owned = message; // messageの所有権を奪って消費する
        println!("消費: {}", owned);
    };
    consume();
}`,
      solution: `fn main() {
    // Fn: 環境を読むだけ。何度でも呼べる
    let name = String::from("Rust");
    let greet = || println!("こんにちは、{}", name);
    greet();
    greet();

    // FnMut: 環境を変更する。束縛にもmutが必要
    let mut count = 0;
    let mut increment = || {
        count += 1;
        println!("カウント: {}", count);
    };
    increment();
    increment();
    increment(); // FnMutは何度でも呼べる。呼ぶたびにcountが増える

    // FnOnce: 環境の値を消費する。1回しか呼べない
    let message = String::from("さようなら");
    let consume = move || {
        let owned = message; // messageの所有権を奪って消費する
        println!("消費: {}", owned);
    };
    consume();
}`,
      hints: [
        `FnMutのクロージャは可変借用で環境を持つため、mutを付けて束縛すれば何度でも呼べます。`,
        `increment();の行を1行追加するだけです。カウント: 3まで表示されれば成功です。`
      ],
      expectedOutput: "カウント: 3"
    },
    {
      id: 135,
      title: "イテレータとnext()",
      explanation: `<p><strong>イテレータ（iterator）</strong>とは、<strong>要素の並びを1つずつ順番に取り出す</strong>ための仕組みです。実はこれまで使ってきた<code>for</code>ループも、内部ではイテレータを使っています。</p>
<p>イテレータの正体は<code>Iterator</code>トレイトで、その中心は<code>next</code>メソッドただ1つです。</p>
<pre><code>pub trait Iterator {
    type Item; // 取り出す要素の型
    fn next(&amp;mut self) -&gt; Option&lt;Self::Item&gt;;
}</code></pre>
<p><code>next()</code>は呼ぶたびに次の要素を<code>Some(値)</code>で返し、要素が尽きると<code>None</code>を返します。エラー処理の章で学んだ<code>Option</code>がここで活躍します。</p>
<pre><code>let v = vec![10, 20];
let mut iter = v.iter();
iter.next(); // Some(10)
iter.next(); // Some(20)
iter.next(); // None（もう要素がない）</code></pre>
<p>2つ注意点があります。1つ目は、<code>next()</code>を呼ぶとイテレータ内部の「現在位置」が進むため、イテレータの変数には<code>mut</code>が必要なこと。2つ目は、イテレータは<strong>怠惰（lazy）</strong>であることです。作っただけでは何も起こらず、<code>next()</code>が呼ばれて初めて仕事をします。</p>
<p>Vecからイテレータを作る方法は3種類あり、取り出される要素の型が異なります。</p>
<table>
<tr><th>メソッド</th><th>要素の型</th><th>元のVec</th></tr>
<tr><td><code>iter()</code></td><td><code>&amp;T</code>（不変参照）</td><td>残る</td></tr>
<tr><td><code>iter_mut()</code></td><td><code>&amp;mut T</code>（可変参照）</td><td>残る</td></tr>
<tr><td><code>into_iter()</code></td><td><code>T</code>（所有権ごと）</td><td>消費される</td></tr>
</table>
<p>迷ったら「読むだけなら<code>iter()</code>、変換して新しいコレクションを作るなら<code>into_iter()</code>」と覚えておきましょう。</p>`,
      task: `<code>next()</code>の呼び出しを追加して、<code>Some(30)</code>とその次の<code>None</code>まで表示されるようにしてください。全部で4回<code>next()</code>を呼びます。`,
      code: `fn main() {
    let v = vec![10, 20, 30];
    // nextを呼ぶと内部の位置が進むので、mutが必要
    let mut iter = v.iter();
    println!("{:?}", iter.next());
    println!("{:?}", iter.next());
    // TODO: nextの呼び出しをあと2回追加して、Some(30)とNoneを表示する
}`,
      solution: `fn main() {
    let v = vec![10, 20, 30];
    // nextを呼ぶと内部の位置が進むので、mutが必要
    let mut iter = v.iter();
    println!("{:?}", iter.next());
    println!("{:?}", iter.next());
    println!("{:?}", iter.next()); // 最後の要素: Some(30)
    println!("{:?}", iter.next()); // 要素が尽きた: None
}`,
      hints: [
        `next()は要素があればSome(値)、尽きたらNoneを返します。3要素のVecなら4回目の呼び出しでNoneになります。`,
        `println!("{:?}", iter.next());の行をあと2回コピーして追加するだけです。`
      ],
      expectedOutput: "None"
    },
    {
      id: 136,
      title: "mapとcollect",
      explanation: `<p>イテレータの真骨頂は、<code>next()</code>を直接呼ぶことではなく、<strong>アダプタメソッド</strong>を連ねてデータ加工を宣言的に書けることです。まずは最重要コンビの<code>map</code>と<code>collect</code>を学びます。</p>
<p><code>map</code>は「<strong>各要素にクロージャを適用して変換する</strong>」イテレータアダプタです。前のステップで学んだイテレータの怠惰さに注意してください。<code>map</code>を呼んだだけでは何も起きません。</p>
<pre><code>let v = vec![1, 2, 3];
v.iter().map(|x| x * 2); // 警告：何も起こらない！
// warning: iterators are lazy and do nothing unless consumed
// （イテレータは怠惰なので、消費されない限り何もしない）</code></pre>
<p>結果を実際に取り出すのが<strong>消費アダプタ</strong>の<code>collect</code>です。<code>collect</code>はイテレータを最後まで回し、結果を新しいコレクションに集めます。</p>
<pre><code>let v = vec![1, 2, 3];
let doubled: Vec&lt;i32&gt; = v.iter().map(|x| x * 2).collect();
// doubled は [2, 4, 6]</code></pre>
<p>ここで重要なのが<strong>型注釈</strong>です。<code>collect</code>はVecの他にStringやHashMapなど様々なコレクションを作れる万能メソッドなので、<strong>何に集めたいのかを型で伝える必要があります</strong>。<code>let doubled: Vec&lt;i32&gt; = ...</code>のように受け取る変数に注釈するのが一般的です。</p>
<p>従来のforループとの比較で、宣言的スタイルの良さを感じてください。</p>
<pre><code>// forループ版：手続き的
let mut doubled = Vec::new();
for x in &amp;v {
    doubled.push(x * 2);
}
// イテレータ版：宣言的（何をしたいかが1行で読める）
let doubled: Vec&lt;i32&gt; = v.iter().map(|x| x * 2).collect();</code></pre>`,
      task: `<code>map</code>のクロージャを完成させて、各価格を税込価格（<code>価格 * 110 / 100</code>で計算）に変換した<code>Vec&lt;i32&gt;</code>を作ってください。`,
      code: `fn main() {
    let prices = vec![100, 250, 380];

    // TODO: mapのクロージャを完成させて、各価格を税込（p * 110 / 100）に変換する
    let with_tax: Vec<i32> = prices.iter().map(|p| 0 /* ここを直す */).collect();

    println!("税込価格: {:?}", with_tax);
}`,
      solution: `fn main() {
    let prices = vec![100, 250, 380];

    // mapが各要素にクロージャを適用し、collectが新しいVecに集める
    let with_tax: Vec<i32> = prices.iter().map(|p| p * 110 / 100).collect();

    println!("税込価格: {:?}", with_tax);
}`,
      hints: [
        `mapのクロージャは要素を1つ受け取り、変換後の値を返します。10%の消費税は整数のまま p * 110 / 100 で計算できます。`,
        `|p| p * 110 / 100 と書きます。100円は110円、250円は275円、380円は418円になります。`
      ],
      expectedOutput: "税込価格: [110, 275, 418]"
    },
    {
      id: 137,
      title: "filter",
      explanation: `<p><code>filter</code>は「<strong>条件を満たす要素だけを残す</strong>」イテレータアダプタです。<code>bool</code>を返すクロージャ（述語と呼びます）を渡し、<code>true</code>になった要素だけが通過します。</p>
<pre><code>let numbers = vec![1, 2, 3, 4, 5, 6];
let evens: Vec&lt;i32&gt; = numbers
    .into_iter()
    .filter(|n| n % 2 == 0)
    .collect();
// evens は [2, 4, 6]</code></pre>
<p><code>filter</code>で1つつまずきやすいのが、クロージャの引数の型です。<code>filter</code>は要素を「見て判断するだけ」で消費しないため、クロージャには<strong>要素への参照</strong>が渡されます。<code>into_iter()</code>（要素の型は<code>i32</code>）と組み合わせると、クロージャが受け取るのは<code>&amp;i32</code>です。</p>
<p>参照のままでも比較はできますが、クロージャの引数部分にパターン<code>|&amp;s|</code>と書くと参照を外して中身を受け取れます。</p>
<table>
<tr><th>書き方</th><th>sの型</th><th>比較の書き方</th></tr>
<tr><td><code>.filter(|s| ...)</code></td><td><code>&amp;i32</code></td><td><code>*s &gt;= 70</code>（デリファレンスが必要な場面あり）</td></tr>
<tr><td><code>.filter(|&amp;s| ...)</code></td><td><code>i32</code></td><td><code>s &gt;= 70</code>（そのまま比較できる）</td></tr>
</table>
<p><code>map</code>との違いも整理しておきましょう。</p>
<ul>
<li><code>map</code>：要素の<strong>中身を変換</strong>する。要素数は変わらない</li>
<li><code>filter</code>：要素を<strong>選別</strong>する。中身は変わらず、要素数が減りうる</li>
</ul>
<p>この2つを組み合わせれば「絞り込んでから変換する」という実務頻出の処理が1つの式で書けます。</p>`,
      task: `<code>filter</code>の条件を完成させて、70点以上の点数だけを集めた<code>Vec&lt;i32&gt;</code>を作ってください。クロージャの引数は<code>|&amp;s|</code>の形で参照を外すと比較が書きやすくなります。`,
      code: `fn main() {
    let scores = vec![58, 72, 91, 45, 88, 63];

    // TODO: filterの条件を完成させて、70点以上だけを残す
    let passed: Vec<i32> = scores.into_iter().filter(|&s| false /* ここを直す */).collect();

    println!("合格点: {:?}", passed);
}`,
      solution: `fn main() {
    let scores = vec![58, 72, 91, 45, 88, 63];

    // filterはtrueを返した要素だけを通す。|&s|で参照を外してi32として受け取る
    let passed: Vec<i32> = scores.into_iter().filter(|&s| s >= 70).collect();

    println!("合格点: {:?}", passed);
}`,
      hints: [
        `filterのクロージャはboolを返します。trueなら要素が残り、falseなら捨てられます。`,
        `falseの部分を s >= 70 に書き換えます。72、91、88の3つが残れば成功です。`
      ],
      expectedOutput: "合格点: [72, 91, 88]"
    },
    {
      id: 138,
      title: "sum・fold・count",
      explanation: `<p>イテレータを最後まで回して<strong>1つの値にまとめる</strong>消費アダプタを学びます。集計処理の中心となる3つです。</p>
<table>
<tr><th>メソッド</th><th>働き</th><th>例</th></tr>
<tr><td><code>sum()</code></td><td>全要素の合計</td><td><code>let t: i32 = v.iter().sum();</code></td></tr>
<tr><td><code>count()</code></td><td>要素数を数える</td><td><code>let n = v.iter().count();</code></td></tr>
<tr><td><code>fold()</code></td><td>累積計算の万能選手</td><td><code>v.iter().fold(0, |acc, &amp;x| acc + x)</code></td></tr>
</table>
<p><code>sum()</code>は結果の型が決められないことがあるため、<code>let total: i32 = ...</code>のような型注釈が必要です。<code>count()</code>は<code>filter</code>と組み合わせて「条件を満たす件数」を数えるのが定番です。</p>
<p><code>fold</code>は少し複雑ですが、最も強力です。<strong>初期値</strong>と<strong>累積用クロージャ</strong>を渡します。クロージャは「これまでの累積値<code>acc</code>」と「今の要素」を受け取り、「新しい累積値」を返します。</p>
<pre><code>// [1, 2, 3]の合計をfoldで書くと…
let total = vec![1, 2, 3].iter().fold(0, |acc, &amp;x| acc + x);
// 動きを追うと：
// acc=0, x=1 → 0+1=1
// acc=1, x=2 → 1+2=3
// acc=3, x=3 → 3+3=6</code></pre>
<p>実は<code>sum</code>も<code>count</code>も<code>fold</code>で書き直せます。「合計」以外の累積、たとえば<strong>最大値を探す</strong>処理は次のように書けます。</p>
<pre><code>let max = v.iter().fold(0, |acc, &amp;x| {
    if x &gt; acc { x } else { acc } // 大きい方を次の累積値にする
});</code></pre>
<p>専用メソッドがあるものは専用メソッド（読みやすい）、複雑な累積は<code>fold</code>、と使い分けましょう。</p>`,
      task: `<code>fold</code>のクロージャを完成させて、出費の最大値を求めてください。累積値<code>acc</code>と今の要素<code>e</code>を比べて、大きい方を返すクロージャを書きます。`,
      code: `fn main() {
    let expenses = vec![1200, 800, 3500, 450];

    // sum: 合計（結果の型注釈が必要）
    let total: i32 = expenses.iter().sum();

    // filter + count: 条件を満たす件数
    let count = expenses.iter().filter(|&&e| e >= 1000).count();

    // TODO: foldで最大値を求める。accとeの大きい方を返すクロージャを完成させる
    let max = expenses.iter().fold(0, |acc, &e| 0 /* ここを直す */);

    println!("合計: {}円", total);
    println!("1000円以上の件数: {}", count);
    println!("最大: {}円", max);
}`,
      solution: `fn main() {
    let expenses = vec![1200, 800, 3500, 450];

    // sum: 合計（結果の型注釈が必要）
    let total: i32 = expenses.iter().sum();

    // filter + count: 条件を満たす件数
    let count = expenses.iter().filter(|&&e| e >= 1000).count();

    // fold: 初期値0から始めて、要素ごとに大きい方を残していく
    let max = expenses.iter().fold(0, |acc, &e| if e > acc { e } else { acc });

    println!("合計: {}円", total);
    println!("1000円以上の件数: {}", count);
    println!("最大: {}円", max);
}`,
      hints: [
        `foldのクロージャは(これまでの累積値, 今の要素)を受け取り、新しい累積値を返します。最大値探しなら「大きい方を返す」処理です。`,
        `if e > acc { e } else { acc } と書きます。ifは式なので、そのままクロージャの本体にできます。`
      ],
      expectedOutput: "最大: 3500円"
    },
    {
      id: 139,
      title: "enumerate・zip・chain",
      explanation: `<p>複数の並びを組み合わせたり、位置情報を添えたりする便利なアダプタを3つ学びます。</p>
<table>
<tr><th>メソッド</th><th>働き</th><th>要素の形</th></tr>
<tr><td><code>enumerate()</code></td><td>各要素に0始まりの番号を付ける</td><td><code>(番号, 要素)</code>のタプル</td></tr>
<tr><td><code>zip(他方)</code></td><td>2つのイテレータを先頭から組にする</td><td><code>(左の要素, 右の要素)</code></td></tr>
<tr><td><code>chain(他方)</code></td><td>2つのイテレータを直列につなぐ</td><td>元の要素のまま</td></tr>
</table>
<p><code>enumerate</code>は「何番目か」が必要なループの定番です。forループのパターンでタプルを分解して受け取ります。</p>
<pre><code>for (i, name) in names.iter().enumerate() {
    println!("{}番: {}", i + 1, name); // iは0始まりなので+1
}</code></pre>
<p><code>zip</code>は対応関係のある2つのVec（名前と点数など）を同時に処理したいときに使います。<strong>短い方が尽きた時点で終わる</strong>のがポイントで、長さが違ってもエラーにはなりません。</p>
<pre><code>for (name, score) in names.iter().zip(scores.iter()) {
    println!("{}さんは{}点", name, score);
}</code></pre>
<p><code>chain</code>は2つの並びを「順番に続けて」処理します。<code>zip</code>が横に並べる（組にする）のに対し、<code>chain</code>は縦につなぐイメージです。</p>
<pre><code>let a = vec![1, 2];
let b = vec![3, 4];
let joined: Vec&lt;i32&gt; = a.into_iter().chain(b.into_iter()).collect();
// joined は [1, 2, 3, 4]</code></pre>
<p>これらはすべてイテレータアダプタなので、<code>map</code>や<code>filter</code>と自由に組み合わせられます。「番号付きで絞り込む」「2つのリストを組にして変換する」といった処理が、ループ変数の手動管理なしで安全に書けます。</p>`,
      task: `<code>zip</code>を使って<code>names</code>と<code>scores</code>を組にし、「◯◯さんは◯点」と表示するforループを完成させてください。`,
      code: `fn main() {
    let names = vec!["田中", "鈴木", "佐藤"];
    let scores = vec![85, 92, 78];

    // enumerate: 0始まりの番号付きで取り出す
    for (i, name) in names.iter().enumerate() {
        println!("{}番: {}", i + 1, name);
    }

    // TODO: zipでnamesとscoresを組にして「◯◯さんは◯点」と表示する
    // for (name, score) in ... {
    //     println!("{}さんは{}点", name, score);
    // }

    // chain: 2つのVecを直列につなぐ
    let a = vec![1, 2];
    let b = vec![3, 4];
    let joined: Vec<i32> = a.into_iter().chain(b.into_iter()).collect();
    println!("連結: {:?}", joined);
}`,
      solution: `fn main() {
    let names = vec!["田中", "鈴木", "佐藤"];
    let scores = vec![85, 92, 78];

    // enumerate: 0始まりの番号付きで取り出す
    for (i, name) in names.iter().enumerate() {
        println!("{}番: {}", i + 1, name);
    }

    // zip: 2つのイテレータを先頭から組にする
    for (name, score) in names.iter().zip(scores.iter()) {
        println!("{}さんは{}点", name, score);
    }

    // chain: 2つのVecを直列につなぐ
    let a = vec![1, 2];
    let b = vec![3, 4];
    let joined: Vec<i32> = a.into_iter().chain(b.into_iter()).collect();
    println!("連結: {:?}", joined);
}`,
      hints: [
        `zipは左のイテレータに.zip(右のイテレータ)と呼び出し、(左, 右)のタプルを順に返します。`,
        `for (name, score) in names.iter().zip(scores.iter()) { ... }と書き、コメントアウトされたprintln!を有効にします。`
      ],
      expectedOutput: "鈴木さんは92点"
    },
    {
      id: 140,
      title: "総合演習：イテレータチェーンでデータ加工パイプライン",
      explanation: `<p>この章の総仕上げとして、実務で頻出する<strong>データ加工パイプライン</strong>を組み立てます。パイプラインとは、<code>filter</code>で絞り込み、<code>map</code>で変換し、<code>collect</code>や<code>sum</code>でまとめる、という一連の流れをメソッドチェーンで表現したものです。</p>
<pre><code>元データ → filter（選別） → map（変換） → collect / sum（集約）</code></pre>
<p>今回の題材は商品データ<code>(名前, 価格, 在庫数)</code>のタプルのVecです。タプルの要素には<code>p.0</code>、<code>p.1</code>、<code>p.2</code>でアクセスできることを思い出しましょう。</p>
<pre><code>let products = vec![
    ("りんご", 120, 30),
    ("メロン", 800, 0), // 在庫切れ
];
// 在庫がある商品の名前だけ集める
let names: Vec&lt;&amp;str&gt; = products
    .iter()
    .filter(|p| p.2 &gt; 0)   // 在庫数p.2で選別
    .map(|p| p.0)          // 名前p.0に変換
    .collect();</code></pre>
<p>文字列への変換にはコレクションの章で使った<code>format!</code>マクロが便利です。<code>map</code>のクロージャの中で<code>format!("{}:{}円", p.0, p.1 * p.2)</code>のように使えば、<code>Vec&lt;String&gt;</code>が作れます。</p>
<p>パイプラインを書くときのコツをまとめます。</p>
<ol>
<li><strong>絞り込みは早めに</strong>：filterを先に置くほど、後段の処理量が減る</li>
<li><strong>1段1責務</strong>：1つのクロージャに詰め込みすぎず、filterとmapを分ける</li>
<li><strong>最後に型注釈</strong>：collectの結果は受け取る変数側に型を書く</li>
</ol>
<p>イテレータチェーンは見た目が宣言的なだけでなく、コンパイラの最適化により<strong>手書きのループと同等の速度</strong>で動きます。これがRustの掲げる「ゼロコスト抽象化」です。安心して活用してください。</p>`,
      task: `2つのTODOを完成させてください。(1)在庫がある商品（<code>p.2 &gt; 0</code>）だけを「名前:在庫金額円」（在庫金額は<code>価格 * 在庫数</code>）という<code>String</code>にした<code>Vec&lt;String&gt;</code>を作る。(2)同じく在庫がある商品の在庫金額の合計を<code>sum</code>で求める。`,
      code: `fn main() {
    // 商品データ: (名前, 価格, 在庫数)
    let products = vec![
        ("りんご", 120, 30),
        ("メロン", 800, 0),
        ("バナナ", 90, 45),
        ("ぶどう", 450, 12),
    ];

    // TODO(1): 在庫がある商品だけを「名前:在庫金額円」のStringにする
    // 在庫金額は 価格(p.1) * 在庫数(p.2)。format!マクロを使う
    let stock_values: Vec<String> = products
        .iter()
        // .filter(...)
        // .map(...)
        .map(|p| String::from(p.0)) // 仮実装。書き換える
        .collect();

    // TODO(2): 在庫がある商品の在庫金額を合計する
    let total: i32 = 0; // 仮実装。filter→map→sumのチェーンに書き換える

    println!("在庫一覧: {:?}", stock_values);
    println!("在庫金額合計: {}円", total);
}`,
      solution: `fn main() {
    // 商品データ: (名前, 価格, 在庫数)
    let products = vec![
        ("りんご", 120, 30),
        ("メロン", 800, 0),
        ("バナナ", 90, 45),
        ("ぶどう", 450, 12),
    ];

    // (1) filterで在庫あり商品に絞り、mapで表示用のStringに変換する
    let stock_values: Vec<String> = products
        .iter()
        .filter(|p| p.2 > 0)
        .map(|p| format!("{}:{}円", p.0, p.1 * p.2))
        .collect();

    // (2) 同じ絞り込みの後、在庫金額に変換してsumで集約する
    let total: i32 = products
        .iter()
        .filter(|p| p.2 > 0)
        .map(|p| p.1 * p.2)
        .sum();

    println!("在庫一覧: {:?}", stock_values);
    println!("在庫金額合計: {}円", total);
}`,
      hints: [
        `パイプラインの形は「iter() → filter(在庫の条件) → map(変換) → collect/sum」です。タプルの在庫数はp.2でアクセスします。`,
        `(1)のmapは |p| format!("{}:{}円", p.0, p.1 * p.2) です。りんごなら120*30=3600円になります。`,
        `(2)は同じfilterの後に .map(|p| p.1 * p.2).sum() をつなぎます。3600+4050+5400=13050円になれば正解です。`
      ],
      expectedOutput: "在庫金額合計: 13050円"
    }
  ]
});
