# core/component/directives/attrs

This module provides a directive for setting any input parameters/attributes/directives for a component or tag based on
the provided dictionary.

```
< .example :v-attrs = {'@click': console.log, class: classes, 'v-show': condition}
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

## Using the directive as an attribute

The `v-attr` directive can be used as a regular directive, or as an element or component attribute.

```
< .example :v-attrs = {'@click': console.log, class: classes, 'v-show': condition}
```

This approach of creating a directive is more versatile because it works correctly with functional components.

```
/// Due to technical limitations, we cannot pass any props to a functional component
< my-functional-component v-attrs = {myProp: '...'}

/// Everything works as expected
< my-functional-component :v-attrs = {myProp: '...'}
```

## Usage

### Providing directives, events, attributes, and props

```
< div :v-attrs = { &
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
< input :v-attrs = {'v-model': 'textStore'}
```
