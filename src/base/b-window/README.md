# base/b-window

This module provides a component to create a modal window.

## Synopsis

* The component extends [[iData]].

* The component implements [[iVisible]], [[iWidth]], [[iOpenToggle]], [[iLockPageScroll]] traits.

* By default, the root tag of the component is `<div>`.

## Modifiers

| EventName    | Description                              | Values    | Default |
| ------------ | ---------------------------------------- | --------- | ------- |
| `opened`     | The component is opened                  | `boolean` | `false` |
| `position`   | Value of the `position` style property   | `string`  | `fixed` |

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

1. `default` to provide the base content.

```
< b-window
  Window content
```

Please note that when using this slot, other slots become unavailable to you since the default slot will overwrite all other slots.

2. `title` to provide the title.

```
< b-window
  < template #title
    Title
```

3. `body` to provide the main content.

```
< b-window
  < template #title
    Title

  < template #body
    Main content
```

4. `controls` to provide controls.

```
< b-window
  < template #title
    Title

  < template #body
    Main content

  < template #controls
    Controls
```

## Styles

The component has `zIndexPos` style property to specify the z-index of the component.

```stylus
$p = {
  zIndexPos: overall
}

b-window extends i-data
```
