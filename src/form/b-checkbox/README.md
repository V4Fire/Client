# form/b-checkbox

This module provides a component to create a checkbox.
Checkboxes can be combined in groups with the feature of multiple checking.

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

1. Simple usage.

```
< b-checkbox :name = 'adult'
< b-checkbox :name = 'adult' | :checked = true
< b-checkbox @change = doSomething
```

2. Providing of a value.

```
< b-checkbox :name = 'adult' | :value = '18+'
```

3. Providing of a label.

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

4. Group of checkboxes.

To group checkboxes, use the same name.

```
< b-checkbox :name = 'registration' | :value = 'agree'
< b-checkbox :name = 'registration' | :value = 'subscribe'
```

5. Loading from a data provider.

```
< b-checkbox :dataProvider = 'AdultProvider'
```

If the provider returns a dictionary, it will be mapped on the component
(you can pass the complex property path using dots as separators).
If a key from the response data is matched with a component method, this method will be invoked with a value from this key
(if the value is an array, it will be spread to the method as arguments).

```
{
  value: true,
  label: 'Are you over 18?',
  'mods.focused': true
}
```

In other cases, the response value is interpreted as the component value.

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

## Validation

Because the component extends from [[iInput]], it supports validation API.

```
< b-checkbox :name = 'adult' | :validators = ['required'] | @validationEnd = handler
```

## Hierarchy of checkboxes

The component supports the feature of the multilevel checkbox hierarchy. For instance:

```
- [-]
  - [X]
  - [ ]
  - [X]
    - [X]
    - [X]
```

When you click the parent checkbox, all children will be checked or unchecked.
When you click a child, the parent checkbox will be set to the indeterminate status.

```
< b-checbox :id = 'parent'

< b-checbox :id = 'foo' | :parentId = 'parent' | :name = 'foo'
< b-checbox :parentId = 'foo' | :name = 'bla'

< b-checbox :parentId = 'parent' | :name = 'bar'
```

## API

The component provides a bunch of methods to manage of checking/unchecking: `check`, `uncheck`, `toggle`, `reset`, `clear`.

### Preventing the user manual checking

If you specify the `changeable` prop to `false`, the component can't be checked or unchecked due to a user action.

```
< b-checbox :name = 'bar' | :changeable = false | :checked = true
```
