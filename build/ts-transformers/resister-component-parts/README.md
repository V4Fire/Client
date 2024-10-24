# build/ts-transformers/resister-component-parts

This module provides a transformer for registering parts of a class as parts of the associated component.

## Example

```typescript
import iBlock, { component, prop } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop(Array)
  prop: string[] = [];

  get answer() {
    return 42;
  }

  just() {
    return 'do it';
  }
}
```

Will transform to

```typescript
import { defaultValue } from 'core/component/decorators/default-value';
import { method } from 'core/component/decorators/method';

import iBlock, { component, prop } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @defaultValue(() => { return []; })
  @prop(Array)
  prop: string[] = [];

  @method('accessor')
  get answer() {
    return 42;
  }

  @method('method')
  just() {
    return 'do it';
  }
}
```

## How to Attach the Transformer?

To attach the transformer, you need to add its import to `build/ts-transformers`.

```js
const resisterComponentParts = include('build/ts-transformers/resister-component-parts');

module.exports = () => ({
  before: [resisterComponentParts],
  after: {},
  afterDeclarations: {}
});
```
