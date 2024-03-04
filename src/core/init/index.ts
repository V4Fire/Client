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

import dependencies from 'core/init/dependencies';
import { createDependencyIterator } from 'core/init/dependencies/helpers';

import { createApp } from 'core/init/create-app';
import { getAppParams } from 'core/init/helpers';

import type { InitAppOptions, App } from 'core/init/interface';

export * from 'core/init/dependencies/helpers';
export * from 'core/init/helpers';
export * from 'core/init/interface';

/**
 * Initializes the application
 *
 * @param rootComponent - the name of the created root component
 * @param opts - additional options
 */
export default async function initApp(
	rootComponent: Nullable<string>,
	opts: InitAppOptions
): Promise<App> {
	const {state, createAppOpts} = getAppParams(opts);

	const tasks = [...createDependencyIterator(dependencies)].map(([_, {fn}]) => fn(state));
	await Promise.all(tasks);

	return createApp(rootComponent, createAppOpts, state);
}
