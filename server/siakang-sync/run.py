"""CLI bridge between Laravel (PHP) and the `siakang-scrapling` library.

Reads a single JSON command from stdin and writes a single JSON result to
stdout: {"code": 200, "message": "...", "data": ...}

Commands:
    {"action": "ping"}                                  -> {"ok": true}
    {"action": "list_semesters", "email": "...", "password": "..."}
    {"action": "get_grades",    "email": "...", "password": "...", "semester": "20251"|null}
    {"action": "get_schedule",  "email": "...", "password": "...", "semester": "20251"|null}

Errors are surfaced as non-zero exit codes plus a rejected JSON body on stdout.
"""

import json
import os
import sys

from siakang import SiakangClient, api_response

# Only the header card is needed (kelas + dosen). Skip all detail tabs for speed.
_HEADER_ONLY_TABS = []


@api_response
def verify_credentials(email: str, password: str):
    """Confirm the credentials are valid by forcing a fresh login (no session
    file), so a wrong password is not masked by a previously saved session.
    Throws SiakangAuthError -> api_response turns it into code 401."""
    with SiakangClient(email, password) as client:
        client.list_semesters()

    return {"ok": True}


@api_response
def fetch_semesters(email: str, password: str):
    with SiakangClient(email, password, session_file=True) as client:
        return client.list_semesters()


@api_response
def fetch_grades(email: str, password: str, semester: str | None):
    with SiakangClient(email, password, session_file=True) as client:
        return client.get_grades(semester=semester)


@api_response
def fetch_schedule(email: str, password: str, semester: str | None):
    with SiakangClient(email, password, session_file=True) as client:
        # Pull the card list first (fast, no detail pages). get_schedule()
        # handles semester selection internally.
        rows = client.get_schedule(semester=semester)

        # Attach the header-only detail (kelas + dosen) per course in parallel.
        if rows:
            _attach_headers(client, rows)

        return rows


def _attach_headers(client, rows: list[dict]) -> None:
    """Attach header-only detail (kelas + dosen) per course.

    Header-only is a single page per course, so it is cheap. Uses the same
    parallel pattern the library uses for details: one throwaway session per
    thread, seeded with the main client's cookies, to avoid racing the live
    session while still being fast."""
    from concurrent.futures import ThreadPoolExecutor

    try:
        cookies = client._session._curl_session.cookies.get_dict()
    except Exception:
        cookies = {}

    def fetch(course: dict) -> dict:
        from scrapling.fetchers import FetcherSession
        sess = FetcherSession().__enter__()
        try:
            for name, value in cookies.items():
                sess._curl_session.cookies.set(name, value)
            return client.get_detail(course["schedule_id"], tab_keys=_HEADER_ONLY_TABS, session=sess)
        finally:
            sess.__exit__(None, None, None)

    with ThreadPoolExecutor(max_workers=min(4, len(rows))) as ex:
        for row, detail in zip(rows, ex.map(fetch, rows)):
            row["detail"] = detail


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        sys.stdout.write(json.dumps({"code": 400, "message": "Invalid JSON on stdin", "data": None}))
        return 1

    action = payload.get("action")
    if action == "ping":
        sys.stdout.write(json.dumps({"code": 200, "message": "ok", "data": {"ok": True}}))
        return 0

    email = payload.get("email") or os.getenv("EMAIL")
    password = payload.get("password") or os.getenv("PASSWORD")
    if not email or not password:
        sys.stdout.write(json.dumps({"code": 422, "message": "email and password are required", "data": None}))
        return 2

    semester = payload.get("semester") or None
    result = None

    if action == "list_semesters":
        result = fetch_semesters(email, password)
    elif action == "verify":
        result = verify_credentials(email, password)
    elif action == "get_grades":
        result = fetch_grades(email, password, semester)
    elif action == "get_schedule":
        result = fetch_schedule(email, password, semester)
    else:
        sys.stdout.write(json.dumps({"code": 400, "message": f"Unknown action: {action}", "data": None}))
        return 1

    sys.stdout.write(json.dumps(result.to_dict(), ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
