# build/webpack/loaders/responsive-images-loader

The loader is used to compress and convert responsive images.
It utilizes the [responsiveLoader](https://github.com/dazuaz/responsive-loader/tree/master)
library underneath for each conversion operation.

### Usage

By default, this loader is configured to be used with the `responsive` query parameter.
This means that you just need to require the desired image and specify this parameter.

```ss
< .my-image v-image = require('path/to/image.png?responsive')
```

Please note that the image you want to apply the loader to should be in the highest quality.

The loader returns the following structure:

```js
({
  // 4e3edf6d108c0701 - the image hash
  // 346 - 2x size of the original image
  // png - the format of the original image
  src: '4e3edf6d108c0701-346.png',
  sources: [
    {
      type: 'png',
      srcset: {
        '1x': 'f6506a0261a44c16-173.png',
        '2x': '4e3edf6d108c0701-346.png',
        '3x': '19b08609ec6e1165-521.png'
      }
    },
    {
      type: 'webp',
      srcset: {
        '1x': '4e62cb10bc2b3029-173.webp',
        '2x': 'f49d341fedd8bdc5-346.webp',
        '3x': '4ca48b9469e44566-521.webp'
      }
    },
    {
      type: 'avif',
      srcset: {
        '1x': '71842fd826667798-173.avif',
        '2x': '8da0057becea6b31-346.avif',
        '3x': 'b6d75fb5bdf3121b-521.avif'
      }
    }
  ]
})
```

Please note that this loader is only applied in production mode.
In development mode, the image will be processed using `url-loader`, which will either return the inline image or the path to the image:

```js
require('path/to/small-image.png?responsive'); // {src: 'data:image/png;base64,.....'}
require('path/to/huge-image.png?responsive'); // {src: 'path/to/image.png'}
```

### Options

In addition to the [options](https://github.com/dazuaz/responsive-loader/tree/master#options) provided by the
`responsive-loader`, this loader also offers a few additional ones.

Please note that the options can be specified using only JSON5 notation for a specific image.
For example:

```js
require('image.png?{responsive:true,key1:value1,key2:value2}');
```

The `responsive` field in the above example is the `resourceQuery` of the loader.
This parameter is required and should always be set to `true`
if you want to process your image using this loader.

Alternatively, you can also override the `responsiveImagesOpts` method that specifies
the base options for every image in `config/default`.

The additional options are the following:

#### defaultSrcPath ['2x.[original image extension]']

The path for the default image in the `src` field.
The format should be in the following pattern: `[resolution].[extension]`.

Example of usage:

```js
require('path/to/image.png?{responsive:true,defaultSrcPath:"1x.jpg"}');

/*
{
  src: '[hash]-[width].jpg' // Here will be the hashed image scaled by 1x of its original size
}
*/
```

#### formats ['webp', 'avif']

The formats to convert your image to.

#### sizes [1, 2, 3]

Although this option is specified in the `responsive-loader` options,
it works differently with this loader.
The numbers you provide indicate the scaling that should be applied to
the image (1x, 2x, etc.), not the size in pixels.

#### baseSrc [undefined]

If this option is passed, it will be returned in the resulting object only in production.
It's useful if you have your assets on a static server and you want to specify the base path to the image on it:

```js
require('path/to/image.png?{responsive:true,baseSrc:"path/on/static/server"}')

/*
{
  src: '...',
  sources: [...],
  baseSrc: 'path/on/static/server'
}
*/
```

This option is useless if you don't pass the object to the `v-image` directive:

```ss
< . v-image = require('path/to/image.png?{responsive:true,baseSrc:"path/on/static/server"}')
```

### Providing multiple custom options

Here is an example of providing multiple options for a specific image:

```js
require('path/to/image.png?{responsive:true,formats:["webp"],sizes:[1,2,3,4],defaultSrcPath:"3x.png"}');

/*
{
  src: '41225eda88e198f9-390.png',
  sources: [
    {
      type: 'png',
      srcset: {
        '1x': '00013521e68e82ad-130.png',
        '2x': '1275606184e9d451-260.png',
        '3x': '41225eda88e198f9-390.png',
        '4x': '19b08609ec6e1165-521.png'
      }
    },
    {
      type: 'webp',
      srcset: {
        '1x': '7bc796c1451c0938-130.webp',
        '2x': '65885d25dc384e15-260.webp',
        '3x': '1b814b2471ed305d-390.webp',
        '4x': '4ca48b9469e44566-521.webp'
      }
    }
  ]
}
*/
```
