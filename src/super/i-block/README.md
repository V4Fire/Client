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

### Getters

#### selfEmitter

The component event emitter.
All events fired by this emitter can be listened to "outside" with the `v-on` directive.
Also, these events can bubble up the component hierarchy.

__b-example.ts__

```typescript
import iBlock, { component, prop, field } from 'super/i-block/i-block';

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
import iBlock, { component, prop, field } from 'super/i-block/i-block';

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
