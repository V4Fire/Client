# core/component/directives/attrs

This module provides a directive for setting any input parameters/attributes/directives for a component or tag based on
the provided dictionary.

```
< .example v-attrs = {'@click': console.log, class: classes, 'v-show': condition}
```

## Why is This Directive Necessary?

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

### Providing `forceUpdate: false` props to components

When working with component properties in frameworks like Vue or React,
optimizing re-render behavior is crucial for performance.
By default, any change to a component's props results in the component's template being re-rendered.
However, there are scenarios where you might want to prevent unnecessary re-renders
when the prop value changes do not affect the visual output or component behavior.

To address this issue in V4Fire, it is necessary to add a special flag `forceUpdate: false` to any prop.

```typescript
import iBlock, { component, prop } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @prop({type: Number, forceUpdate: false})
  value!: number;
}
```

Additionally, when passing such props using the `v-attrs` directive,
they should be transmitted as demonstrated in the example below:

```
< b-example v-attrs = {'@:value': createPropAccessors(() => someValue)}
```

The `createPropAccessors` function generates accessor functions for `someValue`,
effectively allowing you to manage how prop changes affect component re-rendering.
By doing this, you can ensure that updates to `someValue` do not automatically
trigger a re-render unless explicitly required, enhancing the performance and efficiency of the application.

### Providing the `v-model` directive

To use the `v-model` directive, provide the model store as a string.

```
< input v-attrs = {'v-model': 'textStore'}
```
