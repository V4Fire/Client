# components/directives/icon

This module provides a directive to load and display SVG icons by their name from a sprite.
By default, all icons are loaded asynchronously on demand.

```
< . v-icon:logo

/// Loading an icon by dynamic name from a variable
< . v-icon:[iconName]

/// Loading an icon by dynamic name from a variable
< . v-icon = iconName
```

## Where is the destination of the sprite folder?

The sprite folder is contained within the default asset folder.
To specify the folder name, you should use the `.pzlrrc` config.

```json
{
  "assets": {
    "dir": "assets",
    "sprite": "svg"
  }
}
```

## How to inherit sprites from parent layers?

By default, all sprites from the parent layers are inherited.
You can change this behavior via the global config.

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
