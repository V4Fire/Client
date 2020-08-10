# form/b-button

This module provides a component to create a button.

## Synopsis

* The component extends [[iData]].

* The component implements [[iAccess]], [[iOpenToggle]], [[iVisible]], [[iWidth]], [[iSize]] traits.

* The component is used as functional if there are no provided `dataProvider` and `href` props.

* The component can be used as flyweight.

* By default, the root tag of the component is `<span>`.

* The component supports tooltips.

* The component has `skeletonMarker`.

## Events

| EventName  | Description            | Payload description | Payload  |
| ---------- |----------------------- | ------------------- |--------- |
| `click`    | Click to the component | `Event` object      | `Event`  |

## Usage

The component have four base scenarios of usage:

1. A simple button with custom event handler.

```
< b-button @click = console.log('The button was clicked')
  Click on me!
```

2. The trigger for a tied form.

```
< b-form
  < b-input :name = 'fname'
  < b-input :name = 'lname'

  < b-button :type = 'submit'
    Submit
```

3. A link.

```
< b-button :type = 'link' | :href = 'https://google.com'
  Go to google
```

4. With a custom data provider.

```
/// Get data from a provider
< b-button :dataProvider = 'MyProvider'
  Go

/// Add data by using default provider and custom URL
< b-button :href = '/add-to-friend' | :method = 'add'
  Add to friend
```

## Slots

The component supports a bunch of slots to provide:

1. `default` to provide base content.

```
< b-button
  Click on me!
```

2. `dropdown` to provide additional dropdown content.

```
< b-button
  < template #default
    Click on me!

  < template #dropdown
    Additional data
```

3. `preIcon` and `icon` to inject icons around the value block.

```
< b-button
  < template #preIcon
    < img src = expand.svg

  < template #default
    Click on me!
```

Also, these icons can be provided by props.

```
< b-button :icon = 'expand'
  Click on me!

< b-button :icon = 'expand' | :iconComponent = 'b-custom-icon'
  Click on me!

< b-button
  < template #icon = {icon}
    < img :src = icon

  < template #default
    Click on me!
```

4. `progressIcon` to inject an icon that indicates loading, by default is used [[bProgressIcon]].

```
< b-button
  < template #progressIcon
    < img src = spinner.svg

  < template #default
    Click on me!
```

Also, this icon can be provided by a prop.

```
< b-button :progressIcon = 'bCustomLoader'
  Click on me!
```
