'use strict';

const base = require('@v4fire/linters/.eslintrc');

base.overrides[1].rules['@typescript-eslint/member-ordering'] = [
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
