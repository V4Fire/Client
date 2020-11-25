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
	importRgxp = /\bimport\((["'])((?:(?![bp]-[^\\/"')]+)[^'")])*([bp]-[^\\/"')]+))\1\)/g;

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
			newPath = `${path}/${nm}`;

		const
			regTpl = `(module) => { TPLS['${nm}'] = module${isESImport ? '.default' : ''}['${nm}']; return module; }`;

		let
			imports;

		if (isESImport) {
			imports = `import('${newPath}'), import('${newPath}.ss').then(${regTpl}), import('${newPath}.styl?dynamic')`;

		} else {
			imports = `new Promise((r) => r(require('${newPath}'))), new Promise((r) => r(require('${newPath}.ss'))).then(${regTpl}), new Promise((r) => r(require('${newPath}.styl?dynamic')))`;
		}

		return `Promise.allSettled([${imports}])`;
	});
};

Object.assign(module.exports, {
	importRgxp
});
