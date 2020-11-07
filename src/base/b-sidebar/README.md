# base/b-sidebar

This module provides a component to show content in the sidebar.

## Synopsis

* The component extends [[iData]].

* The component implements [[iVisible]], [[iOpenToggle]], [[iLockPageScroll]] traits.

* By default, the root tag of the component is `<div>`.

## Events

| EventName  | Description            | Payload description | Payload  |
| ---------- |----------------------- | ------------------- |--------- |
| `open`     | Opens the sidebar      |                     |          |
| `close`    | Closes the sidebar     |                     |          |

## Usage

```
< b-sidebar ref = sidebar
  Sidebar content
```

```
< span @click = $refs.sidebar.open()
  Open sidebar

< span @click = $refs.sidebar.close()
  Close sidebar
```

## Slots

1. `default` to provide the base content.

```
< b-sidebar
  Sidebar content
```