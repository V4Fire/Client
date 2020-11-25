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
	Typograf = require('typograf');

const
	escaper = require('escaper'),
	config = require('config');

const
	tp = new Typograf(config.typograf());

const
	literalRgxp = /typograf`(?:(?:\\[\s\S]|[^`\\])*?)`/g,
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
	str = escaper.replace(str, escaperRules).replace(literalRgxp, (str) => {
		str = escaper.replace(str);
		$C(chunks).set((el) => el.replace(chunkRgxp, (str, val) => tp.execute(val)));
		return escaper.paste(str.slice(tagLength));
	});

	return escaper.paste(str);
};

Object.assign(module.exports, {
	literalRgxp,
	chunkRgxp
});
