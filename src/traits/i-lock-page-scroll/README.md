# traits/i-lock-page-scroll

This trait provides API to lock page scroll.
It is used if you have a problem with the scrolling page under pop-ups or other overlaying elements.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic and default styles.

## API

The trait specifies two methods to manage the document lock scroll status: `lock` and `unlock`.

Invoking the `lock` method prevents any document scrolling behavior,
but you can specify the node within which the scrolling is acceptable.

All methods are declared in the trait have default implementation via the static methods.

```typescript
import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';
import iData, { component } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';

@component()
export default class bWindow extends iData implements iLockPageScroll {
  /** @override */
  protected readonly $refs!: {
    window: HTMLElement;
  };

  /** @see iLockPageScroll.lock */
  lock(): Promise<void> {
    return iLockPageScroll.lock(this, this.$refs.window);
  }

  /** @see iLockPageScroll.unlock */
  unlock(): Promise<void> {
    return iLockPageScroll.unlock(this);
  }
}
```
