# form/b-input

This module provides a component to create a form input.

## Synopsis

* The component extends [[iInputText]].

* The component is used as functional if there is no provided the `dataProvider` prop.

* By default, the root tag of the component is `<span>`.

* The component supports tooltips.

* The component contains a `<input>` tag within.

* The component has `skeletonMarker`.

## Modifiers

See the parent component and the component traits.

## Events

See the parent component and the component traits.

## Validation

Because the component extends from [[iInput]], it supports validation API.``

```
< b-input :name = 'email' | :validators = ['required', 'email'] | @validationEnd = handler
```

### Built-in validators

The component provides a bunch of validators.

#### required

