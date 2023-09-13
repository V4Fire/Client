/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { PlaywrightTestConfig } from '@playwright/test';

import superConfig, { isCI } from 'tests/config/super';

const config: PlaywrightTestConfig = {
	...superConfig,

	name: 'unit',

	testMatch: ['src/**/test/unit/**/*.ts'],

	reporter: isCI ? 'github' : undefined,

	globalSetup: require.resolve('tests/config/unit/setup')
};

export default config;
