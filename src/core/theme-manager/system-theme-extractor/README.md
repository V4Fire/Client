# core/theme-manager/system-theme-extractor

This module provides an API for obtaining and observing the preferred color scheme of an application.

## Usage

By default, the engine for the web is supported.

The engine needs to be passed to the `themeManager` constructor.

```ts
import themeManagerFactory, { SystemThemeExtractorWeb } from 'core/theme-manager';

// ...
initApp(rootComponentName, {
  // ...
  theme: themeManagerFactory({
    // ...
    systemThemeExtractor: new SystemThemeExtractorWeb()
  })
  // ...
});

```

Also, you can implement your own engine.

```ts
// src/core/theme-manger/system-theme-extractor/engines/custom/engine.ts
import type { SystemThemeExtractor } from 'core/theme-manager/system-theme-extractor';

export default class CustomEngine implements SystemThemeExtractor {
  // Implement all necessary methods of the interface here.
}
```

The `SystemThemeExtractor` interface specifies that the `getSystemTheme` method should return a Promise object,
allowing for asynchronous computation of the system theme.
If synchronous computation is necessary for your case, you can use `SyncPromise`.

See `core/theme-manger` for details.
