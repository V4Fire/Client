/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	headerPlugin = require('eslint-plugin-header');

const
	base = require('@v4fire/linters/eslint.config');

const copyrightTemplate = [
	'!',
	' * V4Fire Client Core',
	' * https://github.com/V4Fire/Client',
	' *',
	' * Released under the MIT license',
	' * https://github.com/V4Fire/Client/blob/master/LICENSE',
	' '
];

const ignore = [
	'src/**/@(i-|b-|p-|g-|v-)*/index.js',
	'src/**/test/**/*.js',

	'assets/**',
	'src/assets/**',

	'tmp/**',
	'src/entries/tmp/**',

	'docs/**',
	'dist/**',
	'node_modules/**'
];

base.forEach((item) => {
	item.ignores = ignore;

	if (item.plugins) {
		item.plugins['header'] = headerPlugin;
	}

	if (item.rules) {
		item.rules['header/header'] = [2, 'block', copyrightTemplate];
	}
});

base[1].rules['@typescript-eslint/member-ordering'] = [
	'error', {
		default: [
			'signature',

			'public-instance-field',

			'public-static-field',
			'public-static-method',

			'protected-static-field',
			'protected-static-method',

			'protected-instance-field',
			'private-instance-field',

			'public-constructor',
			'protected-constructor',

			'public-instance-method',
			'protected-instance-method',

			'private-static-field',
			'private-static-method',

			'private-constructor',
			'private-instance-method'
		]
	}
];

module.exports = base;
