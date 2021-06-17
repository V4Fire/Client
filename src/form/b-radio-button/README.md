# form/b-radio-button

This module provides a component to create a radio button.

## Synopsis

* The component extends [[bCheckbox]].

* The component is used as functional if there is no provided the `dataProvider` prop.

* The component can be used as flyweight.

* By default, the root tag of the component is `<span>`.

* The component contains an `<input>` tag within.

* The component has `skeletonMarker`.

## Modifiers

See the parent component and the component traits.

## Events

See the parent component and the component traits.

## Usage

### Simple usage

```
< b-radio-button :name = 'adult' | :value = 0
< b-radio-button :name = 'adult' | :value = 1 | :checked = true
< b-radio-button @change = doSomething
```

### Providing a label

You free to use any ways to define a label.

```
< b-radio-button :name = 'adult' | :label = 'Are you over 18?'

< label
  Are you over 18?
  < b-radio-button :name = 'adult2'

< label for = adult3
  Are you over 18?

< b-radio-button :id = 'adult3' | :name = 'adult3'
```

### Defining a group of radio buttons

To group radio buttons, use the same name.

```
< b-radio-button :name = 'registration' | :value = 'agree'
< b-radio-button :name = 'registration' | :value = 'subscribe'
```

### Loading from a data provider

```
< b-radio-button :dataProvider = 'AdultProvider'
```

If a provider returns a dictionary, it will be mapped on the component
(you can pass the complex property path using dots as separators).

If a key from the response is matched with a component method, this method will be invoked with a value from this key
(if the value is an array, it will be spread to the method as arguments).

```
{
  value: true,
  label: 'Are you over 18?',
  'mods.focused': true
}
```

In other cases, the response value is interpreted as a component value.

## Slots

The component supports a few of slots to provide:

1. `check` to provide radio button UI.

```
< b-radio-button
  < template #check = {ctx}
    < .check-ui :data-status = ctx.mods.checked
```

2. `label` to provide label UI.

```
< b-radio-button
  < template #label = {label}
    < .label
      {{ label }}
```

## API

Also, you can see the parent component and the component traits.

### Props

#### [changeable = `false`]

If true, the checkbox can be unchecked directly after the first check.

```
< b-radio-button :name = 'bar' | :changeable = true | :checked = true
```
