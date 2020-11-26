/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('./modules/interface');

const
	config = require('config'),
	runtime = config.runtime();

const deps = {
	/**
	 * Map of script libraries to require
	 * @type {Libs}
	 */
	scripts: new Map([
		['requestidlecallback', 'requestidlecallback/index.js'],
		['eventemitter2', 'eventemitter2/lib/eventemitter2.js']
	]),

	/**
	 * Map of script libraries to require: the scripts are placed within the head tag
	 * @type {Libs}
	 */
	headScripts: new Map(),

	/**
	 * Map of style libraries to require
	 * @type {StyleLibs}
	 */
	styles: new Map(),

	/**
	 * Map of links to require
	 * @type {Links}
	 */
	links: new Map()
};

if (runtime.debug) {
	deps.scripts.set('jasmine-core', 'jasmine-core/lib/jasmine-core/jasmine.js');
	deps.scripts.set('jasmine-html', 'jasmine-core/lib/jasmine-core/jasmine-html.js');
	deps.scripts.set('jasmine-boot', 'jasmine-core/lib/jasmine-core/boot.js');
	deps.styles.set('jasmine', 'jasmine-core/lib/jasmine-core/jasmine.css');
}

switch (runtime.engine) {
	case 'vue':
		deps.scripts.set('vue', {
			defer: false,
			src: `vue/dist/vue.runtime${config.webpack.mode() === 'production' ? '.min' : ''}.js`
		});

		break;

	default:
		if (!runtime.engine) {
			throw new Error('The engine to use is not specified');
		}
}

module.exports = deps;
