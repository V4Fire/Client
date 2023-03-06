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
      default: 'inlineSingleHTML'
    }),

    translatesGlobalPath: 'TRANSLATE_MAP',

    supportedLocales() {
      return ['en', 'ru'];
    }
  }
});
```

### i18nEngine

#### i18nEngine - inlineSingleHTML

All translations are collected and added to a global variable in the main html document

```js
// Before:
${webpack.clientOutput()}/main.html

// After:
${webpack.clientOutput()}/main.html // Includes all supported languages
```

#### i18nEngine - inlineMultipleHTML

For each language, a separate html is created inside which an object with translations is inserted.
The default language from the config is inserted into the main html file.

```js
// Before:
${webpack.clientOutput()}/main.html

// After:
${webpack.clientOutput()}/main.html // Includes default language from config
${webpack.clientOutput()}/main_ru.html // Includes ru language
${webpack.clientOutput()}/main_en.html // Includes en language
```

#### i18nEngine - externalJSON

A json file with keys is created for each language. Nothing is inserted into the html. Used for SSR.

```js
// Before:
${webpack.clientOutput()}/main.html

// After:
${webpack.clientOutput()}/main.html // Dont have any languages
${webpack.clientOutput()}/en.json // JSON with en keysets
${webpack.clientOutput()}/ru.json // JSON with ru keysets
```

### translatesGlobalPath

`translatesGlobalPath` - this path is used to save the translation inside an html document

```html
<html>
  <head>
    <!-- This script will be overwritten as a result of the plugin  -->
    <script>
      ${translatesGlobalPath} = {};
    </script>
  </head>
  <body>...</body>
</html>
```

### supportedLocales

When building the project, only the languages listed in the `supportedLocales` array will be used. All others will be ignored, even if they exist in the project.
