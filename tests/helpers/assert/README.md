# tests/helpers/assert

This module provides frequently needed asserts.

Usage:


```typescript

import test from 'tests/config/unit/test';

test.beforeEach(async ({page}) => {
  Assert.setPage(page);
});

test.afterEach(() => {
  Assert.unsetPage();
});

test('test something', () => {
  // use Assert here
})

```

## Component asserts

### itemsHaveMod

Asserts that items with the specified ids (0, 1) have the `active` modifier set to `true`.

```typescript
await Assert.component.itemsHaveMod('active', true, [0, 1]);
```

### itemsHaveClass

Asserts that items with specified ids (0, 1) have class which matches the `/marked_true/` regexp.

```typescript
await Assert.component.itemsHaveClass(/marked_true/, [0, 1]);

await Assert.component.not.itemsHaveClass(/marked_true/, [0, 1]);
```
