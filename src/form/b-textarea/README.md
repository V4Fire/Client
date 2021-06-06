# form/b-textarea

This module provides a component to create a textarea.
The component supports a feature of auto-resizing till it reaches the specified max height without a showing of a scrollbar.

## Synopsis

* The component extends [[iInputText]].

* The component is used as functional if there is no provided the `dataProvider` prop.

* By default, the root tag of the component is `<span>`.

* The component contains a `<input>` tag within.

* The component has `skeletonMarker`.

## Modifiers

See the parent component and the component traits.

## Events

See the parent component and the component traits.

## How to enable auto-resizing

Provide `height` and `max-height` to the  `&__input` element via CSS.
The `height` means the initial height or minimal of a component.
Also, you can manage a value to expand component height via the `extRowCount` prop.

## Enabling a warning of remaining characters that a component can contain

If you switch `messageHelpers` to `true` and provide `maxLength`,
the component will show a warning when the number of value characters comes near the `maxLength` value.
You can define your own logic via the `limit` slot.

```
< b-textarea :maxLength = 20 | :messageHelpers = true

< b-textarea :maxLength = 20
  < template #limit = {limit, maxLength}
    < template v-if = limit < maxLength / 1.5
      Characters left: {{ limit }}
```

## Usage

The component has two base scenarios of usage:

### A simple standalone textarea

```
< b-textarea :value = myValue | @onActionChange = console.log($event)

/// The component loads data from a provider
< b-textarea :dataProvide = 'MyProvider' | @onActionChange = console.log($event)
```

### A component that tied with some form

```
< b-form :dataProvider = 'Info' | :method = 'add'
  < b-textarea :name = 'desc'
  < b-button :type = 'submit'
```

## Slots

The component supports one slot to provide:

1. `limit` to provide an informer to show how many symbols a user can type.

```
< b-textarea :maxLength = 20
  < template #limit = {limit, maxLength}
    < template v-if = limit < maxLength / 1.5
      Characters left: {{ limit }}
```

## API

Also, you can see the parent component and the component traits.

### Props

#### [extRowCount = 1]

How many rows need to add to extend the textarea height when it can't fit the entire content without showing a scrollbar.
The value of one row is equal to `line-height` of the textarea or `font-size`.

```
< b-textarea :extRowCount = 5
```

### Getters

#### height

Textarea height.

#### maxHeight

The maximum textarea height.

#### newlineHeight

Height of a newline.
It depends on `line-height/font-size` of the textarea.

#### limit

Number of remaining characters that the component can contain.

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

Checks that a component value must be filled.

```
< b-textarea :validators = ['required']
< b-textarea :validators = {required: {showMsg: false}}
```

##### pattern

Checks that a component value must be matched to the provided pattern.

```
< b-textarea :validators = {pattern: {pattern: '^[\\d$]+'}}
< b-textarea :validators = {pattern: {min: 10, max: 20}}
```
