# core/component/gc

This module provides an API for incremental garbage collection for components.

Garbage collection is performed in chunks that do not exceed a specified time threshold.
The garbage collection iterations are executed either during IDLE or at a specified time interval.

To ensure that there are no blockages during garbage collection,
the module relies on the principles of cooperative multitasking.
The garbage collector's `add` method expects an Iterator,
meaning you can break the cleaning process into several stages.
Generators are convenient to use for this purpose.

```js
import { gc } from 'core/component';

gc.add(function* destructor() {
  for (const key of Object.keys(resources)) {
    delete resources[key];
    yield;
  }
}());
```

## Why is This Module Needed?

When any component is destroyed, it often has to also free up associated resources that will no longer be used:
detach event handlers, cancel requests and timers, etc.
The number of such mandatory cleanups can be quite large and take some time.
This module is used to mitigate the cleanup operation.
All components perform cleanup using a global queue,
and the garbage collection module ensures that the total cleanup time at once will not lead to blockages.

## How to Set the Time Between Garbage Collection Iterations and the Maximum Duration of a Single Iteration?

The necessary options are placed in the config module of your project.

__your-app/src/config/index.ts__

```js
import { extend } from '@v4fire/client/config';

export { default } from '@v4fire/client/config';
export * from '@v4fire/client/config';

extend({
  gc: {
    /**
     * The maximum time in milliseconds that the garbage collector can spend in one cleanup iteration
     */
    quota: 25,

    /**
     * The maximum delay in milliseconds between cleanup iterations
     */
    delay: 5000
  }
});
```
