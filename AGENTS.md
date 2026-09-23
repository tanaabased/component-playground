# Component Playground Agent Guidance

Use the versions declared in `.bun-version` and `.node-version`. Install dependencies with
`bun install --frozen-lockfile --ignore-scripts`.

Mocha specs live in `test/**/*.spec.js`. Vue interaction tests live in
`test/components/**/*.test.js` and use Vitest, Vue Test Utils, and jsdom. Run:

- `bun run test` for both suites.
- `bun run test:unit` for Mocha only.
- `bun run test:components` for component tests only.
- `bun run test:components -- -t "test name"` for a focused component test.
- `bun run test:components:watch` while developing component tests.

Exercise public component behavior through mounted components and the real `InteractiveCode` path.
Prefer meaningful DOM, emitted-event, state, and copied-markup assertions over snapshots or private
method calls. Reuse representative demo components when they express the behavior without locking in
incidental placeholder markup.

Keep jsdom geometry and clipboard shims minimal. Clean up mounted wrappers, teleports, mocks, and
timers. This baseline verifies behavior; it does not require browser runs, screenshots, layout
geometry, computed colors, visual focus presentation, or other claims of visual correctness.
