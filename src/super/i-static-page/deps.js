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
		['requestidlecallback', {source: 'src', src: 'assets/lib/requestidlecallback.js'}],
		['eventemitter2', {source: 'src', src: 'assets/lib/eventemitter2.js'}]
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

switch (runtime.engine) {
	case 'vue':
		deps.scripts.set('vue', `vue/dist/vue.runtime${config.webpack.mode() === 'production' ? '.min' : ''}.js`);
		break;

	default:
		if (!runtime.engine) {
			throw new Error('An engine to use is not specified');
		}
}

module.exports = deps;
