# core/component/functional

This module provides an API to create functional components.
Please note that V4Fire has its own cross-platform implementation of functional components.

## What differences between regular and functional components?

The main difference between functional components and regular components is that the template of a functional component
is never automatically updated when the state of this component changes. In fact, such components are rendered once and
can only be re-rendered if any of their non-functional parent components update the state.

Another difference is that we can optionally disable watching for some component properties or events
if this component is created as a functional one. Typically, this is done by passing the `functional: false` option to
one of the component property or method decorators.

### Why are functional components called like that?

Technically, such components are represented as ordinary functions that accept input parameters (component props, etc.),
have their own context (a state), but are executed only once during rendering.

## Why are functional components needed?

Such components are faster to initialize and render than regular ones.
If there are many such components on the page, then the performance gain can be quite noticeable.

## When should functional components be used?

When a component template does not physically change its markup depending on the state of the component.
However, you can still use component modifiers to affect how the template is shown.
For example, you can hide it or show only a certain part. This works because modifiers are always set as
regular CSS classes to the root component node.

## When should you not use functional components?

There is a simple rule: if your component changes its markup depending on the state, for example,
it receives data from the network and displays it, then a functional component is not suitable for you.

Also, functional components don't play well with long CSS animations.
The problem is that if any of the non-functional parents of such a component changes the state,
then all of its child functional components will be re-created, and animations in progress will be reset.

## How is a component updated if its non-functional parent is updated?

In such situations, a simple strategy is used - the component is destroyed and re-created.
When creating a new component, it usually reuses the state of the past.
In simple terms, if you change any property in the old component, then it will be the same in the new one.
But we can decorate this behavior using the special options of decorators.

## How to create a functional component?

There are two ways to declare a functional component.

1. Pass the `functional: true` option to the `@component` decorator when registering the component.
   Note that this option is inherited from parent component to child component, unless you explicitly override it.

   ```typescript
   import iData, { component } from 'super/i-data/i-data';

   // `bLink` will always be created as a functional component
   @component({functional: true})
   class bLink extends iData {

   }

   // `bCustomLink` will always be created as a functional component
   @component()
   class bCustomLink extends bLink {

   }

   // `bSmartLink` will always be created as a regular component
   @component({functional: false})
   class bSmartLink extends bLink {

   }
   ```

   If you pass the `functional: null` option, then all property and event observers of the component,
   as well as its input parameters, will not work if declared inside a functional component.
   But you can override this rule for a specific property or observer by explicitly passing `functional: true` in
   the associated decorator. Keep in mind that we are talking about those entities that are declared within a particular class.
   This option cannot be inherited.

   ```typescript
   import iBlock, { component, prop, watch, hook } from 'super/i-block/i-block';

   @component({functional: null})
   class iData extends iBlock {
     // This prop available only if used with a regular component
     @prop({type: String, required: false})
     readonly dataProvider?: string;

     // This watcher only works if used with a regular component
     @watch({path: 'dataProvider', immediate: true})
     onProviderChange(value, oldValue) {
       console.log(value, oldValue);
     }

     // This hook works in all cases
     @hook({mounted: {functional: true}})
     onMounted() {
       console.log('Mounted!');
     }
   }

   @component({functional: true})
   class bLink extends iData {

   }
   ```

2. If you pass the `functional` option as an object, then you can specify under which output parameters a functional
   component should be used, and under which a regular one. This kind of components is called "smart".
   Note that this option is inherited from parent component to child component, unless you explicitly override it.

   ```typescript
   import iData, { component } from 'super/i-data/i-data';

   // `bLink` will be created as a functional component if its `dataProvider` prop is not passed or undefined
   @component({functional: {dataProvider: undefined}})
   class bLink extends iData {

   }
   ```

   If you pass a dictionary with no values, then such a component will be created as a functional one by default.
   But you can still explicitly specify that a component should be non-functional at a particular place with the `v-func` directive.

   ```typescript
   import iData, { component } from 'super/i-data/i-data';

   @component({functional: {}})
   class bLink extends iData {

   }
   ```

   ```
   < bLink v-func = false
   ```

## How to update a functional component template?

It is better to avoid such situations, because if you need to update a template, then you need a regular component.
However, you can do this using one of the suggested techniques.

### Using modifiers

This technique will not allow you to physically change the template, but only add or remove one or
another CSS class that is associated with the component root node. However, this is an extremely powerful API,
which is enough for 80% of the cases.

__b-link/b-link.ts__

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component({functional: true})
class bLink extends iBlock {
  onClick() {
    this.block.setMod('active', true);
  }
}
```

__b-link/b-link.ss__

```
- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - rootTag = 'a'
  - rootAttrs = {'@click': 'onClick'}
```

### Using node references and the DOM API

Using this technique, you can simply add or remove attributes for DOM nodes, as well as change their properties.
But be extremely careful when adding new DOM nodes to the component tree.

__b-link/b-link.ts__

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component({functional: true})
class bLink extends iBlock {
  mounted() {
    this.$refs.link.setAttribute('data-foo', 'bar');
  }
}
```

__b-link/b-link.ss__

```
- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < a ref = link
```

### Using the `v-update-on` directive

This directive, together with the modifiers API and the DOM API, gives you more flexibility in updating nodes.
See the directive documentation for more information.

### Using the `AsyncRender` API

This is the most powerful technique that allows you to manually cause parts of a component template to be re-rendered.
See the [[AsyncRender]] module documentation for more information.

__b-link/b-link.ts__

```typescript
import iBlock, { component } from 'super/i-block/i-block';

@component({functional: true})
class bLink extends iBlock {
  updateTemplate() {
    this.asyncRender.forceRender();
  }
}
```

__b-link/b-link.ss__

```
- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < .&__content v-async-target
      < template v-for = el in asyncRender.iterate(true, { &
        filter: asyncRender.waitForceRender('content')
      }) .
        < .&__content
          += self.slot()
```

## Functions

### createVirtualContext

Creates a virtual context for the passed functional component.
