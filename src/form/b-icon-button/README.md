# form/b-icon-button

Component to create a button based on icon.
The component simply extends [[bButton]], but overrides layout and slots.

## Synopsis

* The component extends [[bButton]].

* The component is used as functional if there are no provided `dataProvider` and `href` props.

* The component can be used as flyweight.

* By default, the root tag of the component is `<span>`.

* The component supports tooltips.

* The component has `skeletonMarker`.

## Modifiers

See the parent component and the component traits.

## Events

See the parent component and the component traits.

## Usage

The component has four base scenarios of usage:

### A simple button with a custom event handler

```
< b-icon-button @click = console.log('The button was clicked')
  < img :src = require('asses/my-icon.svg')
```

### A trigger for the tied form

```
< b-form
  < b-input :name = 'fname'
  < b-input :name = 'lname'
  < b-icon-button :type = 'submit' | :icon = 'submit'
```

### A link

```
< b-icon-button :type = 'link' | :href = 'https://google.com' | :icon = 'google'
```

### Providing a custom data provider

```
/// Get data from a provider
< b-icon-button :dataProvider = 'MyProvider'
  < img :src = require('asses/my-icon.svg')

/// Add data by using default provider and custom URL
< b-icon-button :href = '/add-to-friend' | :method = 'add' | :icon = 'add'
  < template #default = {icon}
    < img :src = icon
```

## Slots

The component supports providing the `default` slot.

```
< b-icon-button
  < img :src = require('asses/my-icon.svg')

< b-icon-button :icon = 'add'
  < template #default = {icon}
    < img :src = icon
```

## API

See the parent component and the component traits.
