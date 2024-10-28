/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const base = require('@v4fire/linters/jest-eslint.config');

console.log(base.testPathIgnorePatterns);

module.exports = {
	...base,

	testMatch: [
		'<rootDir>/src/**/*.ts',
		'<rootDir>/src/**/*.js',
		'<rootDir>/config/**/*.js',
		'<rootDir>/build/**/*.js',
		'<rootDir>/tests/**/*.ts',
		'<rootDir>/tests/**/*.js',
		'<rootDir>/spec/**/*.js',
		'<rootDir>/eslint-config.js',
		'<rootDir>/ts-definitions/**/*.ts',
		'<rootDir>/index.d.ts',
		'<rootDir>/gulpfile.js'
	],

	testPathIgnorePatterns: [
		'<rootDir>/src/components/(.*?/)?[ibpgv]-.*?/index[.]js',
		'<rootDir>/src/.*?/test/.*[.]js',
		'<rootDir>/src/assets/.*',
		'<rootDir>/src/entries/.*'
	]
};
