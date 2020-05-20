# base/b-router

This module provides a component to organize page routing.

## Why a component, but not a plugin?

There are a few reasons why this API has implemented as a component:

1. Much more easy to organize the logic of sub-routes or alternative routes: we can put two or more routers within a template and dynamically switch from one to another by using the "v-if" directive.

2. The router extends from the `iData` component, i.e., it can download routes to manage from a server or another data source.
Also, the router can apply modifiers and do other stuff like a regular component.

3. The router automatically compatible with all supported rendered engines.

## How to use

Just put the component to a template of the root component like it presented below.

```
- namespace [%fileName%]

- include 'super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block headHelpers
    < b-router
```

That is all! We don't need to create a ref to the component or other stuff, the component automatically initialize itself to the root component.
Of course, you can provide extra props to declaration. Mind that here is can be only one instance of the router at the same time.

```
- namespace [%fileName%]

- include 'super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block headHelpers
    < b-router :routes = linkToRoutes | :activeRoute = 'foo'
```

All components have two links to work with the router:

* `router` - a link to a router instance;
* `route` - an object of the active route.

To emit a transition to another route just call one of the router methods.

```
< button click = router.push('userProfile', {query: {id: userId}})
```

```
< template v-if = route.name === 'bla'
  ...
```

## How to provide routes?

There are three ways to do it:

1. Specify your routes within the `src/routes/index.ts` file and export it as the default property.

```js
export default {
  index: {
    path: '/'
  },

  profile: {
    path: '/profile/:id'
  }
};
```

2. Provides the map of routes as a component prop.

```
< b-router :routes = { &
  index: {
    path: '/'
  },

  profile: {
    path: '/profile/:id'
  }
} .
```

3. Download the map of routes from a data provider.

```
< b-router :dataProvider = 'AppRoutes'
```

## How the router do transitions?

It uses the `core/router` module as a strategy. This module contains interfaces for the router engine, declaration of routes, route object, etc.
Also, the module provides "strategies" or "engines" to do transitions. The engines are specified within the "engines" directory.
By default, we have only one strategy that bases on the browser history API, but you can create your own engine. The active or default engine is exported from the `engines/index.ts` file.

## What exactly we can specify as route options?

When we are declaring routes we can specify extra parameters to each route. Some parameters are tied with the way we manage the transitions, other parameters can provide some meta-information of a route. Also, we can add extra parameters to our needs.

### Specifying a path to a route

When we are using an engine that tied routes with some URL-s, as the History API engine do, we need to specify the special path that works as a blueprint to form route URL. Just look to the example below.

```js
export default {
  main: {
    path: '/'
  },

  help: {
    path: '/help'
  },

  friends: {
    path: '/friends/:userId'
  },

  notFound: {
    default: true
  }
};
```

We have created four routes:

* The `main` route has bound to `/`, it means if we have our site on URL like `https://foo.com`, the `main` is tied with URL-s
`https://foo.com` and `https://foo.com/`.

* The `help` route will be tied with `https://foo.com/help`.

* The `friends` route is dynamically tied with a set of URL-s because it has the `:userId` part in its own path pattern that takes a value from parameters that are specified with a router transition.

```js
// https://foo.com/friends/109
this.router.push('friends', {params: {userId: '109'}});
```

Also, if a route have parameter `paramsFromQuery` (it's enabled by default) you can provide this parameter by using the `query` option.

```js
// https://foo.com/friends/109?showInfo=true
this.router.push('friends', {query: {userId: '109', showInfo: true}});

// If we toggle paramsFromQuery to false, then will be
// https://foo.com/friends?userId=109&showInfo=true
this.router.push('friends', {query: {userId: '109', showInfo: true}});
```

You can create more complex paths by using a combination of parameters, for instance, `foo/:param1/:param2`. To parse these patterns is used [path-to-regexp](https://github.com/pillarjs/path-to-regexp), so you check its documentation for more information. Also, you can provide options to the parsing library by using `pathOpts`.

```js
export default {
  friends: {
    path: '/friends/:userId',
    pathOpts: {
      sensitive: true
    }
  }
};
```

* The `notFound` route isn't directly tied with any URL-s (because it hasn't the `path` property), but it has `default` property in `true`, i.e. every time some URL can't be matched directly will be used `notFound`. For example, `https://foo.com/bro` or `https://foo.com/bla/bar`.

Notice, we don't specify the whole URL in `path`, if we do it, it will work as "external" transition, i.e, the browser switches to this URL by using `location.href` instead of `history.pushState`. It can help if you need to declare some routes that should go to other sites.
Also, you can mark some routes with the `external` flag to force this behavior.

```js
export default {
  friends: {
    path: '/friends/:userId',
    external: true
  }
};
```

### Redirecting to another route

We can specify logic when one route will automatically redirect to another.

```js
export default {
  user: {
    path: '/user'
  },

  usr: {
    path: '/usr',
    redirect: 'user'
  }
};
```

You can create more complex cases with more than one redirect. Usually, you should provide a route name within the `redirect`
property, but it supports when you provide a whole URL - in that case, redirect will work as "external", i.e, the browser switches to this URL by using `location.href` instead of `history.pushState`.

### Creating an alias for a route

If you have two or more routes that have the same options, but different names or paths, you can create one "master" route and bunch of aliases to this route.

```js
export default {
  user: {
    path: '/user'
  },

  usr: {
    path: '/usr',
    alias: 'user'
  }
};
```

Instead of `redirect`, `alias` will save URL and name, but other options will be taken from a route we refer to.

### Scrolling to the specified coordinates after a transition

If you want to create logic when the router automatically scroll a page to the specified coordinates after switching to a new route,
you should use the `autoScroll` property (by default, it's enabled). To specify default coordinates for a route use the `scroll` option.

```js
export default {
  user: {
    path: '/user',
    scroll: {
      x: 0,
      y: 100
    }
  }
};
```

To provide coordinates with emitting a new transition use the `meta.scroll` option.

```js
this.router.push('user', {
  meta: {
    scroll: {
      x: 0,
      y: 200
    }
  }
});
```

Also, the router saves scroll coordinates every time it moves to another route to restore position with "back/forward" cases.

### Loading of styles and scripts on a transition

Usually, we split our scripts and styles in different chunks to improve a site loading speed. We can tie our routes with these chunks by using the `entryPoint` option.

#### Defying an entry point

To describe how the builder should build an application you need to create a build file within the `src/entries` directory. There are two reserved names of an entry point:

* `index` - the entry point that contains minimal required core to work of the V4 framework and other critical dependencies.
For instance,

*"your-project"/src/entries/index.js*

```js
import "@v4fire/client/src/core";
```

* `std` - the optional entry point that contains polyfills to the standard library and other similar stuff. This entry point will always initialize before other entry points.
