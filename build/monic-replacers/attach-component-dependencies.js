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
	{src, webpack} = require('config');

const
	path = require('upath'),
	graph = include('build/graph');

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
	if (webpack.fatHTML()) {
		return str;
	}

	const
		{components} = await graph;

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

	let imports = `
globalThis.STATIC_DEPENDENCIES = globalThis.STATIC_DEPENDENCIES ?? {};
const STATIC_DEPENDENCIES = globalThis.STATIC_DEPENDENCIES['${component.name}'] = [];
`;

	$C([...libs].reverse()).forEach((lib) => {
		imports += `
import(/* webpackPreload: true */ '${lib}').catch(stderr);
STATIC_DEPENDENCIES.push({name: '${lib}', load: () => import('${lib}').catch(stderr)});
`;
	});

	await $C([...deps].reverse()).async.forEach(forEach);
	return imports + str;

	async function forEach(dep) {
		const
			declFromCache = decls[dep];

		if (declFromCache != null) {
			imports += declFromCache;
			return;
		}

		const
			component = components.get(dep),
			componentPath = path.relative(src.src(), path.dirname(component.index));

		if (component == null) {
			return;
		}

		let decl = `STATIC_DEPENDENCIES.push({name: '${componentPath}', load: () => {
			return import('${componentPath}');
		}});`;

		try {
			const
				styles = await component.styles;

			decl += `
requestAnimationFrame(async () => {
	if (TPLS['${dep}']) {
		return;
	}

	try {
		const el = document.createElement('i');
		el.className = '${dep}-is-style-loaded';
		document.body.appendChild(el);

		const isStylesLoaded = getComputedStyle(el).color === 'rgba(0, 250, 154, 0)';
		document.body.removeChild(el);

		if (isStylesLoaded) {
			return;
		}
	} catch (err) { stderr(err); }

	try {
		${
				styles
					.map((src) => {
						if (src == null) {
							return '';
						}

						src = path.normalize(src);
						return `await import(/* webpackPreload: true */ '${src}');`;
					})

					.join('')
			}
	} catch (err) { stderr(err); }
});`;

		} catch {}

		const deps = [
			'tpl',
			'logic'
		];

		for (const dep of deps) {
			try {
				let
					src = await component[dep];

				if (src != null) {
					src = path.normalize(src);
					decl += `import(/* webpackPreload: true */ '${src}').catch(stderr);`;
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

