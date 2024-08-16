# components/super/i-block/event

Any V4Fire component implements the event emitter interface, and also contains a number of getters for convenient work
with events from other components, such as parent events, root component events, etc.

## How Does It Work?

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

It is worth noting that in addition to the arguments explicitly passed to the `emit`,
the event handler also receives a reference to the component that triggered the event.
This is very convenient when listening to events from one component within another component.
However, this behavior is not always desirable.
Therefore, the `emit` method automatically triggers a second event, where only the explicit arguments are passed.
The name of such an event is formed using the pattern `on${eventName}`, for example, `click` becomes `onClick`.

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

All event names passed to the method are automatically converted to camelCase.

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

In addition to the `on` method, we can also use the `once` and `promisifyOnce` methods,
which will handle an event only once, and then detach the listener.
The `promisifyOnce` method takes an event name to listen for and returns a promise.

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

Moreover, all event listening methods are wrapped by the [[Async]] instance of the component in which they are used.
Therefore, you don't need to worry about cleaning up events after the component is destroyed.
Optionally, you can provide additional parameters to the Async instance when adding a listener.

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

### Adding An Event Handler To The Beginning Of The Queue

By default, all handlers of a single event will be executed in the order they were added.
That is, we know for sure that if handler A was added before B,
then it will also be triggered earlier when the event fires.
However, if we set the `prepend` option to true when adding a handler,
such a handler will be added not to the end of the handler queue, but to the beginning.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.on('onMyEvent', () => {
      console.log(1);
    });

    this.on('onMyEvent', () => {
      console.log(2);
    }, {prepend: true});

    // 2
    // 1
    this.emit('myEvent');
  }
}
```

### Detaching Listeners

To stop listening to an event, you can use the `off` method.
Event listeners can be detached by reference, by group, or by label.
If nothing is passed, all registered handlers will be detached.

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

To cancel a listener set up with `promisifyOnce`, simply use the `async.cancelPromise` method.

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

Please note that if you don't explicitly specify a group name,
it will be set to the name of the event being listened to.

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

### Firing Events

To fire an event, you can use the `emit` method.
In addition to `emit`, there is also the `emitError` method.
The main difference between these methods is the level of event logging.
For more details, please refer to the event registration section.
All such events can be caught using the `on`, `once`, `promisifyOnce` methods,
and by using the `v-on` directive in the component template.

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

### How to Type Events?

By default, component events do not have any TypeScript type support.
However, you can explicitly declare the possible events and arguments when describing the component.
This will improve autocompletion and protect against certain errors.

To type an event, it needs to be declared in the static type `SelfEmitter` using
a special type function called `InferComponentEvents`.
Events are typed using tuples, where the first element is the event name and the subsequent elements are the arguments.

```typescript
import iBlock, { component, InferComponentEvents } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  declare readonly SelfEmitter: InferComponentEvents<this, [
    ['myEvent', {data: string}],
    ['anotherEvent', string, boolean]
  ], iBlock['SelfEmitter']>;

  created() {
    this.emit('myEvent', {data: 'some message'});

    this.on('anotherEvent', (component, arg1, arg2) => {
      // ...
    });

    this.on('onAnotherEvent', (arg1, arg2) => {
      // ...
    });
  }
}
```

By default, the `emit` method allows firing undeclared events,
but it has a special alias called `strictEmit`, which allows emitting only explicitly declared events.

```typescript
import iBlock, { component, InferComponentEvents } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  declare readonly SelfEmitter: InferComponentEvents<this, [
    ['myEvent', {data: string}],
    ['anotherEvent', string, boolean]
  ], iBlock['SelfEmitter']>;

  created() {
    // @ts-expect-error
    this.strictEmit('bla', 1);
  }
}
```

### Event Bubbling

Additionally, if you set the `dispatching` prop for a component, then when triggering an event,
the component will emit the same event but from its parent.
This means the event starts to bubble up in the hierarchy, similar to DOM events.
If the parent component also has the `dispatching` property set, the event bubbling will continue.
When bubbling up, the name of such an event changes according to the template `${componentName}::${eventName}`.

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

If a component has the `dispatching` prop set, and also has the `globalName` property set,
events will additionally bubble up with a name based on

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

Finally, if in the parent component the `selfDispatching` prop is set to true,
such bubbling events will be emitted on the component as their own, rather than with the modified name.

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

However, there are certain events that cannot bubble up in this way, as it would lead to errors.
There is a special method called `canSelfDispatchEvent` that returns true if the component can handle
the event passed to it in `selfDispatching` mode.

In addition to the above, any component also has the `dispatch` method that triggers the event dispatching mechanism.
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

### Event Logging

All component events generated by the emit method are additionally logged.
The `log` method is used for logging.
To enable logging for specific events, set the desired template using the `setEnv` function.

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

By default, events generated through `emit` use the `info` logging context.
Such messages will be ignored unless the component explicitly sets the verbose property to true.
It is allowed to explicitly specify the logging level for the generated event.

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

Events triggered using the `emitError` method always have the `error` logging context.

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

## Call Proxy Protocol

When creating an application, it is often necessary to organize control over a group of child components
by their parent, i.e., using the "mediator" pattern.
To simplify and standardize this approach, V4Fire implements a special proxy call protocol.

Every component has a special property called `proxyCall`.
If set to true, the component starts listening for the callChild event from its parent.
The event handler expects an argument of the following type.

```typescript
interface CallChild<CTX extends iBlockEvent = iBlockEvent> {
  if(ctx: CTX): AnyToBoolean;
  then(ctx: CTX): void;
}
```

Here, the `if` `and` then functions take a reference to the component that handled the event.
If the `if` function returns any positive value, then the `then` function will also be automatically called.
In the `then` function, you can invoke any of the public methods of the component.

Let's consider an example: we have a component that will generate the `callChild` event,
and we also have child components that will handle it.

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

## Global Events

All non-functional components listen to a set of events from the `core/component/event` module.
With these events, we can initiate a reload of these components, for example,
when a user logs in again with a different account.
All events are divided into two types: regular and "silent".
For non-silent events, components forcefully change their statuses, thereby triggering a re-render.

```js
import { globalEmitter } from 'core/component';

// Reset all components in silent mode
globalEmitter.emit('reset.silence');
```

### Supported Events

* `reset` - reloads all data providers (including the tied storage and router);
* `reset.silence` - reloads all data providers (including the tied storage and router) in silent mode;
* `reset.load` - reloads the tied data providers;
* `reset.load.silence` - reloads the tied data providers in silent mode;
* `reset.router` - resets the router data (the `convertStateToRouterReset` method will be called);
* `reset.router.silence`- resets the router data (the `convertStateToRouterReset` method will be called) in silent mode;
* `reset.storage`- resets the storage data (the `convertStateToStorageReset` method will be called);
* `reset.storage.silence`- resets the router data (the `convertStateToStorageReset` method will be called) in silent mode.

### Adding Support for Functional Components

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

This means that all component events will bubble up to the parent component.
If the parent also has this property set to true,
then events will bubble up to the next (from the hierarchy) parent component.

All dispatched events have special prefixes to avoid collisions with events from other components.
For example, bButton `click` will bubble up as `b-button::click`.
Or if the component has the `globalName` prop, it will additionally bubble up as `${globalName}::click`.

### [selfDispatching = `false`]

If true, then all events that are bubbled up by child components will be fired as the component own events without any
prefixes.

### Getters

#### selfEmitter

The component event emitter.
In fact, the component methods such as `on` or `off` are just aliases to the methods of the given emitter.

All events fired by this emitter can be listened to "outside" using the `v-on` directive.
Also, if the component is in `dispatching` mode, then the emitted events will start bubbling up to
the parent component.

In addition, all emitted events are automatically logged using the `log` method.
The default logging level is `info` (logging requires the `verbose` prop to be set to true),
but you can set the logging level explicitly.

Note that `selfEmitter.emit` always fires three events:

1. `${event}`(self, ...args) - the first argument is passed as a link to the component that emitted the event
2. `${event}:component`(self, ...args) - event to avoid collisions between component events and native DOM events
3. `on-${event}`(...args)

Note that to detach a listener, you can specify not only a link to the listener, but also the name of
the group/label to which the listener is attached.
By default, all listeners have a group name equal to the event name being listened to.
If nothing is specified, then all component event listeners will be detached.

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
and these events do not bubble up.
Also, such events can be listened to by a wildcard mask.

Note that to detach a listener, you can specify not only a link to the listener, but also the name of
the group/label to which the listener is attached.
By default, all listeners have a group name equal to the event name being listened to.
If nothing is specified, then all component event listeners will be detached.

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

##### How to Type Events?

By default, `localEmitter` events do not have any TypeScript type support.
However, you can explicitly declare the possible events and arguments when describing the component.
This will improve autocompletion and protect against certain errors.

To type an event, it needs to be declared in the static type `LocalEmitter` using
a special type function called `InferEvents`.
Events are typed using tuples, where the first element is the event name and the subsequent elements are the arguments.

```typescript
import iBlock, { component, InferEvents } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  declare readonly LocalEmitter: InferEvents<[
    ['myEvent', {data: string}]
  ], iBlock['LocalEmitter']>;

  created() {
    this.localEmitter.on('myEvent', {data: 'some message'});
  }
}
```

By default, the `emit` method allows firing undeclared events,
but it has a special alias called `strictEmit`, which allows emitting only explicitly declared events.

```typescript
import iBlock, { component, InferComponentEvents } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  declare readonly LocalEmitter: InferEvents<[
    ['myEvent', {data: string}]
  ], iBlock['LocalEmitter']>;

  created() {
    // @ts-expect-error
    this.localEmitter.strictEmit('bla', 1);
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
the group/label to which the listener is attached.
By default, all listeners have a group name equal to the event name being listened to.
If nothing is specified, then all component event listeners will be detached.

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
Also, such events can be listened to by a wildcard mask.
To avoid memory leaks, only this emitter is used to listen for global events.

Note that to detach a listener, you can specify not only a link to the listener, but also the name of
the group/label to which the listener is attached.
By default, all listeners have a group name equal to the event name being listened to.
If nothing is specified, then all component event listeners will be detached.

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
the group/label to which the listener is attached.
By default, all listeners have a group name equal to the event name being listened to.
If nothing is specified, then all component event listeners will be detached.

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

Note that this method always fires three events:

1. `${event}`(self, ...args) - the first argument is passed as a link to the component that emitted the event.
2. `${event}:component`(self, ...args) - the event to avoid collisions between component events and native DOM events.
3. `on-${event}`(...args)

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

Note that this method always fires three events:

1. `${event}`(self, ...args) - the first argument is passed as a link to the component that emitted the event.
2. `${event}:component`(self, ...args) - the event to avoid collisions between component events and native DOM events.
3. `on-${event}`(...args)

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

This means that all component events will bubble up to the parent component.
If the parent also has the `dispatching` property set to true, then events will bubble up to the next
(from the hierarchy) parent component.

All dispatched events have special prefixes to avoid collisions with events from other components.
For example, bButton `click` will bubble up as `b-button::click`.
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
