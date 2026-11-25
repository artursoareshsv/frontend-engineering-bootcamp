# Branch Protection Status

## Current status: not enforceable on this repository's plan

The repository is **private** and owned by a **GitHub Free personal account**. GitHub requires GitHub Pro (or a public repository) to enable branch protection or repository rulesets on private repositories. Both APIs return:

```text
HTTP 403
{"message":"Upgrade to GitHub Pro or make this repository public to enable this feature.",
 "documentation_url":"https://docs.github.com/rest/branches/branch-protection#get-branch-protection"}
```

Verified on 2026-11-25 for:

```bash
gh api repos/artursoareshsv/frontend-engineering-bootcamp/branches/main/protection
gh api repos/artursoareshsv/frontend-engineering-bootcamp/rulesets
```

| Intended setting | Status | Reason |
| --- | --- | --- |
| Require a pull request before merging | Not enabled | Plan restriction |
| Block direct pushes to `main` | Not enabled | Plan restriction |
| Require at least one approval | Not enabled | Plan restriction, plus single-account repository (authors cannot approve their own PRs) |
| Require status checks (`validate`) to pass | Not enabled | Plan restriction |
| Require conversation resolution | Not enabled | Plan restriction |
| Block force pushes | Not enabled | Plan restriction |
| Block branch deletion | Not enabled | Plan restriction |

Do not describe `main` as protected until the settings below are applied and verified.

## What is enforced today

- `.github/workflows/validate.yml` runs on every push to `main` and every pull request, and its result is visible on the PR.
- The bootcamp workflow (branch per challenge, PR, review, merge) is required by convention and by [`CONTRIBUTING.md`](../CONTRIBUTING.md).
- Each learner runs `npm run validate` locally before opening a PR.
- CI regenerates the dataset and fails on any diff, so hand-edited raw data is caught even without branch protection.

These are process controls, not server-side enforcement. A determined user can still push to `main`.

## Enabling protection later

When the account is upgraded to GitHub Pro (or the repository is moved to an organisation with Team/Enterprise), apply a ruleset with these rules:

| Rule | Parameter |
| --- | --- |
| Pull request required | 1 approval, dismiss stale reviews on push, require conversation resolution |
| Required status checks | `validate`, strict (branch must be up to date) |
| Block force pushes | enabled |
| Block deletions | enabled |

### Note on required approvals

This repository currently has a single collaborator. GitHub does not allow an author to approve their own pull request, so requiring one approval will make `main` unmergeable until a second reviewer is added. Add a mentor/reviewer account **before** enabling the approval requirement, or start with 0 approvals and add the requirement once a second person has access.

### Applying with the GitHub CLI

```bash
# Example ruleset for a Pro/Team repository. Review the parameters first.
gh api --method POST repos/OWNER/REPO/rulesets --input - <<'JSON'
{
  "name": "main-protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] }
  },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true,
        "allowed_merge_methods": ["squash", "merge", "rebase"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "do_not_enforce_on_create": false,
        "required_status_checks": [{ "context": "validate" }]
      }
    }
  ]
}
JSON
```

### Verifying

```bash
gh api repos/OWNER/REPO/rulesets --jq '.[] | {name, enforcement}'
gh api repos/OWNER/REPO/rulesets/<ruleset_id> --jq '.rules[].type'
```

Only report protection as active when these commands show the expected rules.
