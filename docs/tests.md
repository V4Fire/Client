
# V4 component and module testing tools

<img src="assets/tests/cli.png" height="343.5">

## Test environment

* Test runner – [Jasmine](https://jasmine.github.io)
  * I recommend that you read a section about [asynchronous tests](https://jasmine.github.io/tutorials/async)

* [Playwright](https://playwright.dev/) is used to launch headless browsers


## Creating a test file

First, you need to create the test file itself. In the component folder create the `test` folder and in it create the` index.js` file.

## Setting up the test environment

To prepare the environment for tests, you need to make a preliminary configuration:

* Enable mocks;
* Allow geolocation;
* etc.

There is a special function `h.utils.setup` for this, open the file` index.js` and call this function:

__base/b-popover/test/index.js__

```javascript
// @ts-check
const
	h = include('tests/helpers');

/**
 * @param {Playwright.Page} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);
};
```

> Note the `// @ ts-check` – thanks to this directive works static code analysis in javascript files.

After that, mocks will be enabled in your environment and permission to use the geolocation will be given, also `h.utils.setup` takes the third argument options to configure environment.

## Creating components at runtime

The first step to create your component during test execution is to add the component as a dependency for the demo page:

__pages/p-demo-page/index.js__

```javascript
package('p-v4-components-demo')
	.extends('i-root')
	.dependencies(
		'b-popover'
	);
```

In order to create a component, a special method `renderComponents` has been added to the global scope.
The `renderComponents` method has the following signature:

```typescript
/**
 * Renders specified components
 *
 * @param componentName
 * @param scheme
 * @param options
 */
renderComponents: (componentName: string, scheme: RenderParams[], options?: RenderOptions) => void
```

As you can see from the signature when the method is called, `scheme` is expected, this is the scheme by which the component or components will be rendered.

Let's draw our first component on the page, first of all create a render.js file in which we will place the rendering scheme.

__base/b-popover/test/render.js__
```javascript
module.exports = [
	{
		attrs: {
			id: 'without-slots'
		}
	}
];
```

Let's import this file to our main test file and call render:

__base/b-popover/test/index.js__
```javascript
// @ts-check
const
	h = include('tests/helpers');

const
	renders = include('src/base/b-popover/test/render.js');
/**
 * @param {Playwright.Page} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	await page.evaluate((scheme) => {
		globalThis.renderComponents('b-popover', scheme);
	}, scheme);

	const
		bPopover = await h.component.getComponentById(page, 'without-slots');
};
```

The `b-popover` component is now in the DOM tree and ready for interaction.

> Note that the component may not be in a ready state, that is, `globalThis.renderComponents` creates a component and immediately places it in the DOM tree, without waiting for the ready status or anything else.

After creating the component, you can directly start testing, let's create the first spec.

__base/b-popover/test/index.js__
```javascript
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	await page.evaluate((scheme) => {
		globalThis.renderComponents('b-popover', scheme);
	}, scheme);

	const
		bPopover = await h.component.getComponentById(page, 'without-slots');

	describe('bPopover', () => {
		it('has correct componentName', async () => {
			const componentName = await bPopover.evaluate((ctx) => ctx.componentName);
			expect(componentName).toBe('b-popover');
		});
	});
};
```

> At this stage, the test can be run, but we will talk about this a little later, and now we will continue to write the test.

Each spec runs on the same page, no automatic state updates are provided, so it's always worth keeping in mind that updating the state of the components on the page is in your hands.

For updating the state of components, you can use several approaches for your taste (but I would recommend a manual reset, since it is faster), let's look at each of them separately:

* `Manual reset` – this method involves manually clearing the state of the components on the page, for example, in the `beforeEach` hook.
* `Page reload` – this method involves reloading the page, as a result of which the page state will be "clean" every time.

Let's write a second spec in our test and add refreshing the components on the page using the `manual reset` strategy.

__base/b-popover/test/index.js__
```javascript
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	let
		bPopover,
		bPopoverNode;

	beforeEach(async () => {
		await page.evaluate((scheme) => {
			globalThis.removeCreatedComponents();
			globalThis.renderComponents('b-popover', scheme);
		}, scheme);

		bPopover = await h.component.getComponentById(page, 'without-slots'),
		bPopoverNode = await page.$('#without-slots');
	});

	describe('bPopover', () => {
		it('has correct componentName', async () => {
			const componentName = await bPopover.evaluate((ctx) => ctx.componentName);
			expect(componentName).toBe('b-popover');
		});

		it('shown when calling `open`', async () => {
			await bPopover.evaluate((ctx) => ctx.open());
			expect(await bPopoverNode.evaluate((ctx) => ctx.style.display)).not.toBe('none');
		});
	});
};
```

Let's take a look at what happens in the code above, as you can see the `beforeEach` hook has been added, this hook calls 2 methods from the global scope of the page.

1. `beforeEach` hook is executed before each spec in the test.
2. `removeCreatedComponents` removes all components from the page that were created using the` renderComponents` method.
3. `renderComponents` creates a new component and places it on the page.

Thus, we have a new component for each spec.

Let's finally run our first test:

```bash
npx gulp test:component --runtime-render true --test-entry base/b-popover/test
```

The execution result should be:

```bash
-------------
Starting to test
env component: b-dummy
test entry: base/b-popover/test
runner: undefined
browser: firefox
-------------

Randomized with seed 61427
Started
..

2 spec, 0 failures
Finished in 0.054 seconds
```

## Working with a pre-prepared component

Above we looked at the way to create components at runtime, but there is also a way that is mainly used to create `demo` component pages.

This method allows you to get a page into a test with a ready-made component, for this you need to create a file `demo.js` and place a scheme for rendering in it:

__base/b-popover/demo.js__
```javascript
const demo = [
	{
		attrs: {
			id: 'target'
		}
	}
];
const analytics = [
	{
		attrs: {
			':redirect': '() => false',
			id: 'target'
		}
	},
	{
		attrs: {
			':redirect': '() => false',
			':theme': s('demo'),
			id: 'without-slots'
		}
	}
];
const suits = {
	demo,
	analytics
};
```

Such a file can have several different suits, according to these suits (depending on the passed parameter `suit`, components in the` demo` page will be generated.

> Note that this schema format is different from the schema format in `renderComponents`.

You can get a component in a test as follows:

__base/b-popover/test/index.js__
```javascript
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	const
		bPopover = await h.component.getComponentById(page, 'without-slots');

	describe('bPopover', () => {
		it('has correct componentName', async () => {
			const componentName = await bPopover.evaluate((ctx) => ctx.componentName);
			expect(componentName).toBe('b-popover');
		});
	});
};
```

> Please note that the component is not removed or cleared between specs, the management of this completely falls on the shoulders of a developer.

Run test:

```bash
npx gulp test:component --name b-popover --suit demo
```

## Testing modules

To test some module or directive, you can add it to the `b-dummy` component or to the` demo` page, for example, like this, the `in-view` directive is added to this component:

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

Later, in tests, you will be able to access modules through this component.

Running a module test using the `in-view` example:

```bash
npx gulp test:component --name b-dummy --test-entry core/dom/in-view/test
```


## Running tests with different options

Build a `demo` page with a component and attributes from` suit: demo`, and then run the test located at `b-popover/test.js` or` b-popover/test/index.js`:

```bash
npx gulp test:component --name b-popover --suit demo
```

Build a `demo` page with `b-dummy` and then run the test that is located at the specified `test-entry`:

```bash
npx gulp test:component --runtime-render true --test-entry base/b-popover/test
```

Will run (without building) the test located at `test-entry`:

```bash
npx gulp test:component:run --runtime-render true --test-entry base/b-popover/test
```

Will run (without building) the test located at the `test-entry` address only in the `chromium` browser:

```bash
npx gulp test:component:run --runtime-render true --test-entry base/b-popover/test --browsers chromium
```

Run all tests defined in `cwd/tests/cases.js`:

```bash
npx gulp test:components
```

Runs all tests that are defined in `cwd / tests / cases.js`, maximum 4 builds and 2 tests can be run in parallel:

```bash
npx gulp test:components --test-processes 2 --build-processes 4
```

To make your test run during the call to `test: components`, you need to add it to the file with test cases, this file is located in` cwd/tests/cases.js`, it looks something like this:

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

`cases.js` should export an array of strings containing the parameters with which the test should be run.

> Please note that neither `name` nor `runtime-render` appears anywhere, this is due to the fact that when calling `test:components` all test parameters are checked, and if the test does not have a` --name` parameter, the `--runtime-render true` will be set
