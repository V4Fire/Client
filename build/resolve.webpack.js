'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{src} = require('config'),
	{resolve} = require('@pzlr/build-core');

/**
 * Options for WebPack ".resolve"
 */
module.exports = {
	extensions: ['.ts', '.js', '.json'],
	modules: [...new Set([resolve.blockSync(), resolve.sourceDir, src.cwd(), ...resolve.rootDependencies, src.lib()])],
	alias: include('build/alias.webpack')
};
