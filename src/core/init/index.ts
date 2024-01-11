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

import type { InitAppOptions, App } from 'core/init/interface';

import initDom from 'core/init/dom';
import initState from 'core/init/state';
import initABT from 'core/init/abt';
import prefetchInit from 'core/init/prefetch';
import hydratedRouteInit from 'core/init/hydrated-route';

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
	void initDom(opts);
	void initState(opts);
	void initABT(opts);
	void prefetchInit(opts);
	void hydratedRouteInit(opts);

	const createApp = await opts.semaphore('');
	return createApp(rootComponent, opts);
}
