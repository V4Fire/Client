
# V4 component and module testing tools

## Test environment

* Test runner – [Jasmine](https://jasmine.github.io)
  * I recommend that you read a section about [asynchronous tests](https://jasmine.github.io/tutorials/async)

* [Playwright](https://playwright.dev/) is used to launch headless browsers

## Creating a first test

### Creating a test file

First, you need to create the test file itself. In the component folder create the `test` folder and in it create the` index.js` file.

### Setting up the test environment

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

### Creating components at runtime

The first step to create your component during test execution is to add the component as a dependency for the demo page:

__pages/p-demo-page/index.js__

```javascript
package('p-v4-components-demo')
	.extends('i-root')
	.dependencies(
		'b-popover'
	);
```
