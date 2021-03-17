# build/stylus/ds

This module provides a bunch of `stylus` custom functions to manage the plugged design system.

## How it works

### Entry point

Module entry point attaches the design system package to build.
This script collects necessary input parameters from the environment and provides it to the plugins generating function.
Entry point exports a bunch of plugin functions. Functions can be connected as plugins to a stylus instance to build.

### Plugins generating function

The function is located in `plugins.js` file.
Function gets settings from the environment and returns a bunch of functions to use design system values at `styl` files.

All environment variables are passing as module arguments.
That allows to test function to generate plugins and the plugins themselves in different environments.

### Module testing

Module tests divided into separate files or folders by groups:

  * Tests of design system object creation. Functions that used to read the design system from plugins.
  * Tests of `stylus` plugins. Functions that used to pass design system values to `styl` files.

Different variants of design system objects located in `test/scheme`.

#### Design system generating tests

Located in `test/spec.js`.
Checks value compliance inside the generated design system object to expectation values and post-processor data types.

#### Plugins tests

Located in `test/plugins`.
Divided to separated files by a plugin name.

Note about plugin tests:

> Plugin tests check the functionality when functions calling inside of style files.
> To do this, stylus render method calling by passing a string contains a function call.
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

To check the result of `getDSFieldValue` in the example above, we used `getCSSVariable` helper.
Helpers located and refill at `test/helpers.js`.

Notice, some functions may return unexpected value.
This is due to a feature of the `stylus` render function that returns string to place it in CSS-files.
For example:

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

Result of `includedThemes` joined by dots, and saved to property `content` of arbitrary CSS-class.
Then result of render function is checked for the existence of a substring.
