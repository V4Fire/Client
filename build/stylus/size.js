'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	stylus = require('stylus');

const
	defUnit = 'rem',
	sizeRgxp = /(^x*)([s|l]$)|(^m$)/g;

const GLOBAL_SIZES = {
	table: {},
	units: defUnit
};

/**
 * Throws an error for sizes depending on a type
 *
 * @param {string} type - error type
 * @param {!Array<string>} args - comments list for the output string
 */
function throwError(type, ...args) {
	switch (type) {
		case 'value':
			throw new Error(`Value order error for keys ${args.join(', ')}`);

		case 'identifier':
			throw new Error(`Invalid identifier to specify size: ${args.join(', ')}`);

		case 'structure':
			throw new Error('Violation of the structure of the input data');
	}
}

/**
 * Tries to parse Stylus node to a JS object and returns it
 *
 * @param {!Object} obj
 * @returns {!Object}
 */
function parseObject(obj) {
	obj = obj.vals;

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

	for (const key in obj) {
		const
			nodes = obj[key].nodes[0].nodes;

		if (nodes && nodes.length) {
			obj[key] = [];

			for (let i = 0, len = nodes.length; i < len; ++i) {
				obj[key].push(convert(nodes[i]));
			}

		} else {
			obj[key] = convert(obj[key].first);
		}
	}

	return obj;
}

/**
 * Normalizes the specified size dictionary and returns a sorted list of keys
 *
 * @param {!Object} values
 * @returns {!Array<string>}
 */
function normalizeSizeDict(values) {
	return Object.keys(values).sort((a, b) => {
		const
			replacer = (str, p1, p2, p3) => p3 ? 0 : (p1.length || 0.5) * {s: -1, l: 1}[p2],
			keyA = Number(a.replace(sizeRgxp, replacer)),
			keyB = Number(b.replace(sizeRgxp, replacer));

		if (keyA > keyB) {
			if (values[a] < values[b]) {
				throwError('value', a, b, `${values[a]} < ${values[b]}`);
			}

			return 1;

		} else if (keyA < keyB) {
			if (values[a] > values[b]) {
				throwError('value', a, b, `${values[a]} > ${values[b]}`);
			}

			return -1;
		}

		throwError('value', a, b);
	});
}

module.exports = function (style) {
	/**
	 * Extends (or replaces) the global table of presented sizes
	 *
	 * @param {!Object} obj - custom sizes dictionary
	 * @param {boolean} [replace] - if true, then the global table will be replaced
	 * @returns {!Object}
	 */
	style.define('extendSizes', (obj, replace) => {
		const
			dict = parseObject(obj);

		if (replace) {
			replace = replace.toBoolean().isTrue;
		}

		if (!dict || !dict.table) {
			throwError('structure');
		}

		if (!Object.keys(GLOBAL_SIZES.table).length || replace) {
			normalizeSizeDict(dict.table);
			GLOBAL_SIZES.table = dict.table[0];

		} else {
			const merged = {...GLOBAL_SIZES.table, ...dict.table[0]};
			normalizeSizeDict(merged);
			GLOBAL_SIZES.table = merged;
		}

		if (dict.units) {
			GLOBAL_SIZES.units = dict.units;
		}

		return stylus.utils.coerce(GLOBAL_SIZES, true);
	});

	/**
	 * Returns a normalized sizes dictionary
	 *
	 * @param {!Object} obj - custom sizes dictionary
	 * @param {boolean=} [withGlobal] - if true, then the global table will be mixed to the result
	 * @returns {!Object}
	 */
	style.define('getSizes', (obj, withGlobal) => {
		const
			dict = parseObject(obj);

		if (withGlobal) {
			withGlobal = withGlobal.toBoolean().isTrue;
		}

		if (!dict || !dict.table) {
			throwError('structure');
		}

		if (!withGlobal) {
			normalizeSizeDict(dict.table);

			if (!dict.units) {
				throwError('structure');
			}

			return stylus.utils.coerce(dict, true);
		}

		const merged = {...GLOBAL_SIZES.table, ...dict.table};
		normalizeSizeDict(merged);

		return stylus.utils.coerce({
			table: merged,
			units: dict.units || GLOBAL_SIZES.units
		}, true);
	});
};
