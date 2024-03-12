# core/theme-manager

This module provides an API for managing application themes.

## How to use?

By default, any component has the `remoteState` property, which represents an API for theme managing in `theme` field.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    // There is a possibilty that app has no themes and remote state doesn't provide theme API
    if (this.remoteState.theme == null) {
      return;
    }

    console.log(this.remoteState.theme.get());
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

| EventName      | Description                  | Payload description   | Payload                    |
|----------------|------------------------------|-----------------------|----------------------------|
| `theme:change` | Theme value has been changed | The new and old value | `Theme`; `CanUndef<Theme>` |

## Accessors

### availableThemes

A set of available app themes.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    console.log(this.remoteState.theme.availableThemes);
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
    console.log(this.remoteState.theme.get());
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
    this.remoteState.theme.set(value);
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
    this.remoteState.theme.useSystem();
  }
}
```
