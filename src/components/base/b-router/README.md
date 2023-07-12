# components/base/b-router

This module provides a component for organizing page routing.

## Synopsis

* The component extends [[iData]].

* The component does not have a default UI.

* By default, the component's root tag is set to `<div>`.

## Why a component instead of a plugin?

There are several reasons why this API is implemented as a component rather than a plugin:

1. It simplifies the organization of sub-routes or alternate routes: you can place two or more routers in a template and
   dynamically switch between them using the `v-if` directive.

2. The router extends from the `iData` component, meaning it can load and manage routes from a server or other data sources.
   Additionally, the router can apply modifiers and perform other actions like a regular component.

3. The router is automatically compatible with all supported rendering engines, ensuring consistent performance across different environments.

## How to use?

Just place the component in the root component template as shown below.

```
- namespace [%fileName%]

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block headHelpers
    < b-router
```

We don't need to create a component reference or perform any additional setup.
The component automatically initializes itself to the root component.
The routes for the component are taken from `src/routes/index.ts`.

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

Of course, you can provide additional props. Keep in mind that there can be only one router instance at a time.

```
- namespace [%fileName%]

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block headHelpers
    < b-router :routes = linkToRoutes | :initialRoute = 'foo'
```

If you wish to switch between pages on router transitions, refer to [[bDynamicPage]].
This component contains all the essential logic, such as page caching and more.

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

All components have two accessors for interacting with the router:

* `router` - the router instance.
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

To initiate a transition to another route, simply call one of the router methods.

```
< button click = router.push('userProfile', {query: {id: userId}})

< template v-if = route.name === 'bla'
  ...
```

By default, the router intercepts all click events on elements with a `href` attribute,
creating a transition (except for `href` values containing absolute paths or page anchors).

```
/// The click on the element will be intercepted by the router
< a href = /some-url
```

If you need to disable intercepting a specific link click, you can handle the `hrefTransition` event,
which provides the `HTMLElement` on which this `CustomEvent` was dispatched

```typescript
import iBlock, { component, watch } from 'components/super/i-block/i-block';
import type { HrefTransitionEvent } from 'components/base/b-router/b-router';

@component()
export default class bExample extends iBlock {
  @watch('router:onHrefTransition')
  protected onHrefTransition(e: HrefTransitionEvent):void {
    if (e.detail.href === '/foo/bar') {
      e.preventDefault();
    }
  }
}
```

You can provide additional parameters via data attributes.

```
< button href = /some-url | data-router-method = back
< button href = /some-url | data-router-method = go | data-router-go = -5
< a href = /some-url | data-router-method = replace | data-router-query = {"foo": 1}
< a href = /some-url | data-router-method = replace | data-router-params = {"foo": 1}
```

To disable click interception for a specific link, add the `data-router-prevent-transition` attribute.

```
< button href = /some-url | data-router-prevent-transition = true
```

To disable click interception for all links globally, set the `interceptLinks` prop to `false`.

```
- namespace [%fileName%]

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block headHelpers
    < b-router :interceptLinks = false
```

## How to provide routes?

There are three ways to do this:

1. Define your routes in the `src/routes/index.ts` file and export them as a default property.

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

3. Load routes from a data provider.

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

   Alternatively, if the provider returns a dictionary, it will be mapped to the component
   (you can pass a complex property path using dots as delimiters).

   If any key from the response matches a component method, that method will be called with the value from that key.
   (If the value is an array, it will be passed to the method as arguments).

   ```
   {
     updateRoutes: [routes],
     someProp: propValue,
     'mods.someMod': 'modValue'
   }
   ```
   In this case, `updateRoutes` will be called with the `routes` as an argument, `someProp` will be set to `propValue`,
   and `mods.someMod` will be set to `modValue`.

### What exactly can we specify as route parameters?

When declaring routes, we can specify additional options for each route.
Some parameters are related to how we make transitions; others may provide some meta-information about the route.
Additionally, we can add more options based on our needs.

#### Specifying paths to routes

When using an engine that associates routes with specific URLs, like the History API, we need to provide a special path
that works as a blueprint for generating the route URL. Consider the example below.

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

* The `main` route is associated with `/`, which means that if our site is at a URL like `https://foo.com`,
  the route is associated with URLs `https://foo.com` and `https://foo.com/`.

* The `help` route is associated with `https://foo.com/help`.

* The `friends` route is dynamically associated with a set of URLs because it has the `:userId` part in its path template that
  takes the value from the parameters specified when the router was navigated. This allows for flexibility in generating URLs based
  on the provided `userId`.

  ```js
  // Navigates to https://foo.com/components/friends/109
  this.router.push('friends', {params: {userId: '109'}});
  ```

  Also, if the route has a `paramsFromQuery` option (enabled by default), we can provide those options with the `query` option.

  ```js
  // Navigates to https://foo.com/components/friends/109?showInfo=true
  this.router.push('friends', {query: {userId: '109', showInfo: true}});

  // If we switch `paramsFromQuery` to false, then it navigates to
  // https://foo.com/friends?userId=109&showInfo=true
  this.router.push('friends', {query: {userId: '109', showInfo: true}});
  ```

  In the examples above, we demonstrate how to navigate to different routes using route parameters and query options.
  By setting the `paramsFromQuery` option, we can control how the parameters are incorporated into the generated URLs.

  You can create more complex paths using a combination of parameters, such as `foo/:param1/:param2`.
  The library [path-to-regexp](https://github.com/pillarjs/path-to-regexp) is used to parse these patterns.
  You can check its documentation for more information.

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

  In the example above, we demonstrate how to define a route with a complex path using parameters and pass options to
  the parsing library using `pathOpts`. The `sensitive` option ensures that the route is case-sensitive,
* allowing for more precise control over routing behavior.

* The `notFound` route is not directly associated with any URLs (because it doesn't have a `path` property),
  but it does have a `default` property of `true`, i.e. each time a URL cannot be matched directly, `notFound` will be used.
  For example, https://foo.com/bro or https://foo.com/bla/bar. You can also name the default route as `index` instead of
  setting the `default` property.

#### Providing a base path to routes

The router component can take an optional parameter that specifies a path prefix which is concatenated with all paths in the route configuration.

```
< b-router :basePath = '/demo'
```

```js
export default {
  friends: {
    // With `:basePath = '/demo'`, it will be `'/demo/components/friends/:userId'`
    path: '/components/friends/:userId',
    pathOpts: {
      sensitive: true
    }
  }
};
```

#### Using a path with the router transition methods

When we use router transition methods such as `push` or `replace`, we typically specify the route to go by name.
However, we can also use the path of the route. See the code below:

```js
this.router.push('/help');
this.router.push('/components/friends/:userId', {params: {userId: '109'}});
```

This is similar to:

```js
this.router.push('help');
this.router.push('friends', {params: {userId: '109'}});
```

You can also pass routes with absolute URLs, even if they are not specified in the routing scheme.

```js
this.router.push('https://google.com');
```

#### Default route parameters

When calling the router transition methods, we can attach additional parameters to the transition, such as query parameters or a URL.
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

We can attach custom options to any route by adding a property to the route declaration.

```js
export default {
  user: {
    path: '/user',
    showWelcomeBoard: true
  }
};
```

All additional properties are stored in the `meta` parameter. We can now access this parameter using `route.meta.showWelcomeBoard`.
Be careful not to accidentally override predefined properties.

#### Loading dynamic modules on transition

We generally split our scripts and styles into different parts to improve loading speed.
We may require the router to load some modules on transition. To do this, simply add a `load` function to your route.

```js
export default {
  demo: {
    path: '/demo',
    load: () => Promise.all([
      import('components/form/b-button'),
      import('components/directives/in-view')
    ])
  }
};
```

#### Scrolling to the specified coordinates after transition

If we want to create a logic where the router automatically scrolls the page to the specified coordinates after switching to a new route,
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

The router saves the scroll coordinates each time it changes to a different route to re-establish its position when
using `back/forward` navigation.

#### Redirecting to another route

We can define logic so that one route will be automatically redirected to another.

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

You can create more complex cases with chained redirects. This feature allows you to handle changes in route structure,
making it easier to manage your application's navigation.

If two routes contain the same parameters they will be filled respectively:

```js
export default {
  foo: {
    path: '/foo/:param'
  },
  bar: {
    path: '/bar/baz/:param',
    redirect: 'foo'
  }
}
```

When you navigate to the `bar` route and provide the `param` parameter, it will be substituted in the `foo`'s path:

```js
this.router.push('/bar/baz/value'); // redirect to '/foo/value'
```

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

Instead of a redirect, an alias will store the URL and name, but the other parameters will be taken from the route it refers to.

#### Creating an alias for dynamic parameters in path

You can specify string aliases bound to the dynamic parameter in the path:

```js
({
  path: '/foo/:bar',
  pathOpts: {
    aliases: {
      bar: ['_bar', 'Bar']
    }
  }
})
```

Then, when you want to make a transition, you can specify either the original parameter (`bar` in the example) or any of its aliases:

```js
this.router.push('/foo/:bar', {params: {bar: 'bar'}}); // "/foo/bar"
this.router.push('/foo/:bar', {params: {Bar: 'Bar'}}); // "/foo/Bar"
this.router.push('/foo/:bar', {params: {_bar: '_bar'}}); // "/foo/_bar"
```

Note that aliases will be used only if the original parameter is not specified:

```js
this.router.push('/foo/:bar', {params: {bar: 'original', Bar: 'alias'}}); // "/foo/original"
```

The priority of aliases is determined by their index in the array:

```js
this.router.push('/foo/:bar', {params: {Bar: 'Bar', _bar: '_bar'}}); // "/foo/_bar"
```

The `paramsFromQuery` option also works with aliases, meaning you can specify aliases within the query object:

```ts
this.router.push('/foo/:bar', {query: {_bar: 'bar'}}); // "/foo/bar"
```

Note that fields from the `query` will be used as aliases only if the `params` object doesn't have any.
That means if you specify an alias in `params` and in `query` at the same time, the field from `query` will become
the default `?alias=val` query, and the field from `params` will be used as the alias.

```js
this.router.push('/foo/:bar', {params: {_bar: 'bar'}, query: {Bar: 'query'}}); // "/foo/bar?Bar=query"
```

#### External routes

Usually, when we create a new transition using router methods, the transition is not reloaded in the browser because it
uses the History API or similar methods. This is how Single Page Applications (SPAs) work, but sometimes we need to force a browser reload.
For example, when navigating to another site or a subdomain of the current one. To do this, you must specify the route path as absolute,
i.e., with protocol, host address, port, etc., or add a special `external` flag.

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

Usually, we have to specify the name of the route in the `redirect` property, but we can also pass the entire URL of the route.
In this case, the redirect will work as "external," meaning the browser will switch to this URL using `location.href`.

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

In the first example, we declare a route with a path on our own site, such as `https://bla.com/google`, which redirects to Google.
In the second example, we simply declare an external route.

## How does a router perform transitions?

A router performs transitions by utilizing the `core/router` module, which serves as a strategy.
This module includes essential interfaces for the router mechanism, route declarations, a route object, and more.
Additionally, it offers "strategies" or "engines" to carry out transitions effectively.

These engines can be found in the `engines` directory. Some of the available engines are based on the browser history API (default engine),
and others use in-memory state management. You can also create a custom engine tailored to your specific requirements.
The active or default engine is exported from the `engines/index.ts` file.

### Transition methods

The router offers several transition control methods:

* `push` - emits a new transition with history added to the stack.
* `replace` - emits a new transition that replaces the current route.
* `back` - moves back one step in the history stack.
* `forward` - moves forward one step in the history stack.
* `go` - navigates to a route in the history stack, identified by its relative position to the current route.

The `push` and `replace` methods can accept additional parameters:

* `query` - extra request parameters for the route, appended to the URL as `/foo?bla=1`.

  ```js
  router.push('foo', {query: {bla: 1}});
  ```

* `params` - parameters that provide path interpolation values.

  ```js
  router.push('/components/friends/:userId', {params: {userId: 1}});
  ```

* `meta` - additional parameters that do not have a "side" effect on the route path.

  ```js
  router.push('/components/friends/:userId', {meta: {scroll: {x: 0, y: 100}}});
  ```

Note that all `query` and `params` parameters will be normalized to `'true'/'false'/'null'/'undefined'`, and string-based numbers
will be cast to their JavaScript equivalents.

```js
// These two transitions are equal
router.push('foo', {query: {bla: 1}});
router.push('foo', {query: {bla: '1'}});

// These two transitions are equal
router.push('/components/friends/:userId', {params: {userId: 1}});
router.push('/components/friends/:userId', {params: {userId: '1'}});
```

All transition methods return promises that will be resolved when their related transitions are complete.

```js
router.back().then(() => {
  // ...
});
```

### Transition to the current route

If you wish to generate a transition to a route identical to the current one, you can pass `null` as the route name
for the transition methods.

```js
// These two variants are equivalent
router.push(null, {query: {foo: 1}});
router.push(route?.name, {query: {foo: 1}});
```

### Transition event flow

When you call one of the router transition methods, such as `push` or `replace`, the router generates several specialized events.

1. `beforeChange(route: Nullable<string>, params: TransitionOptions, method: TransitionMethod)` - this event is emitted
   before any transition occurs. Handlers listening to this event receive the following arguments:

   1. `route` - a reference to the target route.
   2. `params` - the route parameters, which handlers can modify to add more parameters.
   3. `method` - the type of transition method used: `push`, `replace`, or `event` (for native history navigation).

2. `softChange(route: Route)` or `hardChange(route: Route)` - one of these events is emitted before the route object changes.
   The difference between these events lies in the level of change:

   1. `softChange` - the route retains the same name as the previous route, but there have been modifications to the query parameters.
   2. `hardChange` - the route has changed or one of the parameters has been altered, which can affect the URL path.

3. `change(route: Route)` - this event is emitted every time the route changes. Keep in mind that, in certain cases,
   the transition might be prevented, and this event will not be triggered; for instance, if we attempt to replace the same route with
   the same parameters.

4. `transition(route: Route)` - this event is fired after the transition methods are executed. If the transition occurs,
   the event will be triggered after the `change` event.

For added convenience, the router also emits the `change` event on the root component as `transition`.

```js
router.on('change', () => {
  // ...
});

rootEmitter.on('transition', () => {
  // ...
});
```

## How to dynamically bind a component property to the router?

When you use `router.push` or `router.replace`, the router may change the value of the `route` property.
However, there are some nuances to keep in mind:

* When you create a transition without changing the route path or URL pathname, such as modifying only the query parameters,
  the mutations to the route object do not trigger a re-rendering of the components. This means you should manually bind
  the component properties for these cases. This behavior enhances application performance during route changes,
  as you typically do not need to refresh the page or trigger significant UI updates when changing query parameters.
  This type of behavior is referred to as "soft".

* When you emit a soft transition, you can change query parameters without overwriting existing ones.
  For instance, if you have a URL like `/foo?bla=1` and perform `router.push(null, {query: {baz: 2}})`,
  the resulting URL will be `/foo?bla=1&baz=2`. If you need to remove certain parameters, set them to `null`,
  as in this example: `router.push(null, {query: {bla: null}})`.

### Watching for a route

Since not every transition causes a re-render, sometimes you cannot simply write something like:

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

Notice that we are creating a link with two flags: `deep` and `withProto`.
You can use `@system` instead of the `@field` decorator, and you can also use the `watch` method, the `@watch` decorator, and so on.

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

Suppose you need to create logic in which mutating certain properties should push a new transition to the same route by adding
these properties as query parameters. In this case, you can use the API to establish a two-way binding between the component and the router.

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

Let's examine the `syncRouterState` method. This method functions as a two-way connector between the router and the component.
When a component is initialized, it requests data from the router. The router supplies data using this method.
The method then returns a dictionary that will be mapped to the component (you can specify a complex path with dots,
like `'foo.bla.bar'` or `'mods.hidden'`). Additionally, the component will watch for changes to every property within that dictionary.
If at least one of these properties is modified, the entire data package will be sent to the router using this method
(the router will create a new transition using `push`). When the component provides router information, the second argument is `remote`.

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

It's important to note that the router is global to all components; in other words, the dictionary passed by this method
to the router will extend the current route data instead of overwriting it.

### Synchronization with the router after component initialization

When a component uses `syncRouterState`, it requests router information upon initialization.
However, sometimes the router may not have the requested properties, and you provide default values for them.
One issue with this approach is that the default values are not synchronized with the router.
In other words, when navigating from one page to another using the `push` method and then returning using the `back` or `forward` method,
the properties with values from the default state will not be restored. This behavior might not always align with your expectations.

To address this issue, each component has a `syncRouterStoreOnInit` property. If you set `syncRouterStoreOnInit` to `true`,
the component will forcefully map its state to the router upon initialization.

### Resetting the router state

You can optionally specify a method that handles situations where you need to reset the state synchronized with the router.

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

To reset the router state, you can either call `state.resetRouter()` from the component instance or invoke the `reset` root method.
By default, all properties from `syncRouterState` will be overwritten with `undefined`.

## Slots

The component supports the default slot. Sometimes this can be helpful.

```
< b-router :routes = routes
  < template #default = {ctx}
    {{ ctx.route.name }}
```
