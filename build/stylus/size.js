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
	DEFAULT_UNITS = 'rem',
	CHECKER = /(^x*)([s|l]$)|(^m$)/g,
	GLOBAL = {
		sizes: {
			table: {},
			units: DEFAULT_UNITS
		}
	};

/**
 * Throws an error for sizes depends on a type
 *
 * @param {string} type - error type
 * @param {string[]} args - comments list for the output string
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
 * Attempt to parse object node to the javascript object
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
 * Validates values and keys, returns sorted size keys by ascending
 *
 * @param {!Object} values
 * @returns {string[]}
 */
function checkAndSortSizeKeys(values) {
	return Object.keys(values).sort((a, b) => {
		const
			replacer = (str, p1, p2, p3) => p3 ? 0 : (p1.length || 0.5) * {s: -1, l: 1}[p2],
			keyA = Number(a.replace(CHECKER, replacer)),
			keyB = Number(b.replace(CHECKER, replacer));

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
	 * Extends (or replace if replace flag equals true)
	 * table of presented sizes, or set new size table and size units
	 *
	 * @param {!Object} obj - sizes dictionary
	 * @param {boolean} [replace] - flag for replacing the global table
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

		if (!Object.keys(GLOBAL.sizes.table).length || replace) {
			checkAndSortSizeKeys(dict.table);
			GLOBAL.sizes.table = dict.table[0];

		} else {
			const merged = {...GLOBAL.sizes.table, ...dict.table[0]};
			checkAndSortSizeKeys(merged);
			GLOBAL.sizes.table = merged;
		}

		if (dict.units) {
			GLOBAL.sizes.units = dict.units;
		}

		return stylus.utils.coerce(GLOBAL.sizes, true);
	});

	/**
	 * Returns sizes dictionary without changes at the GLOBAL
	 *
	 * @param {Object} obj - sizes dictionary
	 * @param {boolean=} [extendGlobal] - flag for extending the global table
	 * @returns {Object}
	 */
	style.define('getSizes', (obj, extendGlobal) => {
		const
			dict = parseObject(obj);

		if (extendGlobal) {
			extendGlobal = extendGlobal.toBoolean().isTrue;
		}

		if (!dict || !dict.table) {
			throwError('structure');
		}

		if (!extendGlobal) {
			checkAndSortSizeKeys(dict.table);

			if (!dict.units) {
				throwError('structure');
			}

			return stylus.utils.coerce(dict, true);
		}

		const
			merged = {...GLOBAL.sizes.table, ...dict.table};

		checkAndSortSizeKeys(merged);

		return stylus.utils.coerce({
			table: merged,
			units: dict.units || GLOBAL.sizes.units
		}, true);
	});
};
