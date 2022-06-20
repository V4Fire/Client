# core/component/decorators/computed

The decorator attaches meta information to a component computed field or accessor.

## What differences between accessors and computed fields?

A computed field is an accessor that value can be cached or watched.
To enable value caching, use the `@computed` decorator when define or override your accessor.
After that, the first time the getter value is touched, it will be cached. To support cache invalidation or
adding change watching capabilities, provide a list of your accessor dependencies or use the `cache = 'auto'` option.

## Usage

```typescript
import iBlock, {component, prop, computed} from 'super/i-block/i-block';

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

## Additional options

### [cache]

If true, the accessor value will be cached after the first touch.
The option is set to true by default if also provided `dependencies` or the bound accessor matches
by the name with another prop or field. If the option value is passed as `auto`, caching will be delegated to
the used component library.

```typescript
import iBlock, { component, field, computed } from 'super/i-block/i-block';

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
import iBlock, { component, prop, field, computed } from 'super/i-block/i-block';

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
import iBlock, { component, computed } from 'super/i-block/i-block';

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
import iBlock, {component, field, computed} from 'super/i-block/i-block';

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
import iBlock, { component, prop, field, computed } from 'super/i-block/i-block';

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
