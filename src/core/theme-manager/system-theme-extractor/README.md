# core/theme-manager/system-theme-extractor

This module provides an API for obtaining and observing the preferred color scheme of an application.

## Usage

By default, engines for client-side browser or SSR are supported.
You must pass the engine to the themeManager constructor.

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
  // Implement all necessary methods of the interface here
}
```

The `SystemThemeExtractor` interface mandates that the getSystemTheme method must return a Promise object,
facilitating asynchronous determination of the system theme.
Should synchronous computation be required for your scenario, `SyncPromise` can be utilized.

See `core/theme-manger` for details.
