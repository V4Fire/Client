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
	dasherize = require('string-dasherize');

const
	isLiteral = /^\s*[[{]/,
	isSvgRequire = /require\(.*?\.svg[\\"']+\)/,
	isV4Prop = /^(:|@|v-)/,
	isStaticV4Prop = /^[^[]+$/,
	commaRgxp = /\s*,\s*/;

const isStaticLiteral = (v) => {
	try {
		new Function(`return ${v}`)();
		return true;

	} catch {
		return false;
	}
};

module.exports = [
	/**
	 * Normalizes WebPack SVG require functions
	 *
	 * @param {string} name
	 * @param {!Object} attrs
	 */
	function normalizeSvgRequire({name, attrs}) {
		if (name !== 'img') {
			return;
		}

		const
			src = attrs[':src'];

		if (src && isSvgRequire.test(src[0])) {
			src[0] += '.replace(/^"|"$/g, \'\')';
		}
	},

	/**
	 * Normalizes component attributes
	 * @param {!Object} attrs
	 */
	function normalizeComponentAttrs({attrs}) {
		$C(attrs).forEach((el, key) => {
			if (!isV4Prop.test(key)) {
				return;
			}

			el = $C(el).map((el) => {
				if (Object.isString(el) && isLiteral.test(el) && isStaticLiteral(el)) {
					return `opt.memoizeLiteral(${el})`;
				}

				return el;
			});

			if (key.slice(0, 2) === ':-') {
				attrs[`:data-${key.slice(2)}`] = el;
				delete attrs[key];

			} else if (key === ':key') {
				const
					parts = el.join('').split(commaRgxp),
					val = attrs[key] = parts.slice(-1);

				$C(parts.slice(0, -1)).forEach((key) => {
					if (key.slice(0, 2) === ':-') {
						attrs[`:data-${key.slice(2)}`] = val;

					} else {
						attrs[key] = val;
					}
				});

			} else if (isStaticV4Prop.test(key)) {
				const
					tmp = key[0] === ':' ? dasherize(key) : key.dasherize();

				if (tmp !== key) {
					delete attrs[key];
					attrs[tmp] = el;
				}
			}
		});
	}
];
