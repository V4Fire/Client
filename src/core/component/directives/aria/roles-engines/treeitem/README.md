# core/component/directives/aria/roles-engines/treeitem

This module provides an engine for `v-aria` directive.

The engine to set `treeitem` role attribute.
A `treeitem` is an item in a `tree`.

For more information go to [treeitem](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/treeitem_role`).
For recommendations how to make accessible widget go to [treeitem](`https://www.w3.org/WAI/ARIA/apg/patterns/treeview/`).

## API

The engine expects specific parameters to be passed.
- `isFirstRootItem`: `boolean`.
If true the item is first one in the root tree.
- `isExpandable`: `boolean`.
If true the item has children and can be expanded.
- `isExpanded`: `boolean`.
If true the item is expanded in the current moment.
- `orientation`: `string`.
The tablist widget view orientation.
- `rootElement`: `Element`.
The link to the root tree element.
- `toggleFold`: `function`.
The function to toggle the expandable item.

The engine expects the component to realize`iAccess` trait.

## Usage

```
< div v-aria:treeitem = { &
    isFirstRootItem: el === top;
    isExpandable: el.children != null;
    isExpanded: !el.folded;
    orientation: 'orientation';
    rootElement?: top;
    toggleFold: () => ...;
  }
.
```
