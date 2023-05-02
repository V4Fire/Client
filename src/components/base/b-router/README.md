# components/base/b-router

This module provides a component for organizing page routing.

## Synopsis

* The component extends [[iData]].

* The component does not have a default UI.

* By default, the root tag of the component is `<div>`.

## Why a component and not a plugin?

There are several reasons why this API is implemented as a component:

1. It's easier to organize the logic of sub-routes or alternate routes: we can put two or more routers in a template and
   dynamically switch from one to the other using the `v-if` directive.

2. The router extends from the `iData` component, i.e., it can load routes to be managed from a server or other data source.
   In addition, the router can apply modifiers and perform other actions like a normal component.

3. The router is automatically compatible with all supported rendering engines.

## How to use?

Just place the component in the root component template as shown below.

```
- namespace [%fileName%]

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block headHelpers
    < b-router
```

We don't need to create a component reference or anything. The component is automatically initialized itself to the root component.
The routes to the component will be taken from `src/routes/index.ts`.

```js
export default {
  // The key is the name of the route
  index: {
    // This property specifies which URL the route is bound to
    path: '/'
  },

  profile: {
    // Takes parameters from the matched URL
    path: '/profile/:id'
  }
};
```

Of course, you can provide additional props. Keep in mind that there can only be one router instance at a time.

```
- namespace [%fileName%]

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block headHelpers
    < b-router :routes = linkToRoutes | :initialRoute = 'foo'
```

If you want to switch some pages on router transitions, see [[bDynamicPage]].
This component contains all the necessary logic, such as page caching and more.

```
- namespace [%fileName%]

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block headHelpers
    < b-router

  - block body
    < b-dynamic-page
```

### Connection API between router and other components

All components have two accessors for working with the router:

* `router` - the router instance;
* `route` - the active route object.

```
- namespace [%fileName%]

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block headHelpers
    < b-router

  - block body
    {{ route.name }}
```

To emit a transition to another route, it is enough to call one of the router methods.

```
< button click = router.push('userProfile', {query: {id: userId}})

< template v-if = route.name === 'bla'
  ...
```

By default, the router will intercept all click events on elements with a `href` attribute to create a transition
(except `href` values containing absolute paths or page anchors).

```
/// The click on the element will be intercepted by the router
< a href = /some-url
```

You can provide additional parameters by using data attributes.

```
< button href = /some-url | data-router-method = back
< button href = /some-url | data-router-method = go | data-router-go = -5
< a href = /some-url | data-router-method = replace | data-router-query = {"foo": 1}
< a href = /some-url | data-router-method = replace | data-router-params = {"foo": 1}
```

To disable this behavior for a specific link, add the `data-router-prevent-transition` attribute.

```
< button href = /some-url | data-router-prevent-transition = true
```

To disable this behavior globally, set the `interceptLinks` prop to `false`.

```
- namespace [%fileName%]

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block headHelpers
    < b-router :interceptLinks = false
```

## How to provide routes?

There are three ways to do this:

1. Specify your routes in the `src/routes/index.ts` file and export it as a default property.

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

2. Provide a route map as a component prop.

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

3. Loading routes from a data provider.

   ```
   < b-router :dataProvider = 'AppRoutes'
   ```

   In this case, the data provider can return an array of parameters that will be passed to the `updateRoutes` method.

   * `[routes]`
   * `[routes, activeRoute]`
   * `[basePath]`
   * `[basePath, routes]`
   * `[basePath, routes, activeRoute]`
   * `[basePath, activeRoute]`
   * `[basePath, activeRoute, routes]`

   Or, if the provider returns a dictionary, it will be mapped on the component
   (you can pass a complex property path using dots as delimiters).

   If any key from the response matches a component method, that method will be called with the value from that key.
   (if the value is an array, it will be passed to the method as arguments).

   ```
   {
     updateRoutes: [routes],
     someProp: propValue,
     'mods.someMod': 'modValue'
   }
   ```

### What exactly can we specify as route parameters?

When we declare routes, we can specify additional options for each route. Some parameters are related to how we
make transitions; other parameters may provide some meta-information about the route. Also, we can add more options to our needs.

#### Specifying paths to routes

When using an engine that associates routes with some URLs, as the History API does, we need to provide a special path
that works as a blueprint for generating the route URL. Just look at the example below.

```js
export default {
  main: {
    path: '/'
  },

  help: {
    path: '/help'
  },

  friends: {
    path: '/components/friends/:userId'
  },

  notFound: {
    default: true
  }
};
```

We have created four routes:

* The route `main` is associated with `/`, which means that if we have our site at a URL like `https://foo.com`,
  the route is associated with URLs `https://foo.com` and `https://foo.com/`.

* The route `help` is associated with `https://foo.com/help`.

* The route `friends` is dynamically associated with a set of URLs because it has the `:userId` part in its path template
  that takes the value from the parameters specified when the router was navigated.

  ```js
  // https://foo.com/components/friends/109
  this.router.push('friends', {params: {userId: '109'}});
  ```

  Also, if the route has a `paramsFromQuery` option (enabled by default), we can provide those options with the query option.

  ```js
  // https://foo.com/components/friends/109?showInfo=true
  this.router.push('friends', {query: {userId: '109', showInfo: true}});

  // If we switch `paramsFromQuery` to false, then will be
  // https://foo.com/friends?userId=109&showInfo=true
  this.router.push('friends', {query: {userId: '109', showInfo: true}});
  ```

  You can create more complex paths using a combination of parameters, such as `foo/:param1/:param2`.
  [path-to-regexp](https://github.com/pillarjs/path-to-regexp) is used to parse these patterns, you can check it
  documentation for more information.

  We can pass options to the parsing library using `pathOpts`.

  ```js
  export default {
    friends: {
      path: '/components/friends/:userId',
      pathOpts: {
        sensitive: true
      }
    }
  };
  ```

* The `notFound` route is not directly associated with any URLs (because it doesn't have a `path` property),
  but it does have a `default` property of `true`, i.e. each time a URL cannot be matched directly, `notFound` will be used.
  For example, https://foo.com/bro or https://foo.com/bla/bar. You can also name the default route as `index` instead of
  setting the `default` property.

#### Providing a base path to routes

The router component can take an optional parameter that specifies a path prefix that is concatenated with all paths in the route.

```
< b-router :basePath = '/demo'
```

```js
export default {
  friends: {
    // With `:basePath = '/demo'` it will be `'/demo/components/friends/:userId'`
    path: '/components/friends/:userId',
    pathOpts: {
      sensitive: true
    }
  }
};
```

#### Using a path with the router transition methods

When we use router transition methods such as `push` or `replace`, we specify the route to go by name,
but we can also use the path of the route. Code below:

```js
this.router.push('/help');
this.router.push('/components/friends/:userId', {params: {userId: '109'}});
```

Is similar to:

```js
this.router.push('help');
this.router.push('friends', {params: {userId: '109'}});
```

You can also pass routes with absolute URLs, even if they are not specified in the routing scheme.

```js
this.router.push('https://google.com');
```

#### Default route parameters

When we call the router transition methods, we can attach additional parameters to the transition, such as query parameters or a URL.
However, we can also specify default options for any route, which will be automatically attached to each transition.

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

We can attach any custom options to any route, just add a property to the declaration.

```js
export default {
  user: {
    path: '/user',
    showWelcomeBoard: true
  }
};
```

All additional properties are stored in the `meta` parameter. We can now access this parameter using `route.meta.showWelcomeBoard`.
Be careful not to end up overriding predefined properties.

#### Loading dynamic modules on transition

We usually split our scripts and styles into different parts to improve loading speed.
We may require the router to load some modules on transition. Just add a `load` function to your route.

```js
export default {
  demo: {
    path: '/demo',
    load: () => Promise.all([import('components/form/b-button'), import('components/directives/in-view')])
  }
};
```

#### Scrolling to the specified coordinates after transition

If we want to create logic when the router automatically scrolls the page to the given coordinates after switching to a new route,
we can use the `autoScroll` property (it's enabled by default). To set default coordinates for a route, use the `scroll` option.

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

To specify coordinates when generating a new transition, use the `meta.scroll` option.

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

The router saves the scroll coordinates each time it changes to a different route to re-establish its position with `back/forward` options.

#### Redirecting to another route

We can specify logic when one route will be automatically redirected to another.

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

#### Creating an alias for a route

If we have two or more routes with the same parameters but different names or paths, we can create one "master" route and a bunch of aliases.

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

Instead of `redirect` `alias` will store the URL and name, but the other parameters will be taken from the route we are referring to.

#### Creating an alias for dynamic parameters in path

You can specify string aliases bound to the dynamic parameter in the path:

```js
{
  path: '/foo/:bar',
  pathOpts: {
    aliases: {
      bar: ['_bar', 'Bar']
    }
  }
}
```

Then, when you want to make a transition you can specify either the original parameter (`bar` in the example) or any of its aliases:

```js
this.router.push('/foo/:bar', {params: {bar: 'bar'}}); // "/foo/bar"
this.router.push('/foo/:bar', {params: {Bar: 'Bar'}}); // "/foo/Bar"
this.router.push('/foo/:bar', {params: {_bar: '_bar'}}); // "/foo/_bar"
```

Note that aliases will be used only if the original parameter is not specified:

```js
this.router.push('/foo/:bar', {params: {bar: 'original', Bar: 'alias'}}); // "/foo/original"
```

The priority of aliases is specified by index in the array:

```js
this.router.push('/foo/:bar', {params: {Bar: 'Bar', _bar: '_bar'}}); // "/foo/_bar"
```

The `paramsFromQuery` option also works with aliases i.e you can specify aliases within the `query` object:

```ts
this.router.push('/foo/:bar', {query: {_bar: 'bar'}}); // "/foo/bar"
```

Note that fields from the `query` will be used as aliases only if the `params` object doesn't have any.
That means if you specify an alias in `params` and in `query` at the same time the field from `query` will become the default `?alias=val` query
and the field from `params` will be used as the alias.

```js
this.router.push('/foo/:bar', {params: {_bar: 'bar'}, query: {Bar: 'query'}}); // "/foo/bar?Bar=query"
```

#### External routes

Usually when we create a new transition using router methods, the transition is not reloaded in the browser because
it uses `HistoryAPI` or similar methods. This is the way to create Single Page Applications (SPA), but sometimes we need to
force a browser reload. For example, we go to another site or a subdomain of the current one. To do this,
you must specify the route path as absolute, i.e. with protocol, host address, port, etc., or add a special `external` flag.

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

Usually we have to specify the name of the route in the `redirect` property, but we can pass the URL of the entire route - in this case,
the redirect will work as "external", i.e. the browser switches to this URL using `location. href`.

```js
export default {
  google: {
    path: '/google',
    redirect: 'https://google.com'
  }
};
```

Keep in mind that this declaration is not equal to:

```js
export default {
  google: {
    path: 'https://google.com'
  }
};
```

In the first example, we declare a route with a path on our own site, such as `https://bla.com/google`, which redirects to google.
In the second example, we simply declare an external route.

## How does a router make transitions?

It uses the `core/router` module as a strategy. This module contains interfaces for the router mechanism, route declarations,
a route object, etc., and also provides "strategies" or "engines" for performing transitions. Engines are listed in the `engines` directory.
We have engines based on the browser history API (which is the default engine) and in-memory state, but you can create an engine
that meets your own needs by yourself. The active or default engine is exported from the `engines/index.ts` file.

### Transition methods

The router has several transition control methods:

* `push` - emits a new transition with history added to the stack;
* `replace` - emits a new transition that replaces the current route;
* `back` - goes back one step from the history stack;
* `forward` - goes forward one step from the history stack;
* `go` - switches to a route from the history stack, identified by its relative position relative to the current route.

The `push` and `replace` methods can take additional parameters:

* `query` - additional request parameters for the route. They are attached to the URL `/foo?bla=1`.

  ```js
  router.push('foo', {query: {bla: 1}});
  ```

* `params` - parameters that pass path interpolation values.

  ```js
  router.push('/components/friends/:userId', {params: {userId: 1}});
  ```

* `meta` - additional parameters that do not have a "side" effect on the route path.

  ```js
  router.push('/components/friends/:userId', {meta: {scroll: {x: 0, y: 100}}});
  ```

Keep in mind that all `query` and `params` parameters will be normalized to `'true'/'false'/'null'/'undefined'` and
string numbers will be cast to their JS equivalents.

```js
// These two transitions are equal
router.push('foo', {query: {bla: 1}});
router.push('foo', {query: {bla: '1'}});

// These two transitions are equal
router.push('/components/friends/:userId', {params: {userId: 1}});
router.push('/components/friends/:userId', {params: {userId: '1'}});
```

All transition methods return promises that will be resolved when their transitions are complete.

```js
router.back().then(() => {
  // ...
});
```

### Transition to the current route

If you want to generate a transition to a route that is equal to the current one, you can pass `null` as the route name for the transition methods.

```js
// These two variants are equivalent
router.push(null, {query: {foo: 1}});
router.push(route?.name, {query: {foo: 1}});
```

### Transition event flow

When we call one of the router transition methods, such as `push` or `replace`, the router generates a lot of special events.

1. `beforeChange(route: Nullable<string>, params: TransitionOptions, method: TransitionMethod)` - this event fires before any transition.
   Handlers that listen for this event take arguments:

   1. `route`  - ref to the route to go to.
   2. `params` - the route parameters. Handlers can modify this object to attach more parameters.
   3. `method` - the type of transition methods used: `push`, `replace` or `event` (for native history navigation).

2. `softChange(route: Route)` or `hardChange(route: Route)` - fires one of these events before the route object changes.
   The difference between these events is that "soft" means that the route still has the same name as the previous route.
   However, there have been some changes to the query parameters; opposite "hard" means that the route has been changed or
   one of the parameters has been changed, which can change the URL path.

3. `change(route: Route)` - fires every time the route changes. Keep in mind that sometimes the transition can be prevented
   and this event will not fire, for example if we try to `replace` the same route with the same parameters.

4. `transition(route: Route)` - fires after the transition methods are called. If the transition takes place,
   the event fires after the `change` event.

The router also fires the `change` event on the root component as `transition`, just for ease of use.

```js
router.on('change', () => {
  // ...
});

rootEmitter.on('transition', () => {
  // ...
});
```

## How to dynamically bind a component property to the router?

Each time we use `router.push` or `router.replace`, the router may change the value of the `route` property,
but there are some details you should be aware of:

* If you create a transition without changing the route path, i.e. without changing the URL path name,
  mutations to the `route` object do not cause components to be rendered. Technically, this means that if you just add or
  change some query parameters, there will be no re-rendering. You should bind the component properties manually.
  This behavior helps improve application performance when the route changes, because usually when you just change query
  parameters, you don't want to change the page or cause significant UI mutations. This behavior is called "soft".

* When you emit a soft transition, you are changing the query parameters, but not rewriting them, i.e. if you have a URL like `/foo?bla=1` and
  you do `router.push(null, {query: {baz: 2}})`, finally you will see `/foo?bla=1&baz=2`. If you want to remove some parameters,
  set them to null, `router.push(null, {query: {bla: null}})`.

### Watching for a route

Because not every transition causes a rerender, sometimes you can't write something like:

```
{{ route.query.bla }}
```

Instead, you need to create a new component property bound to the route object. For example:

```typescript
import iBlock, { component, field } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @field((o) => o.sync.link('route', {deep: true, withProto: true}, ({query}) => query.bla || 'foo'))
  bla!: string;
}
```

```
{{ bla }}
```

Notice we are creating a link with two flags: `deep` and `withProto`.
You can use `@system` instead of the `@field` decorator, and of course you can use the `watch` method, the `@watch` decorator, etc.

```typescript
import iBlock, { component, watch } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @watch({path: 'route', deep: true, withProto: true})
  onRouteChange(newRoute, oldRoute) {
    console.log(newRoute, oldRoute);
  }
}
```

### Two-way binding to the router

Suppose we need to create logic when the mutation of some properties should push a new transition to the same route by
adding these properties as query parameters. In this case, we can use the API to organize a two-way binding between the component
and the router.

```typescript
import iBlock, { component, system } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @system()
  bla: number = 0;

  syncRouterState(data: CanUndef<Dictionary>, type: ConverterCallType) {
    return {bla: data?.bla || this.bla};
  }
}
```

Let's take a look at the `syncRouterState` method. This method works like a two-way connector between the router and the component.
When a component is initialized, it requests data from the router. The router provides data using this method.
The method then returns a dictionary that will be mapped to the component (you can specify a complex path with dots,
like `'foo.bla.bar'` or `'mods.hidden'`). Also, the component will watch for changes to every property that was in that dictionary.
If at least one of these properties is changed the entire data packet will be sent to the router using this method (the router
will create a new transition using `push`). When the component provides router information, the second argument is `remote`.

```typescript
import iBlock, { component, system } from 'components/super/i-block/i-block';

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

The router is global to all components, i.e. the dictionary that this method passes to the router will expand the current
route data, but not override it.

### Synchronization with the router after component initialization

When a component uses `syncRouterState` it asks for router information on initialization, but sometimes the router doesn't
have the requested properties, and we provide default values for them. There is a caveat: the default values are not synchronized
with the router, i.e. when we navigate from one page to another with `push` and return with `back/forward` the properties take values
from the default state will not be restored. Sometimes this behavior is not what we expect, so each component has a `syncRouterStoreOnInit`
property. If we switch `syncRouterStoreOnInit` to `true`, the component will force its state to map to the router upon initialization.

### Resetting the router state

You can optionally specify a method that handles the situation where you want to reset the state synchronized with the router.

```typescript
import iBlock, { component, system } from 'components/super/i-block/i-block';

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

To reset the state of the router, you must call `state.resetRouter()` from the component instance, or call the `reset` root method.
By default, all properties from `syncRouterState` will be overwritten to `undefined`.

## Slots

The component supports the default slot. Sometimes this can be helpful.

```
< b-router :routes = routes
  < template #default = {ctx}
    {{ ctx.route.name }}
```
