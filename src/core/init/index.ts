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

import initDom from 'core/init/dom';
import initState from 'core/init/state';
import initABT from 'core/init/abt';
import prefetchInit from 'core/init/prefetch';
import hydratedRouteInit from 'core/init/hydrated-route';

import { getAppParams } from 'core/init/helpers';
import type { InitAppOptions, App } from 'core/init/interface';

export * from 'core/init/helpers';
export * from 'core/init/interface';

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
	const params = getAppParams(opts);

	void initDom(params);
	void initState(params);
	void initABT(params);
	void prefetchInit(params);
	void hydratedRouteInit(params);

	const createApp = await params.ready('');
	return createApp(rootComponent, params);
}
