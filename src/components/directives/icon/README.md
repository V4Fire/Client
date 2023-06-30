# components/directives/icon

This module provides a directive for loading and displaying SVG images.
SVGs are loaded using [svg-sprite-loader](https://github.com/JetBrains/svg-sprite-loader) and form a sprite.
Essentially, the element to which the directive is applied is transformed into a `<svg><use href="..." /></svg>`
tag structure.
This directive is useful for loading different SVG icons.
By default, all images are loaded asynchronously on demand.

## Usage

```
/// Loading an image by its name (without providing the file extension or directory name)
< . v-icon:logo

/// Loading an image by its name taken from a component's property
< . v-icon:[iconName]

/// Loading an image by name taken from a component's property or expression
< . v-icon = open ? 'open' : 'close'
```

## Where is the destination of the sprite folder?

All icons loaded in this way should be located in a special folder.
You can specify the location of this folder by adding the `assets.sprite` option to your `.pzlrrc` file.

For example, if you configure your `.pzlrrc` file like this.

```json
{
  "assets": {
    "dir": "assets",
    "sprite": "svg"
  }
}
```

The `icon` directive will load any SVG by its name located in the `assets/svg` folder.

## How to inherit sprites from parent layers?

By default, the `assets.sprite` folders in the parent layers of your project are also inherited.
You can override this behavior explicitly using your project's global configuration.

**config/default.js**

```
monic() {
  return this.extend(super.monic(), {
    typescript: {
      flags: {
        // Inherit sprites only from `@v4fire/client`
        sprite: ['@v4fire/client']
      }
    }
  });
}
```
