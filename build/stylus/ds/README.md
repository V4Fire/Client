# build/stylus/ds

This module provides a bunch of the stylus custom functions to manage plugged design system.

## How it works

### Entry point. `index.js`

Index file attaches the design system package to build. It collects necessary input parameters from the current environment, provides it to the plugins generating function, and exports the result. Then the result can be connected as plugins to preprocessor for build.

### Plugins generating. `plugins.js`

Getting a set of settings from the current environment, function of plugins generating returns a bunch of functions. Then you can use functions from that bunch in styling files to work with values from the design system package.

File `plugins.js` imports only third-party functions for internal needs. Importing the environment variables and other constants be a mistake. This allows testing plugins generating function and the plugins themselves in different environments.

### Module testing

Module tests divided in the separate files or folders by groups:

- Tests for design system object creating. For using this object from plugins
- Tests for plugins, that developers can use in styling files

Different variants of the design system objects is being locate within the folder `test/scheme`

#### Design system generating tests

Located in the `spec.js` file. Check value compliance inside of the generated design system object to expectation values and post-processor data types.

#### Plugins tests

Located in the plugins folder. Divided to separated files by the plugin name. These tests are notable by this fact: you need to check the functionality when calling functions inside of style files in test cases. To do this, the preprocessor package render method is calling by passing a string, that contains the function call. And plugins, generated in the tests case are connected too.

Example:

```js
// ...
const
	plugins = createPlugins({ds, cssVariables, stylus, includeVars: true});

stylus.render('getDSFieldValue(rounding small)', {use: [plugins]}, (err, value) => {
	expect(value.trim()).toEqual(`${getCSSVariable('rounding.small')}`);
});
// ...
```

To check the result of the function calling the example above, we used helper `getCSSVariable`. Helpers are located and refill at the folder `test/helpers.js`

Worth paying attention to render of some functions that may return unexpected value. This is due to a feature of the preprocessor render function that returns string to place it in CSS-files.

Example with expectation a set of values:

```js
// ...
const
	includeThemes = ['night', 'day'],
	{data: ds, variables: cssVariables} = createDesignSystem(fullThemed),
	plugins = createPlugins({ds, cssVariables, theme, stylus, includeThemes});

stylus.render('.foo\n\tcontent join(".", includedThemes())', {use: [plugins]}, (err, value) => {
	expect(value.includes(`content: '${includeThemes.join('.')}'`)).toBeTrue();
});
// ...
```

In the example above, we join to string value from plugin with name `includedThemes` and save result to property content of arbitrary CSS-class. Next, we find this sequence at the result string and check it for compliance.
