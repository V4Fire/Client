# core/component/directives/in-view

This module provides a directive to track elements entering or leaving the viewport.
The directive uses the `core/dom/intersection-watcher` module to watch elements.
For more information, please refer its documentation.

## How to include a directive?

Just add the directive import in your component code.

```js
import 'core/component/directives/in-view';

import iBlock, { component } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {}
```

## Usage

### Simple watching

```
< div v-on-in-view = console.log
```

### Providing extra options

```
< div v-on-in-view = {once: true, handler: console.log}
```

### Defining multiple watchers

```
< div v-in-view = [ &
  {once: true, handler: console.log},
  {threshold: 0.5, handler: console.log},
] .
```
