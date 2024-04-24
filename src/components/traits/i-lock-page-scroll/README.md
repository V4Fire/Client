# components/traits/i-lock-page-scroll

This trait provides an API for blocking document scrolling.
It is useful if you have an issue with page scrolling under popups or other overlay elements.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic and default styles.

* The trait can be automatically derived.

  ```typescript
  import { derive } from 'core/functools/trait';

  import iLockPageScroll from 'components/traits/i-lock-page-scroll/i-lock-page-scroll';
  import iBlock, { component, wait } from 'components/super/i-block/i-block';

  interface bWindow extends Trait<typeof iLockPageScroll> {}

  @component()
  @derive(iLockPageScroll)
  class bWindow extends iBlock implements iLockPageScroll {
    protected override initModEvents(): void {
      super.initModEvents();
      iLockPageScroll.initModEvents(this);
    }
  }

  export default bWindow;
  ```

## Root modifiers

| Name                    | Description                                     | Values    | Default |
|-------------------------|-------------------------------------------------|-----------|---------|
| `lockPageScrollMobile`  | The page scroll is locked (for mobile devices)  | `boolean` | -       |
| `lockPageScrollDesktop` | The page scroll is locked (for desktop devices) | `boolean` | -       |

## Events

| Name               | Description                       | Payload description | Payload |
|--------------------|-----------------------------------|---------------------|---------|
| `lockPageScroll`   | The page scroll has been locked   | -                   | -       |
| `unlockPageScroll` | The page scroll has been unlocked | -                   | -       |

To support these events, override `initModEvents` in your component and invoke the same method from the trait.

```typescript
import iLockPageScroll from 'components/traits/i-lock-page-scroll/i-lock-page-scroll';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bWindow extends iBlock implements iLockPageScroll {
  protected override initModEvents(): void {
    super.initModEvents();
    iLockPageScroll.initModEvents(this);
  }
}
```

## Methods

The trait specifies a bunch of methods to implement.

### lockPageScroll

Locks scrolling of the document, preventing any scrolling of the document except within that node and
registers the destructor, which unlocks the page scroll when the component is destroyed.
The method has a default implementation.

```typescript
import iLockPageScroll from 'components/traits/i-lock-page-scroll/i-lock-page-scroll';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bWindow extends iBlock implements iLockPageScroll {
  /** {@link iLockPageScroll.enlockable} */
  lockPageScroll(scrollableNode?: Element): Promise<void> {
    return iLockPageScroll.lockPageScroll(this, scrollableNode);
  }
}
```

### unlockPageScroll

Unlocks scrolling of the document.
The method has a default implementation.

```typescript
import iLockPageScroll from 'components/traits/i-lock-page-scroll/i-lock-page-scroll';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bWindow extends iBlock implements iLockPageScroll {
  /** {@link iLockPageScroll.unlockPageScroll} */
  unlockPageScroll(): Promise<void> {
    return iLockPageScroll.unlockPageScroll(this);
  }
}
```

## Helpers

The trait provides a bunch of helper functions to initialize event listeners.

### initModEvents

Initializes modifier event listeners to emit trait events.

```typescript
import iLockPageScroll from 'components/traits/i-lock-page-scroll/i-lock-page-scroll';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bWindow extends iBlock implements iLockPageScroll {
  protected override initModEvents(): void {
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
    &-lock-page-scroll-mobile-true
      size 100%
      overflow hidden

    &-lock-page-scroll-mobile-true body
      position fixed
      width 100%
      overflow hidden

    &-lock-page-scroll-desktop-true body
      overflow hidden
```

To enable these styles, import the trait into your component and call the provided mixin in your component.

```stylus
@import "components/traits/i-lock-page-scroll/i-lock-page-scroll.styl"

$p = {
  lockPageHelpers: true
}

b-button
  i-lock-page-scroll({helpers: $p.lockPageHelpers})
```
