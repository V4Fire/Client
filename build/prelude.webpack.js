'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('config');

const
	$C = require('collection.js');

const
	fs = require('fs'),
	path = require('upath'),
	glob = require('glob');

const
	{resolve} = require('@pzlr/build-core');

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
		file = fs.readFileSync(el, {encoding: 'utf-8'});

	let
		decl;

	while ((decl = extendRgxp.exec(file))) {
		const
			target = decl[1],
			method = decl[2],
			link = `[Symbol.for('[[V4_PROP_TRAP:${method}]]')]`;

		if (target === 'GLOBAL') {
			regExps.add(`GLOBAL\\.${method}\\b`);
			regExps.add(`(?<=[^.]|^)\\b${method}\\b\\s*(?=${method.length > 3 ? '\\(|`' : '`'})`);
			tokens.set(method, {global: true, link: globalLink + link});
			continue;
		}

		if (isProto.test(target)) {
			regExps.add(`\\.${method}\\b`);
			tokens.set(`.${method}`, {global: false, link});
			continue;
		}

		regExps.add(`\\b${target}\\.${method}\\b`);
		tokens.set(`${target}.${method}`, {global: false, link: target + link});
	}
});

if (tokens.size) {
	replaceRgxp = new RegExp([...regExps.keys()].join('|'), 'g');
}

module.exports = {tokens, globalLink, replaceRgxp};
