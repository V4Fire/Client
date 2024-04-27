# components/super/i-block/state

This module provides an API for convenient work with component states.

## Component lifecycle

Each V4Fire component instance goes through a series of initialization steps when it's created - for example, it needs to set up data observation,
compile the template, mount the instance to the DOM, and update the DOM when data changes. Along the way, it also runs functions called lifecycle
hooks, giving users the opportunity to add their own code at specific stages.

### Supported hooks

V4Fire components have a standard life cycle: the component is created, the component is mounted to the DOM,
the component is unmounted from the DOM, and so on. V4Fire implements an extended version of the [Vue component life cycle](https://vuejs.org/api/options-lifecycle.html#options-lifecycle).
That is, the V4 component supports all the lifecycle states (hereinafter referred to as hooks) of the Vue component and
adds two of its own.

1. `beforeRuntime` is a hook that is called before `beforeCreate`;
2. `beforeDataCreate` is a hook that is called after `beforeCreate` but before `created`.

Also, V4Fire uses the `beforeDestroy` and `destroyed` hooks, not `beforeUnmount` and `unmounted` as Vue3 does.

#### beforeRuntime

The need for this hook exists due to Vue limitations: the fact is that when a component is called within a template,
it has a state when it does not yet have its own methods and fields, but only props (`beforeCreate`).
After `beforeCreate`, a special function is called on the component, which forms a base object with the watchable fields
of the component, and only then `created` is triggered. So, before `created` we cannot use the component API, like methods,
getters, etc. However, in order to use some methods before the `created` hook, the [[iBlock]] class has the following code.

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
which the component should always have. There are not many methods that can be used before the `created` hook,
and usually all of them are registered in `iBlock.initBaseAPI`. However, if your component has a new method that needs
to be used in this way, you can always override the `initBaseAPI` method.

#### beforeDataCreate

It is often necessary to make some modification to watchable fields (such as normalization) before creating a component,
because once created, any change to such fields can cause re-rendering and can be disastrous for performance.
We have links, initializers, and API to control the order of initialization, but what if we need to get the entire
watchable store and modify it in a complex way. It is to solve this problem that the `beforeDataCreate` hook exists:
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
so no special methods or hooks are needed to access them.

As a rule, it is better to use link mechanisms to create relationships during initialization and normalization,
but nevertheless, `beforeDataCreate` can be quite useful.

### Hook change events

Every time a component hook value changes, the component emits a series of events that can be listened to both inside and outside the component.

| EventName    | Description                                  | Payload description                         | Payload            |
|--------------|----------------------------------------------|---------------------------------------------|--------------------|
| `hook:$name` | The component switched to a hook named $name | The new hook value; The previous hook value | `string`; `string` |
| `hookChange` | The component switched to a new hook         | The new hook value; The previous hook value | `string`; `string` |

### Registering lifecycle hooks

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

### Component hook accessor

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

### Hook handler execution order

All hook handlers are executed in a queue: those added through the decorator are executed first (in order of addition),
and then the associated methods (if any) are already executed. If we need to declare that some method should be executed
only after the execution of another, then we can set this explicitly through a decorator.

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

Some hooks support asynchronous handlers: `mounted`, `updated`, `destroyed`, `renderTriggered` and `errorCaptured`.
That is, if one of the hook handlers returns a Promise, then the rest will wait for its resolving to preserve the initialization order.

## Component status

V4Fire provides a special status for components that displays their state: the component is loading, the component is ready,
and so on. We already have a similar status - these are component lifecycle hooks, like `created` or `mounted`.
But they don't reflect the component state in terms of loading. For example, a component can be mounted, but in fact
show a spinner and load data. Therefore, all V4Fire components have the special `componentStatus` property.
This property can take the following values:

* `unloaded` - the component has just been created, but does not load any data;
* `loading` - the component loads its data;
* `beforeReady` - the component has loaded all the necessary data and is preparing to update its template;
* `ready` - the component has loaded all the necessary data and started updating the template;
* `inactive` - the component is deactivated (see `components/super/i-block/modules/activation`);
* `destroyed` - the component is destroyed.

### Component status change events

Every time a component status value changes, the component emits a series of events that can be listened to both inside and outside the component.

| EventName               | Description                                    | Payload description                             | Payload            |
|-------------------------|------------------------------------------------|-------------------------------------------------|--------------------|
| `componentStatus:$name` | The component switched to a status named $name | The new status value; The previous status value | `string`; `string` |
| `componentStatusChange` | The component switched to a new status         | The new status value; The previous status value | `string`; `string` |

```typescript
import iBlock, { component, field, hook } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
 created() {
   this.on('componentStatusChange', (currentStatus, prevStatus) => {
     console.log(currentStatus, prevStatus);
   });

   this.on('componentStatusChange:ready', (currentStatus, prevStatus) => {
     console.log(currentStatus, prevStatus);
   });
 }
}
```

### Component status accessor

All V4Fire components have a status accessor that indicates which status the component is currently in.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  created() {
    console.log(this.componentStatus);
  }
}
```

### The `@wait` decorator

This decorator solves the problem of calling component methods in a state when the component is not yet ready to do so.
See the documentation for the `components/super/i-block/decorators` module.

```typescript
import iBlock, { component, field, wait } from 'components/super/i-block/i-block';

interface User {
  firstName: string;
  lastName: string;
  age: number;
}

@component()
class bExample extends iBlock {
  @field()
  user?: User;

  // Pay attention to the decorator
  @wait('ready')
  getUserName(): string | Promise<string> {
    return `${this.user?.firstName} ${this.user.lastName}`;
  }

  async initLoad() {
    // ...
  }

  async created() {
    // `await` works correctly with both promises and regular values
    const user = await this.getUserName();
    console.log(user);
  }
}
```

## Synchronizing component state with external sources

Any component can bind its state to a state of another external module.
For example, a component may store some of its properties in a local storage.
This means that when such a property changes, it should be automatically synchronized with the storage,
and on the other hand, when the component is initialized, we must read its value from the storage.
This is exactly what this module does - it offers a set of APIs to synchronize external states with a component state.

### How does synchronization work?

Synchronization works using two-way connector methods. For example, when a component is initializing,
it calls the special `syncStorageState` method, which takes data from the storage associated with the component as
an argument. If this method returns an object, then the values of this object will be mapped to
the component properties (the keys are the names of the properties). On the other hand, each of these properties
will be watched and when any of them change, `syncStorageState` will be called again, which will now take an object
with the component state and should return an object to store in the storage.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';
import State, { initFromStorage } from 'components/friends/state';

VDOM.addToPrototype({initFromStorage});

@component()
export default class bExample extends iBlock {
  @field()
  opened: boolean = false;

  syncStorageState(data, type) {
    // This type indicates that data is loaded from the storage
    if (type === 'remote') {
      return {
        opened: data.isOpened
      };
    }

    // Saving data to the storage
    return {
      isOpened: this.opened
    };
  }
}
```

By default, all components have two basic methods for synchronizing with the router: `syncRouterState` and `convertStateToRouterReset`.
Also, all components have two similar methods for synchronizing with a storage: `syncStorageState` and `convertStateToStorageReset`.

## API

### Props

#### [syncRouterStoreOnInit = `false`]

If true, the component state will be synchronized with the router after initializing.
For example, you have a component that uses the `syncRouterState` method to create two-way binding with the router.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field()
  stage: string = 'defaultStage';

  syncRouterState(data?: Dictionary) {
    // This notation means that if there is a value within `route.query`
    // it will be mapped to the component as `stage`.
    // If the route has been changed, the mapping is repeated.
    // Also, if the `stage` field of the component has been changed,
    // it will be mapped to the router query parameters as `stage` by using `router.push`.
    return {stage: data?.stage || this.stage};
  }
}
```

But, if in some cases we don't have `stage` in `route.query`, and the component has a default value,
we trap in a situation where there is a route that has not been synchronized with the component.
This can affect the "back" navigation logic. Sometimes this behavior does not meet our expectations.
But if we switch `syncRouterStoreOnInit` to true, the component will force its state to be synchronized with
the router after initialization.

### Fields

#### ssrRendering

If true, the component will render its content during SSR.
In a hydration context, the field value is determined by the `renderOnHydration` flag value, which is
stored in a `hydrationStore` during SSR for components with a `ssrRenderingProp` value set to `false`.
In other instances, the field value is derived from the `ssrRenderingProp` prop.

### Getters

#### hook

A string value that indicates what lifecycle hook the component is in.
For instance, `created`, `mounted` or `destroyed`.

#### isRelatedToSSR

True if the component is in the context of SSR or hydration.

#### remoteState

A link to an application state object located in `core/component/state`.

This object is used to set any general application parameters. For example, the status of user authorization or
online connection; global sharable application data, etc.

The way you work with the state object itself is up to you. You can use an API like Redux or just set
properties directly. Note that the state object is observable and can be reactively bond to component templates.

#### isReady

True if the current component is completely ready to work.
The `ready` status is mean that the component is mounted and all data providers are loaded.

#### isReadyOnce

True if the component has been in the `ready` state at least once.

#### router

A link to the application router.

#### route

A link to the active route object.

#### stageGroup

A name of the [[Async]] group associated with the `stage` parameter.

### Accessors

#### componentStatus

A string value indicating the component initializing status:

1. `unloaded` - the component has just been created without any initializing:
   this status may overlap with some component hooks such as `beforeCreate` or `created`.

2. `loading` - the component starts loading data from its providers:
   this status may overlap with some component hooks such as `created` or `mounted`.
   If the component has been mounted with this status, you can display this in the component UI.
   For example, by showing a loading indicator.

3. `beforeReady` - the component has been fully loaded and has started preparing to render:
   this status may overlap with some component hooks such as `created` or `mounted`.

4. `ready` - the component has been fully loaded and rendered: this status may overlap with the `mounted` hook.

5. `inactive` - the component is frozen by a keep-alive manager or directly using `activatedProp`:
   this status can overlap with the `deactivated` hook.

6. `destroyed` - the component has been destroyed:
   this status may overlap with some component hooks such as `beforeDestroy` or `destroyed`.

#### stage

A string value that specifies in which logical state the component should run.
For instance, depending on this option, the component can render different templates by separating them with `v-if` directives.

##### Component stage change events

Every time a component stage value changes, the component emits a series of events that can be listened to both inside and outside the component.

| EventName     | Description                                   | Payload description                           | Payload            |
|---------------|-----------------------------------------------|-----------------------------------------------|--------------------|
| `stage:$name` | The component switched to a stage named $name | The new stage value; The previous stage value | `string`; `string` |
| `stageChange` | The component switched to a new stage         | The new stage value; The previous stage value | `string`; `string` |

### Methods

#### getComponentInfo

Returns a dictionary with information for debugging or logging the component.

```
getComponentInfo(): Dictionary {
  return {
    name: this.componentName,
    hook: this.hook,
    componentStatus: this.componentStatus
  };
}
```

#### waitStatus

Returns a promise that will be resolved when the component is switched to the specified component status.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  created() {
    this.waitComponentStatus('ready').then(console.log);
  }
}
```

#### syncStorageState

This method works as a two-way connector between the component and its storage.

While the component is initializing, it requests the storage for its associated data, using the `globalName` prop
as the namespace to search. When the storage is ready to provide data to the component, it passes the data to
this method. After that, the method returns a dictionary associated with the component properties
(you can specify a complex path with dots, like `'foo.bla.bar'` or `'mods.hidden'`).

Also, the component will watch for changes to each property in this dictionary.
If at least one of  these properties is changed, the entire data batch will be synchronized with the storage
using this method. When the component provides the storage data, the second argument to the method is `'remote'`.

#### convertStateToStorageReset

Returns a dictionary with the default component properties to reset the storage state.
This method will be used when calling `state.resetStorage`.

#### syncRouterState

This method works as a two-way connector between the component and the application router.

While the component is initializing, it requests the router for its associated data.
The router provides the data by using this method. After that, the method returns a dictionary associated with
the component properties (you can specify a complex path with dots, like `'foo.bla.bar'` or `'mods.hidden'`).

Also, the component will watch for changes to each property in this dictionary.
If at least one of  these properties is changed, the entire data batch will be synchronized with the router
using this method. When the component provides the router data, the second argument to the method is `'remote'`.

Keep in mind that the router is global to all components, meaning the dictionary this method passes to the router
will extend the current route data, but not override  (`router.push(null, {...route, ...componentData}})`).

#### convertStateToRouterReset

Returns a dictionary with the default component properties to reset the router state.
This method will be used when calling `state.resetRouter`.
