/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/** @type {import('ts-jest').InitialOptionsTsJest} */
export default {
	projects: ['<rootDir>'],
	testMatch: ['<rootDir>/build/**/*[sS]pec.[jt]s', '<rootDir>/src/**/*[sS]pec.[jt]s'],
	rootDir: './',
	testTimeout: 20000,
	testEnvironment: 'node',
	bail: 2,
	reporters: ['default'],

	silent: true,
	clearMocks: true,

	collectCoverage: true,
	coverageReporters: ['lcov'],
	coverageDirectory: '<rootDir>/coverage',
	coverageProvider: 'v8',

	preset: 'ts-jest',
	modulePaths: ['<rootDir>/src/']
};
