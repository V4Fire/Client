# V4Fire testing tools <!-- omit in toc -->

- [Summary](#summary)
- [Getting Started](#getting-started)
- [UI unit tests](#ui-unit-tests)
  - [Create a test](#create-a-test)
- [Writing tests in your project](#writing-tests-in-your-project)
  - [Set up a test environment](#set-up-a-test-environment)
  - [Prepare runtime for tests](#prepare-runtime-for-tests)
  - [Run a test](#run-a-test)
  - [Creating components at the runtime](#creating-components-at-the-runtime)
- [Configuring different tests](#configuring-different-tests)
  - [Unit tests](#unit-tests)
  - [Project tests (e2e)](#project-tests-e2e)
- [CLI flags](#cli-flags)

## Summary

We are using [Playwright](https://playwright.dev/) framework to write unit and e2e tests for the UI and [Jest](https://jestjs.io/) to test non-UI things.

## Getting Started

1. Generate the tsconfig `npm run build:tsconfig`
2. Build the project in the watch mode `npm run dev`
3. Open another terminal instance and run:
    - `npm run test:unit` (UI unit tests)
    - `npm run test:jest` (other unit tests)

## UI unit tests

### Create a test

Let's say you want to test a component named the `b-component`. Create the test file in the `b-component/test/unit` folder.

```
.
└── b-component/
  └── test/
    └── unit/
      └── main.ts
```

The file is named `main.ts`, because it tests main use-cases of the component.

__test/unit/main.ts__

```typescript
import test from 'tests/config/unit/test';

test.describe('<b-component>', () => {
	test('opens the demo page', ({demoPage, page}) => {
		await demoPage.goto();

		const root = await page.waitForSelector('#root-component');

		test.expect(root).toBeTruthy();
	});
});
```

> Pay attention to the import of the `test` module, it is not imported from `@playwright/test`, but from a file prepared in advance. This is necessary to be able to expand specs with [fixture](https://playwright.dev/docs/api/class-fixtures). You also can override
export of the `test` module and extend it with yours fixtures.

V4Fire provides a standard `fixture` named `demoPage` which is designed to make it easier to work with the demo page, one of the methods is to navigate to this page. Under the hood, this method takes `baseURL` which provides `playwright`, the name of the demo page from the config, and then navigates to that URL.

```typescript
import { build } from '@config/config';

class DemoPage {
  /**
   * Opens a demo page
   */
	async goto(): Promise<DemoPage> {
		await this.page.goto(concatURLs(this.baseUrl, `${build.demoPage()}.html`), {waitUntil: 'networkidle'});
		await this.page.waitForSelector('#root-component', {state: 'attached'});

		return this;
	}
}
```

> You are free to overwrite/remove/extend this `fixture` in your project, [more about `fixture`](https://playwright.dev/docs/test-fixtures).


## Writing tests in your project

### Set up a test environment

Firstly, create a [configuration file](https://playwright.dev/docs/test-configuration) and inherit the base configuration from V4fire.

__tests/config/unit/index.ts__
```typescript
import type { PlaywrightTestConfig } from '@playwright/test';

import superConfig from '@v4fire/client/tests/config/unit';

const config: PlaywrightTestConfig = {
	...superConfig,
  // Add your custom configuration rules
};

export default config;
```

Next, set up a test server, which will be initiated by the `Playwright`. This server will serve static files for tests. V4Fire provides a base server configuration that can be inherited:

__tests/server/index.ts__
```typescript
import '@v4fire/client/tests/server';
```

It is not necessary to use the server from V4Fire. You can create your own server. However, there are important points to keep in mind:

1. The server must be capable of serving static files.
2. By default, the `Playwright` server configuration file uses the `TEST_PORT` environment variable, based on which the [baseURL](https://playwright.dev/docs/api/class-testoptions#test-options-base-url) is generated for testing.

The default server configuration:

__@v4fire/client/tests/server/config.ts__

```typescript
import { build } from '@config/config';

import type { Config } from '@playwright/test';

type NotArray<T> = T extends any[] ? never : T;
type WebServerConfig = NonNullable<NotArray<Config['webServer']>>;

const webServerConfig: WebServerConfig = {
	port: build.testPort,
	reuseExistingServer: true,
	command: 'yarn test:server',
	cwd: process.cwd()
};

export default webServerConfig;
```

> Notice that the server will be started via `npm run test:server` command.

### Prepare runtime for tests

In order to run the test, you need to prepare a runtime environment:

1. Create a test page. In order to do that you can create demo page or reuse V4Fire demo page `@v4fire/client/components/pages/p-v4-components-demo`. Create an `entry point` in `src/entries` for that page or add it to existing `entry point`. Do not forget to cut the demo page using `monic` directives so that the demo page does not get into the production build.

2. Specify the name of the demo page in the project config `config/default#build.demoPage` (by default `p-v4-components-demo`);

3. Add your component to the demo page dependencies that you plan to test;

__components/pages/p-v4-components-demo/index.js__
```javascript
package('p-v4-components-demo')
	.extends('i-static-page')
	.dependencies(
		'b-component'
	);
```

### Run a test

To run `typescript` scripts in `nodejs` you need to include [`tsnode`](https://www.npmjs.com/package/ts-node). V4Fire provides a script that initializes `tsnode`. The most convenient way to execute this script is with the `NODE_OPTIONS` environment variable and the `-r` flag.

```
npx cross-env NODE_OPTIONS=\"-r @v4fire/core/build/tsnode.js\" playwright test --config tests/config/unit/index.ts
```

Make sure you specify the path to the config in the `--config` parameter. It is recommended to create a npm `script` for this command in `package.json`:

__package.json__

```JSON
"scripts": {
  "test:unit": "cross-env NODE_OPTIONS=\"-r @v4fire/core/build/tsnode.js\" playwright test --config tests/config/unit/index.ts"
}
```

### Creating components at the runtime

Now we have a test file, a test page, and a command to run tests. But at the moment, when you go to the demo page, it will be empty and there will be no components on it.

In order to render a new component, V4Fire provides an API that allows you to render any component included in the bundle.

Make sure you add the components you want to test to the bundle, for example by adding a dependency to the component's `index.js`.

```javascript
package('p-v4-components-demo')
	.extends('i-static-page')
	.dependencies(
		'b-component-that-you-wanna-to-create-in-runtime'
	);
```

__`Component.createComponent`__

This function allows you to create components at runtime. Let's use it and create a new component for testing.

__test/unit/functional.ts__
```typescript
import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';

import type bComponent from 'base/b-component/b-component';

test.describe('<b-component>', () => {
  let target: JSHandle<bComponent>;

  test.beforeEach(({demoPage, page}) => {
    await demoPage.goto();

    target = await Component.createComponent(page, 'b-component', {
      attrs: {
        someProp: 1,
        someFnProp: () => 1
      }
    });
  });

  test('component has a correct name', () => {
    const name = await target.evaluate((ctx) => ctx.componentName);

    test.expect(name).toBe('b-component');
  });
});
```

## Configuring different tests

V4fire provides two configuration files by default.

### Unit tests

```typescript
const config: PlaywrightTestConfig = {
  ...superConfig,

  name: 'unit',

  testMatch: ['src/**/test/unit/**/*.ts'],

  globalSetup: require.resolve('tests/config/unit/setup')
};
```

When using this configuration file when running tests - the tests will be searched in the `unit` folder, all files with the extension `.ts` will be imported when the tests are run.

This configuration is suggested for running unit (components, modules) tests.

### Project tests (e2e)

```typescript
const config: PlaywrightTestConfig = {
  ...superConfig,

  name: 'project',

  testMatch: ['src/**/test/project/**/*.ts'],

  globalSetup: require.resolve('tests/config/project/setup')
};

```

When using this configuration file when running tests - the tests will be searched in the `project` folder, all files with the extension `.ts` will be imported when the tests are run.

This configuration is suggested for running project (e2e) tests.

More about configuration file: https://playwright.dev/docs/test-configuration.

## CLI flags

Run tests:

```
npm run test:unit
```

Run tests with headed browser:

```
npm run test:unit -- --headed
```

Run tests in debug mode:

```
npm run test:unit -- --debug
```

Run tests that only has `functional` substring in path:

```
npm run test:unit -- --grep functional
```

Run project tests:

```
npx cross-env NODE_OPTIONS="-r @v4fire/core/build/tsnode.js" playwright --config tests/config/project/index.ts
```

With npm script and `yarn`:

```
yarn test:unit --headed
```

More about CLI flags:

https://playwright.dev/docs/test-cli
