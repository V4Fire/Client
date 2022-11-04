# components/global/g-hint

This module provides a Stylus mixin for creating tooltips.

## Synopsis

* This module provides a global Stylus mixin, not a component.

## Usage

There are different ways to use this mixin.

### Embedded tooltip styles based on data attributes

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    /// The "pos" modifier indicates how the tooltip should be placed
    < .&__hint.&_pos_right data-hint = Hello world
```

```stylus
@import "components/global/g-hint/g-hint.styl"

$p = {

}

b-example
  g-hint({
    // Selector to the hint container
    location: "&__hint"

    // Selector to show the hint
    showOn: '&:hover',

    // From which attribute to take the text for display
    dataAttr: 'data-hint'

    contentStyles: {
      font-size: 12px
      color: #FEFEFE
      background-color: #616161
    }
  })
```

### Global tooltip styles based on data attributes

Just add the `g-hint` classes to any node and provide a hint message in the `data-hint` attribute.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < button.g-hint.&_pos_bottom data-hint = Hello world
      Hover me!
```

Keep in mind you need to enable `globalHintHelpers` in the styles of the root component.

```stylus
@import "components/super/i-static-page/i-static-page.styl"

$p = {
  globalHintHelpers: true
}

p-root extends i-static-page
```

### Embedded tooltip styles based on HTML layout

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < .&__button

    < .&__dropdown.&_pos_bottom-left
      Hello world!
```

```stylus
@import "components/global/g-hint/g-hint.styl"

$p = {

}

b-example
  &__dropdown
    transition opacity 1s

  g-hint({
    // Selector to the hint container
    location: "&__dropdown"

    // Selector to show the hint
    showOn: '&__button:hover + &__dropdown'

    // Hide the hint by default
    hidden: true,

    // CSS rules to hide the hint
    hideStyles: {
      opacity: 0,
      height: 0
    }

    // CSS rules to show the hint
    showSyles: {
      opacity: 1
      height: auto
    }
  })
```

## Variation of position modifiers

You can manage the position of the tooltip using the `pos` modifier.

```typescript
type HintPosition =
//     v
// A hint message
'top' |

// v
// A hint message
'top-left' |

//            v
// A hint message
'top-right' |

//   A hint message
// > ...
//   ...
'left' |

// > A hint message
//   ...
//   ...
'left-top' |

//   A hint message
//   ...
// > ...
'left-bottom' |

// A hint message
// ...          <
// ...
'right' |

// A hint message <
// ...
// ...
'right-top' |

// A hint message
// ...
// ...          <
'right-bottom' |

// A hint message
//     v
'bottom' |

// A hint message
// v
'bottom-left' |

// A hint message
//            v
'bottom-right';
```
