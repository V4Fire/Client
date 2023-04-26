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

```typescript
await Assert.component.itemsHaveMod('active', true, [0, 1]);
```
