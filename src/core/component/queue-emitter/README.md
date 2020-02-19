# core/component/queue-emitter

This module provides a class to organize event emitter with support of ordering events.

```js
import QueueEmitter from 'core/component/queue-emitter';

const
  eventEmitter = new QueueEmitter();

// This listeners is invoked only when all specified events was emitted
eventEmitter.on(new Set(['foo', 'bar']), () => {
  console.log('Crash!');
});

// This listener doesn't have any events to listen and it will be invoked after calling the .drain method
eventEmitter.on(undefined, () => {
  console.log('Boom!');
});

eventEmitter.drain();
eventEmitter.emit('foo');
eventEmitter.emit('bar');
```
