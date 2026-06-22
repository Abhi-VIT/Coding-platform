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
const SUBMISSIONS_KEY = "compilerLabSubmissions";
const LOCAL_QUESTIONS_KEY = "compilerLabQuestions";
const SUGGESTIONS_KEY = "compilerLabSuggestions";
const STATIC_QUESTIONS_URL = "../data/questions.json";
const ALL_COMPANIES = "All Companies";

const COMPANY_QUESTIONS = [
  makeCompanyQuestion("google-two-sum", "Google", "Two Sum Pair", "Easy", "Read n, then n integers, then a target. Print two zero-based indices whose values add to the target, or -1 if no pair exists.", "4\n2 7 11 15\n9\n", "0 1\n"),
  makeCompanyQuestion("google-valid-parentheses", "Google", "Valid Parentheses", "Easy", "Read a string containing brackets. Print YES if every opening bracket is closed in the correct order, otherwise print NO.", "({[]})\n", "YES\n"),
  makeCompanyQuestion("google-longest-substring", "Google", "Longest Unique Substring", "Medium", "Read a string and print the length of the longest substring without repeating characters.", "abcabcbb\n", "3\n"),
  makeCompanyQuestion("meta-merge-intervals", "Meta", "Merge Intervals", "Medium", "Read n intervals and print merged non-overlapping intervals sorted by start. Each output line should contain start and end.", "4\n1 3\n2 6\n8 10\n15 18\n", "1 6\n8 10\n15 18\n"),
  makeCompanyQuestion("meta-binary-tree-level-order", "Meta", "Level Order Values", "Medium", "Read a space-separated level-order binary tree where null means missing. Print each level on a new line.", "3 9 20 null null 15 7\n", "3\n9 20\n15 7\n"),
  makeCompanyQuestion("meta-move-zeroes", "Meta", "Move Zeroes", "Easy", "Read n and an array. Move all zeroes to the end while keeping non-zero order, then print the array.", "5\n0 1 0 3 12\n", "1 3 12 0 0\n"),
  makeCompanyQuestion("amazon-kth-largest", "Amazon", "Kth Largest Element", "Medium", "Read n, an array, and k. Print the kth largest value.", "6\n3 2 1 5 6 4\n2\n", "5\n"),
  makeCompanyQuestion("amazon-product-array", "Amazon", "Product Except Self", "Medium", "Read n and an array. Print the product of all elements except self for every position without using division.", "4\n1 2 3 4\n", "24 12 8 6\n"),
  makeCompanyQuestion("amazon-first-non-repeating", "Amazon", "First Non-Repeating Character", "Easy", "Read a string and print the first character that appears once, or -1 if none exists.", "swiss\n", "w\n"),
  makeCompanyQuestion("tcs-count-words", "TCS", "Count Words", "Easy", "Read one line and print how many words it contains.", "TCS digital coding round\n", "4\n"),
  makeCompanyQuestion("tcs-armstrong-number", "TCS", "Armstrong Number", "Easy", "Read an integer n. Print YES if it is an Armstrong number, otherwise print NO.", "153\n", "YES\n"),
  makeCompanyQuestion("tcs-series-sum", "TCS", "Series Sum", "Easy", "Read n and print the sum of squares from 1 to n.", "4\n", "30\n"),
  makeCompanyQuestion("infosys-anagram-check", "Infosys", "Anagram Check", "Easy", "Read two strings. Print YES if they are anagrams after ignoring case, otherwise print NO.", "listen\nsilent\n", "YES\n"),
  makeCompanyQuestion("infosys-second-largest", "Infosys", "Second Largest", "Easy", "Read n and an array. Print the second largest distinct value, or -1 if it does not exist.", "5\n7 3 9 9 5\n", "7\n"),
  makeCompanyQuestion("infosys-matrix-diagonal", "Infosys", "Matrix Diagonal Difference", "Easy", "Read n and an n x n matrix. Print the absolute difference between primary and secondary diagonal sums.", "3\n11 2 4\n4 5 6\n10 8 -12\n", "15\n"),
  makeCompanyQuestion("wipro-reverse-words", "Wipro", "Reverse Words", "Easy", "Read a sentence and print the words in reverse order.", "welcome to wipro\n", "wipro to welcome\n"),
  makeCompanyQuestion("wipro-gcd-lcm", "Wipro", "GCD and LCM", "Easy", "Read two integers and print their GCD and LCM separated by a space.", "12 18\n", "6 36\n"),
  makeCompanyQuestion("wipro-remove-duplicates", "Wipro", "Remove Duplicate Characters", "Easy", "Read a string and print it after removing repeated characters while keeping first occurrence order.", "programming\n", "progamin\n"),
  makeCompanyQuestion("apple-rotate-array", "Apple", "Rotate Array", "Medium", "Read n, an array, and k. Rotate the array right by k positions and print it.", "5\n1 2 3 4 5\n2\n", "4 5 1 2 3\n"),
  makeCompanyQuestion("apple-valid-palindrome", "Apple", "Clean Palindrome", "Easy", "Read a string. Considering only alphanumeric characters and ignoring case, print YES if it is a palindrome.", "A man, a plan, a canal: Panama\n", "YES\n"),
  makeCompanyQuestion("apple-stock-profit", "Apple", "Best Time to Buy Stock", "Easy", "Read n and daily prices. Print the maximum profit from one buy and one sell.", "6\n7 1 5 3 6 4\n", "5\n"),
  makeCompanyQuestion("netflix-top-k-frequency", "Netflix", "Top K Frequent Numbers", "Medium", "Read n, an array, and k. Print the k most frequent numbers sorted by frequency descending then value ascending.", "6\n1 1 1 2 2 3\n2\n", "1 2\n"),
  makeCompanyQuestion("netflix-longest-repeating", "Netflix", "Longest Repeating Run", "Easy", "Read a string and print the length of the longest run of the same consecutive character.", "aaabbccccd\n", "4\n"),
  makeCompanyQuestion("netflix-watch-history", "Netflix", "Unique Watch Order", "Easy", "Read n and n movie IDs. Print unique IDs in first-watch order.", "7\nm1 m2 m1 m3 m2 m4 m4\n", "m1 m2 m3 m4\n"),
  makeCompanyQuestion("alphabet-word-ladder-lite", "Alphabet", "One Edit Apart", "Medium", "Read two words. Print YES if they are zero or one edit apart by insert, delete, or replace.", "pale\nple\n", "YES\n"),
  makeCompanyQuestion("alphabet-search-prefix", "Alphabet", "Prefix Match Count", "Easy", "Read n words, then a prefix. Print how many words start with that prefix.", "5\napp apple apply bat ape\napp\n", "3\n"),
  makeCompanyQuestion("alphabet-isomorphic", "Alphabet", "Isomorphic Strings", "Medium", "Read two strings. Print YES if characters can be mapped one-to-one from the first string to the second.", "egg\nadd\n", "YES\n"),
  makeCompanyQuestion("microsoft-missing-number", "Microsoft", "Missing Number", "Easy", "Read n and n distinct numbers from 0 to n. Print the missing number.", "3\n3 0 1\n", "2\n"),
  makeCompanyQuestion("microsoft-spiral-matrix", "Microsoft", "Spiral Matrix", "Medium", "Read rows, columns, and a matrix. Print values in spiral order.", "3 3\n1 2 3\n4 5 6\n7 8 9\n", "1 2 3 6 9 8 7 4 5\n"),
  makeCompanyQuestion("adobe-compress-string", "Adobe", "Compress String", "Easy", "Read a string and print run-length encoding using character followed by count.", "aaabbc\n", "a3b2c1\n"),
  makeCompanyQuestion("oracle-balanced-array", "Oracle", "Equilibrium Index", "Medium", "Read n and an array. Print the first index where left sum equals right sum, or -1.", "5\n1 3 5 2 2\n", "2\n"),
  makeCompanyQuestion("ibm-binary-search", "IBM", "Binary Search", "Easy", "Read n, a sorted array, and target. Print the target index, or -1.", "5\n1 3 5 7 9\n7\n", "3\n"),
  makeCompanyQuestion("flipkart-cart-total", "Flipkart", "Cart Discount", "Easy", "Read n prices. Apply 10 percent discount if total is at least 1000. Print the final integer total.", "3\n300 400 500\n", "1080\n"),
  makeCompanyQuestion("uber-min-platforms", "Uber", "Minimum Platforms", "Medium", "Read n, arrival times, and departure times as integers. Print the minimum platforms needed.", "6\n900 940 950 1100 1500 1800\n910 1200 1120 1130 1900 2000\n", "3\n"),
  makeCompanyQuestion("salesforce-common-elements", "Salesforce", "Common Sorted Elements", "Easy", "Read sizes and two sorted arrays. Print common distinct elements.", "5 4\n1 2 2 3 4\n2 2 4 6\n", "2 4\n"),
  makeCompanyQuestion("paytm-currency-count", "Paytm", "Minimum Notes", "Easy", "Read an amount and print the minimum number of Indian currency notes using 2000, 500, 200, 100, 50, 20, 10, 5, 2, 1.", "786\n", "6\n")
];

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
  companyFilter: ALL_COMPANIES,
  questionSearch: "",
  companySearch: "",
  userSolved: [],
  userSavedCode: {},
};

const els = {
  homeLogo: document.querySelector("#homeLogo"),
  homeNav: document.querySelector("#homeNav"),
  userNav: document.querySelector("#userNav"),
  companyNav: document.querySelector("#companyNav"),
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
  companyView: document.querySelector("#companyView"),
  playgroundView: document.querySelector("#playgroundView"),
  leaderboardView: document.querySelector("#leaderboardView"),
  suggestView: document.querySelector("#suggestView"),
  adminView: document.querySelector("#adminView"),
  questions: document.querySelector("#questions"),
  questionSearch: document.querySelector("#questionSearch"),
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
  functionTemplate: document.querySelector("#functionTemplate"),
  viewSavedCode: document.querySelector("#viewSavedCode"),
  formatCode: document.querySelector("#formatCode"),
  copyCode: document.querySelector("#copyCode"),
  runCode: document.querySelector("#runCode"),
  runSummary: document.querySelector("#runSummary"),
  results: document.querySelector("#results"),
  savedCodePanel: document.querySelector("#savedCodePanel"),
  savedCodeStatus: document.querySelector("#savedCodeStatus"),
  savedCodeOutput: document.querySelector("#savedCodeOutput"),
  companyFilters: document.querySelector("#companyFilters"),
  companySearch: document.querySelector("#companySearch"),
  companyQuestions: document.querySelector("#companyQuestions"),
  companyTitle: document.querySelector("#companyTitle"),
  companyCount: document.querySelector("#companyCount"),
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
  const views = ["home", "user", "company", "playground", "leaderboard", "suggest", "admin"];
  views.forEach((name) => {
    els[`${name}View`].classList.toggle("active", name === view);
  });
  const navs = {
    home: els.homeNav,
    user: els.userNav,
    company: els.companyNav,
    playground: els.playgroundNav,
    leaderboard: els.leaderboardNav,
    suggest: els.suggestNav,
  };
  Object.entries(navs).forEach(([name, button]) => button.classList.toggle("active", name === view));
  if (view === "user" && !state.practiceEditor) initPracticeEditor();
  if (view === "company") renderCompanyQuestions();
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
    autoCloseBrackets: true,
    extraKeys: { "Ctrl-Space": "autocomplete" },
  });
  attachPythonHints(state.practiceEditor);
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
    autoCloseBrackets: true,
    extraKeys: { "Ctrl-Space": "autocomplete" },
  });
  attachPythonHints(state.playgroundEditor);
}

function attachPythonHints(editor) {
  let hintTimer = null;
  editor.on("inputRead", (cm, event) => {
    if (!event.text.join("").match(/[A-Za-z_]/)) return;
    if (cm.state.completionActive) return;
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => {
      if (!cm.state.completionActive) {
        cm.showHint({
          hint: getPythonHints,
          completeSingle: false,
        });
      }
    }, 150);
  });
}

function getPythonHints(editor) {
  const cursor = editor.getCursor();
  const token = editor.getTokenAt(cursor);
  const start = token.start;
  const end = cursor.ch;
  const current = token.string.slice(0, end - start);
  const code = editor.getValue();
  const keywords = [
    "if", "elif", "else", "for", "while", "def", "return", "class", "try", "except", "finally",
    "with", "as", "import", "from", "in", "not", "and", "or", "True", "False", "None", "break",
    "continue", "pass", "print", "input", "range", "len", "map", "list", "set", "dict", "int",
    "str", "float", "sum", "max", "min", "sorted", "enumerate", "zip", "append", "split", "join"
  ];
  const variables = [...code.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\s*(?==|\(|,|:)/g)].map((match) => match[1]);
  const suggestions = [...new Set([...keywords, ...variables])]
    .filter((word) => word !== current && word.startsWith(current))
    .sort();
  return {
    list: suggestions,
    from: CodeMirror.Pos(cursor.line, start),
    to: CodeMirror.Pos(cursor.line, end),
  };
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
  } catch (e) { console.error(e); }

  let approvedSuggestions = [];
  try {
    const sSnap = await getDocs(collection(db, "suggestions"));
    approvedSuggestions = sSnap.docs.map(d => d.data()).filter((item) => item.status === "approved");
  } catch (e) { console.error(e); }

  let removedQuestionIds = [];
  try {
    const removedSnap = await getDocs(collection(db, "removedQuestions"));
    removedQuestionIds = removedSnap.docs.map((d) => d.id);
  } catch (e) { console.error(e); }

  const merged = [...seedQuestions, ...COMPANY_QUESTIONS, ...localQuestions, ...approvedSuggestions.map((item) => item.question)];
  state.fullQuestions = dedupeQuestions(merged).filter((question) => !removedQuestionIds.includes(question.id));
  state.questions = state.fullQuestions.map(toPublicQuestion);
  renderCompanyQuestions();
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
    company: question.company || "",
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

function getQuestionNumber(questionId) {
  return state.questions.findIndex((question) => question.id === questionId) + 1;
}

function matchesQuestionSearch(question, query) {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return true;
  const questionNumber = String(getQuestionNumber(question.id));
  const searchable = [
    questionNumber,
    question.title,
    question.difficulty,
    question.company,
    question.statement,
  ]
    .join(" ")
    .toLowerCase();
  return searchable.includes(cleanQuery);
}

function renderQuestions() {
  const visibleQuestions = state.questions.filter((question) => matchesQuestionSearch(question, state.questionSearch));
  els.questionCount.textContent = `${visibleQuestions.length}/${state.questions.length} available`;
  els.questions.innerHTML = visibleQuestions.length
    ? visibleQuestions.map((q) => {
      const solved = state.userSolved.includes(q.id);
      const questionNumber = getQuestionNumber(q.id);
      return `
        <button class="question-card ${q.id === state.selectedId ? "active" : ""}" type="button" data-id="${q.id}">
          ${solved ? '<span class="solved-pill">Done</span>' : ""}
          <strong><span class="question-number">${questionNumber}.</span> ${escapeHtml(q.title)}</strong>
          ${q.company ? `<span class="badge company-badge">${escapeHtml(q.company)}</span>` : ""}
          <span class="badge">${escapeHtml(q.difficulty)}</span>
          <span class="badge accent">${q.publicTestcaseCount} public</span>
          <span class="badge private">${q.testcaseCount - q.publicTestcaseCount} private</span>
        </button>
      `;
    })
      .join("")
    : '<p class="hint">No matching questions.</p>';
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
  els.savedCodePanel.classList.add("hidden");
  els.savedCodeOutput.textContent = "";
  els.savedCodeStatus.textContent = state.userSolved.includes(question.id) ? "Solved" : "Not solved yet";
  renderQuestions();
  updateEditorMeta();
}


const QUESTION_TEMPLATES = {
  // ── Static questions ──────────────────────────────────────────────────────
  "sum-two-numbers": `# Sum Two Numbers
# Input: two integers on one line
# Example: 2 3

a, b = map(int, input().split())

# Write your solution here
`,

  "largest-of-three": `# Largest of Three
# Input: three integers on one line
# Example: 3 9 1

a, b, c = map(int, input().split())

# Write your solution here
`,

  "palindrome-check": `# Palindrome Check
# Input: a string on one line
# Example: level

s = input()

# Write your solution here
`,

  "factorial": `# Factorial
# Input: a non-negative integer n
# Example: 5

n = int(input())

# Write your solution here
`,

  "count-vowels": `# Count Vowels
# Input: one line of text
# Example: Hello World

line = input()

# Write your solution here
`,

  // ── Google ────────────────────────────────────────────────────────────────
  "google-two-sum": `# Two Sum Pair
# Input:
#   Line 1: n (number of integers)
#   Line 2: n space-separated integers
#   Line 3: target value
# Example: 4 / 2 7 11 15 / 9

n = int(input())
arr = list(map(int, input().split()))
target = int(input())

# Write your solution here
`,

  "google-valid-parentheses": `# Valid Parentheses
# Input: a string of brackets on one line
# Example: ({[]})

s = input()

# Write your solution here
`,

  "google-longest-substring": `# Longest Unique Substring
# Input: a string on one line
# Example: abcabcbb

s = input()

# Write your solution here
`,

  // ── Meta ──────────────────────────────────────────────────────────────────
  "meta-merge-intervals": `# Merge Intervals
# Input:
#   Line 1: n (number of intervals)
#   Next n lines: start end
# Example: 4 / 1 3 / 2 6 / 8 10 / 15 18

n = int(input())
intervals = [list(map(int, input().split())) for _ in range(n)]

# Write your solution here
`,

  "meta-binary-tree-level-order": `# Level Order Values
# Input: space-separated level-order nodes (null for missing) on one line
# Example: 3 9 20 null null 15 7

vals = input().split()

# Write your solution here
`,

  "meta-move-zeroes": `# Move Zeroes
# Input:
#   Line 1: n
#   Line 2: n space-separated integers
# Example: 5 / 0 1 0 3 12

n = int(input())
arr = list(map(int, input().split()))

# Write your solution here
`,

  // ── Amazon ────────────────────────────────────────────────────────────────
  "amazon-kth-largest": `# Kth Largest Element
# Input:
#   Line 1: n
#   Line 2: n space-separated integers
#   Line 3: k
# Example: 6 / 3 2 1 5 6 4 / 2

n = int(input())
arr = list(map(int, input().split()))
k = int(input())

# Write your solution here
`,

  "amazon-product-array": `# Product Except Self
# Input:
#   Line 1: n
#   Line 2: n space-separated integers
# Example: 4 / 1 2 3 4

n = int(input())
arr = list(map(int, input().split()))

# Write your solution here
`,

  "amazon-first-non-repeating": `# First Non-Repeating Character
# Input: a string on one line
# Example: swiss

s = input()

# Write your solution here
`,

  // ── TCS ───────────────────────────────────────────────────────────────────
  "tcs-count-words": `# Count Words
# Input: one line of text
# Example: TCS digital coding round

line = input()

# Write your solution here
`,

  "tcs-armstrong-number": `# Armstrong Number
# Input: an integer n on one line
# Example: 153

n = input().strip()

# Write your solution here
`,

  "tcs-series-sum": `# Series Sum
# Input: integer n on one line
# Example: 4

n = int(input())

# Write your solution here
`,

  // ── Infosys ───────────────────────────────────────────────────────────────
  "infosys-anagram-check": `# Anagram Check
# Input:
#   Line 1: first string
#   Line 2: second string
# Example: listen / silent

a = input()
b = input()

# Write your solution here
`,

  "infosys-second-largest": `# Second Largest
# Input:
#   Line 1: n
#   Line 2: n space-separated integers
# Example: 5 / 7 3 9 9 5

n = int(input())
arr = list(map(int, input().split()))

# Write your solution here
`,

  "infosys-matrix-diagonal": `# Matrix Diagonal Difference
# Input:
#   Line 1: n (matrix size)
#   Next n lines: n space-separated integers each
# Example: 3 / 11 2 4 / 4 5 6 / 10 8 -12

n = int(input())
matrix = [list(map(int, input().split())) for _ in range(n)]

# Write your solution here
`,

  // ── Wipro ─────────────────────────────────────────────────────────────────
  "wipro-reverse-words": `# Reverse Words
# Input: a sentence on one line
# Example: welcome to wipro

words = input().split()

# Write your solution here
`,

  "wipro-gcd-lcm": `# GCD and LCM
# Input: two integers on one line
# Example: 12 18

a, b = map(int, input().split())

# Write your solution here
`,

  "wipro-remove-duplicates": `# Remove Duplicate Characters
# Input: a string on one line
# Example: programming

s = input()

# Write your solution here
`,

  // ── Apple ─────────────────────────────────────────────────────────────────
  "apple-rotate-array": `# Rotate Array
# Input:
#   Line 1: n
#   Line 2: n space-separated integers
#   Line 3: k (rotate right by k)
# Example: 5 / 1 2 3 4 5 / 2

n = int(input())
arr = list(map(int, input().split()))
k = int(input())

# Write your solution here
`,

  "apple-valid-palindrome": `# Clean Palindrome
# Input: a string on one line (may contain spaces/punctuation)
# Example: A man, a plan, a canal: Panama

s = input()

# Write your solution here
`,

  "apple-stock-profit": `# Best Time to Buy Stock
# Input:
#   Line 1: n
#   Line 2: n space-separated prices
# Example: 6 / 7 1 5 3 6 4

n = int(input())
prices = list(map(int, input().split()))

# Write your solution here
`,

  // ── Netflix ───────────────────────────────────────────────────────────────
  "netflix-top-k-frequency": `# Top K Frequent Numbers
# Input:
#   Line 1: n
#   Line 2: n space-separated integers
#   Line 3: k
# Example: 6 / 1 1 1 2 2 3 / 2

n = int(input())
arr = list(map(int, input().split()))
k = int(input())

# Write your solution here
`,

  "netflix-longest-repeating": `# Longest Repeating Run
# Input: a string on one line
# Example: aaabbccccd

s = input()

# Write your solution here
`,

  "netflix-watch-history": `# Unique Watch Order
# Input:
#   Line 1: n
#   Line 2: n space-separated movie IDs
# Example: 7 / m1 m2 m1 m3 m2 m4 m4

n = int(input())
ids = input().split()

# Write your solution here
`,

  // ── Alphabet ──────────────────────────────────────────────────────────────
  "alphabet-word-ladder-lite": `# One Edit Apart
# Input:
#   Line 1: first word
#   Line 2: second word
# Example: pale / ple

a = input()
b = input()

# Write your solution here
`,

  "alphabet-search-prefix": `# Prefix Match Count
# Input:
#   Line 1: n
#   Line 2: n space-separated words
#   Line 3: prefix
# Example: 5 / app apple apply bat ape / app

n = int(input())
words = input().split()
prefix = input()

# Write your solution here
`,

  "alphabet-isomorphic": `# Isomorphic Strings
# Input:
#   Line 1: first string
#   Line 2: second string
# Example: egg / add

a = input()
b = input()

# Write your solution here
`,

  // ── Microsoft ─────────────────────────────────────────────────────────────
  "microsoft-missing-number": `# Missing Number
# Input:
#   Line 1: n
#   Line 2: n space-separated distinct integers from 0 to n
# Example: 3 / 3 0 1

n = int(input())
arr = list(map(int, input().split()))

# Write your solution here
`,

  "microsoft-spiral-matrix": `# Spiral Matrix
# Input:
#   Line 1: rows cols
#   Next rows lines: cols space-separated integers each
# Example: 3 3 / 1 2 3 / 4 5 6 / 7 8 9

rows, cols = map(int, input().split())
matrix = [list(map(int, input().split())) for _ in range(rows)]

# Write your solution here
`,

  // ── Adobe ─────────────────────────────────────────────────────────────────
  "adobe-compress-string": `# Compress String
# Input: a string on one line
# Example: aaabbc

s = input()

# Write your solution here
`,

  // ── Oracle ────────────────────────────────────────────────────────────────
  "oracle-balanced-array": `# Equilibrium Index
# Input:
#   Line 1: n
#   Line 2: n space-separated integers
# Example: 5 / 1 3 5 2 2

n = int(input())
arr = list(map(int, input().split()))

# Write your solution here
`,

  // ── IBM ───────────────────────────────────────────────────────────────────
  "ibm-binary-search": `# Binary Search
# Input:
#   Line 1: n
#   Line 2: n sorted space-separated integers
#   Line 3: target
        result = mid; break
    elif arr[mid] < target:
        lo = mid + 1
    else:
        hi = mid - 1
print(result)
`,

  // ── Flipkart ──────────────────────────────────────────────────────────────
  "flipkart-cart-total": `# Cart Discount
# Input:
#   Line 1: n
#   Line 2: n space-separated prices
# Example: 3 / 300 400 500

n = int(input())
prices = list(map(int, input().split()))

# Write your solution here
`,

  // ── Uber ──────────────────────────────────────────────────────────────────
  "uber-min-platforms": `# Minimum Platforms
# Input:
#   Line 1: n
#   Line 2: n arrival times (integers)
#   Line 3: n departure times (integers)
# Example: 6 / 900 940 950 1100 1500 1800 / 910 1200 1120 1130 1900 2000

n = int(input())
arrivals = list(map(int, input().split()))
departures = list(map(int, input().split()))

# Write your solution here
`,

  // ── Salesforce ────────────────────────────────────────────────────────────
  "salesforce-common-elements": `# Common Sorted Elements
# Input:
#   Line 1: m n (sizes of two arrays)
#   Line 2: m sorted integers
#   Line 3: n sorted integers
# Example: 5 4 / 1 2 2 3 4 / 2 2 4 6

m, n = map(int, input().split())
a = list(map(int, input().split()))
b = list(map(int, input().split()))

# Write your solution here
`,

  // ── Paytm ─────────────────────────────────────────────────────────────────
  "paytm-currency-count": `# Minimum Notes
# Input: an integer amount on one line
# Example: 786

amount = int(input())

# Write your solution here
`,
};

function insertFunctionTemplate() {
  const question = state.questions.find((item) => item.id === state.selectedId);
  if (!question) return;

  let template = QUESTION_TEMPLATES[question.id];

  if (!template) {
    // Generic fallback for any question not in the map
    const exampleLines = (question.publicTestcases?.[0]?.input || "").trimEnd().split("\n");
    template = `# ${question.title}
# Use input() to read each line of input.
# Example input:
${exampleLines.map((line) => `# ${line}`).join("\n")}

def solve():
    # Read input using input() — one call per line.
    # e.g. n = int(input())
    #      arr = list(map(int, input().split()))
    pass

solve()
`;
  }

  if (state.practiceEditor) {
    state.practiceEditor.setValue(template);
    state.practiceEditor.focus();
  } else {
    els.codeEditor.value = template;
  }
  updateEditorMeta();
  els.runSummary.textContent = "Input template inserted";
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
    if (data.passed === data.total) {
      await recordSolve(state.currentUser.username, question.id, state.practiceEditor ? state.practiceEditor.getValue() : els.codeEditor.value);
      els.savedCodeStatus.textContent = "Solved";
    }
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
  loadCurrentUserProgress();
}

function logout() {
  state.currentUser = null;
  state.userSolved = [];
  state.userSavedCode = {};
  localStorage.removeItem(SESSION_KEY);
  updateAuthUi();
  renderQuestions();
  renderCompanyQuestions();
  switchView("home");
}

function updateAuthUi() {
  const signedIn = Boolean(state.currentUser);
  els.loginOpen.classList.toggle("hidden", signedIn);
  els.signupOpen.classList.toggle("hidden", signedIn);
  els.logoutButton.classList.toggle("hidden", !signedIn);
  els.signedInStatus.textContent = signedIn ? state.currentUser.username : "Guest";
}

async function loadCurrentUserProgress() {
  state.userSolved = [];
  state.userSavedCode = {};
  if (!state.currentUser || state.currentUser.role !== "user") {
    renderQuestions();
    renderCompanyQuestions();
    return;
  }
  try {
    const snap = await getDoc(doc(db, "solves", state.currentUser.username.toLowerCase()));
    if (snap.exists()) {
      state.userSolved = snap.data().solved || [];
      state.userSavedCode = snap.data().savedCode || {};
    }
  } catch (error) {
    console.error(error);
  }
  renderQuestions();
  renderCompanyQuestions();
}

function showSavedCode() {
  const code = state.userSavedCode[state.selectedId];
  els.savedCodePanel.classList.remove("hidden");
  if (!state.currentUser || state.currentUser.role !== "user") {
    els.savedCodeStatus.textContent = "Login required";
    els.savedCodeOutput.textContent = "Login with your learner account to view saved accepted code.";
    return;
  }
  if (!code) {
    els.savedCodeStatus.textContent = "No accepted code";
    els.savedCodeOutput.textContent = "Solve this question first. Your accepted code will be saved here.";
    return;
  }
  els.savedCodeStatus.textContent = "Accepted submission";
  els.savedCodeOutput.textContent = code;
}

async function recordSolve(username, questionId, code) {
  const solveRef = doc(db, "solves", username.toLowerCase());
  const docSnap = await getDoc(solveRef);
  let solvedList = [];
  let savedCode = {};
  if (docSnap.exists()) {
    solvedList = docSnap.data().solved || [];
    savedCode = docSnap.data().savedCode || {};
  }
  if (!solvedList.includes(questionId)) {
    solvedList.push(questionId);
  }
  savedCode[questionId] = code;
  await setDoc(solveRef, { solved: solvedList, savedCode });
  state.userSolved = solvedList;
  state.userSavedCode = savedCode;
  renderQuestions();
  renderCompanyQuestions();
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
  } catch (e) {
    els.leaderboardRows.innerHTML = '<p class="hint">Error loading leaderboard.</p>';
  }
}

function renderCompanyQuestions() {
  if (!els.companyFilters || !els.companyQuestions) return;
  const companyQuestions = state.questions.filter((question) => question.company);
  const searchedCompanyQuestions = companyQuestions.filter((question) => matchesQuestionSearch(question, state.companySearch));
  const companies = [ALL_COMPANIES, ...new Set(companyQuestions.map((question) => question.company).sort())];
  els.companyCount.textContent = `${searchedCompanyQuestions.length}/${companyQuestions.length} questions`;
  els.companyFilters.innerHTML = companies
    .map(
      (company) => `
        <button class="question-card ${state.companyFilter === company ? "active" : ""}" type="button" data-company="${escapeHtml(company)}">
          <strong>${escapeHtml(company)}</strong>
          <span class="badge">${company === ALL_COMPANIES ? searchedCompanyQuestions.length : searchedCompanyQuestions.filter((question) => question.company === company).length} questions</span>
        </button>
      `,
    )
    .join("");

  const visibleQuestions =
    state.companyFilter === ALL_COMPANIES
      ? searchedCompanyQuestions
      : searchedCompanyQuestions.filter((question) => question.company === state.companyFilter);

  els.companyTitle.textContent = state.companyFilter === ALL_COMPANIES ? "All Company Questions" : `${state.companyFilter} Questions`;
  els.companyQuestions.innerHTML = visibleQuestions.length
    ? visibleQuestions
      .map((question) => {
        const solved = state.userSolved.includes(question.id);
        const questionNumber = getQuestionNumber(question.id);
        return `
            <article class="company-card">
              <div>
                <span class="badge company-badge">${escapeHtml(question.company)}</span>
                <span class="badge">${escapeHtml(question.difficulty)}</span>
                ${solved ? '<span class="solved-pill inline">Done</span>' : ""}
              </div>
              <h3><span class="question-number">${questionNumber}.</span> ${escapeHtml(question.title)}</h3>
              <p>${escapeHtml(question.statement)}</p>
              <button class="primary-button compact" type="button" data-practice-question="${escapeHtml(question.id)}">Practice</button>
            </article>
          `;
      })
      .join("")
    : '<p class="hint">No company questions found.</p>';
}

function makeCompanyQuestion(id, company, title, difficulty, statement, input, output) {
  return {
    id,
    company,
    title,
    difficulty,
    statement,
    starterCode: "# Write your Python solution here\n",
    testcases: [
      { input, output, isPublic: true },
      { input, output, isPublic: false },
    ],
  };
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
    await deleteDoc(doc(db, "removedQuestions", question.id));
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
        (q, index) => `
          <div class="admin-question">
            <div>
              <strong><span class="question-number">${index + 1}.</span> ${escapeHtml(q.title)}</strong>
              <span>${q.company ? `${escapeHtml(q.company)} - ` : ""}${escapeHtml(q.difficulty)} - ${(q.testcases || []).length} tests</span>
            </div>
            <button class="ghost-button compact danger-button" type="button" data-remove-question="${escapeHtml(q.id)}">Remove</button>
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
  } catch (e) {
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
  } catch (e) {
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
    await deleteDoc(doc(db, "removedQuestions", suggestion.question.id));
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

async function removeQuestion(questionId) {
  els.adminStatus.textContent = "Removing...";
  try {
    await setDoc(doc(db, "removedQuestions", questionId), {
      id: questionId,
      removedAt: new Date().toISOString(),
      removedBy: state.currentUser?.username || "admin",
    });
    await deleteDoc(doc(db, "questions", questionId));
    state.fullQuestions = state.fullQuestions.filter((question) => question.id !== questionId);
    state.questions = state.questions.filter((question) => question.id !== questionId);
    if (state.selectedId === questionId) {
      state.selectedId = state.questions[0]?.id || null;
      selectQuestion(state.selectedId);
    }
    renderQuestions();
    renderCompanyQuestions();
    renderAdminQuestions();
    els.adminStatus.textContent = "Question removed";
  } catch (error) {
    els.adminStatus.textContent = error.message;
  }
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
els.companyNav.addEventListener("click", () => switchView("company"));
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
els.questionSearch?.addEventListener("input", () => {
  state.questionSearch = els.questionSearch.value;
  renderQuestions();
});
els.companyFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-company]");
  if (!button) return;
  state.companyFilter = button.dataset.company;
  renderCompanyQuestions();
});
els.companySearch?.addEventListener("input", () => {
  state.companySearch = els.companySearch.value;
  renderCompanyQuestions();
});
els.companyQuestions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-practice-question]");
  if (!button) return;
  state.selectedId = button.dataset.practiceQuestion;
  switchView("user");
  selectQuestion(state.selectedId);
});
els.resetCode.addEventListener("click", () => selectQuestion(state.selectedId));
els.functionTemplate?.addEventListener("click", insertFunctionTemplate);
els.viewSavedCode.addEventListener("click", showSavedCode);
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
els.adminQuestions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-question]");
  if (button) removeQuestion(button.dataset.removeQuestion);
});
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
loadCurrentUserProgress();
