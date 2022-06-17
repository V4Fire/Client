# core/component/decorators/computed

The decorator attaches meta information to a component computed field or accessor.

```typescript
import iBlock, { component, prop, computed } from 'super/i-block/i-block';

@component()
export default class bUser extends iBlock {
  @prop()
  readonly fName: string;

  @prop()
  readonly lName: string;

  @prop({required: false})
  stageProp?: 'basic' | 'advanced';

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

  // This is a cacheable computed field tied with the `stageProp` prop
  get stage() {
    return Math.random();
  }

  // This is a simple accessor (a getter)
  get element() {
    return this.$el;
  }
}
```

#### Additional options

##### [cache]

If true, the accessor value will be cached after the first touch.
The option is set to true by default if also provided `dependencies` or the bound accessor matches
by the name with another prop or field. If the option value is passed as `auto`, caching will be delegated to
the used component library.

##### [watchable]

If true, the accessor returns a link to another watchable object.

##### [dependencies]

A list of dependencies for the accessor.
The dependencies are needed to watch for the accessor mutations or to invalidate its cache.

Also, when the accessor has a logically connected prop/field
(by using the name convention "${property} -> ${property}Prop | ${property}Store"),
we don't need to add additional dependencies.

```typescript
import iBlock, { component, field, computed } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field()
  blaStore: number = 0;

  @computed({cache: true, dependencies: ['blaStore']})
  get bar(): number {
    return this.blaStore * 2;
  }

  get bla(): number {
    return blaStore * 3;
  }
}
```
