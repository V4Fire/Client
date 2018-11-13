'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	isVoidLink = /^a:void$/,
	isButtonLink = /^button:a$/;

module.exports = [
	/**
	 * Converts tag aliases
	 *
	 * @param {string} tag
	 * @param {!Object} attrs
	 * @param {string} rootTag
	 * @returns {string}
	 */
	function convertAliases(tag, attrs, rootTag) {
		if (tag[0] === '@') {
			attrs[':reg-v4-composite'] = ['$compositeI=($compositeI || 0) + 1'];
			attrs['v4-composite'] = [tag.slice(1)];
			return 'span';
		}

		if (isVoidLink.test(tag)) {
			attrs.href = ['javascript:void(0)'];
			return 'a';
		}

		if (isButtonLink.test(tag)) {
			attrs.type = ['button'];
			attrs.class = (attrs.class || []).concat('a');
			return 'button';
		}

		if (tag === '_') {
			return rootTag;
		}

		return tag;
	}
];
