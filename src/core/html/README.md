# core/html

This module provides a bunch of helper functions for working with HTML tags and attributes.

## Functions

### getSrcSet

Returns a value for the `srcset` attribute, based on the passed dictionary.

```js
import { getSrcSet } from 'core/html';

// '/img-hdpi.png 2x, /img-xhdpi.png 3x'
console.log(getSrcSet({'2x': '/img-hdpi.png', '3x': '/img-xhdpi.png'}));
```
