/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

module.exports = {
	scripts: new Map([
		['collection.js', ['collection.js/dist/collection.sync.min.js']],
		['vue', [`vue/dist/vue.runtime${isProd ? '.min' : ''}.js`]],
		['requestidlecallback', 'requestidlecallback/index.js'],
		['eventemitter2', 'eventemitter2/lib/eventemitter2.js'],
		['fg-loadcss', 'fg-loadcss/src/loadCSS.js'],
		['fg-loadcss-preload', 'fg-loadcss/src/cssrelpreload.js']
	]),

	styles: new Map()
};
