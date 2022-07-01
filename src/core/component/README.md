# core/component

This module is the entry point for the V4Fire DSL system to define the UI components.

## Some submodules

This module contains many other submodules, which are mainly used for internal purposes.
But there are several submodules that you should familiarize yourself with.

* `core/component/decorators` - this module provides the necessary set of decorators to define components;
* `core/component/directives` - this module provides a bunch of useful built-in directives to use with components or tags;
* `core/component/state` - this module provides an object that can be shared between any component and used as a global state;
* `core/component/event` - this module provides a global event emitter that any component in the application can listen;
* `core/component/functional` - this module contains the implementation of the V4Fire functional components;
* `core/component/render/daemon` - this module provides an API to register and manage tasks of async rendering;
* `core/component/engines` - this module contains adaptors for component libraries and the V4Fire DSL.

## How it works?

Any user interface components in V4Fire are described as regular TypeScript classes: class methods are component methods;
properties are either input parameters to components, or properties of their states, and so on. We can use any
OOP techniques and patterns to describe a component: composition, strategy, visitor and other patterns.

But how to declare that some class properties are component props? And how is a component based on a class generally created?
To do this, V4Fire provides a set of decorators with which class properties and the classes themselves must be annotated.

```typescript
import iBlock, { component, prop } from 'super/i-block/i-block';

@component()
export default class bUser extends iBlock {
  @prop(String)
  readonly fName: string;

  @prop(String)
  readonly lName: string;
}
```

For detailed information on all existing decorators, you can refer to the `core/component/decorators` module.

## Why do we need DSL for UI components?

Short answer: we like the OOP approach to describe components. And, of course, we wanted to be able to easily apply
any OO patterns we might need. But the problem is that many popular component libraries offer either a procedural or
functional API and don't allow us to write code the way we would like to.

Therefore, instead of creating our own component library, we simply created a simple DSL based on classes and decorators.
Another advantage of this approach is the ability to more easily migrate between the used component libraries,
or even share them within micro-frontends.

## What library is used to create components?

As mentioned earlier, we are not tied to using any particular library. Simply add an adapter for your favorite library
to the `core/component/engines` module, and it will work. But, by default, V4Fire works with the Vue library,
and moreover, we reuse the approaches of this library.

### Implicit state management

No `setState` calls - just set a value of any component property and its template will update automatically.

### Unidirectional flow of changes

Changes in a child component cannot cause the parent to rerender. All component props are immutable.

### Vue declarative templates to describe component markup

In our opinion, the idea of mixing imperative approach and templates, as is done in JSX, is fundamentally wrong.
Let me give you a few examples to support my point of view:

1. If the markup of a component is created as plain HTML with special attributes, then even a non-programmer can write such code.

2. HTML/XML templates seamlessly integrate with many other utilities: templating or preprocessors, validators, etc.
   For example, we can use Pug to reuse markup code, or PostHTML to add necessary "boilerplate" attributes to html tags
   or integrate linters.

3. A huge advantage of templates is the support for custom directives.
   In simple terms, we can define our own attributes for tags with additional logic.
   These directives can include modules that either implement end-to-end functionality, such as logging or analytics.

   ```html
   <myButton v-analytics:ga="{click: reachGoal.bind(null, 'purchase')}" v-log:console="events">
   ```

   Or, provide the ability to integrate third-party APIs, such as `IntersectionObserver`.

   ```html
   <myButton v-in-view="{onEnter: console.log}">
   ```

4. Slots. While this feature is more of a Vue feature than a template feature,
   it allows for incredible flexibility in component architecture design.

   ```html
   <mySelect options="listOfUsers">
     <template v-slot:default="{user}">
       <span class="user-name">{{ user.name }}</span>
     </template>
   </mySelect>
   ```

5. Declarative templates can be better optimized by the compiler because the source code is much simpler than the imperative one.
