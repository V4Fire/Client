# super/i-block

This module provides a super component for all other components.

```typescript
import iBlock, { component, prop, field } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @prop(Number)
  a: number;

  @prop(Number)
  b: number;

  @field(ctx => ctx.a + ctx.b)
  result: number;
}
```
