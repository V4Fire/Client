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

## Adding new role engines
When creating a new role engine which handles some components events the contract of passed params types and naming should be respected.

The name of handlers in engine should be like `onChange`, `onOpen`, etc.
The name of property in passed params should be like `@change`, `@open`, etc.
Types of the property on passed params could be:
- `Function` that accepts callback parameter;
- `Promise`, so the handler will be passed in `.then` method;
- `String` that is the name of component's event, so the handler will be added as a listener to this event.
