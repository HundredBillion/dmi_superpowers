Write the TSP tasks for the verification portion of the PRD below: the audit and the QA gate only, not the tasks that write the docs. This is a bounded planning exercise: do not read or write files, run commands, or ask questions; give the tasks in your reply; everything you need is here. Skip the grill-with-docs and execution-handoff steps — just give the tasks.

PRD goal: "Every customer API endpoint in the public docs is verified against the code: path, method, parameters, required/optional, success body, failure bodies and status codes. English and French pages."

Repo facts:
- Rails API. 34 endpoints under app/controllers/api/v2/. Each controller's strong-params method (`params.permit(...)`) lists the parameters the endpoint accepts.
- Some endpoints pass params into form objects in app/forms/; persistence goes through models in app/models/.
- A staging environment with an API token is available; requests can be sent with curl.
- Docs live in api_docs/source/en/*.md and api_docs/source/fr/*.md, one page per endpoint, each with a parameter table (name, type, required/optional, description) and example request/response blocks.
- Existing tooling: `bundle exec middleman build` (docs build), `bin/check-links`, `bin/check-translations` (same keys in en and fr).
