# components/super/i-block

This module serves as a superclass for all V4Fire components and provides essential APIs.
These APIs include event handling, modifier management, state management, lifecycle management, property watching,
and more.

The functionality of this superclass is divided into different parts.
It includes the behaviors declared by the class itself and various auxiliary classes that work through composition.

Additionally, this module re-exports some functionality and types from the `core/component` module.

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

Please refer to the following submodule documents for more information:

* `components/super/i-block/base` - this module provides a common API for working with components.
* `components/super/i-block/event` - this module provides an event emitter API for working with components.
* `components/super/i-block/mods` - this module provides an API for working with a component
  in terms of [BEM](https://en.bem.info/methodology/quick-start/).

* `components/super/i-block/state` - this module provides an API for convenient management of component states.
* `components/super/i-block/providers` - this module provides an API for initializing and
  loading external data into a component.

* `components/super/i-block/decorators` - this module re-exports the base decorators
  from `core/component/decorators` and also provides additional decorators.

## Friendly Classes

The `iBlock` class has various properties that delegate functionality to other modules.
Some of these properties can be used anywhere, while others are only accessible within the class or its descendants.
Refer to their respective module documentation for more details on each property.

### Public

* `provide` (`components/friends/provide`) - this class provides methods for providing component
  classes/styles to other components.

* `infoRender` (`components/friends/info-render`) - this API allows for collecting and
  rendering various component information.

* `field` (`components/friends/field`) - this class provides helper methods for
  safely accessing component/object properties.

* `analytics` (`components/friends/analytics`) - this class is used to send component analytic events.
* `sync` (`components/friends/sync`) - this API facilitates the synchronization of fields and props of the component.
* `asyncRender` (`components/friends/async-render`) - this class enables the asynchronous rendering of
  component fragments.

* `vdom` (`components/friends/vdom`) - this class is used for low-level operations on the component's VDOM tree.
* `lfc` (`components/super/i-block/modules/lfc`) - this class provides helper methods for
  working with the component life cycle.

### Protected

* `daemons` (`components/friends/daemons`) - this class allows for the creation of daemons associated with a component.
* `block` (`components/friends/block`) - this API provides methods for working with a component
  in terms of [BEM](https://en.bem.info/methodology/quick-start/).

* `dom` (`components/friends/dom`) - this class facilitates low-level operations on the component's DOM tree.

* `async` (`core/async`) - this API provides functionality for controlling and managing asynchronous operations.
* `$async` (`core/async`) - this API is used for protected/private consumers
  (e.g., private directives or component engines) to control and manage asynchronous operations.

* `storage` (`components/friends/storage`) - this class provides a means for persistent storage of component data.
* `state` (`components/friends/state`) - this class provides methods for initializing a component state from
  various related sources.

* `moduleLoader` (`components/friends/module-loader`) - this class manages dynamically loaded modules.
* `opt` (`components/super/i-block/modules/opt`) - this class provides helper methods for
  optimizing component rendering.

* `browser` (`core/helpers`) - this API allows for determining the current browser's name and version.

* `h` (`core/helpers`) - this dictionary contains some helper functions.
* `l` - this is a link to the global function l.

* `location` - this is a link to the native location API.
* `global` - this is a link to the global object.
* `console` - this is a link to the native console API.

## Props

### [componentIdProp]

The unique component identifier.
The value for this prop is automatically generated during the build process,
but it can also be manually specified.
If the prop is not provided, the ID will be generated at runtime.

### [globalName]

The unique or global name of the component.
Used to synchronize component data with various external storages.

### [rootTag]

The component root tag type.

### [verbose = `false`]

If set to true, the component will log informational messages in addition to errors and warnings.
This option determines the type of messages that are output by the log method.

### [stageProp]

A string value that specifies the logical state in which the component should operate.

This property can be used to indicate different stages of a component.
For example, let's say we have a component that implements an image upload form.
And we have two options for this form: uploading from a link or uploading from a computer.

In order to differentiate between these two options and render different markups accordingly,
we can create two stage values: "link" and "file".
This way, we can modify the component's template based on the current stage value.

### [modsProp]

Additional modifiers for the component.
Modifiers allow binding the state properties of a component directly to CSS classes,
without the need for unnecessary re-rendering.

### [activatedProp = `true`]

If set to true, the component will be activated by default.
A deactivated component will not retrieve data from providers during initialization.

### [forceActivation = `false`]

If set to true, forced activation of handlers is enabled for functional components.
By default, functional components do not execute activation handlers such as router/storage synchronization.

### [reloadOnActivation = `false`]

If set to true, the component will attempt to reload provider data upon reactivation.
This parameter can be useful in scenarios where you are using the keep-alive directive in your template.
For example, if you have a page that is cached using keep-alive, and you return to this page,
the component will be rendered from the keep-alive cache.
However, with this parameter enabled, the page will silently attempt to reload its data after rendering.

### [renderOnActivation = `false`]

If set to true, the component will be forced to re-render upon reactivation.
This parameter can be helpful when using the keep-alive directive in your template.
In such cases, even if the component is rendered from the keep-alive cache,
enabling this parameter will force it to re-render its template.

### [dependenciesProp]

An iterable object with additional component dependencies for initialization.

```typescript
import iBlock, { component, Module } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  // Asynchronously load the following components
  override dependenciesProp: Iterable<Module> = [
    {name: 'b-button', load: () => import('components/form/b-button')},
    {name: 'b-input', load: () => import('components/form/b-input')}
  ];
}
```

### [ssrRenderingProp = `true`]

If set to false, the component will not render its content during server-side rendering.
This should be used with non-functional components.
If you need to disable the rendering of a functional component in server-side rendering,
use the wrapper component `components/base/b-prevent-ssr`.

### [wait]

A promise that will block the rendering of the component until it is resolved.
This should be used together with [Suspense](https://vuejs.org/guide/built-ins/suspense.html#async-components) and
non-functional components.

```
< suspense
  < b-popup :wait = promisifyOnce('showPopup')
```

### [remoteProvider = `false`]

If set to true, the component is marked as a removed provider.
This signifies that the parent component will wait for the current component to finish loading before proceeding.

### [dontWaitRemoteProvidersProp]

If set to true, the component will skip waiting for remote providers to avoid redundant re-rendering.
This property can be useful to optimize non-functional components that do not have any remote providers.
By default, the value of this property is automatically calculated based on the component dependencies.

### [syncRouterStoreOnInit = `false`]

If set to true, the component state will be synchronized with the router after initialization.
For example, you have a component that uses the `syncRouterState` method to create two-way binding with the router:

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @field()
  stage: string = 'defaultStage';

  syncRouterState(data?: Dictionary) {
    // This notation signifies that if there is a value within the `route.query`,
    // it will be mapped to the component as stage.
    // This mapping will also be repeated if the route has been changed.
    // Additionally, if the stage field of the component has been modified,
    // it will be mapped to the router query parameters as stage using `router.push`.
    return {stage: data?.stage || this.stage};
  }
}
```

However, in certain cases where the stage value is not present in the `route.query`,
and the component has a default value for stage,
we may encounter a situation where there is a route that has not been synchronized with the component.
This can impact the logic for "back" navigation as it may not meet our expectations.

To address this, if you set `syncRouterStateOnInit` to true,
the component will force its state to be synchronized with the router after initialization.
This ensures that the component's state is always in sync with the router,
even if the route does not have the stage value initially.
This can provide a more consistent navigation experience, especially when using "back" navigation.

### [routerStateUpdateMethod = `'push'`]

The method that will be used for transitions when the router synchronizes
its state with the component's state using `syncRouterState`.

### [watchProp]

A dictionary with remote component watchers.
Using this prop is very similar to using the `@watch` decorator:

1. As a key, we specify the name of the current component method we want to call.
2. As a value, we specify the property path or event that we want to watch or listen to.
   We can also include additional observation parameters in the method.
   It is important to note that the properties or events are taken from the component
   that contains the current one.

```js
// We have two components: A and B.
// We want to specify that component B should call its own reload method when an event occurs in component A.

const watchProp = {
  // To listen for events, we should use the ":" syntax.
  // Additionally, we can specify a different event emitter using the "link:" syntax.
  // For example, "document:scroll" will listen to the "scroll" event on the document.
  reload: ':foo'
};
```

```js
// We can attach multiple watchers for one method

const watchProp = {
  reload: [
    // Listens to the `foo` event from `A`
    ':foo',

    // Watches for changes to the `A.bla` property
    'bla',

    // Listens to the "scroll" event on the window.document object
    // and does not provide event arguments to the reload method
    {
      path: 'document:scroll',
      provideArgs: false
    }
  ]
};
```

### [proxyCall = `false`]

If set to true, the component will listen for the `callChild` special event on its parent.
The event handler will receive an object as the payload, which should implement the `CallChild` interface.

```typescript
interface CallChild<CTX extends iBlock = iBlock> {
  if(ctx: CTX): AnyToBoolean;
  then(ctx: CTX): Function;
}
```

The `if` function allows you to specify which components should handle a particular event.
If the check is successful,
then the then method will be called with the handler component's context as an argument.

Here's an example:

```js
// Reload all children iData components
this.emit('callChild', {
  if: (ctx) => ctx.instance instanceof iData,
  then: (ctx) => ctx.reload()
});
```

### [dispatching = `false`]

If set to true, the component event dispatching mode is enabled.
This means that all component events will bubble up to the parent component.

If the parent component also has this property set to true,
then the events will continue to bubble up to the next parent component in the hierarchy.

To avoid collisions with events from other components,
all dispatched events will have special prefixes.
For example, if a component named `bButton` emits a `click` event, it will bubble up as `b-button::click`.

If the component has the `globalName` property, it will additionally bubble up as `${globalName}::click`.

### [selfDispatching = `false`]

If set to true, all events that are bubbled up by child components will be fired as the component's own events,
without any prefixes.

### [p]

Additional component parameters.
This parameter can be useful when you need to pass custom or specific data to a component in a flexible and
unstructured way.
You can include any additional parameters you need, according to your component's requirements.

### [classes]

Additional classes for the component elements.
This option can be useful if you need to attach some extra classes to the inner component elements.
Be sure you know what you are doing because this mechanism is tied to the private component markup.

```js
// Key names are tied with the component elements
// Values contain CSS classes we want to add

const classes = {
  foo: 'bla',
  bar: ['bla', 'baz']
};
```

### [styles]

Additional styles for the component elements.
This option can be useful if you need to attach some extra styles to the inner component elements.
Be sure you know what you are doing because this mechanism is tied to the private component markup.

```js
// Key names are tied with component elements,
// Values contains CSS styles we want to add

const styles = {
  foo: 'color: red',
  bar: {color: 'blue'},
  baz: ['color: red', 'background: green']
};
```

### [canFunctional]

True if the component renders as a regular one, but can be rendered as a functional.
This parameter is used during SSR and when hydrating the page.

### [getRoot]

The getter is used to retrieve the root component.
It is commonly used for dynamically mounting components.

### [getParent]

The getter is used to retrieve the parent component.
It is commonly used for dynamically mounting components.

## Template helpers

### Constants

#### [componentName]

The hardcoded name of the component.
If a name is not explicitly set, it will be based on the template file name.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - componentName = 'my-component'
```

#### [rootTag]

The root tag type.
This value will be used if a similarly named runtime prop is not passed to the component.

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

#### [teleport = `false`]

A selector to mount component via teleport or false.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - teleport = '#content'
```

#### [forceRenderAsVNode = `false`]

If set to true, the component will always be rendered by creating an intermediate VNODE tree.
Enabling this option may negatively affect rendering speed in SSR.
However, this mode is necessary for using some directives.

```
- namespace [%fileName%]
- include 'components/super/i-block'|b as placeholder
- template index() extends ['i-block'].index
  - forceRenderAsVNode = true
```

#### SSR

True if the application needs to be built for SSR.

```
- namespace [%fileName%]
- include 'components/super/i-block'|b as placeholder
- template index() extends ['i-block'].index
  - block body
    - if SSR
       SSR only content
```

#### HYDRATION

True if the application needs to be built for hydration.

```
- namespace [%fileName%]
- include 'components/super/i-block'|b as placeholder
- template index() extends ['i-block'].index
  - block body
    - if HYDRATION
      Hydration context only content
```

#### [renderMode = `component`]

The constant defines the rendering mode of the template.
For regular components, the default value of `'component'` can be used,
whereas for templates that are rendered as a separate render function,
rather than as a component, the value `'mono'` should be used.

Also, if you are creating a template that you want to use separately of a component,
you can simply inherit from `['i-block'].mono`.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].mono
  /// ...
```

### Methods

#### name

Returns the component name.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < .${self.name()}
      Hello World
```

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

      < b-icon v-else | :value = el.preIcon
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

#### render

Renders the specified content by using the passed options.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    += self.render({renderKey: 'controls', wait: 'promisifyOnce.bind(null, "needLoad")'})
      < b-button
        Hello World

      < b-input
```

#### getTpl

Returns a link to a template by the specified path.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    += self.getTpl('b-some-component-template/')
```

#### loadModules

Loads modules by the specified paths and dynamically inserted the provided content when they are loaded.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    += self.loadModules('components/form/b-button')
      < b-button
        Hello world

    += self.loadModules(['components/form/b-button', 'components/form/b-input'], {renderKey: 'controls', wait: 'promisifyOnce.bind(null, "needLoad")'})
      < b-button
        Hello world
```

### Blocks

#### skeleton

A block for rendering fallback content such as loading indicators or skeletons.
If necessary, this block should be overridden in the component that extends the `iBlock` superclass.
