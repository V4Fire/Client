# form/b-checkbox

This module provides a component to create a checkbox.
Checkboxes can be combined in groups with a feature of the multiple checking.

## Synopsis

* The component extends [[iInput]].

* The component implements the [[iSize]] trait.

* The component is used as functional if there is no provided the `dataProvider` prop.

* The component can be used as flyweight.

* By default, the root tag of the component is `<span>`.

* The component contains a `<input>` tag within.

* The component has `skeletonMarker`.

## Modifiers

| Name      | Description             | Values                                 | Default |
| --------- | ----------------------- | -------------------------------------- | ------- |
| `checked` | The checkbox is checked | `'true' \| 'false' \| 'indeterminate'` | -       |

Also, you can see the [[iSize]] trait and the [[iInput]] component.

## Events

| EventName      | Description                                                       | Payload description                                                      | Payload         |
| -------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------- |
| `check`        | The checkbox has been checked                                     | Type of checking (`indeterminate` if not all child checkbox are checked) | `CheckType`     |
| `uncheck`      | The checkbox has been unchecked                                   | -                                                                        | -               |
| `actionChange` | A value of the component has been changed due to some user action | Component value                                                          | `this['Value']` |

Also, you can see the [[iSize]] trait and the [[iInput]] component.

## Usage

### Simple usage

```
< b-checkbox :name = 'adult'
< b-checkbox :name = 'adult' | :checked = true
< b-checkbox @change = doSomething
```

### Providing a value

```
< b-checkbox :name = 'adult' | :value = '18+'
```

### Providing a label

You free to use any ways to define a label.

```
< b-checkbox :name = 'adult' | :label = 'Are you over 18?'

< label
  Are you over 18?
  < b-checkbox :name = '18+'

< label for = adult
  Are you over 18?

< b-checkbox :id = 'adult' | :name = 'adult'
```

### Defining group of checkboxes

To group checkboxes, use the same name.

```
< b-checkbox :name = 'registration' | :value = 'agree'
< b-checkbox :name = 'registration' | :value = 'subscribe'
```

### Loading from a data provider

```
< b-checkbox :dataProvider = 'AdultProvider'
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

1. `check` to provide checkbox UI.

```
< b-checkbox
  < template #check = {ctx}
    < .check-ui :data-status = ctx.mods.checked
```

2. `label` to provide label UI.

```
< b-checkbox
  < template #check = {label}
    < .label
      {{ label }}
```

## API

Also, you can see the [[iSize]] trait and the [[iInput]] component.

### Props

#### [default = false]

If true, the component is checked by default.
Also, it will be checked after resetting.

```
< b-checbox :name = 'bar' | :default = true
```

#### [parentId]

An identifier of the "parent" checkbox.
Use this prop to organize a hierarchy of checkboxes. Checkboxes of the same level must have the same `name`.

```
- [-]
  - [X]
  - [ ]
  - [X]
    - [X]
    - [X]
```

When you click a parent checkbox, all children will be checked or unchecked.
When you click a child, the parent checkbox will be
  * checked as `'indeterminate'` - if not all checkboxes with the same `name` are checked;
  * unchecked - if all checkboxes with the same `name` are checked.

```
< b-checkbox :id = 'parent'

< b-checkbox &
  :id = 'foo' |
  :name = 'lvl2' |
  :parentId = 'parent'
.

< b-checkbox &
  :id = 'foo2' |
  :parentId = 'parent' |
  :name = 'lvl2'
.

< b-checkbox &
  :parentId = 'foo' |
  :name = 'lvl3-foo'
.

< b-checkbox &
  :parentId = 'foo2' |
  :name = 'lvl3-foo2'
.
```

#### [label]

A checkbox' label text. Basically, it outputs somewhere in the component layout.

#### [changeable = `true`]

True if the checkbox can be unchecked directly after the first check.

```
< b-checbox :name = 'bar' | :changeable = false | :checked = true
```

### Getters

#### isChecked

True if the checkbox is checked.

### Methods

#### check

Checks the checkbox.

#### uncheck

Unchecks the checkbox.

#### toggle

Toggles the checkbox.
The method returns a new value.

### Validation

Because the component extends from [[iInput]], it supports validation API.

```
< b-checkbox :name = 'adult' | :validators = ['required'] | @validationEnd = handler
```
