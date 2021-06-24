Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.205 (2021-06-24)

#### :bug: Bug Fix

* Fixed applying of form converters

#### :house: Internal

* Moved form data converting to `core/request`

## v3.0.0-rc.203 (2021-06-21)

#### :bug: Bug Fix

* Fixed caching of form values

## v3.0.0-rc.199 (2021-06-16)

#### :boom: Breaking Change

* Now `validate` returns `ValidationError` in case of failed validation
* Renamed `ValidateParams` to `ValidateOptions`
* Changed the root tag `div` to `form`
* Removed the `form` ref and block
* Changed the default value of `method` from `add` to `post`
* Removed legacy logic of the `'_'` name
* Deprecated `ValidationError.el` and `ValidationError.validator`
* Deprecated `values`

#### :rocket: New Feature

* Added `getElValueToSubmit`
* Added the `submitEnd` event
* Added `ValidationError.name/component/details`
* Added `getValues`
* Added `toggleControls`
* Now `ValidationError` is a class
* Now `submit` returns a value
* Improved submit events

#### :memo: Documentation

* Added documentation

#### :house: Internal

* Fixed ESLint warnings

#### :nail_care: Polish

* Added tests
