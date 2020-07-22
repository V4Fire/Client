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
 * * [inline=false] - if true, the library will be placed as text into a script tag
 * * [defer=true] - if true, the script is declared with the "defer" attribute
 * * [async=false] - if true, the script is declared with the "async" attribute
 * * [module=false] - if true, the script is declared with the "module" attribute
 * * [load=true] - if false, the script won't be automatically loaded with a page
 *
 * @typedef {{
 *   src: string,
 *   source?: LibSource,
 *   inline?: boolean,
 *   defer?: boolean,
 *   async?: boolean,
 *   module?: boolean,
 *   load?: boolean
 * }}
 */
const Lib = {};
exports.Lib = Lib;

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
 * * [inline=false] - if true, the library will be placed as text into a style tag
 * * [defer=true] - if true, the style will be loaded only after loading of the whole page
 *
 * @typedef {{
 *   src: string,
 *   source?: LibSource,
 *   inline?: boolean,
 *   defer?: boolean
 * }}
 */
const StyleLib = {};
exports.StyleLib = StyleLib;

/**
 * Map of style libraries to require:
 * the value can be declared as a string (relative path to a file to load) or object with parameters
 *
 * @typedef {Map<string, (string|StyleLib)>}
 */
const StyleLibs = new Map();
exports.StyleLibs = StyleLibs;
