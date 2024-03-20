/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as net from 'core/net';
import * as cookies from 'core/cookies';

import watch from 'core/object/watch';
import type { State } from 'core/component';

import type { InitAppOptions, CreateAppOptions } from 'core/init/interface';

/**
 * Returns the application state object and parameters for creating an application instance based on
 * the passed initialization parameters
 *
 * @param opts - initialization options
 */
export function getAppParams(opts: InitAppOptions): {
	state: State;
	createAppOpts: Pick<InitAppOptions, keyof CreateAppOptions>;
} {
	let {route} = opts;

	if (route == null && SSR) {
		route = opts.location.pathname + opts.location.search;
	}

	return {
		// Make the state observable
		state: watch({
			...opts,
			appProcessId: opts.appProcessId ?? Object.fastHash(Math.random()),
			net: opts.net ?? net,
			cookies: cookies.from(opts.cookies),
			seo: {},
			route
		}).proxy,

		createAppOpts: {
			targetToMount: opts.targetToMount,

			// eslint-disable-next-line @v4fire/unbound-method
			setup: opts.setup
		}
	};
}
