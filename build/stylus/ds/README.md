# build/stylus/ds

This module provides a bunch of `Stylus` custom functions to manage the plugged design system.

## How Does It Work?

### Entry point

The module entry point attaches a design system package to the build.
This script collects necessary input parameters from the environment and provides them to the plugins generating function.
The entry point exports a bunch of plugin functions. Functions can be connected as plugins to a stylus instance to build.

### Plugins generating function

The function is located at the `plugins.js` file.
It gets settings from the environment and returns a bunch of functions to use design system values within `.styl` files.

All environment variables are passing as module arguments.
That allows the testing functions to generate plugins and the plugins themselves in different environments.

### Module testing

All module tests divided into separate files or folders by groups:

* Tests of design system object creation: functions used to read the design system from plugins.
* Tests of `stylus` plugins: functions used to pass design system values into `styl` files.

Different variants of the design system object located at `test/scheme`.

#### Design system generating tests

Tests should be located at `test/spec.js`.
Checks value compliance inside the generated design system object to expectation values and post-processor data types.

#### Plugins tests

Tests should be located at `test/plugins` and divided into separate files by a plugin name.

Note about plugin tests:

> Plugin tests allow you to call functions as if they were called from `.styl` files.
> To do this, invoke the special render function and pass it a string to invoke a test function as the first argument.
> The second argument should take an object with Stylus plugins to initialize.

Example:

```js
// ...

const
  plugins = getPlugins({ds, cssVariables, stylus, useCSSVarsInRuntime: true});

stylus.render('getDSValue(rounding small)', {use: [plugins]}, (err, value) => {
  expect(value.trim()).toEqual(`${getCSSVariable('rounding.small')}`);
});

// ...
```

To check the result of `getDSValue` at the example above, we used `getCSSVariable` helper.
The helpers located and refill at `test/helpers.js`.

Notice, some functions may return unexpected values.
This is due to the Stylus render function feature that returns a string to place it within CSS-files.
For example:

```js
// ...

const
  includeThemes = ['night', 'day'];

const
  {data: ds, variables: cssVariables} = createDesignSystem(fullThemed),
  plugins = getPlugins({ds, cssVariables, theme, stylus, includeThemes});

stylus.render('.foo { content: join(".", availableThemes()) }', {use: [plugins]}, (err, value) => {
  expect(value.includes(`content: '${includeThemes.join('.')}'`)).toBeTrue();
});

// ...
```

The result of `availableThemes` joined by dots and saved to property `content` of an arbitrary CSS-class.
Then the result of the render function is checked for the existence of a substring.
