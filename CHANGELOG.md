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
