'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	querystring = require('querystring'),
	{parseObject} = include('build/stylus/object');

/**
 * Parameters to create an url:
 *
 * @typedef {{
 *   href?: string,
 *   query?: Object,
 *   hash?: string
 * }} URLParams
 */

module.exports = function addPlugins(api) {
	/**
	 * Converts the specified object to an url string
	 *
	 * @see https://nodejs.org/api/url.html#url_class_url
	 *
	 * @param {URLParams} params
	 * @returns {string}
	 */
	api.define('formatURL', (params) => {
		const
			parsedOpts = parseObject(params);

		let
			href = '',
			search = '',
			hash = '';

		if (Object.isString(parsedOpts.href)) {
			href = parsedOpts.href;
		}

		if (Object.isObject(parsedOpts.query)) {
			search = `?${querystring.stringify(parsedOpts.query)}`;
		}

		if (Object.isString(parsedOpts.hash)) {
			hash = `#${parsedOpts.hash}`;
		}

		return [href, hash, search].join('');
	});

	/**
	 * Converts the specified object to a query string
	 *
	 * @see https://nodejs.org/api/querystring.html#querystring_querystring_stringify_obj_sep_eq_options
	 * @param {Object} obj
	 *
	 * @returns {string}
	 */
	api.define('toQueryString', (obj) => {
		const
			parsedOpts = parseObject(obj);

		return querystring.stringify(parsedOpts);
	});
};
