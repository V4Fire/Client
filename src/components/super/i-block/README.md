# components/super/i-block

This module provides a super class for any V4Fire components.
This class contains the most necessary APIs, such as: event API, modifiers API, state and life cycle API, property watching API, etc.
The functionality is divided into several parts: the behavior that the class itself declares and the many friendly classes that work through composition.
Also, this module re-exports part of the functionality and types from the `core/component` module.

```typescript
import iBlock, { component, prop, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @prop(Number)
  a: number;

  @prop(Number)
  b: number;

  @field(ctx => ctx.a + ctx.b)
  result: number;
}
```

## Related docs

Please read the submodule documents of this.

* `components/super/i-block/base` - the module provides a common API to work with components.
* `components/super/i-block/event` - the module provides an event emitter API to work with components.
* `components/super/i-block/mods` - the module provides an API to work with a component in terms of [BEM](https://en.bem.info/methodology/quick-start/).
* `components/super/i-block/state` - the module provides an API for convenient work with component states.
* `components/super/i-block/providers` - the module provides an API for initializing and loading external data to a component.
* `components/super/i-block/decorators` - the module re-exports the base decorators from `core/component/decorators` and also provides additional decorators.

## Friendly classes

The `iBlock` class has many properties that delegate functionality to other modules.
Some of these properties can be used anywhere, and some only within the class or its descendants.
For more information on any of these properties, refer to their module documentation.

### Public

* `provide` (`components/friends/provide`) - a class with methods to provide component classes/styles to another component, etc.
* `field` (`components/friends/field`) - a class with helper methods for safely accessing component/object properties.
* `analytics` (`components/friends/analytics`) - a class to send component analytic events.
* `sync` (`components/friends/sync`) - an API to synchronize fields and props of the component.
* `asyncRender` (`components/friends/async-render`) - a class to render component fragments asynchronously.
* `vdom` (`components/friends/vdom`) - a class for low-level working with a component VDOM tree.
* `lfc` (`components/super/i-block/modules/lfc`) - a class with helper methods to work with the component life cycle.

### Protected

* `daemons` (`components/friends/daemons`) - a class to create daemons associated with a component.
* `block` (`components/friends/block`) - an API to work with a component in terms of [BEM](https://en.bem.info/methodology/quick-start/).
* `dom` (`components/friends/dom`) - a class for low-level working with a component DOM tree.

* `async` (`core/async`) - an API to tie and control async operations.
* `$async` (`core/async`) - an API to tie and control async operations (this API is used for protected/private consumers,
   such as private directives or component engines).

* `storage` (`components/friends/storage`) - a class for persistent storage of component data.
* `state` (`components/friends/state`) - a class with methods to initialize a component state from various related sources.

* `moduleLoader` (`components/friends/module-loader`) - a class to manage dynamically loaded modules.
* `opt` (`components/super/i-block/modules/opt`) - a class with helper methods to optimize component rendering.
* `browser` (`core/helpers`) - an API to determine the current browser name/version.

* `h` (`core/helpers`) - a dictionary with some helper functions.
* `l` - a link to the `globalThis.l` function.

* `location` - a link to the native `location` API.
* `global` - a link to the global object.
* `console` - a link to the native `console` API.

## Props

### [globalName]

The unique or global name of the component.
Used to synchronize component data with different external storages.

### [rootTag = `'div'`]

The component root tag type.

### [verbose = `false`]

If true, the component will log informational messages, not just errors and warnings.
This option affects the messages output by the `log` method.

### [stageProp]

A string value that specifies in which logical state the component should run.

This property can be used to indicate different states of a component.
For instance, we have a component that implements an image upload form. And, we have two options for this form:
upload from a link or upload from a computer.

Therefore, we can create two stage values: "link" and "file", in order to separate the component template into two
markup options depending on the stage value.

### [modsProp]

Additional modifiers for the component.
Modifiers allow binding component state properties directly to CSS classes without
unnecessary re-rendering of a component.

### [activatedProp = `true`]

If true, the component is activated by default.
A deactivated component won't load data from providers on initialization.

### [forceActivation = `false`]

If true, forced activation of handlers is enabled (only for functional components).
By default, functional components do not execute activation handlers: router/storage synchronization, etc.

### [reloadOnActivation = `false`]

If true, then the component will try to reload provider data on reactivation.
This parameter can be useful if you are using the `keep-alive` directive in your template.
For example, you have a page in keep-alive, and after returning to this page, the component will be
force-rendered from the keep-alive cache, but after that, the page will silently try to reload its data.

### [renderOnActivation = `false`]

If true, the component is forced to re-render on reactivation.
This parameter can be useful if you are using the keep-alive directive in your template.

### [dependenciesProp = `[]`]

A list of additional dependencies to load when the component is initializing

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import type { Module } from 'components/friends/module-loader';

@component()
class bExample extends iBlock {
  // Asynchronously load the following components
  override dependenciesProp: Module[] = [
    {name: 'b-button', load: () => import('components/form/b-button')},
    {name: 'b-input', load: () => import('components/form/b-input')}
  ];
}
```

### [remoteProvider = `false`]

If true, the component is marked as a removed provider.
This means that the parent component will wait for the current component to load.

### [dontWaitRemoteProvidersProp]

If true, the component will skip waiting for remote providers to avoid redundant re-rendering.
This prop can help optimize your non-functional component when it does not contain any remote providers.
By default, this prop is automatically calculated based on component dependencies.

### [syncRouterStoreOnInit = `false`]

If true, the component state will be synchronized with the router after initializing.
For example, you have a component that uses the `syncRouterState` method to create two-way binding with the router.

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field()
  stage: string = 'defaultStage';

  syncRouterState(data?: Dictionary) {
    // This notation means that if there is a value within `route.query`
    // it will be mapped to the component as `stage`.
    // If the route has been changed, the mapping is repeated.
    // Also, if the `stage` field of the component has been changed,
    // it will be mapped to the router query parameters as `stage` by using `router.push`.
    return {stage: data?.stage || this.stage};
  }
}
```

But, if in some cases we don't have `stage` in `route.query`, and the component has a default value,
we trap in a situation where there is a route that has not been synchronized with the component.
This can affect the "back" navigation logic. Sometimes this behavior does not meet our expectations.
But if we switch `syncRouterStoreOnInit` to true, the component will force its state to be synchronized with
the router after initialization.

### [watchProp]

A dictionary with remote component watchers. The use of this mechanism is similar to the `@watch` decorator:

1. As a key, we declare the component method name we want to call;
2. As a value, we declare the property path or event that we want to watch or listen to.
   Also, the method can take additional observation parameters.
   Keep in mind that properties or events are taken from the component that contains the current one.

```js
// We have two components: A and B.
// We want to declare that component B must call its own `reload` method on an event from component A.

{
  // If we want to listen for events, we should use the ":" syntax.
  // Also, we can provide a different event emitter as `link:`,
  // for instance, `document:scroll`
  reload: ':foo'
}
```

```js
// We can attach multiple watchers for one method

{
  reload: [
    // Listens the `foo` event from `A`
    ':foo',

    // Watches for changes to the `A.bla` property
    'bla',

    // Listens the `window.document` `scroll` event,
    // does not provide event arguments to `reload`
    {
      path: 'document:scroll',
      provideArgs: false
    }
  ]
}
```

### [proxyCall = `false`]

If true, the component will listen to the `callChild` special event on its parent.
The event handler will receive as a payload an object that implements the `CallChild` interface.

```typescript
interface CallChild<CTX extends iBlock = iBlock> {
  if(ctx: CTX): AnyToBoolean;
  then(ctx: CTX): Function;
}
```

The `if` function allows you to specify which components should handle this event.
If the check is successful, then the `then` method will be called with the handler component context as an argument.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import type { Module } from 'components/friends/module-loader';

@component()
class bExample extends iBlock {
  mounted() {
    // Reload all child iData components
    this.emit('callChild', {
      if: (ctx) => ctx.instance instanceof iData,
      then: (ctx) => ctx.reload()
    });
  }
}
```

### [dispatching = `false`]

If true, then the component event dispatching mode is enabled.

This means that all component events will bubble up to the parent component:
if the parent also has this property set to true, then events will bubble up to the next (from the hierarchy) parent component.

All dispatched events have special prefixes to avoid collisions with events from other components.
For example: bButton `click` will bubble up as `b-button::click`.
Or if the component has the `globalName` prop, it will additionally bubble up as `${globalName}::click`.

### [selfDispatching = `false`]

If true, then all events that are bubbled up by child components will be fired as the component own events without any prefixes.

### [p]

Additional component parameters.
This parameter can be useful if you need to provide some unstructured additional parameters to a component.

### [classes]

Additional classes for component elements.
This option can be useful if you need to attach some extra classes to the internal component elements.
Be sure you know what you are doing because this mechanism is tied to the private component markup.

```
// Key names are tied with the component elements
// Values contain a CSS class or a list of classes we want to add

{
  foo: 'bla',
  bar: ['bla', 'baz']
}
```

### [styles]

Additional styles for component elements.
This option can be useful if you need to attach some extra styles to the internal component elements.
Be sure you know what you are doing because this mechanism is tied to the private component markup.

```
// Key names are tied with component elements,
// Values contains a CSS style string, a style object or a list of style strings

{
  foo: 'color: red',
  bar: {color: 'blue'},
  baz: ['color: red', 'background: green']
}
```

### [i18n]

A link to the `i18n` function that will be used to localize string literals.

## Template helpers

### Constants

#### [componentName]

The hardcoded name of the component. If not set, a name based on the template file name will be used.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - componentName = 'my-component'
```

#### [rootTag]

The root tag type. If not specified, will be taken from the component `rootTag` prop.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - rootTag = 'span'
```

#### [rootWrapper = `false`]

Should or not to create an extra wrapper inside the root tag.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - rootWrapper = true
```

#### [overWrapper = `false`]

Should or not create a layout for overlapping.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - overWrapper = true
```

#### [skeletonMarker = `false`]

Should or not the component have a skeleton marker attribute.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - skeletonMarker = true
```

### Methods

#### slot

Generates a slot declaration by the specified parameters.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    += self.slot()
      The default content.

    += self.slot('preIcon', {':item': 'el', ':icon': 'el.preIcon'})
      < component &
        v-if = el.preIconComponent |
        :instanceOf = bIcon |
        :is = el.preIconComponent |
        :value = el.preIcon
      .

      < @b-icon v-else | :value = el.preIcon
```

#### appendToRootClasses

Appends the specified value to the root component classes.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    += self.appendToRootClasses('some-class')
```

#### typograf

Applies the `Typograf` library for the specified content and returns the result.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    += self.typograf('Hello "world"')
```
