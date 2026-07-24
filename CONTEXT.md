# Domain glossary

- **Plan** — the complete output of the calculator for one set of inputs: projections, outcome numbers (final weight, weekly change, total change), and day plans. Produced by the plan module (`src/plan.ts`) through `computePlan`; null when the starting weight is outside the supported 100–300 lb range.
- **Direction** — gain or lose. The math-side rates live in the plan module; the UI-side voice (gain/loss/gained/lost) and selectable input ranges live in the Calculator's direction config.
- **Projection** — the target average weight for one week of the plan, with the week's healthy-rate window.
- **Green zone** — the band between the healthiest minimum and maximum weekly rates (gain: 0.25–0.5%/week; lose: 0.5–1%/week of starting weight), drawn on the second chart. A user trending inside it is dieting at an evidence-based pace.
- **Day plan** — calorie and macro targets for one training-day type: Rest, Easy, Medium, or Hard. Day types differ in maintenance calories and carbs per pound (0.5/1.0/1.5/2.0).
- **Maintenance calories** — calories to hold weight steady at a given weight and training intensity, looked up from the Renaissance Diet chart (100–300 lb).
- **Even split** — the daily calorie surplus/deficit (3500 kcal per pound of weekly change ÷ 7) is split into thirds across protein, carbs, and fat.
- **Fat floor** — a day plan never prescribes fat below 0.3 g/lb of body weight; when the floor binds, carbs absorb the difference, and carbs never go below zero.
