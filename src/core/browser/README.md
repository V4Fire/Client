# core/browser

This module provides API to determine the current browser name/version.

```js
import { is, test } from 'core/browser'

console.log(is.Android);
console.log(is.iOS);
console.log(is.mobile);

console.log(test('Android', '>=', '5.1'));
```

## is

Map of the supported environment to detect. If the current `navigator.userAgent` matches one of the map' key,
the value will contain a tuple `[browserName, browserVersion?[]]`. Otherwise, it is `false`.

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

### is.mobile

A tuple `[browserName, browserVersion?[]]` if the current `navigator.userAgent` is a mobile browser.
Otherwise, it is `false`.

```js
import { is } from 'core/browser'

console.log(is.mobile);
```

## test

Returns true if `navigator.userAgent` matches with the specified parameters.

```js
import { test } from 'core/browser'

console.log(test('Android', '>=', '5.1'));
console.log(test('iOS', '<', '14.0'));
```

## match

Takes a string pattern and returns a tuple `[browserName, browserVersion?[]]` if the pattern is matched with `navigator.userAgent`.
Otherwise, returns `false`.

```js
import { match } from 'core/browser/helpers';

export const is = {
  Chrome: match('Chrome'),
  iOS: match('(?:iPhone|iPad|iPod);[ \\w]+(?= \\d)')
};
```
