# core/init

This module provides an initializer for the application. All tasks from the module will be guaranty finished before the initialization of an MVVM library. You may add more tasks to do before initializing.

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
