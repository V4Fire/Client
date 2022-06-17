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
  @field(() => Math.random())
  baz!: number;

  // Or a dictionary with additional options
  @field({unique: true, init: () => Math.random()})
  ban!: number;
}
```

#### Additional options

##### [unique = `false`]

Marks the field as unique for each component instance.
Also, the parameter can take a function that returns a boolean value.

##### [default]

This option allows you to set a default value for the field.
But using it, as a rule, is not explicitly required, since a default value can be passed through the native syntax of class properties.

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field()
  bla: number = 0;
}
```

##### [init]

A function to initialize the field value.
The function takes as its first argument a reference to the component context.
As the second argument, the function takes a reference to a dictionary with other fields of the same type that
have already been initialized.

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field({init: () => Math.random()})
  bla!: number;

  @field(() => Math.random())
  bar!: number;
}
```

##### [forceUpdate = `true`]

If false, then property changes don't directly force re-rendering the template.
Keep in mind that the template can still be re-rendered, but only at the initiative of the engine being used.

##### [after]

A name or list of names after which this property should be initialized.
Keep in mind, you can only specify names that are of the same type as the current field (fields or field).

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field(() => Math.random())
  bla!: number;

  @field({
    after: 'bla',
    init: (ctx, data) => data.bla + 10
  })

  baz!: number;
}
```

##### [atom = `false`]

Indicates that property should be initialized before all non-atom properties.
This option is needed when you have a field that must be guaranteed to be initialized before other fields,
and you don't want to use `after` everywhere. But you can still use `after` along with other atomic fields.

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field({atom: true, init: () => Math.random()})
  bla!: number;

  @field((ctx, data) => data.bla + 10)
  baz!: number;
}
```

##### [watch]

A watcher or list of watchers for the current field.
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

##### [functionalWatching = `false`]

If false, the field can't be watched if created inside a functional component.

##### [merge = `false`]

If true, then if the component will restore its own state from the old component
(this happens when using a functional component), then the actual value will be merged with the previous one.
Also, this parameter can take a function to merge.

##### [meta]

A dictionary with some extra information of the field.
