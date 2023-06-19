# core/component/directives/image

This module provides a directive to load and display images using `img` and/or `picture` tags.

## Why is this directive needed?

A common case when working with images is showing a special stub when loading or in case of an error.
Unfortunately, there are no native API to implement this feature. This directive does just that - it provides a convenient
API to set such stubs. Moreover, it works universally, both for `img` and `picture` tags. Which tag will be used to render
the image depends on the passed properties. Passing `sources` will enable using the `picture` tag, otherwise `img`.

## How to include this directive?

Just add the directive import in your component code.

```js
import 'components/directives/image';

import iBlock, { component } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {}
```

## How does the directive work?

The directive inserts `img` and/or `picture` elements inside the container to which it is applied.
The container type itself then becomes the usual `span`. The container is also given background images with stubs depending
on the state. You can apply any available CSS styles for more customization. For example, `object-fit` or `aspect-ratio`.

```
< .my-image v-image = { &
  src: '/my-image.jpeg',
  preview: '/preview.jpeg'
} .
```

Will render as

```html
<span class="my-image" style="display: inline-block; background-image: url(/preview.jpeg)" data-image="preview">
  <img src="/my-image.jpeg" data-img="..." />
</span>
```

## Usage

### Creating an image via `img src` with stubs

```
< .my-image v-image = { &
  src: '/my-image.jpeg',
  preview: '/preview.jpeg',
  broken: '/broken.jpeg'
} .
```

### Creating an image via `img srcset` with the detailed stub settings

```
< .my-image v-image = { &
  srcet: {
    '1x': '/my-image-1x.jpeg',
    '2x': '/my-image-2x.jpeg',
  },

  preview: {
    '1x': '/my-image-preview-1x.jpeg',
    '2x': '/my-image-preview-2x.jpeg',
  },

  broken: '/broken.jpeg'
} .
```

### Creating an image via `picture srcset`

```
< .my-image v-image = { &
  sources: [
    {srcset: 'my-image.avif'},
    {srcset: 'my-image.webp'},
    {srcset: 'my-image.jpeg'}
  ]
} .
```

## Special attributes

A container to which the directive is applied sets the special `data-image` attribute.
The attribute value can be one of three: `preview`, `loaded` and `broken`, depending on the current state of the image.
Also, the `img` tag itself, which is added inside a container to which the directive is applied, has the special `data-img` attribute.
These attributes are useful for setting CSS styles.

## Directive options

### [src]

The image URL. On browsers supporting `srcset`, `src` is treated like a candidate image with a pixel density descriptor 1x,
unless an image with this pixel density descriptor is already defined in `srcset`, or unless `srcset` contains `w` descriptors.

### [baseSrc]

The base image URL. If given, it will be used as a prefix for all values in the `src` and `srcset` parameters.

```
< .my-image v-image = { &
  baseSrc: 'https://static.mysite.com',
  src: 'my-image.jpeg'

  srcet: {
    '1x': '/my-image-1x.jpeg',
    '2x': '/my-image-2x.jpeg',
  }
} .
```

### [srcset]

A value of the `srcset` image attribute. This option helps to create responsive images.
See [this](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-srcset) and [this](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
for more information.

### [width]

The image width. If the option is given as a number, then it is treated as pixels.

### [height]

The image width. If the option is given as a number, then it is treated as pixels.

### [sizes]

A value of the `sizes` image attribute.
See [this](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-sizes) and [this](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
for more information.

### [sources]

A list of attributes for `source` elements.
If this option is given, then `picture` will be used to load the image, not `img`.

See [this](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture) and [this](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source)
for more information.

The attributes object has the following interface.

```typescript
interface ImageSource {
  /**
   * A value of the `srcset` source attribute.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-srcset
   *
   * This option helps to create responsive images.
   * @see https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
   */
  srcset?: Dictionary<string> | string;

  /**
   * The MIME media type of the image
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source#attr-type
   */
  type?: string;

  /**
   * The image media query
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source#attr-media
   */
  media?: string;

  /**
   * The source width.
   * If the option is given as a number, then it is treated as pixels.
   */
  width?: string | number;

  /**
   * The source height.
   * If the option is given as a number, then it is treated as pixels.
   */
  height?: string | number;

  /**
   * A value of the `sizes` source attribute.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source#attr-sizes
   *
   * This option helps to create responsive images.
   * @see https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
   */
  sizes?: string;
}
```

### [alt]

A text description of the image, which isn't mandatory but is incredibly useful for accessibility - screen readers
read this description out to their users, so they know what the image means.

### [lazy = `true`]

If false, then the image will start loading immediately, but not when it appears in the viewport.

### [preview]

An image URL to use as a placeholder while the main one is loading. The option can also accept an object with additional image settings.

```
< .my-image v-image = { &
  srcet: {
    '1x': '/my-image-1x.jpeg',
    '2x': '/my-image-2x.jpeg',
  },

  preview: {
    '1x': '/my-image-preview-1x.jpeg',
    '2x': '/my-image-preview-2x.jpeg',
  },

  broken: '/broken.jpeg'
} .
```

### [broken]

An image URL to use as a placeholder if the main one cannot be loaded due to an error. The option can also accept an
object with additional image settings.

```
< .my-image v-image = { &
  srcet: {
    '1x': '/my-image-1x.jpeg',
    '2x': '/my-image-2x.jpeg',
  },

  preview: {
    '1x': '/my-image-preview-1x.jpeg',
    '2x': '/my-image-preview-2x.jpeg',
  },

  broken: {
    '1x': '/broken-1x.jpeg',
    '2x': '/broken-2x.jpeg',
  }
} .
```

### [onLoad]

A handler to be called when the image is successfully loaded.

```
< .my-image v-image = { &
  src: '/my-image.jpeg',
  preview: '/preview.jpeg',
  broken: '/broken.jpeg',
  onLoad: console.log
} .
```

### [onError]

A handler to be called in case of an error while loading the image.

```
< .my-image v-image = { &
  src: '/my-image.jpeg',
  preview: '/preview.jpeg',
  broken: '/broken.jpeg',
  onError: console.error
} .
```

### [optionsResolver]

A function to resolve the passed image options.
The options returned by this function will be used to load the image.

```
< .my-image v-image = { &
  src: '/my-image.jpeg',
  preview: '/preview.jpeg',
  broken: '/broken.jpeg',
  optionsResolver: (opts) => ({...opts, src: opts.src + '?size=42'})
} .
```

## Global configuration

Some directive settings can be set globally using the `src/config` module.
For example, you can set options for placeholder images, instead of setting them each time the directive is called.
Of course, if the directive accepts certain parameters that conflict with the global ones,
then the conflict will be resolved in favor of the parameters that were set when the directive was called.

__src/config__

```js
import { extend } from '@v4fire/core/config';

export { default } from '@v4fire/core/config';

extend({
  image: {
    lazy: false,
    baseSrc: 'https://static.mysite.com',
    preview: '/preview.jpeg',
    broken: '/broken.jpeg',
  }
});
```
