/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Additional options of a dependency:
 *
 * * [optional] - if true, the missing of this dependency won't throw an error
 * * [defer=true] - if true, the dependency is declared with the "defer" attribute
 * * [inline] - if true, the dependency is placed as a text
 * * [wrap] - if true, declaration of the dependency is wrapped by a script tag
 *
 * @typedef {{
 *   optional?: boolean,
 *   defer?: boolean,
 *   inline?: boolean,
 *   wrap?: boolean
 * }}
 */
const DepOptions = {};
exports.DepOptions = DepOptions;

/**
 * Source type of a library:
 *
 * 1. lib - external library, i.e, something from node_modules
 * 2. src - internal resource, i.e, something that builds from the /src folder
 * 3. output - output library, i.e, something that builds to the /dist/client folder
 *
 * @typedef {('lib'|'src'|'output')}
 */
const LibSource = 'lib';
exports.LibSource = LibSource;

/**
 * Parameters of a script library:
 *
 * * src - relative path to a file to load, i.e. without referencing to /node_modules, etc.
 * * [source='lib'] - source type of the library, i.e. where the library is stored
 * * [inline=false] - if true, the library is placed as a text
 * * [defer=true] - if true, the library is declared with the "defer" attribute
 * * [load=true] - if false, the library won't be automatically loaded with a page
 * * [attrs] - dictionary with additional attributes
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
 * * src - path to a file to load
 * * [documentWrite] - if true, the function returns JS code to load the library by using document.write
 * * [staticAttrs] - string with additional attributes
 *
 * @see Lib
 * @typedef {{
 *   src: string,
 *   inline?: boolean,
 *   defer?: boolean,
 *   load?: boolean,
 *   documentWrite?: boolean,
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
 * * src - relative path to a file to load, i.e. without referencing to /node_modules, etc.
 * * [source='lib'] - source type of the library, i.e. where the library is stored
 * * [inline=false] - if true, the library is placed as text into a style tag
 * * [defer=true] - if true, the library is loaded only after loading of the whole page
 * * [attrs] - dictionary with additional attributes
 *
 * @typedef {{
 *   src: string,
 *   source?: LibSource,
 *   inline?: boolean,
 *   defer?: boolean
 *   attrs?: Object
 * }}
 */
const StyleLib = {};
exports.StyleLib = StyleLib;

/**
 * Parameters of an initialized style library:
 *
 * * src - path to a file to load
 * * [documentWrite] - if true, the function returns JS code to load the library by using document.write
 * * [staticAttrs] - string with additional attributes
 *
 * @see StyleLib
 * @typedef {{
 *   src: string,
 *   inline?: boolean,
 *   defer?: boolean,,
 *   documentWrite?: boolean,
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
 * * src - relative path to a file to load, i.e. without referencing to /node_modules, etc.
 * * [source='lib'] - source type of the library, i.e. where the library is stored
 * * [attrs] - dictionary with additional attributes
 *
 * @typedef {{
 *   src: string,
 *   source?: LibSource,
 *   attrs?: Object
 * }}
 */
const Link = {};
exports.Link = Link;

/**
 * Parameters of an initialized link:
 *
 * * src - path to a file to load
 * * [documentWrite] - if true, the function returns JS code to load the library by using document.write
 * * [staticAttrs] - string with additional attributes
 *
 * @see Link
 * @typedef {{
 *   src: string,
 *   documentWrite?: boolean,
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
