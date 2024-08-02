# super/i-static-page

This module provides a super component for all root components.

The root component is the top component of any application.
It contains all other components, and all components have a property, which refers to it: `r` or `$root`.

Also, the root component generates an initial application HTML layout.
The layout contains including of base CSS/JS/... files and a bunch of meta tags, like `<title>`.

## Synopsis

* The component is not used on its own. It is a superclass.

* The component sets the root modifier `online` depending on the Internet status.

* The component extends [[iPage]].

* By default, the root tag of the component is `<div>`.

## Modifiers

See the parent component and the component traits.

## Events

See the parent component and the component traits.

## Associated types

The component has a bunch of associated types to specify page interfaces that are tied with a router.

```typescript
export default abstract class iStaticPage extends iPage {
  /**
   * Type: page parameters
   */
  readonly PageParams!: this['Router']['PageParams'];

  /**
   * Type: page query
   */
  readonly PageQuery!: this['Router']['PageQuery'];

  /**
   * Type: page meta
   */
  readonly PageMeta!: this['Router']['PageMeta'];

  /**
   * Type: router
   */
  readonly Router!: bRouter;

  /**
   * Type: current page
   */
  readonly CurrentPage!: AppliedRoute<this['PageParams'], this['PageQuery'], this['PageMeta']>;
}
```

See [[bRouter]] and [[bDynamicPage]] for more information.

## Hiding DOM elements when there is no Internet connection

Depending on the Internet connection status, the component sets the `online` global modifier.
In addition to this, any DOM element with the `data-hide-if-offline="true"` attribute will be hidden if there is no Internet.

```
- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
  - block body
    < p data-hide-if-offline = true
      Balance {{ balance }}
```

## Providing dynamic `webpack.publicPath`

If you run your build with options `webpack.dynamicPublicPath` and `webpack.providePublicPathWithQuery`,
you can provide the public path to load assets via a `publicPath` query parameter. To enable these options,
edit the config file or pass CLI options or environment variables.

```
https://your-site.com?publicPath=https://static.your-site.com/sf534sad323q
```

## Attaching project favicons

To attach favicons to the project, you should generate them first.
Unfortunately, the project building process does not generate them because it is an expensive task and slows down the building speed.

To generate favicons, you may use the predefined gulp task.

```bash
gulp static:favicons
```

The task uses [gulp-favicons](https://www.npmjs.com/package/gulp-favicons) to generate favicons based on a passed image.
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
You don't need to create favicons in each project because they can be inherited from parent layers.

## Including custom files to HTML

The component generates an HTML code to initialize an application.
It contains a structure of tags `<html><head/><body/></html>` with including all necessary resources, like CSS or JS files.

You can attach static files to the layout to avoid redundant WebPack compilation and increase building speed.
Notice, all files that are attached in this way won't be automatically minified. You should do it by yourself.

First, you have to create a component that extends the current one.

__pages/p-root/__

__index.js__

```js
package('p-root').extends('i-static-page');
```

__p-root.ts__

```typescript
import iStaticPage, { component } from 'super/i-static-page/i-static-page';

// To create a component as the root, we must mark it with the `@component` decorator
@component({root: true})
export default class pRoot extends iStaticPage {

}
```

__p-root.styl__

```stylus
@import "super/i-static-page/i-static-page.styl"

$p = {

}

p-root extends i-static-page
```

__p-root.ss__

This template is used within the runtime to create other components, like a router or dynamic page.

```
- namespace [%fileName%]

- include 'super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
  - block body
    < b-router
    < b-dynamic-page
```

__p-root.ess__

This template is used during compile-time to generate an HTML layout.
Notice, in the file name we use `.ess`, but no `.ss`.

```
- namespace [%fileName%]

- include 'super/i-static-page/i-static-page.interface.ss'|b as placeholder

- template index() extends ['i-static-page.interface'].index
  /// Map of external libraries to load
  - deps = include('src/pages/p-root/deps')
```

__deps.js__

This file exposes a map with dependencies to load via HTML.

```js
// Require config to enable runtime API, like, `include`
const config = require('config');

// Load parent dependencies from `iStaticPage`
const deps = include('src/super/i-static-page/deps');

// Add to the `<head>` a script from the project `assets/` folder.
// The script will be inlined.
deps.headScripts.set('perfomance-counter', {
  inline: true,
  source: 'src',
  src: 'assets/lib/perfomance-counter.js'
})

if (config.runtime().engine === 'vue') {
  // Load a library from the `node_modules/`.
  // The library will be put to the end of `<body>`.
  deps.scripts.set('vue', `vue/dist/vue.runtime${config.webpack.mode() === 'production' ? '.min' : ''}.js`);
}

module.exports = deps;
```

The `deps` object is a simple JS object with a predefined list of properties. Each property is a Map object.
By default, all resources to load are taken from the project `node_modules/` folder, but you can configure it manually for each case.
Also, you can provide additional attributes to any declaration via options.

```js
const deps = {
  /**
   * Map of script libraries to require
   * @type {Libs}
   */
  scripts: new Map(),

  /**
   * Map of script libraries to require: the scripts are placed within the head tag
   * @type {Libs}
   */
  headScripts: new Map(),

  /**
   * Map of style libraries to require
   * @type {StyleLibs}
   */
  styles: new Map(),

  /**
   * Map of links to require
   * @type {Links}
   */
  links: new Map()
};
```

```js
/**
 * Source type of a library:
 *
 *   1. `lib` - external library, i.e, something from `node_modules`
 *   2. `src` - internal resource, i.e, something that builds from the `/src` folder
 *   3. `output` - output library, i.e, something that builds to the `/dist/client` folder
 *   4. `external` - externally hosted library, i.e. from a CDN
 *
 * @typedef {('lib'|'src'|'output')}
 */
const LibSource = 'lib';

/**
 * Parameters of a script library:
 *
 *   1. src - relative path to a file to load, i.e. without referencing to `/node_modules`, etc.
 *   2. [source='lib'] - source type of the library, i.e. where the library is stored
 *   3. [inline=false] - if true, the library is placed as a text
 *   4. [defer=true] - if true, the library is declared with the `defer` attribute
 *   5. [load=true] - if false, the library won't be automatically loaded with a page
 *   6. [attrs] - dictionary with additional attributes
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

/**
 * Map of script libraries to require:
 * the value can be declared as a string (relative path to a file to load) or object with parameters
 *
 * @typedef {Map<string, (string|Lib)>}
 */
const Libs = new Map();

/**
 * Parameters of a style library:
 *
 *   1. src - relative path to a file to load, i.e. without referencing to `/node_modules`, etc.
 *   2. [source='lib'] - source type of the library, i.e. where the library is stored
 *   3. [inline=false] - if true, the library is placed as text into a style tag
 *   4. [defer=true] - if true, the library is loaded only after loading of the whole page
 *   5. [attrs] - dictionary with additional attributes
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

/**
 * Map of style libraries to require:
 * the value can be declared as a string (relative path to a file to load) or object with parameters
 *
 * @typedef {Map<string, (string|StyleLib)>}
 */
const StyleLibs = new Map();

/**
 * Parameters of a link:
 *
 *   1. src - relative path to a file to load, i.e. without referencing to `/node_modules`, etc.
 *   2. [source='lib'] - source type of the library, i.e. where the library is stored
 *   3. [tag='link'] - tag to create the link
 *   4. [attrs] - dictionary with additional attributes
 *
 * @typedef {{
 *   src: string,
 *   source?: LibSource,
 *   tag?: string,
 *   attrs?: Object
 * }}
 */
const Link = {};

/**
 * Map of links to require:
 * the value can be declared as a string (relative path to a file to load) or object with parameters
 *
 * @typedef {Map<string, (string|Link)>}
 */
const Links = new Map();
```

## Parameters to generate HTML

You can redefine Snakeskin constants to generate static HTML files.

```
/** Static page title */
- title = @@appName

/** @override */
- rootTag = 'div'

/** @override */
- rootAttrs = {}

/** Additional static page data */
- pageData = {}

/** Page charset */
- charset = 'utf-8'

/** Map of meta viewport attributes */
- viewport = { &
  'width': 'device-width',
  'initial-scale': '1.0',
  'maximum-scale': '1.0',
  'user-scalable': 'no'
} .

/** Map with attributes of <html> tag */
- htmlAttrs = { &
  lang: config.locale
} .

/** Should or not generate <base> tag */
- defineBase = false

/** Should or not attach favicons */
- attachFavicons = true

/** Should or not do a request for assets.js */
- assetsRequest = false
```

For instance:

__pages/p-v4-components-demo/p-v4-components-demo.ess__

```
- namespace [%fileName%]

- include 'super/i-static-page/i-static-page.interface.ss'|b as placeholder

- template index() extends ['i-static-page.interface'].index
  - rootTag = 'main'
  - charset = 'latin-1'
```

## Runtime API

### Getters

#### isAuth

True if the current user is authorized.
See `core/session` for more information.

#### isOnline

True if there is a connection to the Internet
See `core/net` for more information.

#### lastOnlineDate

The last date when the application was online.
See `core/net` for more information.

#### activePage

A name of the active route page.
See [[bDynamicPage]] for more information.

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

See `super/i-static-page/modules/provider-data-store` for more information.

### theme

A module to manage app themes from the Design System.

```js
console.log(this.r.theme.current);

this.r.theme.current = 'dark';
```

See `super/i-static-page/modules/theme` for more information.

### Accessors

#### locale

A value of the system locale.

```js
console.log(this.r.locale);
this.r.locale = 'ru';
```

#### region

A value of the system region.

```js
console.log(this.r.region);
this.r.region = 'RU';
```

#### reset

Sends a message to reset data of all components.
The method can take a reset type:

1. `'load'` - reload provider' data of all components;
2. `'load.silence'` - reload provider' data of all components without triggering of component' state;
3. `'router'` - reload router' data of all components;
4. `'router.silence'` - reload router' data of all components without triggering of component' state;
5. `'storage'` - reload storage' data of all components;
6. `'storage.silence'` - reload storage' data of all components without triggering of component' state;
7. `'silence'` - reload all components without triggering of component' state.

```js
this.r.reset();
this.r.reset('silence');
this.r.reset('storage.silence');
```
