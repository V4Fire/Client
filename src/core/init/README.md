# core/init

This module provides an application initialization function.
Additionally, you can declare tasks that must be guaranteed to be completed before creating the application.
For example, initializing a user session or experiment.

## Usage

Typically, explicit application initialization is required when organizing SSR.
We call the initialization function and pass the necessary environment parameters to it.
In this case, the function will return a promise with values needed to be delivered to the client — this is
a rendered string with markup, the necessary CSS styles and the application state.

```typescript
import { initApp } from 'core/init';
import { createCookieStore } from 'core/cookies';

initApp('p-v4-components-demo', {
  location: new URL('https://example.com/user/12345'),
  cookies: createCookieStore('id=1')
}).then(({content: renderedHTML, styles: inlinedStyles, state}) => {
  console.log(renderedHTML, inlinedStyles, state);
});
```

### Application state

The state of the created application is formed based on the parameters passed to the initialization function.
The state interface is described in the `core/component/state` module.

```typescript
import { initApp } from 'core';
import { createCookieStore } from 'core/cookies';

initApp('p-v4-components-demo', {
  location: new URL('https://example.com/user/12345'),
  cookies: createCookieStore('id=1')
}).then(({content: renderedHTML, styles: inlinedStyles, state}) => {
  console.log(renderedHTML, inlinedStyles, state);
});
```

To work with the state from a component context, you should use a special getter called `remoteState`.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  created() {
    console.log(this.remoteState.location.href);
  }
}
```

To access the state via a global reference, you can use `app.state` from the `core/component` module.
But keep in mind that working with state through global import will not work with SSR.

```typescript
import { app } from 'core/component';

console.log(app.state?.location);
```

### Initializing Client-Side Browser Application

During initialization in the browser, all necessary calls are made automatically.
After initialization, the root component node will have an id attribute equal to `root-component`.
This means you can access the component context simply by using the `component` property of
the root component node.

```js
console.log(document.querySelector('#root-component')?.component.componentName);
```

Or you can use the `app` object imported from `core/component`.
This object contains three properties:

* `context` is the context of the created application;
* `component` is the context of the application's root component;
* `state` is the global state of the created application.

```js
import { app } from 'core/component';

console.log(app?.context.directive('v-attrs'));
console.log(app?.component.componentName);
console.log(app?.state.isAuth);
```

### Additional Initialization Options

```typescript
import type Async from 'core/async';
import type * as net from 'core/net';

import type { Session } from 'core/session';
import type { CookieStore } from 'core/cookies';

import type ThemeManager from 'core/theme-manager';
import type PageMetaData from 'core/page-meta-data';

import type { Experiments } from 'core/abt';
import type { InitialRoute } from 'core/router';

import type HydrationStore from 'core/hydration-store';

interface InitAppOptions {
  /**
   * The unique identifier for the application process
   */
  appProcessId?: string;

  /**
   * True, if the current user session is authorized
   */
  isAuth?: boolean;

  /**
   * An API for managing user session
   */
  session: Session;

  /**
   * A store of application cookies
   */
  cookies: CookieStore;

  /**
   * An API for working with the target document's URL
   */
  location: URL;

  /**
   * An API for managing app themes from the Design System
   */
  theme?: ThemeManager;

  /**
   * An API for working with the meta information of the current page
   */
  pageMetaData?: PageMetaData;

  /**
   * A storage for hydrated data.
   * During SSR, data is saved in this storage and then restored from it on the client.
   */
  hydrationStore?: HydrationStore;

  /**
   * An API to work with a network, such as testing of the network connection, etc.
   */
  net?: typeof net;

  /**
   * The initial route for initializing the router.
   * Usually, this value is used during SSR.
   */
  route?: InitialRoute;

  /**
   * The application default locale
   */
  locale?: Language;

  /**
   * A list of registered AB experiments
   */
  experiments?: Experiments;

  /**
   * A link to the element where the application should be mounted.
   * This parameter is only used when initializing the application in a browser.
   */
  targetToMount?: Nullable<HTMLElement>;

  /**
   * A function that is called before the initialization of the root component
   * @param rootComponentParams
   */
  setup?(rootComponentParams: ComponentOptions): void;

  /** {@link Async} */
  async?: Async;
}
```

## Registering Additional Tasks Prior to Application Initialization

To specify a list of tasks before initializing the application,
you need to return them as a default export in the form of a dictionary from the `core/init/dependencies` module.

```js
import { loadSession } from 'core/init/dependencies/load-session';
import { loadedHydratedPage } from 'core/init/dependencies/loaded-hydrated-page';
import { whenDOMLoaded } from 'core/init/dependencies/when-dom-loaded';

export default {
  loadSession,
  loadedHydratedPage,
  whenDOMLoaded
};
```

Tasks are described as ordinary functions that take an environment and settings object and return a promise.
Functions can change values in the environment object.
Based on this object, the state of the entire application will be formed later.

Note that all tasks will be performed in parallel.
However, there is a way to describe that some tasks should wait for the preliminary execution of others.

```js
import { loadSession } from 'core/init/dependencies/load-session';
import { loadedHydratedPage } from 'core/init/dependencies/loaded-hydrated-page';
import { whenDOMLoaded } from 'core/init/dependencies/when-dom-loaded';

import { dependency } from 'core/init/dependencies/helpers';

export default {
  loadSession,

  // Can specify as many dependencies as you want, separated by commas
  loadedHydratedPage: dependency(loadedHydratedPage, 'loadSession'),

  // * means that this task should be executed after all others
  whenDOMLoaded: dependency(loadedHydratedPage, '*')
};
```

The helper `dependency` returns an object of the form.

```typescript
import type { State } from 'core/component';

interface Dependency {
  fn(params: State): Promise<void>;
  wait: Set<string>;
}
```

You can manually add or remove additional dependencies, or, again, use the `dependency` function for this.

### Built-In Dependencies

Please note that V4Fire expects the initialization of three basic states described in the modules:

* `core/init/dependencies/load-session`
* `core/init/dependencies/check-online`
* `core/init/dependencies/loaded-hydrated-page`
* `core/init/dependencies/when-dom-loaded`

You can override them or introduce new ones to suit your needs.
