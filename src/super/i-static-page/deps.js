/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config'),
	runtime = config.runtime();

const deps = module.exports = {
	/**
	 * @type {Map<(string|{
	 *   src: string,
	 *   source?: ('lib'|'src'|'output'),
	 *   inline?: boolean,
	 *   defer?: boolean,
	 *   async?: boolean,
	 *   module?: boolean,
	 *   load?: boolean
	 * })>}
	 */
	scripts: new Map([
		['requestidlecallback', 'requestidlecallback/index.js'],
		['eventemitter2', 'eventemitter2/lib/eventemitter2.js']
	]),

	/** @see deps.scripts */
	headScripts: new Map(),

	/**
	 * @type {Map<(string|{
	 *   src: string,
	 *   source?: ('lib'|'src'|'output'),
	 *   inline?: boolean,
	 *   defer?: boolean
	 * })>}
	 */
	styles: new Map()
};

if (runtime.debug) {
	deps.scripts.set('jasmine-core', 'jasmine-core/lib/jasmine-core/jasmine.js');
	deps.scripts.set('jasmine-html', 'jasmine-core/lib/jasmine-core/jasmine-html.js');
	deps.scripts.set('jasmine-boot', 'jasmine-core/lib/jasmine-core/boot.js');
	deps.styles.set('jasmine', 'jasmine-core/lib/jasmine-core/jasmine.css');
}

if (runtime.engine === 'vue') {
	deps.scripts.set('vue', {
		defer: false,
		src: `vue/dist/vue.runtime${isProd ? '.min' : ''}.js`
	});
}

if (!config.webpack.fatHTML() && deps.styles.size) {
	deps.scripts.set('fg-loadcss', 'fg-loadcss/src/loadCSS.js');
	deps.scripts.set('fg-loadcss-preload', 'fg-loadcss/src/cssrelpreload.js');
}
