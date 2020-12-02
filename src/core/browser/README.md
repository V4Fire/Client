# core/browser

This module provides API to determine the current browser name/version.

```js
import { is, test } from 'core/browser'

console.log(is.Android);
console.log(is.iOS);
console.log(is.mobile);

console.log(test('Android', '>=', '5.1'));
```
