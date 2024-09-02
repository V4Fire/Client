/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

// const {webpack} = require('@config/config');

/**
 * Returns options for other webpack options
 * @returns {object}
 */
module.exports = function other() {
	return {
		// Unsupported in rspack
		// parallelism: webpack.moduleParallelism()
	};
};
