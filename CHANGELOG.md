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
