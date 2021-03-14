Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.157 (2021-03-10)

#### :rocket: New Feature

* Added the support of external CSS libraries to build within entries

## v3.0.0-rc.149 (2021-03-01)

#### :bug: Bug Fix

* Don't generate `.init.js` with `--fat-html`

## v3.0.0-rc.147 (2021-02-18)

#### :bug: Bug Fix

* Removed a race condition during loading of the libs

## v3.0.0-rc.136 (2021-02-02)

#### :bug: Bug Fix

* Fixed inlining with `fatHTML`

## v3.0.0-rc.124 (2021-01-18)

#### :bug: Bug Fix

* Fixed a bug when an optional asset isn't exist `modules/ss-helpers/page/getScriptDeclByName`

## v3.0.0-rc.121 (2021-01-12)

#### :bug: Bug Fix

* Fixed a bug with `getRootMod`

## v3.0.0-rc.120 (2020-12-23)

#### :bug: Bug Fix

* Fixed a bug after refactoring

## v3.0.0-rc.119 (2020-12-23)

#### :bug: Bug Fix

* Now all dynamic scripts and links are added to the document head

## v3.0.0-rc.117 (2020-12-23)

#### :bug: Bug Fix

* Fixed generation of `init` files

## v3.0.0-rc.116 (2020-12-23)

#### :bug: Bug Fix

* Fixed CSP bugs

## v3.0.0-rc.115 (2020-12-23)

#### :rocket: New Feature

* Improved CSP support. Added the `postProcessor` mode.

## v3.0.0-rc.110 (2020-12-16)

#### :boom: Breaking Change

* Renamed `GLOBAL_NONCE` to `CSP_NONCE`
* Renamed `documentWrite` -> `js` `modules/ss-helpers`

#### :rocket: New Feature

* Added `crossorigin` attributes to scripts and links

#### :house: Internal

* Prefer `createElement` instead `documentWrite`

## v3.0.0-rc.109 (2020-12-15)

#### :house: Internal

* Removed watchers for `isAuth`, `isOnline` and `lastOnlineDate` fields.
They are synchronized with `remoteState` via `sync.link`.

## v3.0.0-rc.101 (2020-11-18)

#### :bug: Bug Fix

* Fixed import errors

#### :house: Internal

* Fixed lint warnings

## v3.0.0-rc.90 (2020-10-22)

#### :rocket: New Feature

* Added `globalHintHelpers`
* Added `globalIconHelpers`

## v3.0.0-rc.63 (2020-09-10)

#### :bug: Bug Fix

* Fixed `init.js` generation `ss-helpers`

## v3.0.0-rc.53 (2020-08-04)

#### :bug: Bug Fix

* Fixed generation of code `ES5`

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
