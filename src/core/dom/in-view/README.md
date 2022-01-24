# core/dom/in-view

This module provides API to track elements entering or leaving the viewport.

## Callbacks

| Name       | Description                                                                      | Payload description  | Payload      |
|------------|----------------------------------------------------------------------------------|----------------------|--------------|
| `callback` | Invoked when an element stands in the viewport more than the specified delay     | `Observable` element | `Observable` |
| `onEnter`  | Invoked when an element passed the specified `threshold` and enters the viewport | `Observable` element | `Observable` |
| `onLeave`  | Invoked when an element passed the specified `threshold` and leaves the viewport | `Observable` element | `Observable` |

## Usage

```typescript
import { InView } from 'core/dom/in-view';

@component()
export default class bFullScreenView extends iBlock implements iLockPageScroll {
  @hook('mounted')
  initInView(): void {
    InView.observe(this.$el, {
      threshold: 0.7,
      delay: 2000,
      once: true,
      callback: () => this.emit('elementInViewport'),
      onEnter: () => this.emit('elementEnterViewport'),
      onLeave: () => this.emit('elementLeaveViewport')
    })
  }
}
```

Also, the module can take an array of options for multiple observing.

**Notice:** If you want to observe a single element with multiple observers, the observers must have different thresholds.
