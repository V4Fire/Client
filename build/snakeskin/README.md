# build/snakeskin

This module provides a variety of built-in filters and variables for Snakeskin templates.
Additionally, it sets default filters for component tags.

## Filters

### n

Resolves the specified namespace and returns it.
This filter is essential for correctly resolving templates that exist within the same namespace
but are declared across multiple files.

```
- namespace ['m-component'|n]

- template a()
  ...
```

### b

Resolves the specified file path for use with the Snakeskin include directive, also adding support for layers.

```
- include 'super/i-data'|b as placeholder

/// The filter also supports Glob patterns
- include '**/*.window.ss'|b

- template index() extends ['i-data'].index
```

If the path ends with the symbols `:$postfix`, during the path resolution,
a hard link will be created to the original file named `$fileName_$postfix`.
This functionality is critical for correctly overriding templates in a layered mono-repository,
ensuring that the integrity and the separation of layers are maintained even when templates
are extended or customized.

```
- include 'super/i-data:core'|b as placeholder

- template index() extends ['i-data_core'].index
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
   * @returns {object}
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

These snippets facilitate the use of semantic HTML tags, like `<article>` or `<section>`,
without worrying about heading levels.

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

Saves the basename of the specified directory to the global namespace under the provided aliases.
It should be used through the `eval` directive.

```
- namespace b-window

- eval
 ? @@saveTplDir(__dirname, 'windowSlotEmptyTransactions')

- block index->windowSlotEmptyTransactions(nms)
  < ?.${nms}
    Hello world!
```
