/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config');

const deps = module.exports = {
	scripts: new Map([
		['vue', [`vue/dist/vue.runtime${isProd ? '.min' : ''}.js`]],
		['requestidlecallback', 'requestidlecallback/index.js'],
		['eventemitter2', 'eventemitter2/lib/eventemitter2.js']
	]),

	styles: new Map()
};

if (!config.webpack.fatHTML()) {
	deps.scripts.set('fg-loadcss', 'fg-loadcss/src/loadCSS.js');
	deps.scripts.set('fg-loadcss-preload', 'fg-loadcss/src/cssrelpreload.js');
}
