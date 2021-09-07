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
	config = require('config');

const
	escaper = require('escaper'),
	Typograf = require('typograf');

const
	tp = new Typograf(config.typograf());

const
	literalRgxp = /typograf`(?:\\[\s\S]|[^`\\])*?`/g,
	chunkRgxp = /^(?=})?(.*?)(?=\${)?$/;

const
	tagLength = 'typograf'.length,
	escaperRules = {'`': false};

/**
 * Webpack loader for typograf`...` literals
 *
 * @param {string} str
 * @returns {string}
 *
 * @example
 * ```js
 * console.log(typograf`Hello "user"!`);
 * ```
 */
module.exports = function typografLoader(str) {
	const
		content = [];

	str = escaper
		.replace(str, escaperRules, content);

	str = str.replace(literalRgxp, (str) => {
		const
			escapedFragments = [];

		str = escaper.replace(str, escapedFragments);
		$C(chunks).set((el) => el.replace(chunkRgxp, (str, val) => tp.execute(val)));

		return escaper.paste(str.slice(tagLength), escapedFragments);
	});

	return escaper.paste(str, content);
};

Object.assign(module.exports, {
	literalRgxp,
	chunkRgxp
});
