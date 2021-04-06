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
	config = require('config');

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
	if (config.webpack.fatHTML()) {
		return str;
	}

	const
		{blockMap} = await graph;

	const
		ext = path.extname(filePath),
		component = blockMap.get(path.basename(filePath, ext));

	if (component == null) {
		return str;
	}

	const
		deps = new Set(),
		libs = new Set();

	attachComponentDeps(component);

	await $C([...deps].reverse()).async.forEach(async (dep) => {
		const
			declFromCache = decls[dep];

		if (declFromCache != null) {
			str += declFromCache;
			return;
		}

		const
			component = blockMap.get(dep);

		if (component == null) {
			return;
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
			${
				styles
					.map((src) => {
						if (src == null) {
							return '';
						}

						src = path.normalize(src);
						return `await import('${src}');`;
					})

					.join('')
			}
		} catch {}
	})();
}`;

		} catch {}

		try {
			let
				src = await component.logic;

			if (src != null) {
				src = path.normalize(src);
				decl += `try { require('${src}'); } catch (err) { stderr(err); }`;
			}

		} catch {}

		try {
			let
				src = await component.tpl;

			if (src != null) {
				src = path.normalize(src);
				decl += `try { TPLS['${dep}'] = require('${src}')['${dep}']; } catch (err) { stderr(err); }`;
			}

		} catch {}

		if (decls[dep] == null) {
			decls[dep] = decl;
		}

		str += decl;
	});

	$C([...libs].reverse()).forEach((lib) => {
		str += `
try { require('${lib}'); } catch (err) { stderr(err); }
`;
	});

	return str;

	function attachComponentDeps(component) {
		if (component == null) {
			return;
		}

		$C(component.dependencies).forEach((dep) => {
			deps.add(dep);
			attachComponentDeps(blockMap.get(dep));
		});

		$C(component.libs).forEach((lib) => {
			libs.add(lib);
		});
	}
};

