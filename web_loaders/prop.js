'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	isPathInside = require('is-path-inside'),
	path = require('path'),
	prop = require('@v4fire/core/build/prop');

/**
 * WebPack loader for using Flow with Vue
 * @param {string} str
 */
module.exports = function (str) {
	this.cacheable && this.cacheable();
	if (!isPathInside(this.context, './src/blocks') || /^(g-|i-base$)/.test(path.basename(this.context))) {
		return str;
	}

	return prop(str, 'component', true);
};
