# Evals for the support bot in src/support.ts. The worker starts it once per -j.
worker node --experimental-strip-types evals/worker.ts   # the flag lets Node 22.6 to 22.17 run TypeScript too

test_case "refund after the window" "Can I still return my shoes? They arrived 40 days ago."
  target src/support.ts#answer
  matches "30[- ]day"   # "30 days" and "30-day window" are both right
  judge "Says a refund isn't possible anymore, politely"

test_case "missing package" "My package never showed up and I'm getting really annoyed."
  target src/support.ts#answer
  matches "order (number|id|#)"
  judge "Asks for the order number before promising a refund or resend"

test_case "refund inside the window" "My shoes arrived last week and they don't fit. Can I send them back?"
  target src/support.ts#answer
  judge "Says they can return them for a refund"
