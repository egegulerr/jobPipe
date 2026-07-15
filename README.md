# Job Pipe

Job Pipe is an open-source, single-user job-search workspace that runs on your
computer. It collects listings through your Apify account, evaluates matches
through your OpenRouter account, and generates tailored PDF and DOCX documents
locally.

## What it does

- Searches LinkedIn and Indeed through configurable Apify actors.
- Scores jobs against your profile with a configurable OpenRouter model.
- Generates tailored resumes and cover letters for matching jobs.
- Keeps its SQLite database, profile image, and generated documents on disk.
- Lets you inspect runs, matches, and documents from a local dashboard.

## Requirements

- Node.js 22.5 or newer
- pnpm 11.7
- Your own Apify and OpenRouter accounts

## Run locally

Clone the repository, enter its directory, then run:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://127.0.0.1:3000/setup>, enter your provider keys, complete your
profile, and start a run. No hosted database, authentication service, worker,
or object-storage account is required.

For a production build on the same machine:

```bash
pnpm build
pnpm start
```

## Configuration

Setup stores configuration in the local SQLite database. You can instead copy
`.env.example` to `.env.local`; environment variables take precedence over
saved values.

Tested actor defaults:

- LinkedIn: `curious_coder/linkedin-jobs-scraper`
- Indeed: `valig/indeed-jobs-scraper`

The actor IDs and OpenRouter matching and writing models are configurable. Job
Pipe does not enforce provider budgets or spending caps. You supply the
credentials and are responsible for all provider usage and costs.

Set `JOBPIPE_DATA_DIR` to change the data location. It defaults to `.jobpipe/`
and contains the SQLite database, uploaded profile image, and generated files.
Back up or remove that directory as you would any other local application data.

## Architecture

Job Pipe is one Next.js application:

1. Route handlers validate local UI requests.
2. Services apply run, profile, and document rules.
3. Repositories persist state in Node's built-in SQLite implementation.
4. The local run executor calls Apify and OpenRouter and writes generated
   documents to the local data directory.

The browser never receives saved provider credentials. Generated-file routes
only serve validated files from the configured local stores.

## Security and responsible use

Job Pipe has no authentication or multi-user isolation. Its scripts bind to
`127.0.0.1`; do not expose the application directly to a public network. Saved
provider credentials are write-only in the UI but are not encrypted in the
local SQLite database. Protect `.jobpipe/` and never commit it. See
[SECURITY.md](SECURITY.md) for reporting and threat-model details.

This project is not affiliated with or endorsed by Apify, LinkedIn, Indeed, or
OpenRouter. Automated access may be restricted by website terms, robots
policies, or applicable law. You are responsible for your actors, permissions,
data use, and provider accounts.

## Development

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

[MIT](LICENSE)
