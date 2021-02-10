# build/stylus/ds

This module provides a bunch of `stylus` custom functions to manage the plugged design system.

## How it works

### Entry point. `index.js`

Attaches the design system package to build. This script collects necessary input parameters from the current environment and
provides to the plugins generating function.
Exports a bunch of plugin functions. Functions can be connected as plugins to a preprocessor to build.

### Plugins generating. `plugins.js`

Get settings from the current environment and returns a bunch of functions.
Functions can be used in style files to work with values from the design system package.

File `plugins.js` imports only third-party functions for internal needs.
All environment variables are passing as module arguments.
That allows testing plugins generating function and the plugins themselves in different environments.

### Module testing

Module tests divided into separate files or folders by groups:
  - Tests of a design system object creation. Functions, that used to read the design system from plugins.
  - Tests of `stylus` plugins. Functions, that using in style files.

Different variants of the design system objects is being locate within the folder `test/scheme`

#### Design system generating tests

Located in the `test/spec.js` file.
Checks value compliance inside the generated design system object to expectation values and post-processor data types.

#### Plugins tests

Located in the `test/plugins` folder.
Divided to separated files by the plugin name.

Note about plugins tests:

> Plugin tests checks the functionality when calling functions inside of style files.
> To do this, render method of the preprocessor package calling by passing a string, that contains the function call.
> Plugins, generated in the tests case are connected too.

Example:

```js
// ...
const
	plugins = getPlugins({ds, cssVariables, stylus, includeVars: true});

stylus.render('getDSFieldValue(rounding small)', {use: [plugins]}, (err, value) => {
	expect(value.trim()).toEqual(`${getCSSVariable('rounding.small')}`);
});
// ...
```

To check the result of the function calling in the example above, we used helper `getCSSVariable`.
Helpers are located and refill at the folder `test/helpers.js`.

Worth paying attention to render of some functions that may return unexpected value.
This is due to a feature of the preprocessor render function that returns string to place it in CSS-files.

Example with expectation a set of values:

```js
// ...
const
	includeThemes = ['night', 'day'],
	{data: ds, variables: cssVariables} = createDesignSystem(fullThemed),
	plugins = getPlugins({ds, cssVariables, theme, stylus, includeThemes});

stylus.render('.foo\n\tcontent join(".", includedThemes())', {use: [plugins]}, (err, value) => {
	expect(value.includes(`content: '${includeThemes.join('.')}'`)).toBeTrue();
});
// ...
```

In the example above, string value from a plugin with name `includedThemes` joined by dots,
and saved to property `content` of arbitrary CSS-class.
Expect function argument finds that sequence at the result string and check it for compliance.
