'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	importRgxp = /\bimport\((["'])((?:(?![bp]-[^\\/"')]+)[^'")])*([bp]-[^\\/"')]+))\1\)/;

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
			newPath = `${path}/${nm}`,
			regTpl = `(module) => { TPLS['${nm}'] = module.default['${nm}']; return module; }`;

		return `import('${newPath}'), import('${newPath}.ss').then(${regTpl}), import('${newPath}.styl?dynamic')`;
	});
};

Object.assign(module.exports, {
	importRgxp
});
