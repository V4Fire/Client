# V4Fire testing tools

- [Test environment](#test-environment)
- [Setting up a test environment](#setting-up-a-test-environment)
- [Prepare runtime for tests](#prepare-runtime-for-tests)
- [First test](#first-test)
- [Run a test](#run-a-test)
- [Creating components at runtime](#creating-components-at-runtime)
  - [`Component.createComponent`](#componentcreatecomponent)

## Test environment

* [Playwright](https://playwright.dev/)

## Setting up a test environment

First step for setting up a test environment is creating a [configuration file](https://playwright.dev/docs/test-configuration) and inheriting base configuration from V4fire.

__tests/config/unit/index.ts__
```typescript
import superConfig from '@v4fire/client/tests/config/unit';

export default superConfig;
```

Next step is a test server which will be started by the `playwright`. This server will be serve a static files for tests. V4Fire provides a base server configuration, this configuration can be inherited:

__tests/server/index.ts__
```typescript
import '@v4fire/client/tests/server';
```

It is not necessary to use the server configuration from V4Fire, there are no restrictions on creating your own server, but there are important points to consider:

1. The server must be able to serve static files;
2. By default, the `playwright` server configuration file uses the `TEST_PORT` environment variable, based on which the [baseURL](https://playwright.dev/docs/api/class-testoptions#test-options-base-url) is generated for testing.

Base config file for tests:

__@v4fire/client/tests/server/config.ts__

```typescript
import { build } from '@config/config';

const webServerConfig: WebServerConfig = {
  port: build.testPort,
  reuseExistingServer: true,
  command: 'npm run test:server'
};
```

> Notice that the server will be started via `npm run test:server` command.

## Prepare runtime for tests

In order to run the test, you need to prepare a runtime environment:

1. Create a test page. In order to do that you can create demo page or reuse V4Fire demo page `@v4fire/client/pages/p-v4-components-demo`. Create an `entry point` for that page or add it to existing `entry point`. Do not forget to cut the demo page using `monic` directives so that the demo page does not get into the production build.

2. Specify the name of the demo page in the project config `config/default#build.demoPage` (by default `p-v4-components-demo`);

3. Add your component to the demo page dependencies that you plan to test;

__pages/p-v4-components-demo/index.js__
```javascript
package('p-v4-components-demo')
	.extends('i-static-page')
	.dependencies(
		'b-component'
	);
```

4. Compile the project `npx webpack`.

## First test

All preparations are done, now you need to create the test file itself, let's place the test file in the `b-component/test/unit` folder.

```
.
└── b-component/
  └── test/
    └── unit/
      └── functional.ts
```

__test/unit/functional.ts__

```typescript
import test from 'tests/config/unit/test';

test.describe('Some test', () => {
	test('opens the demo page', ({page, baseURL}) => {
		await page.goto(`${baseURL}/p-v4-components-demo.html`);

		const
			root = await page.waitForSelector('#root-component');

		test.expect(root).toBeTruthy();
	});
});
```

> Pay attention to the import of the `test` module, it is not imported from `@playwright/test`, but from a file prepared in advance. This is necessary to be able to expand specs with [fixture](https://playwright.dev/docs/api/class-fixtures).

Navigating with `${baseURL}/p-v4-components-demo.html` is awkward, this is where [`fixture`](https://playwright.dev/docs/api/class-fixtures) comes into play.

Let's rewrite this test using a `fixture`:

__test/unit/functional.ts__

```typescript
import test from 'tests/config/unit/test';

test.describe('Some test', () => {
	test('opens the demo page', ({demoPage, page}) => {
		await demoPage.goto();

		const
			root = await page.waitForSelector('#root-component');

		test.expect(root).toBeTruthy();
	});
});
```

V4Fire provides a standard `fixture` which is designed to make it easier to work with the demo page, one of the methods is to navigate to this page. Under the hood, this method takes `baseURL` which provides `playwright`, the name of the demo page from the config, and then navigates to that URL.

```typescript
class DemoPage {
  /**
   * Opens a demo page
   */
  async goto(): Promise<DemoPage> {
    await this.page.goto(concatURLs(this.baseUrl, `${build.demoPage}.html`), {waitUntil: 'networkidle'});
    await this.page.waitForSelector('#root-component', {state: 'attached'});

    return this;
  }
}
```

> You are free to overwrite/remove/extend this `fixture` in your project, [more about `fixture`](https://playwright.dev/docs/test-fixtures).

##  Run a test

To run `typescript` scripts in `nodejs` you need to include [`tsnode`](https://www.npmjs.com/package/ts-node). V4Fire provides a script that initializes `tsnode`. The most convenient way to execute this script is with the `NODE_OPTIONS` environment variable and the `-r` flag.

```
npx cross-env NODE_OPTIONS=\"-r @v4fire/core/build/tsnode.js\" playwright test --config tests/config/unit/index.ts
```

Make sure you specify the path to the config in the `--config` parameter.

It should be noted that such a call is too cumbersome and constantly writing so much text is inconvenient. To avoid this, I recommend adding this call to the `script` section of the `package.json` file.

__package.json__

```
"scripts": {
  "test:unit": "cross-env NODE_OPTIONS=\"-r @v4fire/core/build/tsnode.js\" playwright test --config tests/config/unit/index.ts"
}
```

## Creating components at runtime

Now we have a test file, a test page, and a command to run tests. But at the moment, when you go to the demo page, it will be empty and there will be no components on it.

In order to render a new component, V4Fire provides an API that allows you to render any component included in the bundle.

> Make sure you add the components you want to test to the bundle, for example by adding a dependency to the component's `index.js`.

### `Component.createComponent`

This function allows you to create components at runtime. Let's use it and create a new component for testing.

__test/unit/functional.ts__
```typescript
import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

import type bComponent from 'base/b-component/b-component';

test.describe('b-component functional test', () => {
  let
    bComponent: JSHandle<bComponent>;

  test.beforeEach(({demoPage, page}) => {
    await demoPage.goto();

    bComponent = await Component.createComponent(page, 'b-component', {
      attrs: {
        someProp: 1,
        someFnProp: () => 1
      }
    });
  });

  test('Component has a correct name', () => {
    const
      name = await bComponent.evaluate((ctx) => ctx.componentName);

    test.expect(name).toBe('b-component');
  });
});
```
