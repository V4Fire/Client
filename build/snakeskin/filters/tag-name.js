'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	Snakeskin = require('snakeskin'),
	escaper = require('escaper');

const
	{validators} = require('@pzlr/build-core');

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
			attrs['v4-composite'] = attrs[':instance-of'] = [tag.slice(1)];
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

const
	tagRgxp = /<[^>]+>/,
	elRgxp = new RegExp(`\\b${validators.baseBlockName}__[a-z0-9][a-z0-9-_]*\\b`);

Snakeskin.importFilters({
	/**
	 * Returns a first element name
	 *
	 * @param {string} decl
	 * @returns {?string}
	 */
	getFirstTagElementName(decl) {
		const
			escapedStr = escaper.replace(decl),
			tagMatch = tagRgxp.exec(escapedStr);

		if (!tagMatch) {
			return null;
		}

		const search = elRgxp.exec(escaper.paste(tagMatch[0]));
		return search ? search[0] : null;
	}
});
