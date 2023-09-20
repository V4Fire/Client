# build/webpack/plugins/i18n-plugin

This module provides a plugin for loading language packs to internationalize the application.

## Where are language packs stored?

The language packs ought to be stored within folders labeled `i18n`,
with their filename reflecting the locale to which they pertain.
For instance, an English language pack should be named 'en.js' and located in the `b-select/i18n/` directory.

```js
module.exports = {
  'b-select': {
    'Required field': 'Required field'
  }
};
```

To gain a deeper understanding of the language pack formatting,
you're encouraged to refer to the [[lang]] module documentation.

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

By default, only the language pack corresponding to the locale defined in the `locale` option of
the global configuration settings is loaded.

```js
module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
  __proto__: config,

  locale: 'ru'
});
```

Moreover, you have the option to specify a list of supported locales by leveraging CLI parameters or
environment variables.

```bash
npx webpack --env supported-locales=en,ru
```

Or

```bash
export SUPPORTED_LOCALES=en,ru npx webpack
```

## How are language packs precisely incorporated into an application?

There exist multiple strategies for this task.
The strategy of choice can be selected through the global `i18n.strategy` configuration.

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

Additionally, you can also dictate the strategy to be used via CLI options or environment variables.

```bash
npx webpack --env i18n-strategy=inlineMultipleHTML
```

Or

```bash
export I18N_STRATEGY=inlineMultipleHTML npx webpack
```

### inlineSingleHTML

With this strategy, all detected localization files will be directly incorporated into the HTML files
of the application itself.
Language packs will be added via the global variable `LANG_PACKS`.
However, you have the flexibility to modify its name by utilizing the `i18n.langPacksStore` option
in the global configuration.

Note: Setting the `externalizeInline` option to `true` disables the inlining of assets into HTML.
Therefore, when this option is enabled, the language packs will be inlined into the script file with vars declaration.

### inlineMultipleHTML

In this approach, for each supported locale, new HTML will be generated based on the original HTML application files.
For instance, if the original file is `p-root.html` and `i18n.supportedLocales` are English and Russian,
then `p-root_en.html` and `p-root_ru.html` files will be created respectively.
Like the previous methodology, language packs will be added via the `LANG_PACKS` global variable,
which can be customized using the `i18n.langPacksStore` option in the global setup.

Note: Setting the `externalizeInline` option to `true` disables the inlining of assets into HTML.
Therefore, when this option is enabled, additional external scripts with vars declarations will be generated
for each locale.

### externalMultipleJSON

This strategy compiles all discovered localization files into separate JSON files for each locale,
such as `en.json` or `ru.json`.
Unlike the other strategies, these language packs will not be automatically incorporated into the final HTML files –
this step must be manually carried out.
