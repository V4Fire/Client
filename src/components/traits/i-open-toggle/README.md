# components/traits/i-open-toggle-toggle

This module provides a trait for a component that extends the "opening/closing" behavior with an API to toggle.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains only TS logic.

* The trait extends [[iOpen]] and re-exports its API.

* The trait can be automatically derived.

  ```typescript
  import { derive } from 'components/traits';

  import iOpenToggle from 'components/traits/i-open-toggle/i-open-toggle';
  import iBlock, { component } from 'components/super/i-block/i-block';

  interface bButton extends Trait<typeof iOpenToggle> {}

  @component()
  @derive(iOpenToggle)
  class bButton extends iBlock implements iOpenToggle {
    static override readonly mods: ModsDecl = {
      ...iOpenToggle.mods
    };

    protected override initModEvents(): void {
      super.initModEvents();
      iOpenToggle.initModEvents(this);
    }
  }

  export default bButton;
  ```

## Methods

The trait specifies a bunch of methods to implement.

### toggle

Toggles the component to open or close.
The method has a default implementation.

```typescript
import iOpenToggle from 'components/traits/i-open-toggle/i-open-toggle';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bButton extends iBlock implements iOpenToggle {
  /** {@link iOpenToggle.toggle} */
  toggle(...args: unknown[]): Promise<boolean> {
    return iOpenToggle.toggle(this, ...args);
  }
}
```
