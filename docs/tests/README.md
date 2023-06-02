# V4Fire testing tools <!-- omit in toc -->

- [Summary](#summary)
- [Getting Started](#getting-started)
- [UI Unit Tests](#ui-unit-tests)
  - [Create a Test](#create-a-test)
- [Writing tests in your project](#writing-tests-in-your-project)
  - [Set up a test environment](#set-up-a-test-environment)
  - [Prepare runtime for tests](#prepare-runtime-for-tests)
  - [Run a test](#run-a-test)
  - [Creating components at the runtime](#creating-components-at-the-runtime)
- [Configuring different tests](#configuring-different-tests)
  - [Unit tests](#unit-tests)
  - [Project tests (e2e)](#project-tests-e2e)
- [Testing helpers](#testing-helpers)
- [CLI flags](#cli-flags)
- [Extra](#extra)

## Summary

We use the [Playwright](https://playwright.dev/) framework for writing unit and e2e tests for the UI, and [Jest](https://jestjs.io/) for testing non-UI modules.

## Getting Started

1. Generate the tsconfig using `npm run build:tsconfig`
2. Build the project in watch mode using `npm run dev`
3. Open another terminal instance and run:
   - `npm run test:unit` (UI unit tests)
   - `npm run test:jest` (other unit tests)

## UI Unit Tests

### Create a Test

Suppose you want to test a component named `b-component`. Create the test file in the `b-component/test/unit` folder.

```
.
└── b-component/
  └── test/
    └── unit/
      └── main.ts
```

The file is named `main.ts` because it tests the main use-cases of the component.

**test/unit/main.ts**

```typescript
import test from 'tests/config/unit/test';

test.describe('<b-component>', () => {
  test('should open the demo page', async ({demoPage, page}) => {
    await demoPage.goto();

    const root = await page.waitForSelector('#root-component');

    test.expect(root).toBeTruthy();
  });
});
```

> Pay attention to the import of the `test` module: it is not imported from `@playwright/test`, but from a file prepared in advance. This is necessary to add custom [fixtures](https://playwright.dev/docs/api/class-fixtures). You can override the export of the `test` module and extend it with your fixtures.

V4Fire provides a standard `fixture` named `demoPage`, which makes it easier to work with the demo page. It has `goto` method, which navigates the browser to the demo page. Under the hood, this method concatenates the `baseURL` which provides `playwright`, the name of the demo page from the config, and then navigates to the resulting URL.

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

> You are free to override or extend this `fixture` in your project, [more about `fixtures`](https://playwright.dev/docs/test-fixtures).


## Writing tests in your project

### Set up a test environment

Firstly, create a [configuration file](https://playwright.dev/docs/test-configuration) and inherit the base configuration from V4fire.

**tests/config/unit/index.ts**
```typescript
import type { PlaywrightTestConfig } from '@playwright/test';

import superConfig from '@v4fire/client/tests/config/unit';

const config: PlaywrightTestConfig = {
	...superConfig,
  // Add your custom configuration rules
};

export default config;
```

Next, set up a test server, which will be initiated by the `Playwright`. This server will serve static files for tests. V4Fire provides a basic server implementation that can be inherited:

**tests/server/index.ts**
```typescript
import '@v4fire/client/tests/server';
```

It is not necessary to use the server from V4Fire. You can create your own server. However, there are important points to keep in mind:

1. The server must be capable of serving static files.
2. By default, the `Playwright` server configuration file uses the `TEST_PORT` environment variable. The [baseURL](https://playwright.dev/docs/api/class-testoptions#test-options-base-url) is generated using this environment variable.

The default server configuration:

**@v4fire/client/tests/server/config.ts**

```typescript
import { build } from '@config/config';

import type { Config } from '@playwright/test';

type NotArray<T> = T extends any[] ? never : T;
type WebServerConfig = NonNullable<NotArray<Config['webServer']>>;

const webServerConfig: WebServerConfig = {
	port: build.testPort,
	reuseExistingServer: true,
	command: 'npm run test:server',
	cwd: process.cwd()
};

export default webServerConfig;
```

> Notice that the server will be started via `npm run test:server` command.

### Prepare runtime for tests

In order to run the test, you need to prepare a runtime environment:

1. Create a test page. You can use V4Fire demo page `@v4fire/client/components/pages/p-v4-components-demo` or create a new one. Create an `entry point` in `src/entries` for that page or add it to existing `entry point`. Do not forget to exclude the demo page using [`monic`](https://github.com/MonicBuilder/Monic) directives so that it does not get included into the production build.

2. Specify the name of the demo page in the project config `config/default#build.demoPage` (by default `p-v4-components-demo`).

3. Add your component to the demo page dependencies that you plan to test.

4. Build the project.


**components/pages/p-v4-components-demo/index.js**
```javascript
package('p-v4-components-demo')
	.extends('i-static-page')
	.dependencies(
		'b-component'
	);
```

### Run a test

To run `typescript` in the `nodejs` you need to include [`tsnode`](https://www.npmjs.com/package/ts-node). V4Fire provides a script that initializes `tsnode`. The most convenient way to execute this script is with the `NODE_OPTIONS` environment variable and the `-r` flag.

```
npx cross-env NODE_OPTIONS=\"-r @v4fire/core/build/tsnode.js\" playwright test --config tests/config/unit/index.ts
```

Make sure you specify the path to the config in the `--config` parameter. It is recommended to create a npm `script` for this command in `package.json`:

**package.json**

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

**`Component.createComponent`**

This function allows you to create components at the runtime. Let's use it and create a new component for testing.

**test/unit/functional.ts**
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

The `unit` folder will be searched and all files with the `.ts` extension will be imported to be executed.

This configuration should be used for running UI unit (components, modules) tests.

### Project tests (e2e)

```typescript
const config: PlaywrightTestConfig = {
  ...superConfig,

  name: 'project',

  testMatch: ['src/**/test/project/**/*.ts'],

  globalSetup: require.resolve('tests/config/project/setup')
};

```

The `project` folder will be searched and all files with the `.ts` extension will be imported to be executed.

This configuration is suggested for running project (e2e) tests.

More about configuration file: https://playwright.dev/docs/test-configuration.


## Testing helpers

V4Fire provides useful helpers like `Component`, `DOM`, `BOM`, `Assert`, etc. Check the `tests/helpers` directory.

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

Run tests that have substring `functional` in their description:

```
npm run test:unit -- --grep functional
```

Run project tests:

```
npx cross-env NODE_OPTIONS="-r @v4fire/core/build/tsnode.js" playwright --config tests/config/project/index.ts
```

With `yarn`:

```
yarn test:unit --headed
```

More about CLI flags:

https://playwright.dev/docs/test-cli

## Extra

- [Troubleshooting]('./troubleshooting')
