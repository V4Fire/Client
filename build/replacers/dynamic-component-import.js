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
	path = require('upath'),
	escaper = require('escaper');

const
	graph = include('build/graph.webpack');

const
	isESImport = typescript().client.compilerOptions.module === 'ES2020',
	importRgxp = /\bimport\((["'])((?:(?![bp]-[^\\/"')]+)[^'")])*([bp]-[^\\/"')]+))\1\)/g;

const
	paths = Object.create(null);

/**
 * Monic replacer to enable dynamic imports of components
 *
 * @param {string} str
 * @returns {!Promise<string>}
 *
 * @example
 * ```js
 * Promise.all([import('form/b-button')]).then((tsModule, ssModule, stylModule) => {
 *   console.log(tsModule, ssModule, stylModule);
 * });
 * ```
 */
module.exports = async function dynamicComponentImportReplacer(str) {
	const
		{blockMap} = await graph;

	let
		needTransform = false;

	const
		content = [],
		tasks = [];

	str = escaper.replace(str, ['/*', '//'], content);

	for (const [,,, nm] of str.matchAll(importRgxp)) {
		needTransform = nm;

		if (paths[nm]) {
			continue;
		}

		const
			component = blockMap.get(nm);

		if (component) {
			// eslint-disable-next-line no-multi-assign
			const obj = paths[nm] = {styles: []};

			tasks.push(
				component.logic.then((src) => {
					obj.logic = path.normalize(src);
				}),

				component.tpl.then((src) => {
					obj.tpl = path.normalize(src);
				}),

				component.styles.then((styles) => {
					obj.styles = styles.map(path.normalize);
				})
			);
		}
	}

	if (!needTransform) {
		return escaper.paste(str, content);
	}

	await Promise.all(tasks);

	str = str.replace(importRgxp, (str, q, path, nm) => {
		const
			component = paths[nm];

		let
			logic = '',
			styles = '',
			tpl = '';

		if (component.logic) {
			if (isESImport) {
				logic += `import('${component.logic}')`;

			} else {
				logic += `new Promise((r) => r(require('${component.logic}')))`;
			}
		}

		if (component.tpl) {
			const
				regTpl = `(module) => { TPLS['${nm}'] = module${isESImport ? '.default' : ''}['${nm}']; return module; }`;

			if (isESImport) {
				tpl += `import('${component.tpl}').then(${regTpl})`;

			} else {
				tpl += `new Promise((r) => r(require('${component.tpl}'))).then(${regTpl})`;
			}
		}

		if (component.styles.length) {
			styles += `!TPLS['${nm}'] && (async () => {
	const res = [];
	${component.styles.map((src) => `res.push(${isESImport ? 'await import' : 'require'}('${src}?dynamic'));`).join('')}
	return res;
})()`;
		}

		const imports = [].concat(styles || [], logic || [], tpl || []).join(',');
		return `Promise.all([${imports}])`;
	});

	return escaper.paste(str, content);
};

Object.assign(module.exports, {
	importRgxp
});
