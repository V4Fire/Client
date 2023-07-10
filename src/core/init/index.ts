/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/init/README.md]]
 * @packageDocumentation
 */

import semaphore from 'core/init/semaphore';

import { initGlobalEnv } from 'core/env';

/**
 * Initializes the application
 *
 * @param [rootComponent]
 * @param [params]
 */
export default async function initApp(rootComponent?: string, params?: Dictionary): Promise<string | HTMLElement> {
	initGlobalEnv(params);

	void import('core/init/dom');
	void import('core/init/state');
	void import('core/init/abt');
	void import('core/init/prefetch');

	const app = await semaphore('[[INIT_APP]]');
	return (await app(rootComponent)).render(params);
}

if (!SSR) {
	void initApp();
}
