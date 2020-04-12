'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	Snakeskin = require('snakeskin');

const
	tagNonceRgxp = /^(['"])<(link|script)([^>]*)>/;

Snakeskin.importFilters({
	/**
	 * Adds a runtime nonce attribute to the specified tag if GLOBAL_NONCE is defined
	 *
	 * @param {string} tag
	 * @returns {string}
	 */
	addNonce(tag) {
		if (tagNonceRgxp.test(tag)) {
			return tag.replace(tagNonceRgxp, `$1<$2$3$1 + (typeof GLOBAL_NONCE === 'string' ? ' nonce="' + GLOBAL_NONCE + '"' : '') + $1>`);
		}

		return tag;
	}
});

Snakeskin.setFilterParams('addNonce', {
	'!html': true
});
