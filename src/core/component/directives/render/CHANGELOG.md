Changelog
=========

> **Tags:**
> - :boom:       [Breaking Change]
> - :rocket:     [New Feature]
> - :bug:        [Bug Fix]
> - :memo:       [Documentation]
> - :house:      [Internal]
> - :nail_care:  [Polish]

## v4.0.0-beta.136-ssr (2024-11-07)

#### :bug: Bug Fix

* Updated the input parameter type to clarify that the function can handle not only VNodes but also buffers
* Fixed the buffer rendering on server-side: it now correctly processes not only strings and promises but also nested buffers, as [dictated by Vue](https://github.com/vuejs/core/blob/main/packages/server-renderer/src/render.ts#L61-L65)
* Fixed the `resolveAttrs` function: property getters are no longer removed from props, the `v-attrs` directive now resolves with the correct method in SSR
* Calls `resolveAttrs` to resolve directives for components rendered with `ssrRenderComponent`

## v4.0.0-beta.16 (2023-09-06)

#### :bug: Bug Fix

* Fixed working in SSR

## v4.0.0-alpha.1 (2022-12-14)

#### :rocket: New Feature

* Initial release
