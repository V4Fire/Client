# core/component/decorators

This module provides decorators for annotating properties of components.
Using these decorators and the `@сomponent` decorator, you can register components based on your JS/TS classes.

```typescript
import iBlock, { component, prop } from 'components/super/i-block/i-block';

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
* `@prop` to declare a component's input property (aka "prop");
* `@field` to declare a component's field;
* `@system` to declare a component's system field (system field mutations never cause components to re-render);
* `@defaultValue` to declare the default value of a component's field or prop;
* `@computed` to attach meta-information to a component's computed field or accessor;
* `@hook` to attach a hook listener;
* `@watch` to attach a watcher.
