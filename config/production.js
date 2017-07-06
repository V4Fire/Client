'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

module.exports = {
	sentry: {
		url: process.env.SENTRY_URL
	},

	externals: {
		'raven-js': 'Raven'
	}
};
