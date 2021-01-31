# base/b-slider

This module provides a component to render sliders.These can be images, videos, text blocks, links.
The component can operate in two modes, which will be discussed below.

## Synopsis

* The component extends [[iData]].

* The component implements [[iObserveDOM]], [[iItems]] traits.

## Modifiers

| Name         | Description            | Values    | Default |
| ------------ | ---------------------- | ----------| ------- |
| `swipe`      | Is swipe in progress   | `Boolean` | –       |

## Events

| EventName         | Description                                                    | Payload description                                                                   | Payload                 |
| ----------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------- |
| `change`          | An active slide of the component has been changed              | Number of the current slide                                                           | `number`                |
| `swipeStart`      | User started scrolling the slider                              | –                                                                                     | –                       |
| `swipeEnd`        | User finished scrolling the slider                             | Scrolling direction, Indicator showing whether the position of the slider has changed | `-1 | 0 | 1`, `boolean` |
| `updateState`     | The content of the component content block has been updated    | –                                                                                     | –                       |
| `syncState`       | The component state has been updated, sent after `updateState` | –                                                                                     | –                       |

## Usage

### Slide mode

In slider mode, it is impossible to skip slides. That is, it is impossible to get from the first slide directly to the third.
To activate this mode, set the `mode` parameter to `slide`.

```
< b-slider :mode = 'slide'
```

### Scroll mode

In scroll mode, the normal scroll will be used to scroll the slides. To activate this mode, set the `mode` parameter to `scroll`.

```
< b-slider :mode = 'scroll'
```

### With data provider

```
< .&__slider &
  :mode = 'slide' |
  :dataProvider = 'fake.Json' |
  :item = 'b-fake-component' |
  :itemProps = (el) => ({data: el})
.
```

## Slots

The component supports a bunch of slots to provide:

1. `default` to provide the base content of each item.

```
< b-slider
  < img src = https://fakeimg.pl/300x300
  < img src = https://fakeimg.pl/300x300
  < img src = https://fakeimg.pl/300x300
```

2. `beforeItems` To provide the content before the main content in the slider.

```
  < b-slider
    < template #beforeItems
      Hello there general Kenobi
```

3. `afterItems` To provide the content after the main content in the slider.

```
  < b-slider
    < template #afterItems
      Hello there general Kenobi
```

4. `before` To provide the content before the slider.

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
