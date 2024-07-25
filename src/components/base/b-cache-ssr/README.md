# components/base/b-cache-ssr

This module provides a wrapper component that allows caching content during SSR rendering.
This way, the rendering of static components can be optimized across different SSR requests.

## Synopsis

* The component extends [[iBlock]].

* The component does not have a default UI.

## Basic concepts

The content to be cached is passed as the default slot.
Also, it is necessary to set a `globalName` prop for the component, which will be used as the key for caching.

```
< b-cache-ssr :globalName = 'static-footer'
  < b-footer
  ...
```
