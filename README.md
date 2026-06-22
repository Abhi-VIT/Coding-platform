# Python Compiler Lab

Python Compiler Lab is a serverless web-based platform designed for practicing Python coding questions. The application leverages **Pyodide** (a WebAssembly-based Python interpreter) to run Python code entirely in the browser, and **Firebase Firestore** to manage users, progress, submissions, leaderboard, suggestions, and question seeding.

## 🚀 Live Demo
Visit the live application here: [https://abhi-vit.github.io/Coding-platform/static/](https://abhi-vit.github.io/Coding-platform/static/)

---

## ✨ Features

- **In-Browser Execution**: Uses **Pyodide** to run user submissions directly in the browser's WebAssembly sandbox. Safe, fast, and does not require a remote code execution backend.
- **Firebase Backend Integration**:
  - Secure signup and login for learner accounts.
  - Seeding default questions and persisting custom questions added by admins.
  - Tracking solved status and saving the accepted user code for reference.
  - Real-time global **Leaderboard** based on solved questions counts.
- **VS Code-Style Python Editor**:
  - Driven by **CodeMirror** with Dracula theme.
  - Bracket-matching and auto-closing (parentheses, brackets, quotes).
  - Autocomplete hinting for standard Python keywords and local variables.
  - Indentation formatting helper.
  - Code resetting, clipboard copy, and dynamic **Input Template** insertion.
- **Dedicated Playgrounds & Practice Rooms**:
  - **Standard Practice**: Coding questions with public and hidden test cases.
  - **Company-specific practice**: A dedicated tab containing questions inspired by coding rounds at top tech firms (Google, Meta, Amazon, Apple, Netflix, Microsoft, etc.).
  - **Playground**: Run custom Python scripts with arbitrary inputs directly in the browser.
- **Community Contributions**:
  - Learners can suggest new questions containing problem descriptions, starter code, and test cases.
  - Suggestions go to a pending review queue visible to admins.
- **Admin Control Panel**:
  - Multi-tab admin tool for:
    - **Questions**: Adding new questions with custom testcases and deleting existing questions.
    - **Approvals**: Reviewing suggested questions and approving (automatically publishing them) or rejecting.
    - **Users**: Reviewing and managing registered users, with options to delete profiles.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: Standard HTML5, vanilla CSS3, and modern JavaScript.
- **Editor**: CodeMirror (v5.65.13) for syntax highlighting and autocomplete.
- **Database**: Firebase Firestore (Web SDK v12.13.0) for accounts, solved submissions, questions list, and suggestions.
- **Execution Sandbox**: Pyodide loaded via CDN.
- **Local Server**: A lightweight, Python-based local server `server.py` designed to serve static files.

---

## 📂 Project Structure

```text
Coding-platform/
├── LICENSE
├── README.md
├── server.py                # Local web server to serve the static folder
├── data/
│   └── questions.json       # Seed questions list
└── static/
    ├── index.html           # Main frontend entry point
    ├── styles.css           # Styling for all views and elements
    └── app.js               # Frontend routing, Firebase Firestore, Pyodide logic
```

---

## 👤 Accounts & Authentication

### 1. User Accounts
Users register and log in via the client-side login modal. User credentials and profile statuses are stored and authenticated against the Firebase `users` collection. 

### 2. Admin Account
Administrators log in using credentials verified against `localStorage` values.
* **Default Admin Username**: `admin`
* **Default Admin Password**: `admin123`
*(Admin credentials are set during application initialization if not already present in the browser's `localStorage`.)*

---

## 🖥️ How to Run Locally

### 1. Run the Python Web Server
Open a terminal in the repository root and launch the local web server:
```bash
python server.py
```
This runs a local threading HTTP server serving the `static` assets.

### 2. Access the Application
Open your web browser and navigate to:
```text
http://127.0.0.1:8000
```

---

## 🚀 Deploying to GitHub Pages

GitHub Pages serves static files directly from your repository root:
1. Push this project to your GitHub repository.
2. In the repository settings, go to the **Pages** tab.
3. Under **Build and deployment**, select:
   - Source: `Deploy from a branch`
   - Branch: `main` (or whichever branch holds your code)
   - Folder: `/ (root)`
4. Click **Save**.
5. Once built, the page will be live at `https://<your-username>.github.io/<your-repository-name>/`.
*(The root `index.html` file includes a meta redirect to `/static/` so that direct accesses are routed seamlessly.)*

---

## 📁 Firebase Collections Structure

The Firestore database uses the following schemas:

* **`questions`**: Stores custom questions added by admins or approved suggestions.
  - Schema: `{ id, title, difficulty, statement, starterCode, testcases: [{ input, output, isPublic }] }`
* **`suggestions`**: Stores community question suggestions.
  - Schema: `{ id, question, author, status ("pending" | "approved" | "rejected"), createdAt }`
* **`users`**: Manages user profiles.
  - Schema: `{ username, password, createdAt, active (boolean), role ("user" | "admin") }`
* **`solves`**: Tracks user progress.
  - Schema: `{ solved: [questionId], savedCode: { questionId: code } }`
* **`removedQuestions`**: Keeps track of questions deleted by the admin to filter them from the frontend merged list.
  - Schema: `{ id, removedAt, removedBy }`

---

## 🔒 Security & Safe Execution Note

By running code on the user's browser using **Pyodide** instead of a remote execution server, the application is inherently secure from Server-Side Request Forgery (SSRF), remote code execution vulnerabilities on the server host, and resource exhaustion. Each user's code executes in an isolated browser environment, protecting the backend completely.
