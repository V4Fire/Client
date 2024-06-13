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

const
	{validators, resolve} = require('@pzlr/build-core');

/**
 * RegExp to extract parameters from a @component declaration
 * @type {RegExp}
 */
exports.componentRgxp = /@component\(([^@]*?)\)[\s\S]+?class\s+/;

/**
 * RegExp to extract a name from a component and name of the parent component
 * @type {RegExp}
 */
exports.componentClassRgxp = /^\s*(?:export\s+default\s+)?(?:abstract\s+)?class\s+(([\s\S]*?)\s+extends\s+[\s\S]*?)(?:\s+implements\s+[^{]*|\s*){/m;

/**
 * RegExp to extract component props
 * @type {RegExp}
 */
exports.propRgxp = /^(\t+)@prop[^(]*\([^@]+?\)+\n+\1([ \w$]+)(?:[?!]?:\s*[ \w|&$?()[\]{}<>'"`:.]+?)?\s*(?:=|;$)/gm;

/**
 * RegExp to match the generic syntax
 * @type {RegExp}
 */
exports.genericRgxp = /<.*|\s.*/g;

/**
 * RegExp to match the class extends syntax
 * @type {RegExp}
 */
exports.extendsRgxp = /\s+extends\s+/;

/**
 * List of available resources to load: paths to the source code of project layers
 * @type {Array<string>}
 */
exports.resources = [resolve.blockSync(), ...resolve.dependencies];

/**
 * Glob pattern to search component files
 * @type {string}
 */
exports.componentQuery = `/**/@(${validators.blockTypeList.join('|')})-*.@(ts|js)`;

/**
 * List of component files
 */
exports.componentFiles = $C(exports.resources)
	.reduce((arr, el) => arr.concat(glob.sync(path.join(el, exports.componentQuery))), [])
	.reverse();
