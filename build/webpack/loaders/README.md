# build/webpack/loaders

This module provides a bunch of custom loaders for Webpack.

### symbol-generator-loader

The loader adds support for module `core/symbol` in old browsers

### responsive-images-loader

The loader is used to compress and convert responsive images.
It uses the [responsiveLoader](https://github.com/dazuaz/responsive-loader/tree/master) under the hood for each conversion call.

The basic usage in the template would be:

```ss
< .my-image v-image = { &
  ...require('path/to/image.png?responsive'),
  baseSrc: 'your/src'
} .
```

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

Note that the loader will be applied only in the production mode.
In the development mode the loader will return only the name of the image without applying compression and conversion:

```js
{
  src: 'image.png'
}
```
