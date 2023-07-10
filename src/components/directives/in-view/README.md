# core/component/directives/in-view

This module provides a directive that allows you to track when an element to which it is added enters or
leaves the viewport.
The module `core/dom/intersection-watcher` is used for efficient tracking of element entry into the viewport.
For a deeper understanding of all possible settings and modes, please refer to the documentation of that module.

## How to include this directive?

Just add the directive import in your component code.

```js
import 'components/directives/in-view';

import iBlock, { component } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {}
```

## Usage

### Simple watching

```
< div v-in-view = console.log
```

### Providing extra options

```
< div v-in-view = {once: true, handler: console.log}
```

### Defining multiple watchers

```
< div v-in-view = [ &
  {once: true, handler: console.log},
  {threshold: 0.5, handler: console.log},
] .
```
