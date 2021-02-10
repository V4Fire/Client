# core/dom/resize

This module provides an API to track changes in the size of DOM elements using `ResizeObserver`.

## Callbacks

| Name       | Description                                       | Payload                                         |
| ---------- | ------------------------------------------------- | ----------------------------------------------- |
| `callback` | Invoked when an element size has been changed     | `ResizeWatcherObservable`, `newRect`, `oldRect` |

## Usage

### Basic

```typescript
import { ResizeWatcher } from 'core/dom/resize-observer';

@component()
export default class bFullScreenView extends iBlock implements iLockPageScroll {
  @hook('mounted')
  initResizeWatcher(): void {
    ResizeWatcher.observe(this.$el, {
      callback: () => this.emit('elementResized')
    })
  }
}
```

### Observe only width changes

```typescript
import { ResizeWatcher } from 'core/dom/resize-observer';

@component()
export default class bFullScreenView extends iBlock implements iLockPageScroll {
  @hook('mounted')
  initResizeWatcher(): void {
    ResizeWatcher.observe(this.$el, {
      callback: () => this.emit('elementResized'),
      watchHeight: false
    })
  }
}
```
