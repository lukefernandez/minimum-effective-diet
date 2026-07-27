# The Minimum Effective Diet

Make four simple choices and get an evidence-based diet plan in return.

![A projected weight curve and its green zone](public/og.png)

## Overview

The Minimum Effective Diet aims to be a foolproof way for someone to get started on a weight gain or weight loss journey they can trust to be evidence-based, effective, and safe.

Fill in current weight, direction, target weekly rate, and duration, and the app presents a projected weight curve, calorie targets for each kind of training day, a full macro breakdown, and a "green zone" your weekly weight average should stay inside.

## Tests

Unit tests run with Vitest via `bun run test` with tests next to the code they
cover.

- The plan math (`plan.ts`) and formatting helpers are tested as pure
  functions, including a sweep over every supported
  weight and rate that checks macros are never negative and always sum
  to the day's calories.
- The `Selector` component is tested in a simulated browser
  (jsdom + Testing Library), checking values survive the round trip
  through the DOM.

## Credits

Percentage ranges, week ranges, and calorie estimates are from
[The Renaissance Diet 2.0](https://rpstrength.com/products/rp-diet-book-v2)
(unaffiliated). Not medical advice — see the disclaimer in the app.

## License

[MIT](LICENSE)
