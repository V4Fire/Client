# core/theme-manager

This module provides an API for managing the appearance themes of applications.

## How to use?

It is necessary to create an instance of the ThemeManager class and set it in the options:

1. where to store the user's theme (for example, in cookies);
2. the engine that will allow determining the user's default theme (for example,
   the user's OS has a dark theme enabled).

```typescript
import { from } from 'core/cookies';
import { CookieEngine } from 'core/kv-storage/engines/cookie';

import { ThemeManager, SystemThemeExtractorWeb } from 'core/theme-manager';

const themeManager = new ThemeManager({
  themeStorageEngine: new CookieEngine('v4ss', {cookies: from(document)}),
  systemThemeExtractor: new SystemThemeExtractorWeb()
});

console.log(themeManager.get());
console.log(themeManager.set('dark'));
```

### How to use it inside a component?

Explicit use of this class inside a component is discouraged,
as this scheme will not work with SSR, because each request could have its own theme.
Therefore, by default, the theme manager is instantiated in the global state of the application,
which is described in the `core/component/state` module.
To access it, you should use the `remoteState` property.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    // There is a possibilty that app has no themes and remote state doesn't provide theme API
    console.log(this.remoteState.theme?.get());
  }
}
```

### How to use it with SSR?

An instance of the theme manager needs to be explicitly instantiated when the application is created.

```typescript
import express from 'express';

import { initApp } from 'core/init';

import { from, createCookieStore } from 'core/cookies';
import { CookieEngine } from 'core/kv-storage/engines/cookie';

import { ThemeManager, SystemThemeExtractorSSR } from 'core/theme-manager';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const cookies = createCookieStore(req.headers.cookies);

  initApp('p-v4-components-demo', {
    location: new URL('https://example.com/user/12345'),

    cookies,

    theme: new ThemeManager({
      themeStorageEngine: new CookieEngine('app', {cookies}),
      systemThemeExtractor: new SystemThemeExtractorSSR(req.headers)
    })
  })

  .then(({content, styles}) => {
    res.send(`<style>${styles}</style>${content}`);
  });
});

app.listen(port, () => {
  console.log(`Start: http://localhost:${port}`);
});
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
