<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [tests/helpers/component-object](#testshelperscomponent-object)
  - [Usage](#usage)
    - [How to Create a Component and Place It on a Test Page?](#how-to-create-a-component-and-place-it-on-a-test-page)
    - [How to Select an Existing Component on the Page?](#how-to-select-an-existing-component-on-the-page)
    - [How to Set Props for a Component?](#how-to-set-props-for-a-component)
    - [How to Change Props for a Component?](#how-to-change-props-for-a-component)
    - [How to Set Child Nodes for a Component?](#how-to-set-child-nodes-for-a-component)
    - [How to Track Component Method Calls?](#how-to-track-component-method-calls)
      - [Using `spyOn` Method](#using-spyon-method)
      - [Tracking Calls on the Prototype](#tracking-calls-on-the-prototype)
      - [Setting Up Spies Before Component Initialization](#setting-up-spies-before-component-initialization)
    - [How to Set a Mock Function Instead of a Real Method?](#how-to-set-a-mock-function-instead-of-a-real-method)
    - [How to Create a `ComponentObject` for My Component?](#how-to-create-a-componentobject-for-my-component)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# tests/helpers/component-object

The `ComponentObject` is a base class for creating a component object like components for testing.

The `component object` pattern allows for a more convenient way to interact with components in a testing environment.

This class can be used as a generic class for any component or can be extended to create a custom `component object` that implements methods for interacting with a specific component.

## Usage

### How to Create a Component and Place It on a Test Page?

1. Initialize the `ComponentObject` by calling the class constructor and providing the page where the component will be located and the component's name:

   ```typescript
   import ComponentObject from 'path/to/component-object';

   // Create an instance of ComponentObject
   const myComponent = new ComponentObject(page, 'b-component');
   ```

2. Set the props and child nodes that need to be rendered with the component:

   ```typescript
   import ComponentObject from 'path/to/component-object';

   // Create an instance of ComponentObject
   const myComponent = new ComponentObject(page, 'b-component');

   myComponent
     .withProps({
       prop1: 'val'
     })
     .withChildren({
       renderNext: {
         type: 'div',
         attrs: {
           id: 'renderNext'
         }
       }
     });
   ```

3. Call the `build` method, which generates the component's view and renders it on the page:

   ```typescript
   import ComponentObject from 'path/to/component-object';

   // Create an instance of ComponentObject
   const myComponent = new ComponentObject(page, 'b-component');

   myComponent
     .withProps({
       prop1: 'val'
     })
     .withChildren({
       renderNext: {
         type: 'div',
         attrs: {
           id: 'renderNext'
         }
       }
     });

   await myComponent.build();
   ```

Now that the component is rendered and placed on the page, you can call any methods on it:

```typescript
// Component handle
const component = myComponent.component;

// Perform interactions with the component
await component.evaluate((ctx) => {
  // Perform actions on the component
  ctx.method();
});
```

### How to Select an Existing Component on the Page?

Sometimes, you may not want to create a new component but instead select an existing one. To do this, you can use the `pick` method:

```typescript
import ComponentObject from 'path/to/component-object';

// Create an instance of ComponentObject
const myComponent = new ComponentObject(page, 'b-component');

await myComponent.pick('#selector');
```

### How to Set Props for a Component?

You can set props for a component using the `withProps` method, which takes a dictionary of props:

```typescript
import ComponentObject from 'path/to/component-object';

// Create an instance of ComponentObject
const myComponent = new ComponentObject(page, 'b-component');

myComponent
  .withProps({
    prop1: 'val'
  });
```

You can use `withProps` multiple times to set props as many times as needed before the component is created using the `build` method. To overwrite a prop, simply use `withProps` again with the new value:

```typescript
myComponent
  .withProps({
    prop1: 'val'
  });

myComponent.withProps({
  prop1: 'newVal'
});

console.log(myComponent.props) // {prop1: 'newVal'}
```

### How to Change Props for a Component?

Once a component is created (by calling the `build` or `pick` method), you cannot directly change its props because props are `readonly` properties of the component. However, if a prop is linked to a parent component's property, changing the parent's property will also change the prop's value in the component.

To facilitate this behavior, there is a "sugar" method that encapsulates this logic, using a `b-dummy` component as the parent. To use this sugar method in the `build` method, pass the option `useDummy: true`. This will create a wrapper for the component using `b-dummy`, and you can change props using a special method called `updateProps`:

```typescript
// Create an instance of ComponentObject
const myComponent = new ComponentObject(page, 'b-component');

myComponent
  .withProps({
    prop1: 'val'
  });

await myComponent.build({ useDummy: true });

// Change props
await myComponent.updateProps({ prop1: 'newVal' });
```

Please note that there are some nuances to consider when creating a component with a `b-dummy` wrapper, such as you cannot set slots for such a component.

### How to Set Child Nodes for a Component?

You can set child nodes (or slots) for a component using the `withChildren` method. It works similarly to `withProps`, but it defines the child elements of the component, not its props.

Here's an example of setting a child node that should be rendered in the `renderNext` slot:

```typescript
import ComponentObject from 'path/to/component-object';

// Create an instance of ComponentObject
const myComponent = new ComponentObject(page, 'b-component');

myComponent
  .withChildren({
    renderNext: {
      type: 'div',
      attrs: {
        id: 'renderNext'
      }
    }
  });

await myComponent.build();
```

To set the `default` slot, name the child node as `default`:

```typescript
import ComponentObject from 'path/to/component-object';

// Create an instance of ComponentObject
const myComponent = new ComponentObject(page, 'b-component');

myComponent
  .withChildren({
    default: {
      type: 'div',
      attrs: {
        id: 'renderNext'
      }
    }
  });

await myComponent.build();
```

### How to Track Component Method Calls?

#### Using `spyOn` Method

To track calls to a component method, you can use the special `Spy` API, which is based on `jest-mock`.

To create a spy for a method, use the `spyOn` method:

```typescript
// Create an instance of MyComponentObject
const myComponent = new MyComponentObject(page, 'b-component');

await myComponent.build();

// Create a spy
const spy = await myComponent.spyOn('someMethod');

// Access the component
const component = myComponent.component;

// Perform interactions with the component
await component.evaluate((ctx) => {
  ctx.someMethod();
});

// Access the spy
console.log(await spy.calls); // [[]]
```

In this example, we created a spy for the `someMethod` method. After performing the necessary actions with the component, you can access the `spy` object and use its API to find out how many times the method was called and with what arguments.

#### Tracking Calls on the Prototype

Sometimes, you may need to track calls to methods on the prototype, as they may be invoked not from the component instance itself but through functions like `call`, etc. For example, the `initLoad` method may be called from the prototype and the `call` function. In such cases, you can set up a spy on the class prototype.

Let's consider an example of tracking calls to the `initLoad` method of a component. To do this, you can use the `spyOn` method with the additional option `proto`:

```typescript
// Create an instance of MyComponentObject
const myComponent = new MyComponentObject(page, 'b-component');

const initLoadSpy = await myComponent.spyOn('initLoad', { proto: true });

await myComponent.build();
await sleep(200);

// Access the spy
console.log(await initLoadSpy.calls); // [[]]
```

Note that the spy is created before the component is created using the `build` method. This is important because when setting up a spy on the prototype, it needs to be established before the component is created so that it can track the initial call to `initLoad` during component creation.

#### Setting Up Spies Before Component Initialization

Sometimes, you may need to set up spies before the component is initialized. To do this, you can use the `beforeDataCreate` hook and define spies within it.

Here's an example of setting up a spy to track the `emit` method of a component before its creation:

```typescript
// Create an instance of MyComponentObject
const myComponent = new MyComponentObject(page, 'b-component');

await myComponent.withProps({
  '@hook:beforeDataCreate': (ctx) => jestMock.spy(ctx, 'emit'),
});

// Extract the spy
const spy = await myComponent.component.getSpy((ctx) => ctx.emit);

// Access the spy
console.log(await spy.calls);
```

Important: The function set on the `@hook:beforeDataCreate` event will be called within the browser context, not in Node.js. To pass this function from Node.js to the browser context, it will be serialized. `jestMock` is a globally available object that redirects its method calls to the `jest-mock` API.

### How to Set a Mock Function Instead of a Real Method?

To set up a mock function instead of a real method, you can use the `beforeDataCreate` hook and the `mock` method of the global `jestMock` object.

```typescript
// Create an instance of ComponentObject
const myComponent = new ComponentObject(page, 'b-component');

await myComponent
  .withProps({
    prop1: 'val',
    '@hook:beforeDataCreate': (ctx) => {
      ctx.module.method = jestMock.mock(() => false);
    },
  })
  .build();

const result = await mycomponent.evaluate((ctx) => ctx.module.method());

console.log(result); // false
```

### How to Create a `ComponentObject` for My Component?

For each component you want to test, you can use a `ComponentObject`. However, the basic API may not provide all the functionality you need since it does not know about your specific component. To make `ComponentObject` provide a more comfortable API for working with your component, you should create your own class that inherits from the basic `ComponentObject`. In your custom class (let's call it `MyComponentObject`), you can implement additional APIs that allow you to write tests more effectively and clearly.

Here are the steps to create a `MyComponentObject`:

1. Create a file for your class and inherit it from `ComponentObject`:

   **src/components/base/b-list/test/api/component-object/index.ts**
   ```typescript
   export class MyComponentObject extends ComponentObject<bList['unsafe']> {

   }
   ```

2. Add the necessary API, such as the container selector, a method to get the number of child nodes in the container, and so on:

   **src/components/base/b-list/test/api/component-object/index.ts**
   ```typescript
   export class MyComponentObject extends ComponentObject<bList['unsafe']> {

     readonly container: Locator;
     readonly childList: Locator;

     constructor(page: Page) {
       super(page, 'b-list');

       this.container = this.node.locator(this.elSelector('container'));
       this.childList = this.container.locator('> *');
     }

     getChildCount(): Promise<number> {
       return this.childList.count();
     }
   }
   ```

3. Use your `MyComponentObject` instead of `ComponentObject`:

   ```typescript
   import MyComponentObject from 'path/to/my-component-object';

   // Create an instance of MyComponentObject
   const myComponent = new MyComponentObject(page);

   myComponent
     .withProps({
       prop1: 'val'
     })
     .withChildren({
       renderNext: {
         type: 'div',
         attrs: {
           id: 'renderNext'
         }
       }
     });

   await myComponent.build();

   console.log(await myComponent.getChildCount());
   ```
