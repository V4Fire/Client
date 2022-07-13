# core/component/decorators/watch

Attaches a watcher of a component property/event to a component method or property.

The `core/watch` module is used to make objects watchable.
Therefore, for more information, please refer to its documentation.

## Usage

When you watch some property change, the handler function can take a second argument that refers to
the old value of the property. If the object being watched is non-primitive, the old value will be cloned from
the original old value to avoid the problem when we have two references to the one object.

```typescript
import iBlock, { component, field, watch } from 'super/i-block/i-block';

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

  // When you don't declare a second argument in a watcher,
  // the property's old value won't be cloned
  @watch('list')
  onListChangeWithoutCloning(value: Dictionary[]): void {
    // true
    console.log(value === arguments[1]);
    console.log(value[0] === oldValue[0]);
  }

  // When you deep-watch a property and declare a second argument in a watcher,
  // the property's old value will be deep-cloned
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

To listen an event you need to use the special delimiter ":" within a watch path.
Also, you can specify an event emitter to listen by writing a link before ":".
For instance:

1. `':onChange'` - the component will listen its own event `onChange`;
2. `'localEmitter:onChange'` - the component will listen an event `onChange` from `localEmitter`;
3. `'$parent.localEmitter:onChange'` - the component will listen an event `onChange` from `$parent.localEmitter`;
4. `'document:scroll'` - the component will listen an event `scroll` from `window.document`.

A link to the event emitter is taken from component properties or from the global object.
The empty link '' is a link to a component itself.

Also, if you listen an event, you can manage when start to listen the event by using special characters at the
beginning of a watch path:

1. `'!'` - start to listen an event on the "beforeCreate" hook, for example: `'!rootEmitter:reset'`;
2. `'?'` - start to listen an event on the "mounted" hook, for example: `'?$el:click'`.

By default, all events start to listen on the "created" hook.

```typescript
import iBlock, { component, field, watch } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field()
  foo: Dictionary = {bla: 0};

  // Watch for changes of "foo"
  @watch('foo')
  watcher1() {

  }

  // Deep watch for changes of "foo"
  @watch({path: 'foo', deep: true})
  watcher2() {

  }

  // Watch for changes of "foo.bla"
  @watch('foo.bla')
  watcher3() {

  }

  // Listen "onChange" event of a component
  @watch(':onChange')
  watcher3() {

  }

  // Listen "onChange" event of a component `parentEmitter`
  @watch('parentEmitter:onChange')
  watcher4() {

  }
}
```

## Additional options

The `@watch` decorator can accept any options that the `watch` function from the `core/object/watch` module can accept,
so please refer to the documentation for that module. In addition, the decorator can accept some extra parameters.

### [handler]

A handler (or a name of the component method) that is invoked on watcher events.

```typescript
import iBlock, { component, field, watch } from 'super/i-block/i-block';

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

If false, then a handler that is invoked on the watcher event does not take any arguments from the event.

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

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

A wrapper function for the registered handler. This option is useful for delegating DOM events, for instance:

```typescript
import iBlock, { component, field, watch } from 'super/i-block/i-block';

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

How the event handler should be called:

1. `'post'` - the handler will be called on the next tick after the mutation and
   guaranteed after updating all tied templates;

2. `'pre'` - the handler will be called on the next tick after the mutation and
   guaranteed before updating all tied templates;

3. `'sync'` - the handler will be invoked immediately after each mutation.
