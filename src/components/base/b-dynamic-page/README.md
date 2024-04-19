# components/base/b-dynamic-page

This module provides a component for dynamically loading page components. Mainly used with a router.

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

## Basic concepts

The shortest way to bind some components to a router is to use the route field and the component `:is` directive.
Let's look at an example below.

```
< component v-if = route | :is = route.meta.component

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

The example works fine, but problems arise when we try to organize the caching of loaded components.
Well, how can we solve this problem? If we are using Vue as the engine of our application, we can use the `keep-alive` directive.

```
< keep-alive
  < component v-if = route | :is = route.meta.component

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

It works but only works with Vue. Also, this directive has a rather bad API: we can't manually invalidate the cache;
we cannot configure caching of various components. Yes, we can use `include/exclude/max`, but there is no way to define
different `max` for different components. And the main problem is that this directive uses the component name as a cache key,
i.e., we cannot cache pages with the same name but different query parameters as separate components.

`bDynamicPage` solves all these problems. This is a fairly simple wrapper around the `component :is` directive with
own powerful cache API. You can specify custom cache keys, use different cache groups for different components, and other cool stuff.

Let's look at a few examples of using this component.

### Simple using without caching of pages

```
< b-dynamic-page

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

### Automatically caching of all pages with the same name

```
< b-dynamic-page :keepAlive = true

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

### Specifying the maximum cache size

```
< b-dynamic-page :keepAlive = true | :keepAliveSize = 5

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

### Excluding some components from caching

```
/// Also, `exclude` can be defined as a string, RegExp, or a function
< b-dynamic-page :keepAlive = true | :exclude = ['b-bar-page', 'b-bla-page']

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

### Specifying components to cache

```
/// Also, `include` can be defined as a string, RegExp, or a function
< b-dynamic-page :keepAlive = true | :include = ['b-foo-page', 'b-bla-page']

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

### Specifying a custom cache key

```
< b-dynamic-page :keepAlive = true | :include = (page, route) => `${page}:${route.query.userId}`

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

### Specifying various cache groups

```
< b-dynamic-page :keepAlive = true | :include = (page, route) => { &
  cacheKey: `${page}:${route.query.userId}`,
  cacheGroup: page,
  createCache: () => new RestrictedCache(15)
} .

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

### Invalidating the cache

```
< b-dynamic-page ref = dynamicPage | :keepAlive = true

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to

< button @click = $refs.dynamicPage.keepAliveCache.global.clear()
  Invalidate cache
```

### API for saving scroll of nested DOM nodes

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

## Providing props to the inner page component

By default, `bDynamicPage` provides all props defined in the [[iDynamicPage]] component to the inner page component.

```
/// `pageTitle` will be provided to the inner page component
< b-dynamic-page :keepAlive = true | :pageTitle = 'Hello world'
```

## Catching events of the inner page component

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

If true, then when moving from one page to another, the old page is saved in the cache under its own name.
When you return to this page, it will be restored. This helps to optimize switching between pages, but increases memory consumption.
Note that when a page is switched, it will be deactivated by calling `deactivate`.
When the page is restored, it will be activated by calling `activate`.

#### [keepAliveSize = `10`]

The maximum number of pages in the `keepAlive` global cache.

#### [include]

A predicate to include pages in `keepAlive` caching: if not specified, all loaded pages will be cached.
It can be defined as:

1. a component name (or a list of names);
2. a regular expression;
3. a function that takes a component name and returns:
  * `true` (include), `false` (does not include);
  * a string key for caching (used instead of the component name);
  * or a special object with information about the caching strategy being used.

#### [exclude]

A predicate to exclude some pages from `keepAlive` caching.
It can be defined as a component name (or a list of names), regular expression,
or a function that takes a component name and returns `true` (exclude) or `false` (does not exclude).

#### [emitter = `this.$root`]

A link to an event emitter to listen for page switch events.

```
< b-dynamic-page :emitter = router | :event = 'transition'
```

#### [event = `'setRoute'`]

Page switching event name.

```
< b-dynamic-page :emitter = router | :event = 'transition'
```

### Fields

#### page

The name of the active page to load.

#### keepAliveCache

A dictionary of `keepAlive` caches.
The keys represent cache groups  (the default is `global`).

### Getters

#### component

A link to the loaded page component.

### Methods

#### reload

Reloads the loaded page component.
