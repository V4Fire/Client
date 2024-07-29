# components/super/i-block/modules/activation

This module provides helper functions to activate/deactivate a component.

## What is component activation?

To better understand the meaning of activating and deactivating components, we need to discuss solutions to the problem
of restoring page state in an SPA application when the browser back button is pressed.

When a user leaves one page and follows to a new one, all existing components of the old page, as well as the page itself,
are usually destroyed. This is where the problem lies, that when the "back" button is pressed, we need not only to
essentially redraw the page, but also restore its state to the moment when the user left it.

The simplest way would be not to destroy the existing page, but rather to "freeze" it and put it into the cache until it
is needed again. Freezing means suspending the execution of any handlers and other asynchronous tasks that initiated by
the page so that they do not work while the page is in the cache. When we need to restore the page back into the document,
we simply put its DOM nodes from the cache and send an "unfreeze" event, which will resume listening for events and,
if necessary, process those that occurred while the page was in the cache.

This is where activation and deactivation come in. When we want to "freeze" a component, we initialize its deactivation.
When we "defrost" it - this is activation. It should be noted that these are recursive operations, i.e., by calling activation
on a component, we will also call it on all child non-functional components. Each component may or may not handle this lifecycle hook.
For example, a component can re-request its providers and show updated information.

It is worth mentioning the case when the component is created immediately deactivated.
This is done by passing the special `activated` component prop. Such a component won't load any data from its providers
unless it is explicitly activated. This is useful to initialize components only when they appear in a user viewport.

## How to manage component activation?

There are several options:

1. You use the [[bDynamicPage]] component and set page caching options with the `keepAlive` props.
   In this case, activation and deactivation of components will be handled by `bDynamicPage` itself.

   ```
   < b-dynamic-page :keepAlive = true | :keepAliveSize = 5

   < button @click = router.push('foo', {meta: 'b-foo-page'})
     Go to
   ```

2. Explicitly specifying the `activated` prop.
   In this case, to activate the component, you will need to call its `activate` method.

   ```
   < my-component ref = myComponent | :activated = false

   < button @click = $refs.myComponent.activate()
     Activate!
   ```

3. Explicit work with `deactivate` and `activate` methods.

   ```
   < my-component ref = myComponent

   < button @click = $refs.myComponent.activate()
     Activate!

   < button @click = $refs.myComponent.deactivate()
     Deactivate!
   ```

### How to find out if a component is activated?

You should use the special `isActivated` getter.

 ```
 < my-component ref = myComponent

 < button @click = $refs.myComponent.isActivated ? $refs.myComponent.deactivate() : $refs.myComponent.activate()
   Toggle activation
 ```

### How to handle activation and deactivation states?

There are two standard component lifecycle hooks: `activated` and `deactivated`.
Therefore, to add a handler, you can either use the `@hook` decorator, or listen to the component `hookChange` and
`hook:activated`/`hook:deactivated` events. It is also possible to override the `activated` and `deactivated`
methods on the component, although this is not recommended.

```typescript
import iBlock, { hook } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  @hook('activated')
  onActivated() {
    console.log('I am alive!');
  }

  created() {
    this.on('hook:deactivated', () => {
      console.log('Time to sleep');
    });
  }

  activated() {
    console.log('Not the best solution');
  }
}
```

Also, when a component is deactivated, it has a `componentStatus` value of `inactive`.

```typescript
import iBlock, { hook } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  created() {
    this.on('componentStatus:innactive', () => {
      console.log('Time to sleep');
    });
  }
}
```

## Functions

### activate

Activates the component.
A deactivated component won't load data from providers on initializing.

Essentially, you don't need to worry about component activation,
as it automatically synchronizes with the `keep-alive` mode or a specific component prop.

### deactivate

Deactivates the component.
A deactivated component won't load data from providers on initializing.

Essentially, you don't need to worry about component activation,
as it automatically synchronizes with the `keep-alive` mode or a specific component prop.
