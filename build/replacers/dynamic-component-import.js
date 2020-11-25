'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	importRgxp = /\b(import|require)\((["'])((?:(?![bp]-[^\\/"')]+)[^'")])*([bp]-[^\\/"')]+))\2\)/g;

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
	return str.replace(importRgxp, (str, importer, q, path, nm) => {
		const
			newPath = `${path}/${nm}`,
			isESImport = importer === 'import';

		const
			regTpl = `(module) => { TPLS['${nm}'] = module${isESImport ? '.default' : ''}['${nm}']; return module; }`;

		if (isESImport) {
			return `import('${newPath}'), import('${newPath}.ss').then(${regTpl}), import('${newPath}.styl?dynamic')`;
		}

		return `Promise.resolve(require('${newPath}')), Promise.resolve(require('${newPath}.ss')).then(${regTpl}), Promise.resolve(require('${newPath}.styl?dynamic'))`;
	});
};

Object.assign(module.exports, {
	importRgxp
});
