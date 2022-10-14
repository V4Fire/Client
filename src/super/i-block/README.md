# super/i-block

This module provides a super class for any V4Fire components.
This class contains the most necessary APIs, such as: event API, modifiers API, state and life cycle API, property watching API, etc.
The functionality is divided into several parts: the behavior that the class itself declares and the many friendly classes that work through composition.
Also, this module re-exports part of the functionality and types from the `core/component` module.

```typescript
import iBlock, { component, prop, field } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @prop(Number)
  a: number;

  @prop(Number)
  b: number;

  @field(ctx => ctx.a + ctx.b)
  result: number;
}
```

## Friendly classes

The `iBlock` class has many properties that delegate functionality to other modules.
Some of these properties can be used anywhere, and some only within the class or its descendants.
For more information on any of these properties, refer to their module documentation.

### Public

* `provide` (`friends/provide`) - a class with methods to provide component classes/styles to another component, etc.
* `field` (`friends/field`) - a class with helper methods for safely accessing component/object properties.
* `analytics` (`friends/analytics`) - a class to send component analytic events.
* `sync` (`friends/sync`) - an API to synchronize fields and props of the component.
* `asyncRender` (`friends/async-render`) - a class to render component fragments asynchronously.
* `vdom` (`friends/vdom`) - a class for low-level working with a component VDOM tree.
* `lfc` (`super/i-block/modules/lfc`) - a class with helper methods to work with the component life cycle.

### Protected

* `daemons` (`friends/daemons`) - a class to create daemons associated with a component.
* `block` (`friends/block`) - an API to work with a component in terms of [BEM](https://en.bem.info/methodology/quick-start/).
* `dom` (`friends/dom`) - a class for low-level working with a component DOM tree.

* `async` (`core/async`) - an API to tie and control async operations.
* `$async` (`core/async`) - an API to tie and control async operations (this API is used for protected/private consumers,
   such as private directives or component engines).

* `storage` (`friends/storage`) - a class for persistent storage of component data.
* `state` (`friends/state`) - a class with methods to initialize a component state from various related sources.

* `moduleLoader` (`friends/module-loader`) - a class to manage dynamically loaded modules.
* `opt` (`super/i-block/modules/opt`) - a class with helper methods to optimize component rendering.
* `browser` (`core/helpers`) - an API to determine the current browser name/version.

* `h` (`core/helpers`) - a dictionary with some helper functions.
* `l` - a link to the `globalThis.l` function.

* `location` - a link to the native `location` API.
* `global` - a link to the global object.
* `console` - a link to the native `console` API.

## Event API

Any V4Fire component implements the event emitter interface, and also contains a number of getters for convenient work
with events from other components, such as parent events, root component events, etc.

### Basic concept

The component has a set of methods for emitting and listening to events: `on`, `once`, `promisifyOnce`, `off`, `emit`,
`emitError` and `dispatch`.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.on('myEvent', (component, ...eventArgs) => {
      console.log(component, ...eventArgs);
    });

    this.emit('myEvent', 1, 2, 3);
  }
}
```

It is worth noting here that in addition to the arguments that we explicitly passed to `emit`, the event handler received a
reference to the component that fired this event. This is very handy in cases where we listen to the events of one component
from another component. However, this behavior is not always convenient. Therefore, the `emit` method automatically sends a second event,
where only explicit arguments are passed. The name of such an event is formed according to the pattern `on${eventName}`,
for example, `click` and `onClick`.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.on('onMyEvent', (...eventArgs) => {
      console.log(...eventArgs);
    });

    this.emit('myEvent', 1, 2, 3);
  }
}
```

All event names are converted to camelCase.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.on('on-my-event', (...eventArgs) => {
      console.log(...eventArgs);
    });

    this.emit('myEvent', 1, 2, 3);
  }
}
```

In addition to the `on` method, we can use the `once` and `promisifyOnce` methods, which will only catch the event once,
and then the listener will be detached. The `promisifyOnce` method takes the event name to listen for and returns a promise.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.once('onMyEvent', (...eventArgs) => {
      console.log(...eventArgs);
    });

    this.promisifyOnce('myEvent').then(console.log);

    this.emit('myEvent', 1, 2, 3);
    this.emit('myEvent', 2, 3, 4);
  }
}
```

Also, all methods for listening to events are wrapped by the [[Async]] instance of the component within which they are used.
Therefore, you do not need to think about clearing events after the component is destroyed, and you can also provide
additional Async parameters when adding a listener.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.on('onMyEvent', (...eventArgs) => {
      console.log(...eventArgs);
    }, {
      label: 'myEvent',
      join: true
    });

    this.promisifyOnce('myEvent', {group: 'myGroup'}).then(console.log);

    this.emit('myEvent', 1, 2, 3);
  }
}
```

To cancel listening to an event, use the `off` method. Event listeners can be detached by a link,
or by a group and/or label. If nothing is passed, all registered handlers will be detached.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    const id = this.on('onMyEvent', console.log);

    this.on('onMyEvent', console.log, {group: 'events'});
    this.on('onMyEvent', console.log, {label: 'onMyEvent'});

    this.emit('myEvent', 1, 2, 3);

    this.off(id);
    this.off({group: 'events'});

    // Detach all listeners with groups starting with `even`
    this.off({group: /^even/});

    this.off({label: 'onMyEvent'});

    // Detach all listeners
    this.off();
  }
}
```

To cancel a listener with `promisefyOnce`, simply use the `async.cancelPromise` method.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.promisifyOnce('onMyEvent', {group: 'events'}).then(console.log);
    this.async.cancelPromise({group: 'events'});
  }
}
```

Note that if you do not explicitly set a group name, it will be equal to the event name being listened to.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.on('onMyEvent', console.log);
    this.on('onMyEvent', console.log);
    this.on('onMyEvent', console.log);
    this.on('onMyEvent', console.log);

    this.off({group: 'onMyEvent'});
  }
}
```

To emit events, use the `emit` method. In addition to `emit`, there is also the `emitError` method. The main difference between these methods is the logging level of emitted events.
See the section on event logging for more details.

All such events can be caught both using the `on`, `once`, `promisifyOnce` methods,
and using the `v-on` directive in the component template.

__b-example.ts__

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.emit('myEvent', {data: 'some message'});
  }
}
```

__b-another-example.ss__

```
- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < b-example @myEvent = console.log
```

In addition, if you set the `dispatching` prop to a component, then when an event is fired, the component will emit the same event,
but from its parent. That is, the event begins to "bubble up" in the hierarchy, like DOM events. If the parent component also
has `dispatching` set, then bubbling will continue. When bubbling, the name of such an event changes according to
the pattern `${componentName}::${eventName}`.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  override dispatching: boolean = true;

  created() {
    this.$parent.on('bExample::fooBar', console.log);
    this.$parent.on('bExample::onFooBar', console.log);
    this.emit('fooBar', 42);
  }
}
```

If the component, in addition to `dispatching`, also has `globalName` set, then such events also bubble up with a name
based on the pattern `${globalName}::${eventName}`.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  override globalName: string = 'myTest';
  override dispatching: boolean = true;

  created() {
    this.$parent.on('myTest::fooBar', console.log);
    this.$parent.on('myTest::onFooBar', console.log);
    this.emit('fooBar', 42);
  }
}
```

Finally, if the parent component has the `selfDispatching` prop set to true, then such bubbling events will be fired
on the component as their own, rather than by the changed name.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  override globalName: string = 'myTest';
  override dispatching: boolean = true;

  created() {
    if (this.$parent.selfDispatching === true) {
      this.$parent.on('fooBar', console.log);
      this.$parent.on('onFooBar', console.log);
    }

    this.emit('fooBar', 42);
  }
}
```

However, there are a number of events that cannot bubble up in this way, because this would lead to errors.
There is a special `canSelfDispatchEvent` method that returns true if the component can handle the passed event in `selfDispatching` mode.

In addition to the above, any component also has the `dispatch` method that triggers the event dispatch mechanism.
Generally, you don't need to explicitly use this method.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    if (this.$parent.selfDispatching === true) {
      this.$parent.on('fooBar', console.log);
      this.$parent.on('onFooBar', console.log);
    }

    this.dispatch('fooBar', 42);
  }
}
```

### Event logging

All component events that are emitted by the `emit` method are additionally logged. The `log` method is used for logging.
To enable logging of certain events, simply set the required pattern using the `setEnv` function.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    setEnv('log', {patterns: ['event:fooBar']});
    this.emit('fooBar', 42);
  }
}
```

By default, events that are emitted via `emit` use the `info` logging context. Such messages will be ignored unless
the component explicitly sets the `verbose` prop to true. It is allowed to explicitly specify the logging level for the emitted event.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    setEnv('log', {patterns: ['event:fooBar']});
    this.emit({event: 'fooBar', logLevel: 'warn'}, 42);
    this.emit({event: 'fooBar', logLevel: 'error'}, 42);
  }
}
```

Events emitted with the `emitError` method always have the `error` logging context.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    setEnv('log', {patterns: ['event:fooBar']});
    this.emitError('fooBar', 42);
  }
}
```

### Getters

#### selfEmitter

The component event emitter.
All events fired by this emitter can be listened to "outside" with the `v-on` directive.
Also, these events can bubble up the component hierarchy.

__b-example.ts__

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.selfEmitter.emit('myEvent', {data: 'some message'});
  }
}
```

__b-another-example.ss__

```
- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < b-example @myEvent = console.log
```

#### localEmitter

The component local event emitter.
Unlike `selfEmitter`, events that are fired by this emitter cannot be caught "outside" with the `v-on` directive,
and these events do not bubble up. Also, such events can be listened to by a wildcard mask.

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.localEmitter.on('example.*', console.log);
    this.localEmitter.emit('example.a', 1);
    this.localEmitter.emit('example.b', 2);
  }
}
```

#### parentEmitter

The parent component event emitter.
To avoid memory leaks, only this emitter is used to listen for parent events.

```typescript
import iBlock, { component, prop, field } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.parentEmitter.on('example', console.log);
    this.$parent.emit('example', 1);
  }
}
```

#### rootEmitter

The root component event emitter.
To avoid memory leaks, only this emitter is used to listen for root events.

```typescript
import iBlock, { component, prop, field } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.rootEmitter.on('example', console.log);
    this.$root.emit('example', 1);
  }
}
```

#### globalEmitter

The global event emitter located in `core/component/event`.
This emitter should be used to listen for external events, such as events coming over a WebSocket connection, etc.
Also, such events can be listened to by a wildcard mask. To avoid memory leaks, only this emitter is used to listen
for global events.

```typescript
import { globalEmitter } from 'core/component';
import iBlock, { component, prop, field } from 'super/i-block/i-block';

globalEmitter.emit('example.a', 1);
globalEmitter.emit('example.b', 2);

@component()
export default class bExample extends iBlock {
  created() {
    this.globalEmitter.on('example.*', console.log);
  }
}
```

### Methods

#### on

Attaches an event listener to the specified component event.

```typescript
import iBlock, { component, prop, field } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.on('myEvent', console.log);
    this.emit('myEvent', 42);
  }
}
```

#### once

Attaches a disposable event listener to the specified component event.

```typescript
import iBlock, { component, prop, field } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.once('myEvent', console.log);
    this.emit('myEvent', 42);
    this.emit('myEvent', 42);
  }
}
```

#### promisifyOnce

Returns a promise that is resolved after emitting the specified component event.

```typescript
import iBlock, { component, prop, field } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.promisifyOnce('myEvent').then(console.log);
    this.emit('myEvent', 42);
    this.emit('myEvent', 42);
  }
}
```

#### off

Detaches an event listener from the component.

```typescript
import iBlock, { component, prop, field } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.on('myEvent', console.log, {group: 'myEvent'});
    this.emit('myEvent', 42);
    this.off({group: 'myEvent'});
    this.emit('myEvent', 42);
  }
}
```

#### emit

Emits a component event.
Note that this method always fires two events:

1. `${event}`(self, ...args)
2. `on-${event}`(...args)

#### canSelfDispatchEvent

Returns true if the specified event can be dispatched as the component own event (`selfDispatching`).
