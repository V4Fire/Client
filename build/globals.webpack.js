'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config');

module.exports = {
	'IS_PROD': isProd,
	'API_URL': JSON.stringify(config.apiURL()),
	'process.env': {
		NODE_ENV: JSON.stringify(process.env.NODE_ENV)
	}
};
