# base/b-dynamic-page

This module provides a component to dynamically load page components. Basically, it uses with a router.

## Synopsis

* The component extends [[iDynamicPage]].

* The component is a tiny wrapper for page components.

* The component provides specified props to an internal page component.

* The component automatically dispatches all events from an internal page component.

* The component does not have the default UI.

* By default, the root tag of the component is `<div>`.

## Modifiers

See the [[iDynamicPage]] component.

## Events

The component automatically dispatches all events from an internal page component.
Also, you can see the [[iDynamicPage]] component.

## Basic concepts

The shortest way to bind some components with a router is using the `route` field and the `component :is` directive.
Let's look at an example below.

```
< component v-if = route | :is = route.meta.component

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

The example works fine, but the problems appear when we try to organize caching of the loaded components.
Well, how can we solve this issue? If we use Vue as an engine of our app, we can use the `keep-alive` directive.

```
< keep-alive
  < component v-if = route | :is = route.meta.component

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

It works but works only with Vue. Also, this directive has a pretty poor API: we can't manually invalidate the cache;
we can't customize caching of different components. Yea, we can use `include/exclude/max`, but there is no way to define
different `max` for various components. And the main problem, that this directive uses a component name as a cache key, i.e.,
we can't cache pages with the same name but with different query parameters as separated components.

The `bDynamicPage` solves all of these problems. It's a pretty simple wrapper for the `component :is` directive with
its own potent cache API. You can specify custom cache keys, use different cache groups for various components, and other cool stuff.

Let's look at several examples of using this component:

### Simple using without caching of pages

```
< b-dynamic-page

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

### Automatically caching all pages with the same name

```
< b-dynamic-page :keepAlive = true

< button @click = router.push('foo', {meta: 'b-foo-page'})
  Go to
```

### Specifying the maximum size of the cache

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

## Providing props to an internal component

By default, `bDynamicPage` provides all props defined in the [[iDynamicPage]] component to the internal component.

```
/// `pageTitle` will be provided to an internal component
< b-dynamic-page :keepAlive = true | :pageTitle = 'Hello world'
```

## Catching events of an internal component

By default, `bDynamicPage` dispatches all events from an internal page component.

```
/// `initLoad` is caught from an internal component
< b-dynamic-page :keepAlive = true | @initLoad = console.log('Caught!')
```

## API

Also, you can see the implemented traits or the parent component.

### Props

#### [pageProp]

An initial component name to load.

#### [keepAlive = `false`]

If true, when switching from one page to another, the old page is stored within a cache by its name.
When occur switching back to this page, it will be restored. It helps to optimize switching between pages but grows memory using.
Notice, when a page is switching, it will be deactivated by invoking `deactivate`.
When the page is restoring, it will be activated by invoking `activate`.

#### [keepAliveSize = `10`]

The maximum number of pages within the global `keepAlive` cache.

#### [include]

A predicate to include pages to the `keepAlive` caching: if not specified, will be cached all loaded pages.
It can be defined as:

1. a component name (or a list of names);
2. a regular expression;
3. a function that takes a component name and returns `true` (include), `false` (does not include),
   a string key to cache (it uses instead of a component name),
   or a special object with information of the used cache strategy.

#### [exclude]

A predicate to exclude some pages from the `keepAlive` caching.
It can be defined as a component name (or a list of names), regular expression,
or a function that takes a component name and returns `true` (exclude) or `false` (does not exclude).

#### [emitter]

A link to an event emitter to listen to events of the page switching.

```
< b-dynamic-page :emitter = router | :event = 'transition'
```

#### [event]

An event name of the page switching.

```
< b-dynamic-page :emitter = router | :event = 'transition'
```

#### [eventConverter = `(e) => e?.meta.component ?? e?.name`]

A function to extract a component name to load from the caught event object.

```
< b-dynamic-page :emitter = router | :event = 'transition' | :eventConverter = (e) => e.meta.pageComponent
```

### Fields

#### page

An active component name to load.

#### keepAliveCache

A dictionary of `keepAlive` caches.
The keys represent cache groups (by default uses `global`).

### Getters

#### component

A link to the loaded page component.

### Methods

#### reload

Reloads the loaded page component.
