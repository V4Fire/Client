# form/b-select-date

This module provides a component to create a form component to specify a date by using select-s.

## Synopsis

* The component extends [[iInput]].

* The component implements the [[iWidth]] traits.

* The component is used as functional if there is no provided the `dataProvider` prop.

* By default, the root tag of the component is `<span>`.

* The component contains an `<input>` tag within.

* The component has `skeletonMarker`.

## Modifiers

See the parent component and the component traits.

## Events

See the parent component and the component traits.

## Usage

```
< b-select-date
< b-select-date :value = Date.create('today')
```

## API

Also, you can see the parent component and the component traits.

### Props

#### [native = `browser.is.mobile`]

If true, the select components will use a native tag to show the select.
