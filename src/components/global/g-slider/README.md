# components/global/g-slider

This module provides a block with [CSS scroll snap](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap) logic for slider

## Usage

You can use this component using simple block with specials modifiers

```
< .g-slider
  < img src = https://fakeimg.pl/155x300
  < img src = https://fakeimg.pl/130x300
  < img src = https://fakeimg.pl/130x300
```

1. g-slider component uses horizontal slider by default, but you can use vertical slider by adding modifier `.g-slider__vertical_true` for the slides-container `.g-slider`

```
< .g-slider.&__vertical_true
  < img src = https://fakeimg.pl/155x300
  < img src = https://fakeimg.pl/130x300
  < img src = https://fakeimg.pl/375x300
  ...
```

2. Also, if you need to explicitly set a horizontal slider then add special modifier `.g-slider__horizontal_true` for the slide's container `.g-slider`

```
< .g-slider.&__horizontal_true
  < img src = https://fakeimg.pl/375x300
  < img src = https://fakeimg.pl/375x300
  < img src = https://fakeimg.pl/35x300
```

3. For specifying the box's snap position as an alignment of its area ([scroll-snap-align](https://www.markdownguide.org/basic-syntax/#links)) you should use modifiers for child nodes of slide's container (or just slides):

   - `.g-slider__slide_snap_start`
   - `.g-slider__slide_snap_center`
   - `.g-slider__slide_snap_end`

```
< .g-slider.&__horizontal_true
  < img.&__slide_snap_start src = https://fakeimg.pl/375x300
  < img.&__slide_snap_center src = https://fakeimg.pl/375x300
  < img.&__slide_snap_start src = https://fakeimg.pl/35x300
```


