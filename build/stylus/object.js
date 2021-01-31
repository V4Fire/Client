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
	getField,
	parseObject
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

/**
 * Attempt to parse an object node to the javascript object.
 *
 * @param {Object} obj
 * @returns {Object}
 */
function parseObject(obj) {
	obj = obj.vals;

	for (const key in obj) {
		const
			{nodes} = obj[key].nodes[0];

		if (nodes && nodes.length) {
			if (nodes.length > 1) {
				obj[key] = [];

				for (let i = 0, len = nodes.length; i < len; ++i) {
					obj[key].push(convert(nodes[i]));
				}

			} else {
				obj[key] = convert(nodes[0]);
			}

		} else {
			obj[key] = convert(obj[key].first);
		}
	}

	return obj;

	function convert(node) {
		switch (node.nodeName) {
			case 'object':
				return parseObject(node);

			case 'boolean':
				return node.isTrue;

			case 'unit':
				return node.type ? node.toString() : Number(node.val);

			case 'string':
			case 'literal':
				return node.val;

			default:
				return node.toString();
		}
	}
}
