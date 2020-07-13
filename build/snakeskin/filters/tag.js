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
	{isObjLiteral, isSvgRequire, isV4Prop, isStaticV4Prop, commaRgxp} = include('build/snakeskin/filters/const');

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
	 * Normalizes component attributes: adds memoization, expands aliases, etc.
	 * @param {!Object} attrs
	 */
	function normalizeComponentAttrs({attrs}) {
		$C(attrs).forEach((el, key) => {
			if (!isV4Prop.test(key)) {
				return;
			}

			el = $C(el).map((el) => {
				if (Object.isString(el) && isObjLiteral.test(el) && isStaticLiteral(el)) {
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
					val = parts.slice(-1);

				attrs[key] = val;

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

function isStaticLiteral(v) {
	try {
		// eslint-disable-next-line no-new-func
		Function(`return ${v}`)();
		return true;

	} catch {
		return false;
	}
}
