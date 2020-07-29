Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.41 (2020-07-29)

#### :boom: Breaking Change

* Removed `snakeskin/filters/csp`
* Renamed `dependencies` -> `entryPoints` `module.webpack/snakeskin`
* Renamed `replacers/raw-import` -> `replacers/include`
* Changed a pattern from `requireMonic(...)` to `include('...');` `replacers/include`

## v3.0.0-rc.36 (2020-07-13)

#### :rocket: New Feature

* Improved support of workers

#### :house: Internal

* Improved logic `entries.webpack.js`
* Fixed ESLint warnings
* Refactoring
