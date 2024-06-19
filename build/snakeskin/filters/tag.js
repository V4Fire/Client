/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	{webpack} = require('@v4fire/config'),
	{isV4Prop} = include('build/snakeskin/filters/const');

module.exports = [
	/**
	 * Normalizes Webpack SVG `require` attributes
	 *
	 * @param {object} opts
	 * @param {string} opts.name
	 * @param {object} opts.attrs
	 */
	function normalizeSvgRequire({name, attrs}) {
		if (name !== 'img') {
			return;
		}

		const src = attrs[':src'];

		if (src && /require\(.*?\.svg["'\\]+\)/.test(src[0])) {
			src[0] += '.replace(/^"|"$/g, \'\')';
		}
	},

	/**
	 * Normalizes V4Fire tag attributes
	 *
	 * @param {object} opts
	 * @param {string} opts.isSimpleTag
	 * @param {string} opts.isFunctional
	 * @param {string} opts.vFuncDir
	 * @param {object} opts.attrs
	 */
	function normalizeV4Attrs({isSimpleTag, isFunctional, vFuncDir, attrs}) {
		if (webpack.ssr) {
			delete attrs['v-once'];
			delete attrs['v-memo'];

		// To ensure correct functioning on the client side with functional components,
		// we normalize all calls to the v-attrs directive as props
		} else if (attrs['v-attrs']) {
			attrs[':v-attrs'] = attrs['v-attrs'].slice();
			delete attrs['v-attrs'];
		}

		let vRef = 'v-ref';

		// Adding the v-ref directive to a non-functional component can lead to excessive re-renders
		// with any change in the parent state, so we add it as a prop
		if (!isSimpleTag && !isFunctional && !vFuncDir) {
			vRef = `:${vRef}`;
		}

		Object.entries(attrs).forEach(([key, attr]) => {
			if (key === 'ref') {
				const ref = attrs[key][0];

				attrs[':ref'] = [`$resolveRef('${ref}')`];
				attrs[vRef] = [`'${ref}'`];

				delete attrs['ref'];
				return;
			}

			if (key === ':ref') {
				const ref = attrs[key];

				attrs[':ref'] = [`$resolveRef(${ref})`];
				attrs[vRef] = ref;

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

			const dataAttrBind = ':-';

			if (key.startsWith(dataAttrBind)) {
				attrs[`:data-${key.slice(dataAttrBind.length)}`] = attr;
				delete attrs[key];
			}
		});
	}
];
