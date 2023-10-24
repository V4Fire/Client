/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

/**
 * Source type of library:
 *
 * 1. lib - the external library, e.g., something from node_modules
 * 2. src - the internal resource, e.g., something that builds from the `/src` folder
 * 3. output - the output library, e.g., something that builds to the `/dist/client` folder
 *
 * @typedef {('lib'|'src'|'output')}
 */
const LibSource = 'lib';
exports.LibSource = LibSource;

/**
 * Parameters of a script library:
 *
 * 1. src - a relative path to the loaded file, i.e., without referencing to `/node_modules`, etc.
 * 2. [source='lib'] - the source type of the library, i.e., where the library is placed
 * 3. [inline=false] - if true, the library is placed as text
 * 4. [defer=true] - if true, the library is declared with the `defer` attribute
 * 5. [load=true] - if false, the library won't be automatically loaded with page
 * 6. [attrs] - a dictionary with attributes to set. You can provide an attribute value in different ways:
 *   1. a simple string, or null (when an attribute does not have a value);
 *   2. an array (to interpolate the value as JS);
 *   3. an object with the predefined `toString` method
 *     (in this way you can also provide flags `escape: ` to disable escaping non-secure characters
 *     and `interpolate: true` to enable the interpolation of a value).
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
 * 1. src - the path to library file
 * 2. [inline=false] - whether to include the library code inline in a `<script>` tag
 * 3. [defer=true] - whether the script should be deferred
 * 4. [load=true] - whether the library should be loaded at all
 * 5. [js=false] - if true, the function returns JS code to create and append a `<script>` element
 * 6. [attrs] - a dictionary with attributes to set.
 *   You can provide an attribute value in different ways:
 *   1. a simple string, or null (when an attribute does not have a value);
 *   2. an array (to interpolate the value as JS);
 *   3. an object with the predefined `toString` method
 *     (in this way you can also provide flags `escape: ` to disable escaping non-secure characters
 *     and `interpolate: true` to enable the interpolation of a value).
 *
 * 7. [staticAttrs] - a string with additional attributes for the script tag
 *
 * {@link Lib}
 *
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
 * the value can be declared as a string (relative path to a file to load) or an object with parameters
 *
 * @typedef {Map<string, (string|Lib)>}
 */
const Libs = new Map();
exports.Libs = Libs;

/**
 * Parameters of a style library:
 *
 * 1. src - a relative path to the loaded file, i.e., without referencing to `/node_modules`, etc.
 * 2. [source='lib'] - the source type of the library, i.e., where the library is stored
 * 3. [inline=false] - whether to include the library code inline in a `<style>` tag
 * 4. [defer=true] - if true, the library is loaded only after loading of the whole page
 * 5. [attrs] - a dictionary with attributes to set.
 *   You can provide an attribute value in different ways:
 *   1. a simple string, as null (when an attribute does not have a value);
 *   2. an array (to interpolate the value as JS);
 *   3. an object with the predefined `toString` method
 *     (in that way you can also provide flags `escape: ` to disable escaping non-secure characters
 *     and `interpolate: true` to enable interpolation of a value).
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
 * 1. src - a path to the loaded file
 * 2. [js] - if true, the function returns JS code to load the library
 * 3. [staticAttrs] - a string with additional attributes
 *
 * {@link StyleLib}
 *
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
 * the value can be declared as a string (relative path to a file to load) or an object with parameters
 *
 * @typedef {Map<string, (string|StyleLib)>}
 */
const StyleLibs = new Map();
exports.StyleLibs = StyleLibs;

/**
 * Parameters of a link:
 *
 *   1. src - a relative path to the loaded file, i.e., without referencing to /node_modules, etc.
 *   2. [source='lib'] - the source type of the library, i.e., where the library is stored
 *   3. [tag='link'] - a tag to create link
 *   4. [attrs] - a dictionary with attributes to set. You can provide an attribute value in different ways:
 *     1. a simple string, or null (when an attribute does not have a value);
 *     2. an array (to interpolate the value as JS);
 *     3. an object with the predefined `toString` method
 *       (in this way you can also provide flags `escape: ` to disable escaping non-secure characters
 *       and `interpolate: true` to enable the interpolation of a value).
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
 * 1. src - a path to the loaded file
 * 2. [tag='link'] - a tag to create link
 * 3. [js] - if true, the function returns JS code to load the library
 * 4. [staticAttrs] - a string with additional attributes
 *
 * {@link Link}
 *
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
 * the value can be declared as a string (relative path to a file to load) or an object with parameters
 *
 * @typedef {Map<string, (string|Link)>}
 */
const Links = new Map();
exports.Links = Links;
