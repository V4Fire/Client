# core/component/ref

This module provides an API to resolve component refs.

## What problem is being solved?

V4Fire defines its own component type, functional components.
Components of this type can use states, but any changes to them cannot cause re-render.
From the point of view of the used component library, such components are just some trees of virtual nodes.
So when we add a ref attribute to such a component, it will refer to the component DOM node.
This module provides an API that fixes this, i.e. refs will link to component contexts, just like regular components.

## Functions

### resolveRefs

Resolves ref attributes from the specified component instance.
This function replaces refs from component DOM nodes to the component instance.
Also, this function fires events of refs appearances.
