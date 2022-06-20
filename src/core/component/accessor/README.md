# core/component/accessor

This module provides an API to initialize component accessors and computed fields to a component instance.

## What differences between accessors and computed fields?

A computed field is an accessor that value can be cached or watched.
To enable value caching, use the `@computed` decorator when define or override your accessor.
After that, the first time the getter value is touched, it will be cached. To support cache invalidation or
adding change watching capabilities, provide a list of your accessor dependencies or use the `cache = 'auto'` option.

## Functions

### attachAccessorsFromMeta

Attaches accessors and computed fields to the specified component instance from its tied meta object.
The function creates cacheable wrappers for computed fields. Also, it creates accessors for deprecated component props.

```typescript
import iBlock, { component, prop, computed } from 'super/i-block/i-block';

@component({
  // Will create an accessor for `name` that refers to `fName` and emits a warning
  deprecatedProps: {name: 'fName'}
})

export default class bUser extends iBlock {
  @prop()
  readonly fName: string;

  @prop()
  readonly lName: string;

  // This is a cacheable computed field with feature of watching and cache invalidation
  @computed({cache: true, dependencies: ['fName', 'lName']})
  get fullName() {
    return `${this.fName} ${this.lName}`;
  }

  // This is a cacheable computed field without cache invalidation
  @computed({cache: true})
  get id() {
    return Math.random();
  }

  // This is a simple accessor (a getter)
  get element() {
    return this.$el;
  }
}
```
