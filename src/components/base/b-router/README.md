# components/base/b-router

This module provides a component for organizing page routing.

## Synopsis

* The component extends [[iData]].

* The component does not have a default UI.

* By default, the component's root tag is set to `<div>`.

## Why a Component Instead of a Plugin?

There are several reasons why this API is implemented as a component rather than a plugin:

1. It simplifies the organization of sub-routes or alternate routes: you can place two or more routers in a template and
   dynamically switch between them using the `v-if` directive.

2. The router extends from the `iData` component, meaning it can load and manage routes from a server or
   other data sources.
   Additionally, the router can apply modifiers and perform other actions like a regular component.

3. The router is automatically compatible with all supported rendering engines,
   ensuring consistent performance across different environments.

## How to Use?

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

### Connection API Between Router and Other Components

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

#### Handling of Links on a Page

By default, the router intercepts any clicks on elements on the page that have a `href` attribute.
If the URL in href meets certain conditions,
the router will cancel the default behavior of the browser and perform a transition.

```
/// Click on this element will be intercepted by the router
< a href = /some-url

/// Of course, you can pass any query parameters with such a link
< a href = /another/url?utm=partner
```

The following links will not be intercepted, whose href value:

* has a scheme in its URL, for example, `https://google.com`, `mailto:example@example.com` or `javascript:void(0)`;
* is an anchor link, i.e., starts with a `#` symbol.

Also, clicks made while holding down the `ctrl` or `cmd` key are not intercepted.

##### Additional Link Attributes

It's allowed to pass additional parameters for the transition along with the link.
For example, you can instruct the router to replace the current history item, rather than creating a new one.

```
< a href = /some-url | data-router-method = replace
```

The following attributes are supported:

* `data-router-method` - the type of router method used to send the transition.

  ```
  < a href = /some-url | data-router-method = replace
  < button href = /loopback-url | data-router-method = back
  < button href = /loopback-url | data-router-method = forward
  ```

* `data-router-go` - value for the router's `go` method;

  ```
  < button href = /loopback-url | data-router-method = go | data-router-go = -5
  ```

* `data-router-params`, `data-router-query`, `data-router-meta` - additional parameters for
   the router method used (use `JSON.stringify` to provide an object).

  ```
  /// /user/42
  < a href = /user/:id | data-router-params = {"id": 42}

  /// /some-url?utm=portal
  < a href = /some-url | data-router-query = {"utm": "portal"}

  /// console.log(route.meta.data.param1)
  < a href = /some-url | data-router-meta = {"data": {"param1": 1, "param2": 2}}
  ```

* `data-router-prevent-transition` - if this attribute is set, a click on this element will not create a transition.
  Note that the browser's click handling is also canceled.

  ```
  < a href = /some-url | data-router-prevent-transition = true | @click = router.push('my-route')
  ```

##### How to Cancel the Router's Link Interception?

There are several ways:

1. Initializing the router with the `interceptLinks` prop set to false cancel the router's interception of any links.

   ```
   - namespace [%fileName%]

   - include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

   - template index() extends ['i-static-page.component'].index
     - block headHelpers
       < b-router :interceptLinks = false
   ```

2. Setting the data-router-prevent-transition attribute for a link cancels the router's and
   the browser's interception of the click.

   ```
   < a href = /some-url | data-router-prevent-transition = true | @click = router.push('my-route')
   ```

3. When clicking on a link, the router emits a special `hrefTransition` event.
   An instance of the same-named class with two methods, `preventDefault` and `preventRouterTransition`,
   is passed as a parameter of this event.
   Calling `preventDefault` cancels the interception of the link by the router and the browser,
   and calling preventRouterTransition cancels the interception of the link by the router only.

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

## How to provide routes to the router?

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

2. Provide your routes as the component prop.

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

3. Load your routes from a data provider.

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

### What exactly can you specify as route parameters?

When declaring routes, you can specify additional options for each route.
Some parameters are related to how the router performs transitions;
others can provide some metadata about the route.
Additionally, you can add more options depending on your needs.

#### Specifying paths to routes

When using a router engine that associates routes with specific URLs, such as the History API,
we need to specify a special path that acts as a blueprint for creating the route's URL.
Let's consider the example below.

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

* The `friends` route is dynamically associated with a set of URLs because it has the `:userId` part in
  its path template that takes the value from the parameters specified when the router was navigated.
  This allows for flexibility in generating URLs based on the provided `userId`.

  ```js
  // Navigates to https://foo.com/components/friends/109
  this.router.push('friends', {params: {userId: '109'}});
  ```

  Also, if the route has the `paramsFromQuery` option (enabled by default),
  you can provide those options with the `query` option.

  ```js
  // Navigates to https://foo.com/components/friends/109?showInfo=true
  this.router.push('friends', {query: {userId: '109', showInfo: true}});

  // If we switch `paramsFromQuery` to false, then it navigates to
  // https://foo.com/friends?userId=109&showInfo=true
  this.router.push('friends', {query: {userId: '109', showInfo: true}});
  ```

  In the examples above, we demonstrate how to navigate to different routes using route parameters and query options.
  By setting the `paramsFromQuery` option, you can control how the parameters are incorporated into the generated URLs.

  You can create more complex paths using a combination of parameters, such as `foo/:param1/:param2`.
  The library [path-to-regexp](https://github.com/pillarjs/path-to-regexp) is used to parse these patterns.
  You can check its documentation for more information.

  Additionally, you can pass options to the parsing library using `pathOpts`.

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
  allowing for more precise control over routing behavior.

* The `notFound` route is not directly associated with any URLs (because it doesn't have a `path` property),
  but it does have a `default` property set to true.
  This means that every time a URL cannot be directly matched, the `notFound` route will be used.
  For example, https://foo.com/bro or https://foo.com/bla/bar.
  You can also name the default route as `index` instead of setting the `default` property.

#### Providing the base path to routes

The router component can take an optional parameter that specifies a path prefix which is concatenated with all paths
in the route configuration.

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

When using router transition methods like push or replace, you usually specify the route to navigate by its name.
However, you can also use the route's path.
See the code below:

```js
this.router.push('/help');
this.router.push('/components/friends/:userId', {params: {userId: '109'}});
```

This is similar to:

```js
this.router.push('help');
this.router.push('friends', {params: {userId: '109'}});
```

You can also pass routes with absolute URLs even if they are not defined in the route schema.

```js
this.router.push('https://google.com');
```

#### Default route parameters

When calling the router's transition methods, you can attach additional parameters such as query parameters or a URL.
However, you can also specify default parameters for any route, which will automatically be appended to each transition.

```js
export default {
  demo: {
    path: '/demo',

    query: {
      // You can use static values
      showHeader: true,

      // Or, use functions
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

You can attach custom parameters to any route by adding properties to its declaration.

```js
export default {
  user: {
    path: '/user',
    showWelcomeBoard: true
  }
};
```

All additional properties are stored in the `meta` parameter.
You can access this parameter using `route.meta.showWelcomeBoard`.
Be careful not to accidentally override predefined properties.

#### Loading dynamic modules on transition

Usually, we separate our scripts and styles into different parts to improve loading speed.
You can require the router to load certain modules upon transition.
To do this, simply add a `load` function to the route.

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

If you want to create logic where the router automatically scrolls the page to specific coordinates after
navigating to a new route, you can use the `autoScroll` property (it is enabled by default).
To set the default coordinates for a route, use the `scroll` option.

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

The router saves the scroll coordinates every time it switches to another route in order to restore its position
when using the "back/forward" navigation.

#### Redirecting to another route

You can define behavior where one route automatically redirects to another.

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

You can create more complex scenarios with chains of redirects.
This feature allows you to handle changes in the route structure,
making it easier to manage your application's navigation.

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

If you have two or more routes with the same parameters but different names or paths,
you can create one "master" route and multiple aliases for it.
This allows you to handle the same parameters in different routes using a single master route configuration.
Here's an example:

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

If in case of a `redirect` we receive a completely new route,
then the `alias` only retains its name and path, and takes all other parameters from the associated route.

#### Creating aliases for path parameters

Sometimes it is necessary to create multiple aliases for route path parameters.
This allows for easier migration from one path scheme to another without significant changes to the code.
To declare such aliases, simply pass them to the `pathOpts.aliases` property.

```js
export default {
  user: {
    path: '/user/:id',
    pathOpts: {
      aliases: {
        id: ['userId', 'user-id']
      }
    }
  }
};
```

Then, when you want to perform a transition, you can specify either the original parameter or any of its aliases.

```js
this.router.push('user', {params: {id: 42}});        // /user/42
this.router.push('user', {params: {userId: 42}});    // /user/42
this.router.push('user', {params: {'user-id': 42}}); // /user/42
```

Please note that aliases will only be used if the original parameter is not specified.

```js
this.router.push('user', {params: {id: 42, userId: 10}}); // /user/42
```

The priority of aliases is determined by their index in the array.

```js
this.router.push('user', {params: {userId: 42, 'user-id': 10}}); // /user/42
```

The `paramsFromQuery` option also works with aliases.
This means that you can provide aliases within the query object when using this option.

```ts
this.router.push('user', {query: {userId: 42}}); // /user/42
```

Please note that fields from the `query` will only be used as aliases if they are not present in the `params` object.
This means that if you specify an alias in both params and query simultaneously,
the field from the query will take precedence as the default `?alias=value` query,
and the field from params will be used as the alias.

```js
this.router.push('user', {params: {userId: 42}, query: {'user-id': 10}}); // /user/42?user-id=10
```

#### External routes

Usually, when we create a new route using router methods, the page does not usually reload in the browser.
This is because it uses the History API or similar methods, which is how single-page applications (SPAs) work.
However, there may be cases where we need to force a browser reload,
such as when navigating to another website or subdomain of the current site.
To achieve this, we need to specify the route path as an absolute path, including the protocol, host address, port,
etc., or add a special `external` flag to indicate that a browser reload is required.

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

##### External redirects

Typically, we need to specify the route name in the redirect property.
However, we can also pass a full URL of the route.
In this case, the redirect will act as `external`, meaning the browser will navigate to that URL using `location.href`.
This is useful for redirecting to an external website or a different subdomain.

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

In the first example, we declare a route with a path on our own website, for example, https://bla.com/google,
which redirects to Google.
In the second example, we simply declare an external route.

## How does the router perform transitions?

The router handles transitions using the `core/router` module, which serves as the strategy.
This module includes key interfaces for the router mechanism, route declaration, route object, and more.
Additionally, it offers "strategies" or "engines" for efficient transition execution.

These engines can be found in the `engines` directory.
Some of the available engines are based on the browser history API (default engine),
while others utilize in-memory state management.
You can also create your own engine customized to your specific requirements.
The active or default engine is exported from the `engines/index.ts` file.

### Transition methods

The router offers several methods for managing transitions:

* `push` - creates a new transition with added it to the history stack.
* `replace` - creates a new transition that replaces the current route.
* `back` - moves one step back in the history stack.
* `forward` - moves one step forward in the history stack.
* `go` - navigates to a route in the history stack, determined by its relative position to the current route.

The `push` and `replace` methods can accept additional parameters:

* `query` - query parameters for the route, appended to the URL as `/foo?bla=1`.

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

Note that all `query` and `params` parameters will be normalized to `'true'/'false'/'null'/'undefined'`,
and string-based numbers will be cast to their JavaScript equivalents.

```js
// These two transitions are equal
router.push('foo', {query: {bla: 1}});
router.push('foo', {query: {bla: '1'}});

// These two transitions are equal
router.push('/components/friends/:userId', {params: {userId: 1}});
router.push('/components/friends/:userId', {params: {userId: '1'}});
```

All transition methods return promises that will be resolved once the associated transitions have completed.

```js
router.back().then(() => {
  // ...
});
```

### Transition to the current route

If you want to generate a transition to a route with the same name as the current route,
you can simply use the reference to `route.name`.
However, it is necessary to make sure beforehand that such a route actually exists.

```js
if (route != null) {
  router.push(route.name, {query: {bar: 1}});
}
```

Another alternative option is to simply pass `null` as the route name.
However, there is one peculiarity with this approach:
the query parameters passed along with the transition will not fully replace the existing ones, but will extend them.
This can be extremely useful when we need to add a new query parameter without removing the existing ones.
If you do need to remove any of these parameters, simply pass it as `null`.

```js
// Assume you are on the route /foo?bla=1

router.push(null, {query: {bar: 1}});    // The route is /foo?bla=1&bar=1

router.push(null, {query: {bar: null}}); // The route is /foo?bla=1
```

You can use `null` as the route name not only with the `push` method, but also with the `replace` method.

```js
router.replace(null, {query: {bar: 1}});
```

### Transition event flow

When you invoke one of the router's transition methods, such as `push` or `replace`,
the router emits several specialized events.

1. `beforeChange(route: Nullable<string>, params: TransitionOptions, method: TransitionMethod)` - this event is emitted
   before any transition occurs.
   Handlers listening to this event receive the following arguments:

   1. `route` - a reference to the target route.
   2. `params` - the route parameters that handlers can modify to add more parameters.
   3. `method` - the type of transition method being used: `push`, `replace`, or `event`
      (for native history navigation).

2. `softChange(route: Route)` or `hardChange(route: Route)` - one of these events is emitted before the route object
   is modified.
   The difference between these events lies in the level of changes:

   1. `softChange` - the route retains the same name as the previous route but the query parameters have changed.
   2. `hardChange` - either the route has changed or one of the parameters has been modified,
      potentially affecting the URL path.

3. `change(route: Route)` - this event is emitted whenever the route changes.
   Note that in certain cases, the transition may be prevented and this event won't be triggered.
   For example, if we attempt to replace the same route with the same parameters.

4. `transition(route: Route)` - this event is triggered after the transition methods have executed.
   If the transition occurs, the event will be triggered after the change event.

For added convenience, the router also emits the `transition` event on the root component.

```js
rootEmitter.on('transition', () => {
  // ...
});
```

## How to dynamically bind a component property to the router?

When using `router.push` or `router.replace`, the router can modify the value of the `route` property.
However, there are some nuances to keep in mind:

* When you perform a transition without changing the route name or URL, such as only modifying query parameters,
  the route object mutations do not trigger a re-rendering of components.
  This means you need to manually bind component properties for these cases.
  This behavior improves the performance of the application when changing routes
  since you typically don't need to refresh the page or initiate significant UI updates when query parameters change.
  This type of behavior is referred to as "soft".

* When you perform a soft transition, you can modify query parameters without overwriting existing ones.
  For example, if you have a URL like `/foo?bla=1` and you perform `router.push(null, {query: {baz: 2}})`,
  the resulting URL would be `/foo?bla=1&baz=2`.
  If you need to remove specific parameters, set their value to `null`,
  as shown in this example: `router.push(null, {query: {bla: null}})`.

### Watching for a route

Since not every transition causes a re-render, sometimes you can't simply write something like:

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

Note that we are creating a link with two flags: `deep` and `withProto`.
You can use ``@system`` instead of the `@field` decorator, and you can also use the `watch` method,
the `@watch` decorator, and so on.

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

Let's say you need to create a logic where changes to certain properties should trigger a new transition
to the same route, adding those properties as query parameters.
In this case, you can use an API to establish a two-way binding between the component and the router.

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

Let's talk about the `syncRouterState` method.
This method acts as a two-way connector between the router and the component.

1. When the component is initialized, it requests data from the router.
2. The router provides the data using this method.
3. Then, the method returns a dictionary that will be mapped to the component
   (you can specify a complex path with dots, for example `foo.bla.bar` or `mods.hidden`).
4. Additionally, the component will observe changes to each property in this dictionary.
5. If any of these properties are modified, the entire data package will be sent to the router using this method
   (the router will create a new transition using `push`).
6. When the component provides information to the router, the second argument is `remote`.

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

It's important to note that the router is global for all components;
in other words, the dictionary passed to this method will extend the current route data in the router,
rather than overwrite it.

### Synchronization with the router after a component initialization

When a component uses `syncRouterState`, it requests route information upon initialization.
However, sometimes the router may not have the requested properties, and you provide default values for them.
One issue with this approach is that the default values are not synchronized with the router.
In other words, when navigating from one page to another using the `push` method and then returning using
the `back` or `forward` method, the properties with values from the default state will not be restored.
This behavior might not always align with your expectations.

To address this issue, each component has a `syncRouterStoreOnInit` prop.
If you set the `syncRouterStoreOnInit` prop to true,
the component will forcefully synchronize its state with the router upon initialization.

### Updating router state

By default, when any property from `syncRouterState` is changed,
the data will be sent to the router and the router will create a new transition using the `push` method.
This means that the properties returned by the `syncRouterState` method will be added as query parameters,
resulting in a new entry in the browser's history.

To have more control over the routing behavior and its impact on the browser's history stack,
you can specify the `routerStateUpdateMethod` parameter.
This parameter determines the method used by the router to perform a new transition when certain component
properties change.
It allows for fine-tuning the routing behavior according to the specific requirements of
the two-way binding between the component and the router.

```typescript
import iBlock, { component, system } from 'super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  routerStateUpdateMethod: 'push' | 'replace' = 'replace';

  @system()
  bla: number = 0;

  syncRouterState(data: CanUndef<Dictionary>, type: ConverterCallType) {
    return {bla: data?.bla || this.bla};
  }
}
```

### Resetting the router state

You can optionally specify a method that handles situations where you need to
reset the state synchronized with the router.

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

To reset the router state, you can either call `state.resetRouter()` from the component instance,
or invoke the root `reset` method.
By default, all properties from `syncRouterState` will be overwritten with `undefined`.

## Slots

The component supports the default slot. Sometimes this can be helpful.

```
< b-router :routes = routes
  < template #default = {ctx}
    {{ ctx.route.name }}
```
