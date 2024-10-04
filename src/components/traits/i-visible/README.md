# components/traits/i-visible

This module provides a trait for a component that needs to implement visibility behavior such as hiding or showing.

## Synopsis

* This module provides an abstract class, not a component.

* The trait uses `aria` attributes.

* The trait contains TS logic and default styles.

## Modifiers

| Name     | Description             | Values    | Default |
|----------|-------------------------|-----------|---------|
| `hidden` | The component is hidden | `boolean` | -       |

To support these modifiers, override the `mods` static parameter in your component.

```typescript
import iVisible from 'components/traits/i-visible/i-visible';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bButton extends iBlock implements iVisible {
  static override readonly mods: ModsDecl = {
    ...iVisible.mods
  };
}
```

## Events

| Name   | Description                   | Payload description | Payload |
|--------|-------------------------------|---------------------|---------|
| `show` | The component has been shown  | -                   | -       |
| `hide` | The component has been hidden | -                   | -       |

To support these events, override `initModEvents` in your component and invoke the same method from the trait.

```typescript
import iVisible from 'components/traits/i-visible/i-visible';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bButton extends iBlock implements iVisible {
  protected override initModEvents(): void {
    super.initModEvents();
    iVisible.initModEvents(this);
  }
}
```

## Props

The trait specifies a bunch of optional props.

### [hideIfOffline]

If this is true, then the component won't be displayed if there is no Internet connection.

## Helpers

The trait provides a bunch of helper functions to initialize event listeners.

### initModEvents

Initializes modifier event listeners to emit trait events.

```typescript
import iVisible from 'components/traits/i-visible/i-visible';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bButton extends iBlock implements iVisible {
  protected override initModEvents(): void {
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

To enable these styles, import the trait into your component and call the provided mixin in your component.

```stylus
@import "components/traits/i-visible/i-visible.styl"

$p = {
  visibleHelpers: true
}

b-button
  i-visible({helpers: $p.visibleHelpers})
```
