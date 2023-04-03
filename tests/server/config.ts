/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Config } from '@playwright/test';
import { build } from '@config/config';

const webServerConfig: Config['webServer'] = {
	port: build.testPort,
	reuseExistingServer: true,
	command: 'yarn test:server',
	cwd: process.cwd()
};

export default webServerConfig;
