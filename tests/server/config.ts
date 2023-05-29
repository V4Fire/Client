/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { build } from '@config/config';

import type { Config } from '@playwright/test';

// Playwright doesn't export type for WebServerConfig.
// Get it from Config interface
type NotArray<T> = T extends any[] ? never : T;
type WebServerConfig = NonNullable<NotArray<Config['webServer']>>;

const webServerConfig: WebServerConfig = {
	port: build.testPort,
	reuseExistingServer: true,
	command: 'yarn test:server',
	cwd: process.cwd()
};

export default webServerConfig;
