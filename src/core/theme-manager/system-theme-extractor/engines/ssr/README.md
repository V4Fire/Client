# core/theme-manager/system-theme-extractor/engines/ssr

This module is a SystemThemeExtractor implementation designed for SSR environments.
It uses request headers to determine the user's preferred color scheme.

For more information, please read the [core/theme-manager](../../README.md) documentation.

## Example

```ts
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  const ssrExtractor = new SystemThemeExtractorSSR(req.headers);
  // ...
});
```
