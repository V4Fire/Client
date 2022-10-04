# core/init

This module provides an initializer for the application.
All tasks from the module will be completed before the initialization of the application itself.
You can add additional tasks before initialization.

## Why is this module needed?

When developing applications, it is often necessary to do some work before initializing the entire application.
For example, get the AB experiment ID for a user (if any). This module solves this problem by allowing you to define tasks
that will block application initialization until all required dependencies are resolved.

## Usage

**core/init/flags.js**

```js
import parentFlags from '@super/core/init/flags';

export default [
  ...parentFlags,
  'myTask'
];
```

**core/init/my-task.js**

```js
import semaphore from 'core/init/semaphore';

export default (() => {
  setTimeout(() => {
    semaphore('myTask');
  });
})();
```

**core/init/index.js**

```js
import '@super/core/init';
import 'core/init/my-task';
```
