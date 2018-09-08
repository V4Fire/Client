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
		if (isVoidLink.test(tag)) {
			attrs.href = ['javascript:void(0)'];
			tag = 'a';

		} else if (isButtonLink.test(tag)) {
			attrs.type = ['button'];
			attrs.class = (attrs.class || []).concat('a');
			tag = 'button';

		} else if (tag === '_') {
			tag = rootTag;
		}

		return tag;
	}
];
