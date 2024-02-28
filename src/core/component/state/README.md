# core/component/state

This module defines an interface for the entire application's state.
The state can include user sessions, cookie store, etc.

> Please note that this module only provides types.
> The actual state is set at the time of application initialization.
> To safely use the state from a component, you need to use a special getter.

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
