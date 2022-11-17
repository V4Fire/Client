# components/form/b-textarea

This module provides a component to create a textarea.
The component supports a feature of auto-resizing till it reaches the specified maximum height without a showing of a scrollbar.

## Synopsis

* The component extends [[iInputText]].

* The component is used as functional if there is no provided the `dataProvider` prop.

* By default, the root tag of the component is `<span>`.

* The component contains an `<input>` tag within.

* The component has `skeletonMarker`.

## Modifiers

See the parent component and the component traits.

## Events

See the parent component and the component traits.

## How to enable textarea auto-resizing?

Specify `height` and `max-height` for the `&__input` element via CSS.
The `height` means the initial height or minimal of the component.
Additionally, you can control the value to expand the component height via the `rowsToExpand` prop.

## How to enable warnings about the remaining characters that a component may contain?

If you switch `messageHelpers` to `true` and provide `maxLength`,
the component will show a warning when the number of characters in the value approaches `maxLength`.
You can define your own logic via the `limit` slot.

```
< b-textarea :maxLength = 20 | :messageHelpers = true

< b-textarea :maxLength = 20
  < template #limit = {limit, maxLength}
    < template v-if = limit < maxLength / 1.5
      Characters left: {{ limit }}
```

## Usage

### A simple standalone textarea

```
< b-textarea :value = myValue | @onActionChange = console.log($event)
```

### A component that tied with some form

```
< b-form :dataProvider = 'Info' | :method = 'add'
  < b-textarea :name = 'desc'
  < b-button :type = 'submit'
```

### Loading from a data provider

```
< b-textarea :dataProvide = 'MyProvider' | @onActionChange = console.log($event)
```

If the provider returns a dictionary, it will be mapped on the component
(you can pass a complex property path using dots as determiners).

If any key from the response matches a component method, that method will be called with the value from that key.
(if the value is an array, it will be passed to the method as arguments).

```
{
  value: true,
  label: 'Are you over 18?',
  'mods.focused': true
}
```

In other cases, the response value is interpreted as the component value.

## Slots

The component supports multiple slots to provide.

1. `limit` to provide an informer indicating how many characters the user can enter.

   ```
   < b-textarea :maxLength = 20
     < template #limit = {limit, maxLength}
       < template v-if = limit < maxLength / 1.5
         Characters left: {{ limit }}
   ```

## API

Also, you can see the parent component and the component traits.

### Props

#### [rowsToExpand = 1]

How many rows to add to expand the textarea height when it can't fit the entire content without showing a scrollbar.
The value of one row is equal to the `line-height` of the textarea, or `font-size`.

```
< b-textarea :rowsToExpand = 5
```

### Getters

#### height

The textarea height.

#### maxHeight

The maximum textarea height.

#### newlineHeight

The height of the new line.
It depends on `line-height/font-size` of the textarea.

#### limit

The number of remaining characters the component can contain.

### Methods

#### fitHeight

Updates the textarea height to show its content without showing a scrollbar.
The method returns a new height value.

### Validation

Because the component extends from [[iInput]], it supports validation API.

```
< b-textarea :name = 'desc' | :validators = ['required'] | @validationEnd = handler
```

#### Built-in validators

The component provides a bunch of validators.

##### required

Checks that the component value must be filled.

```
< b-textarea :validators = ['required']
< b-textarea :validators = {required: {showMsg: false}}
```

##### pattern

Checks that the component value must match the provided pattern.

```
< b-textarea :validators = {pattern: {pattern: '^[\\d$]+'}}
< b-textarea :validators = {pattern: {min: 10, max: 20}}
```
