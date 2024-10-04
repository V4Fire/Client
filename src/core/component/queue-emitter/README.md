# core/component/queue-emitter

This module provides a class for creating an EventEmitter with support for handler queue ordering.
For example, it's possible to declare that a handler will only be executed after multiple specified
events have been triggered.

## Usage

```js
import QueueEmitter from 'core/component/queue-emitter';

const
  eventEmitter = new QueueEmitter();

// This handler will only be invoked once all of the specified events have been fired.
eventEmitter.on(new Set(['foo', 'bar']), () => {
  console.log('Crash!');
});

// This handler is not currently listening to any events.
// It will only be invoked after the drain method is called.
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

A queue of event handlers that are ready to be executed.

#### listeners

A dictionary containing event listeners that are tied to specific events but are not yet ready to be executed.

### Methods

#### on

Attaches a handler function for the specified set of events.
The handler function will only be invoked once all specified events have been fired.

#### emit

Emits the specified event, invoking all handlers attached to the event.
If at least one of the handlers returns a promise,
the method will return a promise that will only be resolved once all internal promises are resolved.

#### drain

Drains the queue of event handlers that are ready to be executed.
If at least one of the handlers returns a promise,
the method will return a promise that will only be resolved once all internal promises are resolved.
