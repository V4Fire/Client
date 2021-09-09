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
	Snakeskin = require('snakeskin');

const
	fs = require('fs'),
	path = require('upath'),
	glob = require('glob'),
	isPathInside = require('is-path-inside');

const
	{validators, config: {dependencies, superRgxp}} = require('@pzlr/build-core');

const
	{resources} = include('build/graph'),
	{ssExtRgxp} = include('build/snakeskin/filters/const');

const
	resourcesRgxp = $C(dependencies).map((el) => new RegExp(`^${RegExp.escape(el)}`));

Snakeskin.importFilters({
	/**
	 * Resolves the specified file path to use with the Snakeskin include directive.
	 * The filter adds the support of layers.
	 *
	 * @param {string} filePath
	 * @param {string} sourceFilePath - original file source path
	 * @returns {(string|!Array<string>)}
	 *
	 * @example
	 * ```
	 * - include 'super/i-data'|b as placeholder
	 *
	 * - template index() extends ['i-data'].index
	 * ```
	 */
	b(filePath, sourceFilePath) {
		let
			start = 0;

		if (superRgxp.removeFlags('g').test(filePath)) {
			filePath = filePath.replace(superRgxp, '');

			for (let i = 0; i < resources.length; i++) {
				if (isPathInside(sourceFilePath, resources[i])) {
					start = i + 1;
					break;
				}
			}

		} else {
			for (let i = 0; i < resourcesRgxp.length; i++) {
				const
					rgxp = resourcesRgxp[i];

				if (rgxp.test(filePath)) {
					filePath = filePath.replace(rgxp, '');
					start = i + 1;
					break;
				}
			}
		}

		const
			hasMagic = glob.hasMagic(filePath),
			end = ssExtRgxp.removeFlags('g').test(filePath) ? '' : '/',
			ends = [];

		if (end) {
			const
				basename = path.basename(filePath);

			if (!glob.hasMagic(basename)) {
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
				const
					fullPath = path.join(resources[i], filePath, ends[j] || '');

				if (hasMagic) {
					paths.push(...glob.sync(fullPath));

				} else if (fs.existsSync(fullPath)) {
					return fullPath;
				}
			}
		}

		if (hasMagic) {
			return paths;
		}

		return filePath + end;
	}
});

Snakeskin.setFilterParams('b', {
	bind: [(o) => JSON.stringify(o.environment.filename)]
});
