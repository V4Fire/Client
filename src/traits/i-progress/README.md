# traits/i-progress

This module provides a trait for a component have some "progress" behaviour.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains TS logic and default styles.

## Modifiers

| Name       | Description                                                                                                      | Values    | Default |
| ---------- |------------------------------------------------------------------------------------------------------------------| ----------|-------- |
| `progress` | The component in the process: loading data, processing something, etc. Maybe, we need to show some progress bar. | `Boolean` | -       |

To support these modifiers, import them from the trait into your component.

```typescript
import iProgress from 'traits/i-progress/i-progress';

export default class bButton implements iProgress {
  /** @inheritDoc */
  static readonly mods: ModsDecl = {
    ...iProgress.mods
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
