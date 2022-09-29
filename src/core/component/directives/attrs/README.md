# core/component/directives/attrs

This module provides a directive to set any input parameters/attributes/directives for a component or tag based on the passed dictionary.

## Why is this directive needed?

It often happens that you need to apply a dynamic set of parameters to an element or component.
For events and attributes, we have extended versions of the `v-on` and `v-bind` directives.

```
< .example v-on = {click: console.log} | v-bind = {class: classes}
```

Unfortunately, we don't have similar functionality for directives.

```
/// You can't do this
< .example v-directives = {'v-show': condition}
```

This directive solves this problem and provides a common interface to set any input parameters to an element or component,
except the `v-if` directive.

```
< .example v-attrs = {'@click': console.log, class: classes, 'v-show': condition}
```

## Using the directive as an attribute

The `v-attr` directive can be created as a regular directive, or as an element or component attribute.

```
< .example :v-attrs = {'@click': console.log, class: classes, 'v-show': condition}
```

This way of creating the directive is more versatile, because works correctly with functional components.

```
/// Due to technical limitations, we cannot pass any props to a functional component
< my-functional-component v-attrs = {myProp: '...'}

/// Everything works as expected
< my-functional-component :v-attrs = {myProp: '...'}
```

## Usage

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

  /// Attribute modifiers are also supported
  '.some-field.camel': someFieldValue
} .

/// To use `v-model`, provide the model store as a string
< input :v-attrs = {'v-model': 'textStore'}
```
