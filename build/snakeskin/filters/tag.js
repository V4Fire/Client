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
	 * @param {object} params
	 * @param {string} params.tag
	 * @param {object} params.attrs
	 */
	function normalizeSvgRequire({tag, attrs}) {
		if (tag !== 'img') {
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
	 * @param {object} params
	 * @param {object} params.tplName
	 * @param {object} params.forceRenderAsVNode
	 * @param {object} params.attrs
	 * @param {string} params.isSimpleTag
	 * @param {string} params.isFunctional
	 * @param {string} params.vFuncDir
	 * @param {boolean} params.isWebComponent
	 * @throws {Error} if the attributes contain invalid values
	 */
	function normalizeV4Attrs({
		tplName,
		forceRenderAsVNode,
		attrs,
		isSimpleTag,
		isFunctional,
		vFuncDir,
		isWebComponent
	}) {
		// Remove empty class attributes
		if (attrs['class'] && !attrs['class'].join().trim()) {
			delete attrs['class'];
		}

		// To ensure correct functioning on the client side with functional components,
		// we normalize all calls to the v-attrs directive as props, except for web components
		if (!isWebComponent) {
			if (attrs['v-attrs']) {
				attrs[':v-attrs'] = attrs['v-attrs'].slice();
				delete attrs['v-attrs'];
			}

		// For the web components v-attrs must be normalized to the directive
		} else if (attrs[':v-attrs']) {
			attrs['v-attrs'] = attrs[':v-attrs'].slice();
			delete attrs[':v-attrs'];
		}

		if (webpack.ssr) {
			// In SSR, these directives are meaningless
			delete attrs['v-once'];
			delete attrs['v-memo'];

			// For the v-render directive to work, compilation into an intermediate VDOM is required
			if (attrs['v-render'] && forceRenderAsVNode === false) {
				throw new Error(`("${tplName}") To use the \`v-render\` directive with SSR, you need to switch the component to rendering mode in VNODE using the \`forceRenderAsVNode\` constant`);
			}
		}

		// Ensuring correct functioning of refs inside functional components
		let vRef = 'v-ref';

		// Adding the v-ref directive to a non-functional component can lead to excessive re-renders
		// with any change in the parent state, so we add it as a prop
		if (!isSimpleTag && !isFunctional && vFuncDir !== 'true') {
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

			// Ensuring correct functioning of refs inside functional components
			if (key === ':ref') {
				const ref = attrs[key];

				attrs[':ref'] = [`$resolveRef(${ref})`];
				attrs[vRef] = ref;

				return;
			}

			// For event handler optimization
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

			// Sugar syntax for :data- attributes
			const dataAttrBind = ':-';

			if (key.startsWith(dataAttrBind)) {
				attrs[`:data-${key.slice(dataAttrBind.length)}`] = attr;
				delete attrs[key];
			}
		});
	}
];
