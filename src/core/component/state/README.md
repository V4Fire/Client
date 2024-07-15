# core/component/state

This module defines an interface for the entire application's state.
The state can include user sessions, cookie store, etc.
Please note that this module only provides types.

## How to use the state?

The state of the application is set during its initialization in the `core/init` module.
Also, in the case of SSR, you can explicitly pass state parameters in the render function call.

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

## Interface

```typescript
import type Async from 'core/async';
import type * as net from 'core/net';

import type { Session } from 'core/session';
import type { Cookies } from 'core/cookies';

import type ThemeManager from 'core/theme-manager';
import type PageMetaData from 'core/page-meta-data';

import type { Experiments } from 'core/abt';
import type { InitialRoute, AppliedRoute } from 'core/router';

export interface State {
  /**
   * The unique identifier for the application process
   */
  appProcessId: string;

  /**
   * True, if the current user session is authorized
   */
  isAuth?: boolean;

  /**
   * An API for managing user session
   */
  session: Session;

  /**
   * An API for working with cookies
   */
  cookies: Cookies;

  /**
   * An API for working with the target document's URL
   */
  location: URL;

  /**
   * An API for managing app themes from the Design System
   */
  theme: ThemeManager;

  /**
   * An API for working with the meta information of the current page
   */
  pageMetaData: PageMetaData;

  /**
   * A storage for hydrated data.
   * During SSR, data is saved in this storage and then restored from it on the client.
   */
  hydrationStore?: HydrationStore;

  /**
   * True, if the application is connected to the Internet
   */
  isOnline?: boolean;

  /**
   * Date of the last Internet connection
   */
  lastOnlineDate?: Date;

  /**
   * An API to work with a network, such as testing of the network connection, etc.
   */
  net: typeof net;

  /**
   * The initial value for the active route.
   * This field is typically used in cases of SSR and hydration.
   */
  route?: InitialRoute | AppliedRoute;

  /**
   * The application default locale
   */
  locale?: Language;

  /**
   * A list of registered AB experiments
   */
  experiments?: Experiments;

  /** {@link Async} */
  async: Async;
}
```
