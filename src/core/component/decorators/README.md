# core/component/decorators

This module provides a bunch of decorators to annotate a component.

```typescript
export default class bExample {
  @prop(String)
  readonly foo: string;

  @watch('foo')
  onFoo() {
    console.log('`Foo` was changed');
  }
}
```
