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
	Snakeskin = require('snakeskin');

const
	fs = require('node:fs'),
	path = require('upath'),
	glob = require('fast-glob'),
	isPathInside = require('is-path-inside');

const {
	validators,
	config: {dependencies, superRgxp}
} = require('@pzlr/build-core');

const
	{resources} = include('build/graph'),
	{ssExtRgxp} = include('build/snakeskin/filters/const');

const
	resourcesRgxp = $C(dependencies).map((el) => new RegExp(`^${RegExp.escape(el)}`)),
	namespaces = Object.createDict();

Snakeskin.importFilters({
	/**
	 * Resolves the specified namespace and returns it.
	 * This filter is essential for correctly resolving templates that exist within the same namespace
	 * but are declared across multiple files.
	 *
	 * @param {string} namespace
	 * @returns {string}
	 *
	 * ```
	 * - namespace ['m-component'|n]
	 *
	 * - template a()
	 *   ...
	 * ```
	 */
	n(namespace) {
		return namespaces[namespace] ?? namespace;
	},

	/**
	 * Resolves the specified file path for use with the Snakeskin include directive, also adding support for layers.
	 *
	 * If the path ends with the symbols `:$postfix`, during the path resolution,
	 * a hard link will be created to the original file named `$fileName_$postfix`.
	 * This functionality is critical for correctly overriding templates in a layered mono-repository,
	 * ensuring that the integrity and the separation of layers are maintained even when templates
	 * are extended or customized.
	 *
	 * @param {string} filePath
	 * @param {string} sourceFilePath - the original source file path
	 * @returns {(string|Array<string>)}
	 *
	 * @example
	 * ```
	 * - include 'super/i-data:core'|b as placeholder
	 *
	 * - template index() extends ['i-data_core'].index
	 * ```
	 */
	b(filePath, sourceFilePath) {
		const
			chunks = filePath.split(':'),
			as = chunks[1];

		filePath = chunks[0];

		let start = 0;

		if (RegExp.test(superRgxp, filePath)) {
			filePath = filePath.replace(superRgxp, '');

			for (let i = 0; i < resources.length; i++) {
				if (isPathInside(fs.realpathSync(sourceFilePath), fs.realpathSync(resources[i]))) {
					start = i + 1;
					break;
				}
			}

		} else {
			for (let i = 0; i < resourcesRgxp.length; i++) {
				const rgxp = resourcesRgxp[i];

				if (rgxp.test(filePath)) {
					filePath = filePath.replace(rgxp, '');
					start = i + 1;
					break;
				}
			}
		}

		const
			isDynamicPattern = glob.isDynamicPattern(filePath),
			end = ssExtRgxp.removeFlags('g').test(filePath) ? '' : '/',
			ends = [];

		if (end) {
			const basename = path.basename(filePath);

			if (!glob.isDynamicPattern(basename)) {
				ends.push(`${basename}.ss`);
			}

			if (!validators.blockName(basename)) {
				ends.push('main.ss', 'index.ss');
			}

		} else {
			ends.push('');
		}

		const
			paths = [];

		for (let i = start; i < resources.length; i++) {
			for (let j = 0; j < ends.length; j++) {
				const fullPath = path.join(resources[i], filePath, ends[j] || '');

				if (isDynamicPattern) {
					paths.push(...glob.sync(fullPath));

				} else if (fs.existsSync(fullPath)) {
					return applyAsModifier(fullPath);
				}
			}
		}

		if (isDynamicPattern) {
			return paths.map(applyAsModifier);
		}

		return applyAsModifier(filePath + end);

		function applyAsModifier(originalPath) {
			if (!as || !fs.existsSync(originalPath)) {
				return originalPath;
			}

			const
				ext = path.extname(originalPath),
				originalFName = path.basename(originalPath, ext);

			const
				aliasFName = `${originalFName}_${as}`,
				aliasPath = path.join(path.dirname(originalPath), aliasFName + ext);

			if (!fs.existsSync(aliasPath)) {
				fs.linkSync(originalPath, aliasPath);
			}

			namespaces[originalFName] = aliasFName;

			return aliasPath;
		}
	}
});

Snakeskin.setFilterParams('b', {
	bind: [(o) => JSON.stringify(o.environment.filename)]
});
