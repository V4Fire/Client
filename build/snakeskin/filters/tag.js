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
	{isV4Prop, isStaticV4Prop} = include('build/snakeskin/filters/const');

module.exports = [
	/**
	 * Normalizes Webpack SVG `require` attributes
	 *
	 * @param {object} params
	 * @param {string} params.tag
	 * @param {object} params.attrs
	 */
	function normalizeSvgRequire({tag, attrs}) {
		if (tag !== 'img') {
			return;
		}

		const
			src = attrs[':src'];

		if (src && /require\(.*?\.svg["'\\]+\)/.test(src[0])) {
			src[0] += '.replace(/^"|"$/g, \'\')';
		}
	},

	/**
	 * Normalizes V4Fire tag attributes
	 *
	 * @param {object} params
	 * @param {object} params.tplName
	 * @param {object} params.attrs
	 * @param {object} params.forceRenderAsVNode
	 * @throws {Error} if the attributes contain invalid values
	 */
	function normalizeV4Attrs({tplName, attrs, forceRenderAsVNode}) {
		if (attrs['class'] && !attrs['class'].join().trim()) {
			delete attrs['class'];
		}

		if (webpack.ssr) {
			delete attrs['v-once'];
			delete attrs['v-memo'];

			if (attrs['v-render'] && forceRenderAsVNode === false) {
				throw new Error(`("${tplName}") To use the \`v-render\` directive with SSR, you need to switch the component to rendering mode in VNODE using the \`forceRenderAsVNode\` constant`);
			}
		}

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
