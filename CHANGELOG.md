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

## v3.0.0-beta.249 (2020-02-12)

* Reverted `f375c42106b83eea608a4de61e69dee1fb157d26` and `109f11eb9d46f4cf28523a4b8a9db16e4135aeea`

## v3.0.0-beta.248 (2020-02-11)

* [Fixed icon importing](https://github.com/V4Fire/Client/pull/160)

## v3.0.0-beta.247 (2020-02-11)

#### :house: Internal

* `Provider` constructor marked as public

## v3.0.0-beta.246 (2020-02-11)

#### :rocket: New Feature

* [Added `i-item` trait](https://github.com/V4Fire/Client/pull/154)
* [Added `runtime` block to `b-skeleton`](https://github.com/V4Fire/Client/pull/154)
* [Added `inViewFactory` to create local `in-view` instances](https://github.com/V4Fire/Client/pull/154)
* [Added `observable.size` for `in-view` observable elements](https://github.com/V4Fire/Client/pull/154)
* [Improved icon loading from DS](https://github.com/V4Fire/Client/pull/148)

#### :boom: Breaking Change

* [Review `b-virtual-scroll` component](https://github.com/V4Fire/Client/pull/154)

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

* [`b-slider` component now implements `i-observe-dom`](https://github.com/V4Fire/Client/pull/146)
* [`b-content-switcher` component now implements `i-observe-dom`](https://github.com/V4Fire/Client/pull/146)
* [`b-slider` component now uses `v-resize` directive](https://github.com/V4Fire/Client/pull/146)
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

* Added `beforeOptions` and `afterOptions` slots to `b-slider` component

#### :bug: Bug Fix

* [Fixed `b-virtual-scroll` request params](https://github.com/V4Fire/Client/pull/149)
* [Fixed `b-virtual-scroll` size calculation in `fixSize` method](https://github.com/V4Fire/Client/pull/149)

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

* [Fixed `b-virtual-scroll` reloadLast method](https://github.com/V4Fire/Client/pull/144)
* [Fixed `b-virtual-scroll` reload method](https://github.com/V4Fire/Client/pull/144)
* [Fixed `b-image` onImageLoaded method](https://github.com/V4Fire/Client/pull/145)
* Fixed race conditions within `iData`

#### :house: Internal

* Refactoring

## v3.0.0-beta.224 (2019-12-03)

#### :bug: Bug Fix

* [https://github.com/V4Fire/Client/pull/143](Correctly process alias and redirect fields)

## v3.0.0-beta.223 (2019-11-28)

#### :bug: Bug Fix

* Fixed path resolving with getters `iBlock/modules/Field`

## v3.0.0-beta.222 (2019-11-27)

#### :bug: Bug Fix

* [Fixed `b-virtual-scroll` component](https://github.com/V4Fire/Client/pull/142)

## v3.0.0-beta.221 (2019-11-27)

#### :boom: Breaking Change

* [Changed `iLockPageScroll` trait methods signature](https://github.com/V4Fire/Client/pull/137)
* [Changed `before` and `after` slots position in `b-slider`](https://github.com/V4Fire/Client/pull/137)
* [Changed `saveDataToRootStore` key generation](https://github.com/V4Fire/Client/pull/137)
* Renamed `needReInit` to `reloadOnActivation` from `iBlock`
* Renamed `needOfflineReInit` to `offlineReload` from `iData`
* New API `bForm.validate`
* Removed `iData.getDefaultErrorText`
* Removed `bForm.onError`
* Removed `iMessage`

#### :rocket: New Feature

* [Added `b-virtual-scroll` component](https://github.com/V4Fire/Client/pull/137)
* [Added `appendChild` method to the DOM module](https://github.com/V4Fire/Client/pull/137)
* [Added `placeholderHidden` prop to `b-content-switcher`](https://github.com/V4Fire/Client/pull/137)
* [Added support for icons from DS](https://github.com/V4Fire/Client/pull/140)

#### :bug: Bug Fix

* [Fixed `b-content-switcher` `components` resolver not being resolved with multiply components in `content` slot](https://github.com/V4Fire/Client/pull/137)
* [Fixed `b-content-switcher` not being hidden with `animation` set to `none`](https://github.com/V4Fire/Client/pull/137)

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
* [Added `attrs` argument instead of `style` for `b-skeleton`](https://github.com/V4Fire/Client/pull/134)

#### :rocket: New Feature

* Added support for TS within a STD entry point
* Added `checkIcon` and `checkIconComponent` to `bCheckbox`

#### :bug: Bug Fix

* Fixed dependency loader `i-static-page/i-static-page.ss`
* [Fixed `b-skeleton` has an additional wrapper](https://github.com/V4Fire/Client/pull/134)
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

* [Renamed `b-switcher` component to `b-content-switcher`](https://github.com/V4Fire/Client/pull/132/files)

### :rocket: New Feature

* [Added `resolveStrategy` property to `b-content-switcher`](https://github.com/V4Fire/Client/pull/132/files)
* [Added `syncState` event to `b-slider`](https://github.com/V4Fire/Client/pull/132/files)

#### :bug: Bug Fix

* [Fixed `b-skeleton` params providing to blocks](https://github.com/V4Fire/Client/pull/132/files)

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

* Removed V2 legacy code from `b-window`, `b-checkbox-group`
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

* Added support for `height` prop (stylus) within `b-slider`

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
