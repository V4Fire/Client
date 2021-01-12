# base/b-window

This module provides a component to create a modal window.

## Synopsis

* The component extends [[iData]].

* The component implements [[iVisible]], [[iWidth]], [[iOpenToggle]], [[iLockPageScroll]] traits.

* The component locks background scrolling when opened.

* The component sets the root `opened` modifier on opening/closing.

* The component automatically closed by a click at the "outside" place.

* The component automatically places itself within the document body.

* By default, the root tag of the component is `<div>`.

## Modifiers

| EventName    | Description                              | Values                  | Default   |
| ------------ | ---------------------------------------- | ----------------------- | --------- |
| `opened`     | The component is opened                  | `boolean`               | `false`   |
| `position`   | Value of the `position` style property   | `'fixed' \| 'absolute'` | `'fixed'` |

Also, you can see the implemented traits or the parent component.

## Events

| EventName  | Description                   | Payload description | Payload  |
| ---------- | ----------------------------- | ------------------- | -------- |
| `open`     | The component has been opened | -                   | -        |
| `close`    | The component has been closed | -                   | -        |

Also, you can see the implemented traits or the parent component.

## Usage

```
< b-window ref = window
  Window content
```

```
< span @click = $refs.window.open()
  Open the window

< span @click = $refs.window.close()
  Close the window

< span @click = $refs.window.toggle()
  Toggle the window
```

## Slots

The component supports a bunch of slots to provide:

1. `default` to override the default component layout.

```
< b-window
  Window content
```

```
< b-window
  < template #default = {ctx}
    < .title
      {{ ctx.title }}

    < .content
      Window content
```

Please note that when using this slot,
other slots become unavailable to you since the default slot will overwrite all other slots.

2. `title` to provide a window title.

```
< b-window
  < template #title
    Title
```

```
< b-window
  < template #title = {title}
    < span.title
      {{ title }}
```

3. `body` to provide the main window content.

```
< b-window :title = 'Title'
  < template #body
    Main content
```

4. `controls` to provide additional controls like buttons to hide/unhide.

```
< b-window
  < template #title
    Title

  < template #body
    Main content

  < template #controls = {ctx}
    < button @click = ctx.close()
      Close the window
```

By default, the component defines a control to close the window.

### Third-party slots

The component allows decomposing different window templates into separate files with the special `.window` postfix.
All those templates are automatically loaded, but you must provide their name to activate one or another.

**my-page/upload-avatar.window.ss**

```
- namespace b-window

- eval
 /// Register an external block
 ? @@saveTplDir(__dirname, 'windowSlotUploadAvatar')

/// Notice, to correct work the external block name must start with "windowSlot"
- block index->windowSlotUploadAvatar(nms)
  /// The `nms` value is taken from a basename of this file directory
  /// .my-page
  < ?.${nms}
    < button.&__button
      Upload an avatar
```

```
/// This component will use a template from windowSlotUploadAvatar
< b-window :slotName = 'windowSlotUploadAvatar'
```

If you want to disable this feature in child components of `bWindow`,
you should override the constant `thirdPartySlots` to false.

```
- namespace [%fileName%]

- include 'base/b-window'|b as placeholder

- template index() extends ['b-window'].index
  - thirdPartySlots = false
```

## Styles

The component has the `zIndexPos` style property to specify `z-index` of the component.
Supported values: `layer`, `modal`, `overall`.

```stylus
$p = {
  zIndexPos: overall
}

b-window extends i-data
```

## API

The component provides a bunch of methods to open/close/toggle the window: `open` , `close`, `toggle`.
Also, it provides methods to lock/unlock background scrolling: `lock`. `unlock`
(the component automatically locks background scrolling when opened).

### title

By using this prop, you can provide a string that will be used as the window title.
Notice that you can use a slot to provide a title too.

```
< b-window :title = 'Title'
  < template #body
    Main content

< b-window
  < template #title
    Title

  < template #body
    Main content

< b-window
  < template #title = {title}
    < span.title
      {{ title }}

  < template #body
    Main content
```

### stageTitles

Map window titles tied to the component `stage` values. A key with the name `[[DEFAULT]]` is used by default.
If a key value is defined as a function, it will be invoked (the result will be used as a title).

```
< b-window &
  :dataProvider = 'User' |
  :stageTitles = {
    '[[DEFAULT]]': 'Default title',
    'uploading': 'Uploading the avatar...',
    'edit': (ctx) => `Edit a user with the identifier ${ctx.db?.id}`
  }
.
```

### forceInnerRender

If false, the inner content of the component won't be rendered if the component isn't opened.

```
< b-window :forceInnerRender = false
```

### slotName

Name of the active third-party slot to show.

This feature brings a possibility to decompose different window templates into separate files
with the special `.window` postfix. All those templates are automatically loaded, but you must provide their
name to activate one or another.

### open

When opening the window, you can specify at which `stage` the component should switch in.

```
< b-window ref = window
  Window content
```

```
< span @click = $refs.window.open('loading')
  Open the window
```
