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
	 * Normalizes V4Fire tag attributes
	 * @param {!Object} attrs
	 */
	function normalizeV4Attrs({attrs}) {
		Object.forEach(attrs, (attr, key) => {
			if (key === 'ref') {
				const
					ref = attrs[key][0];

				attrs[':ref'] = [`$resolveRef('${ref}')`];
				attrs['v-ref'] = [`'${ref}'`];

				delete attrs['ref'];
				return;
			}

			if (key === ':ref') {
				const
					ref = attrs[key];

				attrs[':ref'] = [`$resolveRef(${ref})`];
				attrs['v-ref'] = ref;

				return;
			}

			if (
				key === 'v-on' ||
				key.startsWith('@') ||
				key.startsWith('v-on:')
			) {
				attrs['data-has-v-on-directives'] = [];
				return;
			}

			if (!isV4Prop.test(key)) {
				return;
			}

			const
				dataAttrBind = ':-';

			if (key.startsWith(dataAttrBind)) {
				attrs[`:data-${key.slice(dataAttrBind.length)}`] = attr;
				delete attrs[key];
				return;
			}

			if (isStaticV4Prop.test(key)) {
				const
					tmp = key.dasherize(key.startsWith(':'));

				if (tmp !== key) {
					delete attrs[key];
					attrs[tmp] = attr;
				}
			}
		});
	}
];
