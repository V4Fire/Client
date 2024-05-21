# core/init

This module provides an initializer for the application.
All tasks from the module will be completed before the initialization of the application itself.
You can add additional tasks before initialization.

## Why is This Module Needed?

When developing applications, it is often necessary to do some work before initializing the entire application.
For example, get the AB experiment ID for a user (if any).
This module solves this problem by allowing you to define tasks
that will block application initialization until all required dependencies are resolved.

## How does this module work?

The code responsible for initializing the application is located in the `core/init/semaphore` module.
The module exports a factory for the default initialization function, which is wrapped in an asynchronous semaphore.
This means that this function can be called multiple times from different modules,
but in fact, it will be executed only once and only when all necessary conditions are met.

The necessary conditions for executing this function are represented as flags and
described in the `core/init/flags` module.
The module simply exports an array of string flags.
In turn, these flags should be passed when calling the application initialization function.
You can do this by calling the `ready` method on the application initialization parameters object.
If all the flags specified in this array were passed as arguments to the initialization function,
then only then will the initialization itself be called, and only once.

__core/init/flags.ts__

```js
import parentFlags from '@super/core/init/flags';

export default [
  ...parentFlags,
  'sleep'
];
```

__core/init/sleep.ts__

```typescript
import type { InitAppOptions } from 'core/init/interface';

export default function initSleep(params: InitAppOptions) {
  setTimeout(() => {
    params.ready('sleep');
  }, 100);
};
```

__core/init/index.ts__

```typescript
import initAppSuper from '@super/core/init';
import initSleep from 'core/init/sleep';

import type { InitAppOptions, App } from 'core/init/interface';

export default async function initApp(
  rootComponent: Nullable<string>,
  opts: InitAppOptions
): Promise<App> {
  const app = initAppSuper(rootComponent, opts);
  initSleep(opts).catch(stderr);
  return app;
}
```

### Built-in initialization flags

Any V4Fire application needs to perform a series of actions before primary rendering.
These actions are described by standard initialization flags.

```js
export default [
  'DOMReady',
  'ABTReady',
  'prefetchReady',
  'stateReady'
];
```

### DOMReady

The application initializes only after the DOMContentReady event.
For SSR, this flag is set immediately.

### ABTReady

A stub for initializing the A/B experiment context.
By default, the flag is set immediately, but you can override the `core/init/abt` module and set your own logic.

__core/init/abt.ts__

```typescript
import { initGlobalEnv } from 'core/env';

import type { InitAppOptions } from 'core/init/interface';

export default async function initABT(params: InitAppOptions): Promise<void> {
  initGlobalEnv(params);
  void params.ready('ABTReady');
}
```

### prefetchReady

A stub for pre-requesting data providers and other sources.
By default, the flag is set immediately, but you can override the `core/init/prefetch` module and set your own logic.

__core/init/prefetch.ts__

```typescript
import { initGlobalEnv } from 'core/env';

import type { InitAppOptions } from 'core/init/interface';

export default async function initPrefetch(params: InitAppOptions): Promise<void> {
  initGlobalEnv(params);
  void params.ready('prefetchReady');
}
```

### stateReady

Initializing the application global state (user session initialization, online status loading, etc.).

__core/init/abt.ts__

```typescript
import { initGlobalEnv } from 'core/env';

import * as net from 'core/net';
import * as session from 'core/session';

import state from 'core/component/client-state';

import type { InitAppOptions } from 'core/init/interface';

export default async function initState(params: InitAppOptions): Promise<void> {
  initGlobalEnv(params);
  state.isOnline = true;

  net.isOnline()
    .then((v) => {
      state.isOnline = v.status;
      state.lastOnlineDate = v.lastOnline;
    })

    .catch(stderr);

  try {
    await session.isExists().then((v) => state.isAuth = v);

  } catch (err) {
    stderr(err);
  }

  void params.ready('stateReady');
}
```

## How to work with this module for SSR rendering?

In the case of traditional application initialization,
we usually do not need to manually call the creation of the root component, since it is created automatically.
On the contrary, in the case of SSR, we need to be able to manually call the initialization for each request.

Therefore, the main `core/init` module exports a function that will not be automatically called in the case of SSR.
The result of the function depends on the context.
In SSR, the function will return an object of the following format: `{content: string; styles: string}`.
Here, the `content` is a string containing the rendered application, and `styles` are the required styles.
When working in a browser context,
the function will return a reference to the element where the root component was mounted.

When calling this function from SSR, it is necessary to pass the name of the root component being created,
and additional parameters can also be passed.

```typescript
import { initApp, createInitAppSemaphore } from 'core';

import type { ComponentOptions } from 'core/component/engines';

initApp('p-v4-components-demo', {
  ready: createInitAppSemaphore(),
  route: '/user/12345',

  setup(rootComponentParams: ComponentOptions) {
    rootComponentParams.inject = {
      ...rootComponentParams.inject,
      hydrationStore: 'hydrationStore'
    };
  },

  globalEnv: {
    ssr: {
      document: {
        get cookie() {
          return 'cookie string';
        },

        set cookie(cookie) {
          // Set the passed cookie
          // ...
        }
      }
    },

    location: {
      href: 'https://example.com/user/12345'
    }
  }
}).then(({content: renderedHTML, styles: inlinedStyles}) => {
  console.log(renderedHTML, inlinedStyles);
})
```

### Additional initialization options

```typescript
interface InitAppOptions {
  /**
   * Sets the passed flag to a ready status.
   * When all the declared flags are ready, the application itself will be initialized.
   *
   * @param flag
   */
  ready(flag: string): Promise<(
    rootComponentName: Nullable<string>,
    opts: InitAppOptions
  ) => Promise<HTMLElement | AppSSR>>;

  /**
   * A link to the element where the application should be mounted.
   * This parameter is only used when initializing the application in a browser.
   */
  targetToMount?: Element;

  /**
   * The initial route for initializing the router.
   * Usually, this value is used during SSR.
   */
  route?: InitialRoute;

  /**
   * An object whose properties will extend the global object.
   * For example, for SSR rendering, the proper functioning of APIs such as `document.cookie` or `location` is required.
   * Using this object, polyfills for all necessary APIs can be passed through.
   */
  globalEnv?: GlobalEnvironment;

  /**
   * A function that is called before the initialization of the root component
   * @param rootComponentParams
   */
  setup?(rootComponentParams: ComponentOptions): void;
}

export interface GlobalEnvironment extends Dictionary {
  /**
   * A shim for the `window.location` API
   */
  location?: Location;

  /**
   * SSR environment object
   */
  ssr?: {
    /**
     * A shim for the `window.document` API
     */
    document?: Document;
  };
}
```

### Initializing the global environment for SSR

To initialize the global environment passed as parameters to the initApp function,
use a special function from the `core/env` module.

```typescript
import { initGlobalEnv } from 'core/env';

import type { InitAppOptions } from 'core/init/interface';

export default async function initPrefetch(params: InitAppOptions): Promise<void> {
  initGlobalEnv(params);
  void params.ready('prefetchReady');
}
```

## Getting the root component in the browser

During the initialization of the root component in the browser,
it is assigned an ID attribute with `root-component` as the value.

This means you can access the component context simply by using the `component` property of
the node with the id of `root-component`.

```js
console.log(document.querySelector('#root-component')?.component.componentName);
```

Or you can use the `app` object imported from `core/component`.
This object contains two properties:

* `context` is the context of the created application;
* `component` is the context of the application's root component.

```js
import { app } from 'core/component';

console.log(app?.context.directive('v-attrs'));
console.log(app?.component.componentName);
```
