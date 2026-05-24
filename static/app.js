import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAoHmBu2hfMD8TA2Qv0-P73yLhWDCdtRXg",
  authDomain: "coding-platform-1f750.firebaseapp.com",
  projectId: "coding-platform-1f750",
  storageBucket: "coding-platform-1f750.firebasestorage.app",
  messagingSenderId: "262524179509",
  appId: "1:262524179509:web:335b938387b491a4330d7c",
  measurementId: "G-K65RR6F6Q2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_USERNAME_KEY = "compilerLabAdminUser";
const ADMIN_PASSWORD_KEY = "compilerLabAdminPass";
const USERS_KEY = "compilerLabUsers";
const SESSION_KEY = "compilerLabSession";
const SOLVES_KEY = "compilerLabSolves";
const LOCAL_QUESTIONS_KEY = "compilerLabQuestions";
const SUGGESTIONS_KEY = "compilerLabSuggestions";
const STATIC_QUESTIONS_URL = "../data/questions.json";

const state = {
  questions: [],
  fullQuestions: [],
  selectedId: null,
  currentUser: JSON.parse(localStorage.getItem(SESSION_KEY) || "null"),
  authMode: "login",
  staticMode: true,
  pyodide: null,
  pyodideLoading: null,
  practiceEditor: null,
  playgroundEditor: null,
};

const els = {
  homeLogo: document.querySelector("#homeLogo"),
  homeNav: document.querySelector("#homeNav"),
  userNav: document.querySelector("#userNav"),
  playgroundNav: document.querySelector("#playgroundNav"),
  leaderboardNav: document.querySelector("#leaderboardNav"),
  suggestNav: document.querySelector("#suggestNav"),
  loginOpen: document.querySelector("#loginOpen"),
  signupOpen: document.querySelector("#signupOpen"),
  logoutButton: document.querySelector("#logoutButton"),
  startPractice: document.querySelector("#startPractice"),
  homeSignupCta: document.querySelector("#homeSignupCta"),
  homeView: document.querySelector("#homeView"),
  userView: document.querySelector("#userView"),
  playgroundView: document.querySelector("#playgroundView"),
  leaderboardView: document.querySelector("#leaderboardView"),
  suggestView: document.querySelector("#suggestView"),
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
  signedInStatus: document.querySelector("#signedInStatus"),
  resetCode: document.querySelector("#resetCode"),
  formatCode: document.querySelector("#formatCode"),
  copyCode: document.querySelector("#copyCode"),
  runCode: document.querySelector("#runCode"),
  runSummary: document.querySelector("#runSummary"),
  results: document.querySelector("#results"),
  playgroundCode: document.querySelector("#playgroundCode"),
  playgroundInput: document.querySelector("#playgroundInput"),
  playgroundStatus: document.querySelector("#playgroundStatus"),
  playgroundOutput: document.querySelector("#playgroundOutput"),
  runPlayground: document.querySelector("#runPlayground"),
  leaderboardRows: document.querySelector("#leaderboardRows"),
  leaderboardCount: document.querySelector("#leaderboardCount"),
  suggestTitle: document.querySelector("#suggestTitle"),
  suggestDifficulty: document.querySelector("#suggestDifficulty"),
  suggestStatement: document.querySelector("#suggestStatement"),
  suggestStarter: document.querySelector("#suggestStarter"),
  suggestCaseEditor: document.querySelector("#suggestCaseEditor"),
  addSuggestCase: document.querySelector("#addSuggestCase"),
  submitSuggestion: document.querySelector("#submitSuggestion"),
  suggestStatus: document.querySelector("#suggestStatus"),
  authDialog: document.querySelector("#authDialog"),
  closeAuth: document.querySelector("#closeAuth"),
  authMode: document.querySelector("#authMode"),
  authHelp: document.querySelector("#authHelp"),
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
  pendingSuggestions: document.querySelector("#pendingSuggestions"),
  adminUsers: document.querySelector("#adminUsers"),
};

function ensureAdminCredentials() {
  if (!localStorage.getItem(ADMIN_USERNAME_KEY)) {
    localStorage.setItem(ADMIN_USERNAME_KEY, atob("YWRtaW4="));
  }
  if (!localStorage.getItem(ADMIN_PASSWORD_KEY)) {
    localStorage.setItem(ADMIN_PASSWORD_KEY, atob("YWRtaW4xMjM="));
  }
}

function switchView(view) {
  const views = ["home", "user", "playground", "leaderboard", "suggest", "admin"];
  views.forEach((name) => {
    els[`${name}View`].classList.toggle("active", name === view);
  });
  const navs = {
    home: els.homeNav,
    user: els.userNav,
    playground: els.playgroundNav,
    leaderboard: els.leaderboardNav,
    suggest: els.suggestNav,
  };
  Object.entries(navs).forEach(([name, button]) => button.classList.toggle("active", name === view));
  if (view === "user" && !state.practiceEditor) initPracticeEditor();
  if (view === "playground" && !state.playgroundEditor) initPlaygroundEditor();
  if (view === "leaderboard") renderLeaderboard();
  if (view === "admin") showAdminPanel();
}

function initPracticeEditor() {
  state.practiceEditor = CodeMirror.fromTextArea(els.codeEditor, {
    mode: "python",
    theme: "dracula",
    lineNumbers: true,
    indentUnit: 4,
    matchBrackets: true,
  });
  state.practiceEditor.on("change", updateEditorMeta);
  state.practiceEditor.on("cursorActivity", updateEditorMeta);
}

function initPlaygroundEditor() {
  state.playgroundEditor = CodeMirror.fromTextArea(els.playgroundCode, {
    mode: "python",
    theme: "dracula",
    lineNumbers: true,
    indentUnit: 4,
    matchBrackets: true,
  });
}


function requireUser(nextView) {
  if (!state.currentUser) {
    openAuth("login");
    return false;
  }
  switchView(nextView);
  return true;
}

function openAuth(mode = "login") {
  state.authMode = mode;
  els.authMode.textContent = mode === "signup" ? "Sign up" : "Login";
  els.authSubmit.textContent = mode === "signup" ? "Create Account" : "Continue";
  els.authHelp.textContent =
    mode === "signup" ? "Create a learner account to save progress." : "Login with your learner or admin account.";
  els.loginMessage.textContent = "";
  els.authUser.value = "";
  els.authPass.value = "";
  els.authDialog.showModal();
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function loadQuestions() {
  await loadStaticQuestions();
  if (!state.selectedId && state.questions.length) state.selectedId = state.questions[0].id;
  renderQuestions();
  selectQuestion(state.selectedId);
}

async function loadStaticQuestions() {
  const seedQuestions = await fetch(STATIC_QUESTIONS_URL).then((response) => response.json());
  
  let localQuestions = [];
  try {
    const qSnap = await getDocs(collection(db, "questions"));
    localQuestions = qSnap.docs.map(d => d.data());
  } catch(e) { console.error(e); }
  
  let approvedSuggestions = [];
  try {
    const sSnap = await getDocs(collection(db, "suggestions"));
    approvedSuggestions = sSnap.docs.map(d => d.data()).filter((item) => item.status === "approved");
  } catch(e) { console.error(e); }
  
  const merged = [...seedQuestions, ...localQuestions, ...approvedSuggestions.map((item) => item.question)];
  state.fullQuestions = dedupeQuestions(merged);
  state.questions = state.fullQuestions.map(toPublicQuestion);
}

function dedupeQuestions(questions) {
  return [...new Map(questions.map((question) => [question.id, question])).values()];
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
    .map((testcase) => ({ input: testcase.input || "", output: testcase.output || "" }));
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
  if (state.practiceEditor) {
    state.practiceEditor.setValue(question.starterCode || '# Write your Python solution here\n');
  } else {
    els.codeEditor.value = question.starterCode || "# Write your Python solution here\n";
  }
  renderPublicTestcases(question.publicTestcases || []);
  els.results.innerHTML = "";
  els.runSummary.textContent = "";
  renderQuestions();
  updateEditorMeta();
}

function renderPublicTestcases(testcases) {
  if (!testcases.length) {
    els.publicTestcases.innerHTML = '<p class="hint">No public examples are available for this question.</p>';
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
  if (!state.currentUser || state.currentUser.role !== "user") {
    openAuth("login");
    els.runSummary.textContent = "Login with a learner account to save solved questions.";
    return;
  }
  const question = state.questions.find((item) => item.id === state.selectedId);
  if (!question) return;
  els.runCode.disabled = true;
  els.runSummary.textContent = state.staticMode ? "Loading Python..." : "Running...";
  els.results.innerHTML = "";
  try {
    const data = await runStaticJudge(question.id, (state.practiceEditor ? state.practiceEditor.getValue() : els.codeEditor.value));
    els.runSummary.textContent = `${data.passed}/${data.total} testcases passed`;
    els.results.innerHTML = data.results.map(renderResult).join("");
    if (data.passed === data.total) recordSolve(state.currentUser.username, question.id);
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
    const result = { index: index + 1, passed, isPublic, timedOut: false };
    if (isPublic) {
      result.input = testcase.input || "";
      result.actual = run.stdout;
      result.stderr = run.stderr;
    }
    results.push(result);
  }
  return { passed: results.filter((item) => item.passed).length, total: results.length, results };
}

async function runPlayground() {
  els.runPlayground.disabled = true;
  els.playgroundStatus.textContent = "Loading Python...";
  els.playgroundOutput.textContent = "";
  try {
    const pyodide = await getPyodide();
    els.playgroundStatus.textContent = "Running...";
    const run = await runPythonInBrowser(pyodide, (state.playgroundEditor ? state.playgroundEditor.getValue() : els.playgroundCode.value), els.playgroundInput.value);
    els.playgroundOutput.textContent = run.stderr || run.stdout || "(no output)";
    els.playgroundStatus.textContent = "Done";
  } catch (error) {
    els.playgroundStatus.textContent = error.message;
  } finally {
    els.runPlayground.disabled = false;
  }
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
  pyodide.setStdin({ stdin: () => (inputIndex >= inputLines.length ? "" : inputLines[inputIndex++]) });
  try {
    await pyodide.runPythonAsync(code);
  } catch (error) {
    stderr += error.message;
  }
  return { stdout, stderr };
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
  els.loginMessage.textContent = "Loading...";
  if (!username || !password) {
    els.loginMessage.textContent = "Please enter username and password.";
    return;
  }
  if (username === localStorage.getItem(ADMIN_USERNAME_KEY) && password === localStorage.getItem(ADMIN_PASSWORD_KEY)) {
    setSession({ username, role: "admin" });
    els.authDialog.close();
    switchView("admin");
    return;
  }
  
  const userRef = doc(db, "users", username.toLowerCase());
  
  if (state.authMode === "signup") {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      els.loginMessage.textContent = "That username is already registered.";
      return;
    }
    const newUser = { username, password, createdAt: new Date().toISOString(), active: true, role: "user" };
    await setDoc(userRef, newUser);
    setSession({ username, role: "user" });
    els.authDialog.close();
    switchView("user");
    return;
  }
  
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) {
    els.loginMessage.textContent = "Invalid username or password.";
    return;
  }
  const user = docSnap.data();
  if (user.password !== password) {
    els.loginMessage.textContent = "Invalid username or password.";
    return;
  }
  if (!user.active) {
    els.loginMessage.textContent = "This account has been removed by admin.";
    return;
  }
  setSession({ username, role: "user" });
  els.authDialog.close();
  switchView("user");
}

function setSession(user) {
  state.currentUser = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  updateAuthUi();
}

function logout() {
  state.currentUser = null;
  localStorage.removeItem(SESSION_KEY);
  updateAuthUi();
  switchView("home");
}

function updateAuthUi() {
  const signedIn = Boolean(state.currentUser);
  els.loginOpen.classList.toggle("hidden", signedIn);
  els.signupOpen.classList.toggle("hidden", signedIn);
  els.logoutButton.classList.toggle("hidden", !signedIn);
  els.signedInStatus.textContent = signedIn ? state.currentUser.username : "Guest";
}

async function recordSolve(username, questionId) {
  const solveRef = doc(db, "solves", username.toLowerCase());
  const docSnap = await getDoc(solveRef);
  let solvedList = [];
  if (docSnap.exists()) {
    solvedList = docSnap.data().solved || [];
  }
  if (!solvedList.includes(questionId)) {
    solvedList.push(questionId);
    await setDoc(solveRef, { solved: solvedList });
  }
  renderLeaderboard();
}

async function renderLeaderboard() {
  els.leaderboardRows.innerHTML = '<p class="hint">Loading...</p>';
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const users = usersSnap.docs.map(d => d.data()).filter(u => u.active);
    
    const solvesSnap = await getDocs(collection(db, "solves"));
    const solves = {};
    solvesSnap.docs.forEach(d => {
      solves[d.id] = d.data().solved || [];
    });
    
    const rows = users
      .map((user) => ({ username: user.username, solved: (solves[user.username.toLowerCase()] || []).length }))
      .sort((a, b) => b.solved - a.solved || a.username.localeCompare(b.username));
      
    els.leaderboardCount.textContent = `${rows.length} users`;
    els.leaderboardRows.innerHTML = rows.length
      ? rows
          .map(
            (row, index) => `
              <article class="leaderboard-row">
                <strong>#${index + 1}</strong>
                <span>${escapeHtml(row.username)}</span>
                <b>${row.solved} solved</b>
              </article>
            `,
          )
          .join("")
      : '<p class="hint">No registered users yet.</p>';
  } catch(e) {
    els.leaderboardRows.innerHTML = '<p class="hint">Error loading leaderboard.</p>';
  }
}

function addCase(target, input = "", output = "", isPublic = target.children.length < 2) {
  const wrapper = document.createElement("div");
  wrapper.className = "testcase";
  wrapper.innerHTML = `
    <label>Input<textarea class="case-input" spellcheck="false">${escapeHtml(input)}</textarea></label>
    <label>Expected Output<textarea class="case-output" spellcheck="false">${escapeHtml(output)}</textarea></label>
    <label class="public-toggle"><input class="case-public" type="checkbox" ${isPublic ? "checked" : ""}> Public</label>
    <button class="ghost-button remove-case" type="button">Remove</button>
  `;
  wrapper.querySelector(".remove-case").addEventListener("click", () => wrapper.remove());
  target.appendChild(wrapper);
}

function readCases(target) {
  return [...target.querySelectorAll(".testcase")].map((row) => ({
    input: row.querySelector(".case-input").value,
    output: row.querySelector(".case-output").value,
    isPublic: row.querySelector(".case-public").checked,
  }));
}

async function saveQuestion() {
  els.adminStatus.textContent = "Saving...";
  try {
    const question = buildQuestion({
      title: els.questionTitle.value,
      difficulty: els.questionDifficulty.value,
      statement: els.questionStatement.value,
      starterCode: els.starterCode.value,
      testcases: readCases(els.testcaseEditor),
    });
    await setDoc(doc(db, "questions", question.id), question);
    clearQuestionForm();
    await loadQuestions();
    renderAdmin();
    els.adminStatus.textContent = "Saved";
  } catch (error) {
    els.adminStatus.textContent = error.message;
  }
}

async function submitSuggestion() {
  if (!state.currentUser || state.currentUser.role !== "user") {
    openAuth("login");
    els.suggestStatus.textContent = "Login before suggesting a question.";
    return;
  }
  try {
    const question = buildQuestion({
      title: els.suggestTitle.value,
      difficulty: els.suggestDifficulty.value,
      statement: els.suggestStatement.value,
      starterCode: els.suggestStarter.value,
      testcases: readCases(els.suggestCaseEditor),
    });
    const sugId = `${question.id}-${Date.now()}`;
    await setDoc(doc(db, "suggestions", sugId), {
      id: sugId,
      question,
      author: state.currentUser.username,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    els.suggestTitle.value = "";
    els.suggestStatement.value = "";
    els.suggestStarter.value = "# Write Python code here\n";
    els.suggestCaseEditor.innerHTML = "";
    addCase(els.suggestCaseEditor);
    addCase(els.suggestCaseEditor);
    els.suggestStatus.textContent = "Submitted for admin approval";
  } catch (error) {
    els.suggestStatus.textContent = error.message;
  }
}

function buildQuestion({ title, difficulty, statement, starterCode, testcases }) {
  const cleanTitle = title.trim();
  const cleanStatement = statement.trim();
  if (!cleanTitle || !cleanStatement) throw new Error("Title and statement are required.");
  if (!testcases.length || testcases.some((testcase) => !testcase.output.trim())) {
    throw new Error("At least one testcase with expected output is required.");
  }
  return {
    id: slugify(cleanTitle),
    title: cleanTitle,
    difficulty,
    statement: cleanStatement,
    starterCode,
    testcases,
  };
}

function showAdminPanel() {
  if (!state.currentUser || state.currentUser.role !== "admin") {
    openAuth("login");
    return;
  }
  if (!els.testcaseEditor.children.length) {
    addCase(els.testcaseEditor);
    addCase(els.testcaseEditor);
  }
  renderAdmin();
}

function renderAdmin() {
  renderAdminQuestions();
  renderSuggestions();
  renderAdminUsers();
}

function renderAdminQuestions() {
  els.adminQuestions.innerHTML = state.fullQuestions.length
    ? state.fullQuestions
        .map(
          (q) => `
          <div class="admin-question">
            <strong>${escapeHtml(q.title)}</strong>
            <span>${escapeHtml(q.difficulty)} - ${(q.testcases || []).length} tests</span>
          </div>
        `,
        )
        .join("")
    : '<p class="hint">No questions available.</p>';
}

async function renderSuggestions() {
  els.pendingSuggestions.innerHTML = '<p class="hint">Loading...</p>';
  try {
    const snap = await getDocs(collection(db, "suggestions"));
    const suggestions = snap.docs.map(d => d.data()).filter((item) => item.status === "pending");
    els.pendingSuggestions.innerHTML = suggestions.length
      ? suggestions
          .map(
            (item) => `
              <article class="review-card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <div>
                    <strong>${escapeHtml(item.question.title)}</strong>
                    <span class="badge">${escapeHtml(item.question.difficulty)}</span>
                    <p>Suggested by ${escapeHtml(item.author)}</p>
                  </div>
                  <div class="row-actions">
                    <button class="primary-button compact" type="button" data-approve="${item.id}">Approve</button>
                    <button class="ghost-button compact" type="button" data-reject="${item.id}">Reject</button>
                  </div>
                </div>
                <details style="margin-top: 12px; font-size: 14px;">
                  <summary style="cursor: pointer; color: var(--accent); font-weight: 600;">View Details</summary>
                  <div style="margin-top: 8px; padding: 12px; background: var(--surface-2); border-radius: 6px;">
                    <strong>Description:</strong>
                    <p style="white-space: pre-wrap; margin-top: 4px; color: var(--ink);">${escapeHtml(item.question.statement)}</p>
                    <strong style="display: block; margin-top: 12px;">Starter Code:</strong>
                    <pre style="margin-top: 4px; color: var(--ink);">${escapeHtml(item.question.starterCode || "None")}</pre>
                    <strong style="display: block; margin-top: 12px;">Testcases:</strong>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
                      ${(item.question.testcases || []).map((tc, idx) => `
                        <div style="background: #fff; padding: 8px; border: 1px solid var(--line); border-radius: 4px; flex: 1; min-width: 200px;">
                          <strong>Test ${idx + 1} (${tc.isPublic ? 'Public' : 'Private'})</strong><br/>
                          <small>Input:</small><pre style="color: var(--ink);">${escapeHtml(tc.input)}</pre>
                          <small>Output:</small><pre style="color: var(--ink);">${escapeHtml(tc.output)}</pre>
                        </div>
                      `).join("")}
                    </div>
                  </div>
                </details>
              </article>
            `,
          )
          .join("")
      : '<p class="hint">No pending suggestions.</p>';
  } catch(e) {
    els.pendingSuggestions.innerHTML = '<p class="hint">Error loading suggestions.</p>';
  }
}

async function renderAdminUsers() {
  els.adminUsers.innerHTML = '<p class="hint">Loading...</p>';
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const users = usersSnap.docs.map(d => d.data());
    const solvesSnap = await getDocs(collection(db, "solves"));
    const solves = {};
    solvesSnap.docs.forEach(d => { solves[d.id] = d.data().solved || []; });
    
    els.adminUsers.innerHTML = users.length
      ? users
          .map(
            (user) => `
              <article class="user-row">
                <div>
                  <strong>${escapeHtml(user.username)}</strong>
                  <span>${(solves[user.username.toLowerCase()] || []).length} solved</span>
                </div>
                <button class="ghost-button compact" type="button" data-remove-user="${escapeHtml(user.username)}">Remove</button>
              </article>
            `,
          )
          .join("")
      : '<p class="hint">No registered users.</p>';
  } catch(e) {
    els.adminUsers.innerHTML = '<p class="hint">Error loading users.</p>';
  }
}

async function approveSuggestion(id, status) {
  const sugRef = doc(db, "suggestions", id);
  const snap = await getDoc(sugRef);
  if (!snap.exists()) return;
  const suggestion = snap.data();
  await updateDoc(sugRef, { status });
  
  if (status === "approved") {
    await setDoc(doc(db, "questions", suggestion.question.id), suggestion.question);
    loadQuestions();
  }
  renderAdmin();
}

async function removeUser(username) {
  await deleteDoc(doc(db, "users", username.toLowerCase()));
  await deleteDoc(doc(db, "solves", username.toLowerCase()));
  if (state.currentUser?.username === username) logout();
  renderAdmin();
  renderLeaderboard();
}

function switchAdminSection(id) {
  document.querySelectorAll(".admin-section").forEach((section) => section.classList.toggle("active", section.id === id));
  document.querySelectorAll(".admin-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.adminSection === id);
  });
}

function clearQuestionForm() {
  els.questionTitle.value = "";
  els.questionStatement.value = "";
  els.starterCode.value = "# Write Python code here\n";
  els.testcaseEditor.innerHTML = "";
  addCase(els.testcaseEditor);
  addCase(els.testcaseEditor);
}

function updateEditorMeta() {
  if (!state.practiceEditor) return;
  const lines = state.practiceEditor.lineCount();
  els.lineStatus.textContent = `${lines} ${lines === 1 ? "line" : "lines"}`;
  const cursor = state.practiceEditor.getCursor();
  els.cursorStatus.textContent = `Ln ${cursor.line + 1}, Col ${cursor.ch + 1}`;
}

function formatCode() {
  if (!state.practiceEditor) return;
  const val = state.practiceEditor.getValue().split("\n").map((line) => line.replace(/\t/g, "    ").replace(/\s+$/g, "")).join("\n");
  state.practiceEditor.setValue(val);
  updateEditorMeta();
}

async function copyCode() {
  await navigator.clipboard.writeText((state.practiceEditor ? state.practiceEditor.getValue() : els.codeEditor.value));
  els.runSummary.textContent = "Code copied";
  setTimeout(() => {
    if (els.runSummary.textContent === "Code copied") els.runSummary.textContent = "";
  }, 1200);
}

function normalizeOutput(value) {
  return String(value)
    .trim()
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function slugify(value) {
  return (
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `question-${Date.now()}`
  );
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
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
els.userNav.addEventListener("click", () => requireUser("user"));
els.playgroundNav.addEventListener("click", () => switchView("playground"));
els.leaderboardNav.addEventListener("click", () => switchView("leaderboard"));
els.suggestNav.addEventListener("click", () => switchView("suggest"));
els.startPractice.addEventListener("click", () => requireUser("user"));
els.homeSignupCta.addEventListener("click", () => openAuth("signup"));
els.loginOpen.addEventListener("click", () => openAuth("login"));
els.signupOpen.addEventListener("click", () => openAuth("signup"));
els.logoutButton.addEventListener("click", logout);
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
els.runPlayground.addEventListener("click", runPlayground);
els.addCase.addEventListener("click", () => addCase(els.testcaseEditor));
els.addSuggestCase.addEventListener("click", () => addCase(els.suggestCaseEditor));
els.submitSuggestion.addEventListener("click", submitSuggestion);
els.codeEditor.addEventListener("input", updateEditorMeta);
els.codeEditor.addEventListener("click", updateEditorMeta);
els.codeEditor.addEventListener("keyup", updateEditorMeta);

els.saveQuestion.addEventListener("click", saveQuestion);
els.pendingSuggestions.addEventListener("click", (event) => {
  const approve = event.target.closest("[data-approve]");
  const reject = event.target.closest("[data-reject]");
  if (approve) approveSuggestion(approve.dataset.approve, "approved");
  if (reject) approveSuggestion(reject.dataset.reject, "rejected");
});
els.adminUsers.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-user]");
  if (button) removeUser(button.dataset.removeUser);
});
document.querySelectorAll(".admin-tab").forEach((button) => {
  button.addEventListener("click", () => switchAdminSection(button.dataset.adminSection));
});

ensureAdminCredentials();
addCase(els.suggestCaseEditor);
addCase(els.suggestCaseEditor);
updateAuthUi();
loadQuestions();
