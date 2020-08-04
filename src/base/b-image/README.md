# base/b-image

This module provides a component to load an image with support of features:

* Providing of "srcset" to load different images with different resolutions.

* An overlay image till loading is completed.

* An error image when the original image wasn't successfully loaded.

* Image modifiers: ratio, size type, position, etc.

* CSS image blending with extra images, like a gradient or similar stuff.

## Synopsis

* The component extends [[iBlock]].

* The component implements [[iProgress]], [[iVisible]] traits.

* The component is used as functional by default but can be used as regular by using `v-func=false`.

* By default, the root tag of the component is `<div>`.

* The component has `skeletonMarker`.

## Events

| EventName     | Description                            | Payload description | Payload  |
| ------------- |--------------------------------------- | ------------------- |--------- |
| `loadSuccess` | The image has been successfully loaded | -                   | -        |
| `loadFail`    | The image hasn't been loaded           | `Error` object      | `Error`  |

## Usage

```
< b-image &
  :src = require('assets/my-img.jpg') |
  :brokenImg = require('assets/broken.jpg') |
  :overlayImg = require('assets/overlay.jpg')
.
```

## Slots

The component supports a bunch of slots to provide:

1. `overlay` to provide an overlay image till loading is completed.

```
< b-image :src = require('assets/my-img.jpg')
  < template #overlay
    The image is loading...
```

2. `broken` to provide an error image when the original image wasn't successfully loaded.

```
< b-image :src = require('assets/my-img.jpg')
  < template #broken
    The image can't be loaded :(
```
