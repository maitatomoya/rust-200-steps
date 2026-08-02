/**
 * Rust 200 Steps フロントエンド
 *
 * - サイドバー：章・ステップ一覧と進捗表示
 * - メイン：解説→課題→エディタ→実行結果を1ページで表示
 * - 進捗と編集中コードはlocalStorageに保存する
 */
(function () {
  "use strict";

  var STORAGE_KEY = "rust200.state.v1";
  var chapters = (window.RUST_TUTOR_CHAPTERS || []).slice().sort(function (a, b) {
    return a.number - b.number;
  });

  // 全ステップをid順のフラット配列にする
  var steps = [];
  chapters.forEach(function (ch) {
    (ch.steps || []).forEach(function (s) {
      s.chapter = ch;
      steps.push(s);
    });
  });
  steps.sort(function (a, b) { return a.id - b.id; });

  var stepById = {};
  steps.forEach(function (s) { stepById[s.id] = s; });

  /** localStorageの状態：{ done: {id: true}, codes: {id: "..."}, lastStep: id } */
  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* 壊れた保存データは無視して初期化する */ }
    return { done: {}, codes: {}, lastStep: null };
  }
  var state = loadState();

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* 保存失敗（容量超過など）は致命的ではないので無視 */ }
  }

  // ---- DOM参照 ----
  var $ = function (id) { return document.getElementById(id); };
  var elToc = $("toc");
  var elWelcome = $("welcome");
  var elStepView = $("step-view");
  var elBreadcrumb = $("step-breadcrumb");
  var elTitle = $("step-title");
  var elExplanation = $("explanation");
  var elTask = $("task-text");
  var elHintsBox = $("hints-box");
  var elSolutionBox = $("solution-box");
  var elSolutionCode = $("solution-code");
  var elOutputSection = $("output-section");
  var elOutputStatus = $("output-status");
  var elCompilerBlock = $("compiler-block");
  var elCompilerOutput = $("compiler-output");
  var elStdoutBlock = $("stdout-block");
  var elStdoutOutput = $("stdout-output");
  var elStderrBlock = $("stderr-block");
  var elStderrOutput = $("stderr-output");
  var elChkDone = $("chk-done");
  var elBtnRun = $("btn-run");

  var currentStep = null;
  var hintIndex = 0;

  // ---- エディタ（CodeMirrorが読み込めなければtextareaで動く） ----
  var textarea = $("code-editor");
  var cm = null;
  if (window.CodeMirror) {
    cm = CodeMirror.fromTextArea(textarea, {
      mode: "rust",
      theme: "material-darker",
      lineNumbers: true,
      indentUnit: 4,
      tabSize: 4,
      indentWithTabs: false,
      viewportMargin: Infinity,
      extraKeys: {
        "Cmd-Enter": function () { runCode(); },
        "Ctrl-Enter": function () { runCode(); },
      },
    });
    cm.on("change", function () {
      if (currentStep) {
        state.codes[currentStep.id] = cm.getValue();
        saveState();
      }
    });
  } else {
    textarea.addEventListener("input", function () {
      if (currentStep) {
        state.codes[currentStep.id] = textarea.value;
        saveState();
      }
    });
  }

  function getCode() { return cm ? cm.getValue() : textarea.value; }
  function setCode(code) {
    if (cm) {
      cm.setValue(code);
    } else {
      textarea.value = code;
    }
  }

  // ---- サイドバー ----
  function doneCount() {
    return steps.filter(function (s) { return state.done[s.id]; }).length;
  }

  function renderProgress() {
    var n = doneCount();
    $("progress-label").textContent = n + " / " + steps.length;
    $("progress-fill").style.width =
      (steps.length ? (n / steps.length) * 100 : 0) + "%";
  }

  function renderToc() {
    elToc.innerHTML = "";
    chapters.forEach(function (ch) {
      var chDone = (ch.steps || []).every(function (s) { return state.done[s.id]; });

      var details = document.createElement("details");
      details.className = "toc-chapter";
      if (currentStep && currentStep.chapter === ch) details.open = true;

      var summary = document.createElement("summary");
      summary.textContent = "第" + ch.number + "章 " + ch.title + (chDone ? " ✓" : "");
      if (chDone) summary.classList.add("done");
      details.appendChild(summary);

      var ul = document.createElement("ul");
      (ch.steps || []).forEach(function (s) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#step-" + s.id;
        a.textContent = s.id + ". " + s.title;
        a.className = "toc-step";
        if (state.done[s.id]) a.classList.add("done");
        if (currentStep && currentStep.id === s.id) a.classList.add("active");
        li.appendChild(a);
        ul.appendChild(li);
      });
      details.appendChild(ul);
      elToc.appendChild(details);
    });
  }

  // ---- ステップ表示 ----
  function showStep(id) {
    var step = stepById[id];
    if (!step) return;
    currentStep = step;
    hintIndex = 0;
    state.lastStep = id;
    saveState();

    elWelcome.hidden = true;
    elStepView.hidden = false;

    elBreadcrumb.textContent =
      "第" + step.chapter.number + "章 " + step.chapter.title +
      "｜ステップ " + step.id + " / " + steps.length;
    elTitle.textContent = step.title;
    // 教材データは自作の信頼できるコンテンツなのでinnerHTMLで描画する
    elExplanation.innerHTML = step.explanation || "";
    elTask.innerHTML = step.task || "";

    setCode(state.codes[step.id] != null ? state.codes[step.id] : step.code || "");

    elHintsBox.hidden = true;
    elHintsBox.innerHTML = "";
    elSolutionBox.hidden = true;
    elSolutionCode.textContent = step.solution || "";
    elOutputSection.hidden = true;
    elChkDone.checked = Boolean(state.done[step.id]);

    renderToc();
    renderProgress();
    window.scrollTo(0, 0);
    $("main").scrollTop = 0;
    if (cm) cm.refresh();
  }

  // ---- 実行 ----
  function setRunning(running) {
    elBtnRun.disabled = running;
    elBtnRun.textContent = running ? "実行中..." : "実行する";
  }

  function showOutput(result) {
    elOutputSection.hidden = false;

    elCompilerBlock.hidden = !result.compiler;
    elCompilerOutput.textContent = result.compiler || "";
    elStdoutBlock.hidden = !result.stdout;
    elStdoutOutput.textContent = result.stdout || "";
    elStderrBlock.hidden = !result.stderr;
    elStderrOutput.textContent = result.stderr || "";

    var passed = false;
    if (result.success) {
      var expected = currentStep.expectedOutput;
      if (expected == null || expected === "") {
        passed = true;
        elOutputStatus.textContent = "実行成功";
      } else if ((result.stdout || "").indexOf(expected) !== -1) {
        passed = true;
        elOutputStatus.textContent = "クリア！期待どおりの出力です";
      } else {
        elOutputStatus.textContent =
          "実行は成功しましたが、期待する出力と異なります（期待に含まれる文字列：" +
          expected + "）";
      }
      elOutputStatus.className = passed ? "status-ok" : "status-warn";
    } else {
      elOutputStatus.textContent =
        "コンパイルエラーまたは実行時エラーです。コンパイラ出力を読んでみましょう";
      elOutputStatus.className = "status-err";
    }

    if (passed && !state.done[currentStep.id]) {
      state.done[currentStep.id] = true;
      elChkDone.checked = true;
      saveState();
      renderToc();
      renderProgress();
    }
    elOutputSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function runCode() {
    if (!currentStep || elBtnRun.disabled) return;
    setRunning(true);
    elOutputSection.hidden = false;
    elOutputStatus.textContent = "コンパイル・実行中です...";
    elOutputStatus.className = "status-running";
    elCompilerBlock.hidden = true;
    elStdoutBlock.hidden = true;
    elStderrBlock.hidden = true;

    fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: getCode() }),
    })
      .then(function (res) { return res.json(); })
      .then(function (result) {
        if (result.error) {
          elOutputStatus.textContent = result.error;
          elOutputStatus.className = "status-err";
          return;
        }
        showOutput(result);
      })
      .catch(function () {
        elOutputStatus.textContent =
          "サーバーに接続できませんでした。server.jsが起動しているか確認してください。";
        elOutputStatus.className = "status-err";
      })
      .finally(function () { setRunning(false); });
  }

  // ---- イベント ----
  elBtnRun.addEventListener("click", runCode);

  $("btn-reset").addEventListener("click", function () {
    if (!currentStep) return;
    setCode(currentStep.code || "");
    delete state.codes[currentStep.id];
    saveState();
  });

  $("btn-hint").addEventListener("click", function () {
    if (!currentStep) return;
    var hints = currentStep.hints || [];
    if (hints.length === 0) return;
    elHintsBox.hidden = false;
    if (hintIndex < hints.length) {
      var p = document.createElement("p");
      p.textContent = "ヒント" + (hintIndex + 1) + "：" + hints[hintIndex];
      elHintsBox.appendChild(p);
      hintIndex++;
    }
    if (hintIndex >= hints.length) {
      $("btn-hint").textContent = "ヒント（すべて表示済み）";
    }
  });

  $("btn-solution").addEventListener("click", function () {
    elSolutionBox.hidden = !elSolutionBox.hidden;
  });

  $("btn-apply-solution").addEventListener("click", function () {
    if (!currentStep) return;
    setCode(currentStep.solution || "");
  });

  $("btn-prev").addEventListener("click", function () {
    if (currentStep && stepById[currentStep.id - 1]) {
      location.hash = "#step-" + (currentStep.id - 1);
    }
  });

  $("btn-next").addEventListener("click", function () {
    if (currentStep && stepById[currentStep.id + 1]) {
      location.hash = "#step-" + (currentStep.id + 1);
    }
  });

  elChkDone.addEventListener("change", function () {
    if (!currentStep) return;
    if (elChkDone.checked) {
      state.done[currentStep.id] = true;
    } else {
      delete state.done[currentStep.id];
    }
    saveState();
    renderToc();
    renderProgress();
  });

  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      runCode();
    }
  });

  window.addEventListener("hashchange", function () {
    var m = location.hash.match(/^#step-(\d+)$/);
    if (m) showStep(Number(m[1]));
  });

  // ヒント表示ボタンのラベルをステップ切替時に戻す
  var origShowStep = showStep;
  showStep = function (id) {
    $("btn-hint").textContent = "ヒント";
    origShowStep(id);
  };

  // ---- バックエンド表示 ----
  fetch("/api/status")
    .then(function (r) { return r.json(); })
    .then(function (s) {
      $("backend-badge").textContent =
        s.backend === "local"
          ? "実行環境：ローカル（" + s.rustcVersion + "）"
          : "実行環境：Rust Playground（rustupを入れるとローカル実行になります）";
    })
    .catch(function () {
      $("backend-badge").textContent = "実行環境：不明（サーバー未接続）";
    });

  // ---- 初期表示 ----
  if (steps.length === 0) {
    elWelcome.innerHTML =
      "<h2>教材データが見つかりません</h2><p>public/content/にchapterNN.jsを配置してください。</p>";
  } else {
    renderToc();
    renderProgress();
    var m = location.hash.match(/^#step-(\d+)$/);
    var initial = m ? Number(m[1]) : state.lastStep || steps[0].id;
    if (!stepById[initial]) initial = steps[0].id;
    showStep(initial);
    location.hash = "#step-" + initial;
  }
})();
