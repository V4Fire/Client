# form/b-input-hidden

This module provides a component to create a hidden input.
You can use it to provide some hidden information to a form.

## Synopsis

* The component extends [[iInput]].

* The component is used as functional if there is no provided the `dataProvider` prop.

* By default, the root tag of the component is `<span>`.

* The component contains a `<input>` tag within.

## Usage

1. Simple usage.

```
< form
  < b-input-hidden :name = '_id' | :value = userId
```

2. Loading from a data provider.

```
< form
  < b-input-hidden :dataProvider = 'UserId'
```

If the provider returns a dictionary, it will be mapped on the component
(you can pass the complex property path using dots as separators).
If a key from the response data is matched with a component method, this method will be invoked with a value from this key
(if the value is an array, it will be spread to the method as arguments).

```
{
  name: '_id',
  value: 104
}
```

In other cases, the response value is interpreted as the component value.
