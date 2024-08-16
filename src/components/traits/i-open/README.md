# components/traits/i-open

This module provides a trait for a component that needs to implement the "opening/closing" behavior.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains only TS logic.

* The trait can be automatically derived.

  ```typescript
  import { derive } from 'core/functools/trait';

  import iOpen from 'components/traits/i-open/i-open';
  import iBlock, { component } from 'components/super/i-block/i-block';

  interface bButton extends Trait<typeof iOpen> {}

  @component()
  @derive(iOpen)
  class bButton extends iBlock implements iOpen {
    static override readonly mods: ModsDecl = {
      ...iOpen.mods
    };

    protected override initModEvents(): void {
      super.initModEvents();
      iOpen.initModEvents(this);
    }
  }

  export default bButton;
  ```

## Modifiers

| Name     | Description             | Values    | Default |
|----------|-------------------------|-----------|---------|
| `opened` | The component is opened | `boolean` | -       |

To support these modifiers, override the `mods` static parameter in your component.

```typescript
import iOpen from 'components/traits/i-open/i-open';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bButton implements iOpen {
  static override readonly mods: ModsDecl = {
    ...iOpen.mods
  };
}
```

## Events

| Name    | Description                   | Payload description | Payload |
|---------|-------------------------------|---------------------|---------|
| `open`  | The component has been opened | -                   | -       |
| `close` | The component has been closed | -                   | -       |

To support these events, override `initModEvents` in your component and invoke the same method from the trait.

```typescript
import iOpen from 'components/traits/i-open/i-open';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bButton extends iBlock implements iOpen {
  protected override initModEvents(): void {
    super.initModEvents();
    iOpen.initModEvents(this);
  }
}
```

## Methods

The trait specifies a bunch of methods to implement.

### open

Opens the component.
The method has a default implementation.

```typescript
import iOpen from 'components/traits/i-open/i-open';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bButton extends iBlock implements iOpen {
  /** {@link iOpen.open} */
  open(...args: unknown[]): Promise<boolean> {
    return iOpen.open(this, ...args);
  }
}
```

### close

Closes the component.
The method has a default implementation.

```typescript
import iOpen from 'components/traits/i-open/i-open';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bButton extends iBlock implements iOpen {
  /** {@link iOpen.close} */
  close(...args: unknown[]): Promise<boolean> {
    return iOpen.close(this, ...args);
  }
}
```

### onOpenedChange

Handler: the opened modifier has been changed.
The method has a default implementation.

```typescript
import iOpen from 'components/traits/i-open/i-open';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bButton extends iBlock implements iOpen {
  /** {@link iOpen.onOpenedChange} */
  onOpenedChange(e: ModEvent | SetModEvent): Promise<void> {
    return iOpen.onOpenedChange(this, e);
  }
}
```

### onKeyClose

Handler: closing the component by a keyboard event.
The method has a default implementation.

```typescript
import iOpen from 'components/traits/i-open/i-open';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bButton extends iBlock implements iOpen {
  /** {@link iOpen.onKeyClose} */
  onKeyClose(e: KeyboardEvent): Promise<void> {
    return iOpen.onKeyClose(this, e);
  }
}
```

### onTouchClose

Handler: closing the component by a touch event.
The method has a default implementation.

```typescript
import iOpen from 'components/traits/i-open/i-open';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bButton extends iBlock implements iOpen {
  /** {@link iOpen.blur} */
  onTouchClose(e: MouseEvent): Promise<void> {
    return iOpen.onTouchClose(this, e);
  }
}
```

## Helpers

The trait provides a bunch of helper functions to initialize event listeners.

### initCloseHelpers

Initializes default event listeners to close a component using the keyboard or mouse.

```typescript
import iOpen from 'components/traits/i-open/i-open';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bButton extends iBlock implements iOpen {
  /** {@link iOpen.initCloseHelpers} */
  @hook('beforeDataCreate')
  protected initCloseHelpers(events?: CloseHelperEvents): void {
    iOpen.initCloseHelpers(this, events);
  }
}
```

### initModEvents

Initializes modifier event listeners to emit trait events.

```typescript
import iOpen from 'components/traits/i-open/i-open';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bButton extends iBlock implements iOpen {
  protected override initModEvents(): void {
    super.initModEvents();
    iOpen.initModEvents(this);
  }
}
```
