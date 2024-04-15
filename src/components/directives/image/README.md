# core/component/directives/image

This module provides a directive for loading and displaying images using `img` and/or `picture` tags.
The directive cannot be applied to `img`, `picture`, or `object` tags.

```
< .my-image v-image = { &
  src: '/my-image.jpeg',
  preview: '/preview.jpeg',
  broken: '/broken.jpeg'
} .
```

## Why is This Directive Needed?

When working with images, it is common to display a placeholder or an error message during the loading process.
However, there is no native API to implement this feature.
This directive solves that problem by providing a convenient API to set these placeholders.
Additionally, it works universally for both img and picture tags.
The choice between using img or picture tags for rendering the image depends on the properties passed.
When sources are provided, the picture tag is used; otherwise, the img tag is used.

## How to include this directive?

Just add the directive import in your component code.

```js
import 'components/directives/image';

import iBlock, { component } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {}
```

## How does the directive work?

The directive places `img` and/or `picture` elements within the container it's applied to,
transforming the container type into a typical `span`.
The container also receives background images with placeholders, which vary according to states.
You have the flexibility to add any applicable CSS styles for further customization,
such as `object-fit` or `aspect-ratio`.

```
< .my-image v-image = { &
  src: '/my-image.jpeg',
  preview: '/preview.jpeg'
} .
```

Will render as

```html
<span class="my-image" style="display: inline-block; background-image: url(/preview.jpeg);" data-image="preview">
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

The container to which the directive is applied receives a special `data-image` attribute.
The value of this attribute can be one of three options: `preview`, ``loaded`, or brok`en,
changing in accordance with the current state of the image.
Additionally, the `img` tag, inserted within the applied container, also incorporates a `data-img` attribute.
Both of these attributes are highly beneficial in customizing CSS styles.

## Directive options

### [src]

The image URL.
On browsers supporting `srcset`, `src` is treated like a candidate image with a pixel density descriptor 1x,
unless an image with this pixel density descriptor is already defined in `srcset`,
or unless `srcset` contains `w` descriptors.

### [baseSrc]

The base image URL.
If given, it will be used as a prefix for all values in the `src` and `srcset` parameters.

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

Value of the `srcset` image attribute.
This option helps to create responsive images.
See [this](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-srcset) and [this](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
for more information.

### [width]

The image width.
If the option is given as a number, then it is treated as pixels.

### [height]

The image height.
If the option is given as a number, then it is treated as pixels.

### [sizes]

Value of the `sizes` image attribute.
See [this](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-sizes) and [this](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
for more information.

### [sources]

A list of attributes for `source` elements.
If this option is given, then `picture` will be used to load the image, not `img`.

See [this](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture) and [this](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source)
for more information.

The attribute's object has the following interface.

```typescript
interface ImageSource {
  /**
   * Value of the `srcset` source attribute.
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
   * Value of the `sizes` source attribute.
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

An image URL to use as a placeholder while the main one is loading.
The option can also accept an object with additional image settings.

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

An image URL to use as a placeholder if the main one cannot be loaded due to an error.
The option can also accept an object with additional image settings.

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

### [draggable]

This option indicates whether the image can be dragged,
either with native browser behavior or the HTML Drag and Drop API.

### [isMap]

A boolean value which indicates that the image is to be used by a server-side image map.
This may only be used on images located within an `<a>` element.

### [useMap]

The partial URL (starting with `#`) of an image map associated with the element.
See [this](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#usemap) for more information.

### [referrerPolicy]

A string indicating which referrer to use when fetching the resource.
See [this](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#referrerpolicy) for more information.

### [crossOrigin]

This option indicates if the fetching of the image must be done using a CORS request.
Image data from a CORS-enabled image returned from a CORS request can be reused in the `<canvas>` element
without being marked `tainted`.

Allowed values are:
- `anonymous` - a CORS request is sent with credentials omitted;
- `use-credentials` - the CORS request is sent with any credentials included.

See [this](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#crossorigin) for more information.

### [decoding]

This option indicates whether the browser should decode images synchronously with other DOM content
for a more accurate presentation, or asynchronously to render other content first and display the image later.

Allowed values are:
- `sync` - decode the image synchronously along with rendering
  the other DOM content, and present everything together;
- `async` - decode the image asynchronously, after rendering and
  presenting the other DOM content;
- `auto` - no preference for the decoding mode (the browser decides what is best for the user).

See [this](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#decoding) for more information.

### [elementTiming]

This option indicates that an element is flagged for tracking by PerformanceObserver objects using the "element" type.
See [this](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/elementtiming) for more information.

### [fetchPriority]

A hint of the relative priority to use when fetching the image.

Allowed values are:
- `high` - fetch the image at a high priority relative to other images;
- `low` - fetch the image at a low priority relative to other images;
- `auto` - default mode, which indicates no preference for the fetch priority
  (the browser decides what is best for the user).

## Global configuration

You can set some of the directive's parameters globally using the `src/config` module.
For example, you can establish placeholder image parameters once instead of setting them every time
the directive is called.
Naturally, if the directive takes specific parameters that conflict with the global ones,
the conflict will be resolved in favor of the parameters set during the directive's invocation.

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
