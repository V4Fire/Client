# core/kv-storage/engines/cookie

This module offers a cookie-based engine for storing key-value data.
However, it's important to note that due to the limitations of cookies,
the total amount of data that can be stored using this engine should not exceed 4 kb.

## How is Data Stored Inside a Cookie?

This engine inherits from `core/kv-storage/engines/string`,
which means that all data inside the storage is serialized into a single string and then saved as a cookie.

## How to Set the Cookie Name Where to Save the Data?

To set the name of the cookie being used, as well as additional parameters,
you need to pass arguments to the engine's constructor.

```js
import { from } from 'core/cookies';
import CookieEngine from 'core/kv-storage/engines/cookie';

const store = new CookieEngine('my-cookie', {
  maxAge: (7).days(),
  secure: true,
  cookies: from(document)
});

store.set('a', '1');
store.set('b', '2');

console.log(store.serializedData); // a{{.}}1{{#}}b{{.}}2
```

## How to Use This Engine?

The engine can be used independently along with the `kv-storage` module.

```js
import * as kv from 'core/kv-storage';
import CookieEngine from 'core/kv-storage/engines/cookie';

const store = kv.factory(new CookieEngine('my-cookie'));

store.set('a', [1, 2, 3]);
store.set('b', 2);

console.log(store.get('a'));
```

## API

Since the module inherits from `core/kv-storage/engines/string`,
for detailed information, please refer to the documentation of that module.

### Predefined Instances

The module exports four predefined instances of the engine.
For session storage, the cookie name being used is `v4ss`, while for local storage, it is `v4ls`.
The `maxAge` of the local storage cookie is set to the maximum possible value.

> Please note that since these instances rely on the global `document.cookie` object,
they cannot be used when implementing SSR.

```js
import * as kv from 'core/kv-storage';

import {

  syncSessionStorage,
  asyncSessionStorage,

  syncLocalStorage,
  asyncLocalStorage

} from 'core/kv-storage/engines/cookie';

const store = kv.factory(syncLocalStorage);

store.set('a', [1, 2, 3]);
store.set('b', 2);

console.log(store.get('a'));
```

### Constructor

The first parameter of the constructor accepts the name of the cookie for storing data,
and the second parameter allows you to pass additional options for setting the cookie.

```js
import CookieEngine from 'core/kv-storage/engines/cookie';

const store = new CookieEngine('my-cookie', {
  maxAge: (7).days(),
  secure: true
});

store.get('a'); // 1
store.get('b'); // 2
```

Please be aware that for the engine to work correctly in SSR, it is necessary to explicitly specify an API for working with cookies.

```js
import { from } from 'core/cookies';
import CookieEngine from 'core/kv-storage/engines/cookie';

const store = new CookieEngine('my-cookie', {
  cookies: from(cookieJar),
  maxAge: (7).days(),
  secure: true
});

store.get('a'); // 1
store.get('b'); // 2
```

```typescript
export interface StorageOptions {
  /**
   * An engine for managing cookies
   */
  cookies?: Cookies;

  /**
   * Separators for keys and values for serialization into a string
   */
  separators?: DataSeparators;

  /**
   * The path where the cookie is defined
   * @default `'/'`
   */
  path?: string;

  /**
   * The domain in which the cookie file is defined.
   * By default, cookies can only be used with the current domain.
   * To allow the use of cookies for all subdomains, set this parameter to the value of the root domain.
   */
  domain?: string;

  /**
   * The date when the cookie file expires.
   * Additionally, this option can be defined a string or number.
   */
  expires?: Date | string | number;

  /**
   * The maximum lifespan of the created cookie file in seconds.
   * This option is an alternative to `expires`.
   */
  maxAge?: number;

  /**
   * If set to true, the cookie file can only be transmitted through a secure HTTPS connection.
   * @default `false`
   */
  secure?: boolean;

  /**
   * This option specifies whether the cookie should be restricted to a first-party/same-site context.
   * The option accepts three values:
   *
   * 1. `lax` - cookies are not sent on normal cross-site sub-requests
   *    (for example, to load images or frames into a third party site), but are sent when a user is navigating to
   *    the origin site (i.e., when following a link).
   *
   * 2. `strict` - cookies will only be sent in a first-party context and not be sent along with
   *     requests initiated by third party websites.
   *
   * 3. `none` - cookies will be sent in all contexts, i.e., in responses to both first-party and cross-origin requests.
   *     If this value is set, the cookie `secure` option must also be set (or the cookie will be blocked).
   *
   * @default '`lax`'
   */
  samesite?: 'strict' | 'lax' | 'none';
}

export interface DataSeparators {
  /**
   * This separator separates one "key-value" pair from another
   * @default `'{{#}}'`
   */
  chunk: string;

  /**
   * This separator separates the key from the value
   * @default `'{{.}}'`
   */
  record: string;
}
```
