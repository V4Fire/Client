# core/cookies

This module provides API to work with cookies in the current browser.

```js
import * as cookie from 'core/cookies';

cookie.set('foo', 'bar');
console.log(cookie.get('foo') === 'bar');
cookie.remove('foo');
console.log(cookie.has('foo') === false);
```
