# core/cookies

This module provides an API for working with cookies within a browser or in Node.js.

## When using within a browser

```js
import * as cookies from 'core/cookies';

cookies.set('foo', 'bar');
console.log(cookies.get('foo') === 'bar');

cookies.remove('foo');
console.log(cookies.has('foo') === false);
```

## When using within Node.js

```js
import { from, createCookieStore } from 'core/cookies';

const cookieStore = createCookieStore('id=1; name=bob');

const cookies = from(cookieStore);

cookies.set('foo', 'bar');
console.log(cookies.get('foo') === 'bar');

cookies.remove('foo');
console.log(cookies.has('foo') === false);

console.log(cookieStore.cookie);
```

## API

Cookies support a bunch of methods to work with them.

### createCookieStore

Creates a cookie store with a browser-like interface based on a cookie string.
By default, Node.js uses the [cookiejar](https://www.npmjs.com/package/cookiejar) library,
while in the browser, the native `document.cookie` is used.

```js
import { from, createCookieStore } from 'core/cookies';

const cookieStore = createCookieStore('id=1; name=bob');

console.log(cookieStore.cookie); // 'id=1; name=bob'

cookieStore.cookie = 'age=25';

console.log(cookieStore.cookie); // id=1; name=bob; age=25
```

### from

Returns an API for managing the cookie of the specified store.

```js
import { from, createCookieStore } from 'core/cookies';

const cookieStore = createCookieStore('id=1; name=bob');

const cookies = from(cookieStore);

cookies.set('foo', 'bar');
console.log(cookies.get('foo') === 'bar');

cookies.remove('foo');
console.log(cookies.has('foo') === false);
```

### has

Returns true, if a cookie by the specified name is defined.

```js
import * as cookies from 'core/cookies';

console.log(cookies.has('foo'));
```

### get

Returns a cookie value by the specified name.

```js
import * as cookies from 'core/cookies';

console.log(cookies.get('foo'));
```

### set

Sets a cookie value by the specified name.

```js
import * as cookies from 'core/cookies';

cookies.set('foo', 'bar');
```

The function accepts an optional third argument that can be used to provide additional options for setting the cookie.

```js
import * as cookies from 'core/cookies';

cookies.set('foo', 'bar', {
  secure: true,
  expires: Date.create('tomorrow'),
  path: '/foo',
  domain: 'my-site.com'
});
```

The full list of supported options:

````typescript
export interface SetOptions {
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
   *
   * @example
   * ```js
   * set('foo', 'bar', {expires: 'tomorrow'})
   * ```
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
````

### remove

Removes a cookie by the specified name.
Notice, the cookie to be removed must have the same domain and path that was used to set it.

```js
import * as cookies from 'core/cookies';

cookies.remove('foo');
```

The function accepts an optional second argument that can be used to provide additional options for removing the cookie.

```js
import * as cookies from 'core/cookies';

cookies.remove('foo', {
  path: '/foo',
  domain: 'my-site.com'
});
```

