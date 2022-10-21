# components/super/i-block/event

Any V4Fire component implements the event emitter interface, and also contains a number of getters for convenient work
with events from other components, such as parent events, root component events, etc.

## How does it work?

Each component has a set of methods for emitting and listening to events: `on`, `once`, `promisifyOnce`, `off`, `emit`,
`emitError` and `dispatch`.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

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
import iBlock, { component } from 'components/super/i-block/i-block';

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
import iBlock, { component } from 'components/super/i-block/i-block';

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
import iBlock, { component } from 'components/super/i-block/i-block';

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
import iBlock, { component } from 'components/super/i-block/i-block';

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

### Detaching listeners

To cancel listening to an event, use the `off` method. Event listeners can be detached by a link,
or by a group and/or label. If nothing is passed, all registered handlers will be detached.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

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
import iBlock, { component } from 'components/super/i-block/i-block';

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
import iBlock, { component } from 'components/super/i-block/i-block';

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

### Firing events

To emit an event, use the `emit` method. In addition to `emit`, there is also the `emitError` method.
The main difference between these methods is the logging level of emitted events. See the section on event logging for more details.
All such events can be caught both using the `on`, `once`, `promisifyOnce` methods, and using the `v-on` directive in the component template.

__b-example.ts__

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

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

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < b-example @myEvent = console.log
```

### Event bubbling

In addition, if you set the `dispatching` prop to a component, then when an event is fired, the component will emit the same event,
but from its parent. That is, the event begins to "bubble up" in the hierarchy, like DOM events. If the parent component also
has `dispatching` set, then bubbling will continue. When bubbling, the name of such an event changes according to
the pattern `${componentName}::${eventName}`.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

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
import iBlock, { component } from 'components/super/i-block/i-block';

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
import iBlock, { component } from 'components/super/i-block/i-block';

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
import iBlock, { component } from 'components/super/i-block/i-block';

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
import iBlock, { component } from 'components/super/i-block/i-block';

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
import iBlock, { component } from 'components/super/i-block/i-block';

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
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    setEnv('log', {patterns: ['event:fooBar']});
    this.emitError('fooBar', 42);
  }
}
```

## Call proxy protocol

Often, when creating an application, we need to organize the management of a group of child components by their parent,
i.e. use the "mediator" pattern. To simplify and standardize this approach, V4Fire implements a special call proxy protocol.
Any component has a special `proxyCall` prop. When set to true, the component starts listening to the `callChild` event from its parent.
The event handler expects an object of the following type as an argument.

```typescript
interface CallChild<CTX extends iBlockEvent = iBlockEvent> {
  if(ctx: CTX): AnyToBoolean;
  then(ctx: CTX): void;
}
```

Here the `if` and `then` functions take a link to the component that handled the event. If `if` returns any positive value,
then `then` will be automatically called as well. Within `then`, you can call any of the component public methods.

Let's look at an example: we have a component that will generate the `callChild` event, as well as child components that will handle it.

__b-parent.ts__

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bParent extends iBlock {
  mounted() {
    this.emit('callChild', {
      if: (ctx) => ctx.componentName === 'b-my-children',
      then: (ctx) => ctx.methodFromChildren()
    });
  }
}
```

__b-children.ts__

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bMyCheldren extends iBlock {
  override proxyCall: boolean = true;

  methodFromChildren() {
    // Do some logic
  }
}
```

__b-parent.ss__

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < b-children
    < b-children
    < b-children
```

## Global events

All non-functional components listen to a set of events from `core/component/event`.
With the help of these events, we can initialize the reloading of these components, for example, in the event of a user
re-login under a different account. All events are divided into two types: normal and "silent".
In the case of non-silent events, the components will force their statuses to change, thereby causing redraws.

```js
import { globalEmitter } from 'core/component';

// Reset all components in silent mode
globalEmitter.emit('reset.silence');
```

### Supported events

* `reset` - reloads all data providers (including the tied storage and router);
* `reset.silence` - reloads all data providers (including the tied storage and router) in silent mode;
* `reset.load` - reloads the tied data providers;
* `reset.load.silence` - reloads the tied data providers in silent mode;
* `reset.router` - resets the router data (the `convertStateToRouterReset` method will be called);
* `reset.router.silence`- resets the router data (the `convertStateToRouterReset` method will be called) in silent mode;
* `reset.storage`- resets the storage data (the `convertStateToStorageReset` method will be called);
* `reset.storage.silence`- resets the router data (the `convertStateToStorageReset` method will be called) in silent mode.

### Adding support for functional components

```typescript
import iBlock, { component, hook } from 'components/super/i-block/i-block';

@component({functional: true})
export default class bExample extends iBlock {
  @hook({created: {functional: true}})
  protected override initGlobalEvents(resetListener?: boolean): void {
    super.initGlobalEvents(resetListener);
  }
}
```

## API

### Props

### [proxyCall = `false`]

If true, the component will listen to the `callChild` special event on its parent.
The event handler will receive as a payload an object that implements the `CallChild` interface.

```typescript
interface CallChild<CTX extends iBlock = iBlock> {
  if(ctx: CTX): AnyToBoolean;
  then(ctx: CTX): Function;
}
```

The `if` function allows you to specify which components should handle this event.
If the check is successful, then the `then` method will be called with the handler component context as an argument.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import type { Module } from 'components/friends/module-loader';

@component()
class bExample extends iBlock {
  mounted() {
    // Reload all child iData components
    this.emit('callChild', {
      if: (ctx) => ctx.instance instanceof iData,
      then: (ctx) => ctx.reload()
    });
  }
}
```

### [dispatching = `false`]

If true, then the component event dispatching mode is enabled.

This means that all component events will bubble up to the parent component:
if the parent also has this property set to true, then events will bubble up to the next (from the hierarchy) parent component.

All dispatched events have special prefixes to avoid collisions with events from other components.
For example: bButton `click` will bubble up as `b-button::click`.
Or if the component has the `globalName` prop, it will additionally bubble up as `${globalName}::click`.

### [selfDispatching = `false`]

If true, then all events that are bubbled up by child components will be fired as the component own events without any prefixes.

### Getters

#### selfEmitter

The component event emitter.
In fact, component methods such as `on` or `off` are just aliases to the methods of the given emitter.

All events fired by this emitter can be listened to "outside" using the `v-on` directive.
Also, if the component is in `dispatching` mode, then the emitted events will start bubbling up to
the parent component.

In addition, all emitted events are automatically logged using the `log` method.
The default logging level is `info` (logging requires the `verbose` prop to be set to true),
but you can set the logging level explicitly.

Note that `selfEmitter.emit` always fires two events:

1. `${event}`(self, ...args) - the first argument is passed as a link to the component that emitted the event
2. `on-${event}`(...args)

Note that to detach a listener, you can specify not only a link to the listener, but also the name of
the group/label to which the listener is attached. By default, all listeners have a group name equal to
the event name being listened to. If nothing is specified, then all component event listeners will be detached.

__b-example.ts__

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

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

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < b-example @myEvent = console.log
```

#### localEmitter

The component local event emitter.

Unlike `selfEmitter`, events that are fired by this emitter cannot be caught "outside" with the `v-on` directive,
and these events do not bubble up. Also, such events can be listened to by a wildcard mask.

Note that to detach a listener, you can specify not only a link to the listener, but also the name of
the group/label to which the listener is attached. By default, all listeners have a group name equal to
the event name being listened to. If nothing is specified, then all component event listeners will be detached.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.localEmitter.on('example.*', console.log);
    this.localEmitter.emit('example.a', 1);
    this.localEmitter.emit('example.b', 2);
    this.localEmitter.off({group: 'example.*'});
  }
}
```

#### parentEmitter

The parent component event emitter.
To avoid memory leaks, only this emitter is used to listen for parent events.

Note that to detach a listener, you can specify a group/label name to which the listener is bound.
By default, all listeners have a group name equal to the event name being listened to.
If nothing is specified, then all component event listeners will be detached.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.parentEmitter.on('example', console.log, {group: 'myEvent'});
    this.$parent.emit('example', 1);
    this.parentEmitter.off({group: 'myEvent'});
  }
}
```

#### rootEmitter

The root component event emitter.
To avoid memory leaks, only this emitter is used to listen for root events.

Note that to detach a listener, you can specify not only a link to the listener, but also the name of
the group/label to which the listener is attached. By default, all listeners have a group name equal to
the event name being listened to. If nothing is specified, then all component event listeners will be detached.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.rootEmitter.on('example', console.log, {group: 'myEvent'});
    this.$root.emit('example', 1);
    this.parentEmitter.off({group: 'myEvent'});
  }
}
```

#### globalEmitter

The global event emitter located in `core/component/event`.

This emitter should be used to listen for external events, such as events coming over a WebSocket connection, etc.
Also, such events can be listened to by a wildcard mask. To avoid memory leaks, only this emitter is used to listen
for global events.

Note that to detach a listener, you can specify not only a link to the listener, but also the name of
the group/label to which the listener is attached. By default, all listeners have a group name equal to
the event name being listened to. If nothing is specified, then all component event listeners will be detached.

```typescript
import { globalEmitter } from 'core/component';
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.globalEmitter.on('example.*', console.log, {group: 'myEvent'});

    globalEmitter.emit('example.a', 1);
    globalEmitter.emit('example.b', 2);

    this.globalEmitter.off({group: 'myEvent'});
  }
}
```

### Methods

#### on

Attaches an event listener to the specified component event.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

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
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

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
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

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

Note that to detach a listener, you can specify not only a link to the listener, but also the name of
the group/label to which the listener is attached. By default, all listeners have a group name equal to
the event name being listened to. If nothing is specified, then all component event listeners will be detached.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    const id = this.on('someEvent', console.log);
    this.off(id);

    this.on('someEvent', console.log);
    this.off({group: 'someEvent'});

    this.on('someEvent', console.log, {label: 'myLabel'});
    this.off({group: 'someEvent'});

    // Detach all listeners
    this.off();
  }
}
```

#### emit

Emits a component event.
The event name is converted to camelCase. In simple terms, `foo-bar` and `fooBar` will end up being the same event.

All events fired by this method can be listened to "outside" using the `v-on` directive.
Also, if the component is in `dispatching` mode, then this event will start bubbling up to the parent component.

In addition, all emitted events are automatically logged using the `log` method.
The default logging level is `info` (logging requires the `verbose` prop to be set to true),
but you can set the logging level explicitly.

Note that this method always fires two events:

1. `${event}`(self, ...args) - the first argument is passed as a link to the component that emitted the event
2. `on-${event}`(...args)

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.on('someEvent', console.log);   // [this, 42]
    this.on('onSomeEvent', console.log); // [42]

    this.emit('someEvent', 42);

    // Enable logging
    setEnv('log', {patterns: ['event:']});
    this.emit({event: 'someEvent', logLevel: 'warn'}, 42);
  }
}
```

#### emitError

Emits a component event with the `error` logging level.
All event parameters that are functions are passed to the logger "as is".
The event name is converted to camelCase. In simple terms, `foo-bar` and `fooBar` will end up being the same event.

All events fired by this method can be listened to "outside" using the `v-on` directive.
Also, if the component is in `dispatching` mode, then this event will start bubbling up to the parent component.

Note that this method always fires two events:

1. `${event}`(self, ...args) - the first argument is passed as a link to the component that emitted the event
2. `on-${event}`(...args)

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.on('someEvent', console.log);   // [this, 42]
    this.on('onSomeEvent', console.log); // [42]

    // Enable logging
    setEnv('log', {patterns: ['event:']});
    this.emitError('someEvent', 42);
  }
}
```

#### dispatch

Emits a component event to the parent component.

This means that all component events will bubble up to the parent component:
if the parent also has the `dispatching` property set to true, then events will bubble up to the next
(from the hierarchy) parent component.

All dispatched events have special prefixes to avoid collisions with events from other components.
For example: bButton `click` will bubble up as `b-button::click`.
Or if the component has the `globalName` prop, it will additionally bubble up as `${globalName}::click`.

In addition, all emitted events are automatically logged using the `log` method.
The default logging level is `info` (logging requires the `verbose` prop to be set to true),
but you can set the logging level explicitly.

#### canSelfDispatchEvent

Returns true if the specified event can be dispatched as the component own event (`selfDispatching`).

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  override canSelfDispatchEvent(event: string): boolean {
    return super.canSelfDispatchEvent(event) && event.dasherize() !== 'my-event';
  }
}
```

### Helper methods

#### waitRef

Waits until the specified template [reference](https://vuejs.org/guide/essentials/template-refs.html) won't be available and returns it.
The method returns a promise.

__b-example.ts__

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  override $refs!: {myInput: HTMLInputElement};

  created() {
    this.waitRef('myInput').then((myInput) => {
      console.log(myInput.value);
    });
  }
}
```

__b-example.ss__

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < input ref = myInput
```
