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

The first thing to pay attention to is that each test file must have the default export - a test run function.

The next step is to describe the first `describe` section.

After creating the describe section, add a `beforeEach` hook in which pre-settings will be made for each spec in this and subsequent `describe` blocks.
Read more about hooks in [jasmine documentation](https://jasmine.github.io/).

## Creating components at runtime

We now have a test file in which we have prepared the environment for writing tests.
But if now we open the page that we created, it will be empty, and there will be no `b-component`.

To create a new component, you should use several global helpers are available in `globalThis` (Only if you built the project in dev mode).
Let's get to know them.

Also, make sure you add your component to the `index.js` file of the demo page so that your component gets into the
bundle and can be created using the helper functions.

### renderComponents

This function makes it possible to create components on a page at runtime.
But, first, let's take a look at the signature of this function.

````typescript
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
 * ```
 *
 * This schema is the equivalent of such a template:
 *
 * ```ss
 * < b-button :testProp = 1
 *   < b-button
 *     Test
 * ```
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
 * Renders the specified components
 *
 * @param componentName
 * @param scheme
 * @param [opts]
 */
declare var renderComponents: (componentName: string, scheme: RenderParams[], opts?: RenderOptions) => void;
````

The `schema` contains a list of parameters to render, i.e., each element represents a component to render.

Let's create our component using this function.

```javascript
globalThis.renderComponents('b-component', [{attrs: {id: 'testId'}}]);
```

As the result, we will get the created component inserted into the root element on the page.

### removeCreatedComponents

This method is helpful when you need to remove all components created via `renderComponents`.

```javascript
globalThis.removeCreatedComponents();
```

## Creating a first spec

Now that we know how to create a component let's write our first test spec.

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

## Run a test

Now that we have added the first spec, we can test and check that everything is working correctly.

```bash
npx gulp test:component --test-entry base/b-component/test
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

One of our tests mustn't affect the state of another test. To implement this, it is worth isolating the specs from each other.
We have already achieved this with the help of the `beforeEach` hook and creating a new browser context.
The `beforeEach` hook will be executed before every spec to have its browser context without any listeners, routes handlers, or other side effects.
Finally, don't forget to use the `afterEach` hook to close the previous browser context.

You can also not create a new context but do everything on one page. In this case, the performance of tests will improve,
but this will create other, more severe problems. For example, one spec can affect the state of another, there are a lot of
such issues, so it is highly recommended use a new context for each spec.

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

Place your code in runner files, and after that in the `index.js` file, for the runners to work correctly, you need to call the `getCurrentTest` method in the `index.js` file to launch the current runner (specified in the CLI arguments).

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
npx gulp test:component --test-entry base/b-component/test --runner render
```

Also, you can use glob patterns to execute several runners:

```bash
npx gulp test:component --test-entry base/b-component/test --runner "*"
npx gulp test:component --test-entry base/b-component/test --runner "**/*"
npx gulp test:component --test-entry base/b-component/test --runner "behaviour/*"
```

## Demo page

To test a component, we need to place it on the page.
There is a special demo page `p-v4-components-demo` for tests, but nothing prevents you from overriding it or creating your own.
If you decide to use your page, you should override the `build.demoPage` config parameter.

## Testing modules

You can add it into the `b-dummy` component or a `demo` page to test some module or directive.
For example,  the `in-view` directive:

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
npx gulp test:component --test-entry core/dom/in-view/test
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
npx gulp test:component --test-entry base/b-component/test
```

Run (without building) the test located at `test-entry`:

```bash
npx gulp test:component:run --test-entry base/b-component/test
```

Run (without building) the test located at the `test-entry` address only in the `chromium` browser:

```bash
npx gulp test:component:run --test-entry base/b-component/test --browsers chromium
```

Run all tests defined in `cwd/tests/cases.js`:

```bash
npx gulp test:components
```

Runs all tests defined in `cwd/tests/cases.js`, maximum 4 builds, and two tests can be run in parallel:

```bash
npx gulp test:components --test-processes 2 --build-processes 4
```

## Test writing guidelines

### Request handling

Two approaches can solve the problem of request handling.

The first is to intercept the request and return a response using the Playwright and its [route mechanisms](https://playwright.dev/docs/api/class-route#route-request). After that, you can control each request directly from the test,
give any response and modify it as you like. In addition, you can emit any server errors (wrong answer, harmful status code, etc.).

The second option is to install mocks at runtime using specially provided v4fire mechanisms. This option is not very flexible.
Suppose you need to emit a bad response status code since mocks are compiled and run in runtime - you need to provide an option (in a component or provider) that will allow you to do this. Accordingly, you will have to write a code that will not carry any useful function,
but it will be in your codebase, so the tests worked. In addition, if you want to fix the mock, you will have to build the project,
but in the case of intercepting requests, you will not.

### Nesting

To make the specs cleaner and easier to understand, they must contain as little code as possible.
This can be achieved with `hooks` and `describe` sections.

Let's see this with an example:

```javascript
describe('b-component test', () => {
  it('On user click should hide a button and show a tooltip', async () => {
    await renderComponent({
      propsToPrepareComponentForClick: true,
      anotherProp: false
    });

    await page.click('.b-component button');

    const
      buttonHidePr = page.waitForSelector('.b-component button', {state: 'detached'});

    await expectAsync(buttonHidePr).toBeResolved();

    const
      tooltip = page.waitForSelector('.b-tooltip');

    await expectAsync(tooltip).toBeResolved();
  })
});
```

Looks pretty good, agree? But let's add two more specs in which the user also clicks on the component:

```javascript
describe('b-component test', () => {
  it('On user click should hide a button and show a tooltip', async () => {
    await renderComponent({
      propsToPrepareComponentForClick: true,
      anotherProp: false
    });

    await page.click('.b-component button');

    const
      buttonHidePr = page.waitForSelector('.b-component button', {state: 'detached'});

    await expectAsync(buttonHidePr).toBeResolved();

    const
      tooltip = page.waitForSelector('.b-tooltip');

    await expectAsync(tooltip).toBeResolved();
  });

  it('On user click should not hide a button text', async () => {
    await renderComponent({
      propsToPrepareComponentForClick: true,
      anotherProp: false
    });

    await page.click('.b-component button');

    const
      textAttachedPr =  page.waitForSelector('.b-component p');

    await expectAsync(textAttachedPr).toBeResolved();
  });

  it('On user click should add a modifier to the component', async () => {
    await renderComponent({
      propsToPrepareComponentForClick: true,
      anotherProp: false
    });

    await page.click('.b-component button');

    const
      componentWithMod = page.waitForSelector('.b-component.b-component_clicked_true');

    await expectAsync(componentWithMod).toBeResolved();
  });
});
```

As you can see, we do the same thing for every spec, create a component and click on it.
We also get lucky, and in our case, we don't have a lot of the code for preparing spec,
but when refactoring, we will have to correct three places, and besides, this unnecessarily inflates the spec code very much.

Let's rewrite our code using `hooks` and nesting.

```javascript
describe('b-component test', () => {
  describe('User clicks on the component', () => {
    beforeEach(async () => {
      await renderComponent({
        propsToPrepareComponentForClick: true,
        anotherProp: false
      });

      await page.click('.b-component button');
    });

    it('Should hide a button and show a tooltip', async () => {
      const
        buttonHidePr = page.waitForSelector('.b-component button', {state: 'detached'});

      await expectAsync(buttonHidePr).toBeResolved();

      const
        tooltip = page.waitForSelector('.b-tooltip');

      await expectAsync(tooltip).toBeResolved();
    });

    it('Should not hide a button text', async () => {
      const
        textAttachedPr =  page.waitForSelector('.b-component p');

      await expectAsync(textAttachedPr).toBeResolved();
    });

    it('Should add a modifier to the component', async () => {
      const
        componentWithMod = page.waitForSelector('.b-component.b-component_clicked_true');

      await expectAsync(componentWithMod).toBeResolved();
    });
  });
});
```

When the spec setting is placed in the hook, specs contain only the test itself and no pre-settings.

### Auto wait

The Playwright has many tools and mechanisms that make it much easier to write tests and reduce the amount of code that needs to be written. One of such mechanisms is auto wait.
For example, the click method waits for the element with the passed selector to appear in the DOM tree when it is available on the screen, and [much more](https://playwright.dev/docs/input#mouse-click).

Let's take a closer look:

```javascript
describe('b-component test', () => {
  // Of course, I would not recommend doing such specs, but we will use it for the example
  it('Click on the first button show the second button, click on the second button shows a tooltip', async () => {
    const
      button1 = await page.waitForSelector('.button-1');

    await button1.click();

    const
      button2 = await page.waitForSelector('.button-2');

    await button2.click();

    await expectAsync(page.waitForSelector('.b-tooltip')).toBeResolved();
  });
});
```

As you can see from the example above, we have to wait for each element using `waitForSelector` and only then click.
This example can be rewritten by getting rid of `waitForSelector` since the `click` itself waits for the element to appear in the `DOM` tree.

```javascript
describe('b-component test', () => {
  // Of course, I would not recommend doing such specs, but we will use it for the example
  it('Click on the first button show the second button, click on the second button shows a tooltip', async () => {
    await Promise.all([
      page.click('.button-1'),
      page.click('.button-2')
    ])

    await expectAsync(page.waitForSelector('.b-tooltip')).toBeResolved();
  });
});
```

### Flappy test prevention

The heading also may be titled as "Why you should always use wait".

It is very important always to use wait-like functions to get DOM nodes or something like that.
Even if you think "yes 100% it is already in the DOM" - you cannot know for sure.
There are too many links in this chain.

Therefore, I highly recommend that you always use the wait-based API when writing tests.
Auto wait functions will save you from stupid mistakes that will be very difficult to debug,
and it will be complicated when such a flap will be reproduced only in your CI, and everything will be fine locally.

### Keep it clean

As mentioned earlier, for easy refactoring, reading, and rewriting tests, try to keep the specs (and tests in general) as clean as possible, treat them like your production codebase.

Here are some tips to help you achieve this:

- Use the auto-wait API
- Use the interceptions and routing mechanism provided by Playwright
- Use hooks and nesting to keep your specs clean
