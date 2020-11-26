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

## v3.0.0-rc.?? ()

#### :boom: Breaking Change

* Now `initFromStorage` returns `CanPromise` `super/i-block/modules/state`
* Removed the default export of submodules `core/dom`
* Removed `StaticRouteMeta.entryPoint` and `StaticRouteMeta.dynamicDependencies` `core/router`

* `config`:
  * Removed `build.fast`
  * Removed `webpack.buildCache`
  * Removed `webpack.cacheDir`
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

* `config`:
  * Added `webpack.mode`
  * Added `webpack.cache`

* Added API to load the dynamic dependencies `iBlock`
* Added `StaticRouteMeta.load` `core/router`

#### :house: Internal

* Added a new dependency `style-loader`
* Added prefetch for the dynamic dependencies `iData`

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
  * Fixed resolving of accessor

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

#### :house: [Internal]

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

* Fixed `fullElName` overloads `iBlock/provide`

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
  * `super/i-block/modules/decorators`
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
* Added dynamic demo-s

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

* Fixed custom base URL-s with providers
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
* Static libraries now will be saved by a key name, instead of a file basename
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
* Removed `@bindModTo`, `@elMod`, `@removeElMod` decorators

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
