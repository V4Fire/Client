# components/global/g-slider

This module provides a block with `scroll snap` CSS logic for slider

## Usage

You can use this component with invocation of getTpl function: `['i-block'].getTpl('g-slider/')()`

```
- include 'components/global/g-slider/g-slider.ss'|b

...

- block slides()
  < img src = https://fakeimg.pl/375x300
  < img src = https://fakeimg.pl/375x300
  < img src = https://fakeimg.pl/375x300
  < img src = https://fakeimg.pl/375x300
  < img src = https://fakeimg.pl/375x300

+= self.getTpl('g-slider/')()
  += self.slides()
```

## Scroll Snap API

| Property            | Description                                                                                                                                                     | Values                   | Default     |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------|-------------|
| `scroll-snap-type`  | Type of container scrolling. Property sets how strictly snap points are enforced on the scroll container in case there is one                                   | `mandatory`, `proximity` | `mandatory` |
| `scroll-padding`    | Padding between elements and container border. It has the same syntax as the padding property                                                                   | `number`                 | -           |
| `scroll-snap-align` | Specifies the box's snap position as an alignment of its snap area (as the alignment subject) within its snap container's snapport (as the alignment container) | `start`, `end`, `center` | `center`    |
| `scroll-snap-stop`  | Property defines whether or not the scroll container is allowed to "pass over" possible snap positions                                                          | `start`, `end`, `center` | `center`    |

