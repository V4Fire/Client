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
	Escaper = require('escaper');

const
	{tagRgxp, componentElRgxp} = include('build/snakeskin/filters/const');

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
			escapedStr = Escaper.replace(decl, escapedFragments);

		const
			tagMatch = tagRgxp.exec(escapedStr);

		if (!tagMatch) {
			return null;
		}

		const search = componentElRgxp.exec(Escaper.paste(tagMatch[0], escapedFragments));
		return search ? search[0] : null;
	}
});
