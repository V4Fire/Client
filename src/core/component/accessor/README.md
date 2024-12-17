# core/component/accessor

This module provides an API to initialize component accessors and computed fields into a component instance.

## What Differences Between Accessors and Computed Fields?

A computed field is an accessor that can have its value cached or be watched for changes.
To enable value caching, you can use the `@computed` decorator when defining or overriding your accessor.
Once you add the decorator, the first time the getter value is accessed, it will be cached.

To support cache invalidation or add change watching capabilities,
you can provide a list of your accessor dependencies or use the `cache = 'auto'` option.
By specifying dependencies, the computed field will automatically update when any of its dependencies change,
whereas the `cache = 'auto'` option will invalidate the cache when it detects a change in any of the dependencies.

In essence, computed fields provide an elegant and efficient way to derive values from a component's data and state,
making it easier to manage and update dynamic UI states based on changes in other components or the application's data.

## Functions

### attachAccessorsFromMeta

Attaches accessors and computed fields from a component's tied metaobject to the specified component instance.
This function creates wrappers that can cache computed field values
and creates accessors for deprecated component props.

```typescript
import iBlock, { component, prop, computed } from 'components/super/i-block/i-block';

@component({
  // The following code will create an accessor for a property named "name" that refers to "fName" and emits a warning
  deprecatedProps: {name: 'fName'}
})

export default class bUser extends iBlock {
  @prop()
  readonly fName: string;

  @prop()
  readonly lName: string;

  // This is a cacheable computed field with the features of change watching and cache invalidation
  @computed({cache: true, dependencies: ['fName', 'lName']})
  get fullName() {
    return `${this.fName} ${this.lName}`;
  }

  // This is a cacheable computed field without cache invalidation
  @computed({cache: true})
  get id() {
    return Math.random();
  }

  // This is a simple getter
  get element() {
    return this.$el;
  }
}
```
