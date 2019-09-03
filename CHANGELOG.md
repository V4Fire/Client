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

## v3.0.0-beta.155 (2019-09-03)

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
