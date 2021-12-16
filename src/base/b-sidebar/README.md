# base/b-sidebar

This module provides a component to create a sidebar with the feature of collapsing.

## Synopsis

* The component extends [[iData]].

* The component implements [[iVisible]], [[iOpenToggle]], [[iLockPageScroll]] traits.

* The component automatically synchronizes the `opened` modifier if the `globalName` prop is provided.

* The component supports the `overWrapper` layout.

* By default, the root tag of the component is `<aside>`.

## Modifiers

| Name     | Description             | Values    | Default |
|----------|-------------------------|-----------|---------|
| `opened` | The component is opened | `boolean` | `false` |

Also, you can see the implemented traits or the parent component.

## Events

| EventName | Description                   | Payload description | Payload |
|-----------|-------------------------------|---------------------|---------|
| `open`    | The component has been opened | -                   | -       |
| `close`   | The component has been closed | -                   | -       |

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

The component supports the `default` slot to provide content.

```
< b-sidebar
  Sidebar content
```

## API

Also, you can see the implemented traits or the parent component.

### Props

#### [lockPageScroll = `false`]

If true, then will be blocked the document' scrolling when the component is opened.

```
< b-sidebar :lockPageScroll = true
```

#### [forceInnerRender = `true`]

If false, the inner content of the component won't be rendered if the component isn't opened.

```
< b-sidebar :forceInnerRender = false
```

## Styles

The component has the `sidebarTransition` style property to specify the transition behavior when opening or closing.

```stylus
$p = {
  sidebarTransition: EASING_DURATION linear
}

b-sidebar extends i-data
```
