/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

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
exports.LibSource = LibSource;

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
exports.Lib = Lib;

/**
 * Parameters of an initialized script library:
 *
 *   1. src - path to a file to load
 *   2. [js] - if true, the function returns JS code to load the library
 *   3. [staticAttrs] - string with additional attributes
 *
 * @see Lib
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
 * Map of script libraries to require:
 * the value can be declared as a string (relative path to a file to load) or object with parameters
 *
 * @typedef {Map<string, (string|Lib)>}
 */
const Libs = new Map();
exports.Libs = Libs;

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
exports.StyleLib = StyleLib;

/**
 * Parameters of an initialized style library:
 *
 *   1. src - path to a file to load
 *   2. [js] - if true, the function returns JS code to load the library
 *   3. [staticAttrs] - string with additional attributes
 *
 * @see StyleLib
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
 * Map of style libraries to require:
 * the value can be declared as a string (relative path to a file to load) or object with parameters
 *
 * @typedef {Map<string, (string|StyleLib)>}
 */
const StyleLibs = new Map();
exports.StyleLibs = StyleLibs;

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
exports.Link = Link;

/**
 * Parameters of an initialized link:
 *
 *   1. src - path to a file to load
 *   2. [tag='link'] - tag to create the link
 *   3. [js] - if true, the function returns JS code to load the library
 *   4. [staticAttrs] - string with additional attributes
 *
 * @see Link
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
 * Map of links to require:
 * the value can be declared as a string (relative path to a file to load) or object with parameters
 *
 * @typedef {Map<string, (string|StyleLib)>}
 */
const Links = new Map();
exports.Links = Links;
