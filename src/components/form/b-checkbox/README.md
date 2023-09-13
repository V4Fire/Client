# components/form/b-checkbox

This module provides a component to create a checkbox.
Checkboxes can be combined into groups with a feature of the multiple checks.

## Synopsis

* The component extends [[iInput]].

* The component implements the [[iSize]] trait.

* The component is used as functional if there is no provided the `dataProvider` prop.

* By default, the component root tag is `<span>`.

* The component contains an `<input>` tag within.

* The component has `skeletonMarker`.

## Modifiers

| Name      | Description             | Values                                 | Default |
|-----------|-------------------------|----------------------------------------|---------|
| `checked` | The checkbox is checked | `'true'  │ 'false'  │ 'indeterminate'` | -       |

Also, you can see the [[iSize]] trait and the [[iInput]] component.

## Events

| EventName      | Description                                                  | Payload description                                                   | Payload         |
|----------------|--------------------------------------------------------------|-----------------------------------------------------------------------|-----------------|
| `check`        | The checkbox has been checked                                | Checking type (`indeterminate` if not all child checkbox are checked) | `CheckType`     |
| `uncheck`      | The checkbox has been unchecked                              | -                                                                     | -               |
| `actionChange` | The component value has been changed due to some user action | A new component value                                                 | `this['Value']` |

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

You can use any label definition method.

```
< b-checkbox :name = 'adult' | :label = 'Are you over 18?'

< label
  Are you over 18?
  < b-checkbox :name = '18+'

< label for = adult
  Are you over 18?

< b-checkbox :id = 'adult' | :name = 'adult'
```

### Defining a group of checkboxes

To group checkboxes, use the same name.

```
< b-checkbox :name = 'registration' | :value = 'agree'
< b-checkbox :name = 'registration' | :value = 'subscribe'
```

### Loading from a data provider

```
< b-checkbox :dataProvider = 'AdultProvider'
```

When a provider returns a dictionary, it gets mapped onto the component.
To pass a complex property path, you can use dots as separators.

If a key from the response corresponds to a component method, this method will be invoked using the value from that key.
If the value is an array, it will be spread to the method as separate arguments.

The provider should not return any properties that are in the component props list (marked with `@prop` decorator),
they won't be updated.

```
{
  value: true,
  label: 'Are you over 18?',
  'mods.focused': true
}
```

In other cases, the response value is interpreted as a component value.

## Slots

The component supports multiple slots to provide.

1. `check` to provide checkbox UI.

   ```
   < b-checkbox
     < template #check = {ctx}
       < .check-ui :data-status = ctx.mods.checked
   ```

2. `label` to provide label UI.

   ```
   < b-checkbox
     < template #label = {label}
       < .label
         {{ label }}
   ```

## API

Also, you can see the [[iSize]] trait and the [[iInput]] component.

### Props

#### [default = false]

If true, the component is checked by default.
Also, it will still be checked after the `reset` method is called.

```
< b-checbox :name = 'bar' | :default = true
```

#### [parentId]

The identifier of the "parent" checkbox.
Use this prop to organize the checkbox hierarchy. Checkboxes of the same level must have the same `name`.

```
- [-]
  - [X]
  - [ ]
  - [X]
    - [X]
    - [X]
```

When you click on a parent checkbox, all child elements will be checked or unchecked.
When you click on a child checkbox, the parent checkbox will be
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

The checkbox label text.
Basically, it's rendered somewhere in the component layout.

#### [changeable = `true`]

If true, the checkbox can be unchecked immediately after the first check.

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

Since the component extends from [[iInput]], it supports the validation API.

```
< b-checkbox :name = 'adult' | :validators = ['required'] | @validationEnd = handler
```
