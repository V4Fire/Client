<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
***Table of Contents*

- [tests/helpers/mock](#testshelpersmock)
  - [Usage](#usage)
    - [How to Create a Spy?](#how-to-create-a-spy)
    - [How to Create a Spy and Access It Later?](#how-to-create-a-spy-and-access-it-later)
    - [How to Create a Mock Function?](#how-to-create-a-mock-function)
    - [How Does This Work?](#how-does-this-work)
      - [Mock Functions](#mock-functions)
      - [Spy Functions](#spy-functions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# tests/helpers/mock

This module provides the ability to create spies and mock functions from a Node.js testing environment and inject them into the page context.

## Usage

### How to Create a Spy?

To create a spy, you need to first identify the object you want to spy on. For example, let's say we have a global object `testObject` that has a method `doSomething`, and we want to track how many times this method is called.

Let's break down the steps to achieve this:

1. Get a `handle` for the `testObject`:

   ```typescript
   const testObjHandle = await page.evaluateHandle(() => globalThis.testObject);
   ```

2. Set up a spy on the `doSomething` method:

   ```typescript
   const spy = await createSpy(testObjHandle, (ctx) => jestMock.spy(ctx, 'doSomething'));
   ```

   The first argument to the `createSpy` function is the `handle` of the object on which you want to set up the spy. The second argument is the spy constructor function, which takes the object and the method to monitor. `jestMock` is an object available in the global scope that redirects calls to the `jest-mock` library.

   It's important to note that the constructor function is passed from the Node.js context to the browser context, meaning it will be serialized and converted into a string for transmission to the browser.

3. After setting up the spy, you can access it and, for example, check how many times it has been called:

   ```typescript
   const testObjHandle = await page.evaluateHandle(() => globalThis.testObject);
   const spy = await createSpy(testObjHandle, (ctx) => jestMock.spy(ctx, 'doSomething'));

   await page.evaluate(() => globalThis.testObject.doSomething());

   console.log(await spy.calls); // [[]]
   ```

### How to Create a Spy and Access It Later?

There are cases where a spy is created asynchronously, for example, in response to an event. In such situations, you can access the spy later using the `getSpy` function.

Let's consider the scenario below where a spy is created for the `testObject.doSomething` method during a button click:

```typescript
await page.evaluate(() => {
  const button = document.querySelector('button');

  button.onclick = () => {
    jestMock.spy(globalThis.testObject, 'doSomething');
    globalThis.testObject.doSomething();
  };
});

await page.click('button');

const testObjHandle = await page.evaluateHandle(() => globalThis.testObject);
const spy = await getSpy(testObjHandle, (ctx) => ctx.doSomething);

await page.evaluate(() => globalThis.testObject.doSomething());

console.log(await spy.calls); // [[], []]
```

> While `getSpy` can be replaced with `createSpy`, it is recommended to use `getSpy` for semantic clarity in such cases.

### How to Create a Mock Function?

To create a mock function, use the `createMockFn` function. It will create a mock function and automatically inject it into the page.

```typescript
const mockFn = await createMockFn(page, () => 1);

await page.evaluate(([mock]) => {
  mock();
  mock();

}, <const>[mockFn.handle]);

console.log(await mockFn.calls); // [[], []]
```

### How Does This Work?

#### Mock Functions

A mock function works by converting object representations into strings and then transferring them from Node.js to the browser. For the client, `createMockFn` returns a `SpyObject`, which includes methods for tracking calls, and it also overrides the `toJSON` method. This override is necessary to create a mapping of the mock function's ID to the real function that was previously inserted into the page context.

#### Spy Functions

Unlike mock functions, spy functions do not create anything extra. They are simply attached to a function within the context and return a wrapper with methods that, when called, make requests to the spy for various data.

If you have any further questions or need assistance, please feel free to ask.
