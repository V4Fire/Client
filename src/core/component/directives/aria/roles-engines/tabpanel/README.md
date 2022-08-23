# core/component/directives/aria/roles-engines/tabpanel

This module provides an engine for `v-aria` directive.

The engine to set `tabpanel` role attribute.
The ARIA `tabpanel` is a container for the resources of layered content associated with a `tab`.

For more information go to [tabpanel](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tabpanel_role`).
For recommendations how to make accessible widget go to [tabpanel](`https://www.w3.org/WAI/ARIA/apg/patterns/tabpanel/`).

## API

The engine expects `label` or `labelledby` params to be passed.

Example:
```
< v-aria:tabpanel = {labelledby: 'id1'}
  < span :id = 'id1'
    // content
```

## Usage

```
< div v-aria:tabpanel = {label: 'content'}
```
