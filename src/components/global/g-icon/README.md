# components/global/g-icon

This module provides a Stylus mixin with default styles for SVG icons.
As a rule, it is used together with the `v-icon` directive.

```
< .g-icon v-icon:logo
```

## Synopsis

* This module provides a global Stylus mixin, not a component.

## Usage

You can use this mixin "as is", just import it into your styles.

```stylus
@import "components/global/g-icon/g-icon.styl"

$p = {

}

b-example
  &__icon
    gIcon()
```

Also, you can enable `globalIconHelpers` in the styles of the root component.

```stylus
@import "components/super/i-static-page/i-static-page.styl"

$p = {
  globalIconHelpers: true
}

p-root extends i-static-page
```

After that, you are free to use the `g-icon` class with your own icons.
