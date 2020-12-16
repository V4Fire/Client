'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	path = require('upath'),
	glob = require('glob');

const
	{validators, resolve} = require('@pzlr/build-core');

/**
 * RegExp to extract parameters from a @component declaration
 */
exports.componentRgxp = /@component\(([^@]*?)\)\n+\s*export\s+/;

/**
 * RegExp to extract a name from a component and name of the parent component
 */
exports.componentClassRgxp = /^\s*export\s+default\s+(?:abstract\s+)?class\s+(([\s\S]*?)\s+extends\s+[\s\S]*?)(?:\s+implements\s+[^{]*|\s*){/m;

/**
 * RegExp to extract a name of a component prop
 */
exports.propRgxp = /^(\t+)@prop[^(]*\([^@]+?\)+\n+\1([ \w$]+)(?:[?!]?:\s*[ \w|&$?()[\]{}<>'"`:.]+?)?\s*(?:=|;$)/gm;

/**
 * RegExp to match the generic syntax
 */
exports.genericRgxp = /<.*|\s.*/g;

/**
 * RegExp to match the class extends syntax
 */
exports.extendsRgxp = /\s+extends\s+/;

/**
 * List of available resources to load
 */
exports.resources = [resolve.blockSync(), ...resolve.dependencies];

/**
 * Glob pattern to search component files
 */
exports.componentQuery = `/**/@(${validators.blockTypeList.join('|')})-*.@(ts|js)`;

/**
 * List of component file paths
 */
exports.componentFiles = $C(exports.resources)
	.reduce((arr, el) => arr.concat(glob.sync(path.join(el, exports.componentQuery))), [])
	.reverse();
