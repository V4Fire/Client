Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.94 (2024-04-24)

#### :rocket: New Feature

* The destructor, which unlocks the page scroll when the component is destroyed, will be registered once the `lockPageScroll` method is called

## v4.0.0-beta.45 (2023-12-07)

#### :bug: Bug Fix

* Fixed a bug with clearing event listeners on ios

## v4.0.0-beta.11 (2023-08-18)

#### :bug: Bug Fix

* Fixed a bug with resolving a promise returned by the `iLockPageScroll.lock`

## v4.0.0-alpha.1 (2022-12-14)

#### :boom: Breaking Change

* Renamed the `lock` method/event to `lockPageScroll`
* Renamed the `unlock` method/event to `unlockPageScroll`
* Renamed the `lockScrollMobile` modifier to `lockPageScrollMobile`
* Renamed the `lockScrollDesktop` modifier to `lockPageScrollDesktop`

## v3.0.0-rc.199 (2021-06-16)

#### :bug: Bug Fix

* [Fixed a bug when using the trait by different components concurrently](https://github.com/V4Fire/Client/issues/549)

## v3.0.0-rc.184 (2021-05-12)

#### :rocket: New Feature

* Improved the trait to support auto-deriving

## v3.0.0-rc.104 (2020-12-07)

#### :bug: Bug Fix

* Fixed a bug with repetitive calls of `iLockPageScroll.lock`

#### :house: Internal

* Added tests

## v3.0.0-rc.98 (2020-11-12)

#### :bug: Bug Fix

* Now the `lockScrollMobile` modifier is applied for all mobile devices

#### :memo: Documentation

* `README`, `CHANGELOG` was added

#### :house: Internal

* Fixed ESLint warnings
