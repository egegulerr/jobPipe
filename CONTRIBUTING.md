# Contributing

Thanks for helping improve Job Pipe.

## Development setup

You need Node.js 22.5 or newer and pnpm 11.7.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://127.0.0.1:3000/setup>. Provider credentials are only needed when
you run Apify or OpenRouter operations; the test suite does not require them.

Job Pipe writes local state to `.jobpipe/`. Keep that directory, environment
files, generated documents, resumes, and provider credentials out of commits.

## Before opening a pull request

Run the same checks as CI:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Keep changes focused. Add the smallest test that protects new non-trivial
behavior, and update the README when user-facing setup or behavior changes.

Use a private security advisory instead of a public issue for vulnerabilities
or accidentally exposed credentials. See [SECURITY.md](SECURITY.md).

Maintainers must follow [RELEASING.md](RELEASING.md); the historical private
repository must never be made public.
