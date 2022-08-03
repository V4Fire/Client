# core/component/directives/on-resize

This module provides a directive to watch element resizing.
The directive uses the `core/dom/resize-watcher` module to watch elements.
For more information, please refer its documentation.

## How to include a directive?

Just add the directive import in your component code.

```js
import 'core/component/directives/on-resize';

import iBlock, { component } from 'super/i-block/i-block';

@component()
class bExample extends iBlock {}
```

## Usage

### Simple watching

```
< div v-on-resize = console.log
```

### Providing extra options

```
< div v-on-resize = {once: true, handler: console.log}
```

### Defining multiple watchers

```
< div v-on-resize = [ &
  {once: true, handler: console.log},
  {box: 'border-box', handler: console.log},
] .
```
