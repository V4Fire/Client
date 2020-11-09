Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.96 ()

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
* Added `ValidationError.component` and `ValidationError.error`
* Added `getValues`
* Added `toggleControls`

#### :house: Internal

* Fixed ESLint warnings

#### :nail_care: Polish

* Added documentation
* Added tests
