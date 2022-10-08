# core/component/directives/aria/roles/treeitem

This module provides an engine for `v-aria` directive.

The engine to set `treeitem` role attribute.
A `treeitem` is an item in a `tree`.

For more information go to [treeitem](`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/treeitem_role`).
For recommendations how to make accessible widget go to [treeitem](`https://www.w3.org/WAI/ARIA/apg/patterns/treeview/`).

## API

The role introduces several additional settings.

### [firstRootItem = `false`]

Whether the tree item is the first one in the root tree.

### [expandable = `false`]

Whether the tree item has children.

### [expanded = `false`]

Whether the tree item is expanded.

### [orientation]

Whether the widget orientation is `horizontal` or `vertical`.

### [rootElement]

the link to the root tree element.

### [toggleFold]

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
