'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{typescript} = require('config');

const
	isESImport = typescript().client.compilerOptions.module === 'ES2020',
	importRgxp = /\bimport\((["'])((?:.*?[\\/]|)([bp]-[^.\\/"')]+)+)\1\)/g;

/**
 * Monic replacer to enable dynamic imports of components
 *
 * @param {string} str
 * @returns {string}
 *
 * @example
 * ```js
 * Promise.all([import('form/b-button')]).then((tsModule, ssModule, stylModule) => {
 *   console.log(tsModule, ssModule, stylModule);
 * });
 * ```
 */
module.exports = function dynamicComponentImportReplacer(str) {
	return str.replace(importRgxp, (str, q, path, nm) => {
		const
			chunks = path.split(/[\\/]/);

		if (chunks.length > 1 && chunks[chunks.length - 1] === chunks[chunks.length - 2]) {
			return str;
		}

		const
			fullPath = `${path}/${nm}`,
			imports = [];

		if (isESImport) {
			imports.push(`!TPLS['${nm}'] && import('${fullPath}.styl')`);

		} else {
			imports.push(`!TPLS['${nm}'] && new Promise((r) => r(require('${fullPath}.styl')))`);
		}

		if (isESImport) {
			imports.push(`import('${fullPath}')`);

		} else {
			imports.push(`new Promise((r) => r(require('${fullPath}')))`);
		}

		const
			regTpl = `(module) => { TPLS['${nm}'] = module${isESImport ? '.default' : ''}['${nm}']; return module; }`;

		if (isESImport) {
			imports.push(`import('${fullPath}.ss').then(${regTpl})`);

		} else {
			imports.push(`new Promise((r) => r(require('${fullPath}.ss'))).then(${regTpl})`);
		}

		return `Promise.allSettled([${imports.join(',')}])`;
	});
};

Object.assign(module.exports, {
	importRgxp
});
