# components/base/b-dynamic-page

This module provides a component for dynamically loading page components.
It is primarily used in conjunction with a router.

## Synopsis

* The component extends [[iDynamicPage]].

* The component is a tiny wrapper for page components.

* The component provides the passed props to the inner page component.

* The component automatically dispatches all events from the inner page component.

* The component does not have a default UI.

* By default, the component's root tag is set to `<div>`.

## Modifiers

See the [[iDynamicPage]] component.

## Events

The component automatically dispatches all events from the inner page component.
Also, you can see the [[iDynamicPage]] component.

## Basic Concepts

The most straightforward way to bind certain components to a router is by using the route field and
the component `:is` directive.
Here is an example:

```
< component v-if = route | :is = route.meta.component

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

This approach operates smoothly as per the example,
but issues can arise when there's an attempt to cache the loaded components.
So, how can such a problem be resolved?
If we use Vue to power our application, the `keep-alive` directive can be helpful.

```
< keep-alive
  < component v-if = route | :is = route.meta.component

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

It works but only works with Vue, and its API has several limitations.
For example, you can't manually invalidate the cache or configure the caching of different components.
Although you can use `include/exclude/max`, there is no option to define different max values for various components.

A major drawback is that the directive uses the component name as a cache key,
which means we can't cache pages with the same name but different query parameters as separate components.

The `bDynamicPage` component addresses all these issues.
This component is a simple yet powerful wrapper around the `:is` directive, offering its own robust cache API.
It allows the specification of custom cache keys,
the usage of different cache groups for separate components, and many more advanced features.

Let's delve into some examples of using this component.

### Usage Without Page Caching

```
< b-dynamic-page

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

### Automatic Caching of All Pages with the Same Name

```
< b-dynamic-page :keepAlive = true

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

### Specifying the Maximum Cache Size

```
< b-dynamic-page :keepAlive = true | :keepAliveSize = 5

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

### Excluding Certain Components from Caching

```
/// Also, `exclude` can be defined as a string, RegExp, or a function
< b-dynamic-page :keepAlive = true | :exclude = ['b-bar-page', 'b-bla-page']

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

### Specifying Components for Caching

```
/// Also, `include` can be defined as a string, RegExp, or a function
< b-dynamic-page :keepAlive = true | :include = ['b-foo-page', 'b-bla-page']

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

### Specifying a Custom Cache Key

```
< b-dynamic-page :keepAlive = true | :include = (page, route) => `${page}:${route.query.userId}`

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

### Specifying Various Cache Groups

```
< b-dynamic-page :keepAlive = true | :include = (page, route) => { &
  cacheKey: `${page}:${route.query.userId}`,
  cacheGroup: page,
  createCache: () => new RestrictedCache(15)
} .

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

### Invalidating the Cache

```
< b-dynamic-page ref = dynamicPage | :keepAlive = true

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to

< button @click = $refs.dynamicPage.keepAliveCache.global.clear()
  Invalidate cache
```

## Preserving the Scroll Position of Nested DOM Nodes

This component offers a convenient API for retaining the scroll position of DOM nodes on the page,
which is cached in `keepAlive`.

To achieve this, add a listener for the `beforeSwitchPage` event and
pass the scroll element that needs to be saved to the `saveScroll` method.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';
import type { OnBeforeSwitchPage } from 'base/b-dynamic-page/b-dynamic-page';

@component()
export default class bExample extends iBlock {
  @watch('rootEmitter:onBeforeSwitchPage')
  onBeforeSwitchPage({saveScroll}: OnBeforeSwitchPage): void {
    if (this.$refs.elementWithScroll) {
      saveScroll(this.$refs.elementWithScroll.$el);
    }
  }
}
```

## Providing Props to the Inner Page Component

By default, the `bDynamicPage` component provides all the props defined in the [[iDynamicPage]] component
to its inner page component.

```
/// `pageTitle` will be provided to the inner page component
< b-dynamic-page :keepAlive = true | :pageTitle = 'Hello world'
```

## Catching Events of the Inner Page Component

By default, `bDynamicPage` dispatches all events from the inner page component.

```
/// `initLoad` is caught from the inner page component
< b-dynamic-page :keepAlive = true | @initLoad = console.log('Caught!')
```

## API

Additionally, you can view the implemented traits or the parent component.

### Props

#### [pageProp]

The initial name of the page to load.

#### [pageGetter = `(e) => e?.meta.component ?? e?.name`]

A function that takes a route object and returns the name of the page component to load.

```
< b-dynamic-page :emitter = router | :event = 'transition' | :pageGetter = (e) => e.meta.pageComponent
```

#### [keepAlive = `false`]

If set to true, the previous pages will be cached under their own names,
allowing them to be restored when revisited.
This optimization helps improve page switching but may increase memory usage.

Please note that when a page is switched, it will be deactivated through the `deactivate` function.
Similarly, when the page is restored, it will be activated using the `activate` function.

#### [keepAliveSize = `10`]

The maximum number of pages that can be stored in the global cache of `keepAlive`.

#### [include]

A predicate to determine which pages should be included in `keepAlive` caching.
If not specified, all loaded pages will be cached.

The predicate can be defined in three ways:
1. As a component name or a list of component names.
2. As a regular expression.
3. As a function that takes a component name and returns one of the following:
  - `true` (to include the page in caching).
  - `false` (to exclude the page from caching).
  - A string key to be used for caching instead of the component name.
  - A special object with information about the caching strategy being used.

#### [exclude]

A predicate to exclude certain pages from `keepAlive` caching can be defined in three ways:
1. As a component name or a list of component names.
2. As a regular expression.
3. As a function that takes a component name and returns `true` to exclude the page from caching,
   or `false` to include the page in caching.

#### [emitter = `this.$root`]

A link to an event emitter to listen for page switch events.

```
< b-dynamic-page :emitter = router | :event = 'transition'
```

#### [event = `'setRoute'`]

The page switching event name.

```
< b-dynamic-page :emitter = router | :event = 'transition'
```

### Fields

#### page

The name of the active page to load.

#### keepAliveCache

A dictionary of `keepAlive` caches, where the keys represent cache groups (with the default being `global`).

### Getters

#### component

A link to the loaded page component.

### Methods

#### reload

Reloads the loaded page component.
