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

}).map();

/**
 * Parameters for webpack.externals
 */
module.exports = [externalMap].concat(externals);
