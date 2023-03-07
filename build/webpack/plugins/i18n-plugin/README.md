# build/webpack/plugins/i18n-plugin

This module provides a plugin for loading language packs to internationalize the application.

## Where are language packs stored?

Language packs should be located inside folders named `i18n` and have the same name as the locale for which the pack is declared.
For example, __b-select/i18n/en.js__.

```js
module.exports = {
  'b-select': {
    'Required field': 'Required field'
  }
};
```

You can read more about the format of language packs in the documentation of the [[lang]] module.

## Is it possible to specify for which locales language packs should be included?

Yes, this requires using the `i18n.supportedLocales` setting in the global application config.

```js
module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
  __proto__: config,

  i18n: {
    supportedLocales() {
      return ['en', 'ru'];
    }
  }
});
```

By default, only the locale specified in the `locale` option of the global config is loaded.

```js
module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
  __proto__: config,

  locale: 'ru'
});
```

Also, you can specify a list of supported locales using CLI parameters or environment variables.

```bash
npx webpack --env supported-locales=en,ru
```

Or

```bash
export SUPPORTED_LOCALES=en,ru npx webpack
```

## How exactly are language packs added to an application?

There are several strategies.
You can choose which strategy to use via the global `i18n.strategy` config.

```js
module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
  __proto__: config,

  i18n: {
    strategy() {
      return 'inlineMultipleHTML';
    }
  }
});
```

In addition, you can specify the strategy to use using CLI options or environment variables..

```bash
npx webpack --env i18n-strategy=inlineMultipleHTML
```

Or

```bash
export I18N_STRATEGY=inlineMultipleHTML npx webpack
```

### inlineSingleHTML

All localization files found will be included in the application HTML files themselves.
Language packs will be added via the `LANG_PACKS` global variable, but you can customize its name using the `i18n.langPacksStore` option in the global config.

### inlineMultipleHTML

Based on the application original HTML files, new HTML will be generated for each supported locale.
For example, if the original file is `p-root.html` and `i18n.supportedLocales=en,ru`, then `p-root_en.html` and `p-root_ru.html` will be generated.
Language packs will be added via the `LANG_PACKS` global variable, but you can customize its name using the `i18n.langPacksStore` option in the global config.

### externalMultipleJSON

All found localization files will be combined into several JSON files for each locale.
For example, `en.json` or `ru.json`. These packs will not be included in the final HTML files - you should do it manually.
