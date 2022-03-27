/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable import/no-nodejs-modules */

import process from 'process';
import path from 'upath';

import type { PlaywrightTestConfig } from '@playwright/test';

import serverConfig from 'tests/server/config';

import 'tests/config/super/matchers';

const config: PlaywrightTestConfig = {
	webServer: serverConfig,

	testDir: path.join(process.cwd(), 'src'),

	use: {
		permissions: ['geolocation'],
		geolocation: {latitude: 59.95, longitude: 30.31667},
		baseURL: `http://localhost:${serverConfig.port}`
	},

	forbidOnly: Boolean(process.env.CI),

	reportSlowTests: {
		max: 0,
		threshold: (4).minutes()
	}
};

export default config;

