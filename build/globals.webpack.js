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
	config = require('config'),
	s = JSON.stringify;

module.exports = {
	IS_PROD,
	LOCALE: s(LOCALE),
	API_URL: s(API_URL),
	APP_NAME: s(APP_NAME),
	PUBLIC_PATH: s(config.webpack.publicPath()),
	MODULE_DEPENDENCIES: s(`ModuleDependencies_${Number.random(1e6)}`),
	'process.env': {
		NODE_ENV: s(process.env.NODE_ENV)
	}
};
