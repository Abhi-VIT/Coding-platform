from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse
import contextlib
import json
import os
import secrets
import subprocess
import sys
import tempfile


ROOT = Path(__file__).resolve().parent
STATIC_DIR = ROOT / "static"
DATA_DIR = ROOT / "data"
QUESTIONS_FILE = DATA_DIR / "questions.json"

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
SESSIONS = set()

SEED_QUESTIONS = [
    {
        "id": "sum-two-numbers",
        "title": "Sum Two Numbers",
        "difficulty": "Easy",
        "statement": "Read two integers and print their sum.",
        "starterCode": "# Read two integers and print their sum\n# Write your code here\n",
        "testcases": [
            {"input": "2 3\n", "output": "5\n", "isPublic": True},
            {"input": "-4 10\n", "output": "6\n", "isPublic": True},
            {"input": "100 250\n", "output": "350\n", "isPublic": False},
        ],
    },
    {
        "id": "largest-of-three",
        "title": "Largest of Three",
        "difficulty": "Easy",
        "statement": "Read three integers and print the largest value.",
        "starterCode": "# Read three integers and print the largest\n# Write your code here\n",
        "testcases": [
            {"input": "3 9 1\n", "output": "9\n", "isPublic": True},
            {"input": "-5 -2 -9\n", "output": "-2\n", "isPublic": True},
            {"input": "42 42 7\n", "output": "42\n", "isPublic": False},
        ],
    },
    {
        "id": "palindrome-check",
        "title": "Palindrome Check",
        "difficulty": "Easy",
        "statement": "Read a string and print YES if it is a palindrome, otherwise print NO.",
        "starterCode": "# Read a string and print YES or NO\n# Write your code here\n",
        "testcases": [
            {"input": "level\n", "output": "YES\n", "isPublic": True},
            {"input": "python\n", "output": "NO\n", "isPublic": True},
            {"input": "madam\n", "output": "YES\n", "isPublic": False},
        ],
    },
    {
        "id": "factorial",
        "title": "Factorial",
        "difficulty": "Medium",
        "statement": "Read a non-negative integer n and print n factorial.",
        "starterCode": "# Read n and print n factorial\n# Write your code here\n",
        "testcases": [
            {"input": "0\n", "output": "1\n", "isPublic": True},
            {"input": "5\n", "output": "120\n", "isPublic": True},
            {"input": "8\n", "output": "40320\n", "isPublic": False},
        ],
    },
    {
        "id": "count-vowels",
        "title": "Count Vowels",
        "difficulty": "Medium",
        "statement": "Read one line of text and print how many vowels it contains. Count both uppercase and lowercase vowels.",
        "starterCode": "# Read one line and print the number of vowels\n# Write your code here\n",
        "testcases": [
            {"input": "Hello World\n", "output": "3\n", "isPublic": True},
            {"input": "PYTHON\n", "output": "1\n", "isPublic": True},
            {"input": "Education\n", "output": "5\n", "isPublic": False},
        ],
    },
]


def ensure_data():
    DATA_DIR.mkdir(exist_ok=True)
    STATIC_DIR.mkdir(exist_ok=True)
    if not QUESTIONS_FILE.exists():
        QUESTIONS_FILE.write_text(json.dumps(SEED_QUESTIONS, indent=2), encoding="utf-8")


def read_questions():
    ensure_data()
    return json.loads(QUESTIONS_FILE.read_text(encoding="utf-8"))


def write_questions(questions):
    ensure_data()
    QUESTIONS_FILE.write_text(json.dumps(questions, indent=2), encoding="utf-8")


def public_testcases(question):
    return [
        {"input": case.get("input", ""), "output": case.get("output", "")}
        for index, case in enumerate(question.get("testcases", []))
        if case.get("isPublic", index < 2)
    ]


def slugify(value):
    slug = "".join(ch.lower() if ch.isalnum() else "-" for ch in value).strip("-")
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug or secrets.token_hex(4)


def normalize_output(value):
    return "\n".join(line.rstrip() for line in value.strip().splitlines()).strip()


def run_python(code, testcase_input):
    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False, encoding="utf-8") as handle:
        handle.write(code)
        filename = handle.name
    try:
        completed = subprocess.run(
            [sys.executable, filename],
            input=testcase_input,
            capture_output=True,
            text=True,
            timeout=4,
        )
        return {
            "stdout": completed.stdout,
            "stderr": completed.stderr,
            "returnCode": completed.returncode,
            "timedOut": False,
        }
    except subprocess.TimeoutExpired as exc:
        return {
            "stdout": exc.stdout or "",
            "stderr": "Execution timed out after 4 seconds.",
            "returnCode": None,
            "timedOut": True,
        }
    finally:
        with contextlib.suppress(OSError):
            os.unlink(filename)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/questions":
            questions = read_questions()
            public = [
                {
                    "id": q["id"],
                    "title": q["title"],
                    "difficulty": q["difficulty"],
                    "statement": q["statement"],
                    "starterCode": q.get("starterCode", ""),
                    "testcaseCount": len(q.get("testcases", [])),
                    "publicTestcaseCount": len(public_testcases(q)),
                    "publicTestcases": public_testcases(q),
                }
                for q in questions
            ]
            self.send_json(public)
            return
        if parsed.path == "/api/admin/questions":
            if not self.is_admin():
                self.send_json({"error": "Unauthorized"}, 401)
                return
            self.send_json(read_questions())
            return
        if parsed.path == "/":
            self.path = "/index.html"
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/admin/login":
            body = self.read_body()
            if body.get("username") == ADMIN_USERNAME and body.get("password") == ADMIN_PASSWORD:
                token = secrets.token_urlsafe(24)
                SESSIONS.add(token)
                self.send_json({"token": token, "username": ADMIN_USERNAME})
                return
            self.send_json({"error": "Invalid username or password"}, 401)
            return
        if parsed.path == "/api/admin/questions":
            if not self.is_admin():
                self.send_json({"error": "Unauthorized"}, 401)
                return
            body = self.read_body()
            question = self.validate_question(body)
            if "error" in question:
                self.send_json(question, 400)
                return
            questions = [q for q in read_questions() if q["id"] != question["id"]]
            questions.append(question)
            write_questions(questions)
            self.send_json(question, 201)
            return
        if parsed.path == "/api/run":
            body = self.read_body()
            question_id = body.get("questionId")
            code = body.get("code", "")
            question = next((q for q in read_questions() if q["id"] == question_id), None)
            if not question:
                self.send_json({"error": "Question not found"}, 404)
                return
            results = []
            for index, testcase in enumerate(question.get("testcases", []), start=1):
                run = run_python(code, testcase.get("input", ""))
                passed = (
                    run["returnCode"] == 0
                    and normalize_output(run["stdout"]) == normalize_output(testcase.get("output", ""))
                )
                is_public = testcase.get("isPublic", index <= 2)
                result = {
                    "index": index,
                    "passed": passed,
                    "isPublic": is_public,
                    "timedOut": run["timedOut"],
                }
                if is_public:
                    result.update(
                        {
                            "input": testcase.get("input", ""),
                            "actual": run["stdout"],
                            "stderr": run["stderr"],
                        }
                    )
                results.append(result)
            self.send_json({"passed": sum(1 for item in results if item["passed"]), "total": len(results), "results": results})
            return
        self.send_json({"error": "Not found"}, 404)

    def validate_question(self, body):
        title = str(body.get("title", "")).strip()
        statement = str(body.get("statement", "")).strip()
        difficulty = str(body.get("difficulty", "Easy")).strip() or "Easy"
        starter_code = str(body.get("starterCode", ""))
        testcases = body.get("testcases", [])
        if not title or not statement:
            return {"error": "Title and statement are required."}
        if not isinstance(testcases, list) or not testcases:
            return {"error": "At least one testcase is required."}
        clean_cases = []
        for index, testcase in enumerate(testcases):
            clean_cases.append(
                {
                    "input": str(testcase.get("input", "")),
                    "output": str(testcase.get("output", "")),
                    "isPublic": bool(testcase.get("isPublic", index < 2)),
                }
            )
        return {
            "id": body.get("id") or slugify(title),
            "title": title,
            "difficulty": difficulty,
            "statement": statement,
            "starterCode": starter_code,
            "testcases": clean_cases,
        }

    def read_body(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8") if length else "{}"
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {}

    def is_admin(self):
        auth = self.headers.get("Authorization", "")
        return auth.startswith("Bearer ") and auth.removeprefix("Bearer ") in SESSIONS

    def send_json(self, payload, status=200):
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


if __name__ == "__main__":
    ensure_data()
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Compiler website running at http://127.0.0.1:{port}")
    print(f"Admin login: {ADMIN_USERNAME} / {ADMIN_PASSWORD}")
    server.serve_forever()
