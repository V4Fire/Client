# core/component/render

This module offers a bunch of functions for creating and manipulating VNodes.

## Wrappers

These wrappers are intended to be used for encapsulating the original component library functions:

* `wrapCreateVNode` – a wrapper for the `createVNode` function of the component library;
* `wrapCreateElementVNode` – a wrapper for the `createElementVNode` function of the component library;
* `wrapCreateBlock` – a wrapper for the `createBlock` function of the component library;
* `wrapCreateElementBlock` – a wrapper for the `createElementBlock` function of the component library;
* `wrapResolveComponent` – a wrapper for the `resolveComponent` or `resolveDynamicComponent` functions of the component library;
* `wrapResolveDirective` – a wrapper for the `resolveDirective` function of the component library;
* `wrapRenderList` – a wrapper for the `renderList` function of the component library;
* `wrapRenderSlot` – a wrapper for the `renderSlot` function of the component library;
* `wrapWithDirectives` – a wrapper for the `withDirectives` function of the component library.

## Helpers

### resolveAttrs

Resolves values from special attributes of the given VNode.

```js
// `.componentId = 'id-1'`
// `.componentName = 'b-example'`
// `.classes = {'elem-name': 'alias'}`
const ctx = this;

// {props: {class: 'id-1 b-example alias'}}
resolveAttrs.call(ctx, {
  props: {
    'data-cached-class-component-id': '',
    'data-cached-class-provided-classes-styles': 'elem-name',
    'data-cached-dynamic-class': '[self.componentName]'
  }
})
```

### setVNodePatchFlags

Assigns the specified values to the `patchFlag` and `shapeFlag` properties of the provided VNode.

```js
setVNodePatchFlags(vnode, 'props', 'styles', 'children');
```

### normalizeClass

Normalizes the provided CSS classes and returns the resulting output.

### normalizeStyle

Normalizes the provided CSS styles and returns the resulting output.

### parseStringStyle

Analyzes the given CSS style string and returns a dictionary containing the parsed rules.

### normalizeComponentAttrs

Normalizes the passed VNode's attributes using the specified component metaobject and returns a new object.

### mergeProps

Merges the specified props into one and returns a single merged prop object.
