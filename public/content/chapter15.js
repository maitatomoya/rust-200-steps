// 第15章：スマートポインタ
registerChapter({
  number: 15,
  title: "スマートポインタ",
  description: "Box、Rc、RefCellといったスマートポインタを学び、ヒープ割り当て・所有権の共有・内部可変性という高度なメモリ管理のパターンを身につけます。",
  steps: [
    {
      id: 141,
      title: "Box<T>でヒープに置く",
      explanation: `<p>Rustの値は通常<strong>スタック</strong>に置かれますが、<code>Box&lt;T&gt;</code>を使うと値を<strong>ヒープ</strong>に置けます。<code>Box&lt;T&gt;</code>は「ヒープ上のデータを指すポインタ」を持つ最も単純な<strong>スマートポインタ</strong>（ポインタのように振る舞い、追加の能力を持つ型）です。</p>
<table>
<tr><th>領域</th><th>特徴</th><th>向いているデータ</th></tr>
<tr><td>スタック</td><td>高速だがサイズがコンパイル時に確定している必要がある</td><td>i32、固定長配列など</td></tr>
<tr><td>ヒープ</td><td>実行時にサイズを決められるが、確保にコストがかかる</td><td>大きなデータ、サイズ不定のデータ</td></tr>
</table>
<p><code>Box::new(値)</code>でヒープに値を確保します。使い方は普通の値とほとんど同じで、<code>println!</code>にもそのまま渡せます。</p>
<pre><code>fn main() {
    let b = Box::new(5); // 5がヒープに置かれる
    println!("b = {}", b);
} // ここでBoxがスコープを抜け、ヒープのメモリも自動解放</code></pre>
<p><code>Box&lt;T&gt;</code>が役立つのは主に次の場面です。</p>
<ul>
<li>コンパイル時にサイズが分からない型を使うとき（次のステップの再帰型）</li>
<li>大きなデータの所有権を、コピーせずに移動したいとき</li>
<li>トレイトオブジェクト（<code>Box&lt;dyn Trait&gt;</code>）として異なる型をまとめて扱うとき</li>
</ul>
<p>スコープを抜けるとBox本体（ポインタ）もヒープ上のデータも自動的に解放されます。手動のメモリ管理は不要です。</p>`,
      task: `まずそのまま実行して動作を確認しましょう。次に、Boxに入れる値を<code>5</code>から<code>42</code>に変更して再実行してください。`,
      code: `fn main() {
    // Box::newで値をヒープに確保する
    let b = Box::new(5);
    println!("b = {}", b);

    // TODO: 上の5を42に変更して再実行してみよう
}`,
      solution: `fn main() {
    // Box::newで値をヒープに確保する
    let b = Box::new(42);
    println!("b = {}", b);
}`,
      hints: [
        `Box::new(値)の引数を変えるだけで、ヒープに置かれる値が変わります。`,
        `Box::new(5)の5を42に書き換えれば完成です。使い方は普通の変数と同じです。`
      ],
      expectedOutput: "b = 42"
    },
    {
      id: 142,
      title: "Boxと再帰型（コンスリスト）",
      explanation: `<p><code>Box&lt;T&gt;</code>が必須になる代表例が<strong>再帰型</strong>（自分自身を含む型）です。関数型言語でおなじみの<strong>コンスリスト</strong>（値と「残りのリスト」のペアを連ねたリスト構造）をenumで定義してみます。</p>
<pre><code>enum List {
    Cons(i32, List), // 値と残りのリスト
    Nil,             // リストの終端
}</code></pre>
<p>しかしこれはコンパイルエラーになります。<code>List</code>の中に<code>List</code>が直接入っているため、コンパイラがサイズを計算しようとすると「Listの中にListがあり、その中にまたListが…」と<strong>無限のサイズ</strong>になってしまうからです。エラーメッセージにも「recursive type has infinite size（再帰型のサイズが無限）」と表示されます。</p>
<p>解決策が<code>Box</code>です。<code>Box&lt;List&gt;</code>は「ヒープ上のListを指すポインタ」なので、<strong>サイズはポインタ1個分で固定</strong>になります。</p>
<pre><code>enum List {
    Cons(i32, Box&lt;List&gt;), // ポインタなのでサイズが確定する
    Nil,
}</code></pre>
<table>
<tr><th>定義</th><th>Consのサイズ</th><th>結果</th></tr>
<tr><td>Cons(i32, List)</td><td>i32＋List（無限に膨らむ）</td><td>コンパイルエラー</td></tr>
<tr><td>Cons(i32, Box&lt;List&gt;)</td><td>i32＋ポインタ1個分</td><td>OK</td></tr>
</table>
<p>コンパイラのエラーメッセージ自体が「insert some indirection (e.g., a Box)」とBoxの利用を提案してくれます。エラーを読む習慣をつけましょう。</p>`,
      task: `このコードは再帰型のサイズが無限になるためコンパイルエラーになります。<code>Box</code>を使ってエラーを修正し、リストの合計<code>6</code>を出力してください。enumの定義と、mainでのリスト構築の両方を直す必要があります。`,
      code: `// このコードはコンパイルエラーになる。Boxで修正しよう
enum List {
    Cons(i32, List), // エラー：再帰型のサイズが無限になる
    Nil,
}

use crate::List::{Cons, Nil};

fn sum(list: &List) -> i32 {
    match list {
        Cons(v, rest) => v + sum(rest),
        Nil => 0,
    }
}

fn main() {
    // 1 -> 2 -> 3 のリスト
    let list = Cons(1, Cons(2, Cons(3, Nil)));
    println!("合計: {}", sum(&list));
}`,
      solution: `enum List {
    Cons(i32, Box<List>), // Boxで包めばサイズが確定する
    Nil,
}

use crate::List::{Cons, Nil};

fn sum(list: &List) -> i32 {
    match list {
        Cons(v, rest) => v + sum(rest),
        Nil => 0,
    }
}

fn main() {
    // 1 -> 2 -> 3 のリスト
    let list = Cons(1, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))));
    println!("合計: {}", sum(&list));
}`,
      hints: [
        `enumの定義でListを直接持つのではなく、ヒープ上のListを指すポインタを持たせれば、サイズがポインタ1個分に確定します。`,
        `定義をCons(i32, Box<List>)に変えると、リストを作る側もCons(1, Box::new(...))のようにBox::newで包む必要があります。`,
        `mainのリストはCons(1, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))))という形になります。`
      ],
      expectedOutput: "合計: 6"
    },
    {
      id: 143,
      title: "DerefとDropの働き",
      explanation: `<p>スマートポインタを支えるのが<code>Deref</code>と<code>Drop</code>という2つのトレイトです。</p>
<h4>Deref：ポインタのように扱える</h4>
<p><code>Deref</code>トレイトを実装した型は、<code>*</code>演算子（参照外し）で中身にアクセスできます。<code>Box&lt;T&gt;</code>もDerefを実装しているので、<code>*b</code>で中の値を取り出せます。</p>
<pre><code>let b = Box::new(10);
println!("{}", *b); // 10。参照と同じ感覚で中身を使える</code></pre>
<p>さらに<strong>Deref変換</strong>（Deref coercion）という仕組みにより、<code>&amp;Box&lt;String&gt;</code>を<code>&amp;str</code>を受け取る関数へそのまま渡せるなど、変換が自動で行われます。</p>
<h4>Drop：スコープを抜けるときの後片付け</h4>
<p><code>Drop</code>トレイトの<code>drop(&amp;mut self)</code>メソッドは、値がスコープを抜けるときに<strong>自動で呼ばれます</strong>。ファイルのクローズやメモリ解放などの後片付けをここに書けるため、「解放し忘れ」が起きません。</p>
<pre><code>impl Drop for Resource {
    fn drop(&amp;mut self) {
        println!("{}を解放します", self.name);
    }
}</code></pre>
<p>重要なのは<strong>破棄の順序</strong>です。同じスコープ内の変数は<strong>宣言と逆順</strong>（後に作ったものが先）に破棄されます。なお<code>drop</code>メソッドを直接呼ぶことは禁止されており、早期に破棄したい場合は標準ライブラリの関数<code>drop(値)</code>を使います。</p>`,
      task: `<code>Resource</code>構造体に<code>Drop</code>トレイトを実装し、破棄時に「〇〇を解放します」と出力させてください。実行して、AとBがどちらの順で破棄されるかを観察しましょう。`,
      code: `struct Resource {
    name: String,
}

// TODO: ResourceにDropトレイトを実装しよう
// dropメソッドの中で「{}を解放します」とself.nameを出力する

fn main() {
    let b = Box::new(10);
    println!("*b = {}", *b); // Derefにより*で中身にアクセスできる

    let _a = Resource { name: String::from("A") };
    let _b = Resource { name: String::from("B") };
    println!("main終了直前");
    // ここでスコープを抜ける。破棄の順序に注目
}`,
      solution: `struct Resource {
    name: String,
}

// Dropトレイトを実装すると、破棄時にdropが自動で呼ばれる
impl Drop for Resource {
    fn drop(&mut self) {
        println!("{}を解放します", self.name);
    }
}

fn main() {
    let b = Box::new(10);
    println!("*b = {}", *b); // Derefにより*で中身にアクセスできる

    let _a = Resource { name: String::from("A") };
    let _b = Resource { name: String::from("B") };
    println!("main終了直前");
    // 宣言と逆順に破棄されるので、B -> Aの順で出力される
}`,
      hints: [
        `トレイトの実装はimpl Drop for Resource { ... }の形です。中に定義するメソッドはfn drop(&mut self)です。`,
        `dropの中身はprintln!("{}を解放します", self.name);と書きます。`,
        `実行すると「main終了直前」の後に、後から作ったBが先に解放されることが確認できます。`
      ],
      expectedOutput: "Bを解放します"
    },
    {
      id: 144,
      title: "Rc<T>で所有権を共有",
      explanation: `<p>所有権のルールでは「値の所有者は常に1つ」でした。しかしグラフ構造や共有設定データのように、<strong>複数の場所から同じデータを所有したい</strong>場面があります。そこで使うのが<code>Rc&lt;T&gt;</code>（Reference Counted＝参照カウント）です。</p>
<p><code>Rc&lt;T&gt;</code>は「今このデータを何人が所有しているか」をカウントで管理し、カウントが0になった時点でデータを解放します。</p>
<pre><code>use std::rc::Rc;

let a = Rc::new(String::from("データ"));
let b = Rc::clone(&amp;a); // カウントが2になる。データ本体はコピーされない</code></pre>
<table>
<tr><th>型</th><th>所有者の数</th><th>用途</th></tr>
<tr><td>Box&lt;T&gt;</td><td>1つだけ</td><td>単純なヒープ割り当て</td></tr>
<tr><td>Rc&lt;T&gt;</td><td>複数OK</td><td>読み取り専用データの共有</td></tr>
</table>
<p>ポイントは3つあります。</p>
<ul>
<li><code>Rc::clone(&amp;a)</code>は<strong>参照カウントを増やすだけ</strong>で、データ本体のディープコピーはしません（<code>a.clone()</code>とも書けますが、軽い操作だと明示するために<code>Rc::clone</code>と書くのが慣習です）</li>
<li><code>Rc&lt;T&gt;</code>で共有できるのは<strong>不変の参照</strong>だけです。書き換えたい場合は後のステップで学ぶ<code>RefCell</code>と組み合わせます</li>
<li><code>Rc&lt;T&gt;</code>は<strong>シングルスレッド専用</strong>です（マルチスレッド用には別の型が用意されています）</li>
</ul>`,
      task: `このコードは<code>a</code>の所有権がムーブ済みのためコンパイルエラーになります。<code>Rc</code>を使って3つの変数が同じデータを共有できるように修正してください。`,
      code: `// このコードはコンパイルエラーになる。Rcで修正しよう
fn main() {
    let a = Box::new(String::from("共有データ"));
    let b = a; // 所有権がaからbへムーブする
    let c = a; // エラー：aはすでにムーブ済み

    println!("a = {}", a);
    println!("b = {}", b);
    println!("c = {}", c);
}`,
      solution: `use std::rc::Rc;

fn main() {
    let a = Rc::new(String::from("共有データ"));
    let b = Rc::clone(&a); // 参照カウントが増えるだけ。ムーブしない
    let c = Rc::clone(&a);

    println!("a = {}", a);
    println!("b = {}", b);
    println!("c = {}", c);
}`,
      hints: [
        `Boxは所有者が1つだけですが、Rcなら複数の所有者を持てます。ファイルの先頭でuse std::rc::Rc;が必要です。`,
        `Rc::new(...)で作り、共有したい場所ではRc::clone(&a)を使います。let b = Rc::clone(&a);のように書きます。`
      ],
      expectedOutput: "b = 共有データ"
    },
    {
      id: 145,
      title: "Rc::strong_countで参照数を観察",
      explanation: `<p><code>Rc&lt;T&gt;</code>が内部で管理している参照カウントは、<code>Rc::strong_count(&amp;rc)</code>で確認できます。カウントがいつ増え、いつ減るのかを実際に観察してみましょう。</p>
<pre><code>use std::rc::Rc;

let a = Rc::new(5);
println!("{}", Rc::strong_count(&amp;a)); // 1

let b = Rc::clone(&amp;a);
println!("{}", Rc::strong_count(&amp;a)); // 2</code></pre>
<p>カウントの増減ルールは次のとおりです。</p>
<table>
<tr><th>操作</th><th>カウントの変化</th></tr>
<tr><td>Rc::new(値)</td><td>1で開始</td></tr>
<tr><td>Rc::clone(&amp;rc)</td><td>＋1</td></tr>
<tr><td>Rcの変数がスコープを抜ける</td><td>−1（Dropトレイトによる自動処理）</td></tr>
<tr><td>カウントが0になる</td><td>データ本体が解放される</td></tr>
</table>
<p>注目すべきは、前ステップで学んだ<code>Drop</code>がここでも活躍している点です。<code>Rc</code>はDropの実装の中でカウントを減らし、0になったらヒープのデータを解放します。つまり<code>Rc</code>は「DerefとDropを組み合わせて参照カウント方式のメモリ管理を実現したスマートポインタ」なのです。ガベージコレクタを持つ言語と違い、解放のタイミングがコードから正確に読み取れるのがRustらしいところです。</p>
<p>内側のブロック<code>{ }</code>で<code>Rc::clone</code>した変数は、ブロックを抜けた瞬間にカウントを1つ減らします。</p>`,
      task: `<code>TODO</code>の2箇所に<code>Rc::strong_count(&amp;a)</code>を使ったカウント表示を追加し、カウントが1→2→3→2と変化することを確認してください。`,
      code: `use std::rc::Rc;

fn main() {
    let a = Rc::new(5);
    println!("aを作成: count = {}", Rc::strong_count(&a));

    let _b = Rc::clone(&a);
    println!("bを作成: count = {}", Rc::strong_count(&a));

    {
        let _c = Rc::clone(&a);
        // TODO: ここで「cを作成: count = {}」とカウントを出力する
    }

    // TODO: ここで「cがスコープを抜けた: count = {}」とカウントを出力する
}`,
      solution: `use std::rc::Rc;

fn main() {
    let a = Rc::new(5);
    println!("aを作成: count = {}", Rc::strong_count(&a));

    let _b = Rc::clone(&a);
    println!("bを作成: count = {}", Rc::strong_count(&a));

    {
        let _c = Rc::clone(&a);
        println!("cを作成: count = {}", Rc::strong_count(&a));
    }

    // _cが破棄されたのでカウントは2に戻る
    println!("cがスコープを抜けた: count = {}", Rc::strong_count(&a));
}`,
      hints: [
        `カウントの取得はRc::strong_count(&a)です。すでにあるprintln!と同じ形で書けます。`,
        `内側のブロックの中では3、ブロックを抜けた後では2が表示されれば正解です。`
      ],
      expectedOutput: "cを作成: count = 3"
    },
    {
      id: 146,
      title: "RefCellと内部可変性",
      explanation: `<p>借用のルールでは「不変の値は書き換えられない」のが原則でした。しかし「見た目は不変だが、内部の値だけは書き換えたい」場面があります。これを実現するのが<code>RefCell&lt;T&gt;</code>と、そのパターン名である<strong>内部可変性</strong>（interior mutability）です。</p>
<pre><code>use std::cell::RefCell;

let data = RefCell::new(10); // dataはmutではない
*data.borrow_mut() += 5;     // それでも中身は書き換えられる
println!("{}", data.borrow()); // 15</code></pre>
<p>通常の参照との違いは、借用ルールを<strong>いつチェックするか</strong>です。</p>
<table>
<tr><th></th><th>通常の参照（&amp;、&amp;mut）</th><th>RefCell&lt;T&gt;</th></tr>
<tr><td>チェック時期</td><td>コンパイル時</td><td>実行時</td></tr>
<tr><td>違反した場合</td><td>コンパイルエラー</td><td>実行時パニック</td></tr>
<tr><td>借用の取得</td><td>&amp;x、&amp;mut x</td><td>borrow()、borrow_mut()</td></tr>
</table>
<ul>
<li><code>borrow()</code>：不変の借用（<code>Ref&lt;T&gt;</code>型）を返す。複数同時に取得できる</li>
<li><code>borrow_mut()</code>：可変の借用（<code>RefMut&lt;T&gt;</code>型）を返す。同時に1つだけ</li>
</ul>
<p>「同時に可変借用は1つまで」というルール自体は通常の借用と同じで、チェックがコンパイル時から実行時に移っただけです。<code>RefCell&lt;T&gt;</code>も<code>Rc&lt;T&gt;</code>と同様にシングルスレッド専用です。コンパイラには証明できないが人間には安全だと分かるケースの「最後の手段」として使い、乱用は避けましょう。</p>`,
      task: `<code>RefCell</code>の中の値を<code>borrow_mut()</code>で取り出して5を加算し、「data = 15」と出力されるように<code>TODO</code>部分を完成させてください。`,
      code: `use std::cell::RefCell;

fn main() {
    // dataそのものはmutを付けずに宣言する
    let data = RefCell::new(10);

    {
        // TODO: borrow_mut()で可変の借用を取り出し、5を加算する
    }

    // borrow()で不変の借用を取り出して表示
    println!("data = {}", data.borrow());
}`,
      solution: `use std::cell::RefCell;

fn main() {
    // dataそのものはmutを付けずに宣言する
    let data = RefCell::new(10);

    {
        // borrow_mut()で可変の借用を取得し、*で中身を書き換える
        let mut m = data.borrow_mut();
        *m += 5;
    }

    // borrow()で不変の借用を取り出して表示
    println!("data = {}", data.borrow());
}`,
      hints: [
        `可変の借用はlet mut m = data.borrow_mut();で取得できます。`,
        `取得した借用はスマートポインタなので、中身に足すには*m += 5;のように*を付けます。`,
        `1行で*data.borrow_mut() += 5;と書くこともできます。`
      ],
      expectedOutput: "data = 15"
    },
    {
      id: 147,
      title: "borrow/borrow_mutの実行時パニックを体験",
      explanation: `<p><code>RefCell&lt;T&gt;</code>の借用ルール違反は、コンパイルエラーではなく<strong>実行時パニック</strong>になります。これを一度実際に体験しておくと、本番コードでのバグを防ぎやすくなります。</p>
<pre><code>let cell = RefCell::new(String::from("hello"));
let r = cell.borrow();          // 不変借用が生きている間に…
let mut w = cell.borrow_mut();  // 可変借用を取るとパニック！
// thread 'main' panicked at 'already borrowed: BorrowMutError'</code></pre>
<p>パニックメッセージの<code>already borrowed: BorrowMutError</code>は「すでに借用中なのに可変借用しようとした」という意味です。逆に可変借用中に<code>borrow()</code>すると<code>already mutably borrowed: BorrowError</code>になります。</p>
<h4>対策：借用の生存期間を短くする</h4>
<p>借用を保持する変数（<code>Ref</code>／<code>RefMut</code>）は、スコープを抜けるまで生き続けます。対策の基本は次の2つです。</p>
<ul>
<li>ブロック<code>{ }</code>で借用のスコープを明示的に区切り、使い終わったらすぐ手放す</li>
<li>そもそも借用を変数に保持せず、<code>cell.borrow().len()</code>のように<strong>1つの式の中で使い切る</strong>（式が終わると借用も即座に解放される）</li>
</ul>
<p>コンパイル時チェックの安心感を捨てているぶん、<code>RefCell</code>を使うコードでは「この借用はいつまで生きているか」を常に意識する必要があります。</p>`,
      task: `まずそのまま実行して<code>already borrowed</code>パニックを体験してください。その後、不変借用<code>r</code>をブロック<code>{ }</code>で囲んでスコープを区切り、パニックせず「最終結果: hello world」と出力されるように修正しましょう。`,
      code: `use std::cell::RefCell;

fn main() {
    let cell = RefCell::new(String::from("hello"));

    // まず実行してパニックを観察しよう
    let r = cell.borrow(); // 不変借用がここから生き続ける
    println!("読み取り: {}", r);

    let mut w = cell.borrow_mut(); // 実行時パニック！
    w.push_str(" world");
    drop(w);

    println!("最終結果: {}", cell.borrow());
}`,
      solution: `use std::cell::RefCell;

fn main() {
    let cell = RefCell::new(String::from("hello"));

    // ブロックで区切れば、不変借用はここで終わる
    {
        let r = cell.borrow();
        println!("読み取り: {}", r);
    }

    // 不変借用はもう存在しないので、可変借用を取得できる
    {
        let mut w = cell.borrow_mut();
        w.push_str(" world");
    }

    println!("最終結果: {}", cell.borrow());
}`,
      hints: [
        `パニックの原因は、不変借用rが生きたままborrow_mut()を呼んでいることです。rの寿命を短くしましょう。`,
        `let r = cell.borrow();とprintln!の2行を{ }で囲むと、ブロックの終わりでrが解放されます。`,
        `可変借用wも同様にブロックで囲めば、最後のprintln!のborrow()と衝突しません。`
      ],
      expectedOutput: "最終結果: hello world"
    },
    {
      id: 148,
      title: "Rc＋RefCellの組み合わせ",
      explanation: `<p><code>Rc&lt;T&gt;</code>は複数の所有者を許しますが中身は不変、<code>RefCell&lt;T&gt;</code>は中身を書き換えられますが所有者は1つです。この2つを組み合わせた<code>Rc&lt;RefCell&lt;T&gt;&gt;</code>は、<strong>「複数の所有者で共有でき、かつ全員が書き換えられるデータ」</strong>を実現する定番パターンです。</p>
<table>
<tr><th>型</th><th>複数の所有者</th><th>中身の変更</th></tr>
<tr><td>Rc&lt;T&gt;</td><td>できる</td><td>できない</td></tr>
<tr><td>RefCell&lt;T&gt;</td><td>できない</td><td>できる</td></tr>
<tr><td>Rc&lt;RefCell&lt;T&gt;&gt;</td><td>できる</td><td>できる</td></tr>
</table>
<pre><code>use std::rc::Rc;
use std::cell::RefCell;

let shared = Rc::new(RefCell::new(vec![1, 2, 3]));
let a = Rc::clone(&amp;shared); // 所有者を増やす

a.borrow_mut().push(4);      // どの所有者からでも書き換えられる
println!("{:?}", shared.borrow()); // [1, 2, 3, 4]</code></pre>
<p>読み方のコツは<strong>外側から順に剥がす</strong>ことです。<code>Rc&lt;RefCell&lt;Vec&lt;i32&gt;&gt;&gt;</code>なら「Rcで共有された、RefCellで書き換え可能な、i32のVec」となります。</p>
<ul>
<li><code>Rc::clone</code>で所有者を増やす（共有）</li>
<li><code>borrow_mut()</code>で中身を書き換える（変更）</li>
<li>どの所有者から変更しても、同じデータを見ているので全員に反映される</li>
</ul>
<p>便利な反面、借用チェックは実行時になるため、前ステップで学んだパニックの危険は残ります。「本当に共有と変更の両方が必要か」を考えてから使いましょう。</p>`,
      task: `<code>shared</code>を<code>Rc::clone</code>して<code>a</code>と<code>b</code>を作り、<code>a</code>から4を、<code>b</code>から5を<code>push</code>して、最終的に「shared = [1, 2, 3, 4, 5]」と出力してください。`,
      code: `use std::rc::Rc;
use std::cell::RefCell;

fn main() {
    // Rc<RefCell<Vec<i32>>>：共有できて書き換えられるVec
    let shared = Rc::new(RefCell::new(vec![1, 2, 3]));

    // TODO: Rc::cloneでaとbを作る

    // TODO: aから4をpushし、bから5をpushする

    println!("shared = {:?}", shared.borrow());
}`,
      solution: `use std::rc::Rc;
use std::cell::RefCell;

fn main() {
    // Rc<RefCell<Vec<i32>>>：共有できて書き換えられるVec
    let shared = Rc::new(RefCell::new(vec![1, 2, 3]));

    // Rc::cloneでaとbを作る（3つの変数が同じVecを共有）
    let a = Rc::clone(&shared);
    let b = Rc::clone(&shared);

    // どの所有者から変更しても同じVecに反映される
    a.borrow_mut().push(4);
    b.borrow_mut().push(5);

    println!("shared = {:?}", shared.borrow());
}`,
      hints: [
        `所有者を増やすのはlet a = Rc::clone(&shared);です。bも同様に作ります。`,
        `中身のVecに追加するにはa.borrow_mut().push(4);のように、borrow_mut()を経由してpushを呼びます。`,
        `borrow_mut()の借用は式の終わりで解放されるので、続けてb.borrow_mut().push(5);と書いてもパニックしません。`
      ],
      expectedOutput: "shared = [1, 2, 3, 4, 5]"
    },
    {
      id: 149,
      title: "循環参照とWeak（概要）",
      explanation: `<p><code>Rc&lt;T&gt;</code>には落とし穴があります。AがBを<code>Rc</code>で持ち、BもAを<code>Rc</code>で持つと<strong>循環参照</strong>になり、お互いのカウントが永遠に0にならず<strong>メモリリーク</strong>（解放されないメモリが残り続けること）が発生します。Rustはコンパイル時にこれを検出できません。</p>
<p>解決策が<code>Weak&lt;T&gt;</code>（弱い参照）です。<code>Rc::downgrade(&amp;rc)</code>で作成でき、次の特徴を持ちます。</p>
<table>
<tr><th></th><th>Rc&lt;T&gt;（強い参照）</th><th>Weak&lt;T&gt;（弱い参照）</th></tr>
<tr><td>カウント</td><td>strong_count</td><td>weak_count</td></tr>
<tr><td>データの生存</td><td>生存を保証する</td><td>保証しない</td></tr>
<tr><td>解放の条件</td><td>strong_countが0で解放</td><td>weak_countは解放に影響しない</td></tr>
<tr><td>中身へのアクセス</td><td>直接使える</td><td>upgrade()で確認が必要</td></tr>
</table>
<p><code>Weak</code>はデータの生存を保証しないため、使うときは<code>upgrade()</code>を呼びます。これは<code>Option&lt;Rc&lt;T&gt;&gt;</code>を返し、データが生きていれば<code>Some</code>、すでに解放済みなら<code>None</code>になります。</p>
<pre><code>let strong = Rc::new(5);
let weak = Rc::downgrade(&amp;strong); // 弱い参照を作る

weak.upgrade(); // Some(...)：まだ生きている
drop(strong);   // 強い参照が0になり、データは解放される
weak.upgrade(); // None：もう存在しない</code></pre>
<p>実務では「親は子を<code>Rc</code>で持ち、子は親を<code>Weak</code>で持つ」というツリー構造の設計が典型例です。親子がお互いを<code>Rc</code>で持つ循環を避けられます。</p>`,
      task: `<code>Rc::downgrade</code>で<code>weak</code>を作り、<code>drop(strong)</code>の前後で<code>upgrade()</code>の結果がどう変わるかを観察してください。<code>TODO</code>の1行を完成させれば動きます。`,
      code: `use std::rc::{Rc, Weak};

fn check(weak: &Weak<String>) {
    // upgrade()はOption<Rc<String>>を返す
    match weak.upgrade() {
        Some(v) => println!("まだ生きている: {}", v),
        None => println!("すでに破棄された"),
    }
}

fn main() {
    let strong = Rc::new(String::from("データ"));

    // TODO: Rc::downgradeでstrongから弱い参照weakを作る

    println!("strong_count = {}", Rc::strong_count(&strong));
    println!("weak_count = {}", Rc::weak_count(&strong));

    check(&weak); // まだ生きている

    drop(strong); // 強い参照が0になる

    check(&weak); // すでに破棄された
}`,
      solution: `use std::rc::{Rc, Weak};

fn check(weak: &Weak<String>) {
    // upgrade()はOption<Rc<String>>を返す
    match weak.upgrade() {
        Some(v) => println!("まだ生きている: {}", v),
        None => println!("すでに破棄された"),
    }
}

fn main() {
    let strong = Rc::new(String::from("データ"));

    // 弱い参照を作る。strong_countは増えない
    let weak: Weak<String> = Rc::downgrade(&strong);

    println!("strong_count = {}", Rc::strong_count(&strong));
    println!("weak_count = {}", Rc::weak_count(&strong));

    check(&weak); // まだ生きている

    drop(strong); // 強い参照が0になる

    check(&weak); // すでに破棄された
}`,
      hints: [
        `弱い参照はRc::downgrade(&strong)で作ります。戻り値の型はWeak<String>です。`,
        `let weak: Weak<String> = Rc::downgrade(&strong);と書けば完成です。`,
        `dropの後はupgrade()がNoneを返すため、「すでに破棄された」と表示されます。`
      ],
      expectedOutput: "すでに破棄された"
    },
    {
      id: 150,
      title: "総合演習（共有リストの操作）",
      explanation: `<p>この章の総仕上げとして、<strong>家族で共有する買い物リスト</strong>を作ります。台所のメモ帳とスマホアプリという2つの「窓口」から、同じ1つのリストに品目を追加できるようにします。使う道具はこの章で学んだものだけです。</p>
<table>
<tr><th>要件</th><th>使う道具</th></tr>
<tr><td>複数の窓口が同じリストを所有する</td><td>Rc（参照カウントによる共有）</td></tr>
<tr><td>どの窓口からも品目を追加できる</td><td>RefCell（内部可変性）</td></tr>
<tr><td>所有者の数を確認する</td><td>Rc::strong_count</td></tr>
</table>
<p>型は<code>Rc&lt;RefCell&lt;Vec&lt;String&gt;&gt;&gt;</code>、つまり「Rcで共有された、書き換え可能な、Stringのリスト」です。関数に渡すときは<code>&amp;Rc&lt;RefCell&lt;Vec&lt;String&gt;&gt;&gt;</code>と参照で受け取ると、呼び出しごとにカウントを増やさずに済みます。</p>
<pre><code>fn add_item(list: &amp;Rc&lt;RefCell&lt;Vec&lt;String&gt;&gt;&gt;, item: &amp;str) {
    list.borrow_mut().push(String::from(item));
}</code></pre>
<p>リストの中身を読むときの注意点をひとつ。<code>for</code>ループで<code>list.borrow().iter()</code>を回している間は不変借用が生き続けるため、ループ内で<code>borrow_mut()</code>を呼ぶとパニックします。<strong>読み取り中は書き込まない</strong>という原則を守りましょう。</p>
<p>このパターンはGUIアプリの共有状態、ゲームのエンティティ管理、設定オブジェクトの共有など、実務のシングルスレッドコードで頻出します。ここで手を動かして完全に理解しておきましょう。</p>`,
      task: `<code>add_item</code>関数を完成させ、mainでは<code>kitchen</code>と<code>phone</code>の2つの共有ハンドルを<code>Rc::clone</code>で作ってください。3つの品目を追加し、「品目数: 3」と全品目が出力されれば完成です。`,
      code: `use std::rc::Rc;
use std::cell::RefCell;

// TODO: 関数を完成させる。listにitemをString化してpushする
fn add_item(list: &Rc<RefCell<Vec<String>>>, item: &str) {
}

fn main() {
    let list: Rc<RefCell<Vec<String>>> = Rc::new(RefCell::new(Vec::new()));

    // TODO: Rc::cloneでkitchenとphoneを作る

    // それぞれの窓口から品目を追加する
    add_item(&kitchen, "りんご");
    add_item(&phone, "パン");
    add_item(&list, "牛乳");

    println!("所有者の数: {}", Rc::strong_count(&list));
    println!("品目数: {}", list.borrow().len());
    for item in list.borrow().iter() {
        println!("- {}", item);
    }
}`,
      solution: `use std::rc::Rc;
use std::cell::RefCell;

// 共有リストに品目を1つ追加する
fn add_item(list: &Rc<RefCell<Vec<String>>>, item: &str) {
    list.borrow_mut().push(String::from(item));
}

fn main() {
    let list: Rc<RefCell<Vec<String>>> = Rc::new(RefCell::new(Vec::new()));

    // 台所のメモ帳とスマホアプリ、2つの窓口で同じリストを共有する
    let kitchen = Rc::clone(&list);
    let phone = Rc::clone(&list);

    // それぞれの窓口から品目を追加する
    add_item(&kitchen, "りんご");
    add_item(&phone, "パン");
    add_item(&list, "牛乳");

    println!("所有者の数: {}", Rc::strong_count(&list));
    println!("品目数: {}", list.borrow().len());
    for item in list.borrow().iter() {
        println!("- {}", item);
    }
}`,
      hints: [
        `add_itemの中身は1行です。borrow_mut()で可変借用を取り、pushでString::from(item)を追加します。`,
        `共有ハンドルはlet kitchen = Rc::clone(&list);とlet phone = Rc::clone(&list);で作ります。`,
        `完成すると所有者の数は3（list、kitchen、phone）、品目数は3になります。`
      ],
      expectedOutput: "品目数: 3"
    }
  ]
});
