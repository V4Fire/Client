# core/cookies

This module provides API to work with cookies within a browser.

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

### remove

Removes a cookie by the specified name.

```js
import * as cookie from 'core/cookies';

cookie.remove('foo');
```

The function can take additional options as the second argument.

```js
import * as cookie from 'core/cookies';

cookie.remove('foo', {
  secure: true,
  path: '/foo',
  domain: 'my-site.com'
});
```
