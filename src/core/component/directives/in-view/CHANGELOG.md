Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.60 (2020-09-01)

#### :house: Internal

* [Split the module into two: API was moved to `core/dom/in-view`](https://github.com/V4Fire/Client/issues/310)

## v3.0.0-rc.51 (2020-08-04)

#### :bug: Bug Fix

* Fixed an issue with `reObserve`

## v3.0.0-rc.49 (2020-08-03)

#### :boom: Breaking Change

* Removed `isDeactivated`, `removeStrategy` from `observableElement`

#### :rocket: New Feature

* Added `suspend`, `unsuspend`, `reObserve` methods

#### :bug: Bug Fix

* Fixed an issue with `polling` strategy won't fire a `callback`

#### :house: Internal

* Fixed ESLint warnings

## v3.0.0-rc.19 (2020-05-26)

#### :rocket: New Feature

* [Added `time`, `timeIn`, `timeOut` in `in-view` directive](https://github.com/V4Fire/Client/pull/201)

#### :bug: Bug Fix

* [Fixed issue with `in-view` that element did not become observable](https://github.com/V4Fire/Client/pull/201)
* [Fixed `stopObserver` method in `in-view`](https://github.com/V4Fire/Client/pull/201)
