# components/global/g-icon

This module provides a mixin to generate default styles for SVG icons.

## Synopsis

* This module provides a global Styl mixin, not a component.

## Usage

You can use this mixin "as it is", import it to your styles.

```stylus
@import "components/global/g-icon/g-icon.styl"

$p = {

}

b-example
  &__icon
    gIcon()
```

Also, you can enable `globalIconHelpers` into your root component styles.

```stylus
@import "components/super/i-static-page/i-static-page.styl"

$p = {
  globalIconHelpers: true
}

p-root extends i-static-page
```

After this, you free to use the `g-icon` class with your icons.
