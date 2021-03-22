# base/b-slider

This module provides a component to create a slider. These can be images, videos, text blocks, links.
Slides to show can be defined manually via slots or loaded from some data provider.

## Synopsis

* The component extends [[iData]].

* The component implements [[iObserveDOM]], [[iItems]] traits.

## Modifiers

| Name         | Description            | Values    | Default |
| ------------ | ---------------------- | ----------| ------- |
| `swipe`      | Is swipe in progress   | `Boolean` | –       |

## Events

| EventName         | Description                                                    | Payload description                                                                          | Payload                 |
| ----------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------- |
| `change`          | The active slide of the component has been changed             | An index of the current slide                                                                | `number`                |
| `swipeStart`      | A user has started scrolling the slider                        | –                                                                                            | –                       |
| `swipeEnd`        | A user has finished scrolling the slider                       | The scrolling direction, An indicator showing whether the position of the slider has changed | `-1 | 0 | 1`, `Boolean` |
| `updateState`     | Content of the component content block has been updated        | –                                                                                            | –                       |
| `syncState`       | The component state has been updated, sent after `updateState` | –                                                                                            | –                       |

## Render modes

The component can operate in two modes, which will discuss below.

### Slide mode

With the `slide` mode, it is impossible to skip slides. That is, we can't get from the first slide directly to the third or other stuff.
To activate this mode, set the `mode` prop to `slide`.

```
< b-slider :mode = 'slide'
```

### Scroll mode

With the `scroll` mode, to scroll slides is used the browser native scrolling.
To activate this mode, set the `mode` prop to `scroll`.

```
< b-slider :mode = 'scroll'
```

## Usage

1. Loading slides from a data provider.

```
< b-slider &
  :mode = 'slide' |
  :dataProvider = 'fake.Json' |
  :item = 'b-fake-component' |
  :itemProps = (el) => ({data: el})
.
```

2. Provide data into `default` slot

```
< b-slider &
  :mode = 'slide'
.
  < img.&__test v-for = img in imgArr
```

## API

### Props

* `dynamicHeight` – If this prop is set to `true`, the height calculation will be based on rendered elements.
  The component will create an additional element to contain the rendered elements, while it will not be visible to the user.
  This may be useful if you need to hide scroll on mobile devices, but you don't know the exact size of the elements
  that can be rendered into a component. By default, this prop is set to `false`.

* `circular` – If this prop is set to `true`, the user will automatically return to the first slide when scrolling the last slide.
  That is, the slider will work "in a circle".

* `align` – This prop controls how much the slides will scroll.
  For example, by specifying the value `center`, the slider will stop when the active slide is in the center of the slider when scrolling.

### Methods

- `slideTo(index: number, animate: boolean)` – Scrolls the slider to the element that matches the provided index.

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

- `moveSlide(dir: SlideDirection)` – Scrolls the slider to the next or previous element.

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

### Fields

- `isSlideMode` – `true` if the component is rendered by using the `slide` mode.

## Slots

The component supports a bunch of slots to provide:

1. `default` to provide the base content.

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

5. `after` To provide the content after the slider.

```
< b-slider
  < template #after
    Hello there general Kenobi
```

The layout of slots within the component DOM tree:

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
