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

import abt from 'core/init/abt';
import 'core/init/dom';
import state from 'core/init/state';
import prefetch from 'core/init/prefetch';
import hydratedRoute from 'core/init/hydrated-route';

import { initGlobalEnv } from 'core/env';

import semaphore from 'core/init/semaphore';
import type { InitAppOptions, App } from 'core/init/interface';

/**
 * Initializes the application
 *
 * @param rootComponent - the root component name for initialization
 * @param [opts] - additional options
 */
export default async function initApp(
	rootComponent: Nullable<string>,
	opts: InitAppOptions
): Promise<App> {
	initGlobalEnv(opts);

	loadModule(state);
	loadModule(abt);
	loadModule(prefetch);
	loadModule(hydratedRoute);

	const createApp = await semaphore('');
	return createApp(rootComponent, opts);

	function loadModule(init: (InitAppOptions) => void) {
		try {
			init(opts);
		} catch (err) {
			stderr(err);
		}
	}
}
