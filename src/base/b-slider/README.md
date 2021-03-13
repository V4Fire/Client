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

With the slider mode, it is impossible to skip slides. That is, we can't get from the first slide directly to the third or other stuff.
To activate this mode, set the `mode` prop to `slide`.

```
< b-slider :mode = 'slide'
```

### Scroll mode

With the scroll mode, to scroll slides is used the browser native scrolling.
To activate this mode, set the `mode` prop to `scroll`.

```
< b-slider :mode = 'scroll'
```

### Usage

1. Loading slides from a data provider.

```
< b-slider &
  :mode = 'slide' |
  :dataProvider = 'fake.Json' |
  :item = 'b-fake-component' |
  :itemProps = (el) => ({data: el})
.
```

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
