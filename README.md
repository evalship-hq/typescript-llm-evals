# LLM evals for TypeScript

A TypeScript support bot whose AI call is tested on every pull request with [tinyeval](https://tinyeval.com).

## Run it

Clone this repo or use it as a template. You need Node 22.6 or later. Then:

```sh
npm install
export ANTHROPIC_API_KEY=sk-ant-...
npx tinyeval
```

```
support
  ✓ refund after the window 6.6s
  ✓ missing package 5.5s
  ✓ refund inside the window 6.1s

All 3 evals passed (eval-results.json)
```

## What's here

- `src/support.ts`: the bot. `answer(message)` calls Claude with the official TypeScript SDK and returns the reply.
- `prompts/support.md`: the system prompt.
- `evals/worker.ts`: imports the bot once and answers each test case with tinyeval's worker helper.
- `evals/support.sh`: three test cases, each checked by a regex, a judge or both.
- `.github/workflows/evals.yml`: type-checks the code and runs the evals on every pull request and push to main.

## Use it for your app

1. Replace `answer` with your AI call. Keep the worker, so your app starts once per worker and not once per test case.
2. Write your test cases in `evals/`. The [check lines](https://github.com/evalship-hq/tinyeval#writing-evals) cover regexes, JSON, your own graders and a model judge.
3. In a Next.js or Express app, import your server-side function in the worker and call it instead of `answer`. Take the function your route handler calls, not the handler itself, which needs a request. Import `tinyeval-cli` before your app, as the worker does, so your app's `console.log` stays out of the replies.

Node runs the worker's TypeScript itself, so imports must name their `.ts` files. If your app imports without extensions or through a path alias like `@/lib`, as most Next.js apps do, install tsx and change the worker line to `worker npx tsx evals/worker.ts`.

When the API call fails for a reason that isn't your code, such as a missing key, a rate limit or a timeout, the test case counts as couldn't run. tinyeval lists it apart from the failures, and still exits 1. An error in your own code fails the eval.

## In CI

Add `ANTHROPIC_API_KEY` as a repository secret under **Settings** > **Secrets and variables** > **Actions**. The bot and tinyeval's judge both use it.

The workflow installs the packages and type-checks the code. Then it runs each test case 3 times, and a test case passes when at least 2 of the 3 pass. A failing eval fails the job, so you can require it before merging. The results upload as the `eval-results` artifact, also when an eval fails. Without the secret, the evals are skipped with a notice. Dependabot's pull requests get no secrets, so their evals are skipped too.

## Updating

Dependabot opens a pull request each week when tinyeval, the SDK or an action has a new version (`.github/dependabot.yml`). To update tinyeval by hand, run `npm update tinyeval-cli`.

## Compare pull requests with main

A fresh CI run has no earlier run to compare with. [evalship](https://evalship.com) reads `eval-results.json`, compares each pull request with main, tells flaky evals from real drops and comments on the pull request.

## License

MIT. See [LICENSE](LICENSE).
