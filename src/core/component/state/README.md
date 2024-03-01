# core/component/state

This module defines an interface for the entire application's state.
The state can include user sessions, cookie store, etc.
Please note that this module only provides types.

## How to use the state?

The state of the application is set during its initialization in the `core/init` module.
Also, in the case of SSR, you can explicitly pass state parameters in the render function call.

```typescript
import { createCookieStore } from 'core/cookies';
import { initApp, createInitAppSemaphore, cookies } from 'core';

initApp('p-v4-components-demo', {
  ready: createInitAppSemaphore(),
  location: new URL('https://example.com/user/12345'),
  cookies: createCookieStore('id=1')
}).then(({content: renderedHTML, styles: inlinedStyles}) => {
  console.log(renderedHTML, inlinedStyles);
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
import type * as net from 'core/net';

import type { Session } from 'core/session';
import type { Cookies } from 'core/cookies';

import type { Experiments } from 'core/abt';
import type { InitialRoute, AppliedRoute } from 'core/router';

export interface State {
  /**
   * The unique application identifier
   */
  appId: string;

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
}
```
