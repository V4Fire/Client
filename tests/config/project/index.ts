/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { PlaywrightTestConfig } from '@playwright/test';

import superConfig from 'tests/config/super';

const config: PlaywrightTestConfig = {
	name: 'project',

	testMatch: ['src/**/test/project/**/*.ts'],

	globalSetup: require.resolve('tests/config/project/setup'),

	...superConfig
};

export default config;

