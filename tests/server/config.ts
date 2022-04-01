/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { WebServerConfig } from '@playwright/test';
import { build } from '@config/config';

const webServerConfig: WebServerConfig = {
	port: build.testPort,
	reuseExistingServer: true,
	command: 'npm run test:server'
};

export default webServerConfig;
