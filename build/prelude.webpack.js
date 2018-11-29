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
	methods = new Map();

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
			protoMethod = isProto.test(target);

		methods.set(
			protoMethod ? `\\.${method}\\b` : `\\b${target}\\.${method}\\b`,
			`${protoMethod ? '' : target}[Symbol.for('[[V4_PROP_TRAP:${method}]]')]`
		);
	}
});

if (methods.size) {
	replaceRgxp = new RegExp([...methods.keys()].join('|'), 'g');
}

module.exports = {methods, replaceRgxp};
