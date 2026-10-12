---
name: build-ticket
description: Build one already-specced AsikaGo ticket end to end, test first, then review and commit. Use when the user names a ticket ID (e.g. US-001-BE-02, AB#123) or pastes acceptance criteria to implement.
---

Build exactly one ticket. The spec already exists; your job is to make its
acceptance criteria true.

1. **Load the ticket.** Find it in `docs/AsikaGo_Sprint2_Ticket_Breakdown_v1.0.md`
   (or use what the user pasted). Read `README.md` and `docs/decisions.md`;
   `decisions.md` wins over every other doc. If a "Depends on" ticket isn't
   done, or an acceptance criterion is ambiguous, ask the user before coding.
   Done when you can list every acceptance criterion and the files you'll touch.

2. **Branch.** If on `main`, create `feature/<AB-id>-short-name` from a fresh
   `main`. Ask for the AB id if you don't have it.

3. **Build test first.** Use /tdd: one acceptance criterion per red-green
   slice. Backend tests go in `backend/tests/`. Keep code inside the ticket's
   feature folder (README → "Where code goes"). Done when every acceptance
   criterion has a passing test, or a note on why it's UI-only.

4. **Go green.** Run every step in `.github/workflows/ci.yml` locally and fix
   until all pass. Changed an endpoint? Rebuild the backend and run
   `npm run gen:api`, then commit both generated files.

5. **Review.** Use /code-review against `main`. Fix real findings.

6. **Commit** to the branch with `AB#<id>` in the message. Then report to the user:
   each acceptance criterion with its status, what they should click through
   in the running app, and anything you skipped. The user opens the PR.

Schema changes go through EF migrations only; never apply them to the dev DB
from a feature branch.
