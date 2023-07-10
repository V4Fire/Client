# components/form/b-hidden-input

This module provides a component to create a hidden input.
You can use it to provide some hidden information to a form.

## Synopsis

* The component extends [[iInput]].

* The component is used as functional if there is no provided the `dataProvider` prop.

* By default, the component's root tag is set to `<span>`.

* The component contains an `<input>` tag within.

## Usage

### Simple usage

```
< form
  < b-hidden-input :name = '_id' | :value = userId
```

### Loading from a data provider

```
< form
  < b-hidden-input :dataProvider = 'UserId'
```

When a provider returns a dictionary, it gets mapped onto the component. To pass a complex property path, you can use dots as separators.

If a key from the response corresponds to a component method, this method will be invoked using the value from that key.
If the value is an array, it will be spread to the method as separate arguments.

The provider should not return any properties which are in the component props list (marked with `@prop` decorator), they won't be updated.

```
{
  name: '_id',
  value: 104
}
```

In other cases, the response value is interpreted as a component value.
