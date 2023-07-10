# components/form/b-icon-button

This module provides a component for creating a button based on a given graphical icon.
In fact, this is a regular [[bButton]] component, but with changed markup and styles for buttons without text.

## Synopsis

* The component extends [[bButton]].

* The component is used as functional if there are no provided `dataProvider` and `href` props.

* By default, the component's root tag is set to `<span>`.

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

### A trigger for a form

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

### A trigger for a data provider

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
