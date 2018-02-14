'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

module.exports = {
	CONFIG: {},
	'process.env': {
		NODE_ENV: JSON.stringify(process.env.NODE_ENV),
		IS_PROD: isProd
	}
};
