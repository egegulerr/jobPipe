# Security policy

## Supported version

Security fixes are made on the latest version of the default branch. Older
commits and forks are not supported.

## Reporting a vulnerability

Do not open a public issue for a vulnerability or exposed credential. Use the
repository's **Security → Report a vulnerability** option to create a private
security advisory. Include reproduction steps, impact, and any suggested fix.

If a provider key was exposed, revoke it with that provider immediately. A code
change or deleted commit does not make a published credential safe again.

## Security model

Job Pipe is a single-user local application. Its `dev` and `start` commands bind
to `127.0.0.1`, and the application does not provide authentication or
multi-user isolation. Do not expose it directly to a public network.

Provider credentials saved through setup are stored in the local SQLite
database, not encrypted by Job Pipe. Protect the `.jobpipe/` directory with
your operating-system account and disk encryption. Environment variables take
precedence over database values.

Generated documents and the profile image stay under `.jobpipe/` by default.
Job data and prompts are sent to the Apify and OpenRouter services configured by
the user, subject to those providers' security and retention policies.
