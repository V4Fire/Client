# components/form/b-input

This module provides a component to create a form input.

## Synopsis

* The component extends [[iInputText]].

* The component is used as functional if there is no provided the `dataProvider` prop.

* By default, the component's root tag is set to `<span>`.

* The component supports tooltips.

* The component contains an `<input>` tag within.

* The component has `skeletonMarker`.

## Modifiers

See the parent component and the component traits.

## Events

See the parent component and the component traits.

## Usage

### A simple standalone input component

```
< b-input :value = myValue | @onActionChange = console.log($event)
```

### A component that tied with some form

```
< b-form :dataProvider = 'User' | :method = 'add'
  < b-input :name = 'fname'
  < b-button :type = 'submit'
```

### Loading from a data provider

```
< b-input :dataProvide = 'MyProvider' | @onActionChange = console.log($event)
```

When a provider returns a dictionary, it gets mapped onto the component. To pass a complex property path, you can use dots as separators.

If a key from the response corresponds to a component method, this method will be invoked using the value from that key.
If the value is an array, it will be spread to the method as separate arguments.

The provider should not return any properties which are in the component props list (marked with `@prop` decorator), they won't be updated.

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

1. `preIcon` and `icon` to inject icons around the value block.

   ```
   < b-input
     < template #preIcon
       < img src = validate.svg

     < template #icon
       < img src = clear.svg
   ```

   Also, these icons can be provided by props.

   ```
   < b-input :icon = 'validate'
   < b-input :preIcon = 'validate' | :iconComponent = 'b-custom-icon'

   < b-input
     < template #icon = {icon}
       < img :src = icon
   ```

2. `progressIcon` to inject an icon that indicates loading, by default, is used [[bProgressIcon]].

    ```
    < b-input
      < template #progressIcon
        < img src = spinner.svg
    ```

    Also, this icon can be provided by a prop.

    ```
    < b-input :progressIcon = 'bCustomLoader'
    ```

## API

Also, you can see the parent component and the component traits.

### Props

#### [min]

The minimum input value (for number and date types).
[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefmin).

#### [max]

The maximum input value (for number and date types).
[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefmax).

#### [preIcon]

An icon to show before the input.

```
< b-input :preIcon = 'dropdown'
```

#### [preIconComponent]

The name of the used component to show `icon`.

```
< b-input :preIconComponent = 'b-my-icon'
```

#### [preIconHint]

Tooltip text to show during hover the cursor on `preIcon`.

```
< b-input :preIcon = 'dropdown' | :preIconHint = 'Show variants'
```

#### [preIconHintPos]

The tooltip position to show when hovering over the `preIcon`.
See [[gIcon]] for more information.

```
< b-input &
  :preIcon = 'dropdown' |
  :preIconHint = 'Show variants' |
  :preIconHintPos = 'bottom-right'
.
```

#### [icon]

An icon to show after the input.

```
< b-input :icon = 'dropdown'
```

#### [iconComponent]

The name of the used component to display `icon`.

```
< b-input :iconComponent = 'b-my-icon'
```

#### [iconHint]

The tooltip position to show when hovering over the `icon`.

```
< b-input :icon = 'dropdown' | :iconHint = 'Show variants'
```

#### [iconHintPos]

Tooltip position to show during hover the cursor on `icon`.
See [[gIcon]] for more information.

```
< b-input &
  :icon = 'dropdown' |
  :iconHint = 'Show variants' |
  :iconHintPos = 'bottom-right'
.
```

### [progressIcon]

A component to show "in-progress" state or
Boolean, if needed to show progress by slot or `b-progress-icon`.

```
< b-input :progressIcon = 'b-my-progress-icon'
```

### [textHint]

An additional text hint that is shown after non-empty input text.
Mind, the hint value does not affect a component value.

```
/// You will see "value in the catalog" in the input.
/// Mind, `bInput.value` will just be "value" as provided.
< b-input &
  :value = 'value' |
  :textHint = ' in the catalog'
.

/// You will see the empty input in that case or a placeholder, if it provided.
/// If you type a message, then you’ll see "<your message> in catalog" in the input.
< b-input &
  :textHint = ' in catalog'
  [:placeholer = 'search']
.
```

### Validation

Because the component extends from [[iInput]], it supports validation API.

```
< b-input :name = 'email' | :validators = ['required', 'email'] | @validationEnd = handler
```

#### Built-in validators

The component provides a bunch of validators.

##### required

Checks that the component value must be filled.

```
< b-input :validators = ['required']
< b-input :validators = {required: {showMsg: false}}
```

##### number

Checks that the component value can be parsed as a number.

```
< b-input :validators = ['number']
< b-input :validators = {number: {type: 'int', min: 10, max: 20}}
< b-input :validators = {number: {type: 'float', precision: 3, strictPrecision: true}}
```

##### date

Checks that the component value can be parsed as a date.

```
< b-input :validators = ['date']
< b-input :validators = {date: {past: false}}
< b-input :validators = {date: {min: 'yesterday', max: 'tomorrow'}}
```

##### pattern

Checks that the component value must match the provided pattern.

```
< b-input :validators = {pattern: {pattern: '^[\\d$]+'}}
< b-input :validators = {pattern: {min: 10, max: 20}}
```

##### email

Checks that the component value can be parsed as an email string.

```
< b-input :validators = ['email']
< b-input :validators = {email: {showMsg: false}}
```

##### password

Checks that the component value matches the password format.

```
< b-input :id = 'old-password'

< b-input :name = 'password' | :validators = [['password', { &
  min: 12,
  max: 24,
  old: '#old-password',
  connected: '#repeat-password'
}]] .

< b-input :id = 'repeat-password'
```

## Styles

By default, the component provides a button to clear the input value.
You can configure it via CSS by using the `&__clear` selector.

```styl
&__clear
  size 20px
  background-image url("assets/my-icon.svg")
```
