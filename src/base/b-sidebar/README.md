# base/b-sidebar

This module provides a component to create a sidebar with the feature of collapsing.

## Synopsis

* The component extends [[iData]].

* The component implements [[iVisible]], [[iOpenToggle]], [[iLockPageScroll]] traits.

* The component supports the `overWrapper` layout.

* By default, the root tag of the component is `<div>`.

## Modifiers

| EventName  | Description             | Values    | Default |
| ---------- | ----------------------- | --------- | ------- |
| `opened`   | The component is opened | `Boolean` | `false` |

Also, you can see the implemented traits or the parent component.

## Events

| EventName  | Description                   | Payload description | Payload  |
| ---------- | ----------------------------- | ------------------- | -------- |
| `open`     | The component has been opened | -                   | -        |
| `close`    | The component has been closed | -                   | -        |

Also, you can see the implemented traits or the parent component.

## Usage

```
< b-sidebar ref = sidebar
  Sidebar content
```

```
< span @click = $refs.sidebar.open()
  Open the sidebar

< span @click = $refs.sidebar.close()
  Close the sidebar

< span @click = $refs.sidebar.toggle()
  Toggle the sidebar
```

## Slots

The component supports the default slot to provide content.

```
< b-sidebar
  Sidebar content
```

## Styles

The component has `sidebarTransition` style property to specify the transition behavior when opening or closing.

```stylus
$p = {
  sidebarTransition: EASING_DURATION linear
}

b-sidebar extends i-data
```
