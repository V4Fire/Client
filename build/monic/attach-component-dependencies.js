/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	$C = require('collection.js'),
	{webpack} = require('@config/config');

const
	path = require('upath'),
	graph = include('build/graph'),
	{invokeByRegisterEvent, getLayerName} = include('build/helpers');

const
	decls = Object.create(null);

/**
 * A Monic replacer is used to attach component dependencies into the TS/JS file
 *
 * @param {string} str
 * @param {string} filePath
 * @returns {Promise<string>}
 */
module.exports = async function attachComponentDependencies(str, filePath) {
	if (webpack.fatHTML()) {
		return str;
	}

	const {
		components,
		entryDeps
	} = await graph;

	const
		ext = path.extname(filePath),
		component = components.get(path.basename(filePath, ext));


	if (component == null) {
		return str;
	}

	const
		deps = new Set(),
		libs = new Set();

	attachComponentDeps(component);

	let
		imports = '';

	$C([...libs].reverse()).forEach((lib) => {
		imports += `require('${lib}');`;
	});

	await $C([...deps].reverse()).async.forEach(forEach);
	
	return invokeByRegisterEvent(imports, getLayerName(filePath), component.name) + str;

	async function forEach(dep) {
		if (dep.startsWith('g-')) {
			return;
		}

		const
			declFromCache = decls[dep];

		if (declFromCache != null) {
			imports += declFromCache;
			return;
		}

		const
			component = components.get(dep);

		if (component == null) {
			return;
		}

		const styles = (await component.styles).map((src) => {
			if (src == null) {
				return '';
			}

			return [path.basename(src, path.extname(src)), `import('${path.normalize(src)}')`];
		});

		let
			decl = '';

		if (webpack.ssr) {
			if (!entryDeps.has(component.name)) {
				styles.forEach(([key, style]) => {
					decl += `require('core/hydration-store').styles.set('${key}', ${style});`;
				});
			}

		} else {
			try {
				decl += `
	(async () => {
			if (__webpack_component_styles_are_loaded__('${dep}')) {
				return;
			}

			try { ${styles.map(([_, style]) => `await ${style}`).join(';')} } catch (err) { stderr(err); }
	})();`;

			} catch {}
		}

		const depChunks = [
			'logic',
			'tpl'
		];

		for (const chunk of depChunks) {
			try {
				let
					src = await component[chunk];

				if (src != null) {
					src = path.normalize(src);

					let
						expr;

					if (chunk === 'tpl') {
						expr = `TPLS['${dep}'] = require('${src}')['${dep}'];`

					} else {
						expr = `require('${src}');`
					}

					decl += `try { ${invokeByRegisterEvent(expr, component.name)} } catch (err) { stderr(err); }`;
				}

			} catch {}
		}

		if (decls[dep] == null) {
			decls[dep] = decl;
		}

		imports += decl;
	}

	function attachComponentDeps(component) {
		if (component == null) {
			return;
		}

		$C(component.dependencies).forEach((dep) => {
			deps.add(dep);
			attachComponentDeps(components.get(dep));
		});

		$C(component.libs).forEach((lib) => {
			libs.add(lib);
		});
	}
};

