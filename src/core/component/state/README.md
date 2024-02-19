# core/component/state

This module defines an interface for the entire application's state.
The state can include user sessions, cookie store, etc.

> Note that the module provides types only.
If you want to use global state on the client side, look at the module `core/component/client-state`,
but be aware that using global state might lead to issues when implementing SSR.

## Interface

```typescript
import type { Experiments } from 'core/abt';
import type { CookieStore } from 'core/cookies';
import type { InitialRoute, AppliedRoute } from 'core/router';

export interface State {
  /**
   * True, if the current user session is authorized
   */
  isAuth?: boolean;

  /**
   * True, if the application is connected to the Internet
   */
  isOnline?: boolean;

  /**
   * Date of the last Internet connection
   */
  lastOnlineDate?: Date;

  /**
   * The application default language
   */
  lang?: Language;

  /**
   * A list of registered AB experiments
   */
  experiments?: Experiments;

  /**
   * Initial value for the active route.
   * This field is typically used in cases of SSR and hydration.
   */
  route?: InitialRoute | AppliedRoute;

  /**
   * A store of application cookies
   */
  cookies?: CookieStore;

  /**
   * A shim for the `window.document` API
   */
  document?: Document;

  /**
   * An object whose properties will extend the global object.
   * For example, for SSR rendering, the proper functioning of APIs such as `document.cookie` or `location` is required.
   * Using this object, polyfills for all necessary APIs can be passed through.
   */
  globalEnv?: GlobalEnvironment;
}

export interface GlobalEnvironment extends Dictionary {}
```
