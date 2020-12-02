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
	{functions} = require('stylus');

module.exports = function addPlugins(api) {
	/**
	 * Returns a value from an object by the specified path
	 *
	 * @param {object} obj
	 * @param {string} string
	 */
	api.define('getField', (obj, {string}) => getField(obj, string));
};

Object.assign(module.exports, {
	getField
});

function getField(obj, path) {
	const
		[field, ...chunks] = path.split('.');

	let
		value = $C(obj).get(field) || $C(obj).get(`vals.${field}`);

	if (!value) {
		const
			nodes = $C(obj).get('nodes');

		if (nodes) {
			if (nodes.length === 1 && isNaN(parseInt(field, 10))) {
				const
					res = nodes[0],
					isExpr = functions.type(res) === 'expression';

				value = $C(res).get(`${isExpr ? 'nodes' : 'vals'}.${field}`);

			} else if (!isNaN(parseInt(field, 10))) {
				value = $C(nodes).get(field);
			}
		}
	}

	if (value) {
		return chunks.length === 0 ? value : getField(value, chunks.join('.'));
	}
}
