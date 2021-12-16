# traits/i-lock-page-scroll

This trait provides API to lock the document scroll.
It is used if you have a problem with the scrolling page under pop-ups or other overlaying elements.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic and default styles.

## Events

| Name     | Description                       | Payload description | Payload |
|----------|-----------------------------------|---------------------|---------|
| `lock`   | The page scroll has been locked   | -                   | -       |
| `unlock` | The page scroll has been unlocked | -                   | -       |

To support these events, override `initModEvents` in your component and invoke a helper method from the trait.

```typescript
import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';

class bWindow implements iLockPageScroll {
  /** @override */
  protected initModEvents(): void {
    super.initModEvents();
    iLockPageScroll.initModEvents(this);
  }
}
```

## Methods

The trait specifies a bunch of methods to implement.

### lock

Locks the document scroll, i.e., it prevents any scrolling on the document except withing the specified node.
The method has the default implementation.

```typescript
import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';

class bWindow implements iLockPageScroll {
  /** @see iLockPageScroll.enlockable */
  lock(scrollableNode?: Element): Promise<void> {
    return iLockPageScroll.lock(this, scrollableNode);
  }
}
```

### unlock

Unlocks the document scroll.
The method has the default implementation.

```typescript
import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';

class bWindow implements iLockPageScroll {
  /** @see iLockPageScroll.unlock */
  unlock(): Promise<void> {
    return iLockPageScroll.unlock(this);
  }
}
```

## Helpers

The trait provides a bunch of helper functions to initialize event listeners.

### initModEvents

Initialize modifier event listeners to emit trait events.

```typescript
import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';

class bWindow implements iLockPageScroll {
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
