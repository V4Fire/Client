/* eslint-disable require-atomic-updates */

'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	path = require('upath'),
	graph = include('build/graph.webpack');

/**
 * Monic replacer to attach component dependencies into the TS/JS file
 *
 * @param {string} str
 * @param {string} filePath
 * @returns {!Promise<string>}
 */
module.exports = async function attachComponentDependencies(str, filePath) {
	const
		{blockMap} = await graph;

	const
		ext = path.extname(filePath),
		component = blockMap.get(path.basename(filePath, ext));

	if (component) {
		await $C(component.dependencies).async.forEach(async (dep) => {
			const
				component = blockMap.get(dep);

			if (!component) {
				return;
			}

			try {
				const
					styles = await component.styles;

				str += `
if (!TPLS['${dep}']) {
	(async () => {
		try {
			${styles.map((src) => `await import('${path.normalize(src)}?dynamic');`).join('')}
		} catch {}
	})();
}`;

			} catch {}

			try {
				const src = path.normalize(await component.logic);
				str += `try { require('${src}'); } catch (err) { stderr(err); }`;

			} catch {}

			try {
				const src = path.normalize(await component.tpl);
				str += `try { TPLS['${dep}'] = require('${src}')['${dep}']; } catch (err) { stderr(err); }`;

			} catch {}
		});

		component.libs.forEach((lib) => {
			str += `
try { require('${lib}'); } catch (err) { stderr(err); }
`;
		});
	}

	return str;
};

