# components/super/i-static-page

This module provides a superclass for all root components.

The root component is the top component of any application.
It contains all other components, and all components have a property that refers to it: `r` or `$root`.

In addition, the root component generates the initial HTML layout of the application.
The layout includes basic CSS/JS/... files and a set of meta tags such as `<title>`.

## Synopsis

* The component is not used on its own. It is a superclass.

* The component sets the root modifier `online` depending on the Internet status.

* The component extends [[iPage]].

* By default, the component's root tag is set to `<div>`.

## Modifiers

See the parent component and the component traits.

## Events

See the parent component and the component traits.

## Associated types

The component has a bunch of associated types to specify page interfaces that are tied with a router.

```typescript
export default abstract class iStaticPage extends iPage {
  /**
   * Type: the page parameters
   */
  readonly PageParams!: this['Router']['PageParams'];

  /**
   * Type: the page query
   */
  readonly PageQuery!: this['Router']['PageQuery'];

  /**
   * Type: the page meta
   */
  readonly PageMeta!: this['Router']['PageMeta'];

  /**
   * Type: the router
   */
  readonly Router!: bRouter;

  /**
   * Type: the current page
   */
  readonly CurrentPage!: AppliedRoute<this['PageParams'], this['PageQuery'], this['PageMeta']>;
}
```

See [[bRouter]] and [[bDynamicPage]] for more information.

## Hiding DOM elements when there is no Internet connection

Depending on the Internet connection status, the component sets the `online` global modifier.
In addition to this, any DOM element with the `data-hide-if-offline="true"` attribute will be hidden if there is no internet.

```
- namespace [%fileName%]

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < p data-hide-if-offline = true
      Balance {{ balance }}
```

## Providing dynamic `webpack.publicPath`

If you run your build with options `webpack.dynamicPublicPath` and `webpack.providePublicPathWithQuery`,
you can specify a public path to load assets via the `publicPath` query parameter. To enable these options,
edit the config file or pass CLI options or environment variables.

```
https://your-site.com?publicPath=https://static.your-site.com/sf534sad323q
```

## Attaching project favicons

To attach favicons to a project, they must first be generated.
Unfortunately, the build process of the project does not generate them, because this is an expensive task and slows down the build speed.

To generate favicons, you can use the predefined gulp task.

```bash
gulp static:favicons
```

The task uses [gulp-favicons](https://www.npmjs.com/package/gulp-favicons) to generate favicons based on the specified image.
To configure the task, you must modify the `favicons` property from the project config file.

__config/default.js__

```js
const
  config = require('@v4fire/client/config/default');

module.exports = config.createConfig({dirs: [__dirname, 'client']}, {
  favicons() {
    return {
      ...super.favicons(),
      src: 'logo.png',
      background: '#2E2929'
    };
  },
});
```

Don't forget to commit all generated files to your version control system.
You don't need to create favicons in every project because they can be inherited from parent layers.

## Including custom files to HTML

The component generates HTML code to initialize the application.
It contains a `<html><head/><body/></html>` tag structure with all necessary resources such as CSS or JS files.

You can attach static files to your layout to avoid redundant WebPack compilation and increase build speed.
Please note that all files attached in this way will not be automatically minified. You must do it yourself.

First, you need to create a component that extends the current one.

__components/pages/p-root/__

__index.js__

```js
package('p-root').extends('i-static-page');
```

__p-root.ts__

```typescript
import iStaticPage, { component } from 'components/super/i-static-page/i-static-page';

// To create a component as a root, we must mark it with the `@component` decorator
@component({root: true})
export default class pRoot extends iStaticPage {

}
```

__p-root.styl__

```stylus
@import "components/super/i-static-page/i-static-page.styl"

$p = {

}

p-root extends i-static-page
```

__p-root.ss__

This template is used at runtime to create other components such as a router or a dynamic page.

```
- namespace [%fileName%]

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block body
    < b-router
    < b-dynamic-page
```

__p-root.ess__

This template is used at compile time to create the HTML layout.
Note that we use `.ess` in the filename, not `.ss`.

```
- namespace [%fileName%]

- include 'components/super/i-static-page/i-static-page.html.ss'|b as placeholder

- template index() extends ['i-static-page.html'].index
  /// A dictionary with external libraries to load
  - deps = include('src/components/pages/p-root/deps')
```

__deps.js__

This file exposes a map with dependencies for loading via HTML.

```js
// Require config to enable the runtime API, like, `include`
const config = require('config');

// Load the parent dependencies from `iStaticPage`
const deps = include('src/components/super/i-static-page/deps');

// Add the script from the project `assets/` folder to the `<head>` tag.
// The script will be inlined.
deps.headScripts.set('perfomance-counter', {
  inline: true,
  source: 'src',
  src: 'assets/lib/perfomance-counter.js'
})

if (config.runtime().engine === 'vue') {
  // Load a library from the `node_modules/`.
  // The library will be placed at the end of `<body>`
  deps.scripts.set('vue', `vue/dist/vue.runtime${config.webpack.mode() === 'production' ? '.min' : ''}.js`);
}

module.exports = deps;
```

The `deps` object is a simple JS object with a predefined list of properties. Each property is a Map object.
By default, all resources for loading are taken from the project's `node_modules/` folder, but you can configure it manually for each case.
In addition, you can specify additional attributes for any declaration using parameters.

```js
const deps = {
  /**
   * A map of script libraries to require
   * @type {Libs}
   */
  scripts: new Map(),

  /**
   * A map of script libraries to require: the scripts are placed within the head tag
   * @type {Libs}
   */
  headScripts: new Map(),

  /**
   * A map of style libraries to require
   * @type {StyleLibs}
   */
  styles: new Map(),

  /**
   * A map of links to require
   * @type {Links}
   */
  links: new Map()
};
```

```js
/**
 * Source type of library:
 *
 *   1. `lib` - the external library, i.e, something from `node_modules`
 *   2. `src` - the internal resource, i.e, something that builds from the `/src` folder
 *   3. `output` - the output library, i.e, something that builds to the `/dist/client` folder
 *
 * @typedef {('lib'|'src'|'output')}
 */
const LibSource = 'lib';
exports.LibSource = LibSource;

/**
 * Parameters of a script library:
 *
 *   1. src - a relative path to the loaded file, i.e., without referencing to `/node_modules`, etc.
 *   2. [source='lib'] - the source type of the library, i.e., where the library is placed
 *   3. [inline=false] - if true, the library is placed as a text
 *   4. [defer=true] - if true, the library is declared with the `defer` attribute
 *   5. [load=true] - if false, the library won't be automatically loaded with a page
 *   6. [attrs] - a dictionary with attributes to set. You can provide an attribute value in different ways:
 *     1. a simple string, as `null` (when an attribute does not have a value);
 *     2. an array (to interpolate the value as JS);
 *     3. an object with the predefined `toString` method
 *       (in that way you can also provide flags `escape: ` to disable escaping non-secure characters
 *       and `interpolate: true` to enable interpolation of a value).
 *
 * @typedef {{
 *   src: string,
 *   source?: LibSource,
 *   inline?: boolean,
 *   load?: boolean,
 *   attrs?: Object
 * }}
 */
const Lib = {};
exports.Lib = Lib;

/**
 * Parameters of an initialized script library:
 *
 *   1. src - a path to the loaded file
 *   2. [js] - if true, the function returns JS code to load the library
 *   3. [staticAttrs] - a string with additional attributes
 *
 * {@link Lib}
 * @typedef {{
 *   src: string,
 *   inline?: boolean,
 *   defer?: boolean,
 *   load?: boolean,
 *   js?: boolean,
 *   attrs?: Object,
 *   staticAttrs?: string
 * }}
 */
const InitializedLib = {};
exports.InitializedLib = InitializedLib;

/**
 * A map of script libraries to require:
 * the value can be declared as a string (relative path to a file to load) or object with parameters
 *
 * @typedef {Map<string, (string|Lib)>}
 */
const Libs = new Map();
exports.Libs = Libs;

/**
 * Parameters of a style library:
 *
 *   1. src - a relative path to the loaded file, i.e., without referencing to `/node_modules`, etc.
 *   2. [source='lib'] - the source type of the library, i.e., where the library is stored
 *   3. [inline=false] - if true, the library is placed as text into a style tag
 *   4. [defer=true] - if true, the library is loaded only after loading of the whole page
 *   5. [attrs] - a dictionary with attributes to set. You can provide an attribute value in different ways:
 *     1. a simple string, as `null` (when an attribute does not have a value);
 *     2. an array (to interpolate the value as JS);
 *     3. an object with the predefined `toString` method
 *       (in that way you can also provide flags `escape: ` to disable escaping non-secure characters
 *       and `interpolate: true` to enable interpolation of a value).
 *
 * @typedef {{
 *   src: string,
 *   source?: LibSource,
 *   inline?: boolean,
 *   defer?: boolean,
 *   attrs?: Object
 * }}
 */
const StyleLib = {};
exports.StyleLib = StyleLib;

/**
 * Parameters of an initialized style library:
 *
 *   1. src - a path to the loaded file
 *   2. [js] - if true, the function returns JS code to load the library
 *   3. [staticAttrs] - a string with additional attributes
 *
 * {@link StyleLib}
 * @typedef {{
 *   src: string,
 *   inline?: boolean,
 *   defer?: boolean,
 *   js?: boolean,
 *   attrs?: Object,
 *   staticAttrs?: string
 * }}
 */
const InitializedStyleLib = {};
exports.InitializedStyleLib = InitializedStyleLib;

/**
 * A map of style libraries to require:
 * the value can be declared as a string (relative path to a file to load) or object with parameters
 *
 * @typedef {Map<string, (string|StyleLib)>}
 */
const StyleLibs = new Map();
exports.StyleLibs = StyleLibs;

/**
 * Parameters of a link:
 *
 *   1. src - a relative path to the loaded file, i.e., without referencing to `/node_modules`, etc.
 *   2. [source='lib'] - the source type of the library, i.e., where the library is stored
 *   3. [tag='link'] - a tag to create the link
 *   4. [attrs] - a dictionary with attributes to set. You can provide an attribute value in different ways:
 *     1. a simple string, as `null` (when an attribute does not have a value);
 *     2. an array (to interpolate the value as JS);
 *     3. an object with the predefined `toString` method
 *       (in that way you can also provide flags `escape: ` to disable escaping non-secure characters
 *       and `interpolate: true` to enable interpolation of a value).
 *
 * @typedef {{
 *   src: string,
 *   source?: LibSource,
 *   tag?: string,
 *   attrs?: Object
 * }}
 */
const Link = {};
exports.Link = Link;

/**
 * Parameters of an initialized link:
 *
 *   1. src - a path to the loaded file
 *   2. [tag='link'] - a tag to create the link
 *   3. [js] - if true, the function returns JS code to load the library
 *   4. [staticAttrs] - a string with additional attributes
 *
 * {@link Link}
 * @typedef {{
 *   src: string,
 *   tag?: string,
 *   js?: boolean,
 *   attrs?: Object,
 *   staticAttrs?: string
 * }}
 */
const InitializedLink = {};
exports.InitializedLink = InitializedLink;

/**
 * A map of links to require:
 * the value can be declared as a string (relative path to a file to load) or object with parameters
 *
 * @typedef {Map<string, (string|Link)>}
 */
const Links = new Map();
exports.Links = Links;
```

## Parameters to generate HTML

You can override Snakeskin constants to create static HTML files.

```
/** The static page title */
- title = @@appName

/** @override */
- rootAttrs = {}

/** Additional static page data */
- pageData = {}

/** The page charset */
- charset = 'utf-8'

/** A dictionary with meta viewport attributes */
- viewport = { &
  'width': 'device-width',
  'initial-scale': '1.0',
  'maximum-scale': '1.0',
  'user-scalable': 'no'
} .

/** A dictionary with attributes of <html> tag */
- htmlAttrs = { &
  lang: config.locale
} .

/** Should or not generate the `<base>` tag */
- defineBase = false

/** Should or not attach favicons */
- attachFavicons = true

/** Should or not do a request for `assets.js` */
- assetsRequest = false
```

For instance:

__components/pages/p-v4-components-demo/p-v4-components-demo.ess__

```
- namespace [%fileName%]

- include 'components/super/i-static-page/i-static-page.html.ss'|b as placeholder

- template index() extends ['i-static-page.html'].index
  - rootTag = 'main'
  - charset = 'latin-1'
```

## API

### Getters

#### isAuth

True if the current user is authorized. See `core/session` for more information.

#### isOnline

True if there is a connection to the Internet.

#### lastOnlineDate

Last date when the application was online.

#### activePage

The name of the active route page.
See [[bDynamicPage]] for more information.

### pageMetaData

An API for managing the meta information of a page, such as the title, description, and other meta tags.

```js
this.r.pageMetaData.title = 'Example';
console.log(this.r.pageMetaData.description);
```

See `components/super/i-static-page/modules/page-meta-data` for more information.

### providerDataStore

A module to work with data of data providers globally.

```
< b-select :dataProvider = 'users.List'
< b-select :dataProvider = 'cities.List' | :globalName = 'foo'
```

```js
/// Somewhere in your app code
if (this.r.providerDataStore.has('users.List')) {
  /// See `core/object/select`
  console.log(this.r.providerDataStore.get('users.List').select({where: {id: 1}}));
}

console.log(this.r.providerDataStore.get('foo')?.data);
```

See `components/super/i-static-page/modules/provider-data-store` for more information.

### theme

A module for managing application themes.

```js
console.log(this.r.theme.current);
this.r.theme.current = 'dark';
```

See `components/super/i-static-page/modules/theme` for more information.

### Accessors

#### locale

The application locale.

```js
console.log(this.r);
this.r.locale = 'ru';
```

### Methods

#### reset

Sends a message to reset data of all components.
The method can accept a reset type:

1. `'load'` - reloads provider data of all components;
2. `'load.silence'` - reloads provider data of all components without triggering of component state;
3. `'router'` - reloads router data of all components;
4. `'router.silence'` - reloads router data of all components without triggering of component state;
5. `'storage'` - reloads storage data of all components;
6. `'storage.silence'` - reloads storage data of all components without triggering of component state;
7. `'silence'` - reloads all components without triggering of component state.

```js
this.r.reset();
this.r.reset('silence');
this.r.reset('storage.silence');
```
