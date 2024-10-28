/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { PlaywrightTestConfig } from '@playwright/test';

import superConfig from 'tests/config/super';

export const isCI = Boolean(process.env.CI);

const config: PlaywrightTestConfig = {
	...superConfig,

	name: 'project',

	testMatch: ['src/**/test/project/**/*.ts'],

	reporter: isCI ? 'github' : 'list',

	globalSetup: require.resolve('tests/config/project/setup')
};

export default config;
