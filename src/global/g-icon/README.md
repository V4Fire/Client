# global/g-icon

This module provides a mixin to generate default styles for SVG icons.

## Usage

You can use this mixin "as it is", just import it to your styles.

```stylus
@import "global/g-icon/g-icon.styl"

$p = {

}

b-example
  &__icon
    gIcon()
```

Also, you can enable `globalIconHelpers` into your root component styles.

```stylus
@import "super/i-static-page/i-static-page.styl"

$p = {
  globalIconHelpers: true
}

p-root extends i-static-page
```

After this, you free to use the `g-icon` class with your icons.
