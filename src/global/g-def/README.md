# global/g-def

This module provides default global styles and function to use within `styl` files.
You free to override and modify these files.

## Synopsis

* This module provides global styles and Styl mixins, not a component.

## Contents

* `g-def.styl` - global registered classes and rules:
  * `const.styl` - global system constants
  * `funcs.styl` - initialization of helper functions and mixins, like, `nib`, `pzlr`, etc.
  * `reset.styl` - global classes and mixins to reset default styles
  * `animations.styl` - global classes for animation

* `/funcs` - folder with helper functions and mixins
  * `ds.styl` - helpers to work with a Design System
  * `img.styl` - helpers to load and work with images
  * `font.styl` - helpers to load and work with fonts
  * `mixins.styl` - bunch of helpers to generate CSS rules
  * `helpers.styl` - bunch of internal helpers

## Global constants

```stylus
/**
 * Default transition duration
 */
EASING_DURATION = 0.22s

/**
 * Blueprint to interpolate the base system font
 */
BASE_FONT_PATTERN = '"Open Sans%t", Arial, sans-serif'

/**
 * Base system font
 */
BASE_FONT = getGlobalFont()
```
