# core/component/directives/aria/roles-engines/tabpanel

This module provides an engine for `v-aria` directive.

The engine to set `tabpanel` role attribute.
For more information go to [`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tabpanel_role`].
For recommendations how to make accessible widget go to [`https://www.w3.org/WAI/ARIA/apg/patterns/tabpanel/`].

## Usage

```
< &__foo v-aria:tabpanel = {...}

```

## How to use

Expects `label` or `labelledby` params to be passed.

Example:
```
< v-aria:tabpanel = {labelledby: 'id1'}
  < span :id = 'id1'
    // content
```
