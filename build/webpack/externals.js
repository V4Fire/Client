/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	$C = require('collection.js');

const
	{webpack} = require('@config/config');

const
	{STANDALONE} = include('build/const');

const
	externalList = [],
	asRgxp = /^\/(.*?)\/$/;

const externalMap = $C(webpack.externals()).filter((el, key) => {
	if (!asRgxp.test(key)) {
		return true;
	}

	const
		rgxp = new RegExp(RegExp.$1);

	externalList.push((ctx, req, cb) => {
		if (rgxp.test(req)) {
			return cb(null, `root ${Object.isDictionary(el) ? el.root : el}`);
		}

		cb();
	});

	return false;

}).map();

/**
 * Returns parameters for `webpack.externals`
 *
 * @param {(number|string)} buildId
 * @returns {Array}
 */
module.exports = function externals({buildId}) {
	if (buildId !== STANDALONE) {
		return [externalMap].concat(externalList);
	}

	return [];
};
