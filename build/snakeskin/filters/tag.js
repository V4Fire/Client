'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{isV4Prop, isStaticV4Prop} = include('build/snakeskin/filters/const');

module.exports = [
	/**
	 * Normalizes Webpack SVG `require` attributes
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

		if (src && /require\(.*?\.svg[\\"']+\)/.test(src[0])) {
			src[0] += '.replace(/^"|"$/g, \'\')';
		}
	},

	/**
	 * Normalizes component attributes
	 * @param {!Object} attrs
	 */
	function normalizeComponentAttrs({attrs}) {
		Object.forEach(attrs, (el, key) => {
			if (!isV4Prop.test(key)) {
				return;
			}

			const
				dataAttrBind = ':-';

			if (key.startsWith(dataAttrBind)) {
				attrs[`:data-${key.slice(dataAttrBind.length)}`] = el;
				delete attrs[key];

			} else if (isStaticV4Prop.test(key)) {
				const
					tmp = key.dasherize(key[0] === ':');

				if (tmp !== key) {
					delete attrs[key];
					attrs[tmp] = el;
				}
			}
		});
	}
];
