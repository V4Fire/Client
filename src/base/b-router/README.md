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
    < b-router :routes = linkToRoutes | :initialRoute = 'foo'
```

All components have two links to work with the router:

* `router` — a link to a router instance;
* `route` — an object of the active route.

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

* The `notFound` route isn't directly tied with any URL-s (because it hasn't the `path` property), but it has `default` property in `true`, i.e. every time some URL can't be matched directly will be used `notFound`. For example, `https://foo.com/bro` or `https://foo.com/bla/bar`. Also, you can name the default route as `index` instead of setting the `default` property.

#### External routes

Usually, when we emit a new transition by using router methods, the transition isn't reloaded a browser because it uses HistoryAPI or similar techniques. It is the way to create single-page applications (SPA), but sometimes we can want to force reloading of the browser, for instance, we jump to another site or subdomain of the current. To do this you should specify a route path as absolute, i.e., with a protocol, host address, port, etc., or add the special `external` flag.

```js
export default {
  google: {
    path: 'https://google.com'
  },

  help: {
    path: '/help',
    external: true
  },
};
```

#### Using a path with the router transition methods

When you use router transition methods, like, "push" or "replace", you basically specify a route to go by a name, but, also, you can use a path of the route.
The code below:

```js
this.router.push('/help');
this.router.push('/friends/:userId', {params: {userId: '109'}});
```

Is similar to:

```js
this.router.push('help');
this.router.push('friends', {params: {userId: '109'}});
```

You can provide routes with absolute URL-is too, even there aren't specified within the routing schema.

```js
this.router.push('https://google.com');
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

You can create more complex cases with more than one redirect.

#### External redirect

Usually, you should provide a route name within the `redirect` property, but it supports when you provide the whole URL - in that case, the redirect will work as "external", i.e, the browser switches to this URL by using `location.href` instead of `history.pushState`.

```js
export default {
  google: {
    path: '/google',
    redirect: 'https://google.com'
  }
};
```

Mind, that this declaration isn't equal to:

```js
export default {
  google: {
    path: 'https://google.com'
  }
};
```

If the first example, we declare the route with a path on the own site, for instance, `https://bla.com/google` that redirects to google.
In the second example we just declare an external route, i.e. it hasn't tied URL on the own site.

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

Instead of `redirect`, `alias` will save URL and name, but other options will be taken from the route we refer to.

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

#### Defying entry points

To describe how the builder should build an application you need to create a build file within the `src/entries` directory.
The created entry points have names that match the file names.

##### Base entry points

There are two reserved names of entry points:

* `index` — the entry point that contains minimal required core to work of the V4 framework and other critical dependencies. For instance,

*your-project-directory/src/entries/index.js*

Also, if you have only the one entry point, you can name it differently.

```js
import "@v4fire/client/src/core";
```

* `std` — the optional entry point that contains polyfills to the standard library and other similar stuff. This entry point will always initialize before other entry points.

##### Custom entry points

Now you can add new files that represent entry points, for example,

*your-project-directory/src/entries/p-v4-components-demo.js*

```js
// To add a component you need to create import for its index file
import '../pages/p-v4-components-demo';
```

##### Inheriting of entry points

To avoid duplication of code lines you can specify that one entry point depends on another entry point. To do this, just add an import to this entry point.

```js
import './index';
import '../pages/p-v4-components-demo';
```

#### Binding entry points with routes

Just add the `entryPoint` option to a route and pass the name of the needed entry point.

```js
export default {
  demo: {
    path: '/demo',
    entryPoint: 'p-v4-components-demo'
  }
};
```

Mind that "index" and "std" entry points loaded by default, so you don't need to declare it clearly.

### Providing of extra parameters

You can attach you own parameter to any route, just add a property to declaration.

```js
export default {
  user: {
    path: '/user',
    showWelcomeBoard: true
  }
};
```

All extra properties are stored within the `meta` parameter. Now you can access this parameter bu using `route.meta.showWelcomeBoard`.
Be careful, don't eventually redefine predefined properties.

## Transition methods

The router instance has several methods to manage transitions:

* `push` — emits a new transition with adding to the history stack;
* `replace` — emits a new transition that replaces the current route;
* `back` — go back to the one step from the history stack;
* `forward` — go forward to the one step from the history stack;
* `go` — switches to a route from the history stack, identified by its relative position to the current route.

"push" and "replace" method can take additional parameters:

* `query` — extra query parameters to a route, basically, their attaches to the URL `/foo?bla=1`.

```js
router.push('foo', {query: {bla: 1}});
```

* `params` — parameters that provide values to path interpolation.

```js
router.push('/friends/:userId', {query: {userId: 1}});
```

* `meta` — extra parameters that haven't a "side" effect on a route path.

```js
router.push('/friends/:userId', {meta: {scroll: {x: 0, y: 100}}});
```

Mind, all query and param parameters normalize before transitions: "true/false/null/undefined" and numbers to their JS equivalents.

```js
// These two transitions are equal
router.push('foo', {query: {bla: 1}});
router.push('foo', {query: {bla: '1'}});

// These two transitions are equal
router.push('/friends/:userId', {query: {userId: 1}});
router.push('/friends/:userId', {query: {userId: '1'}});
```

All transition methods return promises that are resolved when their transitions are finished.

```js
router.back().then(() => {
  // ...
});
```

## Event flow of transitions

When we invoke one of router transition methods, like, "push" or "replace", the router emits a bunch of special events.

1. `beforeChange(route: Nullable<string>, params: PageOptionsProp, method: TransitionMethod)` — this event fires before any transition. The handlers that listen to this event are taken arguments:

  1. `route`  — ref to a route to go to.
  2. `params` — parameters of the route. The handlers can modify this object to attach more parameters.
  3. `method` — the type of used transition methods: `push`, `replace` or `event` (for native history navigation).

3. `softChange(route: Route)` or `hardChange(route: Route)` — fires one of these events before changing the route object. The difference between these events is that "soft" means that the route still has the same name with the previous route, but there were some changes of query parameters, opposite "hard" indicates that the route was changed or was changed one of the parameters that can modify the path URL.

2. `change(route: Route)` — fires every time the route was changed. Mind that sometimes transition can be prevented and this event won't be fired, for instance, if we try to execute "replace" transition on the same route with the same parameters.

5. `transition(route: Route)` — fires after calling of transition methods, if the transition takes a place, the event is fired after "change" event.

The router also provides "change" event to the root component as "transition", just for usability.

```js
router.on('change', () => {
  // ...
});

rootEmitter.on('transition', () => {
  // ...
});
```

## How dynamically tie a component property with the router

Every time you use `router.push` or `router.replace` the router can change the `route` property value, but there are some details you should know:

* If you emit transition without changing of route path, i.e., without changing pathname, the mutations of the `route` object don't force render of components. Technically, it means that if you just add or change some query parameters, there won't be re-render, you should tie your component properties manually. This behavior helps to increase application performance when changing the route, because, usually, when you just change query parameters, you don't want to change the active page or emit great mutations of UI. This behaviour is called "soft".

* When you emit the soft transition, you modify query parameters, but don't rewrite, i.e., if you have the URL like `/foo?bla=1` and you do `router.push(null, {query: {baz: 2}})`, finally you'll see `/foo?bla=1&baz=2`. If you want to remove some parameters, provide their with null values, `router.push(null, {query: {bla: null}})`.
