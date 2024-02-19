/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const PLUGIN_NAME = 'LayerPropertyPlugin';

const path = require('upath');

module.exports = class LayerPropertyPlugin {

	/**
	 * TODO;
	 * @param compiler
	 */
	apply(compiler) {

		compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {

			const tapCallback = (_, normalModule) => {
				const fullPath = path.resolve(normalModule.libIdent({context: compilation.options.context}));
				// Console.log('my plugin');

				// Const segments = fullPath.split(path.sep);
				// while (segments.pop() !== 'src' && segments.length > 0) {
				// 	segments.pop();
				// }
				//
				// const root = segments.join(path.sep);
				// const packageJson = require(`${root}/package.json`);
				// console.log({fullPath, path: root, package: packageJson.name});
			};

			const NormalModule = compiler?.webpack.NormalModule;
			const isNormalModuleAvailable =
				Boolean(NormalModule) && Boolean(NormalModule.getCompilationHooks);

			if (isNormalModuleAvailable) {
				NormalModule.getCompilationHooks(compilation).beforeLoaders.tap(
					PLUGIN_NAME,
					tapCallback
				);
			} else {
				compilation.hooks.normalModuleLoader.tap(PLUGIN_NAME, tapCallback);
			}
		});
	}
};
