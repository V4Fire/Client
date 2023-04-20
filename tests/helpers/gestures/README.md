# tests/helpers/dom

This module provides API to work with touch gestures.

## Usage

```typescript
const gestures = await Gestures.create(page, {
  dispatchEl: selector,
  targetEl: selector
});

await gestures
  .evaluate((ctx) => ctx.swipe(ctx.buildSteps(3, 20, globalThis.innerHeight, 0, -20)));
```
