# core/component/decorators

This module provides a bunch of decorators to annotate component properties.
Using these and the `@component` decorator, you can register a component based on your JS class.

```typescript
import iBlock, { component, prop } from 'super/i-block/i-block';

@component()
export default class bUser extends iBlock {
  @prop(String)
  readonly fName: string;

  @prop(String)
  readonly lName: string;
}
```
