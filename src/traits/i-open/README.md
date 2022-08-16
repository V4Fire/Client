# traits/i-open

This module provides a trait for a component that needs to implement the "opening/closing" behavior.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains only TS logic.

## Modifiers

| Name     | Description             | Values    | Default |
|----------|-------------------------|-----------|---------|
| `opened` | The component is opened | `boolean` | -       |

To support these events, override `initModEvents` in your component and invoke a helper method from the trait.

```typescript
import iOpen from 'traits/i-open/i-open';

export default class bButton implements iOpen {
  static override readonly mods: ModsDecl = {
    ...iOpen.mods
  }
}
```

## Events

| Name    | Description                   | Payload description | Payload |
|---------|-------------------------------|---------------------|---------|
| `open`  | The component has been opened | -                   | -       |
| `close` | The component has been closed | -                   | -       |

To support these events, override `initModEvents` in your component and invoke a helper method from the trait.

```typescript
import iOpen from 'traits/i-open/i-open';

export default class bButton implements iOpen {
  /** @override */
  protected initModEvents(): void {
    super.initModEvents();
    iOpen.initModEvents(this);
  }
}
```

## Methods

The trait specifies a bunch of methods to implement.

### open

Opens the component.
The method has the default implementation.

```typescript
import iOpen from 'traits/i-open/i-open';

export default class bButton implements iOpen {
  /** @see iOpen.open */
  open(...args: unknown[]): Promise<boolean> {
    return iOpen.open(this, ...args);
  }
}
```

### close

Disables the component.
The method has the default implementation.

```typescript
import iOpen from 'traits/i-open/i-open';

export default class bButton implements iOpen {
  /** @see iOpen.close */
  close(...args: unknown[]): Promise<boolean> {
    return iOpen.close(this, ...args);
  }
}
```

### onOpenedChange

Handler: the opened modifier has been changed.
The method has the default implementation.

```typescript
import iOpen from 'traits/i-open/i-open';

export default class bButton implements iOpen {
  /** @see iOpen.onOpenedChange */
  onOpenedChange(e: ModEvent | SetModEvent): Promise<void> {
    return iOpen.onOpenedChange(this, e);
  }
}
```

### onKeyClose

Handler: closing by a keyboard event.
The method has the default implementation.

```typescript
import iOpen from 'traits/i-open/i-open';

export default class bButton implements iOpen {
  /** @see iOpen.onKeyClose */
  onKeyClose(e: KeyboardEvent): Promise<void> {
    return iOpen.onKeyClose(this, e);
  }
}
```

### onTouchClose

Handler: closing by a touch event.
The method has the default implementation.

```typescript
import iOpen from 'traits/i-open/i-open';

export default class bButton implements iOpen {
  /** @see iOpen.blur */
  onTouchClose(e: MouseEvent): Promise<void> {
    return iOpen.onTouchClose(this, e);
  }
}
```

## Helpers

The trait provides a bunch of helper functions to work with it.

### is

Checks if the passed object realize the current trait.

```typescript
import iOpen from 'traits/i-open/i-open';

export default class bButton {
  created() {
    if (iOpen.is(this)) {
      this.open();
    }
  }
}
```

### initCloseHelpers

Initialize default event listeners to close a component by a keyboard or mouse.

```typescript
import iOpen from 'traits/i-open/i-open';

export default class bButton implements iOpen {
  /** @see [[iOpen.initCloseHelpers]] */
  @hook('beforeDataCreate')
  protected initCloseHelpers(events?: CloseHelperEvents): void {
    iOpen.initCloseHelpers(this, events);
  }
}
```

### initModEvents

Initialize modifier event listeners to emit component events.

```typescript
import iOpen from 'traits/i-open/i-open';

export default class bButton implements iOpen {
  /** @override */
  protected initModEvents(): void {
    super.initModEvents();
    iOpen.initModEvents(this);
  }
}
```
