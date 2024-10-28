# core/component/render/daemon

This module provides an API that allows for the registration and management of asynchronous rendering tasks.

## Why is This Module Necessary?

When using the [[AsyncRender]] API, developers can split the rendering of a component template into multiple chunks and
execute them deferred, resulting in significantly optimized component rendering times.

However, if multiple components are using asynchronous rendering on the page, it can lead to a potential issue.
Over time, these tasks will accumulate and clog the browser's event-loop, ultimately resulting in page freezes.

To mitigate this issue, all asynchronous rendering tasks should be executed through a special scheduler
that calculates the "weight" of each task before executing it.
This scheduler suspends the execution of other browser tasks when the total weight of
tasks exceeds a specified threshold, allowing for the completion of the deferred rendering tasks.

## How is Task Weight Calculated?

The "weight" of each task can be set by a consumer.
If the consumer does not set a weight, then the weight of the task is set to one by default.

```
< .container v-async-target
  /// The first ten elements are rendered synchronously.
  /// After that, the remaining elements are split into chunks of ten elements and rendered asynchronously.
  /// The rendering of async fragments does not force re-rendering of the main component template.
  < .&__item v-for = el in asyncRender.iterate(myData, 10, {weight: 0.5})
    {{ el }}
```

## How to Set the Maximum Weight of Tasks and the Delay Between Their Executions?

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
