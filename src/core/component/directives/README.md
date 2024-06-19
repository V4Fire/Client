# core/component/directives

This module provides a bunch of built-in directives for working with components and nodes.

_Please note that adding a directive to a component can negatively impact performance.
This is because having a directive on a component causes it to re-render every time the parent template
that uses this component is re-rendered._

## Built-in directives

* `core/component/directives/tag` - this directive allows you to dynamically specify the tag name to create.
* `core/component/directives/ref` - this directive enables you to create a reference (ref) to another component or element.
* `core/component/directives/hook` - with this directive, you can listen to any directive lifecycle hooks from a component.
* `core/component/directives/attrs` - this directive provides a way to set any input parameters to a component or tag based on a passed dictionary.
* `core/component/directives/render` - this directive allows you to create a composition of multiple functions that return VNodes, without the need for JSX.
* `core/component/directives/async-target` - this directive serves to mark the element where dynamically rendered fragments should be appended.

## Helpers

This module exports a range of helper functions for use with directives.

### getElementId

Returns the unique directive identifier for the passed element.

```typescript
import { ComponentEngine, VNode } from 'core/component/engines';
import { getElementId } from 'core/component/directives/helpers';

interface DirectiveParams {}

const
  elements = new WeakMap<Element, string>();

ComponentEngine.directive('example', {
  mounted(el: HTMLElement): void {
    const id = getElementId(el, elements);
  }
});
```

### getDirectiveContext

Returns the context of the component within which the directive is being used.

```typescript
import { ComponentEngine, VNode } from 'core/component/engines';
import { getDirectiveContext } from 'core/component/directives/helpers';

interface DirectiveParams {}

ComponentEngine.directive('example', {
  created(el: HTMLElement, params: DirectiveParams, vnode: VNode): void {
    ctx = getDirectiveContext(params, vnode);
  }
});
```

### getDirectiveComponent

Returns the context of the component to which the directive is applied.
If the directive is applied to a regular node instead of a component, `null` will be returned.

```typescript
import { ComponentEngine, VNode } from 'core/component/engines';
import { getDirectiveComponent } from 'core/component/directives/helpers';

interface DirectiveParams {}

ComponentEngine.directive('example', {
  created(el: HTMLElement, params: getDirectiveComponent, vnode: VNode): void {
    ctx = getDirectiveComponent(vnode);
  }
});
```
