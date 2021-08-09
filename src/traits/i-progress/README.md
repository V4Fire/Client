# traits/i-progress

This module provides a trait for a component have some "progress" behaviour.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic and default styles.

## Modifiers

| Name       | Description                                                                                                      | Values    | Default |
| ---------- | ---------------------------------------------------------------------------------------------------------------- | ----------| ------- |
| `progress` | The component in the process: loading data, processing something, etc. Maybe, we need to show some progress bar. | `Boolean` | -       |

To support these events, override `initModEvents` in your component and invoke a helper method from the trait.

```typescript
import iProgress from 'traits/i-progress/i-progress';

export default class bButton implements iProgress {
  static override readonly mods: ModsDecl = {
    ...iProgress.mods
  }
}
```

## Events

| Name            | Description                                    | Payload description | Payload |
| ----------------| ---------------------------------------------- | --------------------| ------- |
| `progressStart` | The component has started to process something | -                   | -       |
| `progressEnd`   | The component has ended to process something   | -                   | -       |

To support these events, override `initModEvents` in your component and invoke a helper method from the trait.

```typescript
import iProgress from 'traits/i-progress/i-progress';

export default class bButton implements iProgress {
  /** @override */
  protected initModEvents(): void {
    super.initModEvents();
    iProgress.initModEvents(this);
  }
}
```

## Helpers

The trait provides a bunch of helper functions to initialize event listeners.

### initModEvents

Initialize modifier event listeners to emit trait events.

```typescript
import iProgress from 'traits/i-progress/i-progress';

export default class bButton implements iProgress {
  /** @override */
  protected initModEvents(): void {
    super.initModEvents();
    iProgress.initModEvents(this);
  }
}
```

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

To enable these styles, import the trait within your component and call the provided mixin within your component.

```stylus
@import "traits/i-progress/i-progress"

$p = {
  progressHelpers: true
}

b-button
  i-progress({helpers: $p.progressHelpers})
```
