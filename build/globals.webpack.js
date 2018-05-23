'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config'),
	s = JSON.stringify;

module.exports = {
	'IS_PROD': isProd,
	'API_URL': s(config.apiURL()),
	'APP_NAME': s(config.appName),
	'process.env': {
		NODE_ENV: s(process.env.NODE_ENV)
	}
};
