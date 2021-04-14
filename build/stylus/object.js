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
	api.define('getField', (obj, {string}) => getField(obj, string));
};

Object.assign(module.exports, {
	getField,
	parseObject
});

/**
 * Returns a value form the Stylus object by the specified path
 *
 * @param stylusObj
 * @param path
 * @returns {?}
 */
function getField(stylusObj, path) {
	const
		[field, ...chunks] = path.split('.');

	let
		value = $C(stylusObj).get(field) || $C(stylusObj).get(`vals.${field}`);

	if (!value) {
		const
			nodes = $C(stylusObj).get('nodes');

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
 * Attempts to parse the specified Stylus object to a JavaScript object.
 *
 * Nodes of the result object will be objects too, but not arrays like in the original convert function.
 * In the case of a "one-element array", it will be unpacked.
 *
 * @param {!Object} stylusObj
 * @returns {!Object}
 */
function parseObject(stylusObj) {
	return parse(stylusObj);

	function parse(obj, path = [], result = {}) {
		const
			{vals} = obj;

		for (const key in vals) {
			if (!vals.hasOwnProperty(key)) {
				continue;
			}

			const
				keyPath = [...path, key],
				{nodes} = vals[key].nodes[0];

			if (nodes && nodes.length) {
				if (nodes.length === 1) {
					if (nodes[0].nodeName === 'object') {
						convert(nodes[0], keyPath, result);

					} else {
						const
							exprRgxp = /^\((.*)\)$/g;

						let
							value = convert(nodes[0], keyPath, result);

						if (
							Object.isString(value) &&
							nodes[0].nodeName === 'expression' &&
							exprRgxp.test(value)
						) {
							// If the value is an expression with one element we have to
							// unwrap it from parentheses
							value = value.replace(exprRgxp, '$1');
						}

						$C(result).set(value, keyPath);
					}

				} else {
					$C(result).set([], path);

					for (let i = 0, len = nodes.length; i < len; ++i) {
						convert(nodes[i], [...keyPath, `${i}`], result);
					}
				}

			} else {
				$C(result).set(convert(vals[key].first, keyPath, result), keyPath);
			}
		}

		return result;
	}

	function convert(node, path, result) {
		switch (node.nodeName) {
			case 'object':
				return parse(node, path, result);

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
