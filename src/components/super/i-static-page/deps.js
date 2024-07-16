/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	config = require('@config/config'),
	{Libs, StyleLibs, Links} = require('./modules/interface');

const
	{ssr} = config.webpack,
	runtime = config.runtime();

const deps = {
	/**
	 * A map of script libraries to require
	 * @type {Libs}
	 */
	scripts: new Map(
		[
			['requestidlecallback', {source: 'src', src: 'assets/lib/requestidlecallback.js'}],
			['eventemitter2', {source: 'src', src: 'assets/lib/eventemitter2.js'}]
		]
	),

	/**
	 * A map of script libraries to require: the scripts are placed within the head tag
	 * @type {Libs}
	 */
	headScripts: new Map(),

	/**
	 * A map of style libraries to require
	 * @type {StyleLibs}
	 */
	styles: new Map(),

	/**
	 * A map of links to require
	 * @type {Links}
	 */
	links: new Map()
};

if (!ssr) {
	switch (runtime.engine) {
		case 'vue3':
			deps.scripts.set('vue', `vue/dist/vue.runtime.global${config.webpack.mode() === 'production' ? '.prod' : ''}.js`);
			break;

		default:
			if (!runtime.engine) {
				throw new Error('The engine to use is not specified');
			}
	}
}

module.exports = deps;
