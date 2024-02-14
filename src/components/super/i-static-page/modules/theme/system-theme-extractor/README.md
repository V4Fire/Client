# components/super/i-static-page/modules/theme/system-theme-extractor

This module provides an API for obtaining and observing the preferred color scheme of an application.

## Usage

By default, the engine for the web is supported.

The engine needs to be passed to the `themeManager` constructor.

```ts
import { SystemThemeExtractorWeb } from 'components/super/i-static-page/modules/theme';

class iRoot extends iStaticPage {
  @system<iStaticPage>((o) => themeManagerFactory(
    // ...other required parameters for themeManager
    new SystemThemeExtractorWeb(o)
  ))

  readonly theme: CanUndef<ThemeManager>;
}
```

Also, you can implement your own engine.

```ts
// src/components/super/i-static-page/modules/theme/system-theme-extractor/engines/custom/index.ts
import type { SystemThemeExtractor } from 'components/super/i-static-page/modules/theme/system-theme-extractor';

export default class CustomEngine implements SystemThemeExtractor {
  // Implement all necessary methods of the interface here.
}
```

The `SystemThemeExtractor` interface specifies that the `getSystemTheme` method should return a Promise object,
allowing for asynchronous computation of the system theme.
If synchronous computation is necessary for your case, you can use `SyncPromise`.

See `components/super/i-static-page/modules/theme` for details.
