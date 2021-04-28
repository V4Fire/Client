'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{typescript, webpack} = require('config');

const
	importRgxp = /\bimport\((["'])((?:.*?[\\/]|)([bp]-[^.\\/"')]+)+)\1\)/g,
	hasImport = importRgxp.removeFlags('g');

const
	isESImport = typescript().client.compilerOptions.module === 'ES2020',
	fatHTML = webpack.fatHTML();

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

		{
			let
				decl;

			if (isESImport) {
				decl = `import('${fullPath}')`;

			} else {
				decl = `new Promise(function (r) { return r(require('${fullPath}')); })`;
			}

			decl += '.catch(function (err) { stderr(err) })';
			imports.push(decl);
		}

		if (!fatHTML) {
			let
				decl;

			if (isESImport) {
				decl = `import('${fullPath}.styl')`;

			} else {
				decl = `new Promise(function (r) { return r(require('${fullPath}.styl')); })`;
			}

			decl = `function () { return ${decl}; }`;
			imports[0] = `TPLS['${nm}'] ? ${imports[0]} : ${imports[0]}.then(${decl}, function (err) { stderr(err); return ${decl}(); })`;
		}

		{
			const
				regTpl = `function (module) { TPLS['${nm}'] = module${isESImport ? '.default' : ''}['${nm}']; return module; }`;

			let
				decl;

			if (isESImport) {
				decl = `import('${fullPath}.ss').then(${regTpl})`;

			} else {
				decl = `new Promise(function (r) { return r(require('${fullPath}.ss')); }).then(${regTpl})`;
			}

			decl += '.catch(function (err) { stderr(err) })';
			imports.push(decl);
		}

		return `Promise.all([${imports.join(',')}])`;
	});
};

Object.assign(module.exports, {
	importRgxp,
	hasImport
});
