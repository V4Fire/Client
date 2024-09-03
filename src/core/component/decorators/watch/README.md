# core/component/decorators/watch

Attaches a watcher of a component property/event to a component method or property.

The `core/watch` module is used to make objects watchable.
Therefore, for more information, please refer to its documentation.

## Usage

When you observe a property's alteration,
the handler function can accept a second argument that refers to the property's old value.
If the object being watched isn't primitive, the old value will be cloned from the original old value.
This helps avoid issues that may arise from having two references to the same object.

```typescript
import iBlock, { component, field, watch } from 'components/super/i-block/i-block';

@component()
class Foo extends iBlock {
  @field()
  list: Dictionary[] = [];

  @watch('list')
  onListChange(value: Dictionary[], oldValue: Dictionary[]): void {
    // true
    console.log(value !== oldValue);
    console.log(value[0] !== oldValue[0]);
  }

  // If you don't specify a second argument in a watcher,
  // the property's old value won't be cloned.
  @watch('list')
  onListChangeWithoutCloning(value: Dictionary[]): void {
    // true
    console.log(value === arguments[1]);
    console.log(value[0] === oldValue[0]);
  }

  // If you're deep-watching a property and declare a second argument in a watcher,
  // the old value of the property will be deep-cloned.
  @watch({path: 'list', deep: true})
  onListChangeWithDeepCloning(value: Dictionary[], oldValue: Dictionary[]): void {
    // true
    console.log(value !== oldValue);
    console.log(value[0] !== oldValue[0]);
  }

  created() {
    this.list.push({});
    this.list[0].foo = 1;
  }
}
```

To listen to an event, you should use the special delimiter `:` within a watch path.
You can also specify an event emitter to listen to by writing a link before `:`.
Here are some examples:

1. `:onChange` - the component will listen to its own event `onChange`.
2. `localEmitter:onChange` - the component will listen to an `onChange` event from `localEmitter`.
3. `$parent.localEmitter:onChange` - the component will listen to an `onChange` event from `$parent.localEmitter`.
4. `document:scroll` - the component will listen to a `scroll` event from `window.document`.

A link to the event emitter is taken either from the component properties or from the global object.
An empty link `''` refers to the component itself.

If you are listening to an event, you can manage when to start listening to the event by using special characters at
the beginning of a watch path:

1. `'!'` - start to listen to an event on the `beforeCreate` hook, e.g., `!rootEmitter:reset`.
2. `'?'` - start to listen to an event on the `mounted` hook, e.g., `?$el:click`.

By default, all events start being listened to on the `created` hook.

```typescript
import iBlock, { component, field, watch } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field()
  foo: Dictionary = {bla: 0};

  // Watch "foo" for any changes
  @watch('foo')
  watcher1() {

  }

  // Deeply watch "foo" for any changes
  @watch({path: 'foo', deep: true})
  watcher2() {

  }

  // Watch "foo.bla" for any changes
  @watch('foo.bla')
  watcher3() {

  }

  // Listen to the component's "onChange" event
  @watch(':onChange')
  watcher3() {

  }

  // Listen to "onChange" event from the parentEmitter component
  @watch('parentEmitter:onChange')
  watcher4() {

  }
}
```

## Additional options

The `@watch` decorator can accept any options compatible with the watch function from the `core/object/watch` module.
For a more detailed list of these options, please refer to that module's documentation.
The decorator can also accommodate additional parameters.

### [handler]

A function (or the name of a component method) that gets triggered on watcher events.

```typescript
import iBlock, { component, field, watch } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @watch({handler: 'onIncrement'})
  @field()
  i: number = 0;

  onIncrement(val, oldVal, info) {
    console.log(val, oldVal, info);
  }
}
```

### [provideArgs = `true`]

If set to false, a handler that gets invoked due to a watcher event won't take any arguments from the event.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field({watch: {handler: 'onIncrement', provideArgs: false}})
  i: number = 0;

  onIncrement(val) {
    console.log(val === undefined);
  }
}
```

### [wrapper]

A function that wraps the registered handler.
This option can be useful for delegation of DOM events.
For example:

```typescript
import iBlock, { component, field, watch } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @watch({
    field: 'document:click',
    wrapper: (o, fn) => o.dom.delegateElement('button', fn)
  })

  onClick() {
    this.emit('Click!');
  }
}
```

### [flush = `'sync'`]

Determines the execution timing of the event handler:

1. `post` - the handler will be called on the next tick following the mutation,
   and is assured to be called after all linked templates are updated.

2. `pre` - the handler will be called on the next tick following the mutation,
   and is assured to be called before all linked templates are updated.

3. `sync` - the handler will be invoked immediately after each mutation.

### [test]

A function to determine whether a watcher should be initialized or not.
If the function returns false, the watcher will not be initialized.
Useful for precise component optimizations.

```typescript
import iBlock, { component, prop, watch } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @prop({required: false})
  params?: Dictionary;

  @watch({path: 'params', test: (ctx) => ctx.params != null})
  watcher() {

  }
}
```
