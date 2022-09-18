# core/component/directives/aria/roles/tablist

This module provides an engine for `v-aria` directive.

The engine to set `tablist` role attribute.
The `tablist` role identifies the element that serves as the container for a set of `tabs`. The `tab` content are referred to as `tabpanel` elements.

For more information go to [tablist](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tablist_role`).
For recommendations how to make accessible widget go to [tablist](`https://www.w3.org/WAI/ARIA/apg/patterns/tabpanel/`).

## API

The role introduces several additional settings.

### [multiselectable = `false`]

Whether the widget supports a feature of multiple active items

### [orientation]

Whether the widget orientation is `horizontal` or `vertical`.

The role expects the component to realize`iAccess` trait.

## Usage

```
< div v-aria:tablist = { &
    isMultiple: multiple;
	  orientation: orientation;
  }
.
```
