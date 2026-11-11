// tinyeval worker. evals/support.sh starts it once per -j with:
//   worker node --experimental-strip-types evals/worker.ts
import { worker, CouldntRun } from "tinyeval-cli"; // first, so the bot's console.log goes to stderr, not into the replies
import { answer } from "../src/support.ts"; // builds the client once, before the loop

// A bad key, a rate limit, a server error, a timeout or the network make the helper count the test case as
// couldn't run. Without a key the SDK throws a plain Error, so that case is checked here.
// Any other error, like a bad model name, is the reply, so the eval fails.
await worker((input) => {
  if (!process.env.ANTHROPIC_API_KEY) throw new CouldntRun("no ANTHROPIC_API_KEY");
  return answer(input);
});
