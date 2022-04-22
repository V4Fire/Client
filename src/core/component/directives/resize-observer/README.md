# core/component/directives/resize

This module provides a directive to track changes in the size of DOM elements using `ResizeObserver`.

## Usage

```
< div v-resize-observer = { &
  callback: () => emit('elementResized')
} .
```

For more examples go to [`core/dom/resize-observer`](core/dom/resize-observer/index.ts).
