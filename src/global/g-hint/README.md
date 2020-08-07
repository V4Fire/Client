# global/g-hint

This module provides a mixin to create tooltips or hints.

## Usage

There are different ways to use this mixin:

1. A tooltip based on pseudo attributes.

```
- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    /// The "pos" modifier shows the way to position a hint
    < .&__hint.&_pos_right data-hint = Hello world
```

```stylus
@import "global/g-hint/g-hint.styl"

$p = {

}

b-example
  g-hint({
    // Selector to a hint container
    location: "&__hint"

    // Selector to show the hint
    showOn: '&:hover',

    // From which attribute take a text to show
    dataAttr: 'data-hint'

    contentStyles: {
      font-size: 12px
      color: #FEFEFE
      background-color: #616161
    }
  })
```

2. The global flyweight tooltip based on pseudo attributes.

Just add `g-hint` classes to any node and provide the hint message into the `data-hint` attribute.

```
- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < button.g-hint.&_pos_bottom data-hint = Hello world
      Hover me!
```

Mind, you need to enable `globalHintHelpers` into your root component styles.

```stylus
@import "super/i-static-page/i-static-page.styl"

$p = {
  globalHintHelpers: true
}

p-root extends i-static-page
```

3. A tooltip bases on an HTML layout.

```
- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < .&__button

    < .&__dropdown.&_pos_bottom-left
      Hello world!
```

```stylus
@import "global/g-hint/g-hint.styl"

$p = {

}

b-example
  &__dropdown
    transition opacity 1s

  g-hint({
    // Selector to a hint container
    location: "&__dropdown"

    // Selector to show the hint
    showOn: '&__button:hover + &__dropdown'

    // Hide the hint by default
    hidden: true,

    // CSS rules to hide a hint
    hideStyles: {
      opacity: 0,
      height: 0
    }

    // CSS rules to show a hint
    showSyles: {
      opacity: 1
      height: auto
    }
  })
```

## Variation of position modifiers

You can manage position of a hint by using the `pos` modifier.

```typescript
type HintPosition =
//     v
// Hint message
'top' |

// v
// Hint message
'top-left' |

//            v
// Hint message
'top-right' |

//   Hint message
// > ...
//   ...
'left' |

// > Hint message
//   ...
//   ...
'left-top' |

//   Hint message
//   ...
// > ...
'left-bottom' |

// Hint message
// ...          <
// ...
'right' |

// Hint message <
// ...
// ...
'right-top' |

// Hint message
// ...
// ...          <
'right-bottom' |

// Hint message
//     v
'bottom' |

// Hint message
// v
'bottom-left' |

// Hint message
//            v
'bottom-right';
```
