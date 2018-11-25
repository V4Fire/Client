'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	escaper = require('escaper');

const
	isPrelude = /\/core\/prelude\//,
	isProto = /\.prototype$/,
	extendRgxp = /extend\(([^,]+),\s*['"]([^'",]+)/g;

const
	methods = new Map();

let
	replaceRgxp;

/**
 * Monic replacer for prelude module
 *
 * @param {string} str
 * @param {string} file
 * @returns {string}
 */
module.exports = function (str, file) {
	if (isPrelude.test(file)) {
		let
			decl;

		while ((decl = extendRgxp.exec(str))) {
			const
				target = decl[1],
				method = decl[2],
				protoMethod = isProto.test(target);

			methods.set(
				RegExp.escape(`${protoMethod ? `.${method}` : `${target}.${method}`}(`),
				`${protoMethod ? '' : target}[Symbol.for('[[V4_PROP_TRAP:${method}]]')](`
			);
		}

		if (methods.size) {
			replaceRgxp = new RegExp([...methods.keys()].join('|'), 'g');
		}
	}

	if (replaceRgxp) {
		str = str.replace(replaceRgxp, (str) => methods.get(RegExp.escape(str)));
	}

	return str;
};
