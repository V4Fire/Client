# core/component/functional

This module provides an API for creating functional components.
It should be noted that V4Fire has its own implementation of cross-platform functional components available as well.

## What Are the Differences Between Regular and Functional Components?

The main difference between regular and functional components is how they handle template updates.
In regular components, the template is automatically updated whenever the component's state changes.
However, in functional components, the template is rendered only once and will not automatically update when
the component's state changes.
Instead, a functional component will be re-rendered only when one of its non-functional parent components updates.

Additionally, functional components provide the option to disable watching for certain component properties or events.
This can be done by using the `functional: false` option when applying property or method decorators to the component.
By disabling watching for specific properties or events, the performance of functional components can be optimized.

### Why are Functional Components Called Like That?

Functional components are called like that because they are essentially represented as ordinary functions.
These functions accept input parameters, such as component props, and have their own context or state.
However, what sets them apart from regular components is that they are executed only once during rendering.

## Why are Functional Components Necessary?

They are faster to initialize and render compared to regular components.
As a result, if there are many functional components on a page, the performance gain can be quite noticeable.

## When Should Functional Components Be Used?

When a component template remains unchanged regardless of the component's state.
Mind, you can still use component modifiers to alter the appearance of the template.
For instance, you can hide or display specific portions of the template.
This is possible because modifiers are always assigned as regular CSS classes to the root component element.

## When Should You Not Use Functional Components?

There is a fundamental rule to keep in mind: if your component's markup is dependent on the state,
such as retrieving and displaying data from the network, then a functional component may not be the best option for you.

Additionally, functional components may not work seamlessly with lengthy CSS animations.
The issue arises when any non-functional parent of such a component undergoes a state change,
causing all child functional components to be recreated.
Consequently, any ongoing animations will be reset.

## How is a Functional Component Updated When Its Non-Functional Parent Component Updates?

In scenarios where a component's non-functional parent undergoes an update,
a common strategy is employed: the component is first destroyed and then recreated.
During the creation of the new component, it typically retains the state from the previous instance.

In simple terms, if any properties were modified in the previous component,
these modifications will carry over to the new component.
Nonetheless, we can enhance this behavior by using the special options available in decorators.

## Creating a Functional Component

There are two ways to declare a functional component.

1. By including the `functional: true` option when registering the component using the `@component` decorator.
   It is important to note that this option is inherited from the parent component to the child component,
   unless explicitly overridden.

   ```typescript
   import iData, { component } from 'components/super/i-data/i-data';

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

   If you pass the `functional: null` option, it means that all property and event observers,
   as well as input parameters, will not work within the functional component.
   However, you can override this rule for a specific property or observer by explicitly
   passing `functional: true` in the associated decorator.
   It's important to note that this option is specific to entities declared within a particular class and
   cannot be inherited.

   ```typescript
   import iBlock, { component, prop, watch, hook } from 'components/super/i-block/i-block';

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

2. If you pass the `functional` option as an object, you can specify under which output parameters a
   functional component should be used, and under which a regular component should be used.
   This type of component is commonly referred to as a "smart" component.
   It's worth noting that this option is inherited from the parent component to the child component,
   unless it is explicitly overridden.

   ```typescript
   import iData, { component } from 'components/super/i-data/i-data';

   // `bLink` will be created as a functional component if its `dataProvider` prop is not passed or undefined
   @component({functional: {dataProvider: undefined}})
   class bLink extends iData {

   }
   ```

   If you pass a dictionary with no values, the component will be created as a functional component by default.
   However, you can still explicitly specify that a component should be non-functional at a specific location
   using the `v-func` directive.

   ```typescript
   import iData, { component } from 'components/super/i-data/i-data';

   @component({functional: {}})
   class bLink extends iData {

   }
   ```

   ```
   < bLink v-func = false
   ```

## How to Update the Template of a Functional Component?

Ideally, it is necessary to avoid such situations.
After all, if you want to update the template of a component when its state changes,
it means you need a regular component instead of a functional one.
However, if you do need to update the template of a functional component,
there are several standard ways to achieve this.

### Using Modifiers

This approach allows you to manipulate the template by adding or
removing CSS classes associated with the root node of the component.
While it doesn't enable direct modification of the template itself,
it is an incredibly powerful API that covers 80% of use cases.

__b-link/b-link.ts__

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

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

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - rootTag = 'a'
  - rootAttrs = {'@click': 'onClick'}
```

### Using Node References and the DOM API

By using this approach, you can delete or add attributes to a specific DOM node or even modify its structure.
However, exercise extreme caution when adding new nodes.

__b-link/b-link.ts__

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

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

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < a ref = link
```

### Using the `v-update-on` Directive

This directive, in conjunction with the modifiers API and the DOM API,
provides you with greater flexibility in updating nodes.
Please refer to the directive documentation for further details.

### Using the `AsyncRender` API

This technique is incredibly powerful as it allows you to manually trigger the re-rendering of
specific parts of a component template.
For more information on this, please refer to the documentation of the [[AsyncRender]] module.

__b-link/b-link.ts__

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

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

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < .&__content v-async-target
      < template v-for = el in asyncRender.iterate(true, { &
        filter: asyncRender.waitForceRender('content')
      }) .
        < .&__content
          += self.slot()
```

## Classes

### VHookLifeCycle

A class for integrating lifecycle events of a functional component using the `v-hook` directive.

## Functions

### createVirtualContext

Creates a virtual context for the passed functional component.
