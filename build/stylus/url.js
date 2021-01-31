'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	url = require('url'),
	{parseObject} = include('build/stylus/object');

module.exports = function addPlugins(api) {
	/**
	 * Converts the specified object to an url string
	 *
	 * @param {object} obj
	 * @see https://nodejs.org/api/url.html#url_class_url
	 */
	api.define('formatURL', (obj) => {
		const urlObject = parseObject(obj);
		return url.format(urlObject);
	});
};
