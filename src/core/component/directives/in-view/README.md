# core/component/directives/in-view

This module provides a directive to track elements entering or leaving the viewport.

### Usage

```
< .&__class v-in-view = { &
  threshold: 0.7,
  delay: 2000,
  callback: () => emit('elementInViewport'),
  onEnter: () => emit('elementEnterViewport'),
  onLeave: () => emit('elementLeaveViewport')
} .
```

```ts
import { InView } from 'core/component/directives/in-view';

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

Also, the directive can take an array of options for multiple observing.

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
  callback: () => emit('halfElementInviewport')
}] .
```
