# core/theme-manager

This module provides an API for managing the appearance themes of applications.

## How To Use?

It is necessary to create an instance of the ThemeManager class and set in its settings:

1. Where to store the user's theme (for example, in cookies).
2. The engine that will allow determining the user's default theme (for example,
   if the user's OS has dark mode enabled).

```typescript
import { from } from 'core/cookies';
import { CookieEngine } from 'core/kv-storage/engines/cookie';

import ThemeManager, { SystemThemeExtractorWeb } from 'core/theme-manager';

const themeManager = new ThemeManager({
  themeStorageEngine: new CookieEngine('v4ss', {cookies: from(document)}),
  systemThemeExtractor: new SystemThemeExtractorWeb()
});

console.log(themeManager.get());
console.log(themeManager.set('dark'));
```

### How To Use It Inside A Component?

It is advisable to avoid directly using the ThemeManager class within a component,
as this approach is not compatible with Server-Side Rendering (SSR);
this is due to each request potentially having a unique theme.
Consequently, the ThemeManager is typically instantiated within the application's global state by default,
as outlined in the `core/component/state` module.
To interact with it, the `remoteState` property should be employed.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    console.log(this.remoteState.theme.get());
  }
}
```

### How To Use It With SSR?

An instance of the ThemeManager can be explicitly instantiated when the application is created.

```typescript
import express from 'express';

import { initApp } from 'core/init';

import { from, createCookieStore } from 'core/cookies';
import { CookieEngine } from 'core/kv-storage/engines/cookie';

import ThemeManager, { SystemThemeExtractorSSR } from 'core/theme-manager';

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
     * or returns true to pass all themes from the design system
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
     * The attribute name used to assign the theme value to the root element
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
| `theme.change` | Theme value has been changed | The new and old value | `Theme`; `CanUndef<Theme>` |

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

Returns the current theme value.

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
