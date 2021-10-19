# V4 component and module testing tools

<img src="cli-large.png" width="100%" alt="Tests in CLI">

## Test environment

* Test runner – [Jasmine](https://jasmine.github.io)
  * Please read the section [asynchronous tests](https://jasmine.github.io/tutorials/async)

* [Playwright](https://playwright.dev/) is used to launch headless browsers

## Creating a test file

First, you need to create the test file itself. Create a folder with the name `test` within your component with an `index.js` file.

```
.
└── src/
  └── base/
    └── b-component/
      ├── test/
      │   └── index.js
      ├── b-component.ss
      ├── b-component.styl
      ├── b-component.ts
      └── index.js
```

## Setting up a test environment

Let's jump in into our test file.

__src/base/b-component/test/index.js__

```javascript
// @ts-check

/**
 * Starts a test
 *
 * @param {Playwright.Page} page
 * @param {object} params
 * @returns {void}
 */
module.exports = (page, {browser, contextOpts}) => {
  // Grab the url from the original page
  const initialUrl = page.url();

  /** @type {Playwright.BrowserContext} */
  let context;

  describe('b-component render', () => {
    beforeEach(async () => {
      // Create a new browser context
      context = await browser.newContext(contextOpts);

      // Create a new page
      page = await context.newPage();

      // Route to the page
      await page.goto(initialUrl, {waitUntil: 'networkidle'});
    });

    afterEach(() => context.close());
  })
}
```

The first thing to pay attention to is that each test file must have a default export - a test run function.

The next step is to describe the first `describe` section.

After the describe section has been created, add a `beforeEach` hook in which presettings will be made for each spec that will be in this and in subsequent `describe` blocks. Read more about hooks in [jasmine documentation](https://jasmine.github.io/).

## Creating components at runtime

We now have a test file in which we have prepared the environment for writing tests. But if now we open the page that we created, it will be empty and there will be no `b-component`.

To create a `b-component`, several helper functions are available in `globalThis` (Only if you built the project in dev mode).
Let's get to know them.

### renderComponents

This function makes it possible to create a component or components on a page at runtime.
First, let's take a look at the signature of this function.


```typescript
export interface RenderParams {
  /**
   * Component attrs
   */
  attrs: Dictionary;

  /** @see [[RenderContent]] */
  content?: Dictionary<RenderContent | string>;
}

/**
 * Content to render into an element
 *
 * @example
 *
 * ```typescript
 * globalThis.renderComponents('b-button', {
 *   attrs: {
 *      testProp: 1
 *   },
 *
 *   content: {
 *     default: {
 *       tag: 'b-button',
 *       content: {
 *         default: 'Test'
 *       }
 *     }
 *   }
 * });
 * \```
 *
 * This schema is the equivalent of such a template:
 *
 * ```ss
 * < b-button :testProp = 1
 *   < b-button
 *     Test
 * \```
 */
export interface RenderContent {
  /**
   * Component name or tagName
   */
  tag: string;

  /**
   * Component attrs
   */
  attrs: Dictionary;

  /** @see [[RenderContent]] */
  content?: Dictionary<RenderContent | string>;
}

/**
 * Renders specified components
 *
 * @param componentName
 * @param scheme
 * @param [options]
 */
declare var renderComponents: (componentName: string, scheme: RenderParams[], options?: RenderOptions) => void;
```

The `schema` contains a list of parameters to render, i.e., each element represents a component to render.

Let's create our component using this function.

```javascript
globalThis.renderComponents('b-component', [{attrs: {id: 'testId'}}]);
```

As a result, we will get the created component inserted into the root element on the page.

### removeCreatedComponents

This method is helpful when you need to remove all of the components that was create via `renderComponents`.

```javascript
globalThis.removeCreatedComponents();
```

## Creating a first spec

Now that we know how to create a component, let's write our first test spec.

__src/base/b-component/test/index.js__
```javascript
  let componentNode;

  describe('b-component', () => {
    beforeEach(async () => {
      // Create a new browser context
      context = await browser.newContext(contextOpts);

      // Create a new page
      page = await context.newPage();

      // Route to the page
      await page.goto(initialUrl, {waitUntil: 'networkidle'});

      // Read more about https://playwright.dev/docs/api/class-page#page-evaluate
      await page.evaluate(() => {
        globalThis.renderComponents('b-component', [{attrs: {id: 'testId'}}]);
      });

      // Read more about waitForSelector https://playwright.dev/docs/api/class-elementhandle#element-handle-wait-for-selector
      componentNode = await page.waitForSelector('#testId', {state: 'attached'})
    });

    it('Should have a `p` tag', async () => {
      await expectAsync(componentNode.waitForSelector('p')).toBeResolved();
    });
  });
```

## Run test

Now that we have added the first spec, we can run the test and check that everything is working correctly.

```bash
npx gulp test:component --runtime-render true --test-entry base/b-component/test
```

The execution result should be something like that:

```bash
-------------
Starting to test
test entry: base/b-component/test
runner: undefined
browser: chrome
-------------

Randomized with seed 61427
Started
.

1 spec, 0 failures
Finished in 0.054 seconds
```

## Specs isolation

One of our tests mustn't affect the state of another; for this, it is worth isolating the specs from each other. This is achieved quite simply, more precisely, in the examples above, we have already achieved this with the help of the `beforeEach` hook and creating a new browser context. `beforeEach` hook will be executed before every spec, so every spec will have its own browser context without any listeners, routes handlers or any other side effects. Don't forget to use `afterEach` hook to close previous browser context.

You can also not create a new context but do everything on one page. In this case, the performance of tests will improve, but this will create other, more severe problems. For example, one spec can affect the state of another, there are a lot of such issues, so it is highly recommended to use a new context for each spec.

## Request handling

There are two approaches that can solve the problem of request handling.

The first is to intercept the request and return a response using the `playwright` and its [route mechanisms](https://playwright.dev/docs/api/class-route#route-request). You can control each request directly from the test, give the any response and modify it as you like. In addition, you can emit any server errors (wrong answer, bad status code, etc.).

The second option is to install mocks at runtime using specially provided v4fire mechanisms. This option is not very flexible. Suppose you need to emit a bad status response code since mocks are compiled and run in runtime - you need to provide an option (in a component or provider) that will allow you to do this. Accordingly, you will have to write a code that will not carry any useful function, but it will be in your codebase, so the tests worked. In addition, if you want to fix the mock, you will have to build the project, but in the case of intercepting requests, you will not.

## Splitting specs

Let's imagine that you have a test file with more than 80 specs.
It may not be very convenient to contain so much code in one file so that you can split this file into several files,
according to logical groups, for example, analytics, events, rendering.

To split one significant test file into several files, let's create a `runners` folder in our test folder and put three files into that folder.

```
.
└── src/
  └── base/
    └── b-component/
      └── test/
        ├── runners/
        │   ├── analytics.js
        │   ├── render.js
        │   └── functional.js
        └── index.js
```

Place your code in runner files and after that in `index.js` file, for the runners to work correctly, you need to call the `getCurrentTest` method in the `index.js` file will launch the current runner (specified in the CLI arguments).

__src/base/b-component/test/index.js__

```javascript
/**
 * @typedef {import('playwright').Page} Page
 */
const
	u = include('tests/utils');

module.exports = (...args) => u.getCurrentTest()(...args);
```

To run the specified runner use `--runner` CLI argument:

```bash
npx gulp test:component --runtime-render true --test-entry base/b-component/test --runner render
```

Also, you can use glob patterns to execute several runners:

```bash
npx gulp test:component --runtime-render true --test-entry base/b-component/test --runner "*"
npx gulp test:component --runtime-render true --test-entry base/b-component/test --runner "**/*"
npx gulp test:component --runtime-render true --test-entry base/b-component/test --runner "behaviour/*"
```

## Testing modules

To test some module or directive, you can add it into the `b-dummy` component or a `demo` page. For example,  the `in-view` directive:

__base/b-dummy/b-dummy.ts__

```typescript
const
  inViewMutation = inViewFactory('mutation'),
  inViewObserver = inViewFactory('observer');

@component()
export default class bDummy extends iData {
  /**
   * Links to directives
   */
  get directives(): Directives {
    return {
      inViewMutation,
      inViewObserver
    };
  }
}
```

Later, you will be able to access modules through the component.

Running a module test using the `in-view` example:

```bash
npx gulp test:component --runtime-render true --test-entry core/dom/in-view/test
```

```javascript
let
  dummyComponent,
  inViewMutation,
  context;

describe('`core/cookies`', () => {
  beforeEach(async () => {
    context = await browser.newContext(contextOpts);
    page = await context.newPage();
    await page.goto(initialUrl, {waitUntil: 'networkidle'});

    dummyComponent = await h.component.waitForComponent(page, '.b-dummy');
    inViewMutation = await dummyComponent.evaluateHandle(({directives: {inViewMutation}}) => inViewMutation);
  });

  afterEach(() => context.close());

  // ...
});  
```

## Run all tests

To run all tests, you need to follow several steps:

1. Create a file `cases.js` in the folder` tests`:

```
.
├── tests/
│   └── cases.js
└── src/
    └── base
```

2. `cases.js` should export an array of strings containing the parameters with which the test should be run.
3. Add your test to this file.
4. Run `npx gulp test:components` command.

__tests/cases.js__

```javascript
module.exports = [
  // b-router
  '--test-entry base/b-router/test',

  // b-virtual-scroll
  '--test-entry base/b-virtual-scroll/test --runner slots/empty',

  // b-button
  '--test-entry form/b-button/test',

  // in-view
  '--test-entry core/dom/in-view/test'
];
```

## Test arguments

Build a `demo` and then run the test located at the specified `test-entry`:

```bash
npx gulp test:component --runtime-render true --test-entry base/b-popover/test
```

Run (without building) the test located at `test-entry`:

```bash
npx gulp test:component:run --runtime-render true --test-entry base/b-popover/test
```

Run (without building) the test located at the `test-entry` address only in the `chromium` browser:

```bash
npx gulp test:component:run --runtime-render true --test-entry base/b-popover/test --browsers chromium
```

Run all tests defined in `cwd/tests/cases.js`:

```bash
npx gulp test:components
```

Runs all tests defined in `cwd/tests/cases.js`, maximum 4 builds, and two tests can be run in parallel:

```bash
npx gulp test:components --test-processes 2 --build-processes 4
```

## Test Writing Guidelines

### Nesting

### Keep it clean

### Auto wait
