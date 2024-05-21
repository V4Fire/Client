# components/super/i-static-page/modules/theme

This module provides an API for managing application themes.

## How to Use?

By default, any component that inherited from [[iStaticPage]] has the `theme` property.
To access this API from an arbitrary component, use it via the root component.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    console.log(this.r.theme.current);
  }
}
```

## Configuration

The module takes values for initialization from the global build config.

__config/default.js__

```js
const
  config = require('@v4fire/client/config/default');

module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
  __proto__: config,

  /**
   * Options to manage app themes
   */
  theme: {
    /**
     * Returns the default application theme name to use
     *
     * @cli t
     * @env THEME
     *
     * @param {string} [def] - default value
     * @returns {string}
     */
    default(def) {
      return o('theme', {
        short: 't',
        env: true,
        default: def
      });
    },

    /**
     * Returns an array of available themes to pass from the design system to the runtime,
     * or `true` to pass all themes from the design system
     *
     * @cli include-themes
     * @env INCLUDE_THEMES
     *
     * @param {string} [def] - default value
     * @returns {Array<string>|boolean}
     */
    include(def) {
      return o('include-themes', {
        env: true,
        default: def
      });
    },

    /**
     * Returns the attribute name to set the topic value to the root element
     *
     * @cli theme-attribute
     * @env THEME_ATTRIBUTE
     *
     * @default `data-theme`
     */
    attribute: o('theme-attribute', {
      env: true,
      default: 'data-theme'
    })
  }
});
```

## Events

| EventName      | Description                  | Payload description   | Payload                      |
|----------------|------------------------------|-----------------------|------------------------------|
| `theme:change` | Theme value has been changed | The new and old value | `string`; `CanUndef<string>` |

## Accessors

### availableThemes

A set of available app themes.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    console.log(this.r.theme.availableThemes);
  }
}
```

## Methods

### get

Current theme value.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    console.log(this.r.theme.get());
  }
}
```

### set

Sets a new value for the current theme.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  changeTheme(value: 'dark' | 'light') {
    this.r.theme.set(value);
  }
}
```

### useSystem

Sets the actual system theme and activates the system theme change listener.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.r.theme.useSystem();
  }
}
```
