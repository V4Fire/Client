# core/html

This module provides a bunch of helper functions to work with HTML tags and attributes.

## getSrcSet

Returns a srcset string for an image tag by the specified resolution map.

```js
import { getSrcSet } from 'core/html';

// 'http://img-hdpi.png 2x, http://img-xhdpi.png 3x'
console.log(getSrcSet({'2x': 'http://img-hdpi.png', '3x': 'http://img-xhdpi.png'}));
```
