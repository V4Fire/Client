# core/component/render/daemon

This module provides an API to register and manage tasks of async rendering.

## Why is this module needed?

Using the [[AsyncRender]] API allows you to split the rendering of a component template into multiple chunks and execute them deferred.
This approach allows you to significantly optimize the rendering of components. But here lies another problem - what if there are several
such components using asynchronous rendering on the page? With a small amount, we are unlikely to notice any deterioration.
But if there are many such components, then over time they will clog the browser event-loop and this will lead to page freezes.

To avoid this issue, all asynchronous rendering tasks should not be performed directly, but through a special scheduler.
This scheduler calculates the "weight" of each task before it is executed. When the total weight of tasks exceeds the specified threshold,
the scheduler suspends the execution of other browser tasks.

## How is task weight calculated?

The weight of any task can be set by a consumer. Otherwise, it will be equal to one.

```
< .container v-async-target
  /// The first ten elements are rendered synchronously.
  /// After that, the rest elements will be split into chunks by ten elements and rendered asynchronously.
  /// The rendering of async fragments does not force re-rendering of the main component template.
  < .&__item v-for = el in asyncRender.iterate(myData, 10, {weight: 0.5})
    {{ el }}
```

## How to set the maximum weight of tasks and the delay between their executions?

The necessary options are placed in the config module of your project.

__your-app/src/config/index.ts__

```js
import { extend } from '@v4fire/client/config';

export { default } from '@v4fire/client/config';
export * from '@v4fire/client/config';

extend({
  asyncRender: {
    /**
     * The maximum weight of tasks per one render iteration
     */
    weightPerTick: 5,

    /**
     * The delay in milliseconds between render iterations
     */
    delay: 40
  }
});
```
