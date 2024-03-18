Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## 4.0.0-beta.72 (2024-03-13)

#### :bug: Bug Fix

* Fixed getting a component in `getComponent` when an additional root selector is passed

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* The module has been moved to`components/friends/dom`
* The module has been rewritten to a new tree-shake friendly API
* Renamed `putInStream` to `renderTemporarily`
* Removed `createBlockCtxFromNode`
* Removed `localInView`

## v3.0.0-rc.151 (2021-03-04)

#### :house: Internal

* Caching of dynamic imports

## v3.0.0-rc.110 (2020-12-16)

#### :boom: Breaking Change

* Now `localInView` returns a promise

## v3.0.0-rc.60 (2020-09-01)

#### :rocket: New Feature

* [Added `watchForIntersection` method and `localInView` getter](https://github.com/V4Fire/Client/issues/195)
* [Added an option `destroyIfComponent` into `i-block/dom/replaceWith`, `i-block/dom/appendChild`](https://github.com/V4Fire/Client/pull/321)

## v3.0.0-rc.46 (2020-07-31)

#### :house: Internal

* Fixed ESLint warnings
