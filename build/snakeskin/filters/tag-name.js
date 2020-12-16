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
	{isVoidLink, isButtonLink, tagRgxp, componentElRgxp} = include('build/snakeskin/filters/const');

module.exports = [
	/**
	 * Expands tag name snippets
	 *
	 * @param {string} tag
	 * @param {!Object} attrs
	 * @param {string} rootTag
	 * @returns {string}
	 *
	 * @example
	 * ```
	 * < @b-button
	 * < a:void
	 * < button:a
	 * ```
	 */
	function expandTagSnippets(tag, attrs, rootTag) {
		if (tag[0] === '@') {
			attrs['v4-flyweight-component'] = [tag.slice(1)];
			attrs[':instance-of'] = attrs['v4-flyweight-component'];
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

Snakeskin.importFilters({
	/**
	 * Returns the first name of an element
	 *
	 * @param {string} decl
	 * @returns {?string}
	 */
	getFirstTagElementName(decl) {
		const
			escapedFragments = [],
			escapedStr = escaper.replace(decl, escapedFragments);

		const
			tagMatch = tagRgxp.exec(escapedStr);

		if (!tagMatch) {
			return null;
		}

		const search = componentElRgxp.exec(escaper.paste(tagMatch[0], escapedFragments));
		return search ? search[0] : null;
	}
});
