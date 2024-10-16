# build/ts-transformers/resister-component-default-values

This module provides a transformer for extracting default properties of a component class into a special decorator `@defaultValue` (`core/component/decorators/default-value`).

This is necessary to allow retrieval of the default value for a component's prop at runtime without needing to create an instance of the component class.

## Example

```typescript
import iBlock, { component, prop } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop(Array)
  prop: string[] = [];
}
```

Will transform to

```typescript
import { defaultValue } from 'core/component/decorators/default-value';
import iBlock, { component, prop } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @defaultValue(() => { return []; })
  @prop(Array)
  prop: string[] = [];
}
```

## How to Attach the Transformer?

To attach the transformer, you need to add its import to `build/ts-transformers`.

```js
const registerComponentDefaultValues = include('build/ts-transformers/register-component-default-values');

module.exports = (program) => ({
  before: [registerComponentDefaultValues],
  after: {},
  afterDeclarations: {}
});
```
