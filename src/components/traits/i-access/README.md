# components/traits/i-access

This module provides a trait for a component that needs to implement accessibility behavior such as focusing
or disabling.

## Synopsis

* This module provides an abstract class, not a component.

* The trait uses `aria` attributes.

* The trait contains TS logic and default styles.

* The trait can be automatically derived.

  ```typescript
  import { derive } from 'core/functools/trait';

  import iAccess from 'components/traits/i-access/i-access';
  import iBlock, { component } from 'components/super/i-block/i-block';

  interface bButton extends Trait<typeof iAccess> {}

  @component()
  @derive(iAccess)
  class bButton extends iBlock implements iAccess {
    static override readonly mods: ModsDecl = {
      ...iAccess.mods
    };

    protected override initModEvents(): void {
      super.initModEvents();
      iAccess.initModEvents(this);
    }
  }

  export default bButton;
  ```

## Modifiers

| Name       | Description                                                                                  | Values    | Default |
|------------|----------------------------------------------------------------------------------------------|-----------|---------|
| `disabled` | The component is disabled. All actions, like, `input` or `click`, are prevented.             | `boolean` | -       |
| `focused`  | The component in focus. Form components can force the showing of native UI, like a keyboard. | `boolean` | -       |

To support these modifiers, override the `mods` static parameter in your component.

```typescript
import iAccess from 'components/traits/i-access/i-access';
import iBlock, { component } from 'components/super/i-block/i-block';

export default class bButton extends iBlock implements iAccess {
  static override readonly mods: ModsDecl = {
    ...iAccess.mods
  };
}
```

## Events

| Name      | Description                      | Payload description | Payload |
|-----------|----------------------------------|---------------------|---------|
| `enable`  | The component has been enabled   | -                   | -       |
| `disable` | The component has been disabled  | -                   | -       |
| `focus`   | The component in focus           | -                   | -       |
| `blur`    | The component has lost the focus | -                   | -       |

To support these events, override `initModEvents` in your component and invoke the same method from the trait.

```typescript
import iAccess from 'components/traits/i-access/i-access';
import iBlock, { component } from 'components/super/i-block/i-block';

export default class bButton extends iBlock implements iAccess {
  protected override initModEvents(): void {
    super.initModEvents();
    iAccess.initModEvents(this);
  }
}
```

## Props

The trait specifies two optional props.

### [autofocus]

A boolean prop which, if present, indicates that the component should automatically
have focus when the page has finished loading (or when the `<dialog>` containing the element has been displayed).

[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautofocus).

### [tabIndex]

An integer prop indicating if the component can take input focus (is focusable),
if it should participate to sequential keyboard navigation.

As all input types except for input of type hidden are focusable, this attribute should not be used on
form controls, because doing so would require the management of the focus order for all elements within
the document with the risk of harming usability and accessibility if done incorrectly.

[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input).

## Accessors

The trait specifies a getter to determine when the component is in focus or not.

### isFocused

True if the component is in focus.
The getter has the default implementation.

```typescript
import iAccess from 'components/traits/i-access/i-access';
import iBlock, { component } from 'components/super/i-block/i-block';

export default class bButton extends iBlock implements iAccess {
  /** {@link iAccess.isFocused} */
  get isFocused(): Promise<boolean> {
    return iAccess.isFocused(this);
  }
}
```

## Methods

The trait specifies a bunch of methods to implement.

### enable

Enables the component.
The method has a default implementation.

```typescript
import iAccess from 'components/traits/i-access/i-access';
import iBlock, { component } from 'components/super/i-block/i-block';

export default class bButton extends iBlock implements iAccess {
  /** {@link iAccess.enable} */
  enable(): Promise<boolean> {
    return iAccess.enable(this);
  }
}
```

### disable

Disables the component.
The method has a default implementation.

```typescript
import iAccess from 'components/traits/i-access/i-access';
import iBlock, { component } from 'components/super/i-block/i-block';

export default class bButton extends iBlock implements iAccess {
  /** {@link iAccess.disable} */
  disable(): Promise<boolean> {
    return iAccess.disable(this);
  }
}
```

### focus

Sets focus on the component.
The method has a default implementation.

```typescript
import iAccess from 'components/traits/i-access/i-access';
import iBlock, { component } from 'components/super/i-block/i-block';

export default class bButton extends iBlock implements iAccess {
  /** {@link iAccess.focus} */
  focus(): Promise<boolean> {
    return iAccess.focus(this);
  }
}
```

### blur

Unsets focus on the component.
The method has a default implementation.

```typescript
import iAccess from 'components/traits/i-access/i-access';
import iBlock, { component } from 'components/super/i-block/i-block';

export default class bButton extends iBlock implements iAccess {
  /** {@link iAccess.blur} */
  blur(): Promise<boolean> {
    return iAccess.blur(this);
  }
}
```

## Helpers

The trait provides a bunch of helper functions to initialize event listeners.

### initModEvents

Initializes modifier event listeners to emit trait events.

```typescript
import iAccess from 'components/traits/i-access/i-access';
import iBlock, { component } from 'components/super/i-block/i-block';

export default class bButton extends iBlock implements iAccess {
  protected override initModEvents(): void {
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

To enable these styles, import the trait into your component and call the provided mixin in your component.

```stylus
@import "components/traits/i-access/i-access.styl"

$p = {
  accessHelpers: true
}

b-button
  i-access({helpers: $p.accessHelpers})
```
