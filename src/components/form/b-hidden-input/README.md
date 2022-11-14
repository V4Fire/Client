# components/form/b-hidden-input

This module provides a component to create a hidden input.
You can use it to provide some hidden information to a form.

## Synopsis

* The component extends [[iInput]].

* The component is used as functional if there is no provided the `dataProvider` prop.

* By default, the root tag of the component is `<span>`.

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

If the provider returns a dictionary, it will be mapped on the component
(you can pass a complex property path using dots as determiners).

If any key from the response matches a component method, that method will be called with the value from that key.
(if the value is an array, it will be passed to the method as arguments).

```
{
  name: '_id',
  value: 104
}
```

In other cases, the response value is interpreted as the component value.
