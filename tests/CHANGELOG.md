Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.151 (2021-03-03)

* Added `force=true` in default options `DOM.clickToRef`. It fixed a bug where clicking on a visible element
  did not work because the playwright decided that the element was not visible.

* Added `--bail` option to stop test execution after first failure.

## v3.0.0-rc.90 (2020-10-22)

#### :rocket: New Feature

* Added support for a runner wildcard declaration

```bash
gulp test:component:run --test-entry base/b-virtual-scroll/test --runner events/* --runtime-render true
```
