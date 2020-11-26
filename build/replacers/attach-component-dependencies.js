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
	path = require('upath'),
	graph = include('build/graph.webpack');

const
	decls = Object.create(null);

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
		for (const dep of component.dependencies) {
			if (decls[dep] != null) {
				str += decls[dep];
				continue;
			}

			const
				component = blockMap.get(dep);

			if (!component) {
				continue;
			}

			let
				decl = '';

			try {
				const
					styles = await component.styles;

				decl += `
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
				decl += `try { require('${src}'); } catch (err) { stderr(err); }`;

			} catch {}

			try {
				const src = path.normalize(await component.tpl);
				decl += `try { TPLS['${dep}'] = require('${src}')['${dep}']; } catch (err) { stderr(err); }`;

			} catch {}

			decls[dep] = decl;
			str += decl;
		}

		component.libs.forEach((lib) => {
			str += `
try { require('${lib}'); } catch (err) { stderr(err); }
`;
		});
	}

	return str;
};

