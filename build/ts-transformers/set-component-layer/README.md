# build/ts-transformers/set-component-layer

This module provides a transformer that adds information to each component declaration about the application layer
in which the component is declared.
This is necessary for the correct functioning of component overrides in child layers.

## Example

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {}
```

Will transform to

```typescript
import iBlock, { component, prop } from 'components/super/i-block/i-block';

@component({layer: '@v4fire/client'})
class bExample extends iBlock {}
```

## How to Attach the Transformer?

To attach the transformer, you need to add its import to `build/ts-transformers`.

```js
const setComponentLayer = include('build/ts-transformers/set-component-layer');

module.exports = (program) => ({
  before: [setComponentLayer],
  after: {},
  afterDeclarations: {}
});
```
