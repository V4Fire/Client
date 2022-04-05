# Test API Migration Guide

- [Motivation](#motivation)
- [Changes](#changes)
- [Adding an alias for the `config` package](#adding-an-alias-for-the-config-package)
- [`tsconfig` build changes](#tsconfig-build-changes)
- [Changing the import of TS modules in JS files](#changing-the-import-of-ts-modules-in-js-files)
- [Replacing Jasmine API with PW API](#replacing-jasmine-api-with-pw-api)
- [Build when running tests](#build-when-running-tests)
- [Launching the test server](#launching-the-test-server)
- [Running Tests](#running-tests)
- [Specs isolation](#specs-isolation)
- [Changing the Test Helper API](#changing-the-test-helper-api)
  - [Static methods](#static-methods)
  - [New API `Component.createComponent`](#new-api-componentcreatecomponent)
- [QA](https://github.com/V4Fire/Client/blob/master/docs/tests/migration/en/qa.md)

## Motivation

The main goals that were set when moving to the new API were as follows:

1. Be able to write tests in `Typescript`, improve the experience of writing tests;
2. Speed up the execution (due to better parallelization) of tests, increase their stability.

## Changes

Our old API for tests is declared `deprecated`, which means that support for the old API will be stopped and will be removed, it also means that the old API is switched to the "no improvement" mode, in case of errors they will be fixed, but improvements will not be made.

The old API is replaced with `@playwright/test`, documentation: https://playwright.dev/

## Migration

### Adding an alias for the `config` package

Since `typescript` is used for tests, importing the `config` package leads to incorrect path resolving and
instead of the expected package import, the `src/config/index.ts` file is imported.

To avoid this, add aliasing to the `config` package in `package.json`.

```
"@config/config": "npm:config@1.31.0"
```

After that, all imports of the `config` package (they are usually in the `require` JS files) need to be replaced with `@config/config`.

### `tsconfig` build changes

The generation of the `tsconfig` file has been moved to a standalone script, that is, it is no longer a gulp task, while it is worth noting that new path aliases, `build`, `tests`, will be added to `tsconfig`.

To generate a `tsconfig` file, run the `@v4fire/core/build/tsconfig` file with `node`. For ease of use, you can create an alias in `package.json`.

```
"scripts": {
  "build:tsconfig": "node node_modules/@v4fire/core/build/tsconfig"
}
```

### Changing the import of TS modules in JS files

```js
const
  h = include('tests/helpers');
```

->

```js
const
  h = include('tests/helpers').default;
```

### Replacing Jasmine API with PW API

The `expect` function and others are no longer defined globally, they must be imported.

```typescript
import test from 'tests/config/unit/test';

test.describe('test', () => {});
```

The import path for `unit` and for design tests may differ, for example, for each type of test, you should
to have your own instance of tests, this is necessary in order to extend the capabilities of the test API using fixture.

```
expect -> test.expect
describe -> test.describe
etc
```

### Build when running tests

If earlier, when running tests, the project was also built, now, before running the tests, you need to build the project. This is done in exactly the same way as in any other situation, using the `npx webpack` command.

### Launching the test server

To run a test server, the npm command `npm run test:server` is executed by default, but this can be changed in the configuration file. V4Fire provides a test server API by default.

If you add the functionality of unit testing components in a child project, you need to add a command to start the test server in `package.json` or redefine it via the config to the one you need.

__tests/server/index.ts__
```typescript
import '@v4fire/client/tests/server';
```

__package.json__
```
  "scripts": {
    "test:server": "cross-env NODE_OPTIONS=\"-r @v4fire/core/build/tsnode.js\" node tests/server",
  }
```


### Running Tests

The first thing to do is to compile the project, this is done with `npx webpack`. You can also set the `--watch` flag and run the tests in a separate terminal.

To run tests on TS, you need to require `tsnode.js` from `@v4fire/core` to the runtime. The most convenient place for this is npm scripts. Can be done like this:

__package.json__
```
"scripts": {
  "test:unit": "cross-env NODE_OPTIONS=\"-r @v4fire/core/build/tsnode.js\" npx playwright test --config tests/config/unit"
}
```

Так же необходимо указать `playwright` путь до конфига, v4 предоставляет 2 конфига по умолчанию, но вы можете добавлять их сколько вам угодно. [Подробнее про конфигурационный файл](https://playwright.dev/docs/test-configuration).

### Specs isolation

Now each spec runs on a separate page and with a separate context **automatically**. This behavior can be bypassed, but it is highly discouraged.

### Changing the Test Helper API

#### Static methods

Also, test helpers have undergone and will continue to change their API a bit, so now all methods will be `static`! and the common module that accumulates helpers will be removed. At this point, most methods have become `static` methods, but for backwards compatibility, instance methods remain temporarily.

Before:

```typescript
import h from 'tests/helpers';

h.router.something();
```

After:

```typescript
import Router from 'tests/helpers/router'

Router.something();
```

#### New API `Component.createComponent`

Previously, to create a component, we accessed the `page` instance, called the `evaluate` method, and inside the context created component using `globalThis.renderComponents` this approach had many very serious drawbacks and inconveniences, namely:

1. The component reference was not returned. To get a reference to the component, you had to make additional calls;
2. Inability to work with functions. The `page.evaluate` method cannot pass functions inside the page, because of this we had to do strange things in place;
3. Cumbersomeness of recording in connection with the points above.

To solve all these problems, the `Component.createComponent` method was created which encapsulates the solutions to all these problems.

```typescript
const
	bDummy = await Component.createComponent<bDummy>(page, 'b-dummy', {attrs: {someFnProp: () => console.log(1)}});
```

In this example, `bDummy` will be of type `JSHandle<bDummy>`.

## QA

https://github.com/V4Fire/Client/blob/master/docs/tests/migration/en/qa.md