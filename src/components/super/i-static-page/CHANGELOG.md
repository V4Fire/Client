Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.62 (2024-02-19)

#### :bug: Bug Fix

* Fixed bugs in the initialization of SSR rendering

## v4.0.0-beta.59 (2024-02-15)

#### :bug: Bug Fix

* Removed all references to the global state

## v4.0.0-beta.58 (2024-02-14)

#### :bug: Bug Fix

* Fixed a memory leak

## v4.0.0-beta.57 (2024-02-13)

#### :bug: Bug Fix

* Fixed a memory leak

## v4.0.0-beta.55 (2024-02-08)

#### :bug: Bug Fix

* Added cleanup of hydrated data upon component destroying

## v4.0.0-beta.41 (2023-11-21)

#### :boom: Breaking Change

* Removed generation of init.js

#### :rocket: New Feature

* Now styles are always inlined in html

#### :bug: Bug Fix

* Now the `nonce` attribute is correctly set in inline mode

## v4.0.0-beta.37 (2023-10-27)

#### :bug: Bug Fix

* Fixed declarations of optional deps

## v4.0.0-beta.33 (2023-10-18)

#### :rocket: New Feature

* Added the ability to build initial HTML file without any inline Javascript by configuring `webpack.externalizeInline`

## v4.0.0-beta.30 (2023-10-11)

#### :bug: Bug Fix

* Fix initializing of the `helpers` and `providers` blocks for SSR

## v4.0.0-beta.29 (2023-10-02)

#### :bug: Bug Fix

* Teleports should not be rendered during SSR

## v4.0.0-beta.17 (2023-09-06)

#### :bug: Bug Fix

* Added a special element for teleports

## v3.33.0 (2022-12-28)

#### :rocket: New Feature

* Added the ability to manipulate meta-information of a page

## v3.29.0 (2022-09-13)

#### :boom: Breaking Change

* Removed `components/global/g-visible`
* Renamed the global `hide-if-offline` attribute to `data-hide-if-offline`

#### :bug: Bug Fix

* The online watcher is now created with the `immediate` flag

#### :memo: Documentation

* Added missing documentation `data-hide-if-offline`

## v3.9.1 (2021-11-09)

#### :boom: Breaking Change

* Now base CSS styles are synchronously loaded by default if enabled CSP

## v3.9.0 (2021-11-08)

#### :bug: Bug Fix

* Fixed invalid escaping of `csp.nonce`

## v3.3.0 (2021-08-12)

#### :bug: Bug Fix

* Added normalizing of trailing slashes from `webpack.publicPath`

#### :memo: Documentation

* Added documentation

## v3.1.0 (2021-08-04)

#### :bug: Bug Fix

* Fixed project building without `--public-path`
* Don't attach favicons if they are disabled

## v3.0.1 (2021-07-28)

#### :bug: Bug Fix

* Fixed building favicons from parent layers

## v3.0.0-rc.215 (2021-07-25)

#### :bug: Bug Fix

* Restored support of favicons

#### :house: Internal

* Added tests

## v3.0.0-rc.214 (2021-07-22)

#### :boom: Breaking Change

* Now `providerDataStore` implements `core/cache`

#### :memo: Documentation

* Added documentation

## v3.0.0-rc.212 (2021-07-22)

#### :bug: Bug Fix

* Fixed an issue when Vue drops a prototype from the route object

## v3.0.0-rc.211 (2021-07-21)

#### :house: Internal

* Removed `jasmine` deps in the `runtime.debug` mode

## v3.0.0-rc.211 (2021-07-21)

#### :bug: Bug Fix

* Provided the `lang` attribute to `<html>`

## v3.0.0-rc.169 (2021-03-25)

#### :bug: Bug Fix

* Fixed generation of `.init.js` files

## v3.0.0-rc.167 (2021-03-24)

#### :bug: Bug Fix

* Fixed the `--fat-html` build mode

## v3.0.0-rc.164 (2021-03-22)

#### :rocket: New Feature

* Added the ability to change themes

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

* Renamed `head` -> `deps` `i-static-page.html.ss`

#### :rocket: New Feature

* `i-static-page.html.ss`:
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
