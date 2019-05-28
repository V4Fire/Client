'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	tagReg = /^(['"])<(link|script)([^>]*)>/;


exports.addNonce = function (tag) {
	if (tagReg.test(tag)) {
		return tag.replace(tagReg, `$1<$2$3$1 + (typeof GLOBAL_NONCE === 'string' ? ' nonce="' + GLOBAL_NONCE + '"') + $1>`);
	}

	return tag;
};
