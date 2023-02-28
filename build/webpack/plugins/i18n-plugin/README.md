# build/webpack/plugins/i18n-plugin

This module provides a plugin to embed translations in the html document.

## Options

__config/default.js__

```js
module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
  __proto__: config,

  i18n: {
    i18nEngine: o('i18n-engine', {
      env: true,
      default: 'inlineHtml'
    }),

    supportedLocales() {
      return ['en', 'ru'];
    }
  }
});
```

### Principle of work

For each language specified in the config inside `i18n.supportedLocales`, translations are collected in the project. Aggregated into a single object and written inside an html document to a global variable

Example with en and ru locales
```js
// Before:
${webpack.clientOutput()}/main.html

// After:
${webpack.clientOutput()}/main.html
${webpack.clientOutput()}/main_ru.html
${webpack.clientOutput()}/main_en.html
```
