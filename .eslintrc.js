/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const base = require('@v4fire/linters/.eslintrc');

const copyrightTemplate = [
	'!',
	' * V4Fire Client Core',
	' * https://github.com/V4Fire/Client',
	' *',
	' * Released under the MIT license',
	' * https://github.com/V4Fire/Client/blob/master/LICENSE',
	' '
];

if (!base.extends) {
	base.extends = [];
}

base.extends.push('plugin:storybook/recommended');

base.rules['header/header'] = [2, 'block', copyrightTemplate];

base.overrides.at(-1).rules['@typescript-eslint/member-ordering'] = [
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
