# global/g-hint

This module provides a mixin to create tooltips or hints.

## Usage

Just import the module into your component styles and register the mixin.

```stylus
@import "global/g-hint/g-hint.interface.styl"

$p = {

}

b-example
  g-hint({
    // Selector to a hint container
    location: "&"

    arrow: "&::before"

    content: "&::after"

    // Selector to show the hint, .b-example:hover
    showSelector: '&:hover',

    // From which attribute take a text to show
    hintData: 'data-hint'

    // Font-size of a text within the hint block
    fontSize: 12px

    // Color of a text within the hint block
    color: #FEFEFE

    // Background color of the hint block
    bgColor: #616161

    // Shadow of a hint block
    shadow: 0 0 0.2rem alpha(#111, 0.4)

    // Rounding of the hint block
    rounding: 15px
  })
```
