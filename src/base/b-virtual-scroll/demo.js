/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	pzlr = require('@pzlr/build-core'),
	path = require('upath');

const
	componentDir = pzlr.resolve.blockSync('b-virtual-scroll'),
	preset = require(path.join(componentDir, `test/presets.js`));

module.exports = preset;
