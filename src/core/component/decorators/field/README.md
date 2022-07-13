# core/component/decorators/field

The decorator marks a class property as a component field.
In non-functional components, field property mutations typically cause the component to re-render.

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  // The decorator can be called either without parameters
  @field()
  bla: number = 0;

  // Or by passing a value initializer function
  @field(Math.random)
  baz!: number;

  // Or a dictionary with additional options
  @field({unique: true, init: Math.random})
  hashCode!: number;
}
```

## What differences between fields and system fields?

The major difference between fields and system fields, that any changes of a component field can force re-rendering of its template.
I.e., if you are totally sure that your component field doesn't need to force rendering, prefer system fields instead of regular.
Mind, changes in any system field still can be watched using built-in API.

The second difference is that system fields are initialized on the `beforeCreate` hook,
but not on the `created` hook like the regular fields do.

## Field initialization order

Because the `init` function takes a reference to the fields store as the second argument, then we can generate field
values from other fields. But, if we just write something like this.

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @field()
  a: number = 1;

  @field((o, d) => d.a + 1)
  b!: number;
}
```

There is no guarantee that this code will work as expected. The fact is that property values can be initialized in a random order,
and it may turn out that the property we need is not yet initialized. To solve this problem, we must declare the
dependencies explicitly. We must pass the `@field` decorator the `after` parameter, which can be the expected
property name or a list of names.

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @field()
  a: number = 1;

  @field({
    after: 'a',
    init: (o, d) => d.a + 1
  })

  b!: number;
}
```

Now everything will work as expected. Note that `after` only specifies the names of other `@field` properties.
That is, you cannot specify `@prop` or `@system` properties, but this is not a problem, because by the time the `@field`
properties are initialized, the rest of the properties will already be ready.

### Atomic properties

There are properties that are required for most other properties. It would be very tedious to write `after` in each place,
especially since there can be many such properties. Therefore, there is another way, you need to mark such a property
with the `atom` parameter, and it will always be guaranteed to be initialized before non-atoms.

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @field({atom: true})
  basis: number = 2;

  @field((o, d) => d.basis * 2)
  a!: number;

  @field((o, d) => d.basis * 4)
  b!: number;
}
```

An atom can also use `after`, however, only other atoms can be used as dependencies (because otherwise it results in a deadlock).

## Initialization loop and asynchronous operations

All component properties are initialized synchronously. That is, you cannot return a Promise from the property initializer
and expect the component to not be initialized until it resolves. This behavior can be disastrous for performance.
However, technically, any initializer can return both a promise and return nothing, and later change the value of its field.

While the data is being loaded, the component can show a loading indicator or somehow play around with this situation.
This approach may well be considered idiomatic, since there are no unpredictable consequences. For example,
the `db` property is implemented in iData heirs in approximately the same way. However, it should be noted that
all asynchronous "permutations" of the property must be written using the `field.set` method or directly to
the component instance (the first argument of the `init` function).

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @field((o) => {
    o.async.setTimeout(() => o.a = 1, 100);
  })

  a!: number;
}
```

## Additional options

### [unique = `false`]

Marks the field as unique for each component instance.
Also, the parameter can take a function that returns a boolean value.
If this value is true, then the parameter is considered unique.

Please note that the uniqueness guarantee must be provided by the "external" code,
because V4Fire does not perform special checks for uniqueness.

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field({unique: true, init: Math.random})
  hashCode!: number;
}
```

### [default]

This option allows you to set the default value of the field.
But using it, as a rule, is not explicitly required, since the default value can be passed through
the native syntax of class properties.

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field()
  bla: number = 0;

  @field({default: 0})
  bar!: number;
}
```

Note that if the default value is set using class property syntax, then it is a prototype, not a real value.
That is, when set to each new instance, it will be cloned using `Object.fastClone`.
If this behavior does not suit you, then pass the value explicitly via `default` or using the `init` option and
an initializer function.

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  // There will be a trouble here when cloning the value
  @field()
  body: Element = document.body;

  // All fine
  @field({default: document.body})
  validBody!: Element;

  // All fine
  @field(() => document.body)
  validBody2!: Element;
}
```

### [init]

A function to initialize the field value.
The function takes as its first argument a reference to the component context.
As the second argument, the function takes a reference to a dictionary with other fields of the same type that
have already been initialized.

```typescript
import iBlock, { component, prop, field } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field({init: Math.random})
  hashCode!: number;

  @field((ctx, {hashCode}) => String(hashCode))
  normalizedHashCode!: string;
}
```

### [forceUpdate = `true`]

If false, then property changes don't directly force re-rendering the template.
Keep in mind that the template can still be re-rendered, but only at the initiative of the engine being used.

### [after]

A name or a list of names after which this property should be initialized.
Keep in mind, you can only specify names that are of the same type as the current field (`@system` or `@field`).

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field(Math.random)
  hashCode!: number;

  @field({
    after: 'hashCode',
    init: (ctx, {hashCode}) => String(hashCode)
  })

  normalizedHashCode!: string;
}
```

### [atom = `false`]

Indicates that property should be initialized before all non-atom properties.
This option is needed when you have a field that must be guaranteed to be initialized before other fields,
and you don't want to use `after` everywhere. But you can still use `after` along with other atomic fields.

```typescript
import Async from 'core/async';
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field({atom: true, init: (ctx) => new Async(ctx)})
  async!: Async<this>;

  @field((ctx, data) => data.async.proxy(() => { /* ... */ }))
  handler!: Function;
}
```

### [watch]

A watcher or a list of watchers for the current field.
The watcher can be defined as a component method to invoke, callback function, or watch handle.

The `core/watch` module is used to make objects watchable.
Therefore, for more information, please refer to its documentation.

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field({watch: [
    'onIncrement',

    (ctx, val, oldVal, info) =>
      console.log(val, oldVal, info),

    // Also, see core/object/watch
    {
      // If false, then a handler that is invoked on the watcher event does not take any arguments from the event
      provideArgs: false,

      // How the event handler should be called:
      //
      // 1. `'post'` - the handler will be called on the next tick after the mutation and
      //    guaranteed after updating all tied templates;
      //
      // 2. `'pre'` - the handler will be called on the next tick after the mutation and
      //    guaranteed before updating all tied templates;
      //
      // 3. `'sync'` - the handler will be invoked immediately after each mutation.
      flush: 'sync',

      // Can define as a function too
      handler: 'onIncrement'
    }
  ]})

  i: number = 0;

  onIncrement(val, oldVal, info) {
    console.log(val, oldVal, info);
  }
}
```

### [functionalWatching = `false`]

If false, the field can't be watched if created inside a functional component.
This option is useful when you are writing a superclass or a smart component that can be created as regular or functional.

### [merge = `false`]

This option is only relevant for functional components.
The fact is that when a component state changes, all its child functional components are recreated from scratch.
But we need to restore the state of such components. By default, properties are simply copied from old instances to
new ones, but sometimes this strategy does not suit us. This option helps here - it allows you to declare that
a certain property should be mixed based on the old and new values.

Set this property to true to enable the strategy of merging old and new values.
Or specify a function that will perform the merge. This function takes contexts of the old and new components,
the name of the field to restore, and optionally, a path to a property to which the given is bound.

### [meta]

A dictionary with some extra information of the field.
You can access this information using `meta.fields`.

```typescript
import iBlock, { component, system } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @system({init: Math.random, meta: {debug: true}})
  hashCode!: number;

  created() {
    // {debug: true}
    console.log(this.meta.systemFields.hashCode.meta);
  }
}
```
