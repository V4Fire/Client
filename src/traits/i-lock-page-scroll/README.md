# traits/i-lock-page-scroll

This trait provides API to lock the page scroll.
It is used if you have a problem with the scrolling page under pop-ups or other overlaying elements.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic and default styles.

## API

The trait specifies two methods to manage the document lock scroll status: `lock` and `unlock`.

Invoking the `lock` method prevents any document scrolling behavior,
but you can specify the node within which the scrolling is acceptable.

All methods are declared in the trait have the default implementations via the static methods.
You can derive it automatically by using the `derive` decorator.

```typescript
import { derive } from 'core/functools/trait';

import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';

interface bWindow extends Trait<typeof iLockPageScroll> {}

@derive(iLockPageScroll)
class bWindow implements iLockPageScroll {
  /** @override */
  protected readonly $refs!: {
    window: HTMLElement;
  };

  /** @see iLockPageScroll.lock */
  lock(): Promise<void> {
    return iLockPageScroll.lock(this, this.$refs.window);
  }
}

export default bWindow;
```

### Helpers

The trait provides a helper function to initialize modifier event listeners to emit component events.

```typescript
import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';

export default class bWindow implements iLockPageScroll {
  /** @override */
  protected initModEvents(): void {
    super.initModEvents();
    iLockPageScroll.initModEvents(this);
  }
}
```

## Styles

The trait provides a bunch of optional styles for the component.

```stylus
$p = {
  helpers: true
}

i-lock-page-scroll
  if $p.helpers
    &-lock-scroll-mobile-true
      size 100%
      overflow hidden

    &-lock-scroll-mobile-true body
      position fixed
      width 100%
      overflow hidden

    &-lock-scroll-desktop-true body
      overflow hidden
```

To enable these styles, import the trait within your component and call the provided mixin within your component.

```stylus
@import "traits/i-lock-page-scroll/i-lock-page-scroll.styl"

$p = {
  lockPageHelpers: true
}

b-button
  i-lock-page-scroll({helpers: $p.lockPageHelpers})
```
