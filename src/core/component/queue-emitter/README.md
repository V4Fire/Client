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
