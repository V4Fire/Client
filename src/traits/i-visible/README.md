# traits/i-visible

This module provides a trait for a component that needs to implement the "visibility" behavior, like "hiding" or "showing".

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic and default styles.

## Modifiers

| Name     | Description             | Values    | Default |
| -------- | ----------------------- | ----------| ------- |
| `hidden` | The component is hidden | `Boolean` | -       |

To support these events, override `initModEvents` in your component and invoke a helper method from the trait.

```typescript
import iVisible from 'traits/i-visible/i-visible';

export default class bButton implements iVisible {
  /** @inheritDoc */
  static readonly mods: ModsDecl = {
    ...iVisible.mods
  }
}
```

## Events

| Name    | Description                   | Payload description | Payload |
| --------| ----------------------------- | --------------------| ------- |
| `show`  | The component has been shown  | -                   | -       |
| `hide`  | The component has been hidden | -                   | -       |

To support these events, override `initModEvents` in your component and invoke a helper method from the trait.

```typescript
import iVisible from 'traits/i-visible/i-visible';

export default class bButton implements iVisible {
  /** @override */
  protected initModEvents(): void {
    super.initModEvents();
    iVisible.initModEvents(this);
  }
}
```

## Helpers

The trait provides a bunch of helper functions to initialize event listeners.

### initModEvents

Initialize modifier event listeners to emit trait events.

```typescript
import iVisible from 'traits/i-visible/i-visible';

export default class bButton implements iVisible {
  /** @override */
  protected initModEvents(): void {
    super.initModEvents();
    iVisible.initModEvents(this);
  }
}
```

## Styles

The trait provides a bunch of optional styles for the component.

```stylus
$p = {
  helpers: true
}

i-visible
  if $p.helpers
    &_hidden_true
      display none
```

To enable these styles, import the trait within your component and call the provided mixin within your component.

```stylus
@import "traits/i-visible/i-visible.styl"

$p = {
  visibleHelpers: true
}

b-button
  i-visible({helpers: $p.visibleHelpers})
```
