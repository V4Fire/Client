# super/i-block/modules/sync

This module provides a class with some helper methods to organize a "link" from one component property to another.

```js
this.foo = 1;
this.bla = this.sync.link(['bla', 'foo'], (v) => v * 2);
```
