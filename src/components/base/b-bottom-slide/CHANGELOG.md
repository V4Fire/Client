Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.??? (2024-11-??)

#### :bug: Bug Fix

* Fixed an issue with emitting the `close` after destroying the component.
This happened because we used `await` and this task could be executed after the component was destroyed.
So we replaced `await` with `SyncPromise`.

## v4.0.0-beta.152 (2024-11-11)

#### :rocket: New Feature

* Added `trackContentSwipes` - a flag to prevent unexpected closure of a component instance

## v4.0.0-beta.94 (2024-04-24)

#### :bug: Bug Fix

* Unlock the page scroll when the component is destroyed

## v4.0.0-beta.93 (2024-04-19)

#### :house: Internal

* Use the `v-on-resize` directive to recalculate state instead of `window:resize` and `DOMChange` watchers

## 4.0.0-beta.85 (2024-04-11)

#### :bug: Bug Fix

* Reverted https://github.com/V4Fire/Client/commit/83005d73fcb96f98928a9ba7831d886a22d5f5a3

## 4.0.0-beta.84 (2024-04-11)

#### :bug: Bug Fix

* Fixed the full upward/downward slide in `heightMode = content`

## v4.0.0-beta.55 (2024-02-08)

#### :bug: Bug Fix

* Fixed move to the closest step in `heightMode = content`

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* Removed deprecated events: `changeStep`, `changeMoveState`

#### :house: Internal

* All offsets and heights have been moved to the `Geometry` friend class
* Methods: `onPullStart`, `onPullEnd`, `onPull` - have been moved to the `SwipeControl` friend class
* All animation methods have been moved to the `Animation` friend class
* Methods controlling overlay opacity have been moved to the `Overlay` friend class

## v3.32.1 (2022-12-26)

#### :bug: Bug Fix

* Fixed a bug with not setting an initial value of `hidden` modifier

## v3.19.2 (2022-04-19)

#### :bug: Bug Fix

* Fixed a bug with `iHistory` repeatedly initializing when opening bottom-slide from a non-zero step

## v3.0.0-rc.211 (2021-07-21)

#### :bug: Bug Fix

* [Fixed an issue that allows for pulling an element far away from the bottom](https://github.com/V4Fire/Client/issues/463)
* Fixed an issue with an element not being visible if the `visible` prop was provided and the `contentMode` was `content`

#### :bug: Bug Fix

## v3.0.0-rc.197 (2021-06-07)

#### :bug: Bug Fix

* Fixed an issue with `b-bottom-slide` not being able to open from the pull
* Fixed an issue with `b-bottom-slide` not being able to initialize `i-history` if the component was opened via swipe

## v3.0.0-rc.164 (2021-03-22)

#### :memo: Documentation

* Added documentation

## v3.0.0-rc.150 (2021-03-03)

#### :bug: Bug Fix

* Fixed an issue with the scroll unlocking during close

## v3.0.0-rc.112 (2020-12-18)

#### :boom: Breaking Change

* Now `forceInnerRender` is toggled to `true` by default

#### :bug: Bug Fix

* Fixed geometry initialization within the content mode
* Fixed `updateWindowPosition` with lazy rendering

## v3.0.0-rc.111 (2020-12-16)

#### :bug: Bug Fix

* Fixed render logic

## v3.0.0-rc.110 (2020-12-16)

#### :rocket: New Feature

* Added `forceInnerRender`

## v3.0.0-rc.100 (2020-11-17)

#### :house: Internal

* Rendering optimization

## v3.0.0-rc.98 (2020-11-13)

#### :bug: Bug Fix

* Fixed firing the `close` event on swipe closing

#### :house: Internal

* Fixed ESLint warnings

## v3.0.0-rc.35 (2020-07-02)

#### :bug: Bug Fix

* Fixed incorrect bottom-slide positioning with content bigger than `maxVisiblePx`

## v3.0.0-rc.16 (2020-05-21)

#### :bug: Bug Fix

* Fixed the `hasTrigger` flag calculation if a page has no children (`initPage`)

## v3.0.0-rc.15 (2020-05-20)

#### :bug: Bug Fix

* Removed `padding-bottom` of the page element

## v3.0.0-rc.2 (2020-04-28)

#### :bug: Bug Fix

* Fixed history clearing on close if the content was fully closed before
