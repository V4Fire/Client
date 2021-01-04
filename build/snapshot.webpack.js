'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Options for WebPack ".snapshot"
 */
module.exports = {
	...!IS_PROD ? {managedPaths: []} : {}
};
