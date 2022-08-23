# core/component/directives/aria/roles-engines/tablist

This module provides an engine for `v-aria` directive.

The engine to set `tablist` role attribute.
The `tablist` role identifies the element that serves as the container for a set of `tabs`. The `tab` content are referred to as `tabpanel` elements.

For more information go to [tablist](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tablist_role`).
For recommendations how to make accessible widget go to [tablist](`https://www.w3.org/WAI/ARIA/apg/patterns/tabpanel/`).

## API

The engine expects specific parameters to be passed.
- `isMultiple`:`boolean`.
If true widget supports multiple selected options.
- `orientation`: `string`.
The tablist widget view orientation.

The engine expects the component to realize`iAccess` trait.

## Usage

```
< div v-aria:tablist = { &
    isMultiple: multiple;
	  orientation: orientation;
  }
.
```
