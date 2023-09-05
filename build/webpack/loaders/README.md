# build/webpack/loaders

This module provides a bunch of custom loaders for Webpack.

### symbol-generator-loader

The loader adds support for the module `core/symbol` in older browsers

### responsive-images-loader

The loader is used to compress and convert responsive images.
It utilizes the [responsiveLoader](https://github.com/dazuaz/responsive-loader/tree/master) library underneath for each conversion operation.

To use this loader in a template, the basic syntax is:

```ss
< .my-image v-image = require('path/to/image.png?responsive')
```

Please note that the image you want to apply the loader to should be 3x resolution of its original size

The loader returns the following structure:

```js
{
  // 4e3edf6d108c0701 - hash
  // 346 - 2x size of the original image
  // png - format of the original image
  src: '4e3edf6d108c0701-346.png',
  sources: [
    {
      type: 'png',
      srcset: {
        '1x': 'f6506a0261a44c16-173.png'
        '2x': '4e3edf6d108c0701-346.png'
        '3x': '19b08609ec6e1165-521.png'
      }
    },
    {
      type: 'webp',
      srcset: {
        '1x': '4e62cb10bc2b3029-173.webp'
        '2x': 'f49d341fedd8bdc5-346.webp'
        '3x': '4ca48b9469e44566-521.webp'
      }
    },
    {
      type: 'avif',
      srcset: {
        '1x': '71842fd826667798-173.avif'
        '2x': '8da0057becea6b31-346.avif'
        '3x': 'b6d75fb5bdf3121b-521.avif'
      }
    }
  ]
}
```

Please note that this loader is only applied in production mode.
In development mode, the loader will simply return the name of the image without any compression or conversion:

```js
require('path/to/image.png?responsive'); // {src: 'image.png'}
```
