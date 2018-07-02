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
	Typograf = require('typograf'),
	escaper = require('escaper');

const
	tp = new Typograf(include('build/typograf.rules'));

const
	literalsRgxp = /typograf`(?:(?:\\[\s\S]|[^`\\])*?)`/g,
	chunkRgxp = /^(?=})?(.*?)(?=\${)?$/;

const
	tagLength = 'typograf'.length,
	escaperRules = {'@all': true, '`': false};

/**
 * Monic replacer for typograf`...` literals
 *
 * @param {string} str
 * @returns {string}
 */
module.exports = function (str) {
	const
		chunks = [];

	str = escaper.replace(str, escaperRules, chunks);
	str = str.replace(literalsRgxp, (str) => {
		const
			chunks = [];

		str = escaper.replace(str, true, chunks);
		$C(chunks).set((el) => el.replace(chunkRgxp, (str, val) => tp.execute(val)));

		return escaper.paste(str.slice(tagLength), chunks);
	});

	return escaper.paste(str, chunks);
};
