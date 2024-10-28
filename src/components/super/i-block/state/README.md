# components/super/i-block/state

This module provides an API for convenient work with component states.

## Component Lifecycle

Each V4Fire component instance undergoes a series of initialization steps when it's created;
for instance, it needs to set up data observation, compile the template, mount the instance to the DOM,
and update the DOM when data changes.
Throughout the process, it also initiates functions called lifecycle hooks,
allowing users to incorporate their own code at specific stages.

### Supported Hooks

V4Fire components follow a standard life cycle: the component is created, the component is mounted to the DOM,
the component is unmounted from the DOM, and so on.

V4Fire implements an extended version of the [Vue component life cycle](https://vuejs.org/api/options-lifecycle.html#options-lifecycle).
That is, the V4 component supports all the lifecycle states (hereinafter referred to as hooks) of the Vue component and
adds two of its own.

1. `beforeRuntime` - a hook that is called prior to `beforeCreate`;
2. `beforeDataCreate` - a hook that is called after `beforeCreate` but prior to `created`.

Additionally, V4Fire uses the `beforeDestroy` and `destroyed` hooks,
instead of `beforeUnmount` and `unmounted` as in Vue3.

#### beforeRuntime

The need for this hook arises due to limitations in Vue: the fact is that when a component is invoked within a template,
it is in a state where it does not yet possess its own methods and fields, but solely props (`beforeCreate`).
After `beforeCreate`, a special function is run on the component which forms a base object with the watchable fields
of the component, and only then is created triggered.
Hence, before created we cannot use the component API, like methods,
getters, etc. However, to use some methods before the created hook,
the [[iBlock]] class incorporates the following code.

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

In other words, before `beforeCreate`,
there's a special method that is invoked to explicitly set the most essential API,
which the component should always possess.
There are few methods that can be used before the `created` hook,
and usually, all of them are registered in `iBlock.initBaseAPI`.
However, if your component has a new method that needs to be used in this manner,
the `initBaseAPI` method can always be overridden.

#### beforeDataCreate

Often, it is crucial to perform some modifications to watchable fields (like normalization) before creating a component,
because once created, any change to these fields can trigger re-rendering and potentially be detrimental to performance.
We have links, initializers, and API to manage the order of initialization, but in case we need to access the entire
watchable store and modify it complexly, the `beforeDataCreate` hook comes to the rescue.
This hook is exactly triggered when all observable properties have been formulated
but are not yet linked to the component.
Therefore, we can safely alter them without worrying about repercussions.

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
    // we can't call them directly, but only through special methods
    if (this.field.get('i') === 0) {
      this.field.set('j', 1);
    }
  }
}
```

It's also worth noting that the `@prop` and `@system` properties are initialized before `beforeCreate`,
so there is no need for special methods or hooks to access them.

Typically, it's better to use link mechanisms for establishing relationships during initialization and normalization.
However, `beforeDataCreate` can still prove to be quite useful.

### Hook Change Events

Every time a component hook value changes,
the component triggers a series of events that can be listened to both internally and externally to the component.

| EventName    | Description                                  | Payload description                         | Payload            |
|--------------|----------------------------------------------|---------------------------------------------|--------------------|
| `hook:$name` | The component switched to a hook named $name | The new hook value; The previous hook value | `string`; `string` |
| `hookChange` | The component switched to a new hook         | The new hook value; The previous hook value | `string`; `string` |

### Registering Lifecycle Hooks

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
   This method is preferred because it permits more flexible code writing.
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

All V4Fire components have a hook accessor that indicates the current hook of the component.

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

### Hook Handler Execution Order

All hook handlers are executed in a queue: those added through the decorator are executed first
(in the order of addition), followed by the execution of the associated methods (if any).
If we need to declare that a certain method should be executed only after the execution of another,
then we can explicitly set this through a decorator.

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

### Asynchronous Handlers

Certain hooks support asynchronous handlers: `mounted`, `updated`, `destroyed`, `renderTriggered`, and `errorCaptured`.
That is, if one of the hook handlers returns a Promise,
then the rest will wait for its resolution to maintain the initialization order.

## Component Status

V4Fire provides a special status for components that reflects their state: whether the component is loading, ready,
and so on.
We already have a similar status — these are component lifecycle hooks, like `created` or `mounted`.
However, they don't mirror the component state in terms of loading.
For instance, a component might be mounted, but in reality, it might display a spinner and be loading data.
Therefore, all V4Fire components possess the special componentStatus property.
This property can assume the following values:

1. `unloaded` - the component has been just created without any initialization:
   this status might coincide with certain component hooks such as `beforeCreate` or `created`.

2. `loading` - the component begins its data loading process from providers:
   this status might coincide with certain component hooks such as `created` or `mounted`.
   If the component gets mounted with this status,
   it can be reflected in the component's UI, for instance, by displaying a loading indicator.

3. `beforeReady` - the component has fully loaded and is starting to prepare for rendering:
   this status might coincide with certain component hooks such as created or mounted.

4. `ready` - the component has been completely loaded and rendered:
   this status might coincide with the mounted hook.

5. `inactive` - the component is in a dormant state,
   made so by a keep-alive manager or directly through an `activatedProp`:
   this status might coincide with the `deactivated` hook.

6. `destroyed` - the component has been destroyed:
   this status might coincide with certain component hooks such as `beforeDestroy` or `destroyed`.

### Component Status Change Events

Each time a component status value changes,
the component emits a series of events that can be listened to both internally and externally to the component.

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

### Component Status Accessor

All V4Fire components have a status accessor that indicates the current status of the component.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  created() {
    console.log(this.componentStatus);
  }
}
```

### The `@wait` Decorator

This decorator addresses the issue of invoking component methods when the component is not yet ready for it.
Refer to the documentation for the `components/super/i-block/decorators` module.

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

## Syncing Component State with External Sources

Any component can bind its state to the state of another external module.
For instance, a component may store some of its properties in local storage.
This implies that when such a property changes, it should be automatically synchronized with the storage,
and conversely, when the component initializes, we must read its value from the storage.
This is precisely what this module does — it provides a set of APIs to synchronize external states with
the component state.

### How Synchronization Works

Synchronization operates using two-way connector methods.
For instance, when a component is initializing, it invokes the special `syncStorageState` method,
which accepts data from the storage associated with the component as an argument.
If this method returns an object, then the values of this object will be mapped to
the component properties (the keys are the names of the properties).
Conversely, each of these properties will be watched and when any of them change,
`syncStorageState` will be called again, which will now accept an object
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

By default, all components possess two fundamental methods for synchronizing with
the router: `syncRouterState` and `convertStateToRouterReset`.

Similarly, all components have two analogous methods for synchronization with
storage: `syncStorageState` and `convertStateToStorageReset`.

## API

### Props

#### [syncRouterStoreOnInit = `false`]

If set to true, the component state will be synchronized with the router after initialization.
For example, you have a component that uses the `syncRouterState` method to create two-way binding with the router:

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field()
  stage: string = 'defaultStage';

  syncRouterState(data?: Dictionary) {
    // This notation signifies that if there is a value within the `route.query`,
    // it will be mapped to the component as stage.
    // This mapping will also be repeated if the route has been changed.
    // Additionally, if the stage field of the component has been modified,
    // it will be mapped to the router query parameters as stage using `router.push`.
    return {stage: data?.stage || this.stage};
  }
}
```

However, in certain cases where the stage value is not present in the `route.query`,
and the component has a default value for stage.
We may encounter a situation where there is a route that has not been synchronized with the component.
This can impact the logic for "back" navigation as it may not meet our expectations.

To address this, if you set `syncRouterStateOnInit` to true,
the component will force its state to be synchronized with the router after initialization.
This ensures that the component's state is always in sync with the router,
even if the route does not have the stage value initially.
This can provide a more consistent navigation experience, especially when using "back" navigation.

### Fields

#### ssrRendering

If set to false, the component will not render its content during SSR.

In a hydration context, the field value is determined by the value of the `renderOnHydration` flag,
which is stored in a `hydrationStore` during SSR for components that
have the `ssrRenderingProp` value set to false.
In other cases, the field value is derived from the `ssrRenderingProp` property.

### Getters

#### hook

A string value that indicates which lifecycle hook the component is currently in.
For instance, `created`, `mounted` or `destroyed`.

#### isRelatedToSSR

True if the component is in the context of SSR or hydration.

#### remoteState

A link to the global state of the application.
The state interface is described in the `core/component/state` module.

The state object provides multiple APIs for interacting with the application environment,
for example, the location or session modules.

Also, you can extend this object with any necessary properties.
Please note that the state object is observable and can be reactively bound to component templates.

#### isReady

True if the current component is fully prepared to function.
The `ready` status means that the component is mounted and all data providers have been loaded.

#### isReadyOnce

This is true if the component has been in the `ready` state at least once.

#### router

A link to the application router.

#### route

A link to the current route object.

#### stageGroup

A name of the [[Async]] group associated with the `stage` parameter.

### Accessors

#### componentStatus

A string value indicating the initialization status of the component:

1. `unloaded` - the component has been just created without any initialization:
   this status might coincide with certain component hooks such as `beforeCreate` or `created`.

2. `loading` - the component begins its data loading process from providers:
   this status might coincide with certain component hooks such as `created` or `mounted`.
   If the component gets mounted with this status,
   it can be reflected in the component's UI, for instance, by displaying a loading indicator.

3. `beforeReady` - the component has fully loaded and is starting to prepare for rendering:
   this status might coincide with certain component hooks such as created or mounted.

4. `ready` - the component has been completely loaded and rendered:
   this status might coincide with the mounted hook.

5. `inactive` - the component is in a dormant state,
   made so by a keep-alive manager or directly through an `activatedProp`:
   this status might coincide with the `deactivated` hook.

6. `destroyed` - the component has been destroyed:
   this status might coincide with certain component hooks such as `beforeDestroy` or `destroyed`.

#### stage

A string value specifying the logic state in which the component should operate.
For instance, depending on this option, the component may render different templates
by distinguishing them with the `v-if` directive.

##### Component stage change events

Each time a component stage value changes,
the component emits a series of events that can be listened to both internally and externally to the component.

| EventName     | Description                                   | Payload description                           | Payload            |
|---------------|-----------------------------------------------|-----------------------------------------------|--------------------|
| `stage:$name` | The component switched to a stage named $name | The new stage value; The previous stage value | `string`; `string` |
| `stageChange` | The component switched to a new stage         | The new stage value; The previous stage value | `string`; `string` |

### Methods

#### getComponentInfo

Returns a dictionary containing information about the component, useful for debugging or logging purposes.

```
getComponentInfo(): Dictionary {
  return {
    name: this.componentName,
    hook: this.hook,
    componentStatus: this.componentStatus
  };
}
```

#### waitComponentStatus

Returns a promise that will be resolved when the component transitions to the specified component status.

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

This method serves as a two-way connector between the component and its storage.

During the component's initialization, it requests its associated data from the storage,
using the `globalName` prop as the namespace for the search.
When the storage is ready to supply the data to the component, it passes the data to this method.
Consequently, the method returns a dictionary associated with the component properties
(complex paths with dots can be specified, like `'foo.bla.bar'` or `'mods.hidden'`).

Moreover, the component will monitor changes to each property in this dictionary.
If at least one of these properties changes, the entire data batch gets synchronized with
the storage using this method.
When the component delivers the storage data, the second argument to the method is `'remote'`.

#### convertStateToStorageReset

Returns a dictionary with the default component properties to reset the storage state.
This method will be used when calling `state.resetStorage`.

#### syncRouterState

This method serves as a two-way connector between the component and the application router.

During the component's initialization, it requests its associated data from the router.
The router delivers the data by using this method.
Following this, the method returns a dictionary associated with the component properties
(you can specify a complex path with dots, such as `'foo.bla.bar'` or `'mods.hidden'`).

Moreover, the component will monitor changes to each property within this dictionary.
If at least one of these properties changes,
the entire data batch is synchronized with the router using this method.
When the component supplies the data to the router, the second argument to the method is `'remote'`.

Keep in mind that the router is global to all components.
This means the dictionary passed to the router by this method will extend the existing route data,
but not override it (`router.push(null, {...route, ...componentData})`).

#### convertStateToRouterReset

Returns a dictionary with the default component properties to reset the router state.
This method will be used when calling `state.resetRouter`.

#### hydrateStyles

This method is used to hydrate the component styles for server-side rendering (SSR).
It is automatically invoked for the current component upon creation.

Since this method is called automatically during the component's lifecycle,
there is generally no need to call it manually.
However, if you need to manually force a hydration of styles, you can call it as follows:

```typescript
yourComponentInstance.hydrateStyles('yourComponentName');
```
