# core/module-loader

This module provides a class to manage of dynamically loaded modules.

## Usage

```js
import * as moduleLoader from 'core/module-loader';

// Adds a new module to the loading queue.
// The download won't start unless explicitly requested.
moduleLoader.add({
  id: 'form/b-button',
  load: () => import('form/b-button')
});

moduleLoader.add({
  id: 'form/b-input',
  load: () => import('form/b-input'),

  // When the download is requested, it will only start a second after the request
  wait: () => new Promise((r) => setTimeout(r, 1000))
});

console.log(moduleLoader.size()); // 2

console.log(moduleLoader.has('form/b-input'));    // true
console.log(moduleLoader.has('form/b-textarea')); // false

(async () => {
  for await (const module of moduleLoader.values('form/b-input', 'form/b-textarea')) {

  }
})();
```
