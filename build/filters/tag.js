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
	dasherize = require('string-dasherize');

const
	isLiteral = /^\s*[[{]/,
	isSvgRequire = /require\(.*?\.svg[\\"']+\)/,
	isV4Prop = /^(:|@|v-)/,
	isStaticV4Prop = /^[^[]+$/,
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
	 * Normalizes component attributes
	 * @param {!Object} attrs
	 */
	function normalizeComponentAttrs({attrs}) {
		$C(attrs).forEach((el, key) => {
			if (isRef[key]) {
				attrs['data-component-ref'] = [el];

				if (!attrs[':class']) {
					attrs[':class'] = attachClass(['componentId']);
				}
			}

			if (!isV4Prop.test(key)) {
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

			} else if (isStaticV4Prop.test(key)) {
				const
					tmp = key[0] === ':' ? dasherize(key) : key.dasherize();

				if (tmp !== key) {
					delete attrs[key];
					attrs[tmp] = el;
				}
			}
		});
	},

	/**
	 * Sets an image to a tag. If the tag name is img, it will be set as src
	 * otherwise it will be set as background-image in a style attribute
	 *
	 * @param {string} name
	 * @param {!Object} attrs
	 */
	function setImageSrc({name, attrs}) {
		if (attrs['v-image']) {
			const src = attrs['v-image'][0];

			if (name === 'img') {
				attrs[':src'] = [src];

			} else {
				attrs[':style'] = [`{backgroundImage: 'url(' + ${src} + ')'}`];
			}

			delete attrs['v-image'];
		}
	}
];
