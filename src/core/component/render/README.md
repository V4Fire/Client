# core/component/render

This module provides a bunch of functions to create and work with VNode-s.

## Wrappers

These wrappers should be used to wrap the original component library functions.

* `wrapCreateVNode` - a wrapper for the component library `createVNode` function;
* `wrapCreateElementVNode` - a wrapper for the component library `createElementVNode` function;
* `wrapCreateBlock` - a wrapper for the component library `createBlock` function;
* `wrapCreateElementBlock` - a wrapper for the component library `createElementBlock` function;
* `wrapResolveComponent` - a wrapper for the component library `resolveComponent` or `resolveDynamicComponent` functions;
* `wrapRenderList` - a wrapper for the component library `renderList` function;
* `wrapWithDirectives` - a wrapper for the component library `withDirectives` function.
