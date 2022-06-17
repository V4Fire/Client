# core/component/decorators/system

The decorator marks a class property as a system field.
System property mutations never cause components to re-render.

```typescript
import iBlock, { component, system } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @system()
  bla: number = 0;

  @system(() => Math.random())
  baz?: number;
}
```

#### Additional options

##### [unique = `false`]

Marks the field as unique for each component instance.
Also, the parameter can take a function that returns a boolean value.

##### [default]

Default field value.

##### [init]

A function to initialize the field value.
The function takes as its first argument a reference to the component context.
As the second argument, the function takes a reference to a dictionary with other fields of the same type that
have already been initialized.

```typescript
import iBlock, { component, system } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @system({init: () => Math.random()})
  bla!: number;
}
```

##### [atom = `false`]

Indicates that property should be initialized before all non-atomic properties.

##### [after]

A name or list of names after which this property should be initialized.
Keep in mind, you can only specify names that are of the same type as the current field (fields or system).

```typescript
import iBlock, { component, system } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @system(() => Math.random())
  bla!: number;

  @system({
    after: 'bla',
    init: (ctx, data) => data.bla + 10
  })

  baz!: number;
}
```

##### [watch]

A watcher or list of watchers for the current field.
The watcher can be defined as a component method to invoke, callback function, or watch handle.

```typescript
import iBlock, { component, system } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @system({watch: [
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

If false, the field cannot be watched if created inside a functional component

##### [merge = `false`]

If true, then if the component will restore its own state from the old component
(this happens when using a functional component), then the actual value will be merged with the previous one.
Also, this parameter can take a function to merge.

##### [meta]

A dictionary with some extra information of the field.
