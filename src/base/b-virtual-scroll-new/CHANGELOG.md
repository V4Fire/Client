Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.70.1 (2024-04-19)

#### :rocket: New Feature

* The `dataOffset` property is now public in the `VirtualScrollState` interface`base/b-virtual-scroll-new`

## v3.67.1 (2024-02-26)

#### :bug: Bug Fix

* Fixed an with transition into loading success state was not made

## v3.67.0 (2024-02-22)

#### :bug: Bug Fix

* Fixed an issue with the incorrect transition into the loading state. Now the loading state will be removed in one requestAnimationFrame call along with the content insertion into the DOM,
and the loading state will be restored on the following one. This trick helps avoid generating CLS errors. `base/b-virtual-scroll-new`

* Fixed a race condition when calling `initLoad` multiple times `base/b-virtual-scroll-new`

* Added visibility tracking for the tombstones slot, now if this slot is on the screen,
an attempt will be made to render the data regardless of what the client returned in `shouldPerformDataRender`.
Also added a flag in VirtualScrollState indicating the visibility of the slot.
All this will help avoid situations when for some reason the `IntersectionObserver` did not trigger on the elements and as a result `shouldPerformDataRender` was not called. `base/b-virtual-scroll-new`

## v3.66.1 (2024-02-20)

#### :bug: Bug Fix

* Removed an unnecessary next data chunk response checking

## v3.66.0 (2024-02-13)

#### :boom: Breaking Change

* Removed `shouldPerformDataRequest` prop in `b-virtual-scroll-new` `base/b-virtual-scroll-new`

#### :rocket: New Feature

* Added `preloadAmount` prop in b`-virtual-scroll-new` `base/b-virtual-scroll-new`
