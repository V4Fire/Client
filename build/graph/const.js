/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	$C = require('collection.js');

const
	path = require('upath'),
	glob = require('fast-glob');

const {
	validators,
	resolve
} = require('@pzlr/build-core');

/**
 * A RegExp to extract parameters from a @component declaration
 * @type {RegExp}
 */
exports.componentRgxp = /@component\(([^@]*?)\).+?class\s+/s;

/**
 * A RegExp to extract the name of a component and the name of the parent component
 * @type {RegExp}
 */
exports.componentClassRgxp = /^\s*(?:export\s+(?:default\s+)?)?(?:abstract\s+)?class\s+((.*?)\s+extends\s+.*?)(?:\s+implements\s+[^{]*|\s*){/sm;

/**
 * A RegExp to extract the @prop-s of a component
 * @type {RegExp}
 */
exports.propRgxp = /^(?<p>\t+)@prop[^(]*\((?<params>[^@]+?)\)+\n+\k<p>(?<name>[\w $]+)(?:[!?]?:\s*[\w "$&'().:<>?[\]`{|}]+?)?\s*(?:=|;$)/gm;

/**
 * A RegExp to match generic syntax
 * @type {RegExp}
 */
exports.genericRgxp = /<.*|\s.*/g;

/**
 * A RegExp to match the class extension syntax
 * @type {RegExp}
 */
exports.extendsRgxp = /\s+extends\s+/;

/**
 * A list of resources available to load
 * @type {Array<string>}
 */
exports.resources = [resolve.blockSync(), ...resolve.dependencies];

/**
 * A glob pattern for searching component files
 * @type {string}
 */
exports.componentQuery = `/**/@(${validators.blockTypeList.join('|')})-*/**/*.@(ts|js)`;

/**
 * A list of component files
 */
exports.componentFiles = $C(exports.resources)
	.reduce((arr, el) => arr.concat(glob.sync(path.join(el, exports.componentQuery))), [])
	.reverse();
