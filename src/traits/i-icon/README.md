# traits/i-icon

This module provides a trait to load SVG sprites.
Each icon is loaded asynchronously.

## Synopsis

* This module provides an abstract class, not a component.

* The trait contains only TS logic.

## Usage

The implemented trait API should be used with the `v-update-on-directive`.

```
< use v-update-on = { &
  emitter: getIconLink(myIcon),
  handler: updateIconHref,
  errorHandler: handleIconError
} .
```

Or you can use the global helper:

```
/// Simple loading
+= self.gIcon('myIcon')

/// Providing of extra classes and attributes
+= self.gIcon('myIcon', {iconEl: {mod: 'modVal'}}, {'data-attr': 1})

/// Dynamic loading from a value
+= self.gIcon([myIcon])
```

### Where is the destination of the sprite folder?

The sprite folder is contained within the default asset folder.
To specify the folder name, you should use the `.pzlrrc` config.

```
{
  ...
  "assets": {
    "dir": "assets",
    "sprite": "svg"
  }
}
```

### How to inherit sprites from parent layers?

By default, all sprites from the parent folders are inherited.
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

## Methods

The trait specifies a bunch of methods to load sprites asynchronously.

### getIconLink

The method takes the name of an icon to load and returns a promise with the value for the `href` attribute of the `<use>` tag.
The method has the default implementation.

```typescript
import iIcon from 'traits/i-icon/i-icon';

export default class bIcon implements iIcon {
  /** @see [[iIcon.getIconLink]] */
  getIconLink(iconId: Nullable<string>): Promise<CanUndef<string>> {
    return iIcon.getIconLink(iconId);
  }
}
```

### updateIconHref

The method applies the loaded icon to a DOM node.
The method has the default implementation.

```typescript
import iIcon from 'traits/i-icon/i-icon';

export default class bIcon implements iIcon {
  /** @see [[iIcon.updateIconHref]] */
  updateIconHref(el: SVGUseElement, href?: string): void {
    iIcon.updateIconHref(this, el, href);
  }
}
```

### handleIconError

The method handles errors that occur during the loading.
The method has the default implementation.

```typescript
import iIcon from 'traits/i-icon/i-icon';

export default class bIcon implements iIcon {
  /** @see [[iIcon.handleIconError]] */
  handleIconError(el: SVGUseElement, err: Error): void {
    iIcon.handleIconError(this, el, err);
  }
}
```
