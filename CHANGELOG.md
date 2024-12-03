Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

_Note: Gaps between patch versions are faulty, broken or test releases._

## v4.0.0-beta.??? (2024-12-03)

#### :bug: Bug Fix

* Fix watching for nested fields inside `$attrs` `core/component/watch`

## v4.0.0-beta.160 (2024-03-12)

#### :rocket: New Feature

* Added a new webpack loader for responsive images `build/webpack/loaders/responsive-images-loader`

## v4.0.0-beta.159 (2024-11-27)

#### :bug: Bug Fix

* Execute default value getter only if prop type is `Function` `core/component/decorators/default-value`
* Retrieve original function from `defaultValue` if prop type is `Function` `core/component/decorators/prop`

## v4.0.0-beta.158 (2024-11-26)

#### :house: Internal

* Added error details to the logging when checking the stylesheet loading status

## v4.0.0-beta.157 (2024-11-25)

#### :bug: Bug Fix

* Added the `default` getter to static compiled routes `core/router/modules`.
This is necessary to correctly compare the compiled route and the current route of the router.

## v4.0.0-beta.156 (2024-11-25)

#### :boom: Breaking Change

* Now items processors will be generated only for the first render and will be reused for all subsequent ones until a reset occurs `components/base/b-virtual-scroll-new`

## v4.0.0-beta.155 (2024-11-20)

#### :bug: Bug Fix

* Fixed an issue with `g-slider` was not compiled `components/global/g-slider`

#### :house: Internal

* Added a function to check if a tag is a web component (currently it always returns false) `build/snakeskin`
* Disabled props normalization for tags that are web components `build/snakeskin`

## v4.0.0-beta.154.dsl-speedup-3 (2024-11-19)

#### :boom: Breaking Change

* The `getPassedProps` method now returns a dictionary instead of a set `core/component`

* `iBlock`:
  * The API for `InferComponentEvents` has been changed so that you no longer need to pass `this` as the first argument
  * Component events without an `error` or `warning` status are logged only if the `verbose` prop is set
  * The `strictEmit` method no longer performs normalization of the event name

* To automatically implement traits or characteristics for components,
  the `derive` decorator from the `components/traits` module should now be used.

* Removed the constants `COMPONENTS` and `BLOCK_NAMES` `build/globals.webpack`
* Removed the `components` property `config`

#### :bug: Bug Fix

* Fixed an error in normalizing attribute and prop values in Snakeskin `build`

#### :rocket: New Feature

* `core/component/decorators`:
  * Added new decorators, defaultValue and method, for the class-based DSL.
    These decorators are used during code generation by the TS transformer DSL.

  * The prop, field, and system decorators can now accept a default value for the field as a second argument.
    This argument is used during code generation by the TS transformer DSL.

#### :house: Internal

* Various micro-optimizations

* `build`:
  * Added a new TypeScript transformer to automatically apply decorators to parts of a component:
    methods, accessors, field overrides, etc.
  * Now, only the value from the decorator is used to get the default field value.
    Default values specified in the class property will automatically be passed to the decorator by the transformer.

* The observation of accessor dependencies is now initialized only if the accessor has been used at least once `core/component/accessor`

* The decorators from `core/component/decorators` no longer use a single factory module.
  Now, each decorator is implemented independently.

* `core/component/meta`:
  * When inheriting metaobjects, prototype chains are now used instead of full copying.
    This optimizes the process of creating metaobjects.
  * Methods and accessors are now added to the metaobject via the `method` decorator instead of runtime reflection.
    This decorator is automatically added during the build process.
  * Optimized creation of metaobjects.

## v4.0.0-beta.153 (2024-11-15)

#### :house: Internal

* Fixed an issue with reloading after a component is destroyed.
Reloading now occurs for unloaded components or when explicitly specified with `reloadOnActivation: true`.
`components/super/i-block/modules/activation`
* Removed context binding in wrapRenderList `core/component/render`

#### :bug: Bug Fix

* Re-fixed loss of refs in slots inside async render (see v4.0.0-beta.52)
  by converting `v-ref` to a prop for regular components `build/snakeskin/filters`
* Fixed an issue with emitting the `close` after destroying the component.
  This happened because we used `await` and this task could be executed after the component was destroyed.
  So we replaced `await` with `SyncPromise`. `bBottomSlide`
* Fix error "ctx.$vueWatch is not a function" caused by the incorrect fix in the v4.0.0-beta.146 `core/component/watch`
* Fixed endless attempts to load a component template that is not in use.
  Added a 10-second limit for attempts to load the template. `core/component/decorators/component`
* Default `forceUpdate` param of a property no longer overrides its value inherited from the parent component `core/component/decorators/prop`
* Fixed typo: `"prop"` -> `"props"` when inheriting parent properties `core/component/decorators/factory`

## v4.0.0-beta.152 (2024-11-11)

#### :rocket: New Feature

* Added `trackContentSwipes` - a flag to prevent unexpected closure of a component instance `bBottomSlide`

## v4.0.0-beta.151 (2024-11-06)

#### :bug: Bug Fix

* Updated the input parameter type to clarify that the function can handle not only VNodes but also buffers `core/component/directives/render`
* Fixed the buffer rendering on server-side: it now correctly processes not only strings and promises but also nested buffers, as [dictated by Vue](https://github.com/vuejs/core/blob/main/packages/server-renderer/src/render.ts#L61-L65) `core/component/directives/render`
* Fixed the handling of property getters in SSR: property getters are now included in props instead of being ignored as handlers `core/component/directives/attrs`
* Fixed the `resolveAttrs` function: property getters are no longer removed from props, the `v-attrs` directive now resolves with the correct method in SSR `core/component/render/helpers/attrs`
* Calls `resolveAttrs` to resolve directives for components rendered with `ssrRenderComponent` `core/component/render/wrappers`

#### :rocket: New Feature

* Add `SSRBuffer` and `SSRBufferItem` types `core/component/engines`
* The `getSSRProps` method now accepts a `vnode` parameter for direct modification of vnode props, similar to the `beforeCreate` method `core/component/directives/attrs`

## v4.0.0-beta.150 (2024-11-05)

#### :bug: Bug Fix

* Omit detailed component information to prevent event loop freezing associated
with certain warnings. Vue uses a `get` trap within the proxy to verify the presence
of a property in the instance. Accessing undefined properties via the `getComponentInfo` method
during a warn or error handler will trigger infinite recursion. `core/component/engines/vue3`
* The `create` method now handles quotation marks in meta tag values when building query selectors `core/page-meta-data/elements/abstract/engines/dom`

#### :house: Internal

* Revert: exclude SSR shims for non-SSR environments `core/shims`

## v4.0.0-beta.149 (2024-10-31)

#### :rocket: New Feature

* Added the `v-safe-on` directive, which allows event handlers to execute only when the vnode is not unmounted
  `components/directives/safe-on`
* Added a wrapper for `withModifiers` with support for the `safe` modifier `core/component/render`

#### :house: Internal

* Moved the `parseEventListener` function to common directive helpers `core/component/directives/attrs`

## v4.0.0-beta.148 (2024-10-28)

#### :house: Internal

* Create a `normalizeComponentForceUpdateProps` for normalizing the props with `forceUpdate = false` `core/component/render`
* Exclude SSR shims for non-SSR environments `core/shims`

## v4.0.0-beta.147 (2024-10-25)

#### :bug: Bug Fix

* Fixed the bug with previous active element not loosing its focus state `bList`

## v4.0.0-beta.146 (2024-10-18)

#### :bug: Bug Fix

* Fixed `$attrs` not being watched `core/component/watch`

## v4.0.0-beta.145 (2024-10-14)

#### :bug: Bug Fix

* Fixed the issue with incorrectly detecting the functional smart component `build/snakeskin`
* Create a fallback for the addEventListener method on the MediaQueryList
  `core/theme-manager/system-theme-extractor/engines/web`
* Fixed an issue with the comment node in `$refs` that occurs when rendering an `undefined` page `bDynamicPage`

## v4.0.0-beta.144 (2024-10-09)

#### :bug: Bug Fix

* Override a component name in the shared meta `core/component/decorators`

## v4.0.0-beta.143 (2024-10-09)

#### :rocket: New Feature

* Added `JSHandle` representing the mock agent in `SpyObject.handle` `tests/helpers/mock`

#### :bug: Bug Fix

* Fixed an issue with updating the `componentStatus` after destroying the component `iData`

## v4.0.0-beta.142 (2024-10-04)

#### :bug: Bug Fix

* Better fix for the exports in transpiled snakeskin modules `build/webpack`

## v4.0.0-beta.141 (2024-10-03)

#### :bug: Bug Fix

* Do not call destructor recursively on before unmount `core/component/engines/vue3`

## v4.0.0-beta.140 (2024-10-03)

#### :bug: Bug Fix

* Fixed incorrect `shapeFlag` on a functional vnode `core/component/render`

## v4.0.0-beta.139.dsl-speedup-2 (2024-10-03)

#### :rocket: New Feature

* Added a new default prop `getPassedProps`, which allows identifying which props were passed through the template `core/component`

#### :bug: Bug Fix

* Fixed a bug with the removal of modifiers from a comment node `components/friends/block`

#### :house: Internal

* Performance improvements `components/friends/sync` `iBlock`
* `core/component/engines/vue3`:
  * Migration to the Composition API
  * Added support for the `renderTracked` hook

## v4.0.0-beta.138.dsl-speedup (2024-10-01)

#### :boom: Breaking Change

* The `Async` module  has been moved to `V4/Core`

#### :rocket: New Feature

* Added the `partial` parameter for the declaration of components consisting of multiple classes `core/component/meta`
* Added a new method for efficient access to the field store `getFieldsStore` `components/friends/field`
* Introduced a new type of caching: `'forever'` `core/component/accessors`
* Added the `test` parameter for fine-tuning watchers `core/component/decorators`

#### :house: Internal

* `iBlock`:
  * Set all friend classes now through getters with `cache: 'forever'`
  * Modules for friend classes are now loaded lazily

* Apply the `symbol-generator-loader` consistently to optimize Runtime performance `build/webpack`
* A lot of TypeScript type fixes
* Performance improvements

## 4.0.0-beta.137 (2024-09-24)

#### :bug: Bug Fix

* Fix the bug when the global event listener might be called after the component has been destroyed `iBlock`

#### :house: Internal

* Removed method calls from the `iBlock` template
* Added a [[RENDER]] event before calling the component's render function `core/component/meta`

## 4.0.0-beta.136 (2024-09-17)

#### :house: Internal

* Added sanitizing to `toString` method to prevent XSS vulnerabilities `core/hydration-store`

## v4.0.0-beta.135 (2024-09-17)

#### :bug: Bug Fix

* Removed the array merging logic from the old and current options during `replace(null, opts)`

## v4.0.0-beta.134 (2024-09-16)

#### :house: Internal

* Modified the method for checking the stylesheet loading status `core/prelude/webpack`

## v4.0.0-beta.133 (2024-09-13)

#### :bug: Bug Fix

* Support for the recursive `dropCache` operation by adding the `recursive` argument `components/friends/data-provider`

## v4.0.0-beta.132 (2024-09-12)

#### :boom: Breaking Change

* To improve performance, the `std.js` chunk has been moved back as the standalone entry

#### :bug: Bug Fix

* Fix exports in transpiled snakeskin modules `build/webpack`

#### :house: Internal

* Add ResizeObserver polyfill for legacy build

## v4.0.0-beta.131 (2024-09-11)

#### :rocket: New Feature

* Enhanced filesystem cache invalidation criteria by including the current branch name and the most recent merge `build/webpack`

#### :bug: Bug Fix

* Fixed `env` argument for autoprefixer

## v4.0.0-beta.130 (2024-09-05)

#### :bug: Bug Fix

* Fixed re-rendering issue when the value passed in `v-safe-html` changed. Added innerHTML updating in the `updated` hook.

## v4.0.0-beta.129 (2024-09-04)

#### :nail_care: Polish

* Now, if an external link is passed to `initLibs()`, `PUBLIC_PATH` won't be added to it

## v4.0.0-beta.128 (2024-09-03)

#### :bug: Bug Fix

* Fix normalization of the `forceUpdate` props declared as `*Prop` in:
  * `bDummy`
  * `bVirtualScrollNew`

## v4.0.0-beta.127 (2024-08-29)

#### :bug: Bug Fix

* Fixed the RegExp for determining cookie in the `withIdempotent` decorator

## v4.0.0-beta.126 (2024-08-23)

#### :rocket: New Feature

* The `eventConverter` function can now return a tuple consisting of the page component name and page component key, instead of just a string representing the page component name `bDynamicPage`

#### :bug: Bug Fix

* Fixed an issue where a new page component instance was not created when switching between routes that use the same page component `bDynamicPage`

## v4.0.0-beta.125 (2024-08-12)

#### :bug: Bug Fix

* Fixed the dynamic component import transformer for the SSR build `build/monic`
* Fixed the TypeScript configuration for SSR builds using SWC `config`

## v4.0.0-beta.124 (2024-08-12)

#### :house: Internal

* Updated `monic-loader` to version `3.0.5` to include a fix for the rebuild speed regression

## v4.0.0-beta.123 (2024-08-09)

#### :bug: Bug Fix

* Fix the browserslist for correct CSS autoprefixer work

## v4.0.0-beta.122 (2024-08-06)

#### :rocket: New Feature

* Added settings for the component garbage collector `config`
* Added a new module with an implementation of the garbage collector for components `core/component/gc`

## v4.0.0-beta.121.the-phantom-menace (2024-08-05)

#### :boom: Breaking Change

* `core/component/interface`:
  * Removed the `renderedOnce` field
  * The `$renderCounter` field is now public and updates after each call to the render function

#### :rocket: New Feature

* Added the `createPropAccessors` method for creating accessors
  for props marked as `forceUpdate: false` `core/component/interface`

* Added the `forceUpdate: false` property to designate props whose changes
  should not lead to a template re-render `core/component/decorators/prop`

#### :bug: Bug Fix

* Fixed a bug where adding refs to components could cause them to re-render `core/component/directives/ref`
* Fixed a bug where adding `v-attrs` to components could cause them to re-render `core/component/directives/attrs`
* Fixed an issue with updating modifier values `iBlock`

## v4.0.0-beta.120 (2024-09-05)

#### :boom: Breaking Change

* Removed the ES build option
* Added `edition` build option for configuring environment support
* Added browserslist support

#### :house: Internal

* Use SWC with support for browserslist

## v4.0.0-beta.119 (2024-08-02)

#### :rocket: New Feature

* Added decorator for cookie store `core/cookies`

#### :bug: Bug Fix

* Fixed a bug of re-applying `maxAge` parameter on storage update `core/kv-storage/engines/cookie`

## v4.0.0-beta.118 (2024-08-01)

#### :bug: Bug Fix

* Added `join: 'replace'` for router transitions. It allows to avoid collisions during calls of `push` and `replace` `b-router`

## v4.0.0-beta.117 (2024-07-31)

#### :house: Internal

* Added a new `rootContent` layout wrapper block `iBlock`

## v4.0.0-beta.116 (2024-07-29)

#### :house: Internal

* Now JSDOM used as singleton in server render `core/const/browser`

## v4.0.0-beta.115.the-force-awakens (2024-07-26)

#### :bug: Bug Fix

* `core/component/init`:
  * Fixed a typo in the event name `hookChange` which is responsible for processing activation and deactivation in the component
  * Amended the deactivation sequence within the component to ensure that children are deactivated first

* Fixed an issue to prevent the `hookChange` event from bubbling up `bDynamicPage`
* Fixed the `$el` property of the teleported component `iBlock`

#### :house: Internal

* Added unit tests that use synchronous rendering

## v4.0.0-beta.114 (2024-07-24)

#### :house: Internal

* Removed unnecessary rerendering of container in case of `request` prop change;
rerendering of the container and all nodes inside occurs only when `firstChunkRender` is changed. `components/base/b-virtual-scroll-new`

## v4.0.0-beta.113 (2024-07-24)

#### :bug: Bug Fix

* Fixed an issue with canceling a request when resolving response data. `components/friends/data-provider`

## v4.0.0-beta.112 (2024-07-22)

#### :bug: Bug Fix

* Fixed a bug by ensuring the onPageChange callback is cleaned up in
  renderFilter to prevent execution by syncPageWatcher before the next
  renderFilter call, maintaining proper rendering sequence `bDynamicPage`
* Resolved the issue with consecutive router calls and option merging during `replace(null)` `bRouter`
* Fixed a bug in `core/component/engines/vue3/render`, when passing a `nullable` value to a directive would result in it not being bound to the vNode

## v4.0.0-beta.111 (2024-07-18)

#### :house: Internal

* Removed dead code `core/component/attrs`
* Updated `monic-loader` to version `3.0.4` to fix regression

## v4.0.0-beta.110 (2024-07-17)

#### :bug: Bug Fix

* Set global `Session` instance in the application state in `core/index`.
  It fixes the session events not being emitted in `core/init/dependencies/load-session`.
* Fixed the bug where the event name was set as an event modifier in the `v-attrs` directive `component/directives/attrs`
* Replaced the method calls to `componentCtx.$once` and `componentCtx.$on` with correct event handling based on the isOnceEvent flag in `component/directives/attrs`
* The page description element is now expected to be a meta tag
  with the attribute `name='description'` instead of the `description` tag `core/page-meta-data`

## v4.0.0-beta.109 (2024-07-16)

#### :house: Internal

* Updated `monic-loader` to version `3.0.3` to fix memory leak on rebuild in watch mode

## v4.0.0-beta.108.a-new-hope (2024-07-15)

#### :boom: Breaking Change

* `iStaticPage`:
  * Removed the `locale` field
  * Removed the `globalEnv` field

* The modules `core/init` and `core/component/state` have been completely redesigned for the new API
* The module `core/component/state` has been completely redesigned for the new API
* Moved the hydration store to a separate module from `core/component/hydration` -> `core/hydration-store`
* Added a wrapper for middleware with additional parameters `core/data/middlewares/hydration-cache`

#### :rocket: New Feature

* Added a new component `bPreventSSR`
* Added a new component `bCacheSSR`
* Added a new module `core/html/xss`
* Added a new module `core/cache/decorators/hydration`
* Added style registration in the `getRenderFactory` method for templates in SSR `components/friends/vdom`

* `iBlock`:
  * Added Snakeskin constant `SSR` to determine that the template is being assembled for SSR
  * Added Snakeskin constant `renderSSRAsString` for optimizing component assembly under SSR
  * Added an optional `componentName` parameter to the `hydrateStyles` method.
    This parameter allows for specifying the name of the component for which styles should be hydrated.
  * Added registration of styles for templates in SSR

* `core/hydration-store`:
  * Added the ability to set the current environment in the hydration store
  * Added getting and removing the hydration store value by path

#### :bug: Bug Fix

* Attached a handler to ensure the correct lifecycle for pages with keep-alive strategy `bDynamicPage`

#### :house: Internal

* The `hydrateStyles` method has been made public `iBlock`
* Added a new `response` event upon successful data retrieval `components/friends/data-provider`

* `build`:
  * Now SSR build is bundled into a single file
  * Use the forked `lib/server-renderer` everywhere in the SSR build

## v4.0.0-beta.107 (2024-07-10)

#### :bug: Bug Fix

* Corrected the improper conversion of cookie attributes that are passed in camelCase format:
  now all are forcibly converted to dash-style `core/cookies`
* Fixed incorrect `patchFlag` when creating vnode with event handler `core/component/render`

## v4.0.0-beta.106 (2024-06-25)

#### :bug: Bug Fix

* Do not store computed values in the cache before the functional component is fully created.
  This fixes hard-to-detect bugs that can occur due to context inheritance.
  See: https://github.com/V4Fire/Client/issues/1292 `core/component/accessor`

## v4.0.0-beta.105 (2024-06-24)

#### :bug: Bug Fix

* Fixed unwanted execution of unmount handlers in the directives used
  within the functional component during its re-creation.
  The `$destroy` method now accepts an object with options, which enables control over
  both the recursion of the destructor and the unmounting of vnodes
  within the component `core/component/interface`

## v4.0.0-beta.104 (2024-06-19)

#### :rocket: New Feature

* The `$destroy` method now accepts a recursive parameter for targeted removal
  of the component without deleting its children and vice versa `core/component/interface`
* Added the `consoleTracker` fixture to enable access to console messages in unit tests `tests/fixtures`

#### :bug: Bug Fix

* Fixed an error where a component could transition to a hook in which it was already located `core/component/hook`

#### :house: Internal

* The getter `r` has been moved from `iBlock` to `ComponentInterface`

## v4.0.0-beta.103 (2024-06-14)

#### :house: Internal

* Updated `terser` to version `5.31.0` to include [bug fix](https://github.com/terser/terser/issues/1432)

## v4.0.0-beta.102 (2024-06-11)

#### :bug: Bug Fix

* Removed the use of `$a.promise` in the `execute` method of the `Transition` class. This previously caused only
the last `replace` method call to be executed when multiple calls were made `components/base/b-router`

## v4.0.0-beta.101 (2024-05-30)

#### :bug: Bug Fix

* Fixed an issue with intersection-observer in `b-virtual-scroll-new`: added `watchForIntersection` method to `DOM` prototype

## v4.0.0-beta.100 (2024-05-24)

#### :bug: Bug Fix

* Fixed an issue in `b-virtual-scroll-new` where nodes from the previous rendering cycle were not being hidden and remained displayed.
Now, the container will always be hidden if it is empty or during the loading process until an initial render occurs.
It is important to note that the nodes are hidden, not deleted, and will later be replaced by new nodes.
This approach helps avoid unnecessary re-renders.
Additionally, this fix can be considered a breaking change because the container
node inside b-virtual-scroll will now be hidden (display: none) by default until the first successful render in the rendering cycle. `components/base/b-virtual-scroll-new`

## v4.0.0-beta.99 (2024-05-23)

#### :rocket: New Feature

* Added color param to `i` mixin `components/global/g-def/funcs/ds.styl`

## v4.0.0-beta.98 (2024-05-21)

#### :bug: Bug Fix

* Fixed a race condition when changing props `bDynamicPage`

## v4.0.0-beta.97 (2024-05-21)

#### :bug: Bug Fix

* Fixed a race condition when switching routes `bRouter`
* Reverted style dynamic load for fat-html from v4.0.0-beta.94 `build/monic`

## v4.0.0-beta.96 (2024-05-16)

#### :rocket: New Feature

* Added new methods waitSignal and sendSignal for deferred module loading `components/friends/module-loader`

## v4.0.0-beta.95 (2024-05-06)

#### :house: Internal

* Add `REGION` to webpack globals `build`
* Listen for i18n `setRegion` event `core/component/event`

#### :bug: Bug Fix

* Renamed `bRouterProps` to `iRouterProps`. The incorrect name had caused infinite
retries to load a non-existent template.

## v4.0.0-beta.94 (2024-04-24)

#### :bug: Bug Fix

* Unlock the page scroll when the component is destroyed `bBottomSlide`
* Now styles for dynamically loaded components with `loadModules` are included in the fat-html build `build/monic`

#### :rocket: New Feature

* The destructor, which unlocks the page scroll when the component is destroyed, will be registered once the `lockPageScroll` method is called `iLockPageScroll`

## v4.0.0-beta.93 (2024-04-19)

#### :house: Internal

* Use the `v-on-resize` directive to recalculate state instead of `window:resize` and `DOMChange` watchers `bBottomSlide`

## v4.0.0-beta.92 (2024-04-19)

#### :rocket: New Feature

* Introduced a `beforeSwitchPage` event that is emitted prior to the removal of the current page element
* Implemented an API for saving the scroll of nested DOM nodes on the page.
  [Learn more](./README.md#api-for-saving-scroll-of-nested-dom-nodes).

## v4.0.0-beta.91 (2024-04-19)

#### :rocket: New Feature

* The `dataOffset` property is now public in the `VirtualScrollState` interface `components/base/b-virtual-scroll`
* Added `$getRoot` and `$getParent` methods to the `ComponentInterface`
* Implemented the `$getRoot` and `$getParent` methods on the component's instance `core/component/init`
* Added a new `rootMargin` property to the intersection-watcher `core/dom/intersection-watcher`.
  Note: this should only be used for the IntersectionObserver strategy.

#### :house: Internal

* Replaced anonymous functions for `getRoot` and `getParent` props
  with calls to the `$getRoot` and `$getParent` methods of the component `build/snakeskin`
* Removed optional chaining from load function in loadModules block
  to ensure compliance with ES2018 `iBlock`

## v4.0.0-beta.90 (2024-04-17)

#### :rocket: New Feature

* Supported the insertion of a primitive as a value `directives/safe-html`

#### :bug: Bug Fix

* The `onEnter` parameter for the `v-in-view` directive is now passed as the `handler` parameter `components/base/b-virtual-scroll-new`

## v4.0.0-beta.88 (2024-04-12)

#### :boom: Breaking Change

* The behavior of blocking the component during progress has been removed from `initModsEvents` `iProgress`

#### :rocket: New Feature

* Added a new static method `initDisableBehavior` `iProgress`

#### :bug: Bug Fix

* Fixed the issue of the on-screen keyboard disappearing when validators are specified on the input field `iInput`

## 4.0.0-beta.87 (2024-04-12)

#### :bug: Bug Fix

* Fixed an error with recursive rendering through `getRenderFn` and the slot `components/friends/vdom`

## 4.0.0-beta.86 (2024-04-11)

#### :boom: Breaking Change

* The directive cannot be applied to img, picture, or object elements `components/directives/image`

#### :rocket: New Feature

* Added support for standard img tag attributes `components/directives/image`

## 4.0.0-beta.85 (2024-04-11)

#### :bug: Bug Fix

* Reverted https://github.com/V4Fire/Client/commit/83005d73fcb96f98928a9ba7831d886a22d5f5a3

## 4.0.0-beta.84 (2024-04-11)

#### :bug: Bug Fix

* Fixed the full upward/downward slide in `heightMode = content` `bBottomSlide`
* Fixed an error with incorrect handling of the empty required `src` attribute `components/directives/image`

## v4.0.0-beta.83 (2024-04-08)

#### :house: Internal

* Re-export `withMemo` `core/component/engines/vue3`

## v4.0.0-beta.82 (2024-04-02)

#### :bug: Bug Fix

* Fixed crash on undefined value in renderList source `AsyncRender`

## 4.0.0-beta.81 (2024-04-01)

#### :bug: Bug Fix

* Fixed an error with incorrect handling of errors caused by the Async wrapper `directives/image`
* Passed `remoteState` to the adapter `core/abt`
* Fixed rendering of nested asynchronous tasks `AsyncRender`
* Fixed an error with canceling handlers added with `prepend` `core/component/event`

## 4.0.0-beta.80 (2024-03-29)

#### :boom: Breaking Change

* Now, the `component` property of the `ComponentObject` always returns a promise.
  It also means that the `component` property will not be cached anymore,
  but will be calculated every time it is accessed `tests/helpers/component-object`

#### :rocket: New Feature

* The ComponentObject can now accept a third argument — a component selector.
  If the selector is passed, it means there is no need to call pick or build,
  as the component will be taken from the page using the passed selector `tests/helpers/component-object`

## 4.0.0-beta.79 (2024-03-29)

#### :house: Internal

* Fixed the signature of the i18n factory passed to the data provider's parameters

## 4.0.0-beta.78 (2024-03-29)

#### :bug: Bug Fix

* Fixed binding of the data provider to the component during initialization
* Fixed an issue with the event emitter being wrapped unnecessarily into async wrapper,
  which was causing the :suspend flag and mute/unmute functions not to work correctly during deactivation/activation
  of components `src/core/component/event/component`. [see https://github.com/V4Fire/Client/pull/1199](https://github.com/V4Fire/Client/pull/1199)

## v4.0.0-beta.77 (2024-03-27)

#### :rocket: New Feature

* Implemented a new engine for translate keys `lang/engines`

#### :house: Internal

* Refactored the build ssr: all code has now been bundled into one file `build/graph`
* Replaced the progress plugin's total time log with measure-loader `build/webpack/plugins/progress-plugin`

#### :bug: Bug Fix

* Resolved an issue with the progress plugin's view in relation to empty builds
* Corrected the theme-manager to function properly in server-side rendering (ssr)
* Added synchronous rendering of the first chunk using `v-for`. This is because SSR does not have access to the DOM API required for `vdom`. Therefore, we leverage Vue functionality to render the first chunk equally for SSR and CSR. `components/base/b-virtual-scroll-new`

## v4.0.0-beta.76 (2023-03-25)

#### :boom: Breaking Change

* The `stopPropagation` for the native click event has been removed.
  Now, native click events bubble up the DOM tree `bButton`.

#### :house: Internal

* Changed the API usage of the `addToPrototype`

## 4.0.0-beta.75 (2024-03-22)

#### :rocket: New Feature

* Added the ability to add event handlers before the others `iBlock`

#### :house: Internal

* Removed the restriction on loading styles if a template is loaded `build`

## 4.0.0-beta.74 (2024-03-20)

#### :house: Internal

* Hardcode the ID during the client rendering in data provider's options.
  This is a temporary solution until PR#1171 is merged `iBlockProviders`

## 4.0.0-beta.73 (2024-03-19)

#### :house: Internal

* Rename `appId` to `appProcessId` `ComponentInterface`

## 4.0.0-beta.72 (2024-03-13)

#### :bug: Bug Fix

* Fixed the loss of the keydown event handler when recreating a functional component `bSelect`
* Fixed the issue of the dropdown not closing when clicking on an element with stop propagation `bSelect`
* Fixed getting a component in `getComponent` when an additional root selector is passed `components/friends/dom`

## 4.0.0-beta.71 (2024-03-12)

#### :rocket: New Feature

* Created a new global component `g-slider` that encapsulates CSS `scroll snap` logic `gSlider`
* Added `useScrollSnap` prop, which enables the use of CSS scroll snap in the `scroll` mode `bSlider`
* Added a new field `layer`, which allows you to obtain information about the package in which the component was declared `core/component/meta`

#### :bug: Bug Fix

* Fixed an issue with missing methods `element` and `elements` in the Block prototype `bSelect`
* Fixed the operation of loadModules during SSR `iBlock`

#### :house: Internal

* Added support for the `layer` property `core/component/reflect`

## v4.0.0-beta.70 (2024-03-05)

#### :bug: Bug Fix

* Fixed the order of setting the "textStore" property in the "updateTextStore" method, which led to a bug with a non-disappearing "textHint" when input overflows
* The `activeStore` system field is marked as unique in the `bList`, `bTree`, `bSelect`
components because it has an `unknown` type and it cannot be correctly merged
* Fixed an error that the text in native mode was not synchronized with the value `bSelect`
* Implemented correct switching between elements when pressing the `Tab` key `bSelect`

## v4.0.0-beta.69 (2024-03-04)

#### :rocket: New Feature

* Added a new `v-safe-html` directive for inserting sanitized HTML `components/directives/safe-html`

## v4.0.0-beta.68 (2024-02-29)

#### :bug: Bug Fix

* Fixed the `wait` option in `loadModules` for SSR build `iBlock`
* Fix the disappearance of functional components in cached pages:
do not call the destroy method on the rendering engine if `$el` has the `component` property
`core/component/init/states/before-destroy`

## v4.0.0-beta.67 (2024-02-26)

#### :bug: Bug Fix

* Fixed an with transition into loading success state was not made `components/b-virtual-scroll-new`
* Fixed synchronous render for functional components in `waitForceRender` `components/friends/async-render`

## v4.0.0-beta.66 (2024-02-22)

#### :bug: Bug Fix

* Fixed an issue with the incorrect transition into the loading state. Now the loading state will be removed in one requestAnimationFrame call along with the content insertion into the DOM,
and the loading state will be restored on the following one. This trick helps avoid generating CLS errors. `components/base/b-virtual-scroll-new`

* Fixed a race condition when calling `initLoad` multiple times `components/base/b-virtual-scroll-new`

* Added visibility tracking for the tombstones slot, now if this slot is on the screen,
an attempt will be made to render the data regardless of what the client returned in `shouldPerformDataRender`.
Also added a flag in VirtualScrollState indicating the visibility of the slot.
All this will help avoid situations when for some reason the `IntersectionObserver` did not trigger on the elements and as a result `shouldPerformDataRender` was not called. `components/base/b-virtual-scroll-new`

#### :rocket: New Feature

* Added the `BOM.clsScore` method that allows measuring Cumulative Layout Shift (CLS) during any actions.

## v4.0.0-beta.65 (2024-02-21)

#### :bug: Bug Fix

* `iBlock`:
  * Created separate buckets for each `loadModules` call
  * Fixed the `wait` option in `loadModules`: now, all modules are not loaded until the wait option is resolved

## v4.0.0-beta.64 (2024-02-19)

#### :bug: Bug Fix

* Fixed a typo when extending the property for inject `core/init`
* Need to check for the existence of provide properties using `in` `iBlock`

## v4.0.0-beta.63 (2024-02-20)

#### :bug: Bug Fix

* Removed an unnecessary next data chunk response checking `components/base/b-virtual-scroll-new`

## v4.0.0-beta.62 (2024-02-19)

#### :rocket: New Feature

* Added an app property to get a reference to the application object `core/component`

#### :bug: Bug Fix

* Fixed bugs in the initialization of SSR rendering `core/init` `iStaticPage` `core/cookies`

## v4.0.0-beta.61 (2024-02-15)

#### :bug: Bug Fix

* Fixed an issue with missing aliases `build/webpack/resolve/alias`

## v4.0.0-beta.60 (2024-02-15)

#### :boom: Breaking Change

* Removed `shouldPerformDataRequest` prop in `b-virtual-scroll-new` `components/base/b-virtual-scroll-new`
* `tests/helpers/network/interceptor` no longer has a named export, the `RequestInterceptor` class is now exported as the default export `tests/helpers/network/interceptor`

#### :bug: Bug Fix

* Fixed an issue with aliases being set for build in ssr `build/webpack/resolve/alias`

#### :rocket: New Feature

* Added `preloadAmount` prop in b`-virtual-scroll-new` `components/base/b-virtual-scroll-new`

#### :house: Internal

* Added re-export of modules from `tests/helpers`:
 - Request
 - RequestInterceptor
 - Mock

* Removed bad import of async module from `tests/helpers/network/interceptor`

## v4.0.0-beta.59 (2024-02-15)

#### :boom: Breaking Change

* Everything except for interfaces has been moved to `core/component/client-state` `core/component/state`

#### :rocket: New Feature

* Added adapters for easy creation of cookie stores `core/cookies/stores`

#### :bug: Bug Fix

* Removed all references to the global state `iStaticPage`

## v4.0.0-beta.58 (2024-02-14)

#### :rocket: New Feature

* Added support for different cookie stores: `core/cookies`, `core/kv-storage/engines/cookie`
* Added support for different session stores `core/session`

#### :bug: Bug Fix

* Fixed memory leaks `core/init/semaphore` `iStaticPage`

#### :house: Internal

* Moved `system-theme-extractor` from `core` to `components/super/i-static-page/modules/theme`

## v4.0.0-beta.57 (2024-02-13)

#### :bug: Bug Fix

* Fixed memory leaks in:
  * `components/super/i-block/providers`
  * `core/init/semaphore`
  * `components/super/i-static-page/i-static-page`
* Fixed the loss of event handlers in functional components `core/component/render/wrappers`

#### :house: Internal

* Removed `id` property from `ProviderOptions` interface `core/data/interface/types`

## v4.0.0-beta.56 (2024-02-09)

#### :rocket: New Feature

* New test APIs:
  * Request interceptor `tests/helpers/network/interceptor`;
  * ComponentObject `tests/helpers/component-object`;
  * Spy and mock `tests/helpers/mock`;
  * Component.createComponentInDummy `tests/helpers/component`.

#### :bug: Bug Fix

* Fixed the problem that the `lifecycleDone` event could fire before `renderDone` `components/components/base/b-virtual-scroll-new`

#### :house:  Internal

* Added tests for `b-virtual-scroll-new` `components/components/base/b-virtual-scroll-new`

## v4.0.0-beta.55 (2024-02-08)

#### :boom: Breaking Change

* `bTree`:
  * Now all nested trees are rendered as functional
  * Now, by default, folded items are not rendered

#### :rocket: New Feature

* Added new values for the `lazyRender` prop `bTree`

#### :bug: Bug Fix

* Fixed errors when using the tree as a functional component `bTree`
* Fixed move to the closest step in `heightMode = content` `bBottomSlide`
* Added cleanup of hydrated data upon component destroying `iStaticPage`

#### :house: Internal

* Create a `mono` template in `i-block` for dynamic mono components. It disables vnode attribute hoisting.

## v4.0.0-beta.54 (2024-02-06)

#### :bug: Bug Fix

* Fixed an issue with memory leaks in `vdom.render` `core/component/engines/vue3`
* Changed `$parent` property to getter in `i-block`. This fixes the incorrect functional parent for a regular component.
* Changed component deactivation behavior: the component is now deactivated before the deactivation hooks are called `components/super/i-block/modules/activation`

#### :house: Internal

* The entry threshold for counting an element as visible is set to the minimum value `components/components/base/b-virtual-scroll-new`

## v4.0.0-beta.53 (2024-01-31)

#### :rocket: New Feature

* Released module `b-virtual-scroll-new`

#### :bug: Bug Fix

* Fixed an issue with memory leaks in `b-virtual-scroll`

## v4.0.0-beta.52 (2024-01-31)

#### :boom: Breaking Change

* Refactored api: replaced the getter/setter named `current` with get/set methods `components/super/i-static-page/modules/theme/theme-manager`

#### :rocket: New Feature

* `components/super/i-static-page/modules/theme/theme-manager`
  * Added possibility to get/set theme from/to cookie
  * Added possibility to specify system theme extractor for theme-manager
  * Added possibility to use systemTheme by calling `useSystem` method
* Released module `core/system-theme-extractor`

#### :bug: Bug Fix

* Fixed the memoization of `getParent`: it was saved in the context of the main component, as a
result of which the components in the slots had an incorrect `$parent` `build/snakeskin`
* Fixed loss of refs in slots inside async render `core/component/render`
* Fixed unexpected async chunk generation during build
* Fixed an issue where Intersection Watcher would not remove nodes from memory, resulting in leaks `core/dom/intersection-watcher/engines`

## v4.0.0-beta.51 (2024-01-19)

#### :bug: Bug Fix

* Fixed an error when deleting the getters cache `core/component/accessor`

## v4.0.0-beta.50 (2024-01-19)

#### :bug: Bug Fix

* When calling the destructor, it is necessary to clean up nodes of any components `core/component/init`
* Fixes an error that caused the application to go into an infinite loop when deleting nodes `core/component/engines/vue3`

## v4.0.0-beta.49 (2024-01-17)

#### :rocket: New Feature

* Now the `render` method can accept the name of an asynchronous group to control the invocation of destructors `components/friends/vdom`

#### :bug: Bug Fix

* Fixed memory leaks when switching pages `bDynamicPage`
* Fixed a memory leak when creating dynamic components via the VDOM API `core/component/engines/vue3`
* Fixed memory leaks when removing components `core/component/init`
* Added memoization for the `getParent` and `getRoot` props to prevent unnecessary re-renders `build/snakeskin`

## v4.0.0-beta.48 (2024-01-17)

#### :boom: Breaking Change

* Now it is necessary to pass the application initialization flags to the `ready` method from
  the initialization parameters, instead of importing it from `core/init`, due to SSR

## v4.0.0-beta.47 (2024-01-16)

#### :bug: Bug Fix

* Fixed incorrect image state during hydration `components/directives/image`

## v4.0.0-beta.46 (2024-01-11)

#### :bug: Bug Fix

* `components/friends/async-render/iterate`:
  * Fixed `asyncRenderComplete` event not being emitted
  ([issue 1057](https://github.com/V4Fire/Client/issues/1057))
  * Fixed race condition

## v4.0.0-beta.45 (2023-12-07)

#### :bug: Bug Fix

* Fixed a bug with clearing event listeners on ios `components/traits/i-lock-page-scroll`

## v4.0.0-beta.44 (2023-12-06)

#### :boom: Breaking Change

* Now, the `initApp` call returns an object in the form `{content, styles}` `core/init`

#### :rocket: New Feature

* Reworked the theme manager to work with SSR `components/super/i-static-page`

#### :bug: Bug Fix

* Fixes for SSR `iBlock`

#### :house: Internal

* Removed comments in CSS for the development build

## v4.0.0-beta.43 (2023-11-26)

#### :rocket: New Feature

* Added data deduplication `core/component/hydration`

#### :bug: Bug Fix

* There is no need to synchronize router data during SSR `components/friends/state`
* Fixed cache key generation `core/data`

## v4.0.0-beta.42 (2023-11-23)

#### :rocket: New Feature

* The `load` function now accepts the router context `core/router`

## v4.0.0-beta.41 (2023-11-21)

#### :boom: Breaking Change

* Removed generation of init.js `iStaticPage`

#### :rocket: New Feature

* Now styles are always inlined in html `iStaticPage`

#### :bug: Bug Fix

* Now the `nonce` attribute is correctly set in inline mode `iStaticPage`

#### :house: Internal

* Fixed typings in `core/data`
* Moved to yarn@4
* Migrated to node@20
* Updated actions in CI

## v4.0.0-beta.40 (2023-11-17)

#### :boom: Breaking Change

* Moved `dropdown` block from `helpers` to `bodyFooter` block `components/form/b-select`
* Moved `limit` block from `helpers` to `bodyFooter` block `components/form/b-textarea`
* Moved `message` block from `helpers` to `bodyFooter` block `components/super/i-block`

#### :rocket: New Feature

* Added new layout blocks - `bodyHeader` and `bodyFooter` `components/super/i-block`

## v4.0.0-beta.39 (2023-11-16)

#### :house: Internal

* Fixed typings in `core/init` and `models/modules/session`

#### :boom: Breaking Change

* Now `i18n` is a factory for creating internationalizing function `components/super/i-block/state`
* Now `t` is an internationalization function for the component, and not an alias for `i18n` `components/super/i-block/state`

## v4.0.0-beta.38 (2023-11-15)

#### :bug: Bug Fix

* The function `getParent` now checks if the component is inside a slot `core/component/render` `build/snakeskin`
* Fixed incorrect slide alignment when there is only one slide presented `base/b-slider`

## v4.0.0-beta.37 (2023-10-27)

#### :rocket: New Feature

* Added a new method `strictEmit` for strict event type checking `iBlock`

#### :bug: Bug Fix

* Fixed an issue with passing Iterable strings as values `iActiveItems`
* Fixed an issue with folding tree items `bTree`
* Fixed declarations of optional deps `iStaticPage`

## v4.0.0-beta.36 (2023-10-23)

#### :bug: Bug Fix

* Added the missed `itemsProp` property `bVirtualScroll`

## v4.0.0-beta.35 (2023-10-20)

#### :rocket: New Feature

* Added the ability to type events `iBlock`

## v4.0.0-beta.34 (2023-10-20)

#### :bug: Bug Fix

* The method `createDataProviderInstance` should be accessible at `beforeCreate` `iBlock`

## v4.0.0-beta.33 (2023-10-18)

#### :rocket: New Feature

* Added new config option `webpack.externalizeInline` `config`
* Added the ability to build initial HTML file without any inline Javascript by configuring `webpack.externalizeInline` `iStaticPage`

## v4.0.0-beta.32 (2023-10-17)

#### :rocket: New Feature

* Added a factory to create data providers `iBlock`
* Added support for setting a global application ID `core/init`

## v4.0.0-beta.31 (2023-10-12)

#### :rocket: New Feature

* Added the `theme` modifier calculation to components `components/super/i-block`

## v4.0.0-beta.30 (2023-10-11)

#### :boom: Breaking Change

* Now the `saveEnv` function takes the state as an argument `core/abt`

#### :rocker: New Feature

* `config`:
  * Added default values for `runtime` theme parameters
  * Added a new option `module-parallelism` option, which sets the [`parallelism`](https://webpack.js.org/configuration/other-options/#parallelism) option for a webpack
  * Added a new option `trace-build-times`, which enables the build time tracing

* Added build time tracing, which can be visualized using the [Perfetto UI](https://ui.perfetto.dev)
* Added a new stylus function `themeAttribute` `build/stylus/ds`
* Added possibility to configure the theme attribute `components/global/g-def`

#### :bug: Bug Fix

* Fixed an issue with `i-data` `initLoad` mutating a request params which leads to the data reload `components/super/i-data`
* Fix initializing of the `helpers` and `providers` blocks in `i-static-page` and `i-block` for SSR
* Fixed data restoration of provider after hydration `iData`

## v4.0.0-beta.29 (2023-10-02)

#### :rocket: New Feature

* Support for canceling the execution of the directive `v-async-target`
* Added a new prop `ssrRendering` `iBlock`

#### :bug: Bug Fix

* Teleports should not be rendered during SSR `iStaticPage`
* Save state to hydration store during SSR `components/friends/state`

## v4.0.0-beta.28 (2023-09-26)

#### :rocket: New Feature

* `build/snakeskin`:
  * Added the `n` filter for correctly overriding templates within the same namespace
  * Added the ability to create hard links in the `b` filter for correctly overriding templates

#### :bug: Bug Fix

* Now, data for hydration is saved before applying converters `iData`

## v4.0.0-beta.27 (2023-09-22)

#### :bug: Bug Fix

* Fixed icons' size in multi-theme mode `components/global/g-def`

## v4.0.0-beta.26 (2023-09-20)

#### :bug: Bug Fix

* Fixed providing of external classes `bList` `bSelect`
* Fixed initializing during SSR `bList` `bTree` `bSelect`

#### :house: Internal

* The module has been moved to a separate folder `build/webpack/loaders/symbol-generator-loader`

## v4.0.0-beta.25 (2023-09-19)

#### :bug: Bug Fix

* Fixed components' props normalization during SSR `core/component`

## v4.0.0-beta.24 (2023-09-19)

#### :bug: Bug Fix

* Added support for serialization of custom objects during hydration `core/component/hydration`

## v4.0.0-beta.23 (2023-09-18)

#### :bug: Bug Fix

* Fixed components' props normalization during SSR `core/component`

## v4.0.0-beta.22 (2023-09-15)

#### :rocket: New Feature

* Added a new property `ssrState` `core/component/interface`
* Added support for `ssrState` `iBlock` `core/init`
* Added state forwarding to provider parameters `components/friends/data-provider`

#### :bug: Bug Fix

* Fixed the race condition issue with fast re-rendering of functional components `core/component/functional`

## v4.0.0-beta.21 (2023-09-14)

#### :rocket: New Feature

* Added a new modifier `after:` for hooks `core/component/hook`
* Added a new hook `after:beforeDataCreate` `core/component/meta`

* `bSlider`:
  * Added a new prop `alignLastToEnd` which is similar to existing `alignFirstToStart` and is also `true` by default
  * Added a new prop `autoSlideInterval`
  * Added a new prop `autoSlidePostGestureDelay`

#### :bug: Bug Fix

* The method `initLoad` is now called on `after:beforeDataCreate` `iBlock`
* Fixed incorrect `align="end"` behaviour `bSlider`

## v4.0.0-beta.20 (2023-09-13)

#### :rocket: New Feature

* `config`:
  * Added `verbose` flag to `build` config
  * Added `detectUserPreferences` parameter to `theme` config

* Warnings about deprecated design system fields are hidden under the `verbose` flag `build/stylus/ds`
* Added possibility to detect the theme based on user system settings `components/super/i-static-page/modules/theme/theme-manager`
* Added possibility to specify paths with alias to `@context` directive `build/monic`
* Added possibility to load icons from design-system `components/directives/icon`

## v4.0.0-beta.19 (2023-09-08)

#### :rocket: New Feature

* Added possibility to change icons' color according to the selected theme `components/global/g-def`

#### :house: Internal

* Discard the function constructor in prelude

## v4.0.0-beta.18 (2023-09-08)

#### :rocket: New Feature

* Added a new parameter `setup` `core/init`

## v4.0.0-beta.17 (2023-09-06)

#### :bug: Bug Fix

* Added a special element for teleports `iStaticPage`

## v4.0.0-beta.16 (2023-09-06)

#### :bug: Bug Fix

* Fixed working in SSR `core/component/directives/render`

#### :nail_care: Polish

* Exported `isCI` from `tests/config/super`
* Set `workers: 1` and `fullyParallel: false` on CI in `tests/config/super`.
  See https://github.com/microsoft/playwright/issues/26739.

## v4.0.0-beta.15 (2023-09-05)

#### :bug: Bug Fix

* Added filtering of empty leading and trailing text nodes during rendering of a VNode array `core/component/engines/vue`

## v4.0.0-beta.14 (2023-08-25)

#### :house: Internal

* The default control is a button `iControlList`

## v4.0.0-beta.13 (2023-08-24)

#### :rocker: New Feature

* Webpack build helpers:
  * Added `getManagedPath` helper, which generates a managed path for node_modules with excluding
  * Added `prepareLibsForRegExp` helper, which converts the list of library names to a regexp string
  * Added `createDepRegExp` helper, which create a regexp matching all deps except excluded

* Webpack plugins:
  * Added a new plugin `invalidate-external-cache`

* Config:
  * Added `managed-libs` option, which add specified libraries to `snapshot.managedPaths` and watches
  them in webpack watch mode

#### :bug: Bug Fix

* A default `endsWith: "?"` parameter has been added to the route configuration to correctly parse route parameters when
  there are query parameters in the path `core/router`

## v4.0.0-beta.12 (2023-08-21)

#### :bug: Bug Fix

* If the element was in focus, it needs to be restored after validating `iInput`

## v4.0.0-beta.11 (2023-08-18)

#### :rocket: New Feature

* Improved display of warnings about deprecated design system fields `build/stylus/ds`
* Added possibility to specify a complicated color tokens `build/stylus/ds`
* Added possibility to change the method that will be used for transitions when the router
  synchronizes its state with the component's state by using `syncRouterState` `iBlock`

#### :bug: Bug Fix

* Fixed an issue where the default behavior of the `convertStateToRouterReset` did not affect the router `iBlock`
* Fixed resetting router state `friends/state`
* Fixed a bug with resolving a promise returned by the `iLockPageScroll.lock` `traits/i-lock-page-scroll`

## v4.0.0-beta.10 (2023-07-27)

#### :boom: Breaking Change

* Merging of parameters when navigating to a route with the same name as the current one has been removed `bRouter`

#### :rocket: New Feature

* Added storybook support

#### :bug: Bug Fix

* Fixed alias priority when resolve path parameters `core/router`

## v4.0.0-beta.9 (2023-07-19)

#### :boom: Breaking Change

* The string value compilation in `getItemKey` helper was removed.
  Now the string parameter is used as a property name to get the key value. `components/traits/i-items/i-items`

* The `data-cached-dynamic-class` attribute format is changed to the `core/json#evalWith` reviver format `core/component/render/helpers/attrs`

#### :rocket: New Feature

* Added a new method `getHref` `b-list`
* Added a new `hrefTransition` event to provide the ability to prevent router navigation when a link is clicked `bRouter`
* Added `.scrollTo()` and `.scrollToTop()` methods `tests/helpers/scroll`

#### :house: Internal

* The `kv-storage/engines/cookies` engine now inherits from `kv-storage/engines/string`

## v4.0.0-beta.8 (2023-07-07)

#### :bug: Bug Fix

* Fixed incorrect update of the `selected` parameter in the native mode of the `b-select`

## v4.0.0-beta.7 (2023-06-27)

#### :rocket: New Feature

* Added support for `mailto:` and `tel:` href-s `b-router`

## v3.57.1 (2023-06-27)

#### :bug: Bug Fix

* Handle unsuitable `pathParams` values in the `fillRouteParams` function `bRouter`

## v3.50.0 (2023-06-16)

#### :rocket: New Feature

* Fill original route path parameters from URL of the route that redirects on it in `core/router`

## v3.49.0 (2023-05-31)

#### :rocket: New Feature

* Added ability to specify a custom validator function in `i-input`

## v3.48.0 (2023-05-30)

#### :rocket: New Feature

* Added new helpers for working with gradients and shadows from the design system `global/g-def/funcs`

## v3.47.4 (2023-05-29)

#### :bug: Bug Fix

* Fixed a bug when observing fields that are redefined from props `core/component/decorators`

## v3.47.3 (2023-05-26)

#### :rocket: New Feature

* Added a new helper for collecting i18n keysets `build/helpers`

## v3.47.2 (2023-05-18)

#### :bug: Bug Fix

* Fixed a bug when the overridden getter with cache had a value equal to the parent's getter value `core/component/decorators`

## v3.47.1 (2023-05-18)

#### :bug: Bug Fix

* Replace `undefined` values in `route.params` by an alias or query param, if necessary, in `b-router`

## v3.47.0 (2023-05-05)

#### :rocket: New Feature

* Added ability to exclude an item from being activated by specifying `activatable` flag in `i-active-items` trait
* Added `getItemByValue` method in `i-active-items` trait, `b-list` and `b-tree`

## v3.46.4 (2023-05-05)

#### :bug: Bug Fix

* Fixed a bug with negative values in design system `build/stylus/ds/helpers`

## v3.46.3 (2023-04-28)

#### :bug: Bug Fix

* Fixed a bug with the `typograf` filter that didn't work due to the wrong locale path.

## v3.46.2 (2023-04-26)

#### :house: Internal

* Migrate on `node@18`

## v3.46.1 (2023-04-13)

#### :bug: Bug Fix

* Disabled js minify in html loader

## v3.46.0 (2023-04-10)

#### :house: Internal

* Updated `playwright@1.32.1`

## v3.45.0 (2023-04-04)

#### :house: Internal

* Moving to `yarn` package manager
* Updated CI script to `yarn`
* Removed unused dependencies
* Updated dependencies:
  * `favicons@7.1.0`
  * `@statoscope/webpack-plugin@5.25.1`
  * `webpack-cli@5.0.1`
  * `webpack@5.76.0`

## v3.44.3 (2023-03-30)

#### :bug: Bug Fix

* Overriding original parameter by alias in route `b-router` `core/router`

## v3.44.2 (2023-03-29)

#### :house: Internal

* Changed `optionProps` and `itemProps` params `bSlider`

## v3.44.1 (2023-03-28)

#### :rocket: New Feature

* Added possibility to specify aliases for dynamic parameters in path `b-router` `core/router`

## v3.43.1 (2023-03-27)

#### :bug: Bug Fix

* Fixed a bug when typograf does not support the given locale `build/snakeskin`

## v3.43.0 (2023-03-23)

#### :bug: Bug Fix

* Added automatic `item.value` generation `bTree` `bList`
* Fixed overloads for `fold`/`unfold` methods `bTree`

## v3.42.1 (2023-03-14)

#### :nail_care: Polish

* Changed `activeElement` getter return type `bList`

## v3.42.0 (2023-03-14)

#### :bug: Bug Fix

* Removed some options of `html-webpack-plugin` that causes bugs
* Fixed replace pattern for `i18n` webpack plugin

## v3.41.0 (2023-03-14)

#### :boom: Breaking Change

* Renamed option `Item['id']` to `Item['value']` `bTree`

#### :rocket: New Feature

* Added a new trait `iActiveItems`
* Added `iActiveItems` implementation `bTree` `bList`

## v3.40.1 (2023-03-13)

#### :bug: Bug Fix

* Fixed Windows support in localization plugin `build/webpack/plugins/i18n-plugin`

## v3.40.0 (2023-03-10)

#### :house: Internal

* Updated `html-loader@4.2.0`
* Added variable `BUILD_MODE` into `index.d.ts` from webpack globals
* Added the possibility to change the manifest href and added `use-credentials` attribute

## v3.39.0 (2023-03-07)

#### :rocket: New Feature

* Added new options `i18n` `config`
* Added a new plugin `i18n-plugin` `build/webpack`

## v3.38.0 (2023-02-20)

#### :bug: Bug Fix

* Fixed use of `i18n` function in default prop values `iBlock`

## v3.37.0 (2023-02-20)

#### :bug: Bug Fix

* Downgraded `css-loader` version for fix svg bundling

## v3.36.0 (2023-02-14)

#### :house: Internal

* Replaced `fast-css-loader` with `css-loader`

## v3.35.0 (2023-02-14)

#### :boom: Breaking Change

* Changed `i18n` function type from prop to getter `iBlock`

#### :rocket: New Feature

* Integrating the new internationalization API

## v3.34.1 (2023-01-31)

#### :house: Internal

* Added the ability to specify webpack aliases from the config `build/webpack/alias`

## v3.34.0 (2023-01-30)

#### :boom: Breaking Change

* [Now `commonjs` module will not be installed for typescript processing into `fathtml` mode, instead `module` from `tsconfig` will be taken by default `config/default`](https://github.com/V4Fire/Client/discussions/773)

#### :house: Internal

* Added `test:circular-deps` npm script for analyzing circular deps
* Fixed few circular deps

## v3.33.0 (2022-12-28)

#### :rocket: New Feature

* Added the ability to manipulate meta information of a page with `super/i-static-page/modules/page-meta-data`

## v3.32.1 (2022-12-26)

#### :bug: Bug Fix

* Fixed a bug with not setting an initial value of `hidden` modifier `base/b-bottom-slide`

## v3.32.0 (2022-12-21)

#### :rocket: New Feature

* `bTree`:
  * Added new methods `traverse`, `fold`, `unfold`, `toggleFold`

#### :bug: Bug Fix

* `bTree`:
  * Fixed passing props to nested trees
  * Fixed an issue with the prop `itemProps` not being added to items attributes
  * Fixed adding the `folded_false` class to items without children

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* The first public release of the 4th version

## v3.31.0 (2022-12-06)

#### :rocket: New Feature

* Added possibility to disable specific link interception

## v3.30.2 (2022-11-17)

#### :bug: Bug Fix

* Fixed soft transitions with array parameters `base/b-router`
* Fixed an issue with testing userAgent string for desktop Safari `core/browser`

## v3.30.1 (2022-10-25)

#### :bug: Bug Fix

* Fixed an issue with wrong arguments was provided into `getItemKey` `base/b-virtual-scroll`

## v3.30.0 (2022-10-19)

#### :rocket: New Feature

* `iBlock`:
  * Added a new `InfoRender` module
  * Added a new `initInfoRender` method

## v3.29.0 (2022-09-13)

#### :boom: Breaking Change

* Removed `global/g-visible`
* Renamed the global `hide-if-offline` attribute to `data-hide-if-offline` `iStaticPage`

#### :bug: Bug Fix

* The online watcher is now created with the `immediate` flag `iStaticPage`

#### :memo: Documentation

* Added missing documentation `data-hide-if-offline` `iStaticPage`

## v3.28.0 (2022-09-12)

#### :boom: Breaking Change

* Removed `printLn-progress-view` `build/webpack/plugins/progress-plugin`

### :bug: Bug Fix

* Now `WebpackProgressPlugin` properly work with the Webpack watch mode `build/webpack/plugins/progress-plugin`

### :rocket: New Feature

* Now `WebpackProgressPlugin` work within the CI environment `build/webpack/plugins/progress-plugin`

## v3.27.0 (2022-08-30)

#### :boom: Breaking Change

* Update `favicons` dependency on beta version `favicons@7.0.0`
* Now `static:favicons:build` working with `favicons@7` `build/gulp`

#### :rocket: New Feature

* Added helpers for working with favicons assets `build/helpers`
* Added favicons folder path in the global `PATH` variable `build/webpack/plugins`
* Added global styles to hide elements if there is no internet connection `src/global/g-visible`
* Now the `iVisibile` trait can hide components if there is no internet connection `src/traits/i-visible`

## v3.26.0 (2022-08-26)

#### :boom: Breaking Change

* `build.demoPage` is a function now `config/default`

## v3.25.0 (2022-08-19)

#### :boom: Breaking Change

* Changed calculation of `textHintWithIndent` to concatenation `bInput.value` and `textHint` without space between it `form/b-input`

## v3.24.2 (2022-08-19)

#### :house: Internal

* Provided unsafe access to the `engine` field `base/b-router`

## v3.24.1 (2022-08-19)

#### :house: Internal

* Refactor of the statoscope config build script `build/build-statoscope`

## v3.24.0 (2022-08-12)

#### :boom: Breaking change

* Removed outdated helpers for webpack stats files `build/gulp`

#### :rocket: New Feature

* Added a new plugin `statoscope-webpack-plugin` `build/webpack`
* Added a new script to build the statoscope config file `build/build-statoscope`

## v3.23.10 (2022-08-12)

#### :bug: Bug Fix

* Global component styles are no longer loaded using `import()` `build/monic`

## v3.23.8 (2022-07-22)

#### :bug: Bug Fix

* Fixed opening a link in a new tab with the CMD meta key on macOS `base/b-router`

## v3.23.7 (2022-07-22)

#### :bug: Bug Fix

* [Removed ES6 code from the prelude loader](build/webpack/loaders/prelude-loader.js)

## v3.23.6 (2022-07-13)

#### :bug: Bug Fix

* [Added a new TypeScript transformer to transpile modern regexps for integrability with polyfills](build/ts-transformers)

## v3.23.4 (2022-07-08)

#### :house: Internal

* [Removed setting of `optimization.moduleIds`](build/webpack/optimization.js)

## v3.23.3 (2022-07-08)

#### :rocket: New Feature

* [Added a new method to import modules into the test environment `tests/helpers/utils#import`](tests/helpers/utils.ts)

#### :house: Internal

* [`optimization.moduleIds` is now set as `named`](build/webpack/optimization.js)
* All test helpers now have static methods (similar to prototype methods)
* Test migration from outdated API:
  * `b-form`
  * `b-button`
  * `b-checkbox`

## v3.23.2 (2022-07-04)

#### :bug: Bug Fix

* [Fixed an issue with test server being spawned with incorrect `cwd`](tests/server/config.ts)

## v3.23.1 (2022-06-14)

#### :bug: Bug Fix

* Fixed `textHint` position `form/b-input`

## v3.23.0 (2022-05-27)

#### :rocket: New Feature

* Added a new checker `is.Safari` `core/browser`

#### :bug: Bug Fix

* Fixed a bug with the History API router engine when backing to the first history item doesn’t emit a popstate event in Safari if the script is running within an iframe `core/router/engines/browser-history`

## v3.22.0 (2022-05-26)

#### :boom: Breaking Change

* Replaced `simpleProgressWebpackPlugin` to a custom plugin
* Removed generation of redundant artifacts (`license.txt`, empty entry files) `build`
* Now all comments are removed from compiled CSS files by default

#### 🐛 Bug Fix

* Removed deadlock during execution of Snakeskin templates `i-static-page/modules/ss-helpers`

#### :house: Internal

* Added human-readable names for all registered webpack process `build/webpack`

## v3.21.1 (2022-05-25)

#### 🐛 Bug Fix

* Fixed `b-input` overflowing when `textHint` provided `form/b-input`

## v3.21.0 (2022-05-24)

#### :rocket: New Feature

* Added a new prop `textHint` to show extra text after the component non-empty input `form/b-input`

## v3.20.0 (2022-04-25)

#### :boom: Breaking Change

* Removed `worker-loader` `build`
* Removed all options associated with `worker-loader` `config`

## v3.19.2 (2022-04-19)

#### :bug: Bug Fix

* Fixed a bug with `iHistory` repeatedly initializing when opening bottom-slide from a non-zero step `base/b-bottom-slide`

#### :house: Internal

* Downgraded TS to `4.6.2`

## v3.19.1 (2022-04-12)

#### :house: Internal
5.0 typescript@4.6.3

## v3.19.0 (2022-04-06)

#### :boom: Breaking Change

* The old test API is now deprecated:
  * `test.d.ts` was removed
  * The `config` package now uses an alias `@config/config`
  * [Test helpers was rewritten to `TS`](docs/tests/migration/README.md#changing-the-test-helper-api)

#### :rocket: New Feature

* [Add new test API](docs/tests/migration/README.md)

# v3.18.6 (2022-05-02)

#### :bug: Bug Fix

* `updateRequest` is now returns a `RequestPromise` `core/session`

# v3.18.5 (2022-04-02)

#### :bug: Bug Fix

* Fixed sprite inheritance `traits/i-icon`

# v3.18.4 (2022-04-01)

#### :bug: Bug Fix

* Fixed a bug when event data is provided as a promise `iData`

## v3.18.2 (2022-03-22)

#### :bug: Bug Fix

* Fixed an issue with `initLoad` race condition `base/b-virtual-scroll`

## v3.18.1 (2022-03-05)

#### :house: Internal

* Freezing versions of all dependencies from package.json

## v3.18.0 (2022-03-04)

#### :boom: Breaking Change

* If an element destructor returns `true` then the element won't be destroyed `super/i-block/modules/async-render`

## v3.17.0 (2022-02-24)

#### :boom: Breaking Change

* Now components don't force rendering on re-activation `iBlock`

#### :rocket: New Feature

* Added a new prop `renderOnActivation` `iBlock`

## v3.16.2 (2022-02-22)

#### :bug: Bug Fix

* Fixed an issue with the `nonceStore.result` field `config`

## v3.16.1 (2022-02-15)

#### :bug: Bug Fix

* [Fixed an issue with `b-slider` works incorrectly in a slider mode `base/b-slider`](https://github.com/V4Fire/Client/issues/691)

## v3.16.0 (2022-02-09)

#### :rocket: New Feature

* [Now `monic` options are passed to `pzlr` when building a dependency graph `build/graph`](https://github.com/V4Fire/Client/issues/684)
* [Added a new `build.mode` config variable `config/default`](https://github.com/V4Fire/Client/issues/685)

## v3.15.5 (2022-02-03)

#### :bug: Bug Fix

* Fixed an issue with the `test:component:build` command did not wait for completion of the project build operation `build/gulp/test`
* Changed a script to patch the Webpack stats' file for Statoscope `build/helpers/webpack`

## v3.15.4 (2022-01-24)

#### :boom: Breaking Change

* The event`chunkRenderStart` is renamed to `chunkRender:renderStart` and now it emits before a component driver renders components `base/b-virtual-scroll`

#### :rocket: New Feature

* Added new events `chunkRender:*` `base/b-virtual-scroll`

## v3.15.3 (2021-12-28)

#### :bug: Bug Fix

* Fixed linking to `globalThis` `core/prelude/webpack`

## v3.15.2 (2021-12-28)

#### :bug: Bug Fix

* Fixed watching of computed properties that tied with mounted watchers `core/object/watch`

## v3.15.1 (2021-12-17)

#### :bug: Bug Fix

* Fixed a bug with forwarding Webpack params `build/gulp`

## v3.15.0 (2021-12-16)

#### :boom: Breaking Change

* Now `webpack` & `@v4fire/core` are marked as peer-dependencies

#### :bug: Bug Fix

* Fixed issues with symlinks `build`
* Fixed a bug with Webpack params forwarding into gulp tasks `build/gulp`

## v3.14.0 (2021-12-08)

#### :boom: Breaking Change

* Moved from `Sugar/camelize/string-dasherize/urlconcat` to `@v4fire/core`

## v3.13.3 (2021-12-08)

#### :bug: Bug Fix

* Removed the race condition while loading a new page `bDynamicPage`

## v3.13.2 (2021-12-06)

#### :house: Internal

* [Wrapped animations with `requestAnimationFrame`](https://github.com/V4Fire/Client/issues/170)

## v3.13.1 (2021-12-02)

#### :house: Internal

* Bumped `node/npm` within `ci`
* Removed unsafe `<any>` casts

## v3.13.0 (2021-11-29)

#### :boom: Breaking Change

* Removed `typograf-loader` `build/webpack`

#### :house: Internal

* Don't apply `symbol-generator-loader` for ES6+ `build/webpack`

## v3.12.2 (2021-11-26)

#### :bug: Bug Fix

* Fixed bugs from migration to `webpack-cli@4`

## v3.12.1 (2021-11-26)

#### :bug: Bug Fix

* Fixed using `asyncRender` within nested flyweight components `core/component/render-function`
* Fixed a bug when a build was failed without passing a design system package name at the environment `build/stylus`

## v3.12.0 (2021-11-26)

#### :boom: Breaking Change

* Migration to `webpack-cli@4`

#### :house: Internal

* Replaced `uniconf` to `@v4fire/config`

## v3.11.4 (2021-11-24)

#### :bug: Bug Fix

* Don't cache computed properties within flyweight components `core/component/accessor`

## v3.11.3 (2021-11-24)

#### :bug: Bug Fix

* Don't immediately destroy functional components `iBlock`

## v3.11.2 (2021-11-24)

#### :house: Internal

* Added a new Gulp task to patch Webpack stats reports `build/gulp`

## v3.11.1 (2021-11-22)

#### :house: Internal

* Added possibility to redefine Statoscope size and download time limit `config`

## v3.11.0 (2021-11-18)

#### :rocket: New Feature

* Added a new Gulp task to purify Webpack stats reports `build/gulp`

#### :bug: Bug Fix

* Fixed bugs with transforming `stats` reports `build/gulp`

## v3.10.2 (2021-11-16)

#### :bug: Bug Fix

* Now `callControlAction` fully respects promise values `iControlList`

## v3.10.1 (2021-11-16)

#### :bug: Bug Fix

* Now `callControlAction` respects promise values `iControlList`

## v3.10.0 (2021-11-16)

#### :boom: Breaking Change

* Removed legacy filters for `:key` attributes `build/snakeskin`

#### :rocket: New Feature

* Now `get` can access properties through promises `super/i-block/modules/field`

* `build/webpack`:
  * Deleted a Webpack plugin `statoscopePlugin`
  * Added a new Webpack plugin `SimpleProgressWebpackPlugin` to view the current build status

* Added a gulp task to transform `stats` reports from Webpack `build/gulp`
* Added a config for Statoscope `config`

## v3.9.1 (2021-11-09)

#### :boom: Breaking Change

* Now base CSS styles are synchronously loaded by default if enabled CSP `iStaticPage`

## v3.9.0 (2021-11-08)

#### :rocket: New Feature

* Added a new Webpack plugin `statoscopePlugin` `build/webpack`
* [Added `optionsResolver` into `core/dom/image`](https://github.com/V4Fire/Client/issues/168)

* `base/b-virtual-scroll`:
  * [Added a new event `chunkRenderStart`](https://github.com/V4Fire/Client/issues/651)
  * [Added `pageNumber` in `chunkLoaded` event](https://github.com/V4Fire/Client/issues/651)

#### :bug: Bug Fix

* Fixed invalid escaping of `csp.nonce` `iStaticPage`

#### :house: Internal

* Added `TestParams` interface for `BrowserTests` `test.d.ts`

## v3.8.3 (2021-10-26)

#### :bug: Bug Fix

* Fixed a bug with removing a modifier from the passed node `super/i-block/modules/block`

## v3.8.2 (2021-10-26)

#### :bug: Bug Fix

* Fixed providing of hooks to directives within non-regular components `core/component/engines`

## v3.8.1 (2021-10-25)

#### :house: Internal

* Updated dependencies: `playwright@1.16.1`, `webpack@5.60.0`

## v3.8.0 (2021-10-25)

#### :rocket: New Feature

* Added a new Snakeskin block `render` `iBlock`

## v3.7.0 (2021-10-25)

#### :boom: Breaking Change

* Deprecate test methods:
  * `DOM.waitForEl`
  * `DOM.isVisible`
  * `Request.waitForRequests`
  * `Request.waitForRequestsFail`
  * `Request.interceptRequest`
  * `Request.interceptRequests`
  * `Request.waitForRequestsEvents`
  * `Utils.setup`
  * `Utils.reloadAndWaitForIdle`
  * `Component.setPropsToComponent`
  * `Component.reloadAndSetProps`

#### :rocket: New Feature

* Added a new `?inline` parameter for assets loaders `build/webpack`

#### :house: Internal

* `runtime-render` test argument is no longer needed and supported

#### :nail_care: Polish

* Added better test documentation

## v3.6.1 (2021-10-14)

#### :house: Internal

* Added a new Gulp task `gulp build:components-lock`

## v3.6.0 (2021-10-14)

#### :rocket: New Feature

* Added a new parameter `componentLockPrefix` `config.build`

## v3.5.5 (2021-10-13)

#### :bug: Bug Fix

* Fixed ordering of dependencies loading `build/monic/attach-component-dependencies`

## v3.5.4 (2021-10-12)

#### :bug: Bug Fix

* Fixed a bug when dynamically loaded templates aren't registered to the global `TPLS` cache `build/monic/attach-component-dependencies`
* Fixed an issue when `component` returns `undefined` `bRouter`

#### :nail_care: Polish

* Show browser version before tests

## v3.5.3 (2021-10-06)

#### :bug: Bug Fix

* Fixed synchronization of values during input events:
  * `bInput`
  * `bSelect`

#### :nail_care: Polish

* Show Playwright version before tests

## v3.5.2 (2021-10-06)

#### :bug: Bug Fix

* Fixed providing of meta parameters via transitions `bRouter`
* [Fixed an issue with failed tests not being displayed as failed `build/gulp/test`](https://github.com/V4Fire/Client/issues/620)

#### :house: Internal

* Updated dependencies: `typescript@4.4.3`, `eventemitter2@6.4.5`, `playwright@1.15.2`

## v3.5.1 (2021-09-20)

#### :bug: Bug Fix

* Fixed crashing when building the app when enabled `dynamicPublicPath` `global/g-def`

## v3.5.0 (2021-09-16)

#### :boom: Breaking Change

* Renamed `browser.history` to `browser-history` `core/router/engines`

#### :rocket: New Feature

* Added a new router engine `core/router/engines/in-memory`

#### :bug: Bug Fix

* Fixed calling of the `getBrowserArgs` function `build/helpers/test`
* Fixed some cases when the previous page `bDynamicPage`

#### :house: Internal

* `bRouter`:
  * Added new tests for the `in-memory` engine
  * Call `updateCurrentRoute` only when `basePath` prop changes but not the property itself

## v3.4.0 (2021-09-09)

#### :boom: Breaking Change

* `build`:
  * Most of webpack config files moved to the `webpack` folder
  * Renamed the `replacers` folder to `monic`

#### :house: Internal

* Review `build` modules

## v3.3.4 (2021-09-06)

#### :bug: Bug Fix

* Now `fatHTML` can be provided as a boolean `config`

#### :house: Internal

* Updated dependencies: `typescript@4.4.2`

## v3.3.3 (2021-08-13)

#### :bug: Bug Fix

* Fixed providing of a dynamic public path to styles `build`

## v3.3.2 (2021-08-12)

#### :bug: Bug Fix

* Testing the particular color to detect if a style is already loaded `build`

## v3.3.1 (2021-08-12)

#### :bug: Bug Fix

* Provide magic comments to dynamic imports `build`

## v3.3.0 (2021-08-12)

#### :rocket: New Feature

* Added `stats.webpack` `build`

* `config`:
  * Added `webpack.stats`
  * Added providing of default parameters
  * Now `webpack.fatHTML` has different modes

#### :bug: Bug Fix

* Added normalizing of trailing slashes from `webpack.publicPath` `iStaticPage`
* Added `webpack.stats` `config`

* `build`:
  * Added support for magic comments within imports
  * Added support for the --json parameter
  * Hid invalid build warnings

#### :memo: Documentation

* Added documentation `iStaticPage`

#### :house: Internal

* Added `webpack-bundle-analyzer`
* Updated dependencies:
  * `webpack@5.50.0`
  * `gulp-favicons@3.0.0`
  * `style-loader@3.2.1`
  * `svg-sprite-loader@6.0.9`
  * `svgo@2.3.1`
  * `svgo-loader@3.0.0`
  * `css-minimizer-webpack-plugin@3.0.2`
  * `mini-css-extract-plugin@2.2.0`
  * `cssnano@5.0.7`
  * `postcss@8.3.6`
  * `postcss-loader@6.1.1`
  * `autoprefixer@10.3.1`
  * `stylus-loader@6.1.0`
  * `html-loader@2.1.2`

## v3.2.3 (2021-08-05)

#### :bug: Bug Fix

* Fixed providing of `keepAlive` `bDynamicPage`

## v3.2.2 (2021-08-05)

#### :bug: Bug Fix

* Fixed an issue when `PUBLIC_PATH` is providing via `definePlugin` `core/prelude/webpack`

## v3.2.1 (2021-08-05)

#### :bug: Bug Fix

* Fixed normalizing of `--public-path` `config`

## v3.2.0 (2021-08-05)

#### :rocket: New Feature

* Added a new parameter `--inline-initial` `config`

## v3.1.0 (2021-08-04)

#### :rocket: New Feature

* `iBlock`:
  * Added a new `stage` modifier
  * Added a new event `mounted`

#### :bug: Bug Fix

* Fixed a route comparison in the transition handler `super/i-block/modules/activation`

* `iStaticPage`:
  * Fixed project building without `--public-path`
  * Don't attach favicons if they are disabled

#### :house: Internal

* Marked the `hook` setter as protected `iBlock`

## v3.0.1 (2021-07-28)

#### :bug: Bug Fix

* Fixed building favicons from parent layers `iStaticPage`

## v3.0.0 (2021-07-27)

#### :rocket: New Feature

* Initial release:
  * `bDummyModuleLoader`
  * `bDummyState`

#### :bug: Bug Fix

* Fixed removing of modifiers `super/i-block/modules/state`

#### :house: Internal

* Added tests:
  * `super/i-block/modules/module-loader`
  * `super/i-block/modules/state`
  * `super/i-block/modules/vdom`

## v3.0.0-rc.216 (2021-07-26)

#### :bug: Bug Fix

* Fixed providing `watchProp` in an object form `iBlock`

#### :rocket: New Feature

* Initial release `bDummyDecorators`

## v3.0.0-rc.215 (2021-07-25)

#### :bug: Bug Fix

* Fixed a bug when the `component` getter is `undefined`.
  Now the getter can return a promise in that case `base/b-dynamic-page`.

* Fixed canceling of previous tasks with `scrollToProxy` `iPage`
* Restored support of favicons `build/static.gulp` `iStaticPage`

#### :house: Internal

* Added tests:
  * `iPage`
  * `iStaticPage`

## v3.0.0-rc.214 (2021-07-22)

#### :boom: Breaking Change

* Now `providerDataStore` implements `core/cache` `i-static-page/modules/provider-data-store`

#### :memo: Documentation

* Added documentation `i-static-page/modules/provider-data-store`

## v3.0.0-rc.213 (2021-07-22)

#### :bug: Bug Fix

* Fixed invalid resolving of `r` `iBlock`

## v3.0.0-rc.212 (2021-07-22)

#### :bug: Bug Fix

* Fixed an issue when Vue drops a prototype from the route object `iStaticPage`
* Fixed an issue with dynamically created components and the `r` getter `iBlock`
* Fixed an issue when passed route parameters ignored if defined the `alias` property `core/router`

## v3.0.0-rc.211 (2021-07-21)

#### :boom: Breaking Change

* Now the component uses `<section>` within `bWindow`
* Now the component uses `<main>` within `bDynamicPage`
* Now the component uses `<aside>` within `bSidebar`
* [Fixed an issue with providing analytics data into `traits/i-control-list`](https://github.com/V4Fire/Client/issues/452)
* Now the trait sets the `disabled` modifier on progress `traits/i-progress`
* Now the component uses `<button>` is not specified `href` `bList`

#### :rocket: New Feature

* Initial release:
  * `bDummyLfc`
  * `bDummySync`
  * `bDummyWatch`

* Added new tag name filters `:section` and `:-section` `build/snakeskin`
* Added new props `rootTag` and `rootAttrs` `iBlock`
* Added `topPath` and `originalTopPath` `core/component/reflection/getPropertyInfo`

* Now the trait uses `aria` attributes:
  * `traits/i-visible`
  * `traits/i-access`

* Now the component uses `aria` attributes:
  * `bSelect`
  * `bList`
  * `bButton`

* `bList`:
  * Added a new prop `attrsProp`
  * Added new props `listTag` and `listElTag`

* `bButton`:
  * Added a new prop `attrsProp`
  * Added a new getter `hasDropdown`

#### :bug: Bug Fix

* Provided the `lang` attribute to `<html>` `iStaticPage`
* Fixed a bug when providing `href` to `dataProvider` `bButton`
* Fixed a bug when mutations of the nested path can't be caught `super/i-block/modules/sync`
* Fixed watching with parameters `{immediate: true, collapse: true}` `core/component/watch`
* [Fixed an issue that allows for pulling an element far away from the bottom `base/b-bottom-slide`](https://github.com/V4Fire/Client/issues/463)
* Fixed an issue with an element not being visible if the `visible` prop was provided and the `contentMode` was `content` `base/b-bottom-slide`
* Fixed a case when the resolved value of `waitRef` is an empty array `iBlock`

#### :house: Internal

* Removed `jasmine` deps in the `runtime.debug` mode `super/i-static-page`

## v3.0.0-rc.210 (2021-07-07)

#### :boom: Breaking Change

* Migration from `fs-extra-promise` to `fs-extra`

#### :bug: Bug Fix

* `AsyncRender.waitForceRender` should allow the initial render of a component

#### :house: Internal

* Updated dependencies `delay@5.0.0`, `glob-promise@4.2.0`

## v3.0.0-rc.209 (2021-07-06)

#### :rocket: New Feature

* Added possibility to provide the element to drop via a function `super/i-block/modules/async-render`

#### :bug: Bug Fix

* Fixed updating of a component' template after changing a modifier that was registered as watchable `iBlock`

#### :house: Internal

* Updated dependencies `husky@7.0.0`, `tslib@2.3.0`, `ts-loader@9.2.3`

## v3.0.0-rc.208 (2021-06-29)

#### :bug: Bug Fix

* `super/i-block/modules/async-render`:
  * Don't render empty iterables
  * Fixed infinity loop with `waitForceRender`

## v3.0.0-rc.207 (2021-06-28)

#### :rocket: New Feature

* Initial release `bDummyAsyncRender`

#### :bug: Bug Fix

* Fixed emitting of `asyncRenderComplete` `super/i-block/modules/async-render`

## v3.0.0-rc.206 (2021-06-28)

#### :rocket: New Feature

* Added `activate` and `deactivate` to `ComponentInterface` `core/component`

#### :bug: Bug Fix

* Fixed a bug when `isActivated` returns `undefined` `iBlock`
* Fixed a bug when async rendered components don't call their destructors after removing from DOM `super/i-block/modules/async-render`

## v3.0.0-rc.205 (2021-06-24)

#### :rocket: New Feature

* Now converter functions `dbConverter`, `componentConverter`, `formConverter`, `formValueConverter` take a context
  as the second argument

#### :bug: Bug Fix

* Fixed applying of form converters `bForm`
* Fixed initializing of system fields `core/component/flyweight`

* Fixed a bug when a hook listener with the `once` modifier does not drop after usage
  if there are no more listeners to the same hook `core/component/hook`

* `super/i-block/modules/async-render`:
  * Now all operations that are registered by asyncRender use only `async`, but not `$async`
  * Fixed a bug when rendered chunk are destroyed after creation when passed a custom async group

#### :house: Internal

* Moved form data converting to `core/request` `bForm`

## v3.0.0-rc.204 (2021-06-23)

#### :boom: Breaking Change

* `super/i-block/modules/async-render`:
  * Now to iterate objects is used `Object.entries`
  * Now `filter` with a negative value removes elements from the render queue

#### :bug: Bug Fix

* Fixed async rendering with text elements `core/component/engines/vue/vnode`
* Fixed a bug when removing a valid keep-alive element from the cache `bDynamicPage`

## v3.0.0-rc.203 (2021-06-21)

#### :boom: Breaking Change

* Now `formValue` returns an array if the component is switched to the `multiple` mode `bSelect`
* Removed `iBlock.lazy`

#### :rocket: New Feature

* Added a new associated type `bList.Active`

#### :bug: Bug Fix

* Fixed caching of form values `bForm`
* Fixed a bug after setting a non-exist property that has bound watchers `super/i-block/modules/field`
* Fixed importing of `ModsTable` `bList`
* Do not take into account page location when constructing icon link `traits/i-icon/i-icon`.
  See [issues/554](https://github.com/V4Fire/Client/issues/554).

#### :memo: Documentation

* Improved documentation `super/i-block/modules/field`

#### :house: Internal

* Added tests `super/i-block/modules/field`

## v3.0.0-rc.202 (2021-06-18)

#### :bug: Bug Fix

* `bSelect`:
  * Empty value should be equal to `undefined`
  * Resetting of the component should also reset `text`

#### :house: Internal

* Added tests `bSelect`

## v3.0.0-rc.201 (2021-06-17)

#### :boom: Breaking Change

* The component was renamed `b-input-birthday` -> `b-select-date`
* Removed `bFileButton`

#### :rocket: New Feature

* Added a new `file` type `bButton`

#### :memo: Documentation

* Added documentation `bSelectDate`

#### :house: Internal

* Fixed ESLint warnings `bSelectDate`

## v3.0.0-rc.200 (2021-06-17)

#### :bug: Bug Fix

* `bSelect`:
  * Fixed a bug when changing of `value` does not emit selection of items
  * Fixed built-in `required` validator

#### :memo: Documentation

* Added documentation:
  * `bSelect`
  * `bIconButton`

## v3.0.0-rc.199 (2021-06-16)

#### :boom: Breaking Change

* Now `toggle` returns a component value `bCheckbox`
* Moved from `base` to `dummies` `bDummy`
* Removed `bInputTime`
* Removed `bScroll`

* `bList`:
  * `Items.classes` was replaced with `Items.mods`
  * Now `toggleActive` returns a new active item
  * New public API for `isActive`
  * Removed deprecated API

* Now the component inherits `iInputText`:
  * `bInput`
  * `bTextarea`
  * `bSelect`

* `bInput`:
  * Removed `&__super-wrapper`
  * New API of component validators

* `bSelect`
  * Now the component inherits `iInputText`
  * Now the component implements `iItems`

* `bForm`:
  * Now `validate` returns `ValidationError` in case of failed validation
  * Renamed `ValidateParams` to `ValidateOptions`
  * Changed the root tag `div` to `form`
  * Removed the `form` ref and block
  * Changed the default value of `method` from `add` to `post`
  * Removed legacy logic of the `'_'` name
  * Deprecated `ValidationError.el` and `ValidationError.validator`
  * Deprecated `values`

* `iInput`:
  * Removed `valueKey`
  * Now `groupFormValue` always returns an array
  * Renamed `dataType` to `formValueConverter`
  * Renamed `hiddenInputTag` to `nativeInputTag`
  * Renamed `hiddenInputType` to `nativeInputType`
  * Renamed `hiddenInputModel` to `nativeInputModel`

#### :rocket: New Feature

* Added `bDummyText`
* Added `iInputText`
* Added support of the default slot `bDummy`
* Added support of interpolation of a data provider response `iInput`
* Added `isChecked` `bCheckbox`

* `bSelect`:
  * Added a feature of multiple selection
  * Added `isSelected/selectValue/unselectValue/toggleValue`

* `bList`:
  * Now `Items.classes` uses to provide extra non-modifier classes to an element
  * Now `setActive/unsetActive/toggleActive` can take multiple values

* `bForm`:
  * Added `getElValueToSubmit`
  * Added the `submitEnd` event
  * Added `ValidationError.name/component/details`
  * Added `getValues`
  * Added `toggleControls`
  * Now `ValidationError` is a class
  * Now `submit` returns a value
  * Improved submit events

* `iInput`:
  * Now `formValueConverter` can be provided as an array
  * Added support for the `Maybe` structure
  * Added `attrsProp/attrs` properties
  * Added the `normalizeAttrs` method
  * Added the `nativeInput` block

#### :bug: Bug Fix

* Payload of the `actionChange` event must contain `value`, but not `mods.checked` `bCheckbox`
* Now `normalizeItems` does not modify the original object `bList`
* [Fixed a bug when using the trait by different components concurrently `traits/i-lock-page-scroll`](https://github.com/V4Fire/Client/issues/549)
* Fixed a bug when the `cache: false` predicate is ignored if provided `dependencies` `core/component/decorators`
* Fixed a deadlock during component activation `super/i-block/modules/activation`
* [Get rid of a redundant router transition when restoring the page from bfcache in safari `core/router/engines/browser.history`](https://github.com/V4Fire/Client/issues/552)

#### :memo: Documentation

* Added documentation:
  * `bCheckbox`
  * `bRadioButton`
  * `bInputHidden`
  * `bForm`
  * `bInput`
  * `bTextarea`

#### :house: Internal

* `iInput`:
  * Improved error handling
  * Added `UnsafeIInput`

* Fixed ESLint warnings:
  * `bCheckbox`
  * `bRadioButton`
  * `bInputHidden`
  * `bForm`
  * `bInput`
  * `bTextarea`
  * `bSelect`

* Added tests:
  * `bCheckbox`
  * `bRadioButton`
  * `bInputHidden`
  * `bForm`
  * `bInput`
  * `bTextarea`

## v3.0.0-rc.198 (2021-06-08)

#### :rocket: New Feature

* Now all watchers support suspending

## v3.0.0-rc.197 (2021-06-07)

#### :boom: Breaking Change

* Removed initialization of `iProgress` modifier event listeners `iData`

#### :bug: Bug Fix

* Fixed an issue with `bBottomSlide` not being able to open from the pull
* Fixed an issue with `bBottomSlide` not being able to initialize `i-history` if the component was opened via swipe

#### :memo: Documentation

* Added documentation `iDynamicPage`

#### :house: Internal

* Added initialization of `iProgress` modifier event listeners `bButton`

## v3.0.0-rc.196 (2021-05-28)

#### :boom: Breaking Change

* Now `isReady` returns `true` if a component in `inactive` `super/i-block/modules/activation`

## v3.0.0-rc.195 (2021-05-28)

#### :memo: Documentation

* Added documentation `iPage`

#### :house: Internal

* Improved restoring of scroll `bRouter`

## v3.0.0-rc.194 (2021-05-28)

#### :bug: Bug Fix

* Fixed a bug with referencing a closure' value `AsyncRender.iterate`

## v3.0.0-rc.193 (2021-05-28)

#### :bug: Bug Fix

* Fixed a bug when switching pages via `pageProp` and `page` `bDynamicPage`

## v3.0.0-rc.192 (2021-05-27)

#### :rocket: New Feature

* Rewritten with a new keep-alive strategy `bDynamicPage`
* Added a new event `asyncRenderChunkComplete` `super/i-block/modules/async-render`

#### :bug: Bug Fix

* Fixed an issue when `bDynamicPage` is deactivated on initializing `iBlock`
* Fixed an issue when activation events won't propagate to child components `super/i-block/modules/activation`
* Fixed the scroll restoring after a transition `bRouter`
* Prevented the infinity loop when passing non-iterable objects to `iterate` `super/i-block/modules/async-render`

#### :memo: Documentation

* Added documentation `bDynamicPage`

## v3.0.0-rc.191 (2021-05-24)

#### :rocket: New Feature

* `super/i-block/modules/async-render`:
  * Added overloads for infinite iterators
  * Added `waitForceRender`

#### :bug: Bug Fix

* Fixed a bug when using `self.load modules` with the same options within different components `iBlock`
* Don't provide attributes that match with modifiers `super/i-block/modules/mods`

## v3.0.0-rc.190 (2021-05-17)

#### :bug: Bug Fix

* Fixed resolving of refs `core/component/engines/zero`

## v3.0.0-rc.189 (2021-05-13)

#### :bug: Bug Fix

* Hotfix for v3.0.0-rc.188 :(

## v3.0.0-rc.188 (2021-05-14)

#### :rocket: New Feature

* Added a feature to attach listeners on promises with emitters by using `@watch` `core/component/watch`

#### :bug: Bug Fix

* Don't skip a context of `createElement` `core/component/render-function`

## v3.0.0-rc.187 (2021-05-13)

#### :bug: Bug Fix

* Hotfix for v3.0.0-rc.186 :(

## v3.0.0-rc.186 (2021-05-13)

#### :bug: Bug Fix

* Fixed context providing to functional components `core/component/render-function`
* Fixed transforming of smart components `build/snakeskin`

## v3.0.0-rc.185 (2021-05-13)

#### :bug: Bug Fix

* Fixed a bug with using css-property `pointer-events: none` in Safari in `traits/i-access` and `traits/i-progress`

## v3.0.0-rc.184 (2021-05-12)

#### :rocket: New Feature

* Improved traits to support auto-deriving:
  * `iLockPageScroll`
  * `iOpen`
  * `iOpenToggle`
  * `iAccess`
  * `iIcon`
  * `iObserveDom`

#### :memo: Documentation

* Added documentation:
  * `traits`
  * `traits/i-open`
  * `traits/i-open-toggle`

## v3.0.0-rc.183 (2021-05-12)

#### :bug: Bug Fix

* Fixed a bug with functional components after adding Zero `core/component/render-function`
* Fixed a bug while initializing Zero `core/component/engines/zero`

## v3.0.0-rc.182 (2021-04-28)

#### :rocket: New Feature

* Now a route pattern can be a function

#### :bug: Bug Fix

* Fixed an issue with `optionKey` being ignored `base/b-virtual-scroll`

#### :house: Internal

* Extracted `compileStaticRoutes` from `bRouter` to `core/router`

## v3.0.0-rc.181 (2021-04-20)

#### :bug: Bug Fix

* [Fixed an issue with `itemProps` not being provided to child components `base/b-virtual-scroll`](https://github.com/V4Fire/Client/issues/512)

#### :house: Internal

* Extracted some helpers and interfaces from `bRouter` to `core/router`

## v3.0.0-rc.180 (2021-04-16)

#### :rocket: New Feature

* `core/component/interface`:
  * Added a new property `$initializer`
  * Added a new property `$renderEngine`

* Added a new render engine `core/component/engine/zero`
* Added a new getter `isSSR` `iBlock`

## v3.0.0-rc.179 (2021-04-15)

#### :bug: Bug Fix

* Fixed resolving refs within functional components `core/component/render-function`

## v3.0.0-rc.178 (2021-04-15)

#### :bug: Bug Fix

* Fixed a bug when dynamically created templates emit lifecycle events `iBlock`

## v3.0.0-rc.177 (2021-04-14)

#### :bug: Bug Fix

* Fixed the loading order of styles `build`
* Fixed using the async rendering within functional components `core/component/functional`
* Fixed a bug when using `self.loadModules` with the `wait` option `iBlock`

#### :house: Internal

* `core/component/meta`:
  * Added `attachTemplatesToMeta`
  * Renamed `inherit` to `inheritMeta`

## v3.0.0-rc.176 (2021-04-12)

#### :bug: Bug Fix

* Fixed parsing of Stylus objects `build/stylus/ds`

## v3.0.0-rc.175 (2021-04-12)

#### :bug: Bug Fix

* Fixed an issue when trying to load two or more modules with the same id but different parameters via `loadModules` `iBlock`

## v3.0.0-rc.174 (2021-04-09)

#### :bug: Bug Fix

* Fixed the project building with `parallel-webpack` `build`

## v3.0.0-rc.173 (2021-04-09)

#### :boom: Breaking Change

* Now `csp.nonceStore` is a function `config`

#### :rocket: New Feature

* Added aliases `mem` and `fs` for `--cache-type` `build`
* Added a new parameter `componentDependencies` `config`

#### :bug: Bug Fix

* Now `csp.nonceStore` does not affect the project hash when `csp.none` is not specified `config`

## v3.0.0-rc.172 (2021-04-06)

#### :house: Internal

* Optimized the project building with `--fat-html`

## v3.0.0-rc.171 (2021-03-27)

#### :bug: Bug Fix

* Fixed a race condition during attaching of component dependencies `build`

## v3.0.0-rc.170 (2021-03-26)

#### :rocket: New Feature

* Added a new event `chunkRender` `base/b-virtual-scroll`

## v3.0.0-rc.169 (2021-03-25)

#### :bug: Bug Fix

* Fixed generation of `.init.js` files `iStaticPage`

## v3.0.0-rc.168 (2021-03-24)

#### :bug: Bug Fix

* Fixed updating of icons with old browsers `traits/i-icon`

## v3.0.0-rc.167 (2021-03-24)

#### :bug: Bug Fix

* Fixed the `--fat-html` build mode `iStaticPage`

## v3.0.0-rc.166 (2021-03-24)

#### :bug: Bug Fix

* Fixed generation of dynamic imports for ES5/3 `build`

## v3.0.0-rc.165 (2021-03-23)

#### :bug: Bug Fix

* Fixed providing of `webpack.target` `build`
* Fixed resolving of the external context `core/component/reflection`

## v3.0.0-rc.164 (2021-03-22)

#### :boom: Breaking Change

* Now `onDOMChange` is deprecated. Use `emitDOMChange` instead. `traits/i-observe-dom`

#### :rocket: New Feature

* Added `jasmine` tests for `.spec.js` files
* Added the ability to change themes

* `build/stylus`:
  * Added a new plugin function `log`
  * Added the ability to mark styles as obsolescence

#### :bug: Bug Fix

* Now `bVirtualScroll` will throw an error if the rendering of components returns an empty array `base/b-virtual-scroll`

#### :memo: Documentation

* Added documentation:
  * `b-slider`
  * `b-bottom-slide`
  * `i-observe-dom`

* Improved documentation `build/stylus/ds`

#### :house: Internal

* Fixed a race condition with the test case that waits for timeouts
* Added tests:
  * `bImage`
  * `build/ds`
  * `super/i-block/modules/daemons`
  * `core/compoent/directives/update-on`

* `build/stylus/ds`:
  * Added tests
  * Plugins moved to a separated folder `build/stylus/ds`

## v3.0.0-rc.163 (2021-03-19)

#### :rocket: New Feature

* Added `target.webpack` `build`

## v3.0.0-rc.162 (2021-03-19)

#### :bug: Bug Fix

* Fixed a bug when getter can't be watched when it depends on an external property `core/component/watch`

## v3.0.0-rc.161 (2021-03-18)

#### :bug: Bug Fix

* Fixed checks weather component is regular or not in `i-block/modules/block`

## v3.0.0-rc.160 (2021-03-17)

#### :bug: Bug Fix

* Fixed a bug when the project building never stopped `build`

## v3.0.0-rc.159 (2021-03-15)

#### :bug: Bug Fix

* Fixed a bug when the `noGlobal` breaks on `'foo'?.dasherize()` `build`

## v3.0.0-rc.158 (2021-03-15)

#### :bug: Bug Fix

* Fixed a race condition when loading template files

## v3.0.0-rc.157 (2021-03-10)

#### :rocket: New Feature

* Added the support of external CSS libraries to build within entries `build` `iStaticPage`

## v3.0.0-rc.156 (2021-03-06)

#### :bug: Bug Fix

* Updated regexp in `iBlock.canSelfDispatchEvent` to match kebab-cased events but not camelCased

## v3.0.0-rc.155 (2021-03-05)

#### :rocket: New Feature

* Added a new method `canSelfDispatchEvent` to prevent self dispatching of some events `iBlock`

#### :bug: Bug Fix

* Now `componentStatus` and `componentHook` events can't be self dispatched `iBlock`

## v3.0.0-rc.154 (2021-03-04)

#### :bug: Bug Fix

* Fixed an issue with tests failing because waiting of `#root-component` to become visible `tests/helpers/utils`

## v3.0.0-rc.153 (2021-03-04)

#### :rocket: New Feature

* Added a new option `--bail` to stop test execution after the first failure `tests`

#### :bug: Bug Fix

* [Fixed an issue with tests execution took too long](https://github.com/V4Fire/Client/issues/436)

* Added `force=true` to default options `DOM.clickToRef`. It fixed a bug where clicking at a visible element
  did not work because the playwright decided that the element was not visible. `tests`

#### :house: Internal

* [`bVirtualScroll` is now implements `iItems` trait `base/b-virtual-scroll`](https://github.com/V4Fire/Client/issues/471)

#### :nail_care: Polish

* [Interface names review `core/dom/in-view`](https://github.com/V4Fire/Client/issues/405)

## v3.0.0-rc.152 (2021-03-04)

#### :house: Internal

* Added a `try-catch` block to suppress async errors on component rerender in `iBlock.onUpdateHook`

## v3.0.0-rc.151 (2021-03-04)

#### :rocket: New Feature

* Added a new config `client.tsconfig`

#### :house: Internal

* `bVirtualScroll`:
  * Downgraded the delay before initializing to `15ms`
  * Some optimizations

* Caching of dynamic imports `super/i-block/modules/dom`

## v3.0.0-rc.150 (2021-03-03)

#### :bug: Bug Fix

* Fixed an issue with the scroll unlocking during close `base/b-bottom-slide`

## v3.0.0-rc.149 (2021-03-01)

#### :bug: Bug Fix

* Don't generate `.init.js` with `--fat-html` `iStaticPage`

## v3.0.0-rc.148 (2021-03-01)

#### :house: Internal

* Added `importsNotUsedAsValues` to `.tsconfig`

## v3.0.0-rc.147 (2021-02-18)

#### :rocket: New Feature

* Emit an event when async rendering is completed `super/i-block/modules/async-render`

#### :bug: Bug Fix

* Removed a race condition during loading of the libs `iStaticPage`
* Fixed providing of destroying events to external components `core/component/construct`

## v3.0.0-rc.146 (2021-02-15)

#### :bug: Bug Fix

* Fixed providing of activation events to external components `core/component/construct`
* Fixed creation of meta objects `core/component/flyweight`

## v3.0.0-rc.145 (2021-02-12)

#### :house: Internal

* Now external activation hooks are fired with a delay `core/component/construct`

## v3.0.0-rc.144 (2021-02-11)

#### :boom: Breaking Change

* Now, by default is used `b-button-functional` `traits/i-control-list`

#### :bug: Bug Fix

* Added providing of activation events to external components

## v3.0.0-rc.143 (2021-02-11)

#### :rocket: New Feature

* Added icons colorizing functionality by the Stylus' `i` function `global/g-def`
* Added `stylus` plugins to generate URLs `build/stylus/url`:
  * `toQueryString`
  * `createURL`

## v3.0.0-rc.142 (2021-02-11)

#### :boom: Breaking Change

* Removed:
  * `b-content-switcher`
  * `core/component/helpers/observable`

#### :rocket: New Feature

* Added a new property `fakeContext` to `VNode` `core/component/engines`

#### :bug: Bug Fix

* Fixed an issue when refs are not resolved after the `update` hook `iBlock`
* Fixed creation of a context:
  * `core/component/functional`
  * `core/component/flyweight`

#### :house: Internal

* Refactoring:
  * `core/dom/image`
  * `core/dom/resize-observer`

## v3.0.0-rc.141 (2021-02-05)

#### :bug: Bug Fix

* Fixed an issue with an update without providing of `ctx` `core/come/image`

## v3.0.0-rc.140 (2021-02-05)

#### :rocket: New Feature

* Added a new global constant `MODULE` `build`

#### :bug: Bug Fix

* Fixed the support of `--fat-html` `traits/i-icon`
* Fixed the condition to provide slots:
  * `bButton`
  * `bInput`
  * `bList`

## v3.0.0-rc.139 (2021-02-05)

#### :bug: Bug Fix

* Fixed cleaning of background styles `core/dom/image`

## v3.0.0-rc.138 (2021-02-04)

#### :rocket: New Feature

* Added a new parameter `TaskParams.useRAF` `super/i-block/modules/async-render`

## v3.0.0-rc.137 (2021-02-04)

#### :rocket: New Feature

* Added a new parameter `--fat-html` `config`
* Added a new option `--only-run:boolean` for `npx gulp test:components`.
  It allows run all test cases without the building stage.

#### :bug: Bug Fix

* Fixed linking to values with watchable prototypes `super/modules/sync`
* Fixed using of global RegExp-s with the `g` flag
* Fixed redundant listening of events `core/component/engines/vue`
* Used `nanoid` to generate `nonceStore` `config`

* `build`:
  * Fixed minifying of dynamic styles
  * Fixed dynamic imports with `fatHTML`
  * Fixed the running of parallel tests when `portfinder` was returning the same port for different processes

#### :house: Internal

* Updated dependencies:
  * `svg-url-loader@7.1.1`
  * `terser-webpack-plugin@5.1.1`
  * `postcss-loader@5.0.0`
  * `webpack@5.20.1`

## v3.0.0-rc.136 (2021-02-02)

#### :rocket: New Feature

* Added logging of dependencies `build/test.gulp`
* Added a new parameter `build.demoPage` `config`

#### :bug: Bug Fix

* Fixed inlining with `fatHTML`

#### :house: Internal

* Optimized the inserting of an icon into DOM by using `requestAnimationFrame` `traits/i-icon`

## v3.0.0-rc.135 (2021-02-01)

#### :bug: Bug Fix

* Fixed a bug with the redundant clearing of async tasks `core/component/directives/update-on`

## v3.0.0-rc.134 (2021-01-30)

#### :house: Internal

* Optimized creation of components

## v3.0.0-rc.133 (2021-01-30)

#### :rocket: New Feature

* Added a link to the global root instance `core/component/const`

#### :house: Internal

* Optimized creation of components

## v3.0.0-rc.132 (2021-01-29)

#### :rocket: New Feature

* Now function and flyweight components support `asyncRender` `iBlock`

## v3.0.0-rc.131 (2021-01-29)

#### :boom: Breaking Change

* Don't emit global component events during initializing `super/i-block/modules/block`
* Removed the `componentStatus` modifier `iBlock`

#### :rocket: New Feature

* `iBlock`:
  * Added a new prop `verbose`
  * Added a new getter `isNotRegular`

#### :house: Internal

* Now using `requestIdleCallback` instead of `setTimeout`:
  * `core/render`
  * `core/dom/resize-observer`
  * `core/component/register`

* Now all tasks will execute on `requestAnimationFrame` `super/modules/async-render`

## v3.0.0-rc.130 (2021-01-28)

#### :bug: Bug Fix

* Fixed resolving of ref-s `core/component/construct`

## v3.0.0-rc.129 (2021-01-28)

#### :house: Internal

* Optimized creation of flyweight components

## v3.0.0-rc.128 (2021-01-27)

#### :bug: Bug Fix

* Fixed providing of URL within `route` `bRouter`

## v3.0.0-rc.127 (2021-01-26)

#### :bug: Bug Fix

* `core/component/flyweight`:
  * Fixed `componentStatus` with flyweight components
  * Fixed creation of `$async`

## v3.0.0-rc.126 (2021-01-26)

#### :boom: Breaking Change

* Removed the `beforeMounted` hook `core/component/interface`
* Renamed the `status` modifier to `component-status` `iBlock`
* Deprecate `listener` and `once` parameters `core/component/directives/update-on`

#### :rocket: New Feature

* Now flyweight components support lifecycle hooks `core/component/flyweight`
* Now switching a value of the component hook emits events `iBlock`
* `core/component/directives/update-on`:
  * Added support of watchers
  * Improved API

#### :bug: Bug Fix

* Fixed the `fatHTML` mode
* Fixed creation of fields of flyweight components `core/component/field`
* Added handling of the empty request `bVirtualScroll`
* Fixed waiting for storage resetting during the `reset` event.
  Now, a promise to write to the storage can be rejected. `super/i-block/modules/listeners`

#### :memo: Documentation

* Improved documentation:
  * `core/component/directives/update-on`
  * `traits/i-icon`

#### :house: Internal

* Added a feature to provide raw modifiers `core/component/prop`
* Now functional components emulate hooks via the `v-hook` directive `core/component/functional`
* Added API based on the `v-hook` directive to attach hook listeners with functional and flyweight components `iBlock`

## v3.0.0-rc.125 (2021-01-18)

#### :bug: Bug Fix

* Fixed a bug with the creation of nested flyweight components `core/component/flyweight`

## v3.0.0-rc.124 (2021-01-18)

#### :bug: Bug Fix

* Fixed a bug when an optional asset isn't exist `super/i-static-page/modules/ss-helpers`

## v3.0.0-rc.123 (2021-01-15)

#### :boom: Breaking Change

* Changed an interface and behavior of `initRemoteData` `bRouter`
* Changed an interface of `set` `i-block/modules/state`

* `traits/i-access`:
  * Removed helpers for disabling
  * Removed progress helpers

#### :rocket: New Feature

* Added `--device` for `component:test` `build`
* Now the component implements the `iItems` trait `bList`
* Added support of method invoking `set` `i-block/modules/state`
* Implemented new API from `iAccess` `bButton`
* Implemented new API from `iProgress`:
  * `bImage`
  * `bRouter`
  * `iData`

* `traits/i-access`:
  * Added `autofocus`
  * Added `tabIndex`
  * Added `isFocused`

* `traits/i-progress`:
  * Moved logic from `iAccess`
  * Added support of events

#### :memo: Documentation

* Improved documentation
  * `bImage`
  * `bList`
  * `bIcon`
  * `i-block/modules/state`
  * `traits/i-access`
  * `traits/i-progress`
  * `traits/i-visible`

## v3.0.0-rc.122 (2021-01-13)

#### :boom: Breaking Change

* Removed `bMatryoshka`. Use `bTree` instead.
* Trait refactoring. Using `item` instead of `option`. `traits/i-items`
* Refactoring for the updated `iItems` API `b-slider`

#### :rocket: New Feature

* Released `bTree`

#### :bug: Bug Fix

* Fixed geometry initialization within the content mode `bBottomSlide`
* Fixed an issue when the next calling of `initIndex` pushes another one index page `traits/i-history`

#### :memo: Documentation

* Added `CHANGELOG`, `README` `traits/i-items`

## v3.0.0-rc.121 (2021-01-12)

#### :boom: Breaking Change

* `bWindow`:
  * Renamed the slot `control` to `controls`
  * Replaced the global modifier `hidden` to `opened`

#### :bug: Bug Fix

* Fixed a bug with `getRootMod` `iStaticPage`
* Fixed a bug with parsing of styles `core/component/vnode`

#### :memo: Documentation

* Added documentation `bWindow`
* Improved jsDoc `iBlock`

#### :house: Internal

`bWindow`:
* Fixed ESLint errors
* Fixed TS errors
* Added tests

## v3.0.0-rc.120 (2020-12-23)

#### :bug: Bug Fix

* Fixed a bug after refactoring `iStaticPage`

## v3.0.0-rc.119 (2020-12-23)

#### :bug: Bug Fix

* Now all dynamic scripts and links are added to the document head `iStaticPage`

## v3.0.0-rc.118 (2020-12-24)

#### :bug: Bug Fix

* Trim hrefs before go `bRouter`

## v3.0.0-rc.117 (2020-12-23)

#### :bug: Bug Fix

* Fixed generation of `init` files `iStaticPage`

## v3.0.0-rc.116 (2020-12-23)

#### :bug: Bug Fix

* Fixed CSP bugs `iStaticPage`

## v3.0.0-rc.115 (2020-12-23)

#### :rocket: New Feature

* Improved CSP support. Added the `postProcessor` mode.

## v3.0.0-rc.114 (2020-12-22)

#### :bug: Bug Fix

* Fixed clearing of the route history `core/router/engines/browser`

## v3.0.0-rc.113 (2020-12-18)

#### :rocket: New Feature

* Added `cssMinimizer` `config`

#### :bug: Bug Fix

* Fixed handling of `javascript:` links `bRouter`
* Downgraded `stylus-loader@3.0.2`

#### :house: Internal

* Replaced `optimize-css-assets-webpack-plugin` -> `css-minimizer-webpack-plugin`

## v3.0.0-rc.112 (2020-12-18)

#### :boom: Breaking Change

* Now icons are loaded asynchronously `traits/i-icon`
* Now `forceInnerRender` is toggled to `true` by default:
  * `bBottomSlide`
  * `bSidebar`
  * `bWindow`

#### :rocket: New Feature

* Added support of promises `core/component/directive/update-on`
* Added `snapshot.webpack` `build`
* Added `Module.wait` `super/i-block/modules/module-loader`
* Added support of `wait` and `renderKey` `iBlock/loadModules`

#### :bug: Bug Fix

* Fixed `dynamic-component-import` `build`
* Fixed `updateWindowPosition` with lazy rendering `bBottomSlide`
* Fixed providing of render groups:
  * `super/i-block/modules/module-loader`
  * `core/component/render-function`

## v3.0.0-rc.111 (2020-12-16)

#### :bug: Bug Fix

* Fixed render logic: `bSidebar`, `bWindow`, `bBottomSlide`

## v3.0.0-rc.110 (2020-12-16)

#### :boom: Breaking Change

* Migrated to `webpack@5`
* Now `initFromStorage` returns `CanPromise` `super/i-block/modules/state`
* Removed the default export of submodules `core/dom`
* Removed `StaticRouteMeta.entryPoint` and `StaticRouteMeta.dynamicDependencies` `core/router`
* Now `localInView` returns a promise `super/i-block/modules/dom`

* `iStaticPage`:
  * Renamed `GLOBAL_NONCE` to `CSP_NONCE`
  * Renamed `documentWrite` -> `js` `modules/ss-helpers`

* `config`:
  * Removed `build.fast`
  * Removed `webpack.buildCache`
  * Removed `webpack.cacheDir`
  * Removed `uglify`
  * Now `webpack.devtool` is a function

* `build`:
  * Renamed `entries.webpack` to `graph.webpack`
  * Renamed `build.webpack` to `helpers.webpack`
  * Now `output.webpack` exports a function

#### :rocket: New Feature

* `build`:
  * Added `isLayerCoreDep`
  * Added support of dynamic imports
  * Added `entry.webpack`
  * Added `watch-options.webpack`
  * Added `other.webpack`

* `config`:
  * Added `webpack.mode`
  * Added `webpack.cacheType`
  * Added `style`
  * Added `miniCssExtractPlugin`
  * Added `terser`

* Added `forceInnerRender`:
  * `bWindow`
  * `bSidebar`
  * `bBottomSlide`

* Added API to load the dynamic dependencies `iBlock`
* Added `StaticRouteMeta.load` `core/router`
* Added `interceptLinks` `bRouter`
* Added `crossorigin` attributes to scripts and links `iStaticPage`

#### :house: Internal

* Added prefetch for the dynamic dependencies `iData`
* Minified libs `eventemitter2` and `requestidlecallback`
* Added a new dependency `style-loader`
* Prefer `createElement` instead `documentWrite` `iStaticPage`
* Updated dependencies:
  * `upath@2.0.1`
  * `merge2@1.4.1`
  * `hasha@5.2.2`
  * `del@6.0.0`
  * `arg@5.0.0`
  * `browserslist@4.15.0`

## v3.0.0-rc.109 (2020-12-15)

#### :bug: Bug Fix

* Added watchers for `session` and `net` events to update appropriate state fields `core/component/state`

#### :house: Internal

* Removed watchers for `isAuth`, `isOnline` and `lastOnlineDate` fields.
  They are synchronized with `remoteState` via `sync.link` `super/i-static-page`.

## v3.0.0-rc.108 (2020-12-14)

#### :bug: Bug Fix

* Fixed a bug when using `parseStyle` with string trailing `;` ex. `background-color: #2B9FFF; color: #FFFFFF; border: 1px solid #FFFFFF;`

## v3.0.0-rc.107 (2020-12-09)

#### :bug: Bug Fix

* Fixed re-rendering of a template when using `m` `super/i-block/modules/mods`

## v3.0.0-rc.106 (2020-12-09)

#### :bug: Bug Fix

* Fixed a bug with clearing observable data from `core/dom/in-view`

## v3.0.0-rc.105 (2020-12-09)

#### :rocket: New Feature

* Added the default value to `iterate/slice` `super/i-block/modules/async-render`

#### :bug: Bug Fix

* `i-block/modules/async-render`:
  * Fixed a bug when `iterate` takes the rejected promise
  * Fixed the global blocking of rendering when using a filter that returns a promise

* Fixed a bug with redundant `v-for` invokes:
  * `i-block/modules/async-render`
  * `core/component/render-function`

## v3.0.0-rc.104 (2020-12-07)

#### :bug: Bug Fix

* Fixed a bug with repetitive calls of `iLockPageScroll.lock`

#### :house: Internal

* Added tests `traits/i-lock-page-scroll`

## v3.0.0-rc.103 (2020-11-29)

#### :bug: Bug Fix

* Fixed a bug with slows down while scrolling on ios `base/b-skeleton`

#### :memo: Documentation

* Added `README.md`, `CHANGELOG.md` for `base/b-skeleton`

## v3.0.0-rc.102 (2020-11-26)

#### :bug: Bug Fix

* Fixed an issue with layout shifts after `reInit` `base/b-virtual-scroll`

## v3.0.0-rc.101 (2020-11-18)

#### :bug: Bug Fix

* Fixed import errors `global/g-icon/g-icon.styl`

#### :house: Internal

* Fixed lint warnings `global/g-icon/g-icon.styl`

## v3.0.0-rc.100 (2020-11-17)

#### :rocket: New Feature

* Added support of filters with promises `super/i-block/modules/async-render`

#### :house: Internal

* Rendering optimization:
  * `bBottomSlide`
  * `bSidebar`

## v3.0.0-rc.99 (2020-11-17)

#### :bug: Bug Fix

* [Fixed dynamic creation of flyweight components](https://github.com/V4Fire/Client/issues/434) `core/component/render-function`
* [Fixed providing of attributes](https://github.com/V4Fire/Client/issues/437) `core/component/flyweight`

## v3.0.0-rc.98 (2020-11-13)

#### :boom: Breaking Change

* `bSidebar`:
  * Removed style properties (`p.overlayBg`, `p.overlayTansition`), prefer to use `provide.classes` or style overriding
  * Renamed a style property: `sideBarTransition` -> `sidebarTransition`

#### :bug: Bug Fix

* Added the missing `over-wrapper` element `bSidebar`
* Fixed firing the `close` event on swipe closing `bBottomSlide`
* Now the `lockScrollMobile` modifier is applied for all mobile devices `iLockPageScroll`

#### :memo: Documentation

* Added documentation `iLockPageScroll`

#### :house: Internal

* Fixed ESLint warnings `bBottomSlide`
* `bSidebar`:
  * Fixed ESLint errors
  * Fixed ts errors
  * Added tests

## v3.0.0-rc.97 (2020-11-11)

#### :rocket: New Feature

* Added `core/component/directives/v-hook`

#### :bug: Bug Fix

* Marked `defaultRequestFilter` and `requestFilter` as optional `iData`

## v3.0.0-rc.96 (2020-11-10)

#### :rocket: New Feature

* Added `suspendRequests/unsuspendRequests/waitPermissionToRequest` `iData`
* Added support of creation flyweight components via `$createElement` `core/component/render-function`

## v3.0.0-rc.95 (2020-11-06)

#### :house: Internal

* Updated to `typescript@4.1.1-rc`

## v3.0.0-rc.94 (2020-11-06)

#### :bug: Bug Fix

* Fixed initializing of watchers based on accessors `core/component/watch/create`

## v3.0.0-rc.93 (2020-11-03)

#### :boom: Breaking Change

* Changed an interface `patchComponentVData` `core/component/render-function`

#### :bug: Bug Fix

* Fixed providing of attributes `core/component/flyweight`

## v3.0.0-rc.92 (2020-11-03)

#### :rocket: New Feature

* `core/component/vnode`:
  * Added `patchComponentVData`
  * Added `parseStyle`

#### :bug: Bug Fix

* Fixed providing of styles `core/component`

#### :house: Internal

* Now the component is smart (by default, the regular) `bDummy`
* Refactoring:
  * `core/component/engines/vue`
  * `core/component/render-function`
  * `core/component/flyweight`

#### :nail_care: Polish

* Added tests `iBlock`

## v3.0.0-rc.91 (2020-10-29)

#### :bug: Bug Fix

* `super/i-block/modules/field`:
  * Fixed working with watchers based on accessors
  * Fixed resolving of accessors

## v3.0.0-rc.90 (2020-10-22)

#### :boom: Breaking Change

* Now all extra classes that were added by using `appendToRootClasses` added to the start of the declaration `iBlock`
* Removed `gDef/funcs/setSizes`

* `bList`:
  * Renamed:
    * `interface/Option` -> `interface/Item`
    * `valueProp` -> `itemsProp`
    * `removeActive` -> `unsetActive`
    * `normalizeOptions` -> `normalizeItems`
    * `block text` -> `block value`
    * `&__link-text` -> `&__link-value`

  * Changed a type of `hideLabels` from a prop to modifier
  * Now the `active` getter returns a Set with `multiple = true`
  * Removed `block info` from the template
  * Deprecated `&__el`

* `gHint`:
  * Renamed:
    * `target` -> `location`
    * `showSelector` -> `showOn`
    * `hintData` -> `dataAttr`

  * Replaced:
    * `horArrowSize`, `vertArrowSize` -> `arrowSize`
    * `color`, `bgColor`, `rounding`, `shadow` -> `contentStyles`

  * Removed:
    * Auto-hide logic: now you need to specify the `hidden` option

  * Changed the way how to use the mixin

#### :rocket: New Feature

* `gHint`:
  * Added `arrowStyles`, `hideStyles`, `showStyles`
  * Added `interface.ts`

* Added support of the default slot `bList`
* Now `content` can be provided as a function `core/prelude/test-env/renderComponents`
* Added support for a runner wildcard declaration `tests`

```bash
gulp test:component:run --test-entry base/b-virtual-scroll/test --runner events/* --runtime-render true
```

#### :bug: Bug Fix

* `bList`:
  * Fixed a bug with `activeElement` and `multiple`

#### :house: Internal

* `bList`:
  * Fixed ESLint warnings `bList`
  * Removed dead options from `Item`: `preIconHint`, `preIconHintPos`, `iconHint`, `iconHintPos`, `info`
  * Now `Item` extends from `Dictionary`

* `bIcon`:
  * Removed dead props: `hint`, `hintPos`

* Refactoring:
  * `bList`
  * `gHint`
  * `gIcon`
  * `gDef`

* [Fixed an issue with the unsafe port in tests `build/test.gulp`](https://github.com/V4Fire/Client/issues/330)

#### :nail_care: Polish

* Added documentation:
  * `bList`
  * `gHint`
  * `gIcon`
  * `gDef`

* Improved documentation `docs/tests`
* Improved output `test.gulp`

## v3.0.0-rc.89 (2020-10-20)

#### :bug: Bug Fix

* Fixed the background image cleaning `core/dom/image/loader.ts`

## v3.0.0-rc.88 (2020-10-13)

#### :rocket: New Feature

* Added `functionalWatching` to field decorators `core/component/decorators`

#### :bug: Bug Fix

* Fixed initializing of `stageStore` `iBlock`
* [Added a boolean type for `progressIcon` props](https://github.com/V4Fire/Client/pull/409/files)

#### :house: Internal

* Added `functionalWatching` `core/component/meta`
* Added support of `functionalWatching` `core/component/watch`
* Added a new API for generating selectors `tests/helpers/dom`
  * `elNameGenerator`
  * `elNameSelectorGenerator`
  * `elModNameGenerator`
  * `elModSelectorGenerator`

#### :nail_care: Polish

* Improved documentation

## v3.0.0-rc.87 (2020-10-11)

#### :bug: Bug Fix

* Fixed restoring of a functional state `core/component/watch` `core/component/functional`

## v3.0.0-rc.86 (2020-10-11)

#### :bug: Bug Fix

* Fixed an optimization of lazy watchers `base/i-block/modules/field`
* Fixed immediate watchers `core/component/watch`

## v3.0.0-rc.85 (2020-10-09)

#### :boom: Breaking Change

* `iBlock`:
  * Now `dontWaitRemoteProviders` is calculated automatically
  * Marked as non-functional:
    * `stageStore`
    * `componentStatusStore`
    * `watchModsStore`

#### :rocket: New Feature

* Provided a graph of components to `build/globals.webpack` / `config`

#### :house: Internal

* Optimized watching of non-functional properties `core/component/watch`
* Extracted interfaces to `index.d.ts` `core/prelude/test-env`

## v3.0.0-rc.84 (2020-10-09)

#### :rocket: New Feature

* Added `ComponentMeta.tiedFields` `core/component/meta`

#### :bug: Bug Fix

* Fixed a bug when using a complex path as a dependency `core/component/construct`

#### :house: Internal

* Now all tied fields are collected within `meta.tiedFields` `core/component/decorators`
* Optimized creation of components `core/component/construct`
* Optimized creation of watchers of functional components `core/component/watch`

## v3.0.0-rc.83 (2020-10-09)

#### :bug: Bug Fix

* Fixed an issue with `in-view/mutation` does not fire a callback in old chromiums `core/dom/in-view`

#### :house: Internal

* Removed `.travis.yml`

## v3.0.0-rc.82 (2020-10-08)

#### :bug: Bug Fix

* Fixed a typo after refactoring `core/component/directive/resize-observer`

## v3.0.0-rc.81 (2020-10-08)

#### :boom: Breaking Change

* Now `BrowserTests.DOM.waitForEl` will throw an exception if a timeout to wait occurs `tests/helpers/dom`

#### :bug: Bug Fix

* Fixed an issue with `renderNext`: hasn't been data rendering after a loading error `base/b-virtual-scroll`

#### :house: Internal

* Added `.travis.yml`
* :up: `playwright` -> 1.4.2

#### :nail_care: Polish

* Added the render scheme `docs/test`

## v3.0.0-rc.80 (2020-10-08)

#### :bug: Bug Fix

* Fixed a bug when using an array of dependencies to watch an accessor `core/component/construct`

## v3.0.0-rc.79 (2020-10-08)

#### :boom: Breaking Change

* Directive mods are no longer supported `core/component/directives/resize-observer`
* `v-resize` renamed to `v-resize-observer` `core/component/directives/resize-observer`

#### :house: Internal

* [Split the module into two: API was moved to `core/dom/resize-observer`](https://github.com/V4Fire/Client/issues/311)

## v3.0.0-rc.78 (2020-10-08)

#### :bug: Bug Fix

* Fixed a bug with caching of computed fields `core/component/accessor`

## v3.0.0-rc.77 (2020-10-08)

#### :bug: Bug Fix

* Fixed a bug when trying to access a prop value before a component create `i-block/modules/field`

## v3.0.0-rc.76 (2020-10-07)

#### :boom: Breaking Change

* Renamed `isWorker` to `isStandalone` `build/helpers`

#### :rocket: New Feature

* Added support of a new postfix `.standalone` `build/entries.webpack`

#### :bug: Bug Fix

* Fixed a bug when flyweight components can't have refs `core/component/flyweight`

## v3.0.0-rc.75 (2020-10-07)

#### :rocket: New Feature

* Ability to pass background-repeat as image bg options `core/dom/image`

## v3.0.0-rc.74 (2020-10-06)

#### :bug: Bug Fix

* Fixed an issue with removing the progress modifier `base/b-virtual-scroll`

## v3.0.0-rc.73 (2020-10-02)

#### :house: Internal

* Added the `runtime-render` flag for tests `build/test.gulp`

#### :nail_care: Polish

* Added documentation to write tests `docs/test`

## v3.0.0-rc.72 (2020-10-01)

#### :boom: Breaking Change

* `iData`:
  * Renamed `dataProviderEmitter` to `dataEmitter`
  * Deprecated `requestFilter`
  * Deprecated `dropRequestCache`

#### :rocket: New Feature

* `iData`:
  * Added `defaultRequestFilter`
  * Added `dropDataCache`

#### :house: Internal

* Moved to `defaultRequestFilter`:
  * `bButton`
  * `bForm`

#### :nail_care: Polish

* Improved doc `iData`

## v3.0.0-rc.71 (2020-10-01)

#### :bug: Bug Fix

* `core/component/watch`:
  * Fixed a bug with deep watching of props
  * Fixed providing of a watch context
  * Fixed an invalid caching of old values with `collapse = false`

#### :house: Internal

* Set `DEFAULT_TIMEOUT_INTERVAL = (10).seconds()` `build/test.gulp`

## v3.0.0-rc.70 (2020-09-30)

#### :bug: Bug Fix

* Fixed an issue with the initial ratio was not settled `core/dom/image`

## v3.0.0-rc.69 (2020-09-28)

#### :boom: Breaking Change

* Renamed `FieldGetter` -> `ValueGetter` `super/i-block/modules/field`

#### :rocket: New Feature

* Added `getter` for `set` and `delete` methods `super/i-block/modules/field`

#### :bug: Bug Fix

* Fixed a bug when a system field can't be watched after removal of a property `super/i-block/modules/field`

#### :nail_care: Polish

* Added more examples `super/i-block/modules/field`

## v3.0.0-rc.68 (2020-09-23)

#### :boom: Breaking Change

* `AsyncRender`:
  * Renamed `TaskI.list` -> `TaskI.iterable`
  * Renamed `TaskOptions` -> `TaskParams`

#### :bug: Bug Fix

* Fixed rendering of arrays `AsyncRender`
* [Fixed an issue with the second data batch load affects initial rendering after reInit 'base/b-virtual-scroll'](https://github.com/V4Fire/Client/issues/346)

## v3.0.0-rc.67 (2020-09-22)

#### :boom: Breaking Change

* `config`
  * Now `runtime.debug` is always `false` by default
  * Now `webpack.buildCache` is always `false` by default

#### :bug: Bug Fix

* Updated dependencies:
  * `postcss@7.0.34`
  * `autoprefixer@9.8.6`

## v3.0.0-rc.66 (2020-09-22)

#### :bug: Bug Fix

* [Fixed mixing of directives within of a component root tag `core/component`](https://github.com/V4Fire/Client/pull/337)
* Fixed providing of `Autoprefixer` `build/module.webpack`

## v3.0.0-rc.65 (2020-09-21)

#### :boom: Breaking Change

* Updated dependencies:
  * `url-loader@4.1.0`
  * `terser-webpack-plugin@4.2.2`
  * `svg-sprite-loader@5.0.0`
  * `svg-url-loader@6.0.0`
  * `postcss-loader@4.0.2`
  * `mini-css-extract-plugin@0.11.2`
  * `image-webpack-loader@7.0.1`
  * `imagemin-webp@6.0.0`
  * `autoprefixer@10.0.0`
  * `worker-loader@3.0.2`

* Removed dependencies: `fg-loadcss`
* Fixed a bug with importing of images within CSS

#### :house: Internal

* Updated dependencies:
  * `eventemitter2@6.4.3`
  * `tslib@2.0.1`
  * `browserslistr@4.14.3`
  * `copy-dir@1.3.0`
  * `delay@4.4.0`
  * `extract-loader@5.1.0`
  * `file-loader@6.1.0`
  * `gulp-load-plugin@2.0.4`
  * `html-loader@1.3.0`
  * `optimize-css-assets-webpack-plugin@5.0.4`
  * `stylus@0.54.8`
  * `ts-loader@8.0.4`
  * `typograf@6.11.1`
  * `webpack@4.44.2`
  * `webpack-cli@3.3.12`

#### :nail_care: Polish

* Fixed JSDoc `Statuses` -> `ComponentStatus` `iBlock`

## v3.0.0-rc.64 (2020-09-18)

#### :bug: Bug Fix

* Fixed an issue with wrong attributes being settled for an img tag `core/dom/image`

## v3.0.0-rc.63 (2020-09-10)

#### :rocket: New Feature

* [Improved `core/dom/image` API](https://github.com/V4Fire/Client/issues/168)

#### :bug: Bug Fix

* Fixed `init.js` generation `super/i-static-page/ss-helpers`

#### :house: Internal

* [Split the `directives/image` module into two: API was moved to `core/dom/image`](https://github.com/V4Fire/Client/issues/168)

## v3.0.0-rc.62 (2020-09-04)

#### :rocket: New Feature

* Added `iBlock/dontWaitRemoteProviders`

## v3.0.0-rc.61 (2020-09-04)

#### :bug: Bug Fix

* [Fixed wrong refactoring in `rc48` `super/i-data`](https://github.com/V4Fire/Client/pull/326)

#### :house: Internal

* Updated dependencies: `@v4fire/core@3.25.1`

## v3.0.0-rc.60 (2020-09-01)

#### :rocket: New Feature

* [Added `watchForIntersection`, `localInView` methods to `super/i-block/modules/dom`](https://github.com/V4Fire/Client/issues/195)
* [Added an option `destroyIfComponent` into `i-block/dom/replaceWith`, `i-block/dom/appendChild`](https://github.com/V4Fire/Client/pull/321)

#### :bug: Bug Fix

* [Fixed a possible memory leak `base/b-virtual-scroll`](https://github.com/V4Fire/Client/pull/321)

#### :house: Internal

* [Split the module into two: API was moved to `core/dom/in-view`](https://github.com/V4Fire/Client/issues/310)
* [Improved tests performance](https://github.com/V4Fire/Client/pull/322)
* Updated dependencies: `@v4fire/core@3.24.0`, `@v4fire/linters@1.5.8`

## v3.0.0-rc.59 (2020-08-10)

#### :rocket: New Feature

* [Added ability to render data manually `bVirtualScroll`](https://github.com/V4Fire/Client/issues/202)

#### :nail_care: Polish

* Improved documentation `bVirtualScroll`

## v3.0.0-rc.58 (2020-08-07)

#### :house: Internal

* Added `.ico` files to build `build/module.webpack/img`

## v3.0.0-rc.57 (2020-08-06)

#### :bug: Bug Fix

* Fixed `core/browser/mobile`

## v3.0.0-rc.56 (2020-08-06)

#### :bug: Bug Fix

* Fixed `initLoad` error handling `iBlock`, `iData`

## v3.0.0-rc.55 (2020-08-05)

#### :bug: Bug Fix

* Fixed an issue with `unsafe` after refactoring `core/component/render-function`
* `iData`:
  * Fixed an issue with `requestFilter` after refactoring
  * Fixed an issue with `initLoad` after refactoring

#### :house: Internal

* Fixed ESLint warnings `bRemoteProvider`

#### :nail_care: Polish

* Added documentation `bRemoteProvider`

## v3.0.0-rc.54 (2020-08-04)

#### :house: Internal

* Marked as public `iBlock/isComponent`

## v3.0.0-rc.53 (2020-08-04)

#### :bug: Bug Fix

* Fixed generation of code `ES5` `iStaticPage`

## v3.0.0-rc.52 (2020-08-04)

#### :bug: Bug Fix

* Fixed generation of code for a case `nonce() { return "<!--#echo var='NonceValue' -->"; }` `iStaticPage`

## v3.0.0-rc.51 (2020-08-04)

#### :bug: Bug Fix

* Fixed an issue with `reObserve` `core/component/directives/in-view`
* Fixed getting an image URL for IE `bImage`

#### :house: Internal

* Fixed ESLint warnings:
  * `bImage`
  * `bIcon`
  * `bProgressIcon`

#### :nail_care: Polish

* Added documentation:
  * `bImage`
  * `bIcon`
  * `bProgressIcon`
  * `global/g-debug`
  * `global/g-def`
  * `global/g-hint`
  * `global/g-icon`

## v3.0.0-rc.50 (2020-08-03)

#### :bug: Bug Fix

* Fixed `core/component/engines/vue/config/getComponentName`
* Removed normalizing of the `nonce` attribute `iStaticPage`

## v3.0.0-rc.49 (2020-08-03)

#### :boom: Breaking Change

* Removed `isDeactivated`, `removeStrategy` from `core/component/directives/inView/observableElement`

#### :rocket: New Feature

* Added `suspend`, `unsuspend`, `reObserve` methods `inView`

#### :bug: Bug Fix

* Marked `inViewAdapter/stopObserve` as deprecated
* Fixed an issue with `polling` strategy won't fire a `callback` `inView`
* Fixed an issue with `trigger` in `b-bottom-slide` won't fire `v-in-view` callback (`mutation strategy`) `bBottomSlide`, `iHistory`
* Fixed providing of `GLOBAL_NONCE` `iStaticPage`

#### :house: Internal

* Fixed ESLint warnings:
  * `core/component/directives/in-view`
  * `traits/i-history`
  * `traits/i-access`
  * `traits/i-icon`
  * `traits/i-width`
  * `traits/i-visible`
  * `traits/i-size`
  * `traits/i-progress`
  * `traits/i-observe-dom`
  * `super/i-page`
  * `super/i-dynamic-page`
  * `super/i-input`
  * `form/b-button`

#### :nail_care: Polish

* Added documentation `bButton`

## v3.0.0-rc.48 (2020-08-02)

#### :boom: Breaking Change

* Changed the signature of `iData/getDefaultRequestParams`

#### :rocket: New Feature

* Added `initLoadStart` event `iBlock`, `iData`
* Added `core/component/interface/$componentId`
* Added `isWorker` to helpers `build`

#### :bug: Bug Fix

* Fixed building of assets `iStaticPage`
* Fixed an issue with `initLoad` may be called twice `iData`

#### :house: Internal

* Fixed ESLint warnings:
  * `core/component/render-function`
  * `core/component/register`
  * `core/component/directives/update-on`

## v3.0.0-rc.47 (2020-07-31)

#### :boom: Breaking Change

* Renamed `head` -> `deps` `super/i-static-page/i-static-page.interface.ss`

#### :rocket: New Feature

* `super/i-static-page/i-static-page.interface.ss`:
  * Added `meta`
  * Added `head`

## v3.0.0-rc.46 (2020-07-31)

#### :bug: Bug Fix

* Fixed `fullElementName` overloads `iBlock/provide`

#### :house: Internal

* `core/component/state`:
  * Added `experiments`
  * Added `interface/State`

* Fixed ESLint warnings:
  * `super/i-block/modules/activation`
  * `super/i-block/modules/analytics`
  * `super/i-block/modules/async-render`
  * `super/i-block/modules/block`
  * `super/i-block/modules/daemons`
  * `super/i-block/decorators`
  * `super/i-block/modules/dom`
  * `super/i-block/modules/event-emitter`
  * `super/i-block/modules/field`
  * `super/i-block/modules/friend`
  * `super/i-block/modules/lazy`
  * `super/i-block/modules/mods`
  * `super/i-block/modules/opt`
  * `super/i-block/modules/storage`
  * `super/i-block/modules/vdom`
  * `super/i-block/modules/listeners`
  * `super/i-block/directives/event`
  * `core/component/meta`
  * `core/component/field`

## v3.0.0-rc.45 (2020-07-30)

#### :bug: Bug Fix

* Fixed deadlock on initializing `iBlock/state`

## v3.0.0-rc.44 (2020-07-30)

#### :bug: Bug Fix

* Fixed setting of `staticClass` `core/component/engines/vue`
* Fixed initializing of the router `iBlock/state`

#### :house: Internal

* Fixed ESLint warnings:
  * `super/i-block/modules/cache`
  * `super/i-block/modules/provide`

## v3.0.0-rc.43 (2020-07-30)

#### :bug: Bug Fix

* Fixed generation of `init.js` `iStaticPage`

## v3.0.0-rc.42 (2020-07-30)

#### :bug: Bug Fix

* Fixed `resetRouter` without providing of `convertRouterState` `iBlock/state`

#### :house: Internal

* Fixed ESLint warnings `super/i-block/modules/state`

## v3.0.0-rc.41 (2020-07-29)

#### :boom: Breaking Change

* `build/`
  * Removed `snakeskin/filters/csp`
  * Renamed `dependencies` -> `entryPoints` `module.webpack/snakeskin`
  * Renamed `replacers/raw-import` -> `replacers/include`
  * Changed a pattern from `requireMonic(...)` to `include('...');` `replacers/include`

* `iStaticPage`
  * Removed `async`, `module`, `nomodule` from `modules/interface.js/Lib`
  * Removed SS blocks from the template: `defStyles`, `loadStyles`, `defLibs`, `loadLibs`
  * Moved logic from SS to JS `iStaticPage`

* Removed redundant parameters from `config/snakeskin`

#### :rocket: New Feature

Added `config/csp`
* `iStaticPage`
  * Added `links` to `deps.js`
  * Added `attrs` to `modules/interface.js`
  * Added generation of `init.js`

#### :bug: Bug Fix

* Fixed a bug in `test` function in `core/browser`
* Don't show clear button within the read-only mode `iInput`

#### :house: Internal

* Added new dependency: `buble`

## v3.0.0-rc.40 (2020-07-27)

#### :house: Internal

* Logging Vue errors and warnings via the `core/log` module `core/component/engines/vue`

## v3.0.0-rc.39 (2020-07-23)

#### :rocket: New Feature

* [Improved browser test API](https://github.com/V4Fire/Client/issues/289)
* [Added life cycle events `bVirtualScroll`](https://github.com/V4Fire/Client/issues/205)

#### :bug: Bug Fix

* [Fixed reloading of a component after changing its data provider `iData`](https://github.com/V4Fire/Client/pull/293)
* [Fixed an issue when data from `lastLoadedData` and `lastLoadedChunk.normalized` aren't synchronized `bVirtualScroll`](https://github.com/V4Fire/Client/issues/281)
* [Fixed `lastLoadedChunk.raw` returns undefined `bVirtualScroll`](https://github.com/V4Fire/Client/issues/267)

#### :house: Internal

* Added `waitRef` `iBlock/interface/UnsafeIBlock`
* [Refactoring of tests `bVirtualScroll`](https://github.com/V4Fire/Client/pull/293)
* [Fixed ESLint warnings `base/b-virtual-scroll`](https://github.com/V4Fire/Client/pull/293)

* [:up:](https://github.com/V4Fire/Client/pull/293)
  * playwright 1.2.1
  * @v4fire/linters 1.5.2

## v3.0.0-rc.38 (2020-07-21)

#### :bug: Bug Fix

* Fixed caching of old values `core/component/watch`
* Fixed providing explicit `false` value to `readonly` prop `form/b-input`

#### :house: Internal

* Added `npm run up`

## v3.0.0-rc.37 (2020-07-20)

#### :boom: Breaking Change

* Now all accessors with dependencies are cacheable by default
* Marked `router` as optional `iBlock`
* Marked `block` as optional `iBlock`
* Marked `$el` as optional `core/component/interface`
* Changed the `SyncLinkCache` type from Dictionary to Map `core/component/interface`

#### :rocket: New Feature

* Added support of mounted watchers

```js
this.watch(anotherWatcher, () => {
  console.log('...');
});

this.watch({ctx: anotherWatcher, path: foo}, () => {
  console.log('...');
});

this.sync.link(anotherWatcher, () => {
  console.log('...');
});

this.sync.object('foo', [
  ['bla', {ctx: anotherWatcher, path: 'bar'}]
]);

class bFoo {
  @computed({watchable: true})
  get remoteState(): typeof anotherWatcher {
    return anotherWatcher;
  }
}
```

#### :bug: Bug Fix

* Fixed watching for `remoteState`

#### :house: Internal

* Fixed ESLint warnings `core/abt`, `core/async`, `core/browser`, `core/dom`, `core/event`, `core/init`, `core/prelude`, `core/render`, `core/component`, `core/session`, `core/std`, `super/i-block`

## v3.0.0-rc.36 (2020-07-13)

#### :rocket: New Feature

* Improved support of workers `core/build`

#### :bug: Bug Fix

* Added a missing parameter `core/router/StaticRouteMeta.external`
* Fixed providing of parameters `base/b-router/getRoute`

#### :house: Internal

* All linter configurations now loaded from @v4fire/linters
* Fixed TS warnings
* Improved logic `core/build/entries.webpack.js`
* Moved to ESLint `core/build`, `core/cookies`, `core/router`, `base/b-router`
* Refactoring `core/build`

## v3.0.0-rc.35 (2020-07-02)

#### :bug: Bug Fix

* Fixed incorrect bottom-slide positioning with content bigger than `maxVisiblePx`

## v3.0.0-rc.34 (2020-06-30)

#### :house: Internal

* Added `test-entry` argument for test cases

## v3.0.0-rc.33 (2020-06-24)

#### :house: Internal

* Unlocked the @v4fire/core package version

## v3.0.0-rc.32 (2020-06-19)

#### :bug: Bug Fix

* Fixed a problem with converting images to webp `static:image:webp` at `build/static.gulp.js`
* Fixed a problem with image loading `image-webpack-plugin` at `build/module.webpack.js`

#### :house: Internal

* [Improves github actions performance](https://github.com/V4Fire/Client/issues/266)

## v3.0.0-rc.31 (2020-06-17)

#### :bug: Bug Fix

* Fixed a problem with the disappearance of loaders before the content was rendered
* Fixed unsafe pointer `core/component/engines/vue/render`

#### :house: Internal

* Added `.npmignore`
* [Fixed type of `DaemonFn`](https://github.com/V4Fire/Client/issues/257)

## v3.0.0-rc.30 (2020-06-10)

#### :bug: Bug Fix

* Fixed invalid expanding of string literals `build/replacers/ts-import`

## v3.0.0-rc.29 (2020-06-09)

#### :bug: Bug Fix

* Fixed loading of external dependencies `core/router/engines/browser.history`

## v3.0.0-rc.28 (2020-06-09)

#### :bug: Bug Fix

* Fixed loading of external dependencies `core/router/engines/browser.history`

## v3.0.0-rc.27 (2020-06-08)

#### :boom: Breaking Change

* Removed legacy `bRouter`:
  * Removed click handler;
  * Removed `scrollTo`;
  * Review legacy logic with providing of root parameters to the router.

#### :rocket: New Feature

* Improved API `bRouter`:
  * Added `updateRoutes`;
  * Added support to watch route query;
  * Marked `routes` as public;
  * Marked `basePath` as system field.

#### :bug: Bug Fix

* Fixed `external`, `alias` and `redirect` logic `bRouter`

#### :house: Internal

* Added doc and tests `bRouter`

## v3.0.0-rc.26 (2020-06-03)

#### :bug: Bug Fix

* Fixed race condition within tests `bVirtualScroll`

## v3.0.0-rc.25 (2020-06-03)

#### :bug: Bug Fix

* [Fixed an issue where skeletons disappeared `bVirtualScroll`](https://github.com/V4Fire/Client/issues/230)
* [Fixed an issue with a race condition `b-virtual-scroll/chunk-request/init`](https://github.com/V4Fire/Client/issues/203)
* [Fixed an issue where an `empty` slot appeared when there was data `bVirtualScroll`](https://github.com/V4Fire/Client/issues/259)

#### :house: Internal

* [Fixed type of `WrappedDaemonFn`](https://github.com/V4Fire/Client/issues/257)

## v3.0.0-rc.24 (2020-05-29)

#### :bug: Bug Fix

* [Fixed issue with providing extra args in tests](https://github.com/V4Fire/Client/pull/252)
* [Fixed issue with running tests in a single browser](https://github.com/V4Fire/Client/pull/252)

#### :house: Internal

* [Added `--reinit-browser` argument for `npx gulp test:components`](https://github.com/V4Fire/Client/pull/252)

## v3.0.0-rc.23 (2020-05-27)

#### :bug: Bug Fix

* Fixed watching of external accessors

## v3.0.0-rc.22 (2020-05-27)

#### :bug: Bug Fix

* Fixed providing of watch parameters
* Fixed state synchronizing

## v3.0.0-rc.21 (2020-05-27)

#### :bug: Bug Fix

* Fixed deep watching of accessors

## v3.0.0-rc.20 (2020-05-26)

#### :bug: Bug Fix

* Fixed resolving of `$normalParent`

## v3.0.0-rc.19 (2020-05-26)

#### :rocket: New Feature

* [Added `webp` format support](https://github.com/V4Fire/Client/pull/201)
  * Added gulp task `static:image:webp` which will create `webp` from `jpg`, `png` files;
  * Replaced `gulp-image` to the `gulp-imagemin`;
  * Webpack will pass `webp` files through the `image-webpack`.

* [Added gulp task "test: components" which will run in parallel all tests that are specified in the `tests/cases.js` file](https://github.com/V4Fire/Client/pull/201)
* [Added `time`, `timeIn`, `timeOut` in the `in-view` directive](https://github.com/V4Fire/Client/pull/201)

### :bug: Bug Fix

* [Fixed rendering of truncated data in `bVirtualScroll`](https://github.com/V4Fire/Client/issues/231)
* [Fixed rendering of empty slot in `bVirtualScroll`](https://github.com/V4Fire/Client/issues/241)
* [Fixed clear of `in-view` in `bVirtualScroll`](https://github.com/V4Fire/Client/pull/201)
* [Fixed issue with `in-view` that element did not becomes observable](https://github.com/V4Fire/Client/pull/201)
* [Fixed `stopObserver` method in `in-view`](https://github.com/V4Fire/Client/pull/201)
* [Fixed parallel components build](https://github.com/V4Fire/Client/pull/201)
* [Fixed extra space `bCheckbox`](https://github.com/V4Fire/Client/pull/246)

#### :house: Internal

* Added `husky`
* [Added test action](https://github.com/V4Fire/Client/pull/201)
  * Runs component tests;
  * Runs typescript tests;
  * Runs eslint.

* [Added demo model](https://github.com/V4Fire/Client/pull/201)
* [Review `bVirtualScroll`](https://github.com/V4Fire/Client/pull/201)
* [Added few tests for `bVirtualScroll`](https://github.com/V4Fire/Client/pull/201)
* [Improves tests performance](https://github.com/V4Fire/Client/pull/201)

## v3.0.0-rc.18 (2020-05-24)

#### :boom: Breaking Change

* [Renamed `interface/Unsafe` to `interface/UnsafeIBlock` `iBlock`](https://github.com/V4Fire/Client/pull/247)

## v3.0.0-rc.17 (2020-05-22)

#### :bug: Bug Fix

* [Fixed watching for accessors with external dependencies](https://github.com/V4Fire/Client/pull/244)

## v3.0.0-rc.16 (2020-05-21)

#### :bug: Bug Fix

* Fixed NaN at the `visibleInPercent` getter in a case of `windowHeight === 0` `traits/i-history`
* Fixed the `hasTrigger` flag calculation if a page has no children `bBottomSlide`

## v3.0.0-rc.15 (2020-05-20)

#### :bug: Bug Fix

* [Removed `padding-bottom` of the page element `bBottomSlide`](https://github.com/V4Fire/Client/pull/237)

## v3.0.0-rc.14 (2020-05-15)

#### :bug: Bug Fix

* [Fixed `bBottomSlide` bottom padding](https://github.com/V4Fire/Client/pull/232)

## v3.0.0-rc.13 (2020-05-13)

#### :bug: Bug Fix

* Fixed build with TS@3.9

## v3.0.0-rc.12 (2020-05-13)

#### :rocket: New Feature

* Added `--browsers` flag `gulp test:component`

#### :bug: Bug Fix

* Fixed initializing of functional components

#### :house: Internal

* Added demo styles `form/b-button`

## v3.0.0-rc.11 (2020-05-10)

#### :rocket: New Feature

* [Added `forceUpdate` parameter for `@field` decorator](https://github.com/V4Fire/Client/pull/226)

#### :bug: Bug Fix

* Fixed calling `window.scrollTo` without window context

#### :house: Internal

* [Marked `iBlock/modules/lazy` as deprecated](https://github.com/V4Fire/Client/pull/228)

## v3.0.0-rc.10 (2020-05-10)

#### :rocket: New Feature

* Added support for `*.spec.js` files

## v3.0.0-rc.9 (2020-05-09)

#### :rocket: New Feature

* [Added API to test components by using playwright and jasmine](https://github.com/V4Fire/Client/pull/223)

```bash
npx gulp test:component --name b-button
```

## v3.0.0-rc.8 (2020-05-08)

#### :rocket: New Feature

* Added integration with a test library
* Added dynamic demos

```bash
npx webpack --components b-button,b-select
```

#### :nail_care: Polish

* [Printing any changes as groups](https://github.com/V4Fire/Client/pull/218)

## v3.0.0-rc.7 (2020-05-01)

#### :bug: Bug Fix

* Fixed async labels for request animation frame operations `traits/i-history/history`
* Fixed history clearing on close `base/b-bottom-slide`
* Fixed `setMod` event `super/i-block/modules/block/setMod`

## v3.0.0-rc.6 (2020-04-30)

* Fixed watching for getters

## v3.0.0-rc.5 (2020-04-29)

#### :bug: Bug Fix

* Rollback to url-loader@2.3.0

## v3.0.0-rc.4 (2020-04-29)

#### :rocket: New Feature

* Added `iInput/tabIndex`

#### :bug: Bug Fix

* Fixed watching for `$attrs`

## v3.0.0-rc.3 (2020-04-29)

#### :bug: Bug Fix

* [Fixed dynamic creation of components](https://github.com/V4Fire/Client/pull/213)

#### :house: Internal

* Updated dependencies: eventemitter2@6.3.1, browserslist@4.12.0, extract-loader@5.0.1, file-loader@6.0.1, html-loader@1.1.0, mini-css-extract-plugin@0.9.0, raw-loader@4.0.1, svg-url-loader@5.0.0, ts-loader@7.0.1, url-loader@4.1.0, webpack@4.43.0

* Removed replace-loader

## v3.0.0-rc.2 (2020-04-28)

#### :bug: Bug Fix

* Fixed build

## v3.0.0-rc.1 (2020-04-27)

#### :boom: Breaking Change

* All getters are cached by default and can be watched only if they have tied properties, for instance, `foo` -> `fooStore` or `foo` -> `fooProp`,
  otherwise, you need to provide dependencies by using the special decorator to enable these features

* Renamed `build/snakeskin.webpack` to `build/snakeskin/index`
* Renamed `build/snakeskin.vars` to `build/snakeskin/vars`
* Renamed `build/filters` to `build/snakeskin/filters`

#### :rocket: New Feature

* Moved to `core/object/watch` within components:
  1. Added support to watch Set/Map properties of a component;
  2. Added deep watching of system fields;
  3. Every mutation of component fields will force re-render;
  4. Watching of changes is based on the Proxy API.

* Added a new decorator `@computed` to provide meta information to a component accessor property
* Added support to deprecate component props with auto-redirect to a new alternative:

```typescript
import iBlock, { component, prop } from 'super/i-block/i-block';

@component({
  deprecatedProps: {foo: 'bar'}
})

export default class bExample extends iBlock {
  @prop()
  readonly bar: string;
}
```

* Improved API `super/i-block/modules/sync`
* Added `super/i-block/modules/friend`
* Marked `core/component/helpers/observable` as deprecated
* Deprecated a bunch of component properties:
  * `localEvent` -> `localEmitter` (`iBlock`)
  * `parentEvent` -> `parentEmitter` (`iBlock`)
  * `rootEvent` -> `rootEmitter` (`iBlock`)
  * `globalEvent` -> `globalEmitter` (`iBlock`)
  * `dataEvent` -> `dataEmitter` (`iData`)
  * `preset` -> `presets` (`iBlock`)

#### :house: Internal

* Documentation
* Refactoring

## v3.0.0-beta.272 (2020-05-19)

#### :bug: Bug Fix

* [Fixed rendering of truncated data in `bVirtualScroll`](https://github.com/V4Fire/Client/issues/231)

## v3.0.0-beta.271 (2020-04-27)

#### :boom: Breaking Change

* [Improved SVG sprites](https://github.com/V4Fire/Client/pull/190)

## v3.0.0-beta.270 (2020-04-22)

#### :bug: Bug Fix

* [Fixed repetitive `iLockPageScroll.unlock` calls `traits/i-lock-page-scroll/lock`](https://github.com/V4Fire/Client/pull/200)
* [Fixed the default image ratio `bImage`](https://github.com/V4Fire/Client/pull/197)

#### :house: Internal

* [Added README for `iHistory`](https://github.com/V4Fire/Client/pull/199)

## v3.0.0-beta.269 (2020-04-15)

#### :rocket: New Feature

* Added `base/bBottomSlide`
* Added `traits/i-history`
* Added `core/component/directive/v-update-on`

#### :bug: Bug Fix

* Fixed scrolling of nested pages `traits/i-lock-page-scroll/lock`

## v3.0.0-beta.268 (2020-04-08)

#### :bug: Bug Fix

* [Fixed rendering `bVirtualScroll`](https://github.com/V4Fire/Client/pull/194)

## v3.0.0-beta.267 (2020-04-06)

#### :bug: Bug Fix

* Used `localError` event on a request error instead of `localReady`

## v3.0.0-beta.266 (2020-03-30)

#### :bug: Bug Fix

* Fixed `onClick` without data provider `form/b-button`

## v3.0.0-beta.265 (2020-03-27)

#### :bug: Bug Fix

* Fixed `htmlAttrs` block from `super/i-static-page/i-static-page.interface.ss`

## v3.0.0-beta.264 (2020-03-26)

#### :rocket: New Feature

* Added `htmlAttrs` to `super/i-static-page/i-static-page.interface.ss`

#### :house: Internal

* Review `RequestError` export

## v3.0.0-beta.263 (2020-03-18)

#### :rocket: New Feature

* [Added ability to provide an `option` prop as a function into components that implement `iItems` trait](https://github.com/V4Fire/Client/pull/188)

## v3.0.0-beta.262 (2020-03-11)

### :bug: Bug Fix

* [Fixed `reload` method in `bVirtualScroll` when `db` was empty](https://github.com/V4Fire/Client/pull/180)

## v3.0.0-beta.261 (2020-03-10)

### :bug: Bug Fix

* [Fixed `reload` method in `bVirtualScroll`](https://github.com/V4Fire/Client/pull/180)
* [Updated `validators.ts`](https://github.com/V4Fire/Client/pull/178/files)

## v3.0.0-beta.260 (2020-03-10)

#### :boom: Breaking Change

* [Removed default `mangle` option from `terser`](https://github.com/V4Fire/Client/pull/177)

### :bug: Bug Fix

* [Fixed issue with `prev` was undefined](https://github.com/V4Fire/Client/pull/173)
* [Fixed issue with `reload` `requestQuery` was not called](https://github.com/V4Fire/Client/pull/173)

#### :house: Internal

* [Review `bVirtualScroll`](https://github.com/V4Fire/Client/pull/173)

## v3.0.0-beta.259 (2020-03-05)

#### :rocket: New Feature

* Added `core/event`
* Added `core/session`

#### :house: Internal

* Moved `core/data` to `@v4fire/core`
* Moved `core/object` to `@v4fire/core`
* Moved `core/socket` to `@v4fire/core`

## v3.0.0-beta.258 (2020-03-04)

#### :bug: Bug Fix

* Provided request information to an error `core/data/middlewares/attach-mock`

## v3.0.0-beta.257 (2020-02-28)

#### :rocket: New Feature

* [Scripts and styles are now located in body tag](https://github.com/V4Fire/Client/pull/172)

#### :bug: Bug Fix

* [Fixed `b-virtual-scroll/scroll-request` `getData` method was not wrapped with `async.request`](https://github.com/V4Fire/Client/pull/171)

## v3.0.0-beta.256 (2020-02-26)

#### :rocket: New Feature

* Added `getCacheKey` for `Provider`

#### :bug: Bug Fix

* Fixed a race condition with `parallel-webpack`

## v3.0.0-beta.255 (2020-02-25)

#### :boom: Breaking Change

* Removed `extraProviders` from `ProviderOptions`

## v3.0.0-beta.254 (2020-02-25)

#### :rocket: New Feature

* Added a new event `dbCanChange` for `iData`
* [Optimized rendering of `bVirtualScroll`](https://github.com/V4Fire/Client/pull/169)
* [Added `prefetch` in `core/init`](https://github.com/V4Fire/Client/pull/169)

#### :bug: Bug Fix

* Fixed memory leak with data providers
* [Fixed issue with `bVirtualScroll` not beign render some chunks](https://github.com/V4Fire/Client/pull/169)

## v3.0.0-beta.253 (2020-02-24)

#### :bug: Bug Fix

* Removed `pointer-events` style from `i-access` trait that causes click propagation behind a disabled button

## v3.0.0-beta.252 (2020-02-13)

#### :bug: Bug Fix

* Fixed URL resolving `core/data`

## v3.0.0-beta.251 (2020-02-13)

#### :bug: Bug Fix

* Fixed custom base URLs with providers
* Fixed `messageHelpers` type
* Fixed `State.initFromRouter`
* [Fixed `reInit` method in `bVirtualScroll`](https://github.com/V4Fire/Client/pull/162)
* [Fixed `in-view` initialization](https://github.com/V4Fire/Client/pull/162)

#### :house: Internal

* [Added `unsafe` getter for `bVirtualScroll`, `b-virtual-scroll/scroll-render`, `b-virtual-scroll/scroll-request`](https://github.com/V4Fire/Client/pull/162)

## v3.0.0-beta.250 (2020-02-12)

#### :bug: Bug Fix

* Fixed `core/router/engines/browser.history`
* [Fixed icon importing](https://github.com/V4Fire/Client/pull/161)

## v3.0.0-beta.249 (2020-02-12)

#### :bug: Bug Fix

* Reverted `f375c42106b83eea608a4de61e69dee1fb157d26` and `109f11eb9d46f4cf28523a4b8a9db16e4135aeea`

## v3.0.0-beta.248 (2020-02-11)

#### :bug: Bug Fix

* [Fixed icon importing](https://github.com/V4Fire/Client/pull/160)

## v3.0.0-beta.247 (2020-02-11)

#### :house: Internal

* `Provider` constructor marked as public

## v3.0.0-beta.246 (2020-02-11)

#### :rocket: New Feature

* [Added `i-items` trait](https://github.com/V4Fire/Client/pull/154)
* [Added `runtime` block to `bSkeleton`](https://github.com/V4Fire/Client/pull/154)
* [Added `inViewFactory` to create local `in-view` instances](https://github.com/V4Fire/Client/pull/154)
* [Added `observable.size` for `in-view` observable elements](https://github.com/V4Fire/Client/pull/154)
* [Improved icon loading from DS](https://github.com/V4Fire/Client/pull/148)

#### :boom: Breaking Change

* [Review `bVirtualScroll` component](https://github.com/V4Fire/Client/pull/154)

#### :bug: Bug Fix

* [Fixed `v-image` multiply backgrounds](https://github.com/V4Fire/Client/pull/154)

## v3.0.0-beta.245 (2020-01-31)

#### :bug: Bug Fix

* Fixed loading of dynamic dependencies `core/prelude/dependencies`

## v3.0.0-beta.244 (2020-01-30)

#### :house: Internal

* Removed console.log `AsyncRender`

## v3.0.0-beta.243 (2020-01-30)

#### :bug: Bug Fix

* Fixed stream support with `AsyncRender`

## v3.0.0-beta.242 (2020-01-22)

#### :rocket: Breaking Change

* Changed API of `bSlider/OptionProps`

## v3.0.0-beta.241 (2020-01-22)

#### :bug: Bug Fix

* Fixed caching of `Provide.classes`

## v3.0.0-beta.240 (2020-01-14)

#### :rocket: New Feature

* Added a new associated type `iStaticPage.CurrentPage`

## v3.0.0-beta.239 (2020-01-14)

#### :bug: Bug Fix

* Fixed component activation `super/i-block/modules/keep-alive`

## v3.0.0-beta.238 (2020-01-13)

#### :boom: Breaking Change

* Removed `iBlock.forceActivation`
* Renamed `iBlock.forceInitialActivation` to `forceActivation`
* Renamed `iBlock.isInitializedOnce` to `isReadyOnce`

#### :rocket: New Feature

* [Added `i-observe-dom` trait](https://github.com/V4Fire/Client/pull/146)
* Added `unsafe` property to `iBlock`

## v3.0.0-beta.237 (2019-12-19)

### :rocket: New Feature

* [Added `v-image` directive](https://github.com/V4Fire/Client/pull/152)

#### :boom: Breaking Change

* [Removed `v-image` Snakeskin directive](https://github.com/V4Fire/Client/pull/152)

## v3.0.0-beta.236 (2019-12-18)

#### :bug: Bug Fix

* Fixed `valueChange` event `bList`

## v3.0.0-beta.235 (2019-12-18)

#### :rocket: New Feature

* `Opt.memoizeLiteral` now supports functions

## v3.0.0-beta.234 (2019-12-17)

#### :bug: Bug Fix

* Fixed the redundant link initializing `Sync`
* Removed the redundant tag with `v-render` and components without a template

#### :house: Internal

* [`bSlider` component now implements `i-observe-dom`](https://github.com/V4Fire/Client/pull/146)
* [`bContentSwitcher` component now implements `i-observe-dom`](https://github.com/V4Fire/Client/pull/146)
* [`bSlider` component now uses `v-resize` directive](https://github.com/V4Fire/Client/pull/146)
* [Review observable APIs](https://github.com/V4Fire/Client/pull/146)

## v3.0.0-beta.233 (2019-12-13)

#### :bug: Bug Fix

* Fixed `bRemoteProvider` error handling

## v3.0.0-beta.232 (2019-12-13)

#### :boom: Breaking Change

* `dbChange` event will be fired after execution of `initRemoteData` `iData`

## v3.0.0-beta.231 (2019-12-12)

#### :bug: Bug Fix

* Marked `iPage.pageTitle` and `iStaticPage.pageTitle` as non-cacheable

## v3.0.0-beta.230 (2019-12-12)

#### :rocket: New Feature

* Added `beforeOptions` and `afterOptions` slots to `bSlider` component

#### :bug: Bug Fix

* [Fixed `bVirtualScroll` request params](https://github.com/V4Fire/Client/pull/149)
* [Fixed `bVirtualScroll` size calculation in `fixSize` method](https://github.com/V4Fire/Client/pull/149)

## v3.0.0-beta.229 (2019-12-10)

#### :bug: Bug Fix

* Fixed `AsyncRender` destructors
* Marked `bRemoteProvider.content` as non-cacheable
* Fixed `iData.syncRequestParamsWatcher` component status

## v3.0.0-beta.228 (2019-12-09)

#### :bug: Bug Fix

* Fixed `bCheckbox` legacy value logic
* Fixed `bCheckbox` change events

## v3.0.0-beta.227 (2019-12-06)

#### :bug: Bug Fix

* Fixed `bImage.onError` logic

## v3.0.0-beta.226 (2019-12-06)

#### :bug: Bug Fix

* Fixed `bImage` cache
* Fixed `bImage.onError` logic
* Fixed keep-alive with `activatedProp`

## v3.0.0-beta.225 (2019-12-06)

#### :boom: Breaking Change

* Renamed interfaces `Opts` -> `Options`
* Renamed `iData` request error `error` -> `requestError`

#### :rocket: New Feature

* [Added `v-resize` directive](https://github.com/V4Fire/Client/pull/144)

#### :bug: Bug Fix

* [Fixed `bVirtualScroll` reloadLast method](https://github.com/V4Fire/Client/pull/144)
* [Fixed `bVirtualScroll` reload method](https://github.com/V4Fire/Client/pull/144)
* [Fixed `bImage` onImageLoaded method](https://github.com/V4Fire/Client/pull/145)
* Fixed race conditions within `iData`

#### :house: Internal

* Refactoring

## v3.0.0-beta.224 (2019-12-03)

#### :bug: Bug Fix

* [Correctly process alias and redirect fields](https://github.com/V4Fire/Client/pull/143)

## v3.0.0-beta.223 (2019-11-28)

#### :bug: Bug Fix

* Fixed path resolving with getters `iBlock/modules/Field`

## v3.0.0-beta.222 (2019-11-27)

#### :bug: Bug Fix

* [Fixed `bVirtualScroll` component](https://github.com/V4Fire/Client/pull/142)

## v3.0.0-beta.221 (2019-11-27)

#### :boom: Breaking Change

* [Changed `iLockPageScroll` trait methods signature](https://github.com/V4Fire/Client/pull/137)
* [Changed `before` and `after` slots position in `bSlider`](https://github.com/V4Fire/Client/pull/137)
* [Changed `saveDataToRootStore` key generation](https://github.com/V4Fire/Client/pull/137)
* Renamed `needReInit` to `reloadOnActivation` from `iBlock`
* Renamed `needOfflineReInit` to `offlineReload` from `iData`
* New API `bForm.validate`
* Removed `iData.getDefaultErrorText`
* Removed `bForm.onError`
* Removed `iMessage`

#### :rocket: New Feature

* [Added `bVirtualScroll` component](https://github.com/V4Fire/Client/pull/137)
* [Added `appendChild` method to the DOM module](https://github.com/V4Fire/Client/pull/137)
* [Added `placeholderHidden` prop to `bContentSwitcher`](https://github.com/V4Fire/Client/pull/137)
* [Added support for icons from DS](https://github.com/V4Fire/Client/pull/140)

#### :bug: Bug Fix

* [Fixed `bContentSwitcher` `components` resolver not being resolved with multiply components in `content` slot](https://github.com/V4Fire/Client/pull/137)
* [Fixed `bContentSwitcher` not being hidden with `animation` set to `none`](https://github.com/V4Fire/Client/pull/137)

## v3.0.0-beta.220 (2019-11-25)

#### :boom: Breaking Change

* Removed legacy `inject` and `provide` support for components
* Static libraries now will be saved by a key name instead of a file basename
* Removed `bInputNumber`
* Removed `iDataList`

#### :rocket: New Feature

* Added `load` parameter for `super/i-static-page/deps`
* Added `attrs` prop for `bInput`

#### :bug: Bug Fix

* Fixed `sync.link.object` with computed properties

## v3.0.0-beta.219 (2019-11-22)

#### :boom: Breaking Change

* Removed legacy assets
* Removed `checkIcon` and `checkIconComponent` from `bCheckbox`
* Removed `clearIcon` and `clearIconComponent` from `bInput`

#### :house: Internal

* Updated dependencies: file-loader@4.3.0, url-loader@2.3.0

## v3.0.0-beta.218 (2019-11-21)

#### :boom: Breaking Change

* Removed `bInput.pattern`
* Removed hardcoded `bIcon` components and icon styles `bButton`, `bInput`, `bSelect`, `bInputTime`, `bCalendar`

#### :rocket: New Feature

* Added `bList/modules/interface/Option/preIconHintPos|iconHintPos`
* Added `valueChange` event `bList`
* Improved icon props for `bButton`, `bInput`, `bList`

#### :house: Internal

* Review `bList`, `bImage`, `bButton`, `bInput`, `bSelect`, `bCalendar`, `bMatryoshka`

## v3.0.0-beta.217 (2019-11-18)

#### :rocket: New Feature

* Added `iData.checkDBEquality`

#### :house: Internal

* Added `iData/modules/interface/RequestFilterFn`

## v3.0.0-beta.216 (2019-11-15)

#### :rocket: New Feature

* [Added `bMatryoshka` component](https://github.com/V4Fire/Client/pull/139)

#### :house: Internal

* Fixed `OptionProps` type `bSlider`
* Updated dependencies: @v4fire/core@3.0.0-beta.90, path-to-regexp@3.2.0, gulp-csso@4.1.0, terser-webpack-plugin@2.2.1, typograf@6.10.0

## v3.0.0-beta.215 (2019-11-13)

#### :bug: Bug Fix

* Fixed async render with recursion `core/component`

## v3.0.0-beta.214 (2019-11-13)

#### :bug: Bug Fix

* Fixed async render with a filter `super/i-block/modules/async-render`
* Fixed async render with functional components `core/component/functional`
* Fixed `parentId` type `bCheckbox`

## v3.0.0-beta.213 (2019-11-12)

#### :bug: Bug Fix

* Fixed invalid cache key with extra providers `core/data`

## v3.0.0-beta.212 (2019-11-12)

#### :boom: Breaking Change

* Renamed `requestOpts` to `request` within extra providers `core/data`

#### :rocket: New Feature

* Added `provider` and `as` parameters for extra providers `core/data`

## v3.0.0-beta.211 (2019-11-12)

#### :rocket: New Feature

* Added `messageHelpers` prop `iMessage`

## v3.0.0-beta.210 (2019-11-12)

#### :bug: Bug Fix

* Fixed nested checkbox groups
* Fixed invalid cache key with extra providers `core/data`

## v3.0.0-beta.209 (2019-11-11)

#### :rocket: New Feature

* Added `indeterminate` modifier `bCheckbox`
* Added `parentId` prop `bCheckbox`

## v3.0.0-beta.208 (2019-11-11)

#### :boom: Breaking Change

* New `bForm` submit API
* Moved `bForm.delegateAction` to `bForm.action` as a function
* Renamed `static blockValidators` -> `validators` (`iBlock`)
* Renamed `blockValidators` -> `validatorsMap` (`iBlock`)
* Renamed `blockClasses` -> `componentClasses` (`iBlock/modules/provide`)
* Renamed `fullBlockName` -> `fullComponentName` (`iBlock/modules/provide`)
* Renamed `data-init-block` -> `data-root-component` (`iStaticPage`)
* Renamed `data-block-params` -> `data-root-component-params` (`iStaticPage`)
* Removed `bCheckboxGroup`
* Removed `bCheckboxIcon`
* Removed `bWindowForm`
* Removed `bNotifier`
* Removed `bFlagIcon`
* Removed `@bindModTo`, `@elMod`, `@removeElementMod` decorators

#### :bug: Bug Fix

* Fixed arguments providing for `sync.mod`
* Fixed `bCheckbox` and `bRadioButton` native support
* Fixed validator messages with functional components
* Fixed props with multiple types

## v3.0.0-beta.207 (2019-11-07)

#### :rocket: New Feature

* Added an array form for converter parameters (`base/b-dynamic-page`, ``)
* Added `beforeImg` and `afterImg` props for `bImage`

#### :bug: Bug Fix

* Fixed default modifier handlers
* Fixed `bCheckbox` native support

## v3.0.0-beta.206 (2019-11-06)

#### :bug: Bug Fix

* Fixed session providing `models/modules/session`

#### :house: Internal

* Updated dependencies: @v4fire/core@3.0.0-beta.86, webpack@4.41.2, autoprefixer@9.7.1, eslint@6.6.0

## v3.0.0-beta.205 (2019-10-15)

#### :bug: Bug Fix

* Fixed inlining with `fatHTML`

## v3.0.0-beta.204 (2019-10-15)

#### :bug: Bug Fix

* Fixed inlining with `fatHTML`

## v3.0.0-beta.203 (2019-10-15)

#### :bug: Bug Fix

* Fixed `publicPath` providing from `assets.json`

## v3.0.0-beta.202 (2019-10-14)

#### :bug: Bug Fix

* Fixed `source: 'output'` with production mode `super/i-static-page/i-static-page.interface.ss`

#### :house: Internal

* `GLOBAL` -> `globalThis`
* Updated dependencies: @v4fire/3.0.0-beta.81

## v3.0.0-beta.201 (2019-10-13)

#### :boom: Breaking Change

* Added `InitLoadParams` instead `silent` parameter for `initLoad`
* `renderKey` attribute will be set as `data-render-key` for dom nodes

#### :rocket: New Feature

* Added `bIconButton`

#### :bug: Bug Fix

* Fixed modifiers watching

#### :house: Internal

* [Updated DS styles](https://github.com/V4Fire/Client/pull/138)

## v3.0.0-beta.200 (2019-10-11)

#### :bug: Bug Fix

* Fixed `source: 'output'` inlining `super/i-static-page/i-static-page.interface.ss`

#### :house: Internal

* Updated dependencies: @v4fire/3.0.0-beta.80

## v3.0.0-beta.199 (2019-10-11)

#### :bug: Bug Fix

* Fixed `source: 'output'` links `super/i-static-page/i-static-page.interface.ss`

## v3.0.0-beta.198 (2019-10-10)

#### :rocket: New Feature

* Provided extra parameters to component slots
* Added `label` slot within `bCheckbox`

#### :bug: Bug Fix

* Fixed inlining for source `output` `super/i-static-page/i-static-page.interface.ss`

## v3.0.0-beta.197 (2019-10-09)

#### :bug: Bug Fix

* Fixed prop regexp `core/component/create/helpers/field`

#### :house: Internal

* Updated dependencies: @v4fire/3.0.0-beta.77

## v3.0.0-beta.196 (2019-10-08)

#### :bug: Bug Fix

* Fixed composite components ref links
* Fixed state sync methods

## v3.0.0-beta.195 (2019-10-08)

#### :boom: Breaking Change

* Renamed `Analytics` -> `ControlAnalytics` within `traits/i-control-list`

#### :rocket: New Feature

* Added `attrsMap` to `traits/i-control-list/ControlActionObject`

#### :bug: Bug Fix

* [Fixed DS functions naming](https://github.com/V4Fire/Client/pull/136)

#### :nail_care: Polish

* Review `iControlList` interfaces

## v3.0.0-beta.194 (2019-10-07)

#### :boom: Breaking Change

* Renamed `pagePropObj` -> `pagePropObject` within `bRouter`
* Renamed `DaemonSpawnedObj` -> `SpawnedDaemonObject` within `i-block/modules/daemons`
* Review `iControlList` interfaces

## v3.0.0-beta.193 (2019-10-04)

#### :boom: Breaking Change

* New API for `i-static-page/modules/helpers/loadToLib`
* New API for `i-static-page/deps.js`
* Removed redundant span tag within `b-icon/b-icon.ss`
* Rewrite `bCheckboxGroup` API
* [Added `attrs` argument instead of `style` for `bSkeleton`](https://github.com/V4Fire/Client/pull/134)

#### :rocket: New Feature

* Added support for TS within a STD entry point
* Added `checkIcon` and `checkIconComponent` to `bCheckbox`

#### :bug: Bug Fix

* Fixed dependency loader `i-static-page/i-static-page.ss`
* [Fixed `bSkeleton` has an additional wrapper](https://github.com/V4Fire/Client/pull/134)
* Fixed icons within `bCheckbox`

#### :house: Internal

* Review `bCheckbox`
* Moved to new locale API
* Updated dependencies: @v4fire/3.0.0-beta.70, url-loader@2.2.0

## v3.0.0-beta.192 (2019-10-01)

#### :bug: Bug Fix

* Fixed `skeletonMarker` default value

## v3.0.0-beta.191 (2019-10-01)

#### :rocket: New Feature

* Added `skeletonMarker` flag to `iBlock`

#### :house: Internal

* Refactoring

## v3.0.0-beta.190 (2019-09-29)

#### :boom: Breaking Change

* [Renamed `bSwitcher` component to `bContentSwitcher`](https://github.com/V4Fire/Client/pull/132/files)

### :rocket: New Feature

* [Added `resolveStrategy` property to `bContentSwitcher`](https://github.com/V4Fire/Client/pull/132/files)
* [Added `syncState` event to `bSlider`](https://github.com/V4Fire/Client/pull/132/files)

#### :bug: Bug Fix

* [Fixed `bSkeleton` params providing to blocks](https://github.com/V4Fire/Client/pull/132/files)

#### :house: Internal

* Updated dependencies: webpack@4.41.0, terser-webpack-plugin@2.1.2, ts-loader@6.2.0, merge2@1.3.0, hasha@5.1.0

## v3.0.0-beta.189 (2019-09-26)

#### :boom: Breaking Change

* [Removed function as a value support for `in-view` directive](https://github.com/V4Fire/Client/pull/130)

#### :bug: Bug Fix

* Fixed `watchParams` type `core/component/decorators/base`

#### :house: Internal

* [Added `in-view` directive value validator](https://github.com/V4Fire/Client/pull/130)
* [b-slider `optionKey` property is now able to be a function](https://github.com/V4Fire/Client/pull/131)

## v3.0.0-beta.188 (2019-09-25)

#### :bug: Bug Fix

* Fixed `iStaticPage.setPageTitle`
* Fixed collision of events with `functional` and `composite` components

## v3.0.0-beta.187 (2019-09-24)

#### :boom: Breaking Change

* Removed `once` modifier from `in-view` directive
* Removed `timeout` property from `in-view` directive options

### :rocket: New Feature

* [Added multiply options support for `in-view` directive](https://github.com/V4Fire/Client/pull/129)

## v3.0.0-beta.186 (2019-09-21)

#### :bug: Bug Fix

* Fixed `$refs` patching for functional components
* Fixed unsafe methods `bSidebar`

#### :house: Internal

* Added preventing for `-webkit-tap-highlight-color` with `bButton`, `bInput`

## v3.0.0-beta.185 (2019-09-18)

#### :rocket: New Feature

* Added `r` function to global Stylus functions

## v3.0.0-beta.184 (2019-09-18)

#### :boom: Breaking Change

* Removed `bUp` component
* Removed `iRound` trait
* Removed legacy sizes API

#### :rocket: New Feature

* Added `replaceByRegExp` to `build/stylus/string` API

#### :bug: Bug Fix

* Fixed modifiers inheritance

#### :house: Internal

* Review DS API

## v3.0.0-beta.183 (2019-09-17)

#### :rocket: New Feature

* Added `brokenImg` and `overlayImg` props for `bImage`

#### :bug: Bug Fix

* Fixed `:style` providing
* Fixed `Sync.object` with null values
* Fixed router synchronizing with null values `bRouter`, `State`
* [Fixed `saveABT` didn't save the value received from the adapter if the adapter was an asynchronous function](https://github.com/V4Fire/Client/pull/123)

## v3.0.0-beta.182 (2019-09-16)

#### :bug: Bug Fix

* [Fixed `bSlider` alignment](https://github.com/V4Fire/Client/pull/122)

## v3.0.0-beta.181 (2019-09-16)

#### :house: Internal

* Design System: [API refactoring](https://github.com/V4Fire/Client/pull/121)

## v3.0.0-beta.180 (2019-09-15)

#### :house: Internal

* Design System: improved error handling

## v3.0.0-beta.179 (2019-09-13)

#### :house: Internal

* Updated design system

## v3.0.0-beta.178 (2019-09-13)

#### :bug: Bug Fix

* Fixed providing of WebPack globals

## v3.0.0-beta.177 (2019-09-13)

#### :rocket: New Feature

* Added `preset` field `iBlock`
* Merged [Design System branch](https://github.com/V4Fire/Client/pull/88/)

#### :nail_care: Polish

* Optimized component initializing

#### :house: Internal

* Updated dependencies: terser-webpack-plugin@2.0.1, node-object-hash@2.0.0, webpack@4.40.1, ts-loader@6.1.0

## v3.0.0-beta.176 (2019-09-12)

#### :bug: Bug Fix

* Fixed accessors inheritance

## v3.0.0-beta.175 (2019-09-12)

#### :rocket: New Feature

* Added `engine` parameter to the config
* Added `runtime.engine` parameter to the config

#### :bug: Bug Fix

* Fixed native events with functional components
* Fixed attr props normalizing
* Fixed styles with undefined `component/engine/zero`

#### :nail_care: Polish

* Optimized component initializing

## v3.0.0-beta.174 (2019-09-12)

#### :bug: Bug Fix

* Fixed `ProvidedDataStore` initializing `iStaticPage`

## v3.0.0-beta.173 (2019-09-11)

#### :rocket: New Feature

* [Added global store for data providers](https://github.com/V4Fire/Client/pull/109)

#### :boom: Breaking Change

* Removed `bProgress`

## v3.0.0-beta.172 (2019-09-10)

#### :rocket: New Feature

* Added `scrollExterior` prop to `bSelect`, `bTextarea`
* Improved `Option` parameters from `bSelect`, `bCheckboxGroup`, `bList`

#### :house: Internal

* Refactoring `bList`, `bScroll`, `bSelect`, `bTextarea`, `bCheckboxGroup`

## v3.0.0-beta.171 (2019-09-10)

#### :bug: Bug Fix

* Marked `Option.classes` as optional `bList`

## v3.0.0-beta.170 (2019-09-09)

#### :bug: Bug Fix

* Marked `optionsIterator` as optional `bSlider`

## v3.0.0-beta.169 (2019-09-09)

#### :boom: Breaking Change

* Fixed default `del` handler `iData`

## v3.0.0-beta.168 (2019-09-09)

#### :boom: Breaking Change

* Renamed `ControlAction.params` -> `args`
* Renamed `ControlAction.useDefParams` -> `defArgs`

## v3.0.0-beta.167 (2019-09-09)

#### :house: Internal

* Added default value for `opts` within `traits/i-control-list/iControlList`

## v3.0.0-beta.166 (2019-09-09)

#### :bug: Bug Fix

* Fixed prop normalizing

## v3.0.0-beta.165 (2019-09-08)

#### :bug: Bug Fix

* Fixed `activeProp` watching

## v3.0.0-beta.164 (2019-09-08)

#### :house: Internal

* `vdom` marked as public `iBlock`

## v3.0.0-beta.163 (2019-09-08)

#### :boom: Breaking Change

* Renamed `core/component/interface/watchOptionsWithHander` -> `watchObject`

## v3.0.0-beta.162 (2019-09-07)

#### :rocket: New Feature

* Added `content` getter for `bRemoteProvider`

#### :bug: Bug Fix

* Removed V2 legacy code from `bWindow`, `bCheckboxGroup`
* Fixed `asyncRender` with nested template tags

#### :nail_care: Polish

* Improved prop normalizing with `v-attrs`
* Improved component activation logic
* Refactoring

## v3.0.0-beta.161 (2019-09-07)

#### :rocket: New Feature

* Added slot support for `bRemoteProvider`

## v3.0.0-beta.160 (2019-09-07)

#### :bug: Bug Fix

* Hotfix: contentLength marked as non-cache `bSlider`, `bSwitcher`

## v3.0.0-beta.159 (2019-09-07)

#### :rocket: New Feature

* Added `content` and `contentLength` getters within `bSlider`
* Added `content` and `contentLength` getters within `bSwitcher`

#### :house: Internal

* Updated dependencies: @v4fire/core@3.0.0-beta.67

## v3.0.0-beta.158 (2019-09-07)

#### :house: Internal

* Reviewed internal API `bSlider`

## v3.0.0-beta.157 (2019-09-07)

#### :rocket: New Feature

* Added support for `height` prop (stylus) within `bSlider`

#### :bug: Bug Fix

* [Fixed `blockMap` cache within webpack build](https://github.com/V4Fire/Client/pull/117)

#### :house: Internal

* Updated dependencies: browserslist@4.7.0, image-webpack-loader@6.0.0

## v3.0.0-beta.156 (2019-09-03)

#### :rocket: New Feature

* Added `optionKey` prop to `bSlider`
* Added `optionsIterator` prop to `bSlider`
* Provided an option index to a prop function `bSlider`
* Added support for non defined values with `asyncRender.iterate`
* Marked `asyncRender` as public `iBlock`
* Added `isInitializedOnce` parameter `iBlock`

#### :bug: Bug Fix

* Fixed `bSlider` with options prop
* If component is not activated, than it won't be initialized
* Online check should not block the render

#### :house: Internal

* Refactoring and optimizations

## v3.0.0-beta.155 (2019-09-03)

#### :rocket: New Feature

* [Provided block names to the config](https://github.com/V4Fire/Client/pull/115)

#### :house: Internal

* Refactoring and optimizations
* Default `bIcon` size is set to `1em`

## v3.0.0-beta.154 (2019-09-02)

#### :rocket: New Feature

* Added `MockCustomResponse.responseType`
* Added `MockCustomResponse.decoders`

## v3.0.0-beta.153 (2019-08-30)

#### :house: Internal

* Review `*.styl` files

## v3.0.0-beta.152 (2019-08-30)

#### :bug: Bug Fix

* [Fixed `bImage`](https://github.com/V4Fire/Client/pull/113): image should be in a fixed height container

## v3.0.0-beta.151 (2019-08-30)

#### :bug: Bug Fix

* Fixed `provide.classes` with more than one element from a node

## v3.0.0-beta.150 (2019-08-29)

#### :bug: Bug Fix

* Fixed `@watch` with getters
* Fixed invalid cache key with extra providers

## v3.0.0-beta.149 (2019-08-28)

#### :rocket: New Feature

* Added `styles` prop to `iBlock`

#### :bug: Bug Fix

* Fixed `$root` reference with `@system` fields

## v3.0.0-beta.148 (2019-08-27)

#### :bug: Bug Fix

* Fixed `bImage` logic
* Fixed `.providerName` without a namespace
* Fixed prop modifiers

## v3.0.0-beta.147 (2019-08-27)

#### :boom: Breaking Change

* Renamed `bGenerator` to `bComponentRenderer`

#### :rocket: New Feature

* Added API for loop masks with `bInput`

## v3.0.0-beta.146 (2019-08-26)

#### :bug: Bug Fix

* Fixed `core/data/middlewares/attachMock` with ES dynamic import

#### :nail_care Polish

* Improved API of mocks

## v3.0.0-beta.145 (2019-08-23)

#### :rocket: New Feature

* Added the config object for mocks

## v3.0.0-beta.144 (2019-08-22)

#### :nail_care: Internal

* Improved `core/data/middlewares/attachMock`

## v3.0.0-beta.143 (2019-08-22)

#### :bug: Bug Fix

* Fixed `bImage` with broken images

## v3.0.0-beta.142 (2019-08-21)

#### :bug: Bug Fix

* Fixed `@watch` with nested fields

## v3.0.0-beta.141 (2019-08-21)

#### :bug: Bug Fix

* Added support for `.watch` with `@system` fields
* Fixed `Field` API with links like `$root.something`, `$parent.something`, etc.

#### :house: Internal

* Renamed `core/component/create/helpers/getRealFieldInfo` -> `getFieldInfo` and improved API

## v3.0.0-beta.140 (2019-08-21)

#### :rocket: New Feature

* Improved `core/data/middlewares/attachMock`:
  * Added support for async data
  * Response can be a function
  * Response can be a promise

#### :house: Internal

* Added `CHANGELOG.md`
* Updated `@v4fire/core`
