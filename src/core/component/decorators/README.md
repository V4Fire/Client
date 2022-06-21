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

## Built-in decorators

* `@component` to register a new component;
* `@prop` to declare a component input property (aka "prop");
* `@field` to declare a component field;
* `@system` to declare a component system field (system field mutations never cause components to re-render);
* `@computed` to attach meta information to a component computed field or accessor;
* `@hook` to attach a hook listener;
* `@watch` to attach a watcher.
