/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	{typescript, webpack, webpack: {ssr}} = require('@config/config'),
	{commentModuleExpr: commentExpr} = include('build/const');

const
	graph = include('build/graph');

const importRgxp = new RegExp(
	`\\bimport${commentExpr}\\((${commentExpr})(["'])((?:.*?[\\\\/]|)([bp]-[^.\\\\/"')]+)+)\\2${commentExpr}\\)`,
	'g'
);

const
	hasImport = importRgxp.removeFlags('g'),
	isESImport = typescript().client.compilerOptions.module === 'ES2020',
	fatHTML = webpack.fatHTML();

/**
 * A Monic replacer is used to enable dynamic imports of components
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
module.exports = async function dynamicComponentImportReplacer(str) {
	const {entryDeps} = await graph;

	return str.replace(importRgxp, (str, magicComments, q, resourcePath, resourceName) => {
		const
			chunks = resourcePath.split(/[/\\]/);

		if (chunks.length > 1 && chunks[chunks.length - 1] === chunks[chunks.length - 2]) {
			return str;
		}

		const
			fullPath = `${resourcePath}/${resourceName}`,
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

		{
			const
				tplPath = `${fullPath}.ss`,
				regTpl = `function (module) { TPLS['${resourceName}'] = module${isESImport ? '.default' : ''}['${resourceName}']; return module; }`;

			let
				decl;

			if (ssr) {
				decl = `(${regTpl})(require('${tplPath}'))`;

			} else {
				if (isESImport) {
					decl = `import(${magicComments} '${tplPath}').then(${regTpl})`;

				} else {
					decl = `new Promise(function (r) { return r(require('${tplPath}')); }).then(${regTpl})`;
				}

				decl += '.catch(function (err) { stderr(err) })';
			}

			imports.push(decl);
		}

		if (!fatHTML) {
			const
				stylPath = `${fullPath}.styl`;

			let
				decl;

			if (ssr || isESImport) {
				decl = `import(${magicComments} '${stylPath}')`;

			} else {
				decl = `new Promise(function (r) { return r(require('${stylPath}')); })`;
			}

			if (ssr) {
				if (!entryDeps.has(resourceName)) {
					imports.unshift(`require('core/hydration-store').styles.set('${resourceName}', (${decl})).get('${resourceName}')`);
				}

			} else {
				decl = `function () { return ${decl}; }`;
				imports[0] = `TPLS['${resourceName}'] ? ${imports[0]} : ${imports[0]}.then(${decl}, function (err) { stderr(err); return ${decl}(); })`;
			}
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
