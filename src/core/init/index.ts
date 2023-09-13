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

import { initGlobalEnv } from 'core/env';

import semaphore from 'core/init/semaphore';
import type { InitAppOptions } from 'core/init/interface';

/**
 * Initializes the application
 *
 * @param rootComponent - the root component name for initialization
 * @param [opts] - additional options
 */
export default async function initApp(
	rootComponent: Nullable<string>,
	opts?: InitAppOptions
): Promise<string | Element> {
	initGlobalEnv(opts);

	void loadModule(import('core/init/dom'));
	void loadModule(import('core/init/state'));
	void loadModule(import('core/init/abt'));
	void loadModule(import('core/init/prefetch'));
	void loadModule(import('core/init/hydrated-route'));

	const createApp = await semaphore('');
	return createApp(rootComponent, opts);

	async function loadModule(promise: Promise<{default?: unknown}>) {
		try {
			const {default: init} = await promise;

			if (Object.isFunction(init)) {
				init(opts);
			}

		} catch (err) {
			stderr(err);
		}
	}
}
