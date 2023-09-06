# build/webpack/loaders

This module provides a bunch of custom loaders for Webpack.

### symbol-generator-loader

#### Description

The loader adds support for the module `core/symbol` in older browsers

### responsive-images-loader

#### Description

The loader is used to compress and convert responsive images.
It utilizes the [responsiveLoader](https://github.com/dazuaz/responsive-loader/tree/master) library underneath for each conversion operation.

#### Usage

To use this loader in a template, the basic syntax is:

```ss
< .my-image v-image = require('path/to/image.png?responsive')
```

Please note that the image you want to apply the loader to should be the maximum resolution

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

#### Options

In addition to the [options](https://github.com/dazuaz/responsive-loader/tree/master#options) provided by the
`responsive-loader`, this loader also offers a few additional ones.

Please note that you can only specify the options using JSON5 notation:

```
require('image.png?{responsive:true,key1:value1,key2:value2}');
```

The `responsive` field in the above example is the `resourceQuery` of the loader.
This parameter is required and should always be set to `true` if you want to process your image using this loader.

The additional options are the following:

##### defaultSrcPath ['2x.[original image extension]']

The path for the default image in the `src` field.
The format should be in the following pattern: `[resolution].[extension]`.

Example of usage:

```ts
require('path/to/image.png?{reponsive:true,defaultSrcPath:"1x.jpg"}');

/*
{
  src: '[hash]-[width].jpg' // Here will be the hashed image scaled by 1x of its original size
}
*/
```

##### formats ['webp', 'avif']

The formats to convert your image to.

#### sizes [1, 2, 3]

Although this option is specified in the `responsive-loader` options, it works differently with this loader.
The numbers you provide indicate the scaling that should be applied to the image (1x, 2x, etc.), not the size in pixels
