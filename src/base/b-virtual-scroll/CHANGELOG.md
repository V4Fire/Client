Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.39 (2020-07-22)

#### :rocket: New Feature

* [Life cycle events](https://github.com/V4Fire/Client/issues/205)

#### :bug: Bug Fix

* [Data in the `lastLoadedData` and `lastLoadedChunk.normalized` fields do not match](https://github.com/V4Fire/Client/issues/281)
* [`lastLoadedChunk.raw` returns undefined](https://github.com/V4Fire/Client/issues/267)

#### :house: Internal

* Refactoring tests
* Fixed ESLint warnings `base/b-virtual-scroll`

## v3.0.0-rc.31 (2020-06-17)

#### :bug: Bug Fix

* Fixed a problem with the disappearance of loaders before the content was rendered in `bVirtualScroll`

## v3.0.0-rc.25 (2020-06-03)

#### :bug: Bug Fix

* [Fixed an issue where skeletons disappeared](https://github.com/V4Fire/Client/issues/230)
* [Fixed an issue with a race condition `chunk-request/init`](https://github.com/V4Fire/Client/issues/203)
* [Fixed an issue where an `empty` slot appeared when there was data](https://github.com/V4Fire/Client/issues/259)

## v3.0.0-rc.19 (2020-05-26)

#### :bug: Bug Fix

* [Fixed rendering of truncated data](https://github.com/V4Fire/Client/issues/231)
* [Fixed rendering of empty slot](https://github.com/V4Fire/Client/issues/241)
* [Fixed clear of `in-view`](https://github.com/V4Fire/Client/pull/201)
