# core/dom

This module provides a bunch of helper functions to work with DOM objects.

```js
import { wrapAsDelegateHandler } from 'core/dom';

document.addEventListener('click', wrapAsDelegateHandler('.bla', (e) => {
  console.log(e);
}));
```
