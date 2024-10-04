# core/component/decorators/system

The decorator marks a class property as a system field.
System property mutations never cause components to re-render.

```typescript
import iBlock, { component, system } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  // The decorator can be called either without parameters
  @system()
  bla: number = 0;

  // Or by passing a value initializer function
  @system(() => Math.random())
  baz!: number;

  // Or a dictionary with additional options
  @system({unique: true, init: () => Math.random()})
  ban!: number;
}
```

## What Are the Differences Between Fields and System Fields?

The main difference between fields and system fields in V4Fire is that any changes to a regular field
can trigger a re-render of the component template.
In cases where a developer is confident that a field will not require rendering,
system fields should be used instead of regular fields.
It's important to note that changes to any system field can still be watched using the built-in API.

The second difference between regular fields and system fields is their initialization timing.
Regular fields are initialized in the `created` hook, while system fields are initialized in the `beforeCreate` hook.
By understanding the differences between regular fields and system fields,
developers can design and optimize their components for optimal performance and behavior.

## Field Initialization Order

Because the `init` function takes a reference to the field's store as the second argument, then we can generate field
values from other fields.
But, if we just write something like this:

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @system()
  a: number = 1;

  @system((o, d) => d.a + 1)
  b!: number;
}
```

There is no guarantee that the code will work as expected.
Property values can be initialized in a random order,
and it may happen that the property `a` is not yet initialized when the value of `b` is being calculated.

To ensure the correct initialization order, it is necessary to specify the dependencies explicitly.
This can be done by using the `after` parameter of the `@system` decorator.

By modifying the code as follows:

```typescript
import iBlock, { component, system } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @system()
  a: number = 1;

  @system({
    after: 'a',
    init: (o, d) => d.a + 1
  })

  b!: number;
}
```

Now, the code will work as expected.
The `after` parameter specifies that property `a` should be initialized before property `b`,
ensuring that the value of `a` is available when calculating the value of `b`.

### Atomic Properties

When there are properties that are required for most other properties,
it can become quite tedious to manually write the after parameter in each place.
To simplify this process, you can use the atom parameter to mark such properties.

By marking a property as an atom, it guarantees that it will always be initialized before non-atoms.
Here's an example code snippet:

```typescript
import iBlock, { component, system } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @system({atom: true})
  basis: number = 2;

  @system((o, d) => d.basis * 2)
  a!: number;

  @system((o, d) => d.basis * 4)
  b!: number;
}
```

In this code, the basis property is marked as an atom using the `atom: true` parameter.
This ensures that it will always be initialized before `a` and `b`.

It's worth mentioning that an atom can still use the `after` parameter, but it can only depend on other atoms.
Dependency on non-atoms can result in a deadlock.

Using the atom parameter is a convenient way to guarantee the initialization order for properties that
are required by most other properties, reducing the need for explicit after declarations.

## Initialization Loop and Asynchronous Operations

It is important to note that all component properties are initialized synchronously,
meaning you cannot return a Promise from a property initializer and expect the component to wait for it to resolve
before continuing the initialization process.
Using Promises in property initializers can have disastrous effects on performance.

However, there is a way to work with asynchronous operations during initialization.
Technically, a property initializer can return both a Promise and not return anything.
In such cases, you can later change the value of the property.

While the data is being loaded asynchronously,
the component can display a loading indicator or handle the situation suitably.
This approach is considered idiomatic and does not have any unpredictable consequences.

Here's an example code snippet that demonstrates this behavior:

```typescript
import iBlock, { component, system } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @system((o) => {
    o.async.setTimeout(() => o.a = 1, 100);
  })

  a!: number;
}
```

In this code, the property `a` is initialized asynchronously using a timeout of 100 milliseconds.
The `setTimeout` function is called within the property initializer,
which sets the value of `a` to 1 after the timeout completes.

It is important to note that when working with asynchronous operations during initialization,
it is recommended to use the `field.set` method or directly modify the component instance
(the first argument of the initializer function) to update the value of the property.

By using this approach, you can handle asynchronous data loading and modify property values once
the data is available without negatively impacting the performance of the component.

#### Additional Options

### [unique = `false`]

Marks the field as unique for each component instance.
Also, the parameter can take a function that returns a boolean value.
If this value is true, then the parameter is considered unique.

Please note that the "external" code must provide the uniqueness guarantee
because V4Fire does not perform special checks for uniqueness.

```typescript
import iBlock, { component, system } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @system({unique: true, init: Math.random})
  hashCode!: number;
}
```

### [default]

This option allows you to set the default value of the field.
But using it, as a rule, is not explicitly required, since the default value can be passed through
the native syntax of class properties.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';

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
import iBlock, { component, system } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  // There will be a trouble here when cloning the value
  @system()
  body: Element = document.body;

  // All fine
  @system({default: document.body})
  validBody!: Element;

  // All fine
  @system(() => document.body)
  validBody2!: Element;
}
```

### [init]

A function to initialize the field value.
The function takes as its first argument a reference to the component context.
As the second argument, the function takes a reference to a dictionary with other fields of the same type that
have already been initialized.

```typescript
import iBlock, { component, prop, system } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @system({init: Math.random})
  hashCode!: number;

  @system((ctx, {hashCode}) => String(hashCode))
  normalizedHashCode!: string;
}
```

### [after]

A name or a list of names after which this property should be initialized.
Keep in mind, you can only specify names that are of the same type as the current field (`@system` or `@field`).

```typescript
import iBlock, { component, system } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @system(Math.random)
  hashCode!: number;

  @system({
    after: 'hashCode',
    init: (ctx, {hashCode}) => String(hashCode)
  })

  normalizedHashCode!: string;
}
```

### [atom = `false`]

This option indicates that property should be initialized before all non-atom properties.
It is necessary when you have a field that must be guaranteed to be initialized before other fields,
and you don't want to use `after` everywhere.
But you can still use `after` along with other atomic fields.

```typescript
import Async from 'core/async';
import iBlock, { component, system } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @system({atom: true, init: (ctx) => new Async(ctx)})
  async!: Async<this>;

  @system((ctx, data) => data.async.proxy(() => { /* ... */ }))
  handler!: Function;
}
```

### [watch]

A watcher or a list of watchers for the current field.
The watcher can be defined as a component method to invoke, callback function, or watch handle.

The `core/watch` module is used to make objects watchable.
Therefore, for more information, please refer to its documentation.

```typescript
import iBlock, { component, system } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @system({watch: [
    'onIncrement',

    (ctx, val, oldVal, info) =>
      console.log(val, oldVal, info),

    // Also, see core/object/watch
    {
      // If set to false, then a handler invoked on the watcher event does not take any arguments from the event
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

If set to false, the field can't be watched if created inside a functional component.
This option is useful when you are writing a superclass or a smart component that can be created
as regular or functional.

### [merge = `false`]

This option is only relevant for functional components.
The fact is that when a component state changes, all its child functional components are recreated from scratch.
But we need to restore the state of such components. By default, properties are simply copied from old instances to
new ones, but sometimes this strategy does not suit us. This option helps here—it allows you to declare that
a certain property should be mixed based on the old and new values.

Set this property to true to enable the strategy of merging old and new values.
Or specify a function that will perform the merge. This function takes contexts of the old and new components,
the name of the field to restore, and optionally, a path to a property to which the given is bound.

### [meta]

A dictionary with some extra information of the field.
You can access this information using `meta.fields`.

```typescript
import iBlock, { component, system } from 'components/super/i-block/i-block';

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
