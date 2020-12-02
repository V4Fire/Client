# core/component/directives/in-view

This module provides a directive to track elements entering or leaving the viewport.

## Usage

```
< .&__class v-in-view = [{ &
  threshold: 0.7,
  delay: 2000,
  callback: () => emit('elementInViewport'),
  onEnter: () => emit('elementEnterViewport'),
  onLeave: () => emit('elementLeaveViewport')
}, {
  threshold: 0.5,
  delay: 1000,
  callback: () => console.log('half of the element in the viewport for 1 second')
}] .
```

For more examples go to [`core/dom/in-view`](core/dom/in-view/index.ts).
