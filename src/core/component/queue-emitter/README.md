# core/component/queue-emitter

This module provides a class to organize event emitter with support of ordering handlers.

## Usage

```js
import QueueEmitter from 'core/component/queue-emitter';

const
  eventEmitter = new QueueEmitter();

// This handler will be invoked only when all specified events are fired
eventEmitter.on(new Set(['foo', 'bar']), () => {
  console.log('Crash!');
});

// This handler does not have any events to listen.
// It will be invoked after calling the `drain` method.
eventEmitter.on(undefined, () => {
  console.log('Boom!');
});

eventEmitter.drain();
eventEmitter.emit('foo');
eventEmitter.emit('bar');
```

## API

### Properties

#### queue

A queue of event handlers that are ready to invoke.

#### listeners

A dictionary with tied event listeners that aren't ready to invoke.

### Methods

#### on

Attaches a handler for the specified set of events.
The handler will be invoked only when all specified events are fired.

#### emit

Emits the specified event.
If at least one of handlers returns a promise,
the method returns a promise that will be resolved after all internal promises are resolved.

#### drain

Drains the queue of handlers that are ready to invoke.
If at least one of listeners returns a promise,
the method returns a promise that will be resolved after all internal promises are resolved.
