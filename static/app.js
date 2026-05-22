const state = {
  questions: [],
  fullQuestions: [],
  selectedId: null,
  adminToken: localStorage.getItem("adminToken") || "",
  authMode: "login",
  staticMode: location.protocol === "file:" || location.hostname.endsWith("github.io"),
  pyodide: null,
  pyodideLoading: null,
};

const STATIC_QUESTIONS_URL = "../data/questions.json";
const LOCAL_QUESTIONS_KEY = "compilerLabQuestions";

const els = {
  homeLogo: document.querySelector("#homeLogo"),
  homeNav: document.querySelector("#homeNav"),
  userNav: document.querySelector("#userNav"),
  loginOpen: document.querySelector("#loginOpen"),
  signupOpen: document.querySelector("#signupOpen"),
  startPractice: document.querySelector("#startPractice"),
  adminLoginCta: document.querySelector("#adminLoginCta"),
  homeView: document.querySelector("#homeView"),
  userView: document.querySelector("#userView"),
  adminView: document.querySelector("#adminView"),
  questions: document.querySelector("#questions"),
  questionCount: document.querySelector("#questionCount"),
  selectedDifficulty: document.querySelector("#selectedDifficulty"),
  selectedTitle: document.querySelector("#selectedTitle"),
  selectedStatement: document.querySelector("#selectedStatement"),
  publicTestcases: document.querySelector("#publicTestcases"),
  codeEditor: document.querySelector("#codeEditor"),
  lineNumbers: document.querySelector("#lineNumbers"),
  cursorStatus: document.querySelector("#cursorStatus"),
  lineStatus: document.querySelector("#lineStatus"),
  resetCode: document.querySelector("#resetCode"),
  formatCode: document.querySelector("#formatCode"),
  copyCode: document.querySelector("#copyCode"),
  runCode: document.querySelector("#runCode"),
  runSummary: document.querySelector("#runSummary"),
  results: document.querySelector("#results"),
  authDialog: document.querySelector("#authDialog"),
  closeAuth: document.querySelector("#closeAuth"),
  authMode: document.querySelector("#authMode"),
  authUser: document.querySelector("#authUser"),
  authPass: document.querySelector("#authPass"),
  authSubmit: document.querySelector("#authSubmit"),
  loginMessage: document.querySelector("#loginMessage"),
  adminPanel: document.querySelector("#adminPanel"),
  adminStatus: document.querySelector("#adminStatus"),
  questionTitle: document.querySelector("#questionTitle"),
  questionDifficulty: document.querySelector("#questionDifficulty"),
  questionStatement: document.querySelector("#questionStatement"),
  starterCode: document.querySelector("#starterCode"),
  testcaseEditor: document.querySelector("#testcaseEditor"),
  addCase: document.querySelector("#addCase"),
  saveQuestion: document.querySelector("#saveQuestion"),
  adminQuestions: document.querySelector("#adminQuestions"),
};

function switchView(view) {
  const views = ["home", "user", "admin"];
  views.forEach((name) => {
    els[`${name}View`].classList.toggle("active", name === view);
  });
  els.homeNav.classList.toggle("active", view === "home");
  els.userNav.classList.toggle("active", view === "user");
  if (view === "admin") {
    showAdminPanel();
  }
}

function openAuth(mode = "login") {
  state.authMode = mode;
  els.authMode.textContent = mode === "signup" ? "Sign up" : "Login";
  els.authSubmit.textContent = mode === "signup" ? "Create Account" : "Continue";
  els.loginMessage.textContent = "";
  if (mode === "signup") {
    els.authUser.value = "";
    els.authPass.value = "";
  } else {
    els.authUser.value = "admin";
    els.authPass.value = "admin123";
  }
  els.authDialog.showModal();
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (options.admin) {
    headers.Authorization = `Bearer ${state.adminToken}`;
  }
  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

async function loadQuestions() {
  if (state.staticMode) {
    await loadStaticQuestions();
  } else {
    try {
      state.questions = await api("/api/questions");
    } catch (error) {
      state.staticMode = true;
      await loadStaticQuestions();
    }
  }
  if (!state.selectedId && state.questions.length) {
    state.selectedId = state.questions[0].id;
  }
  renderQuestions();
  selectQuestion(state.selectedId);
}

function renderQuestions() {
  els.questionCount.textContent = `${state.questions.length} available`;
  els.questions.innerHTML = state.questions
    .map(
      (q) => `
        <button class="question-card ${q.id === state.selectedId ? "active" : ""}" type="button" data-id="${q.id}">
          <strong>${escapeHtml(q.title)}</strong>
          <span class="badge">${escapeHtml(q.difficulty)}</span>
          <span class="badge accent">${q.publicTestcaseCount} public</span>
          <span class="badge private">${q.testcaseCount - q.publicTestcaseCount} private</span>
        </button>
      `,
    )
    .join("");
}

function selectQuestion(id) {
  const question = state.questions.find((item) => item.id === id);
  if (!question) return;
  state.selectedId = id;
  els.selectedDifficulty.textContent = question.difficulty;
  els.selectedTitle.textContent = question.title;
  els.selectedStatement.textContent = question.statement;
  els.codeEditor.value = question.starterCode || "# Write your Python solution here\n";
  renderPublicTestcases(question.publicTestcases || []);
  els.results.innerHTML = "";
  els.runSummary.textContent = "";
  renderQuestions();
  updateEditorMeta();
}

async function loadStaticQuestions() {
  const seedQuestions = await fetch(STATIC_QUESTIONS_URL).then((response) => response.json());
  const localQuestions = JSON.parse(localStorage.getItem(LOCAL_QUESTIONS_KEY) || "[]");
  const merged = [...seedQuestions, ...localQuestions];
  state.fullQuestions = merged;
  state.questions = merged.map(toPublicQuestion);
}

function toPublicQuestion(question) {
  const publicTestcases = publicTestcasesFor(question);
  return {
    id: question.id,
    title: question.title,
    difficulty: question.difficulty,
    statement: question.statement,
    starterCode: question.starterCode || "",
    testcaseCount: (question.testcases || []).length,
    publicTestcaseCount: publicTestcases.length,
    publicTestcases,
  };
}

function publicTestcasesFor(question) {
  return (question.testcases || [])
    .filter((testcase, index) => testcase.isPublic ?? index < 2)
    .map((testcase) => ({
      input: testcase.input || "",
      output: testcase.output || "",
    }));
}

function renderPublicTestcases(testcases) {
  if (!testcases.length) {
    els.publicTestcases.innerHTML = "<p class=\"hint\">No public examples are available for this question.</p>";
    return;
  }
  els.publicTestcases.innerHTML = `
    <h3>Public Testcases</h3>
    <div class="public-case-grid">
      ${testcases
        .map(
          (testcase, index) => `
            <article class="public-case">
              <strong>Example ${index + 1}</strong>
              <span>Input</span><pre>${escapeHtml(testcase.input)}</pre>
              <span>Output</span><pre>${escapeHtml(testcase.output)}</pre>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

async function runCode() {
  const question = state.questions.find((item) => item.id === state.selectedId);
  if (!question) return;
  els.runCode.disabled = true;
  els.runSummary.textContent = state.staticMode ? "Loading Python..." : "Running...";
  els.results.innerHTML = "";
  try {
    const data = state.staticMode
      ? await runStaticJudge(question.id, els.codeEditor.value)
      : await api("/api/run", {
          method: "POST",
          body: JSON.stringify({ questionId: question.id, code: els.codeEditor.value }),
        });
    els.runSummary.textContent = `${data.passed}/${data.total} testcases passed`;
    els.results.innerHTML = data.results.map(renderResult).join("");
  } catch (error) {
    els.runSummary.textContent = error.message;
  } finally {
    els.runCode.disabled = false;
  }
}

async function runStaticJudge(questionId, code) {
  const question = state.fullQuestions.find((item) => item.id === questionId);
  if (!question) throw new Error("Question not found");
  const pyodide = await getPyodide();
  els.runSummary.textContent = "Running...";
  const results = [];
  for (const [index, testcase] of (question.testcases || []).entries()) {
    const run = await runPythonInBrowser(pyodide, code, testcase.input || "");
    const passed = !run.stderr && normalizeOutput(run.stdout) === normalizeOutput(testcase.output || "");
    const isPublic = testcase.isPublic ?? index < 2;
    const result = {
      index: index + 1,
      passed,
      isPublic,
      timedOut: false,
    };
    if (isPublic) {
      result.input = testcase.input || "";
      result.actual = run.stdout;
      result.stderr = run.stderr;
    }
    results.push(result);
  }
  return {
    passed: results.filter((item) => item.passed).length,
    total: results.length,
    results,
  };
}

async function getPyodide() {
  if (state.pyodide) return state.pyodide;
  if (!state.pyodideLoading) {
    state.pyodideLoading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
      script.onload = async () => {
        try {
          state.pyodide = await loadPyodide();
          resolve(state.pyodide);
        } catch (error) {
          reject(error);
        }
      };
      script.onerror = () => reject(new Error("Python runtime could not load. Check your internet connection."));
      document.head.appendChild(script);
    });
  }
  return state.pyodideLoading;
}

async function runPythonInBrowser(pyodide, code, testcaseInput) {
  let stdout = "";
  let stderr = "";
  const inputLines = testcaseInput.replace(/\r\n/g, "\n").split("\n");
  let inputIndex = 0;
  pyodide.setStdout({ batched: (text) => (stdout += `${text}\n`) });
  pyodide.setStderr({ batched: (text) => (stderr += `${text}\n`) });
  pyodide.setStdin({
    stdin: () => {
      if (inputIndex >= inputLines.length) return "";
      return inputLines[inputIndex++];
    },
  });
  try {
    await pyodide.runPythonAsync(code);
  } catch (error) {
    stderr += error.message;
  }
  return { stdout, stderr };
}

function normalizeOutput(value) {
  return String(value)
    .trim()
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function renderResult(result) {
  if (!result.isPublic) {
    return `
      <article class="result-row private-result">
        <div class="${result.passed ? "pass" : "fail"}">Hidden Test ${result.index}: ${result.passed ? "Passed" : "Failed"}</div>
        <div>
          <strong>Private testcase</strong>
          <p>Input and expected output are hidden.</p>
        </div>
      </article>
    `;
  }
  return `
    <article class="result-row">
      <div class="${result.passed ? "pass" : "fail"}">Test ${result.index}: ${result.passed ? "Passed" : "Failed"}</div>
      <div>
        <strong>Input</strong><pre>${escapeHtml(result.input)}</pre>
        <strong>Your Output</strong><pre>${escapeHtml(result.actual || result.stderr || "")}</pre>
      </div>
    </article>
  `;
}

async function authContinue() {
  const username = els.authUser.value.trim();
  const password = els.authPass.value;
  els.loginMessage.textContent = "";
  if (!username || !password) {
    els.loginMessage.textContent = "Please enter username and password.";
    return;
  }
  if (username === "admin" && password === "admin123") {
    if (state.staticMode) {
      const token = `static-${Date.now()}`;
      state.adminToken = token;
      localStorage.setItem("adminToken", token);
      els.authDialog.close();
      switchView("admin");
      return;
    }
    try {
      const data = await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      state.adminToken = data.token;
      localStorage.setItem("adminToken", data.token);
      els.authDialog.close();
      switchView("admin");
      return;
    } catch (error) {
      els.loginMessage.textContent = error.message;
      return;
    }
  }
  localStorage.setItem("studentName", username);
  els.authDialog.close();
  switchView("user");
}

async function showAdminPanel() {
  if (!state.adminToken) {
    openAuth("login");
    return;
  }
  if (!els.testcaseEditor.children.length) {
    addCase("", "");
    addCase("", "");
  }
  await loadAdminQuestions();
}

async function loadAdminQuestions() {
  try {
    const questions = state.staticMode ? state.fullQuestions : await api("/api/admin/questions", { admin: true });
    els.adminQuestions.innerHTML = questions
      .map(
        (q) => `
          <div class="admin-question">
            <strong>${escapeHtml(q.title)}</strong>
            <span>${escapeHtml(q.difficulty)} - ${q.testcases.length} tests</span>
          </div>
        `,
      )
      .join("");
  } catch (error) {
    localStorage.removeItem("adminToken");
    state.adminToken = "";
    openAuth("login");
  }
}

function addCase(input = "", output = "", isPublic = els.testcaseEditor.children.length < 2) {
  const wrapper = document.createElement("div");
  wrapper.className = "testcase";
  wrapper.innerHTML = `
    <label>Input<textarea class="case-input" spellcheck="false">${escapeHtml(input)}</textarea></label>
    <label>Expected Output<textarea class="case-output" spellcheck="false">${escapeHtml(output)}</textarea></label>
    <label class="public-toggle"><input class="case-public" type="checkbox" ${isPublic ? "checked" : ""}> Public</label>
    <button class="ghost-button remove-case" type="button">Remove</button>
  `;
  wrapper.querySelector(".remove-case").addEventListener("click", () => wrapper.remove());
  els.testcaseEditor.appendChild(wrapper);
}

async function saveQuestion() {
  const testcases = [...document.querySelectorAll(".testcase")].map((row) => ({
    input: row.querySelector(".case-input").value,
    output: row.querySelector(".case-output").value,
    isPublic: row.querySelector(".case-public").checked,
  }));
  els.adminStatus.textContent = "Saving...";
  try {
    const question = {
      id: slugify(els.questionTitle.value),
      title: els.questionTitle.value.trim(),
      difficulty: els.questionDifficulty.value,
      statement: els.questionStatement.value.trim(),
      starterCode: els.starterCode.value,
      testcases,
    };
    if (state.staticMode) {
      if (!question.title || !question.statement || !testcases.length) {
        throw new Error("Title, statement, and at least one testcase are required.");
      }
      const localQuestions = JSON.parse(localStorage.getItem(LOCAL_QUESTIONS_KEY) || "[]");
      const updated = localQuestions.filter((item) => item.id !== question.id);
      updated.push(question);
      localStorage.setItem(LOCAL_QUESTIONS_KEY, JSON.stringify(updated));
    } else {
      await api("/api/admin/questions", {
        method: "POST",
        admin: true,
        body: JSON.stringify(question),
      });
    }
    els.adminStatus.textContent = "Saved";
    els.questionTitle.value = "";
    els.questionStatement.value = "";
    els.starterCode.value = "# Write Python code here\n";
    els.testcaseEditor.innerHTML = "";
    addCase("", "");
    addCase("", "");
    await loadQuestions();
    await loadAdminQuestions();
  } catch (error) {
    els.adminStatus.textContent = error.message;
  }
}

function slugify(value) {
  const slug = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `question-${Date.now()}`;
}

function updateEditorMeta() {
  const value = els.codeEditor.value;
  const lines = value.split("\n");
  els.lineNumbers.textContent = lines.map((_, index) => index + 1).join("\n");
  els.lineStatus.textContent = `${lines.length} ${lines.length === 1 ? "line" : "lines"}`;
  const pos = els.codeEditor.selectionStart;
  const before = value.slice(0, pos).split("\n");
  const line = before.length;
  const col = before[before.length - 1].length + 1;
  els.cursorStatus.textContent = `Ln ${line}, Col ${col}`;
}

function formatCode() {
  const formatted = els.codeEditor.value
    .split("\n")
    .map((line) => line.replace(/\t/g, "    ").replace(/\s+$/g, ""))
    .join("\n");
  els.codeEditor.value = formatted;
  updateEditorMeta();
}

async function copyCode() {
  await navigator.clipboard.writeText(els.codeEditor.value);
  els.runSummary.textContent = "Code copied";
  setTimeout(() => {
    if (els.runSummary.textContent === "Code copied") els.runSummary.textContent = "";
  }, 1200);
}

function handleEditorKeydown(event) {
  const pairs = {
    "(": ")",
    "[": "]",
    "{": "}",
    '"': '"',
    "'": "'",
  };
  const closers = new Set(Object.values(pairs));
  const editor = els.codeEditor;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const value = editor.value;

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "enter") {
    event.preventDefault();
    runCode();
    return;
  }

  if (event.key === "Tab") {
    event.preventDefault();
    editor.setRangeText("    ", start, end, "end");
    updateEditorMeta();
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const currentLine = value.slice(lineStart, start);
    const baseIndent = currentLine.match(/^\s*/)[0];
    const extraIndent = currentLine.trimEnd().endsWith(":") ? "    " : "";
    const nextText = value.slice(start, end);
    const shouldOutdentCloser = /^[\])}]/.test(nextText);
    const insertion = shouldOutdentCloser
      ? `\n${baseIndent}${extraIndent}\n${baseIndent}`
      : `\n${baseIndent}${extraIndent}`;
    editor.setRangeText(insertion, start, end, "end");
    if (shouldOutdentCloser) {
      const caret = start + 1 + baseIndent.length + extraIndent.length;
      editor.setSelectionRange(caret, caret);
    }
    updateEditorMeta();
    return;
  }

  if (closers.has(event.key) && value[start] === event.key && start === end) {
    event.preventDefault();
    editor.setSelectionRange(start + 1, start + 1);
    updateEditorMeta();
    return;
  }

  if (pairs[event.key] && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    const selected = value.slice(start, end);
    const opening = event.key;
    const closing = pairs[event.key];
    editor.setRangeText(`${opening}${selected}${closing}`, start, end, "end");
    const caret = selected ? end + 2 : start + 1;
    editor.setSelectionRange(caret, caret);
    updateEditorMeta();
    return;
  }

  if (event.key === "Backspace" && start === end && pairs[value[start - 1]] === value[start]) {
    event.preventDefault();
    editor.setRangeText("", start - 1, start + 1, "end");
    updateEditorMeta();
    return;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

els.homeLogo.addEventListener("click", () => switchView("home"));
els.homeNav.addEventListener("click", () => switchView("home"));
els.userNav.addEventListener("click", () => switchView("user"));
els.startPractice.addEventListener("click", () => switchView("user"));
els.adminLoginCta.addEventListener("click", () => openAuth("login"));
els.loginOpen.addEventListener("click", () => openAuth("login"));
els.signupOpen.addEventListener("click", () => openAuth("signup"));
els.closeAuth.addEventListener("click", () => els.authDialog.close());
els.authSubmit.addEventListener("click", authContinue);
els.authPass.addEventListener("keydown", (event) => {
  if (event.key === "Enter") authContinue();
});
els.questions.addEventListener("click", (event) => {
  const card = event.target.closest("[data-id]");
  if (card) selectQuestion(card.dataset.id);
});
els.resetCode.addEventListener("click", () => selectQuestion(state.selectedId));
els.formatCode.addEventListener("click", formatCode);
els.copyCode.addEventListener("click", copyCode);
els.runCode.addEventListener("click", runCode);
els.codeEditor.addEventListener("input", updateEditorMeta);
els.codeEditor.addEventListener("click", updateEditorMeta);
els.codeEditor.addEventListener("keyup", updateEditorMeta);
els.codeEditor.addEventListener("scroll", () => {
  els.lineNumbers.scrollTop = els.codeEditor.scrollTop;
});
els.codeEditor.addEventListener("keydown", handleEditorKeydown);
els.addCase.addEventListener("click", () => addCase("", ""));
els.saveQuestion.addEventListener("click", saveQuestion);

loadQuestions();
