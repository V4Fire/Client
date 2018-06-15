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
	{attachClass} = include('build/filters/helpers');

const
	isLiteral = /^\s*[[{]/,
	isSvgRequire = /require\(.*?\.svg[\\"']+\)/,
	isVueProp = /^(:|@|v-)/,
	commaRgxp = /\s*,\s*/;

const isRef = {
	'ref': true,
	':ref': true
};

const isStaticLiteral = (v) => {
	try {
		new Function(`return ${v}`)();
		return true;

	} catch (_) {
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
	 * Normalizes Vue attributes
	 * @param {!Object} attrs
	 */
	function normalizeVueAttrs({attrs}) {
		$C(attrs).forEach((el, key) => {
			if (isRef[key]) {
				attrs['data-vue-ref'] = [el];

				if (!attrs[':class']) {
					attrs[':class'] = attachClass(['componentId']);
				}
			}

			if (!isVueProp.test(key)) {
				return;
			}

			el = $C(el).map((el) => {
				if (Object.isString(el) && isLiteral.test(el) && isStaticLiteral(el)) {
					return `memoizeLiteral(${el})`;
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

			} else {
				const
					tmp = key.dasherize();

				if (tmp !== key) {
					delete attrs[key];
					attrs[tmp] = el;
				}
			}
		});
	}
];
