# core/component/directives/aria/roles-engines/tab

This module provides an engine for `v-aria` directive.

The engine to set `tab` role attribute.
For more information go to [`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role`].
For recommendations how to make accessible widget go to [`https://www.w3.org/WAI/ARIA/apg/patterns/tabpanel/`].

## Usage

```
< &__foo v-aria:tab = {...}

```

## How to use

Tabs expect the `controls` role engine to be added in addition. ID passed to `controls` engine should be the id of the element with role `tabpanel`.

Example:
```
< button v-aria:tab | v-aria:controls = {for: 'id1'}

< v-aria:tabpanel = {labelledby: 'id2'} | :id = 'id1'
  < span :id = 'id2'
    // content
```
