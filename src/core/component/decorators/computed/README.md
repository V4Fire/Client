# core/component/decorators/computed

The decorator assigns meta-information to a computed field or an accessor within a component.

```typescript
import iBlock, {component, prop, computed} from 'components/super/i-block/i-block';

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

## What differences between accessors and computed fields?

A computed field is an accessor that can have its value cached or be watched for changes.
To enable value caching, you can use the `@computed` decorator when defining or overriding your accessor.
Once you add the decorator, the first time the getter value is accessed, it will be cached.

To support cache invalidation or add change watching capabilities,
you can provide a list of your accessor dependencies or use the `cache = 'auto'` option.
By specifying dependencies, the computed field will automatically update when any of its dependencies change,
whereas the `cache = 'auto'` option will invalidate the cache when it detects a change in any of the dependencies.

In essence, computed fields provide an elegant and efficient way to derive values from a component's data and state,
making it easier to manage and update dynamic UI states based on changes in other components or the application's data.

## Additional options

### [cache]

If true, the accessor value will be cached after the first touch.
The option is set to true by default if it also provided `dependencies` or the bound accessor matches
by the name with another prop or field.
If the option value is passed as `auto` caching will be delegated to the used component library.

```typescript
import iBlock, { component, field, computed } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  // The value is cached after the first touch and will never be reset
  @computed({cache: true})
  get hashCode(): number {
    return Math.random();
  }

  @field()
  i: number = 0;

  // The value is cached after the first touch, but the cache can be reset if the fields used internally change
  @computed({cache: 'auto'})
  get iWrapper(): number {
    return this.i;
  }
}
```

Also, when an accessor has a logically related prop/field
(using the naming convention "${property} -> ${property}Prop | ${property}Store") we don't need to add additional dependencies.

```typescript
import iBlock, { component, prop, field, computed } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop(Number)
  readonly fooProp: number = 0;

  // The getter use caching and can be watched
  get foo(): number {
    return this.fooProp * 3;
  }

  @field()
  blaStore: number = 0;

  // The getter use caching and can be watched
  get bla(): number {
    return this.blaStore * 3;
  }
}
```

### [watchable]

If true, the accessor returns a link to another watchable object.
This option allows you to mount external watchable objects to the component.

```typescript
import watch from 'core/object/watch';
import iBlock, { component, computed } from 'components/super/i-block/i-block';

const {proxy: state} = watch({
  a: 1,
  b: {
    c: 2
  }
});

setTimeout(() => {
  state.b.c++;
}, 500);

@component()
class bExample extends iBlock {
  @computed({watchable: true})
  get state(): typeof state {
    return state;
  }

  mounted() {
    this.watch('state', {deep: true}, (value, oldValue) => {
      console.log(value, oldValue);
    });
  }
}
```

### [dependencies]

A list of dependencies for the accessor.
The dependencies are needed to watch for the accessor mutations or to invalidate its cache.

```typescript
import iBlock, {component, field, computed} from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field()
  blaStore: number = 0;

  @computed({cache: true, dependencies: ['blaStore']})
  get bar(): number {
    return this.blaStore * 2;
  }
}
```

Also, when an accessor has a logically related prop/field
(using the naming convention "${property} -> ${property}Prop | ${property}Store") we don't need to add additional dependencies.

```typescript
import iBlock, { component, prop, field, computed } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop(Number)
  readonly fooProp: number = 0;

  // The getter use caching and can be watched
  get foo(): number {
    return this.fooProp * 3;
  }

  @field()
  blaStore: number = 0;

  // The getter use caching and can be watched
  get bla(): number {
    return this.blaStore * 3;
  }
}
```
