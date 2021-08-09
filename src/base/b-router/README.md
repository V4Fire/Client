# base/b-router

This module provides a component to organize page routing.

## Synopsis

* The component extends [[iData]].

* The component doesn't have the default UI.

* By default, the root tag of the component is `<div>`.

## Why a component, but not a plugin?

There are a few reasons why this API has implemented as a component:

1. Easier to organize the logic of sub-routes or alternative routes: we can put two or more routers within a template
   and dynamically switch from one to another by using the `v-if` directive.

2. The router extends from the `iData` component, i.e., it can download routes to manage from a server or another data source.
   Also, the router can apply modifiers and do other stuff like a regular component.

3. The router automatically compatible with all supported render engines.

## How to use

Just put the component to a template of the root component like it presented below.

```
- namespace [%fileName%]

- include 'super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block headHelpers
    < b-router
```

That is all! We don't need to create a ref to the component or other stuff. The component automatically initializes
itself to the root component. The routes to the component will be taken from `src/routes/index.ts`.

```js
export default {
  // A key is a route' name
  index: {
    // This property specifies on which URL the route is bound
    path: '/'
  },

  profile: {
    // Takes parameters from the matched URL
    path: '/profile/:id'
  }
};
```

Of course, you can provide extra props to the declaration. Mind that there can be only one
instance of the router at the same time.

```
- namespace [%fileName%]

- include 'super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block headHelpers
    < b-router :routes = linkToRoutes | :initialRoute = 'foo'
```

If you want to switch some pages on router transitions, please see [[bDynamicPage]].
This component contains all necessary logic, like page caching and other stuff.

```
- namespace [%fileName%]

- include 'super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block headHelpers
    < b-router

  - block body
    < b-dynamic-page
```

### Connection API between the router and other components

All components have two accessors to work with the router:

* `router` — a link to a router instance;
* `route` — an object of the active route.

```
- namespace [%fileName%]

- include 'super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block headHelpers
    < b-router

  - block body
    {{ route.name }}
```

To emit a transition to another route, just call one of the router methods.

```
< button click = router.push('userProfile', {query: {id: userId}})

< template v-if = route.name === 'bla'
  ...
```

By default, the router will intercept all click events on elements with a `href` attribute to emit a transition
(except `href` values that contain absolute paths or page anchors).

```
/// Click to the element will be intercepted by the router
< a href = /some-url
```

You can provide additional parameters by using data attributes.

```
< button href = /some-url | data-router-method = back
< button href = /some-url | data-router-method = go | data-router-go = -5
< a href = /some-url | data-router-method = replace | data-router-query = {"foo": 1}
< a href = /some-url | data-router-method = replace | data-router-params = {"foo": 1}
```

To disable this behavior, toggle `interceptLinks` to `false`.

```
- namespace [%fileName%]

- include 'super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block headHelpers
    < b-router :interceptLinks = false
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

2. Provide the map of routes as a component prop.

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

3. Loading from a data provider.

```
< b-router :dataProvider = 'AppRoutes'
```

In this case, the data provider can return an array of parameters, that will be passed to the `updateRoutes` method.

* `[routes]`
* `[routes, activeRoute]`
* `[basePath]`
* `[basePath, routes]`
* `[basePath, routes, activeRoute]`
* `[basePath, activeRoute]`
* `[basePath, activeRoute, routes]`

Or, if the provider returns a dictionary, it will be mapped on the component
(you can pass the complex property path using dots as separators).

If a key from the response' data is matched with any component method, this method will be invoked with a key' value
(if the value is an array, it will be spread to the method as arguments).

```
{
  updateRoutes: [routes],
  someProp: propValue,
  'mods.someMod': 'modValue'
}
```

### What exactly can we specify as route options?

When we are declaring routes, we can specify extra parameters to each route. Some parameters are tied with how we
do the transitions; other parameters can provide some meta-information of a route. Also, we can add extra parameters to our needs.

#### Specifying paths to routes

When using an engine that tied routes with some URL-s, as the History API engine does, we need to specify the special
path that works as a blueprint to form a route URL. Just look at the example below.

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

* The `friends` route is dynamically tied with a set of URL-s because it has the `:userId` part in its path pattern that
  takes a value from parameters that are specified with a router transition.

  ```js
  // https://foo.com/friends/109
  this.router.push('friends', {params: {userId: '109'}});
  ```

  Also, if a route has the `paramsFromQuery` option (it's enabled by default), we can provide these parameters using the `query` option.

  ```js
  // https://foo.com/friends/109?showInfo=true
  this.router.push('friends', {query: {userId: '109', showInfo: true}});

  // If we toggle paramsFromQuery to false, then will be
  // https://foo.com/friends?userId=109&showInfo=true
  this.router.push('friends', {query: {userId: '109', showInfo: true}});
  ```

  You can create more complex paths using a combination of parameters, for instance, `foo/:param1/:param2`.
  To parse these patterns is used [path-to-regexp](https://github.com/pillarjs/path-to-regexp), you may check its
  documentation for more information.

  We can pass options to the parsing library by using `pathOpts`.

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

* The `notFound` route isn't directly tied with any URL-s (because it hasn't the `path` property),
  but it has the `default` property in `true`, i.e. every time some URL can't be matched directly will be used `notFound`.
  For example, `https://foo.com/bro` or `https://foo.com/bla/bar`. You can also name the default route as `index` instead of
  setting the `default` property.

#### Providing a base path to routes

A router component can take an optional parameter that specifies a path prefix that is concatenated with all route paths.

```
< b-router :basePath = '/demo'
```

```js
export default {
  friends: {
    // With `:basePath = '/demo'` it will be `'/demo/friends/:userId'`
    path: '/friends/:userId',
    pathOpts: {
      sensitive: true
    }
  }
};
```

#### Using a path with the router transition methods

When we use the router transition methods, like `push` or `replace`, we specify the route to go by a name,
but also, we can use a path of the route. The code below:

```js
this.router.push('/help');
this.router.push('/friends/:userId', {params: {userId: '109'}});
```

Is similar to:

```js
this.router.push('help');
this.router.push('friends', {params: {userId: '109'}});
```

You can pass routes with absolute URL-s, too, even there aren't specified within the routing schema.

```js
this.router.push('https://google.com');
```

#### Default route parameters

When we invoke the router transition methods, we can attach extra parameters to a transition, such as a query or URL parameters.
Still, also, we can specify default parameters for any route that will be automatically attached for every transition.

```js
export default {
  demo: {
    path: '/demo',

    query: {
      // We can use static values
      showHeader: true,

      // We can use functions
      selectedCity: (router) => router.r.selectedCity
    },

    params: {
      bla: 'foo'
    },

    meta: {
      hash: () => Math.random()
    }
  }
};
```

#### Providing extra parameters to a route

We can attach any custom parameters to any route, just add a property to the declaration.

```js
export default {
  user: {
    path: '/user',
    showWelcomeBoard: true
  }
};
```

All extra properties are stored within the `meta` parameter. Now we can access this parameter by using `route.meta.showWelcomeBoard`.
Be careful, don't eventually redefine predefined properties.

#### Loading dynamic modules on a transition

Usually, we split our scripts and styles into different chunks to improve loading speed.
We can demand the router to load some modules on a transition. Just add the `load` function to your route.

```js
export default {
  demo: {
    path: '/demo',
    load: () => Promise.all([import('form/b-button'), import('core/component/directives/in-view')])
  }
};
```

#### Scrolling to the specified coordinates after a transition

If we want to create logic when the router automatically scrolls a page to the specified coordinates after switching to a new route,
we can use the `autoScroll` property (by default, it's enabled). To set default coordinates for a route, use the `scroll` option.

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

The router saves scroll coordinates every time it moves to another route to restore position with "back/forward" cases.

#### Redirecting to another route

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

#### Creating an alias for the route

If we have two or more routes with the same options, but different names or paths, we can create one "master" route
and a bunch of aliases.

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

Instead of `redirect`, `alias` will save the URL and name, but other options will be taken from the route we refer to.

#### External routes

Usually, when we emit a new transition using the router methods, the transition isn't reloaded a browser because
it uses `HistoryAPI` or similar techniques. It's the way to create single-page applications (SPA), but sometimes we want
to force reloading of the browser. For instance, we jump to another site or subdomain of the current. To do this,
you should specify a route path as an absolute, i.e., with a protocol, host address, port, etc., or add the special `external` flag.

```js
export default {
  google: {
    path: 'https://google.com'
  },

  help: {
    path: '/help',
    external: true
  }
};
```

##### External redirect

Usually, we should provide a route name within the `redirect` property, but we may pass the whole route URL — in that case,
the redirect will work as "external", i.e., the browser switches to this URL by using `location.href`.

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

In the first example, we declare the route with a path on the own site, for instance, `https://bla.com/google` that redirects to google.
In the second example, we just declare an external route.

## How the router do transitions?

It uses the `core/router` module as a strategy. This module contains interfaces for the router engine, declaration of routes,
route object, etc., and provides "strategies" or "engines" to do transitions. The engines are specified within the `engines` directory.
We have only one engine based on the browser history API by default, but you can create your own engine.
The active or default engine is exported from the `engines/index.ts` file.

### Transition methods

A router instance has several methods to manage transitions:

* `push` — emits a new transition with adding to the history stack;
* `replace` — emits a new transition that replaces the current route;
* `back` — goes back to the one step from the history stack;
* `forward` — goes forward to the one step from the history stack;
* `go` — switches to a route from the history stack, identified by its relative position to the current route.

`push` and `replace` methods can take additional parameters:

* `query` — extra query parameters to a route. Their attaches to the URL `/foo?bla=1`.

  ```js
  router.push('foo', {query: {bla: 1}});
  ```

* `params` — parameters that pass values to path interpolation.

  ```js
  router.push('/friends/:userId', {params: {userId: 1}});
  ```

* `meta` — extra parameters that haven't a "side" effect on a route path.

  ```js
  router.push('/friends/:userId', {meta: {scroll: {x: 0, y: 100}}});
  ```

Mind, all `query` and `params` parameters will be normalized `'true'/'false'/'null'/'undefined'` and string numbers to their JS equivalents.

```js
// These two transitions are equal
router.push('foo', {query: {bla: 1}});
router.push('foo', {query: {bla: '1'}});

// These two transitions are equal
router.push('/friends/:userId', {params: {userId: 1}});
router.push('/friends/:userId', {params: {userId: '1'}});
```

All transition methods return promises that will be resolved when their transitions are finished.

```js
router.back().then(() => {
  // ...
});
```

### Transition to the current route

If you want to emit a transition to a route that is equal to the current, you can pass `null` as a route name to transition methods.

```js
// These two variants are equivalent
router.push(null, {query: {foo: 1}});
router.push(route?.name, {query: {foo: 1}});
```

### Event flow of transitions

When we invoke one of the router transition methods, like `push` or `replace`, the router emits many special events.

1. `beforeChange(route: Nullable<string>, params: TransitionOptions, method: TransitionMethod)` — this event fires before any transition.
   The handlers that listen to this event are taken arguments:

  1. `route`  — ref to a route to go to.
  2. `params` — parameters of the route. The handlers can modify this object to attach more parameters.
  3. `method` — the type of used transition methods: `push`, `replace` or `event` (for native history navigation).

3. `softChange(route: Route)` or `hardChange(route: Route)` — fires one of these events before changing the route object.
   The difference between these events is that "soft" means that the route still has the same name as the previous route.
   Still, there were some changes in query parameters; opposite "hard" indicates that the route was changed or
   was changed one of the parameters that can modify the path URL.

2. `change(route: Route)` — fires every time the route was changed. Mind that sometimes a transition can be prevented,
   and this event won't be fired, for instance, if we try to execute `replace` transition on the same route with the same parameters.

5. `transition(route: Route)` — fires after calling of transition methods. If the transition takes place,
   the event fires after the `change` event.

The router also fires the `change` event to the root component as `transition`, just for usability.

```js
router.on('change', () => {
  // ...
});

rootEmitter.on('transition', () => {
  // ...
});
```

## How dynamically tie a component property with the router

Every time we use `router.push` or `router.replace`, the router can change the `route` property value,
but there are some details you should know:

* If you emit transition without changing a route path, i.e., without changing URL pathname,
  the `route` object's mutations don't force rendering of components. Technically, it means that if you just add or
  change some query parameters, there won't be re-render. You should tie component properties manually.
  This behavior helps increase application performance when changing the route because usually,
  when you just change query parameters, you don't want to change the page or emit significant UI mutations.
  This behavior is called "soft".

* When you emit s soft transition, you modify query parameters, but don't rewrite, i.e.,
  if you have the URL like `/foo?bla=1` and you do `router.push(null, {query: {baz: 2}})`,
  finally you'll see `/foo?bla=1&baz=2`. If you want to remove some parameters,
  pass their with null values, `router.push(null, {query: {bla: null}})`.

### Watching for a route

Because not every transition emits re-rendering, sometimes you can't write in a template something like:

```
{{ route.query.bla }}
```

Instead of this, you need to create a new component property that is tied with the route object. For instance:

```typescript
import iBlock, { component, field } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @field((o) => o.sync.link('route', {deep: true, withProto: true}, ({query}) => query.bla || 'foo'))
  bla!: string;
}
```

```
{{ bla }}
```

Notice, we create a link with two flags: "deep" and "withProto". It's necessary to watch "soft" changes in the route.
You free to use `@system` instead of `@field` decorator, and of course, you can use the `watch` method and the `@watch` decorator, etc.

```typescript
import iBlock, { component, watch } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @watch({path: 'route', deep: true, withProto: true})
  onRouteChange(newRoute, oldRoute) {
    console.log(newRoute, oldRoute);
  }
}
```

### Two-way binding with the router

Suppose we need to create logic when some properties' mutation should push a new transition to the same route by adding
these properties as query parameters. In that case, we can use the API to organize two-way binding between a component and the router.

```typescript
import iBlock, { component, system } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @system()
  bla: number = 0;

  syncRouterState(data: CanUndef<Dictionary>, type: ConverterCallType) {
    return {bla: data?.bla || this.bla};
  }
}
```

Let's look at the `syncRouterState` method. This method works as a two-way connector between the router and a component.
When the component initializes, it asks the router for data. The router provides the data by using this method.
After this, the method returns a dictionary that will be mapped to the component as properties
(you can specify a complex path with dots, like `'foo.bla.bar'` or `'mods.hidden'`). Also, the component will watch
for changes of every property that was in that dictionary. When at least one of these properties is changed,
the whole butch of data will be sent to the router using this method (the router will produce a new transition by using `push`).
When the component provides router data, the second argument is equal to `remote`.

```typescript
import iBlock, { component, system } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @system()
  bla: number = 0;

  syncRouterState(data: CanUndef<Dictionary>, type: ConverterCallType) {
    if (type === 'remote') {
      return {
        baz: this.bla,
        bar: this.mods.bar
      };
    }

    return {
      bla: data.baz,
      'mods.bar': data.bar
    }
  }
}
```

The router is global for all components, i.e., a dictionary that this method passes to the router will
extend the current route data but not override.

### Synchronizing with the router after initializing a component

When a component uses `syncRouterState`, it asks the router data on initializing, but sometimes,
the router doesn't have requested properties, and we provide default values for these.
There is a nuance: the default values don't synchronize with the router, i.e., when we move from one page
to another using `push` and return by using `back/forward` the properties that take values
from the default state won't be restored. Sometimes, this behavior doesn't match our expectations,
and that why every component has the `syncRouterStoreOnInit` prop. If we toggle `syncRouterStoreOnInit` to `true`,
the component will forcibly map its state to the router after initializing.

### Resetting the router state

You can additionally specify a method that serves the situation when you want to reset the state synchronized with the router.

```typescript
import iBlock, { component, system } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @system()
  bla: number = 0;

  syncRouterState(data: CanUndef<Dictionary>) {
    return {bla: data?.bla || this.bla};
  }

  convertStateToRouterReset(data: CanUndef<Dictionary>) {
    return {bla: 0};
  }
}
```

To reset the router state, you should invoke `state.resetRouter()` from a component instance or invoke the root reset method.
By default, all properties from `syncRouterState` will rewrite to `undefined`.

## Slots

The component supports the default slot. Sometimes it can be useful.

```
< b-router :routes = routes
  < template #default = {ctx}
    {{ ctx.route.name }}
```
