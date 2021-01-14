# traits/i-access

This module provides a trait for a component that needs to implement "accessibility" behavior, like "focusing" or "disabling".

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic and default styles.

## Modifiers

| Name       | Description                                                                                  | Values    | Default |
| ---------- | -------------------------------------------------------------------------------------------- | ----------| ------- |
| `disabled` | The component is disabled. All actions, like, input or click, are prevented                  | `Boolean` | -       |
| `focused`  | The component in focus. Form components can force the showing of native UI, like a keyboard. | `Boolean` | -       |

To support these modifiers, import them from the trait into your component.

```typescript
import iAccess from 'traits/i-access/i-access';
export default class bButton implements iAccess {
  /** @inheritDoc */
  static readonly mods: ModsDecl = {
    ...iAccess.mods
  }
}
```

## Events

| Name       | Description                      | Payload description | Payload |
| ---------- | -------------------------------- | ------------------- | ------- |
| `enable`   | The component has been enabled   | -                   | -       |
| `disable`  | The component has been disabled  | -                   | -       |
| `focus`    | The component in focus           | -                   | -       |
| `blur`     | The component has lost the focus | -                   | -       |

To support these events, override `initModEvents` in your component and puts within invoking a helper method from the trait.

```typescript
import iAccess from 'traits/i-access/i-access';
export default class bButton implements iAccess {
  /** @override */
  protected initModEvents(): void {
    super.initModEvents();
    iAccess.initModEvents(this);
  }
}
```

## Props

The trait specifies two optional props.

### autofocus

A Boolean prop which, if present, indicates that the component should automatically
have focus when the page has finished loading (or when the `<dialog>` containing the element has been displayed).

[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautofocus)

### tabIndex

An integer prop indicating if the component can take input focus (is focusable),
if it should participate to sequential keyboard navigation.
As all input types except for input of type hidden are focusable, this attribute should not be used on
form controls, because doing so would require the management of the focus order for all elements within
the document with the risk of harming usability and accessibility if done incorrectly.

[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)

## Accessors

The trait specifies a getter to determine when the component in focus or not.

### isFocused

True if the component in focus.
The getter has the default implementation via a static method `iAccess.isFocused`.

```typescript
import iAccess from 'traits/i-access/i-access';
export default class bButton implements iAccess {
  /** @see iAccess.isFocused */
  get isFocused(): Promise<boolean> {
    return iAccess.isFocused(this);
  }
}
```

## Methods

The trait specifies a bunch of methods to implement.

### enable

Enables the component.
The method has the default implementation via a static method `iAccess.enable`.

```typescript
import iAccess from 'traits/i-access/i-access';
export default class bButton implements iAccess {
  /** @see iAccess.enable */
  enable(): Promise<boolean> {
    return iAccess.enable(this);
  }
}
```

### disable

Disables the component.
The method has the default implementation via a static method `iAccess.disable`.

```typescript
import iAccess from 'traits/i-access/i-access';
export default class bButton implements iAccess {
  /** @see iAccess.disable */
  disable(): Promise<boolean> {
    return iAccess.disable(this);
  }
}
```

### focus

Sets focus to the component
The method has the default implementation via a static method `iAccess.focus`.

```typescript
import iAccess from 'traits/i-access/i-access';
export default class bButton implements iAccess {
  /** @see iAccess.focus */
  focus(): Promise<boolean> {
    return iAccess.focus(this);
  }
}
```

### blur

Unsets focus to the component.
The method has the default implementation via a static method `iAccess.blur`.

```typescript
import iAccess from 'traits/i-access/i-access';
export default class bButton implements iAccess {
  /** @see iAccess.blur */
  blur(): Promise<boolean> {
    return iAccess.blur(this);
  }
}
```

## Helpers

The trait provides a helper function to initialize modifier event listeners to emit component events.

```typescript
import iAccess from 'traits/i-access/i-access';
export default class bButton implements iAccess {
  /** @override */
  protected initModEvents(): void {
    super.initModEvents();
    iAccess.initModEvents(this);
  }
}
```

## Styles

The trait provides a bunch of optional styles for the component.

```stylus
$p = {
  helpers: true
}
i-access
  if $p.helpers
    &_disabled_true
      cursor default
      pointer-events none
    &_disabled_true &__over-wrapper
      display block
```

To enable these styles, import the trait within your component and call the provided mixin within your component.

```stylus
@import "traits/i-access/i-access.styl"
$p = {
  accessHelpers: true
}
b-button
  i-access({helpers: $p.accessHelpers})
```
