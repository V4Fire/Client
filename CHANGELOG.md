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
