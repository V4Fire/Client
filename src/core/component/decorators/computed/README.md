# core/component/decorators/computed

The decorator assigns metainformation to a computed field or an accessor within a component.

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
  @computed({dependencies: ['fName', 'lName']})
  get fullName() {
    return `${this.fName} ${this.lName}`;
  }

  // This is a cacheable computed field without cache invalidation
  @computed({cache: 'forever'})
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

## What Are the Differences Between Accessors and Computed Fields?

A computed field is an accessor that can have its value cached or be watched for changes.
To enable value caching, you can use the `@computed` decorator when defining or overriding your accessor.
Once you add the decorator, the first time the getter value is accessed, it will be cached.

In essence, computed fields provide an elegant and efficient way to derive values from a component's data and state,
making it easier to manage and update dynamic UI states based on changes in other components or the application's data.

### Cache Invalidation

To support cache invalidation or add change watching capabilities,
you can provide a list of your accessor dependencies or use the `cache: 'auto'` option.
By specifying dependencies, the computed field will automatically update when any of its dependencies change,
whereas the `cache = 'auto'` option will invalidate the cache when it detects a change in any of the dependencies.

#### `cache: 'auto'` vs `dependencies`

The main difference between these two methods is that when observing a @computed field with `cache: 'auto'`,
it is necessary to execute the instructions inside the getter.
If the getter contains resource-intensive operations, this can have performance implications.

When explicitly defining dependencies, and if the field has an explicit connection by name
(using the naming convention "${property} → ${property}Prop | ${property}Store"),
it is not necessary to execute the getter to initialize observation.

### Effect Propagation

Even though the value of a @computed field can be cached,
there is still a need for the "effect" of this field to propagate to the template.
Put, to maintain a reactive connection between the values used inside and the template,
it is necessary that when such a field is called within the template, it is not taken from the cache, but live.
Therefore, cached @computed fields do not use the cache until the component's template has been rendered at least once.

#### Eternal Caching

Sometimes it is necessary for the value of a @computed field to be cached upon first use,
but then always retrieved from the cache thereafter.
Consequently, such a getter is not suitable for scenarios where it may contain side effects or need to be observed.
However, it is well-suited for situations where a certain value needs to be initialized lazily
and then should never change.
For instance, this is how the initialization of friendly classes in iBlock is done.

To activate such a caching mode, it is necessary to set the value of the `cache` parameter to `'forever'`.

```typescript
import iBlock, { component, field, computed } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  // This getter will be executed only once during the first touch
  @computed({cache: 'forever'})
  get exampleElements(): number {
    return document.querySelectorAll('.example');
  }
}
```

## Additional Options

### [cache]

If set to true, the accessor value will be cached after the first touch.
The option is set to true by default if it also provided `dependencies` or the bound accessor matches
by the name with another prop or field.

Note that to support the propagation of the getter's effect to the template,
caching never works until the component has been rendered for the first time.
If you want to ensure that the cached value is never invalidated, you should set the parameter to `'forever'`.

If the option value is passed as `auto` caching will be delegated to the used component library.

```typescript
import iBlock, { component, field, computed } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  // The value is cached after the first touch and will never be reset
  @computed({cache: 'forever'})
  get hashCode(): number {
    return Math.random();
  }

  @field()
  i: number = 0;

  // The value is cached after the first touch, but the cache can be reset if the fields used internally change.
  // The caching logic in this mode is handled by the library being used, such as Vue.
  @computed({cache: 'auto'})
  get iWrapper(): number {
    return this.i;
  }

  // The value is cached after the first touch, but the cache can be reset if the fields used internally change.
  // The caching logic in this case is carried out using the V4Fire library.
  @computed({dependencies: ['i']})
  get iWrapper2(): number {
    return this.i;
  }
}
```

Also, when an accessor has a logically related prop/field
(using the naming convention "${property} → ${property}Prop | ${property}Store")
we don't need to add additional dependencies.

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

If set to true, the accessor returns a link to another watchable object.
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
The dependencies are necessary to watch for the accessor mutations or to invalidate its cache.

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
(using the naming convention "${property} → ${property}Prop | ${property}Store")
we don't need to add additional dependencies.

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
