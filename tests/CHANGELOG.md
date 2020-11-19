Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v3.0.0-rc.102 (2020-11-??)

* Added `crossorigin` attribute to the scripts and links `core/prelude/dependencies`, `super/i-static-page/modules/ss-helpers`

## v3.0.0-rc.90 (2020-10-22)

#### :rocket: New Feature

* Added support for a runner wildcard declaration

```bash
gulp test:component:run --test-entry base/b-virtual-scroll/test --runner events/* --runtime-render true
```
