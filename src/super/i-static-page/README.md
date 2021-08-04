# super/i-static-page

This module provides a super component for all root components.

A root component is the top component of any application.
It contains all other components, and all components have a property, which refers to the root component - `r` or `$root`.

Also, the root component generates the initial application HTML layout.
The layout contains including of base CSS/JS/... files and a bunch of meta tags, like `<title>`.

## Synopsis

* The component is not used on its own. It is a superclass.

* The component extends [[iPage]].

* By default, the root tag of the component is `<div>`.

## Modifiers

See the parent component and the component traits.

## Events

See the parent component and the component traits.

## Including custom files to HTML

The component generates an HTML code to initialize applications.
It contains `<html><head/><body/></html>`structure with including all necessary resources, like CSS or JS files.

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
