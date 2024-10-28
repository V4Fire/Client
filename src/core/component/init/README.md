# core/component/init

This module provides a bunch of functions to register components and initialize their states.
Basically, this API is used by adaptors of component libraries, and you don't need to use it manually.

## Registering a component

V4Fire provides the ability to describe components using native JavaScript classes and decorators,
instead of using the API of the component library being used.
But to convert a component from a class form to a form understood by the used component library,
it is necessary to register the component.

Registering a component in V4Fire is a lazy and one-time operation. That is, the component is only registered when
it is actually used in the template. Once a component has been registered once, it can already be used
by the component library as if it had been explicitly declared using the library's API.

#### registerParentComponents

Registers parent components for the given one.
The function returns false if all parent components are already registered.

#### registerComponent

Register a component by the specified name.
The function returns the metaobject of the created component, or undefined if the component isn't found.
If the component is already registered, it won't be registered twice.
Keep in mind that you must call `registerParentComponents` before calling this function.

## State initializers

All lifecycle hooks have special initialization methods. These methods must be called within the hook handlers
they are associated with. Typically, this is done by the adapter of the used component library.

```typescript
import * as init from 'core/component/init';

import { implementComponentForceUpdateAPI } from 'core/component/render';
import { getComponentContext } from 'core/component/context';

import type { ComponentEngine, ComponentOptions } from 'core/component/engines';
import type { ComponentMeta } from 'core/component/interface';

export function getComponent(meta: ComponentMeta): ComponentOptions<typeof ComponentEngine> {
  return {
    // ... other component properties

    beforeCreate(): void {
      init.beforeCreateState(this, meta, {implementEventAPI: true});
      implementComponentForceUpdateAPI(this, this.$forceUpdate.bind(this));
    },

    created(): void {
      init.createdState(getComponentContext(this));
    },

    beforeMount(): void {
      init.beforeMountState(getComponentContext(this));
    },

    mounted(): void {
      init.mountedState(getComponentContext(this));
    },

    beforeUpdate(): void {
      init.beforeUpdateState(getComponentContext(this));
    },

    updated(): void {
      init.updatedState(getComponentContext(this));
    },

    activated(): void {
      init.activatedState(getComponentContext(this));
    },

    deactivated(): void {
      init.deactivatedState(getComponentContext(this));
    },

    beforeUnmount(): void {
      init.beforeDestroyState(getComponentContext(this));
    },

    unmounted(): void {
      init.destroyedState(getComponentContext(this));
    },

    errorCaptured(...args: unknown[]): void {
      init.errorCapturedState(getComponentContext(this), ...args);
    },

    renderTriggered(...args: unknown[]): void {
      init.errorCapturedState(getComponentContext(this), ...args);
    }
  };
}
```
