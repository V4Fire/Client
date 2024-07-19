# core/component/directives/attrs

This module provides a directive for setting any input parameters/attributes/directives for a component or tag based on
the provided dictionary.

```
< .example v-attrs = {'@click': console.log, class: classes, 'v-show': condition}
```

## Why is This Directive Needed?

Often, there are situations where we need to dynamically apply a set of parameters to an element or component.
While we have extended versions of the `v-on` and `v-bind` directives for events and attributes,
unfortunately, there isn't a similar functionality for directives.

```
< .example v-on = {click: console.log} | v-bind = {class: classes}

/// You can't do this
< .example v-directives = {'v-show': condition}
```

To address this limitation, this directive provides a solution by offering a common interface to set any input
parameters for an element or component, except for the `v-if` directive.

```
< .example v-attrs = {'@click': console.log, class: classes, 'v-show': condition}
```

## Usage

### Providing directives, events, attributes, and props

```
< div v-attrs = { &
  /// We can pass any available directive except `v-if`
  'v-show': showCondition,

  /// We can pass any event listener with support of Vue modifiers
  '@click.capture.self': clickHandler,

  /// Or just regular props or attributes
  ':style': styles,

  /// The `:` prefix is optional
  class: extraClasses

  /// The attribute modifiers are also supported
  '.some-field.camel': someFieldValue
} .
```

### Providing the `v-model` directive

To use the `v-model` directive, provide the model store as a string.

```
< input v-attrs = {'v-model': 'textStore'}
```
