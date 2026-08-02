// 第18章：並行処理
registerChapter({
  number: 18,
  title: "並行処理",
  description: "スレッドの生成とjoin、moveクロージャ、mpscチャネル、Mutex、Arcによるデータ共有まで、Rustの安全な並行処理を学びます。",
  steps: [
    {
      id: 171,
      title: "thread::spawnとjoin",
      explanation: `<p>並行処理（複数の処理を同時に進めること）の基本単位が<strong>スレッド</strong>です。Rustでは<code>std::thread::spawn</code>に「スレッドで実行したい処理」をクロージャとして渡すと、新しいスレッドが起動します。</p>
<pre><code>use std::thread;

fn main() {
    let handle = thread::spawn(|| {
        println!("別スレッドで実行");
    });
    handle.join().unwrap();
    println!("メインスレッドの続き");
}</code></pre>
<p><code>spawn</code>の戻り値は<code>JoinHandle</code>という型で、これが起動したスレッドの「握り手」になります。<code>handle.join()</code>を呼ぶと、<strong>そのスレッドが終わるまでメインスレッドが待ちます</strong>。<code>join</code>の戻り値は<code>Result</code>なので、スレッドがパニックした場合に備えて<code>unwrap</code>や<code>match</code>で処理します。</p>
<table>
<tr><th>操作</th><th>意味</th></tr>
<tr><td><code>thread::spawn(クロージャ)</code></td><td>新しいスレッドを起動して即座に戻る</td></tr>
<tr><td><code>handle.join()</code></td><td>スレッドの終了を待つ（結果は<code>Result</code>）</td></tr>
</table>
<p>重要なのは、<code>spawn</code>は起動を依頼するだけで<strong>すぐに次の行へ進む</strong>という点です。メインスレッドと新しいスレッドは並行して動くため、どちらの<code>println!</code>が先に実行されるかはOS任せになります。ただし<code>join</code>の後のコードは「スレッドが確実に終わった後」に実行されるので、<code>join</code>より後の出力順は保証されます。この「joinで合流してから次へ進む」構造が、並行処理を予測可能に保つ基本パターンです。</p>`,
      task: `まずこのコードをそのまま実行して、スレッドの出力の後に「メイン: 完了」が表示されることを確認してください。次にループの範囲を<code>1..=3</code>から<code>1..=5</code>に変更して再実行し、5回分の出力を確認しましょう。`,
      code: `use std::thread;

fn main() {
    // 新しいスレッドを起動する
    let handle = thread::spawn(|| {
        for i in 1..=3 {
            println!("スレッド: {}", i);
        }
    });
    // スレッドの終了を待つ
    handle.join().unwrap();
    // joinの後なので、必ずスレッドの出力より後に表示される
    println!("メイン: 完了");
}`,
      solution: `use std::thread;

fn main() {
    // 新しいスレッドを起動する
    let handle = thread::spawn(|| {
        for i in 1..=5 {
            println!("スレッド: {}", i);
        }
    });
    // スレッドの終了を待つ
    handle.join().unwrap();
    // joinの後なので、必ずスレッドの出力より後に表示される
    println!("メイン: 完了");
}`,
      hints: [
        `spawnに渡したクロージャの中身が別スレッドで実行されます。まずはそのまま実行して動きを観察しましょう。`,
        `変更するのはforループの範囲だけです。1..=5にすると5回出力されます。`
      ],
      expectedOutput: "スレッド: 5"
    },
    {
      id: 172,
      title: "joinを忘れるとどうなるか・実行順序の非決定性",
      explanation: `<p>前ステップの<code>join</code>を忘れるとどうなるでしょうか。Rustのプログラムは<strong>メインスレッドが終了すると、他のスレッドが途中でも全体が終了します</strong>。つまり<code>join</code>を呼ばないと、起動したスレッドの処理が最後まで実行される保証がなくなります。</p>
<pre><code>let handle = thread::spawn(|| {
    for i in 1..=10 {
        println!("子: {}", i);
    }
});
// joinしないままmainが終わると、子スレッドは途中で打ち切られる</code></pre>
<p>もう1つの重要な性質が<strong>実行順序の非決定性</strong>です。メインスレッドと子スレッドが並行して出力する部分は、実行するたびに順番が入れ替わる可能性があります。どのスレッドをいつ動かすかはOSのスケジューラ（実行順を決める仕組み）が決めるためで、これはバグではなく並行処理の本質的な性質です。</p>
<table>
<tr><th>保証されること</th><th>保証されないこと</th></tr>
<tr><td>1つのスレッド内の実行順序</td><td>スレッド間の出力の入り混じり方</td></tr>
<tr><td><code>join</code>の後のコードはスレッド終了後に実行</td><td><code>join</code>前のメインと子の前後関係</td></tr>
</table>
<p>この課題では<code>thread::sleep</code>（指定時間だけスレッドを休ませる関数）で意図的に処理を遅らせ、出力が入り混じる様子を観察します。時間の長さは<code>Duration::from_millis(10)</code>のように指定します。何度か実行して、並行部分の順序が変わり得ることと、<code>join</code>後の「すべて完了」が必ず最後に出ることを確認してください。</p>`,
      task: `このコードは<code>join</code>を呼んでいないため、子スレッドの出力が途中で切れることがあります。<code>handle.join().unwrap();</code>を追加してから、最後に「すべて完了」と出力する行を加えてください。何度か実行して出力の入り混じり方も観察しましょう。`,
      code: `use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..=3 {
            println!("子スレッド: {}", i);
            thread::sleep(Duration::from_millis(10));
        }
    });
    for i in 1..=2 {
        println!("メイン: {}", i);
        thread::sleep(Duration::from_millis(10));
    }
    // TODO: joinで子スレッドの終了を待つ

    // TODO: 「すべて完了」と出力する
}`,
      solution: `use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..=3 {
            println!("子スレッド: {}", i);
            thread::sleep(Duration::from_millis(10));
        }
    });
    for i in 1..=2 {
        println!("メイン: {}", i);
        thread::sleep(Duration::from_millis(10));
    }
    // 子スレッドの終了を待つ
    handle.join().unwrap();
    // joinの後なので必ず最後に出力される
    println!("すべて完了");
}`,
      hints: [
        `joinを呼ばないと、mainが先に終わった時点で子スレッドは打ち切られます。`,
        `handle.join().unwrap(); をメインのループの後に追加します。`,
        `「メイン: 」と「子スレッド: 」の行の順序は実行のたびに変わり得ますが、joinの後の行は必ず最後になります。`
      ],
      expectedOutput: "すべて完了"
    },
    {
      id: 173,
      title: "moveクロージャとスレッド（エラー修正）",
      explanation: `<p>スレッドのクロージャからメインスレッドの変数を使おうとすると、独特のコンパイルエラーに出会います。</p>
<pre><code>let v = vec![1, 2, 3];
let handle = thread::spawn(|| {
    println!("{:?}", v); // エラー！
});</code></pre>
<p>エラーメッセージは「closure may outlive the current function, but it borrows v（クロージャが現在の関数より長生きするかもしれないのに、vを借用している）」です。なぜこれが問題なのでしょうか。</p>
<p>クロージャは通常、外の変数を<strong>借用</strong>（参照）でキャプチャします。しかしスレッドは<code>main</code>の変数<code>v</code>がいつ解放されるか分からないタイミングで動くため、「スレッドが動いている間に<code>v</code>が先に破棄されるかもしれない」という危険をコンパイラが検出するのです。これは他の言語なら実行時にクラッシュや不可解なバグとして現れる問題を、Rustがコンパイル時に防いでいる場面です。</p>
<p>解決策は第12章で学んだ<code>move</code>キーワードです。クロージャの前に<code>move</code>を付けると、借用ではなく<strong>所有権ごとクロージャに移動</strong>させます。</p>
<pre><code>let handle = thread::spawn(move || {
    println!("{:?}", v); // vの所有者はクロージャになったのでOK
});
// 以降、メイン側ではvは使えない（所有権が移動済み）</code></pre>
<table>
<tr><th>キャプチャ方法</th><th>スレッドでの可否</th></tr>
<tr><td>借用（moveなし）</td><td>不可：変数が先に破棄される恐れ</td></tr>
<tr><td>所有権の移動（move付き）</td><td>可：スレッドが自分でデータを所有する</td></tr>
</table>
<p>スレッドに渡すクロージャには基本的に<code>move</code>を付ける、と覚えて構いません。</p>`,
      task: `このコードは「closure may outlive the current function」というコンパイルエラーになります。クロージャに<code>move</code>を付けて、<code>v</code>の所有権をスレッドに移動させて修正してください。`,
      code: `use std::thread;

fn main() {
    let v = vec![1, 2, 3];
    // エラー：クロージャがvを借用しているが、vが先に破棄されるかもしれない
    let handle = thread::spawn(|| {
        println!("スレッド内: {:?}", v);
        let sum: i32 = v.iter().sum();
        println!("sum = {}", sum);
    });
    handle.join().unwrap();
    println!("メイン終了");
}`,
      solution: `use std::thread;

fn main() {
    let v = vec![1, 2, 3];
    // moveでvの所有権をクロージャに移動させる
    let handle = thread::spawn(move || {
        println!("スレッド内: {:?}", v);
        let sum: i32 = v.iter().sum();
        println!("sum = {}", sum);
    });
    handle.join().unwrap();
    println!("メイン終了");
}`,
      hints: [
        `エラーの原因は、スレッドがvを「借りて」いるのに、貸し主のmainが先に終わる可能性があることです。`,
        `クロージャの縦棒の直前にmoveキーワードを置くと、所有権ごと移動します。`,
        `move後はメイン側でvを使えなくなりますが、このコードではメイン側でvを使っていないので問題ありません。`
      ],
      expectedOutput: "sum = 6"
    },
    {
      id: 174,
      title: "mpscチャネルの基本",
      explanation: `<p>スレッド間でデータをやり取りする安全な方法が<strong>チャネル</strong>です。チャネルは「送信側」と「受信側」がペアになったデータの通り道で、Rustでは<code>std::sync::mpsc</code>モジュールが提供します。mpscはmultiple producer, single consumer（複数の送信者、1つの受信者）の略です。</p>
<pre><code>use std::sync::mpsc;
use std::thread;

fn main() {
    // 送信側txと受信側rxのペアを作る
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        tx.send(String::from("こんにちは")).unwrap();
    });

    let received = rx.recv().unwrap();
    println!("受信: {}", received);
}</code></pre>
<table>
<tr><th>要素</th><th>役割</th></tr>
<tr><td><code>mpsc::channel()</code></td><td>送信側と受信側のペアをタプルで返す</td></tr>
<tr><td><code>tx.send(値)</code></td><td>値をチャネルに送る（所有権も一緒に移動する）</td></tr>
<tr><td><code>rx.recv()</code></td><td>値が届くまで<strong>待って</strong>受け取る</td></tr>
</table>
<p>ポイントが2つあります。第一に、<code>tx</code>はスレッドのクロージャに<code>move</code>で移動させます（前ステップの知識がそのまま活きます）。第二に、<code>send</code>は値の<strong>所有権ごと</strong>送ります。送った後にその値を送信側で使うことはできません。これにより「2つのスレッドが同じデータを同時に触る」事故が言語レベルで防がれます。</p>
<p><code>recv</code>は値が届くまでブロック（待機）するため、受信のタイミングを自分で調整する必要がありません。送信側が全て破棄されるとチャネルが閉じ、<code>recv</code>は<code>Err</code>を返します。Rustコミュニティには「メモリを共有して通信するな、通信してメモリを共有せよ」という標語があり、チャネルはその代表的な実践です。</p>`,
      task: `TODOの2か所を埋めてください。(1)スレッド内から<code>tx.send</code>で文字列「こんにちは」を送信する。(2)<code>rx.recv()</code>で受信して変数<code>received</code>に入れる。`,
      code: `use std::sync::mpsc;
use std::thread;

fn main() {
    // 送信側txと受信側rxのペアを作る
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || {
        // TODO: String::from("こんにちは") をtxで送信する

    });
    // TODO: rx.recv()で受信する（Resultが返るのでunwrapする）
    let received = String::from("未受信");
    println!("受信: {}", received);
}`,
      solution: `use std::sync::mpsc;
use std::thread;

fn main() {
    // 送信側txと受信側rxのペアを作る
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || {
        // 所有権ごとチャネルに送る
        tx.send(String::from("こんにちは")).unwrap();
    });
    // 値が届くまで待って受け取る
    let received = rx.recv().unwrap();
    println!("受信: {}", received);
}`,
      hints: [
        `送信は tx.send(値) です。戻り値はResultなのでunwrapを付けます。`,
        `受信は rx.recv().unwrap() で、届いた値がそのまま返ります。`,
        `txはクロージャにmoveされている必要があります。クロージャに既にmoveが付いていることを確認しましょう。`
      ],
      expectedOutput: "受信: こんにちは"
    },
    {
      id: 175,
      title: "複数メッセージの送信とforでの受信",
      explanation: `<p>チャネルは1回きりではなく、続けて何度でも送信できます。受信側で便利なのが、<strong><code>rx</code>をそのままforループで回せる</strong>ことです。</p>
<pre><code>thread::spawn(move || {
    for i in 1..=3 {
        tx.send(i).unwrap();
        thread::sleep(Duration::from_millis(20));
    }
});

for received in rx {
    println!("受信: {}", received);
}</code></pre>
<p><code>for received in rx</code>と書くと、受信側は次の値が届くまで待ちながら、届いた値を順に処理します。ではこのループはいつ終わるのでしょうか。答えは「<strong>すべての送信側が破棄されたとき</strong>」です。</p>
<p>上の例では、スレッドが終了するとクロージャが所有していた<code>tx</code>が破棄されます。送信側がいなくなったチャネルは閉じられ、forループは自然に終了します。<code>break</code>も終了フラグも不要という、きれいな設計です。</p>
<table>
<tr><th>受信方法</th><th>動き</th></tr>
<tr><td><code>rx.recv()</code></td><td>1件受信。チャネルが閉じると<code>Err</code></td></tr>
<tr><td><code>for v in rx</code></td><td>閉じるまで受信し続け、閉じたら終了</td></tr>
<tr><td><code>rx.try_recv()</code></td><td>待たずに確認。届いていなければ即<code>Err</code></td></tr>
</table>
<p>1つのチャネルを通る値の順序は保証されるため、この例では必ず1、2、3の順で受信されます（スレッドの実行タイミングに関係なく、送った順に届きます）。合計を計算する変数を用意して足し込めば、スレッドから届いたデータの集計もできます。</p>`,
      task: `TODOの2か所を埋めてください。(1)スレッド内のforループで1から3までを順に<code>send</code>する。(2)受信側は<code>for received in rx</code>のループで受け取り、<code>total</code>に足し込んでください。`,
      code: `use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || {
        for i in 1..=3 {
            // TODO: iを送信する

            thread::sleep(Duration::from_millis(20));
        }
    });
    let mut total = 0;
    // TODO: forループでrxから受信し、「受信: 値」と出力してtotalに足す

    println!("total = {}", total);
}`,
      solution: `use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || {
        for i in 1..=3 {
            // 1件ずつ順番に送信する
            tx.send(i).unwrap();
            thread::sleep(Duration::from_millis(20));
        }
    });
    let mut total = 0;
    // 送信側が破棄されるまで受信し続ける
    for received in rx {
        println!("受信: {}", received);
        total += received;
    }
    println!("total = {}", total);
}`,
      hints: [
        `送信はこれまでと同じ tx.send(i).unwrap() です。ループの中で3回呼ばれます。`,
        `受信は for received in rx { ... } と書きます。recvを自分で呼ぶ必要はありません。`,
        `スレッドが終わるとtxが破棄され、forループは自動的に終了します。totalは6になるはずです。`
      ],
      expectedOutput: "total = 6"
    },
    {
      id: 176,
      title: "複数プロデューサ（tx.clone）",
      explanation: `<p>mpscの「複数プロデューサ」を実際に使ってみましょう。複数のスレッドから同じチャネルに送信するには、送信側<code>tx</code>を<code>clone</code>して各スレッドに渡します。</p>
<pre><code>let (tx, rx) = mpsc::channel();
for id in 1..=3 {
    let tx_clone = tx.clone(); // スレッドごとに送信側を複製
    thread::spawn(move || {
        tx_clone.send(id * 10).unwrap();
    });
}
drop(tx); // 元のtxを破棄する（重要！）</code></pre>
<p><code>clone</code>せずに<code>tx</code>をそのままクロージャに渡すと、最初のループでtxの所有権が移動してしまい、2周目で「use of moved value（移動済みの値の使用）」というコンパイルエラーになります。ループの<strong>中で毎回cloneを作り、その複製をmoveで渡す</strong>のが正しい形です。</p>
<p>もう1つの落とし穴が<code>drop(tx)</code>です。前ステップで学んだとおり、受信のforループは「すべての送信側が破棄されたとき」に終わります。cloneを配った後も<strong>元の<code>tx</code>がメインスレッドに残っている</strong>ため、これを<code>drop</code>で明示的に破棄しないと、受信ループが永遠に終わらず、プログラムがハング（停止したまま動かない状態）します。</p>
<table>
<tr><th>やること</th><th>理由</th></tr>
<tr><td>ループ内で<code>tx.clone()</code></td><td>各スレッドが自分の送信側を所有するため</td></tr>
<tr><td>配り終えたら<code>drop(tx)</code></td><td>元のtxが残ると受信ループが終わらないため</td></tr>
</table>
<p>複数スレッドからの送信では到着順序は非決定的ですが、届く値の集合は決まっているため、合計のような順序に依存しない計算の結果は毎回同じになります。</p>`,
      task: `このコードは2周目のループで<code>tx</code>が移動済みになりコンパイルエラーです。ループ内で<code>tx.clone()</code>した複製をスレッドに渡すように修正してください（<code>drop(tx)</code>の行はそのまま残します）。`,
      code: `use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();
    for id in 1..=3 {
        // エラー：txは1周目のmoveで移動済みになる
        thread::spawn(move || {
            tx.send(id * 10).unwrap();
        });
    }
    // 元の送信側を破棄する（これがないと受信ループが終わらない）
    drop(tx);
    let mut sum = 0;
    for v in rx {
        sum += v;
    }
    println!("sum = {}", sum);
}`,
      solution: `use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();
    for id in 1..=3 {
        // スレッドごとに送信側を複製して渡す
        let tx_clone = tx.clone();
        thread::spawn(move || {
            tx_clone.send(id * 10).unwrap();
        });
    }
    // 元の送信側を破棄する（これがないと受信ループが終わらない）
    drop(tx);
    let mut sum = 0;
    for v in rx {
        sum += v;
    }
    println!("sum = {}", sum);
}`,
      hints: [
        `ループの中で let tx_clone = tx.clone(); を作り、クロージャではtx_cloneを使います。`,
        `cloneはスレッドを起動する前（spawnの外）で作る必要があります。`,
        `10+20+30で、sumは60になります。到着順序は毎回違っても合計は同じです。`
      ],
      expectedOutput: "sum = 60"
    },
    {
      id: 177,
      title: "Mutexの基本",
      explanation: `<p>チャネルは「データを送る」方式でしたが、複数の場所から<strong>同じデータを共有して更新したい</strong>場合もあります。そこで使うのが<code>Mutex&lt;T&gt;</code>（ミューテックス）です。mutual exclusion（相互排他）の略で、「一度に1人しかデータに触れない」ことを保証する鍵付きの箱だと考えてください。</p>
<pre><code>use std::sync::Mutex;

fn main() {
    let m = Mutex::new(5); // 5をMutexで包む
    {
        let mut num = m.lock().unwrap(); // 鍵を取得
        *num += 10; // 中身を書き換える
    } // ブロックを抜けると鍵が自動で返却される
    println!("値: {}", *m.lock().unwrap());
}</code></pre>
<p>流れを整理します。</p>
<ol>
<li><code>Mutex::new(値)</code>で値を包む</li>
<li><code>lock()</code>で鍵を取得する。他の誰かが鍵を持っていれば返すまで待つ</li>
<li>戻り値（<code>MutexGuard</code>という型）を通して<code>*num</code>のように中身へアクセスする</li>
<li>ガードがスコープを抜けると<strong>鍵は自動で返却される</strong></li>
</ol>
<p>最後の点がRustらしい設計です。多くの言語ではロックの解放し忘れが深刻なバグになりますが、Rustでは第15章で学んだ<code>Drop</code>の仕組みにより、ガードが破棄されるタイミングで必ず解放されます。上のコードで波かっこのブロックを使っているのは、鍵を早めに返すための明示的なスコープです。</p>
<p><code>lock()</code>が<code>Result</code>を返すのは、鍵を持ったままスレッドがパニックした場合（ポイズニングと呼びます）に備えるためです。学習段階では<code>unwrap</code>で問題ありません。<code>Mutex</code>は不変の変数<code>m</code>から中身を書き換えられる、つまり第15章の<code>RefCell</code>と同じ内部可変性を持つ点にも注目してください。</p>`,
      task: `TODOの2か所を埋めてください。(1)<code>lock()</code>で鍵を取得して中身に10を足す。(2)最後に<code>lock()</code>して中身の値を出力してください。ブロックの波かっこは鍵を早く返すためにそのまま使います。`,
      code: `use std::sync::Mutex;

fn main() {
    let m = Mutex::new(5);
    {
        // TODO: lockで鍵を取得し、*で中身に10を足す

    } // ここで鍵が自動で返却される
    // TODO: もう一度lockして中身を出力する
    println!("値: {}", 0);
}`,
      solution: `use std::sync::Mutex;

fn main() {
    let m = Mutex::new(5);
    {
        // 鍵を取得して中身を書き換える
        let mut num = m.lock().unwrap();
        *num += 10;
    } // ここで鍵が自動で返却される
    // もう一度鍵を取得して中身を読む
    println!("値: {}", *m.lock().unwrap());
}`,
      hints: [
        `lockの戻り値はResultなのでunwrapし、書き換えるためmut付きの変数で受けます。`,
        `中身へのアクセスはアスタリスクを付けて *num += 10; のように書きます。`,
        `出力は *m.lock().unwrap() をそのままプレースホルダに渡せます。5+10で15になります。`
      ],
      expectedOutput: "値: 15"
    },
    {
      id: 178,
      title: "Arc＋Mutexで複数スレッドから共有（並列カウンタ）",
      explanation: `<p><code>Mutex</code>を複数のスレッドで共有するには、所有者を複数にする仕組みが必要です。第15章で学んだ<code>Rc&lt;T&gt;</code>が思い浮かびますが、<strong><code>Rc</code>はスレッド間で使えません</strong>。<code>Rc</code>の参照カウントの更新はスレッド同時アクセスを想定しておらず、コンパイラが「<code>Rc&lt;Mutex&lt;i32&gt;&gt;</code> cannot be sent between threads safely」というエラーで止めてくれます。</p>
<p>スレッド間で使える参照カウント型が<code>Arc&lt;T&gt;</code>です。Atomic Reference Counted（原子的な参照カウント）の略で、カウントの増減が複数スレッドから同時に行われても壊れないようになっています。使い方は<code>Rc</code>とほぼ同じです。</p>
<table>
<tr><th>型</th><th>用途</th><th>複製方法</th></tr>
<tr><td><code>Rc&lt;T&gt;</code></td><td>単一スレッド内の共有</td><td><code>Rc::clone(&amp;rc)</code></td></tr>
<tr><td><code>Arc&lt;T&gt;</code></td><td>スレッド間の共有</td><td><code>Arc::clone(&amp;arc)</code></td></tr>
</table>
<p><code>Arc&lt;Mutex&lt;T&gt;&gt;</code>は「複数の所有者（Arc）が、排他制御付きの箱（Mutex）を共有する」という定番の組み合わせです。並列カウンタは次の形になります。</p>
<pre><code>let counter = Arc::new(Mutex::new(0));
for _ in 0..5 {
    let counter = Arc::clone(&amp;counter); // スレッドごとに複製
    thread::spawn(move || {
        let mut num = counter.lock().unwrap();
        *num += 1;
    });
}</code></pre>
<p>各スレッドには<code>Arc::clone</code>で作った複製を<code>move</code>で渡します（データ本体はコピーされず、所有者が増えるだけです）。全スレッドを<code>join</code>した後に<code>lock</code>して読めば、確定した最終値が得られます。Mutexのおかげで「2つのスレッドが同時にカウントを読んで同じ値に上書きし、加算が消える」という並行処理特有のバグ（データ競合）が起きません。</p>`,
      task: `このコードは<code>Rc</code>を使っているため「cannot be sent between threads safely」というコンパイルエラーになります。<code>Rc</code>を<code>Arc</code>に変更して（use宣言も含む）、5スレッド×100回の並列カウンタを完成させてください。`,
      code: `use std::rc::Rc;
use std::sync::Mutex;
use std::thread;

fn main() {
    // エラー：Rcはスレッド間で共有できない
    let counter = Rc::new(Mutex::new(0));
    let mut handles = Vec::new();
    for _ in 0..5 {
        let counter = Rc::clone(&counter);
        let handle = thread::spawn(move || {
            for _ in 0..100 {
                let mut num = counter.lock().unwrap();
                *num += 1;
            }
        });
        handles.push(handle);
    }
    for handle in handles {
        handle.join().unwrap();
    }
    println!("最終カウント: {}", *counter.lock().unwrap());
}`,
      solution: `use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    // Arcならスレッド間で安全に共有できる
    let counter = Arc::new(Mutex::new(0));
    let mut handles = Vec::new();
    for _ in 0..5 {
        // スレッドごとに所有者を増やす（データはコピーされない）
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            for _ in 0..100 {
                let mut num = counter.lock().unwrap();
                *num += 1;
            }
        });
        handles.push(handle);
    }
    // 全スレッドの終了を待ってから結果を読む
    for handle in handles {
        handle.join().unwrap();
    }
    println!("最終カウント: {}", *counter.lock().unwrap());
}`,
      hints: [
        `RcをArcに置き換えるだけで直ります。ArcはRcとほぼ同じAPIを持ちます。`,
        `use宣言は use std::sync::{Arc, Mutex}; とまとめられます。std::rc::Rcの行は削除します。`,
        `Rc::cloneの箇所もArc::cloneに変更するのを忘れずに。5スレッド×100回で最終カウントは500です。`
      ],
      expectedOutput: "最終カウント: 500"
    },
    {
      id: 179,
      title: "デッドロックの仕組みとSend/Sync（概要）",
      explanation: `<p>Mutexは強力ですが、使い方を誤ると<strong>デッドロック</strong>（複数のスレッドが互いの鍵を待ち合って全員が永遠に止まる状態）が起きます。典型例は「ロックの取得順序の食い違い」です。</p>
<table>
<tr><th>スレッド1</th><th>スレッド2</th></tr>
<tr><td>Aの鍵を取得</td><td>Bの鍵を取得</td></tr>
<tr><td>Bの鍵を待つ…</td><td>Aの鍵を待つ…</td></tr>
<tr><td>永遠に進まない</td><td>永遠に進まない</td></tr>
</table>
<p>対策の基本は「<strong>すべてのスレッドで同じ順序でロックを取る</strong>」ことです。常にA→Bの順で取ると決めれば、上の表の状況は起こりません。また、同じスレッドで同じMutexを二重にlockするだけでもデッドロックになります。Rustの所有権はメモリ安全性（データ競合の防止）は保証しますが、<strong>デッドロックは防げない</strong>ことを覚えておいてください。</p>
<p>次に、これまで暗黙に支えられてきた2つのトレイトを紹介します。</p>
<table>
<tr><th>トレイト</th><th>意味</th><th>例</th></tr>
<tr><td><code>Send</code></td><td>所有権を別スレッドへ移動できる</td><td><code>i32</code>、<code>String</code>、<code>Arc&lt;T&gt;</code></td></tr>
<tr><td><code>Sync</code></td><td>参照を複数スレッドで共有できる</td><td><code>Mutex&lt;T&gt;</code>など</td></tr>
</table>
<p>前ステップで<code>Rc</code>がスレッドに渡せなかったのは、<code>Rc</code>が<code>Send</code>を実装していないからです。<code>Send</code>と<code>Sync</code>はマーカートレイト（メソッドを持たず、性質を示すだけのトレイト）で、ほとんどの型には自動的に実装されます。私たちが手で実装することはまずなく、「スレッド関連のエラーメッセージに出てきたら、その型はスレッドをまたげないという意味」と読み解ければ十分です。コンパイラがこの2つを検査してくれるおかげで、Rustの並行処理は「コンパイルが通ればデータ競合がない」と言える安全性を持っています。</p>`,
      task: `このコードはロックをA→Bの正しい一貫した順序で取得しており、デッドロックしません。そのまま実行して結果を確認した後、<code>a</code>と<code>b</code>の初期値を変えて（例：10と20）再実行してみてください。コメントの二重ロックの例は絶対に有効化しないでください。`,
      code: `use std::sync::Mutex;

fn main() {
    let a = Mutex::new(1);
    let b = Mutex::new(2);
    // 常にa、bの順でロックを取ると決めておけばデッドロックしない
    {
        let ga = a.lock().unwrap();
        let gb = b.lock().unwrap();
        println!("a + b = {}", *ga + *gb);
    } // ここで両方の鍵が返却される
    // 下の2行を有効にすると、同じMutexの二重ロックでデッドロックする
    // let x = a.lock().unwrap();
    // let y = a.lock().unwrap(); // 1つ目の鍵が返らないので永遠に待つ
    println!("デッドロックせずに完了");
}`,
      solution: `use std::sync::Mutex;

fn main() {
    let a = Mutex::new(10);
    let b = Mutex::new(20);
    // 常にa、bの順でロックを取ると決めておけばデッドロックしない
    {
        let ga = a.lock().unwrap();
        let gb = b.lock().unwrap();
        println!("a + b = {}", *ga + *gb);
    } // ここで両方の鍵が返却される
    // 下の2行を有効にすると、同じMutexの二重ロックでデッドロックする
    // let x = a.lock().unwrap();
    // let y = a.lock().unwrap(); // 1つ目の鍵が返らないので永遠に待つ
    println!("デッドロックせずに完了");
}`,
      hints: [
        `まずはそのまま実行して、正しい順序のロックなら問題なく動くことを確認しましょう。`,
        `Mutex::newの引数を10と20に変えるだけです。出力は a + b = 30 になります。`,
        `コメントアウトされた二重ロックを有効にするとプログラムが止まったままになるので、試す場合は止め方（実行の中断）を確認してからにしましょう。`
      ],
      expectedOutput: "デッドロックせずに完了"
    },
    {
      id: 180,
      title: "総合演習：ワーカーを分けた並列集計",
      explanation: `<p>章の総仕上げとして、1から100までの合計をワーカースレッド（作業を分担するスレッド）4つで並列に計算します。実務でも「大きなデータを分割し、複数スレッドで処理して結果を合流させる」のは並列処理の最頻出パターンです。設計は次のとおりです。</p>
<ol>
<li>データを<code>chunks(25)</code>で25個ずつの塊に分割する（<code>chunks</code>はスライスを一定サイズごとに区切るメソッド）</li>
<li>各塊を<code>to_vec()</code>で所有権付きの<code>Vec</code>に複製し、スレッドに<code>move</code>で渡す</li>
<li>各ワーカーは自分の塊の合計を計算し、<code>Arc&lt;Mutex&lt;i32&gt;&gt;</code>の共有カウンタに加算する</li>
<li>全ワーカーを<code>join</code>してから最終結果を読む</li>
</ol>
<pre><code>for chunk in data.chunks(25) {
    let chunk: Vec&lt;i32&gt; = chunk.to_vec(); // 所有権付きの複製を作る
    let total = Arc::clone(&amp;total);
    let handle = thread::spawn(move || {
        let part: i32 = chunk.iter().sum(); // まず手元で集計
        let mut t = total.lock().unwrap();
        *t += part; // 共有カウンタには1回だけ加算
    });
    handles.push(handle);
}</code></pre>
<p>設計上の工夫に注目してください。各ワーカーは<strong>まず自分の塊をローカルで集計し、ロックは最後の加算の1回だけ</strong>にしています。ループのたびにロックを取ると、スレッドたちが鍵の順番待ちで渋滞し、並列化の意味が薄れてしまいます。「ロックを持つ時間は最短にする」のは並行処理の重要な原則です。</p>
<p>ワーカーの実行順序は非決定的ですが、加算の合計は順序に依存しないため、最終結果は必ず5050（1から100の和）になります。「途中経過は非決定的でも、joinの後の結果は決定的」という構造を作れることが、この章全体の学びの集大成です。</p>`,
      task: `TODOの3か所を埋めて並列集計を完成させてください。(1)<code>Arc::clone</code>でワーカー用の複製を作る。(2)ワーカー内で塊の合計<code>part</code>を計算し、共有カウンタに加算する。(3)全ワーカーを<code>join</code>で待つ。`,
      code: `use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let data: Vec<i32> = (1..=100).collect();
    let total = Arc::new(Mutex::new(0));
    let mut handles = Vec::new();
    // 25個ずつ4つの塊に分けて各ワーカーに割り当てる
    for chunk in data.chunks(25) {
        let chunk: Vec<i32> = chunk.to_vec();
        // TODO: (1) Arc::cloneでワーカー用の複製を作る

        let handle = thread::spawn(move || {
            // TODO: (2) chunkの合計partを計算し、共有カウンタに加算する

        });
        handles.push(handle);
    }
    // TODO: (3) すべてのhandleをjoinで待つ

    println!("総合計: {}", *total.lock().unwrap());
}`,
      solution: `use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let data: Vec<i32> = (1..=100).collect();
    let total = Arc::new(Mutex::new(0));
    let mut handles = Vec::new();
    // 25個ずつ4つの塊に分けて各ワーカーに割り当てる
    for chunk in data.chunks(25) {
        let chunk: Vec<i32> = chunk.to_vec();
        // ワーカー用に所有者を増やす
        let total = Arc::clone(&total);
        let handle = thread::spawn(move || {
            // まず手元で集計し、ロックは最後の1回だけにする
            let part: i32 = chunk.iter().sum();
            let mut t = total.lock().unwrap();
            *t += part;
        });
        handles.push(handle);
    }
    // 全ワーカーの終了を待ってから結果を読む
    for handle in handles {
        handle.join().unwrap();
    }
    println!("総合計: {}", *total.lock().unwrap());
}`,
      hints: [
        `(1)はステップ178と同じ let total = Arc::clone(&total); です。シャドーイングで同名にできます。`,
        `(2)は chunk.iter().sum() で塊の合計を出し、lockしてから *t += part; で加算します。sumの結果はi32の型注釈が必要です。`,
        `(3)は for handle in handles { handle.join().unwrap(); } です。1から100の和なので総合計は5050になります。`
      ],
      expectedOutput: "総合計: 5050"
    }
  ]
});
