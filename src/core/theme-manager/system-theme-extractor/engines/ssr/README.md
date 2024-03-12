# core/theme-manager/system-theme-extractor/engines/ssr

This module represents a `SystemThemeExtractor` implementation tailored for ssr environments.
This implementation uses a request headers to extract preferred color scheme.

## Example

```ts
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  const ssrExtractor = new SystemThemeExtractorSsr(req.headers);
  // ...
});
```
