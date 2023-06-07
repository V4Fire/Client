/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

// const
	// {typescript, webpack, webpack: {ssr}} = require('@config/config'),
	// {commentModuleExpr: commentExpr} = include('build/const');

const commentExpr = '\\s*(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*';
const importRgxp = new RegExp(
	`\\bimport${commentExpr}\\((${commentExpr})(["'])((?:.*?[\\\\/]|)([bp]-[^.\\\\/"')]+)+)\\2${commentExpr}\\)`,
	'g'
);

const
	hasImport = new RegExp(	`\\bimport${commentExpr}\\((${commentExpr})(["'])((?:.*?[\\\\/]|)([bp]-[^.\\\\/"')]+)+)\\2${commentExpr}\\)`),
	isESImport = true, // typescript().client.compilerOptions.module === 'ES2020',
	fatHTML = false, // webpack.fatHTML();
	ssr = false;

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
	return str.replace(importRgxp, (str, magicComments, q, path, nm) => {
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

			if (ssr) {
				decl = `require('${fullPath}')`;

			} else {
				if (isESImport) {
					decl = `import(${magicComments} '${fullPath}')`;

				} else {
					decl = `new Promise(function (r) { return r(require('${fullPath}')); })`;
				}

				decl += '.catch(function (err) { stderr(err) })';
			}

			imports.push(decl);
		}

		if (!ssr && !fatHTML) {
			let
				decl;

			if (isESImport) {
				decl = `import(${magicComments} '${fullPath}.styl')`;

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

			if (ssr) {
				decl = `(${regTpl})(require('${fullPath}.ss'))`;

			} else {
				if (isESImport) {
					decl = `import(${magicComments} '${fullPath}.ss').then(${regTpl})`;

				} else {
					decl = `new Promise(function (r) { return r(require('${fullPath}.ss')); }).then(${regTpl})`;
				}

				decl += '.catch(function (err) { stderr(err) })';
			}

			imports.push(decl);
		}

		if (ssr) {
			return `[${imports.join(',')}]`;
		}

		return `Promise.all([${imports.join(',')}])`;
	});
};

Object.assign(module.exports, {
	importRgxp,
	hasImport
});
