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

## Modifiers

| Name    | Description                                               | Values    | Default |
| ------- | --------------------------------------------------------- | ----------| ------- |
| `upper` | The component displays the text content in the upper case | `Boolean` | -       |

Also, you can see the parent component and the component traits.

## Events

| EventName | Description                               | Payload description | Payload      |
| --------- | ----------------------------------------- | ------------------- | ------------ |
| `click`   | Click to the component                    | `Event` object      | `Event`      |
| `change`  | A list of selected files has been changed | `InputEvent` object | `InputEvent` |

Also, you can see the parent component and the component traits.

## Usage

The component has four base scenarios of usage:

### A simple button with a custom event handler

```
< b-button @click = console.log('The button was clicked')
  Click on me!
```

### A trigger for the tied form

```
< b-form
  < b-input :name = 'fname'
  < b-input :name = 'lname'

  < b-button :type = 'submit'
    Submit
```

### Uploading a file

```
< b-button :type = 'file' | @onChange = console.log($event)
  Upload a file
```

### A link

```
< b-button :type = 'link' | :href = 'https://google.com'
  Go to google
```

### Providing a custom data provider

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

1. `default` to provide the base content.

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

4. `progressIcon` to inject an icon that indicates loading, by default, is used [[bProgressIcon]].

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

## API

Also, you can see the parent component and the component traits.

### Props

#### [type = `'button'`]

A button' type to create. There can be values:

1. `button` - simple button control;
2. `submit` - button to send the tied form;
3. `file` - button to open the file uploading dialog;
4. `link` - hyperlink to the specified URL (to provide URL, use the `href` prop).

```
< b-button @click = console.log('boom!')
  Make boom!

< b-button :type = 'file' | @onChange = console.log($event)
  Upload a file

< b-button :type = 'link' | :href = 'https://google.com'
  Go to Google

< b-form
  < b-input :name = 'name'
  < b-button :type = 'submit'
    Send
```

#### [accept]

If the `type` prop is passed to `file`, this prop defines which file types are selectable in a file upload control.
[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefaccept).

```
< b-button :type = 'file' | :accept = '.txt' | @onChange = console.log($event)
  Upload a file
```

#### [href]

If the `type` prop is passed to `link`, this prop contains a value for `<a href>`.
Otherwise, the prop includes a base URL for a data provider.

```
< b-button :type = 'link' | :href = 'https://google.com'
  Go to Google

< b-button :href = '/generate/user'
  Generate a new user
```

#### [method = 'get']

A data provider method to use if `dataProvider` or `href` props are passed.

```
< b-button :href = '/generate/user' | :method = 'put'
  Generate a new user

< b-button :dataProvider = 'Cities' | :method = 'peek'
  Fetch cities
```

#### [form]

A string specifying the `<form>` element with which the component is associated (that is, its form owner).
This string's value, if present, must match the id of a `<form>` element in the same document.
If this attribute isn't specified, the component is associated with the nearest containing form, if any.

The form prop lets you place a component anywhere in the document but have it included with a form elsewhere in the document.
[See more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefform)

```
< b-input :name = 'fname' | :form = 'my-form'

< b-button type = 'submit' | :form = 'my-form'
  Submit

< form id = my-form
```

#### [preIcon]

An icon to show before the button text.

```
< b-button :preIcon = 'dropdown'
  Submit
```

#### [preIconComponent = `'b-icon'`]

A name of the used component to show `preIcon`.

```
< b-button :preIconComponent = 'b-my-icon'
  Submit
```

#### [icon]

An icon to show after the button text.

```
< b-button :icon = 'dropdown'
  Submit
```

#### [iconComponent = `'b-icon'`]

A name of the used component to show `icon`.

```
< b-button :iconComponent = 'b-my-icon'
  Submit
```

#### [progressIcon = `b-progress-icon`]

A component to show "in-progress" state or
Boolean, if need to show progress by slot or `b-progress-icon`.

```
< b-button :progressIcon = 'b-my-progress-icon'
  Submit
```

#### [hint]

A tooltip text to show during hover the cursor.

```
< b-button :hint = 'Click on me!!!'
  Submit
```

#### [hintPos]

Tooltip position to show during hover the cursor.
See [[gIcon]] for more information.

```
< b-button :hint = 'Click on me!!!' | :hintPos = 'bottom-right'
  Submit
```

#### [dropdown = `'bottom'`]

The way to show dropdown if the `dropdown` slot is provided.

```
< b-button :dropdown = 'bottom-right'
  < template #default
    Submit

  < template #dropdown
    Additional information...
```

### Getters

#### files

A list of selected files (works with the `file` type).

### Methods

#### reset

If the `type` prop is passed to `file`, resets a file input.
