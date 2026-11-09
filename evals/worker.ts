// tinyeval worker. evals/support.sh starts it once per -j with:
//   worker node --experimental-strip-types evals/worker.ts
// It reads each input up to a NUL byte and prints the reply and a NUL byte.
import Anthropic from "@anthropic-ai/sdk";
import { answer } from "../src/support.ts"; // builds the client once, before the loop

// When the cause isn't the app (no key, a bad key, a rate limit, a server error, a timeout
// or the network), the reply's first line makes tinyeval count it as couldn't run.
// Any other error, like a bad model name, is the reply, so the eval fails.
function failure(err: unknown): string {
  let reason = String(err).split("\n")[0];
  let couldntRun = err instanceof Anthropic.APIConnectionError; // the network or a timeout
  if (err instanceof Anthropic.APIError && err.status) {
    reason = `anthropic: ${err.status} ${err.type}`;
    couldntRun = err.status === 401 || err.status === 429 || err.status >= 500;
  } else if (err instanceof Error && err.message.startsWith("Could not resolve authentication")) {
    reason = "no ANTHROPIC_API_KEY"; // the SDK throws a plain Error when it finds no key
    couldntRun = true;
  }
  return couldntRun ? `#tinyeval couldnt_run ${reason}\n` : reason;
}

let rest = Buffer.alloc(0);
for await (const chunk of process.stdin) {
  rest = Buffer.concat([rest, chunk]);
  let i;
  while ((i = rest.indexOf(0)) >= 0) {
    const input = rest.subarray(0, i).toString();
    rest = rest.subarray(i + 1);
    process.stdout.write((await answer(input).catch(failure)) + "\0");
  }
}
