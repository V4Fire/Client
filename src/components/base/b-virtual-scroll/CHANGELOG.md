Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]
>

## v4.0.0-beta.?? (2024-??-??)

#### :rocket: New Feature

* The `dataOffset` property is now public in the `VirtualScrollState` interface

## v4.0.0-beta.36 (2023-10-23)

#### :bug: Bug Fix

* Added the missed `itemsProp` property

## v3.30.1 (2022-10-25)

#### :bug: Bug Fix

* Fixed an issue with wrong arguments was provided into `getItemKey`

## v3.18.2 (2022-03-22)

#### :bug: Bug Fix

* Fixed an issue with `initLoad` race condition

## v3.15.4 (2022-01-24)

#### :boom: Breaking Change

* The event`chunkRenderStart` is renamed to `chunkRender:renderStart` and now it emits before a component driver renders components

#### :rocket: New Feature

* Added new events `chunkRender:*`

## v3.9.0 (2021-11-08)

#### :rocket: New Feature

* [Added a new event `chunkRenderStart`](https://github.com/V4Fire/Client/issues/651)
* [Added `pageNumber` in `chunkLoaded` event](https://github.com/V4Fire/Client/issues/651)

## v3.0.0-rc.182 (2021-04-28)

#### :bug: Bug Fix

* Fixed an issue with `optionKey` being ignored

## v3.0.0-rc.181 (2021-04-20)

#### :bug: Bug Fix

* [Fixed an issue with `itemProps` not being provided to child components](https://github.com/V4Fire/Client/issues/512)

## v3.0.0-rc.170 (2021-03-26)

#### :rocket: New Feature

* Added a new event `chunkRender`

## v3.0.0-rc.164 (2021-03-22)

#### :bug: Bug Fix

* Now `bVirtualScroll` will throw an error if the rendering of components returns an empty array

## v3.0.0-rc.153 (2021-03-04)

#### :house: Internal

* [`bVirtualScroll` is now implements `iItems` trait](https://github.com/V4Fire/Client/issues/471)

## v3.0.0-rc.151 (2021-03-04)

#### :house: Internal

* Downgraded the delay before initializing to `15ms`
* Some optimizations

## v3.0.0-rc.126 (2021-01-26)

#### :bug: Bug Fix

* Added handling of the empty request

## v3.0.0-rc.122 (2021-01-13)

#### :house: Internal

* Removed iItems implementation. [Issue to move back](https://github.com/V4Fire/Client/issues/471)

## v3.0.0-rc.102 (2020-11-26)

#### :bug: Bug Fix

* Fixed an issue with layout shifts after `reInit`

## v3.0.0-rc.81 (2020-10-08)

#### :bug: Bug Fix

* Fixed an issue with `renderNext`: hasn't been data rendering after a loading error

## v3.0.0-rc.74 (2020-10-06)

#### :bug: Bug Fix

* Fixed an issue with removing the progress modifier

## v3.0.0-rc.68 (2020-09-23)

#### :bug: Bug Fix

* [Fixed an issue with the second data batch load affects initial rendering after reInit](https://github.com/V4Fire/Client/issues/346)

## v3.0.0-rc.60 (2020-09-01)

#### :bug: Bug Fix

* [Fixed a possible memory leak](https://github.com/V4Fire/Client/pull/321)

## v3.0.0-rc.59 (2020-08-10)

#### :rocket: New Feature

* [Added ability to render data manually](https://github.com/V4Fire/Client/issues/202)

#### :nail_care: Polish

* Improved documentation

## v3.0.0-rc.39 (2020-07-22)

#### :rocket: New Feature

* [Added life cycle events](https://github.com/V4Fire/Client/issues/205)

#### :bug: Bug Fix

* [Fixed an issue when data from `lastLoadedData` and `lastLoadedChunk.normalized` aren't synchronized](https://github.com/V4Fire/Client/issues/281)
* [Fixed `lastLoadedChunk.raw` returns undefined](https://github.com/V4Fire/Client/issues/267)

#### :house: Internal

* [Refactoring of tests](https://github.com/V4Fire/Client/pull/293)
* [Fixed ESLint warnings](https://github.com/V4Fire/Client/pull/293)

## v3.0.0-rc.31 (2020-06-17)

#### :bug: Bug Fix

* Fixed a problem with the disappearance of loaders before the content was rendered

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
