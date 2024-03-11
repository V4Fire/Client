# components/base/b-slider

This module provides a component to create a slider. Slider elements can be images, videos, text blocks, links.
Slides to show can be defined manually via slots or loaded from some data provider.

## Synopsis

* The component extends [[iData]].

* The component implements [[iObserveDOM]], [[iItems]] traits.

## Modifiers

| Name    | Description          | Values    | Default |
|---------|----------------------|-----------|---------|
| `swipe` | Is swipe in progress | `boolean` | –       |

## Events

| EventName     | Description                                                    | Payload description                                                                          | Payload                   |
|---------------|----------------------------------------------------------------|----------------------------------------------------------------------------------------------|---------------------------|
| `change`      | The active slide of the component has been changed             | Current slide index                                                                          | `number`                  |
| `swipeStart`  | The user started scrolling the slider                          | –                                                                                            | –                         |
| `swipeEnd`    | The user started scrolling the slider                          | The scrolling direction, An indicator showing whether the position of the slider has changed | `-1 \| 0 \| 1 \| boolean` |
| `updateState` | Content of the component block has been updated                | –                                                                                            | –                         |
| `syncState`   | The component state has been updated, sent after `updateState` | –                                                                                            | –                         |

## Usage

### Loading slides from a data provider

```
< b-slider &
  :mode = 'slide' |
  :dataProvider = 'fake.Json' |
  :item = 'b-fake-component' |
  :itemProps = (el) => ({data: el})
.
```

### Providing slides into the `default` slot

```
< b-slider &
  :mode = 'slide'
.
  < img.&__test v-for = img in imgArr
```

## Slots

The component supports a bunch of slots to provide.

1. `default` to provide the component items (slides).

   ```
   < b-slider
     < img src = https://fakeimg.pl/300x300
     < img src = https://fakeimg.pl/300x300
     < img src = https://fakeimg.pl/300x300
   ```

2. `beforeItems` to provide content before all items within the slider.

   ```
   < b-slider
     < template #beforeItems
       Hello there general Kenobi
   ```

3. `afterItems` to provide content after all items within the slider.

   ```
   < b-slider
     < template #afterItems
       Hello there general Kenobi
   ```

4. `before` to provide content before the slider.

   ```
   < b-slider
     < template #before
       Hello there general Kenobi
   ```

5. `after` to provide the content after the slider.

   ```
   < b-slider
     < template #after
       Hello there general Kenobi
   ```

### Placement of slots in the component DOM tree:

```
+= self.slot('before')

< .&__slider
 += self.slot('beforeItems')

 < .&__items &
   v-if = item || option |
   v-for = item in items
 .

 < template v-else
   += self.slot('default')

 += self.slot('afterItems)

+= self.slot('after')
```

## API

Additionally, you can view the implemented traits or the parent component.

### Props

#### [modeProp = 'slide']

A slider mode:

1. With the `slide` mode, it is impossible to skip slides.
   That is, we can't get from the first slide directly to the third or other stuff.

2. With the `scroll` mode, to scroll slides is used the browser native scrolling.

#### [dynamicHeight = `false`]

If true, the height calculation will be based on rendered elements.
The component will create an additional element to contain the rendered elements, while it will not be visible to the user.
This may be useful if you need to hide scroll on mobile devices, but you don't know the exact size of the elements
that can be rendered into a component.

#### [circular = `false`]

If true, a user will automatically return to the first slide when scrolling the last slide.
That is, the slider will work "in a circle".

#### [align = `'center'`]

This prop controls how much the slides will scroll.
For example, by specifying `center`, the slider will stop when the active slide is in the slider's center when scrolling.

#### [alignFirstToStart = `true`]

If true, the first slide will be aligned to the start position (the left bound).

#### [alignLastToEnd = `true`]

If true, the last slide will be aligned to the end position (the right bound).

#### [deltaX = `0.9`]

This prop controls how much does the shift along the X-axis corresponds to a finger movement.

#### [threshold = `0.3`]

The minimum required percentage to scroll the slider to another slide.

#### [fastSwipeThreshold = `0.05`]

The minimum required percentage for the scroll slider to another slide in fast motion on the slider.

#### [fastSwipeDelay = `300`]

Time (in milliseconds) after which we can assume that there was a quick swipe.

#### [swipeToleranceX = `10`]

The minimum displacement threshold along the X-axis at which the slider will be considered to be used (in px).

#### [swipeToleranceY = `50`]

The minimum Y-axis offset threshold at which the slider will be considered to be used (in px).

#### [autoSlideInterval = `0`]

The interval (in milliseconds) between auto slide moves.
If it is set to `0`, it means that there will be no auto slide moves.

#### [autoSlidePostGestureDelay = `0`]

The delay (in milliseconds) between the last user gesture and the first automatic slide movement.
It will be capped at the maximum value between `autoSlideInterval` and `autoSlidePostGestureDelay`,
and will be used as a timeout for the first automatic slide movement after a user gesture.

#### [useScrollSnap = `false`]

The flag enables CSS scroll snap mechanism. When set to `true` the [CSS scroll snap](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap) will be enabled.
The default value is `false`.

CSS Scroll Snap is a feature that allows for smooth scrolling by defining specific snap points.
Regular scrolling is the default behavior of unrestricted scrolling through content.

## Fields

#### current

Pointer to the current slide.

## Getters

#### length

The number of slides in the slider.

#### content

Link to a content node.

#### isSlideMode

True if a slider mode is `slide`.

#### currentOffset

The current slider scroll position.

### Methods

#### slideTo

Switches to the specified slide by an index.

```typescript
class Test extends iData {
  /** @override */
  protected $refs!: {
    slider: bSlider
  };

  test(): void {
    this.$refs.slider.slideTo(1).catch(stderr);
  }
}
```

#### moveSlide

Moves to the next or previous slide.

```typescript
class Test extends iData {
  /** @override */
  protected $refs!: {
    slider: bSlider
  };

  test(): void {
    this.$refs.slider.moveSlide(-1); // move to previous element
    this.$refs.slider.moveSlide(1);  // move to next element
  }
}
```
