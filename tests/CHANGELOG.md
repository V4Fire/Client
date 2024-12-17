Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.143 (2024-10-09)

#### :rocket: New Feature

* Added `JSHandle` representing the mock agent in `SpyObject.handle`

## v4.0.0 (2023-04-19)

#### :boom: Breaking Change

* Deprecated API was removed

## v3.0.0-rc.154 (2021-03-04)

#### :bug: Bug Fix

* Fixed an issue with tests failing because waiting of `#root-component` to become visible

## v3.0.0-rc.153 (2021-03-04)

#### :rocket: New Feature

* Added a new option `--bail` to stop test execution after the first failure

#### :bug: Bug Fix:wq

* Added `force=true` to default options `DOM.clickToRef`. It fixed a bug where clicking at a visible element
  did not work because the playwright decided that the element was not visible.

## v3.0.0-rc.90 (2020-10-22)

#### :rocket: New Feature

* Added support for a runner wildcard declaration

```bash
gulp test:component:run --test-entry base/b-virtual-scroll/test --runner events/* --runtime-render true
```
