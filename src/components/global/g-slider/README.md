# components/global/g-slider

The module provides a Stylus mixin and a global class for creating sliders
based on the [CSS scroll snap](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap).

```
< .g-slider
  < img src = https://fakeimg.pl/155x300
  < img src = https://fakeimg.pl/130x300
  < img src = https://fakeimg.pl/130x300
```

## Synopsis

* This module provides a Stylus mixin and a global CSS class, not a component.

## Usage

You can use this block with special modifiers.

1. gSlider uses a horizontal slider by default, but you can switch to a vertical slider
   by adding the `vertical_true` modifier to the slide container.

   ```
   < [.g-slider].&_vertical_true
     < img src = https://fakeimg.pl/155x300
     < img src = https://fakeimg.pl/130x300
     < img src = https://fakeimg.pl/375x300
     ...
   ```

2. Also, if you need to explicitly set a horizontal slider,
   then add the special modifier `horizontal_true` to the slide container.

   ```
   < [.g-slider].&_horizontal_true
     < img src = https://fakeimg.pl/375x300
     < img src = https://fakeimg.pl/375x300
     < img src = https://fakeimg.pl/35x300
   ```

3. To specify the box's snap position as an alignment of
   its area ([scroll-snap-align](https://www.markdownguide.org/basic-syntax/#links)),
   you should use modifiers for the child nodes of the slide's container (or just slides):

   - `.g-slider__slide_snap_start`
   - `.g-slider__slide_snap_center`
   - `.g-slider__slide_snap_end`

   ```
   < [.g-slider].&_horizontal_true
     < img.&__slide_snap_start src = https://fakeimg.pl/375x300
     < img.&__slide_snap_center src = https://fakeimg.pl/375x300
     < img.&__slide_snap_start src = https://fakeimg.pl/35x300
   ```

### Using as a mixin

You can use this mixin "as is", just import it into your styles.

```stylus
@import "components/global/g-slider/g-slider.styl"

$p = {

}

b-example
  &__slider
    gSlider()
```
