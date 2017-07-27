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
	isPathInside = require('is-path-inside'),
	path = require('path'),
	prop = require('@v4fire/core/build/prop');

/**
 * WebPack loader for using Flow with Vue
 * @param {string} str
 */
module.exports = function (str) {
	const
		ctx = this.context;

	if (!$C(this.query.modules).some((src) => isPathInside(ctx, src)) || /^g-/.test(path.basename(ctx))) {
		return str;
	}

	return prop(str, 'component', true);
};
