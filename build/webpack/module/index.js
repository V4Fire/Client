/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	{isTsFile, isJsFile, urlLoaderOpts} = include('build/webpack/module/const');

const
	rules = include('build/webpack/module/rules');

/**
 * @typedef {object} ModuleArgs
 * @prop {Map<string, object>} plugins - list of plugins
 */

/**
 * Returns parameters for `webpack.module`
 *
 * @param {ModuleArgs} args
 * @returns {Promise<object>}
 */
module.exports = async function module(args) {
	const loaders = {
		rules: new Map()
	};

	loaders.rules.set('ts', await rules.typescript(args));
	loaders.rules.set('js', await rules.javascript(args));
	loaders.rules.set('styl', await rules.stylus(args));
	loaders.rules.set('ess', await rules.executableSnakeskin(args));
	loaders.rules.set('ss', await rules.snakeskin(args));

	loaders.rules.set('assets', await rules.assets(args));
	loaders.rules.set('img', await rules.images(args));
	loaders.rules.set('img.webp', await rules.imagesWebp(args));
	loaders.rules.set('img.svg', await rules.imagesSvg(args));

	return loaders;
};

Object.assign(module.exports, {
	urlLoaderOpts,
	isNotTSWorker: isTsFile,
	isNotJSWorker: isJsFile
});
