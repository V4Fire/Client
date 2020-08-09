# core/async

This module extends the [Async](https://v4fire.github.io/Core/modules/src_core_async_index.html) class from and adds a bunch of methods for browser-specific async tasks.

```js
import Async from 'core/async'

const $a = new Async();

$a.requestAnimationFrame(() => {
  console.log('Boom!');
});

$a.dnd(document.getElementById('bla'), {
  onDragStart() {

  },

  onDrag() {

  },

  onDragEnd() {

  }
});
```
