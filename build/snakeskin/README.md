# build/snakeskin

This module provides a bunch of built-in filters and variables for Snakeskin templates.
Also, the module sets some default filters for component tags.

## Filters

### b

Resolves the specified file path to use with the Snakeskin include directive.
The filter adds the support of layers.

```
- include 'super/i-data'|b as placeholder

/// The filter also supports Glob patterns
- include '**/*.window.ss'|b

- template index() extends ['i-data'].index
```

### typograf

Applies [Typograf](https://www.npmjs.com/package/typograf) to the specified string and returns the result.
To customize Typograf options, use the `typograf` method from your application config.

__your-app/config/default.js__

```js
const
  config = require('@v4fire/core/config/default');

module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
  __proto__: config,

  /**
   * Returns parameters for `typograf`
   * @returns {!Object}
   */
  typograf() {
    return {
      locale: 'en-us'
    };
  }
});
```

```
- namespace [%fileName%]

- template example()
  /// Hello ‘world’
  {Hello "world"!|typograf}
```

## Tag snippets

### _

Expands the `_` snippet as `<div v-tag=${rootTag}>`.

```
- rootTag = 'span'

/// <span class="foo"><span class="bar"></span</span
< _.foo
  < _.bar
```

### a:void

Expands the `a:void` snippet as `<a href="javascript:void(0)">`.

```
/// <a class="bar" href="javascript:void(0)"></a>
< a:void.bar
```

### button:link

Expands the `button:link` snippet as `<button class="a">`.

```
/// <button class="bar a"></button>
< button:link.bar
```

### `:section` and `:/section`

These snippets help to use semantics HTML tags, like `article` or `section` and don't care about the `h` levels.

```
/// <article><h2>Foo</h2></article>
< article:section
  < h1
    Foo
< :/section
```

### :-attr

Expands the `:-attr=value` attribute snippet as `:data-attr=value`.

```
/// <a :data-hint="hintText"></a>
< a :-hint = hintText
```

## Super-global variables

### saveTplDir

Saves a basename of the specified dirname to the global namespace by the passed aliases.
The function should be used via the `eval` directive.

```
- namespace b-window

- eval
 ? @@saveTplDir(__dirname, 'windowSlotEmptyTransactions')

- block index->windowSlotEmptyTransactions(nms)
  < ?.${nms}
    Hello world!
```
