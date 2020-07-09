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
	{RUNTIME} = include('build/entries.webpack');

const
	externals = [],
	rgxp = /^\/(.*?)\/$/;

const externalMap = $C(config.webpack.externals).filter((el, key) => {
	if (!rgxp.test(key)) {
		return true;
	}

	const
		r = new RegExp(RegExp.$1);

	externals.push((ctx, req, cb) => {
		if (r.test(req)) {
			return cb(null, `root ${Object.isObject(el) ? el.root : el}`);
		}

		cb();
	});

	return false;

}).map();

/**
 * Returns options for WebPack ".externals"
 *
 * @param {(number|string)} buildId - build id
 * @returns {!Array}
 */
module.exports = function externals({buildId}) {
	if (buildId === RUNTIME) {
		return [externalMap].concat(externals);
	}

	return [];
};
