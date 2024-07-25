# core/component

This module serves as the entry point for the V4Fire DSL system to define UI components.

## Some submodules

This module contains many other submodules that are primarily used for internal purposes.
However, there are several submodules that you should become familiar with.

* `core/component/decorators` - provides the necessary set of decorators to define components;
* `core/component/directives` - provides a set of useful built-in directives to use with components or tags;
* `core/component/state` - provides an object that can be shared between any component and used as global state;
* `core/component/event` - provides a global event emitter that any component in the application can listen to;
* `core/component/functional` - contains the implementation of the V4Fire functional components;
* `core/component/render/daemon` - provides an API to register and manage tasks of asynchronous rendering;
* `core/component/engines` - contains adaptors for component libraries and the V4Fire DSL.

## How Does It Work?

In V4Fire, user interface components are described as regular TypeScript classes.
Class methods are component methods and properties are either input parameters to components or
properties of their states.
Any OOP techniques and patterns can be used to describe a component such as composition, strategy, visitor
and other patterns.

To declare that some class properties are component props,
V4Fire provides a set of decorators that must be used to annotate class properties and the classes themselves.
These decorators are used to define the behavior of the class and its properties when they are used as components.

To create a component based on a class, you must use the appropriate decorators
to annotate the class and its properties as input parameters or state properties.
These decorated components can then be used in templates to render user interfaces.

```typescript
import iBlock, { component, prop } from 'components/super/i-block/i-block';

@component()
export default class bUser extends iBlock {
  @prop(String)
  readonly fName: string;

  @prop(String)
  readonly lName: string;
}
```

For detailed information on all the existing decorators, you can refer to the `core/component/decorators` module.

## Why do we need DSL for components?

In short, we need a DSL for UI components because we prefer the object-oriented programming (OOP) approach
to describe components and want to apply different OO patterns.
However, many popular component libraries offer either a procedural or functional API,
which limits our ability to write code the way we want.

To overcome this limitation, we created a simple DSL based on classes and decorators,
which allows us to write code using OOP principles and patterns.
The DSL is flexible enough to accommodate different styles of programming
and can be easily migrated between different component libraries or shared within micro-frontends.

Overall, the V4Fire DSL provides more flexibility and control than traditional procedural or functional APIs,
making it easier to create and manage UI components in complex applications.

## What library is used to create components?

As previously mentioned, V4Fire provides flexibility in terms of component libraries.
Developers can add an adapter for their preferred library to the `core/component/engines` module,
and it will work seamlessly.
However, by default, V4Fire is designed to work with the Vue library, utilizing many of its proven approaches.

Using Vue provides a familiar environment for developers already accustomed to its ecosystem.
V4Fire's architecture incorporates many of Vue's best practices and design patterns,
which streamlines the learning process for developers already proficient in Vue.
Furthermore, Vue's extensive community-maintained packages and components are readily available to V4Fire developers.

Despite the default usage of the Vue library,
V4Fire does not restrict developers from using other libraries or frameworks.
The addition of an adapter to the `core/component/engines` module is all that is required to
leverage alternative libraries.

### Implicit state management

In V4Fire, there is no need to use setState calls to update a component's template.
Instead, developers can simply set the value of any component property, and the template will update automatically.

This is possible because V4Fire leverages a reactive system that tracks changes of component properties and
automatically updates the corresponding parts of the template.
When a property is updated, V4Fire efficiently updates the DOM to reflect the new state of the component.

This approach is much more intuitive and easier to use than traditional reactive systems
that require manually managing state and updating components using complex lifecycle methods.
With V4Fire's automatic template updates, developers can focus on building their logic and let the framework handle
the low-level details of rendering.

### Unidirectional flow of changes

One of the core design principles of V4Fire is
that changes in a child component cannot cause the parent component to rerender.
This ensures that components remain isolated and reusable and
that developers can rely on the expected behavior of their components without worrying about unintended side effects.

To achieve this, V4Fire makes all component props immutable.
That means that once a component is mounted,
its props cannot be directly modified by the component itself or its children.
Instead, a child component can notify its parent of required changes using event emitting or callback mechanisms.

By enforcing strict immutability of component props,
V4Fire promotes a unidirectional data flow and clearly defined responsibilities between components,
making it easier to write maintainable and reliable code.

### Vue declarative templates to describe component markup

We believe that mixing an imperative approach and templates, as done in JSX, is fundamentally wrong.
Let us explain why:

1. First, if a component's markup is created as plain HTML with special attributes,
   even non-programmers can write such code, making it simpler and more accessible to everyone.

2. Second, HTML/XML templates integrate seamlessly with many other utilities like templating or preprocessors,
   validators, and linters.
   For example, Pug can be used to reuse markup code, and PostHTML can add the necessary "boilerplate" attributes
   to HTML tags or integrate linters.

3. Third, templates provide a vast advantage by supporting custom directives.
   These directives can include modules that implement end-to-end functionality such as logging or analytics,
   or the ability to integrate third-party APIs like IntersectionObserver.

   ```html
   <myButton v-analytics:ga="{click: reachGoal.bind(null, 'purchase')}" v-log:console="events">
   <myButton v-in-view="{onEnter: console.log}">
   ```

4. Fourth, the slot feature is more of a Vue feature than a template feature, which allows for flexibility in
   component architecture design.

   ```html
   <mySelect options="listOfUsers">
     <template v-slot:default="{user}">
       <span class="user-name">{{ user.name }}</span>
     </template>
   </mySelect>
   ```

5. Finally, declarative templates can be better optimized by the compiler because the source code is much simpler than
   the imperative one, providing better performance.
