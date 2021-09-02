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
	fs = require('fs'),
	path = require('upath'),
	glob = require('glob');

const
	{resolve} = require('@pzlr/build-core');

// If we have switched to the "runtime.noGlobals" mode,
// we have to find in our code all invoking of Prelude methods, like, `'foo'.camelize()`,
// and replaces their with another safety form of the invoking
if (config.runtime().noGlobals) {
	const
		resources = [resolve.sourceDir, ...resolve.rootDependencies],
		files = $C(resources).reduce((arr, el) => arr.concat(glob.sync(path.join(el, 'core/prelude/**/*.ts'))), []);

	const
		isProto = /\.prototype$/,
		extendRgxp = /\bextend\(([^,]+),\s*['"]([^'",]+)/g;

	const
		regExps = new Set(),
		tokens = new Map(),
		globalLink = `GLOBAL_${Number.random(1e6)}`;

	let
		replaceRgxp;

	$C(files).forEach((el) => {
		const
			file = fs.readFileSync(el).toString();

		let
			decl;

		// eslint-disable-next-line no-cond-assign
		while (decl = extendRgxp.exec(file)) {
			const
				target = decl[1],
				method = decl[2],
				link = `[Symbol.for('[[V4_PROP_TRAP:${method}]]')]`;

			if (target === 'GLOBAL' || target === 'globalThis') {
				// Match: globalThis.Any or GLOBAL.Any
				regExps.add(`\\b(?:GLOBAL|globalThis)\\s*\\.${method}\\b`);

				// Match: ((Any))
				regExps.add(`\\(\\(${method}\\)\\)`);

				// Match: stderr(err) or i18n`foo`
				regExps.add(`(?<=[^.]\\s*|^)\\b${method}\\b\\s*(?=${method.length > 3 ? '\\(|`' : '`'})`);

				// Match: .then(something, stderr) or .catch(stderr)
				if (method.length > 3) {
					regExps.add(`(?<=[^.]\\s*\\.\\s*(?:catch|then)\\s*\\()${method}(?=\\s*\\))`);
					regExps.add(`(?<=[^.]\\s*\\.\\s*then\\s*\\([\\s\\S]+?}\\s*,\\s*)${method}(?=\\s*\\))`);
				}

				const meta = {
					global: true,
					link: globalLink + link
				};

				tokens.set(method, meta);
				tokens.set(`((${method}))`, meta);
				tokens.set(`GLOBAL.${method}`, meta);
				tokens.set(`globalThis.${method}`, meta);

				continue;
			}

			if (isProto.test(target)) {
				regExps.add(`[^.]\\s*\\.\\s*${method}\\b`);
				tokens.set(`.${method}`, {global: false, link});
				tokens.set(`?.${method}`, {global: false, link: `?.${link}`});
				continue;
			}

			regExps.add(`\\b${target}\\.${method}\\b`);
			tokens.set(`${target}.${method}`, {global: false, link: target + link});
		}
	});

	if (tokens.size) {
		replaceRgxp = new RegExp([...regExps.keys()].join('|'), 'g');
	}

	/**
	 * Structure to find and replace all Prelude invoking to global safety form
	 * @type {{globalLink: string, replaceRgxp: !RegExp, tokens: Map<any, any>}}
	 */
	module.exports = {tokens, globalLink, replaceRgxp};
}
