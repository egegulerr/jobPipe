# Publishing the open-source repository

The current private repository contains legacy history that must never be made
public. Publish a snapshot into a new repository with a new `.git` directory.
Never rename the old remote, reuse its Git directory, or push it with `--mirror`.

## 1. Prepare the private source snapshot

Commit and review the intended release on the private repository, then run:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm licenses list --prod
```

Verify that `.jobpipe/`, environment files, resumes, generated documents, and
other personal files are absent from `git ls-files`.

## 2. Create an unrelated Git history

From the private repository:

```bash
release_dir="$(mktemp -d)"
git archive HEAD | tar -x -C "$release_dir"
cd "$release_dir"

gitleaks dir . --redact
trufflehog filesystem . --no-update --fail

git init -b main
git add .

test -n "$PUBLIC_GIT_NAME"
test -n "$PUBLIC_GIT_EMAIL"
git config user.name "$PUBLIC_GIT_NAME"
git config user.email "$PUBLIC_GIT_EMAIL"
git commit -m "Initial open-source release"

test "$(git rev-list --all --count)" -eq 1
gitleaks git . --redact
trufflehog git "file://$(pwd)" --no-update --fail
```

The release repository must contain exactly one root commit before publication.
Use a public or GitHub-provided no-reply email, not a private or employer email.
Inspect `git status`, `git ls-files`, and the commit contents manually.

## 3. Publish

Create an empty remote repository without an initial README, license, or
`.gitignore`. Add that new remote to the release directory and push only its
`main` branch. Keep the original repository private.

After pushing:

1. Confirm the public commit count and file list match the local release repo.
2. Enable secret scanning, push protection, and private vulnerability reporting.
3. Require the CI workflow on pull requests to `main`.
4. Run setup and one provider-backed job using disposable or tightly scoped
   provider credentials, then revoke them if they were created for the test.
