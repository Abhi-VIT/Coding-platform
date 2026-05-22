# Python Compiler Lab

Python Compiler Lab is a local web application for practicing Python coding questions. It has an admin side for uploading questions and testcases, and a user side where students can select a question, write Python code, run it, and see which testcases pass.

## Features

- Home page with project details
- Login and sign up buttons
- Admin login with default credentials
- Admin question upload form
- Public and private testcase support
- User question selection page
- VS Code-style Python editor
- Smart editor features:
  - auto indentation after `:`
  - auto closing brackets and quotes
  - tab inserts 4 spaces
  - `Ctrl + Enter` runs code
- Python code runner with testcase checking
- Hidden/private testcase results show only pass or fail

## Admin Login

Default admin credentials:

```text
username: admin
password: admin123
```

If the login is `admin / admin123`, the app opens the admin page. Any other login or signup opens the user practice page.

## Project Structure

```text
Compiler-python/
├── server.py
├── README.md
├── data/
│   └── questions.json
└── static/
    ├── index.html
    ├── styles.css
    └── app.js
```

## How To Run

Open a terminal in the project folder and run:

```bash
python server.py
```

Then open:

```text
http://127.0.0.1:8000
```

## User Flow

1. Open the website.
2. Click `Practice`, `Login`, or `Sign up`.
3. Choose a question from the question list.
4. Read the problem statement and public testcases.
5. Write Python code in the editor.
6. Click `Run Testcases`.
7. Check which public and private tests passed.

The user can see public testcase input/output examples, but private testcase data is hidden.

## Admin Flow

1. Click `Login`.
2. Enter `admin` and `admin123`.
3. Open the admin upload page.
4. Add:
   - question title
   - difficulty
   - statement
   - starter code
   - testcase input
   - testcase output
5. Mark testcases as public or private.
6. Save the question.

By default, the first two testcases are public and the rest are private.

## Testcase System

Each question stores testcases in `data/questions.json`.

Example:

```json
{
  "input": "2 3\n",
  "output": "5\n",
  "isPublic": true
}
```

Public testcases are shown to the user as examples. Private testcases are used during judging but their input and expected output are not shown in the result screen.

## Compiler Logic

The compiler logic is built inside `server.py`. It is not a real compiler that converts Python into machine code. Instead, it works like an online judge:

1. The frontend sends the selected question ID and user code to `/api/run`.
2. The backend finds the matching question from `data/questions.json`.
3. For each testcase, the backend creates a temporary `.py` file.
4. It runs that file using the current Python interpreter.
5. The testcase input is passed to the program through standard input.
6. The program output is captured from standard output.
7. The captured output is compared with the expected output.
8. The backend returns pass/fail results to the frontend.

The main execution uses Python's `subprocess.run()`:

```python
completed = subprocess.run(
    [sys.executable, filename],
    input=testcase_input,
    capture_output=True,
    text=True,
    timeout=4,
)
```

This means:

- `sys.executable` runs the same Python installed on the system.
- `filename` is the temporary Python file containing the user's code.
- `input=testcase_input` gives testcase input to the program.
- `capture_output=True` collects output and errors.
- `timeout=4` stops programs that run too long.

## Output Checking

Before comparing output, the app normalizes it:

```python
def normalize_output(value):
    return "\n".join(line.rstrip() for line in value.strip().splitlines()).strip()
```

This removes extra spaces at the end of lines and ignores extra blank space at the beginning or end of the full output. The normalized user output is compared with the normalized expected output.

## Public vs Private Results

For public testcases, the result page can show:

- testcase number
- pass/fail
- input
- user's output

For private testcases, the result page only shows:

- hidden testcase number
- pass/fail
- message that input and expected output are hidden

The backend also avoids sending private testcase input and output to the user API response.

## Security Note

This project is suitable for local use, demos, and learning. Running user-submitted Python code can be dangerous on a public server because Python code can access files, run commands, or use system resources.

Before deploying publicly, the code runner should be placed inside a secure sandbox such as:

- Docker container with strict limits
- isolated virtual machine
- restricted execution service
- resource and filesystem permissions

## Current Seed Questions

The app includes five default questions:

1. Sum Two Numbers
2. Largest of Three
3. Palindrome Check
4. Factorial
5. Count Vowels

Each question has starter code, two public testcases, and at least one private testcase.

