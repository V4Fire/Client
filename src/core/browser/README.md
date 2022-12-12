# core/browser

This module provides an API to determine the current browser name/version.

```js
import { is, test } from 'core/browser'

console.log(is.Android);
console.log(is.iOS);
console.log(is.mobile);

console.log(test('Android', '>=', '5.1'));
```

## Functions

### is

A map of supported environments to detect. If the current `navigator.userAgent` matches one of the map keys,
the value will contain the `[browserName, browserVersion?[]]` tuple. Otherwise, it is `false`.

```js
import { is } from 'core/browser'

console.log(is.Chrome);
console.log(is.Firefox);
console.log(is.Android);
console.log(is.BlackBerry);
console.log(is.iOS);
console.log(is.OperaMini);
console.log(is.WindowsMobile);
```

#### is.mobile

The `[browserName, browserVersion?[]]` tuple if the current `navigator.userAgent` is a mobile browser.
Otherwise, it is "false".

```js
import { is } from 'core/browser'

console.log(is.mobile);
```

### test

Returns true if `navigator.userAgent` matches with the given parameters.

```js
import { test } from 'core/browser'

console.log(test('Android', '>=', '5.1'));
console.log(test('iOS', '<', '14.0'));
```

### match

Accepts the given pattern and returns the tuple `[browserName, browserVersion?[]]` if the pattern matches
`navigator.userAgent`. Otherwise, it returns `false`.

```js
import { match } from 'core/browser/helpers';

export const is = {
  Chrome: match('Chrome'),
  iOS: match('(?:iPhone|iPad|iPod);[ \\w]+(?= \\d)')
};
```
