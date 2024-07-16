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

const deps = {
	/**
	 * A map of script libraries to require
	 * @type {Libs}
	 */
	scripts: new Map(
		[
			['requestidlecallback', {source: 'src', src: 'assets/lib/requestidlecallback.js'}],
			['eventemitter2', {source: 'src', src: 'assets/lib/eventemitter2.js'}],
			!config.webpack.fatHTML() && ['vue', {source: 'output', src: `${config.webpack.output({name: 'lib'})}/vue.js`}]
		].filter(Boolean)
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

module.exports = deps;
