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

import type { InitAppOptions, InitAppParams, CreateAppOptions } from 'core/init/interface';

/**
 * Returns the application state object and parameters for creating an application instance based on
 * the passed initialization parameters
 *
 * @param opts - initialization options
 */
export function getAppParams(opts: InitAppOptions): {
	state: InitAppParams;
	createAppOpts: Pick<InitAppOptions, keyof CreateAppOptions>;
} {
	return {
		// Make the state observable
		state: watch({
			...opts,
			net: opts.net ?? net,
			cookies: cookies.from(opts.cookies),
			route: opts.route ?? opts.location.pathname + opts.location.search
		}).proxy,

		createAppOpts: {
			targetToMount: opts.targetToMount,

			// eslint-disable-next-line @v4fire/unbound-method
			setup: opts.setup
		}
	};
}
