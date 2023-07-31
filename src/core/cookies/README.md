# core/cookies

This module provides an API to work with cookies within a browser.

```js
import * as cookie from 'core/cookies';

cookie.set('foo', 'bar');
console.log(cookie.get('foo') === 'bar');

cookie.remove('foo');
console.log(cookie.has('foo') === false);
```

## API

Cookies support a bunch of methods to work with them.

### has

Returns true, if a cookie by the specified name is defined.

```js
import * as cookie from 'core/cookies';

console.log(cookie.has('foo'));
```

### get

Returns a cookie value by the specified name.

```js
import * as cookie from 'core/cookies';

console.log(cookie.get('foo'));
```

### set

Sets a cookie value by the specified name.

```js
import * as cookie from 'core/cookies';

cookie.set('foo', 'bar');
```

The function can take additional options as the third argument.

```js
import * as cookie from 'core/cookies';

cookie.set('foo', 'bar', {
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
   * A path where the cookie is defined
   * @default `'/'`
   */
  path?: string;

  /**
   * A domain where the cookie is defined.
   * By default, cookies can only be used with the current domain.
   * To allow cookies for all subdomains, set this option to the root domain.
   */
  domain?: string;

  /**
   * A date when the cookie is expired.
   * Also, the option can take string or numeric parameters to create a date.
   *
   * @example
   * ```js
   * set('foo', 'bar', {expires: 'tomorrow'})
   * ```
   */
  expires?: Date | string | number;

  /**
   * The maximum lifetime of the created cookie in seconds.
   * This option is an alternative to `expires`.
   */
  maxAge?: number;

  /**
   * True if the cookie can only be transmitted over a secure HTTPS connection
   * @default `false`
   */
  secure?: boolean;

  /**
   * This option specifies whether the cookie should be restricted to a first-party/same-site context.
   * The option accepts three values:
   *
   * 1. `lax` - cookies are not sent on normal cross-site subrequests
   *    (for example to load images or frames into a third party site), but are sent when a user is navigating to
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
import * as cookie from 'core/cookies';

cookie.remove('foo');
```

The function can take additional options as the second argument.

```js
import * as cookie from 'core/cookies';

cookie.remove('foo', {
  path: '/foo',
  domain: 'my-site.com'
});
```
