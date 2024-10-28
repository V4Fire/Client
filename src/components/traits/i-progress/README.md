# components/traits/i-progress

This module provides a trait for a component have some "progress" behavior.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic and default styles.

## Modifiers

| Name       | Description                                                                                                      | Values    | Default |
|------------|------------------------------------------------------------------------------------------------------------------|-----------|---------|
| `progress` | The component in the process: loading data, processing something, etc. Maybe, we need to show some progress bar. | `boolean` | -       |

To support these modifiers, override the `mods` static parameter in your component.

```typescript
import iProgress from 'components/traits/i-progress/i-progress';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bButton extends iBlock implements iProgress {
  static override readonly mods: ModsDecl = {
    ...iProgress.mods
  };
}
```

## Events

| Name            | Description                                    | Payload description | Payload |
|-----------------|------------------------------------------------|---------------------|---------|
| `progressStart` | The component has started to process something | -                   | -       |
| `progressEnd`   | The component has ended to process something   | -                   | -       |

To support these events, override `initModEvents` in your component and invoke the same method from the trait.

```typescript
import iProgress from 'components/traits/i-progress/i-progress';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bButton extends iBlock implements iProgress {
  protected override initModEvents(): void {
    super.initModEvents();
    iProgress.initModEvents(this);
  }
}
```

## Helpers

The trait provides a bunch of helper functions to initialize event listeners.

### initModEvents

Initializes modifier event listeners to emit trait events.

```typescript
import iProgress from 'components/traits/i-progress/i-progress';
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bButton extends iBlock implements iProgress {
  protected override initModEvents(): void {
    super.initModEvents();
    iProgress.initModEvents(this);
  }
}
```

### initDisableBehavior

Initializes the disable-on-progress behavior for the specified component.

## Styles

The trait provides a bunch of optional styles for the component.

```stylus
$p = {
  helpers: true
}

i-progress
  if $p.helpers
    &__progress
      display none

    &_progress_true
      cursor default
      pointer-events none

    &_progress_true &__progress
    &_progress_true &__over-wrapper
      display block
```

To enable these styles, import the trait into your component and call the provided mixin in your component.

```stylus
@import "components/traits/i-progress/i-progress"

$p = {
  progressHelpers: true
}

b-button
  i-progress({helpers: $p.progressHelpers})
```
