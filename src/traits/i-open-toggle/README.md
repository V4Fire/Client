# traits/i-open-toggle-toggle

This module provides a trait for a component that extends the "opening/closing" behaviour with API to toggle.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains only TS logic.

* The trait extends [[iOpen]] and re-exports its API.

## Methods

The trait specifies a bunch of methods to implement.

### toggle

Toggles the component to open or close.
The method has the default implementation.

```typescript
import iOpenToggle from 'traits/i-open-toggle/i-open-toggle';

export default class bButton implements iOpenToggle {
  /** @see iOpenToggle.toggle */
  toggle(...args: unknown[]): Promise<boolean> {
    return iOpenToggle.toggle(this, ...args);
  }
}
```
