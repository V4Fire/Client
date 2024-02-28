/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as net from 'core/net';
import * as cookies from 'core/cookies';

import type { InitAppOptions, InitAppParams } from 'core/init/interface';

/**
 * Returns application initialization parameters based on the passed options
 * @param opts - initialization options
 */
export function getAppParams(opts: InitAppOptions): InitAppParams {
	return {
		...opts,
		net: opts.net ?? net,
		cookies: cookies.from(opts.cookies),
		route: opts.location.pathname + opts.location.search
	};
}
