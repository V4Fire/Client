# build/ts-transformers/register-component-parts

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
import { registeredComponent } from 'core/component/decorators/const';

import iBlock, { component, prop } from 'components/super/i-block/i-block';

registeredComponent.name = 'bExample';
registeredComponent.layer = '@v4fire/client';
registeredComponent.event = 'constructor.b-example.@v4fire/client';

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
const registerComponentParts = include('build/ts-transformers/register-component-parts');

module.exports = () => ({
  before: [registerComponentParts],
  after: {},
  afterDeclarations: {}
});
```
