# base/b-image

This module provides a component to load an image with the support of features:

* Providing of `srcset` to load different images with different resolutions.

* An overlay image until loading is completed.

* An error image when the original image wasn't successfully loaded.

* Image modifiers: ratio, size type, position, etc.

* CSS image blending with extra images, like a gradient or similar stuff.

## Synopsis

* The component extends [[iBlock]].

* The component implements [[iProgress]], [[iVisible]] traits.

* The component is used as functional by default but can be used as regular by using `v-func=false`.

* To show an image, the component uses CSS styles, like `background-image` or `background-position`.

* By default, the root tag of the component is `<div>`.

* The component has `skeletonMarker`.

## Modifiers

| Name        | Description                                                           | Values    | Default |
|-------------|-----------------------------------------------------------------------|-----------|---------|
| `showError` | The component is showing an image or template that indicates an error | `Boolean` | -       |

Also, you can see [[iProgress]] and [[iVisible]] traits and the [[iBlock]] component.

## Events

| EventName     | Description                            | Payload description | Payload |
|---------------|----------------------------------------|---------------------|---------|
| `loadSuccess` | The image has been successfully loaded | -                   | -       |
| `loadFail`    | The image hasn't been loaded           | `Error` object      | `Error` |

Also, you can see [[iProgress]] and [[iVisible]] traits and the [[iBlock]] component.

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

1. `overlay` to give an overlay image/template until loading is completed.

```
< b-image :src = require('assets/my-img.jpg')
  < template #overlay
    The image is loading...
```

2. `broken` to provide an error image/template when the original image wasn't successfully loaded.

```
< b-image :src = require('assets/my-img.jpg')
  < template #broken
    The image can't be loaded :(
```

## API

Also, you can see the implemented traits or the parent component.

### Props

#### [src = '']

The image src (a fallback if `srcset` provided).

#### [srcset]

The image `srcset` attribute.

#### [sizes]

An image `sizes` attribute.

#### [alt]

An alternate text for the image.

#### [sizeType = `'contain'`]

The image background size type.

#### [position = `'50% 50%'`]

The image background position.

#### [ratio]

The image aspect ratio.

#### [beforeImg]

A style (`backgroundImage`) before the image background.

#### [afterImg]

A style (`backgroundImage`) after the image background.

#### [overlayImg]

Parameters for an overlay image (when the image is loading).

#### [brokenImg]

Parameters for a broken image (when the image loading was failed).
