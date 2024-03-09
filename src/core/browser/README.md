# core/browser

This module provides an API that determines the current browser's name/version.

```js
import { is, test } from 'core/browser'

console.log(is.Android);
console.log(is.iOS);
console.log(is.mobile);

console.log(test('Android', '>=', '5.1'));
```

## Functions

### is

This is a map of supported environments for detection.
If the current `navigator.userAgent` matches one of the map keys,
the value will be a tuple of `[browserName, browserVersion?[]]`.
If it doesn't match, the value will be `false`.

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

Returns the `[browserName, browserVersion?[]]` tuple if the current navigator.userAgent is a mobile browser.
Otherwise, it returns `false`.

```js
import { is } from 'core/browser'

console.log(is.mobile);
```

### test

Returns true if the `navigator.userAgent` matches the given parameters.

```js
import { test } from 'core/browser'

console.log(test('Android', '>=', '5.1'));
console.log(test('iOS', '<', '14.0'));
```

### match

Accepts the given pattern and returns the `[browserName, browserVersion?[]]` tuple
if the pattern matches `navigator.userAgent`.
If it doesn't match, it returns `false`.

```js
import { match } from 'core/browser/helpers';

export const is = {
  Chrome: match('Chrome'),
  iOS: match('(?:iPhone|iPad|iPod);[ \\w]+(?= \\d)')
};
```
