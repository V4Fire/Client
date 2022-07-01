# core/component/directives/attrs

This module provides a directive to set any input parameters to a component or tag based on the passed dictionary.

## Usage

```
< div v-attrs = { &
  /// We can pass any available directive except `v-if`
  'v-show': showCondition,

  /// We can pass any event listeners with support of Vue modifiers
  '@click.capture.self': clickHandler,

  /// Or just regular props or attributes
  ':style': styles,

  /// `:` is optional
  class: extraClasses

  /// Attribute modifiers are also supported
  '.some-field.camel': someFieldValue
} .

/// To use `v-model`, provide a model store name as a string
< input v-attrs = {'v-model': 'textStore'}
```
