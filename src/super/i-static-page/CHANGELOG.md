Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.52 (2020-08-04)

#### :bug: Bug Fix

* Fixed generation of code for a case `nonce() { return "<!--#echo var='NonceValue' -->"; }`

## v3.0.0-rc.50 (2020-08-03)

#### :bug: Bug Fix

* Removed normalizing of the `nonce` attribute

## v3.0.0-rc.49 (2020-08-03)

#### :bug: Bug Fix

* Fixed providing of `GLOBAL_NONCE`

## v3.0.0-rc.48 (2020-08-02)

#### :bug: Bug Fix

* Fixed building of assets

## v3.0.0-rc.47 (2020-07-31)

#### :boom: Breaking Change

* Renamed `head` -> `deps` `i-static-page.interface.ss`

#### :rocket: New Feature

* `i-static-page.interface.ss`:
  * Added `meta`
  * Added `head`

## v3.0.0-rc.43 (2020-07-30)

#### :bug: Bug Fix

* Fixed generation of `init.js`

## v3.0.0-rc.41 (2020-07-29)

#### :boom: Breaking Change

* Removed SS blocks from the template: `defStyles`, `loadStyles`, `defLibs`, `loadLibs`
* Removed `async`, `module`, `nomodule` from `modules/interface.js/Lib`

#### :rocket: New Feature

* Added `links` to `deps.js`
* Added `attrs` to `modules/interface.js`
* Added generation of `init.js`

#### :house: Internal

* Moved logic from SS to JS

## v3.0.0-rc.37 (2020-07-20)

#### :house: Internal

* Fixed ESLint warnings
