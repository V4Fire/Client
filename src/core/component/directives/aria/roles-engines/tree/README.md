# core/component/directives/aria/roles-engines/tree

This module provides an engine for `v-aria` directive.

The engine to set `tree` role attribute.
A `tree` is a widget that allows the user to select one or more items from a hierarchically organized collection.

For more information go to [tree](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tree_role`).
For recommendations how to make accessible widget go to [tree](`https://www.w3.org/WAI/ARIA/apg/patterns/treeview/`).

## API

The engine expects specific parameters to be passed.
- `isRoot`: `boolean`.
If true current tree is the root tree in the component.
- `orientation`: `string`.
The tablist widget view orientation.
- `@change`:`HandlerAttachment`, see `core/component/directives/aria/roles-engines/README.md`.
Internal callback `onChange` expects an `Element` and `boolean` value if current tree is expanded.

The engine expects the component to realize`iAccess` trait.

## Usage

```
< div v-aria:tree = { &
    isRoot: boolean = false;
    orientation: string = 'false';
    '@change': HandlerAttachment = () => undefined;
  }
.
```
