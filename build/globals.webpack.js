'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable quote-props */

const
	s = JSON.stringify;

module.exports = {
	IS_PROD,
	LANG: s(LANG),
	API_URL: s(API_URL),
	APP_NAME: s(APP_NAME),
	'process.env': {
		NODE_ENV: s(process.env.NODE_ENV)
	}
};
