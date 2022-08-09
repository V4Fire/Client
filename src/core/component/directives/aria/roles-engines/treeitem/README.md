# core/component/directives/aria/roles-engines/treeitem

This module provides an engine for `v-aria` directive.

The engine to set `treeitem` role attribute.
For more information go to [`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/treeitem_role`].

For recommendations how to make accessible widget go to [`https://www.w3.org/WAI/ARIA/apg/patterns/treeview/`].

Expects `iAccess` trait to be realized.

## Usage

```
< &__foo v-aria:treeitem = {...}

```
