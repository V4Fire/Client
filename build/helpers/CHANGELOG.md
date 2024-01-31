Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.30 (2023-10-11)

#### :rocket: New Feature

* Added `tracer` helper, which can be used to trace build events,
it uses [Trace Event Format](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit#heading=h.q8di1j2nawlp)

## v4.0.0-beta.13 (2023-08-24)

#### :rocket: New Feature

* Added `getManagedPath` helper, which generates a managed path for node_modules with excluding
* Added `prepareLibsForRegExp` helper, which converts the list of library names to a regexp string
* Added `createDepRegExp` helper, which create a regexp matching all deps except excluded

## v3.47.3 (2023-05-26)

#### :rocket: New Feature

* Added a new helper for collecting i18n keysets

## v3.27.0 (2022-08-30)

#### :rocket: New Feature

* Added helpers for working with favicons assets

## v3.15.5 (2021-02-03)

#### :bug: Bug Fix

* Changed a script to patch the Webpack stats' file for Statoscope

## v3.5.0 (2021-09-16)

#### :bug: Bug Fix

* Fixed calling of the `getBrowserArgs` function

## v3.4.0 (2021-09-09)

#### :house: Internal

* Review modules
