# core/component/directives/on-resize

This module provides a directive that allows tracking when an element to which it is added changes its size.
The module `core/dom/resize-watcher` is used for efficient tracking of changes in the sizes of elements.
For a better understanding of all possible settings and modes, refer to the documentation of that module.

## How to include this directive?

Just add the directive import in your component code.

```js
import 'components/directives/on-resize';

import iBlock, { component } from 'components/super/i-block/i-block';

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
