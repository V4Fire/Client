# core/component/decorators/hook

Attaches a hook listener to a component method.
This means that when the component switches to the specified hook(s), the method will be called.

```typescript
import iBlock, { component, hook } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  // Adding a handler for one hook
  @hook('mounted')
  onMounted() {

  }

  // Adding a handler for several hooks
  @hook(['mounted', 'activated'])
  onMountedOrActivated() {

  }

  // Adding a handler for several hooks
  @hook('mounted')
  @hook('activated')
  onMountedOrActivated2() {

  }
}
```

## Component Life Cycle

V4Fire components have a standard life cycle: the component is created, the component is mounted to the DOM,
the component is unmounted from the DOM, and so on.

V4Fire implements an extended version of the [Vue component life cycle](https://vuejs.org/api/options-lifecycle.html#options-lifecycle).
That is, the V4 component supports all the lifecycle states (hereinafter referred to as hooks) of the Vue component and
adds two of its own.

1. `beforeRuntime` is a hook that is called before `beforeCreate`;
2. `beforeDataCreate` is a hook that is called after `beforeCreate` but before `created`.

Also, V4Fire uses the `beforeDestroy` and `destroyed` hooks, not `beforeUnmount` and `unmounted` as Vue3 does.

### beforeRuntime

The need for this hook exists due to Vue limitations: the fact is that when a component is called within a template,
it has a state when it does not yet have its own methods and fields, but only props (`beforeCreate`).
After `beforeCreate`, a special function is called on the component, which forms a base object with the watchable fields
of the component, and only then `created` is triggered.
So, before `created` we cannot use the component API, like methods, getters, etc.
However, to use some methods before the `created` hook, the [[iBlock]] class has the following code.

```
@hook('beforeRuntime')
protected initBaseAPI() {
  const
    i = this.instance;

  this.syncStorageState = i.syncStorageState.bind(this);
  this.syncRouterState = i.syncRouterState.bind(this);

  this.watch = i.watch.bind(this);
  this.on = i.on.bind(this);
  this.once = i.once.bind(this);
  this.off = i.off.bind(this);
}
```

That is, before `beforeCreate`, a special method is triggered that explicitly sets the most necessary API,
which the component should always have.
There are few methods that can be used before the `created` hook,
and usually all of them are registered in `iBlock.initBaseAPI`.
However, if your component has a new method that needs to be used in this way,
you can always override the `initBaseAPI` method.

### beforeDataCreate

It is often necessary to make some modification to watchable fields (such as normalization) before creating a component,
because once created, any change to such fields can cause re-rendering and can be disastrous for performance.
We have links, initializers, and API to control the order of initialization, but what if we need to get the entire
watchable store and modify it complexly.
It is to solve this problem that the `beforeDataCreate` hook exists:
it will be called exactly when all observable properties have been created, but not yet linked to the component,
i.e., we can safely change them and not expect consequences.

```typescript
import iBlock, { component, field, hook } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @field()
  i: number = 0;

  @field()
  j: number = 0;

  @hook('beforeDataCreate')
  normalizeData() {
    // Since `@field` properties are not yet connected to the component,
    // we cannot call them directly, but only through special methods
    if (this.field.get('i') === 0) {
      this.field.set('j', 1);
    }
  }
}
```

It should also be noted that the `@prop` and `@system` properties are initialized before `beforeCreate`,
so no special methods or hooks are necessary to access them.

As a rule, it is better to use link mechanisms to create relationships during initialization and normalization,
but nevertheless, `beforeDataCreate` can be quite useful.

## Hook Change Events

Whenever a component hook value changes,
the component emits a series of events that can be listened to both inside and outside the component.

| EventName    | Description                                  | Payload description                         | Payload            |
|--------------|----------------------------------------------|---------------------------------------------|--------------------|
| `hook:$name` | The component switched to a hook named $name | The new hook value; The previous hook value | `string`; `string` |
| `hookChange` | The component switched to a new hook         | The new hook value; The previous hook value | `string`; `string` |

## Registering lifecycle hooks

To bind a method to a specific hook, there are three ways:

1. For all Vue compatible hooks, you can define a method of the same name that will automatically link with the hook.

   ```typescript
   import iBlock, { component, field } from 'components/super/i-block/i-block';

   @component()
   export default class bExample extends iBlock {
     @field()
     i: number = 0;

     created() {
       console.log(this.i);
     }
   }
   ```

2. You can use the `@hook` decorator, which accepts a hook name or a list of names.
   This way is preferred because it allows you to write more flexible code.
   Note that the non-standard `beforeRuntime` and `beforeDataCreate` hooks can only be used through a decorator.

   ```typescript
   import iBlock, { component, field, hook } from 'components/super/i-block/i-block';

   @component()
   export default class bExample extends iBlock {
     @field()
     i: number = 0;

     @hook(['created', 'mounted'])
     logI() {
       console.log(this.i);
     }
   }
   ```

3. You can listen to a specific hook change event or a transition to a specific hook.

   ```typescript
   import iBlock, { component } from 'components/super/i-block/i-block';

   @component()
   export default class bExample extends iBlock {
     created() {
       this.on('onHookChange', (currentHook, prevHook) => {
         console.log(currentHook, prevHook);
       });

       this.once('onHook:mounted', (currentHook, prevHook) => {
         console.log(currentHook, prevHook);
       });
     }
   }
   ```

### Component Hook Accessor

All V4Fire components have a hook accessor that indicates which hook the component is currently in.

```typescript
import iBlock, { component, hook } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @hook('mounted')
  onMounted() {
    // mounted
    console.log(this.hook);
  }
}
```

## Hook Handler Execution Order

All hook handlers are executed in a queue: those added through the decorator are executed first (in order of addition),
and then the associated methods (if any) are already executed.
If we need to declare that some method should be executed only after the execution of another,
then we can set this explicitly through a decorator.

```typescript
import iBlock, { component, field, hook } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @hook('created')
  a() {
    console.log('a');
  }

  @hook(['created', 'mounted'])
  b() {
    console.log('b');
  }

  @hook({created: 'b'})
  c() {
    console.log('c');
  }

  @hook({created: ['a', 'b'], mounted: 'b'})
  d() {
    console.log('d');
  }
}
```

### Asynchronous handlers

Some hooks support asynchronous handlers: `mounted`, `updated`, `destroyed`,
`renderTriggered` and `errorCaptured`.
That is, if one of the hook handlers returns a Promise,
then the rest will wait for its resolving to preserve the initialization order.

## Additional options

### [after]

A method name or a list of names after which this handler should be invoked on a registered hook event.

```typescript
import iBlock, { component, hook } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @hook('mounted')
  initializeComponent() {

  }

  @hook({mounted: {after: 'initializeComponent'}})
  addedListeners() {

  }

  @hook({mounted: {after: ['initializeComponent', 'addedListeners']}})
  sendData() {

  }
}
```

### [functional = `true`]

If set to false, the registered hook handler won't work inside a functional component.
