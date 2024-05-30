Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.?? (2024-??-??)

#### :bug: Bug Fix

* Fixed an issue with intersection-observer in `b-virtual-scroll-new`: added `watchForIntersection` method to `DOM` prototype

## v4.0.0-beta.100 (2024-05-24)

#### :bug: Bug Fix

* Fixed an issue in `b-virtual-scroll-new` where nodes from the previous rendering cycle were not being hidden and remained displayed.
Now, the container will always be hidden if it is empty or during the loading process until an initial render occurs.
It is important to note that the nodes are hidden, not deleted, and will later be replaced by new nodes.
This approach helps avoid unnecessary re-renders.
Additionally, this fix can be considered a breaking change because the container
node inside b-virtual-scroll will now be hidden (display: none) by default until the first successful render in the rendering cycle.

## v4.0.0-beta.90 (2024-04-17)

#### :bug: Bug Fix

* The `onEnter` parameter for the `v-in-view` directive is now passed as the `handler` parameter

## v4.0.0-beta.77 (2024-03-27)

#### :rocket: New Feature

* Added synchronous rendering of the first chunk using `v-for`. This is because SSR does not have access to the DOM API required for `vdom`. Therefore, we leverage Vue functionality to render the first chunk equally for SSR and CSR.

## v4.0.0-beta.67 (2024-02-26)

#### :bug: Bug Fix

* Fixed an with transition into loading success state was not made

## v4.0.0-beta.66 (2024-02-22)

#### :bug: Bug Fix

* Fixed an issue with the incorrect transition into the loading state. Now the loading state will be removed in one requestAnimationFrame call along with the content insertion into the DOM,
and the loading state will be restored on the following one. This trick helps avoid generating CLS errors.

* Fixed a race condition when calling `initLoad` multiple times

* Added visibility tracking for the tombstones slot, now if this slot is on the screen,
an attempt will be made to render the data regardless of what the client returned in `shouldPerformDataRender`.
Also added a flag in VirtualScrollState indicating the visibility of the slot.
All this will help avoid situations when for some reason the `IntersectionObserver` did not trigger on the elements and as a result `shouldPerformDataRender` was not called.

## v4.0.0-beta.63 (2024-02-20)

#### :bug: Bug Fix

* Removed an unnecessary next data chunk response checking

## v4.0.0-beta.60 (2024-02-15)

#### :boom: Breaking Change

* Removed `shouldPerformDataRequest` prop in `b-virtual-scroll-new`

#### :rocket: New Feature

* Added `preloadAmount` prop in `b-virtual-scroll-new`

## v4.0.0-beta.54 (2024-02-06)

#### :bug: Bug Fix

* Fixed an issue with memory leaks in `vdom.render` `core/component/engines/vue3`

## v4.0.0-beta.53 (2024-01-31)

#### :rocket: New Feature

* Released module `b-virtual-scroll-new`
