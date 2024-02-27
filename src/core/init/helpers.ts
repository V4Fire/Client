/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as net from 'core/net';
import type { InitAppOptions, InitAppParams } from 'core/init/interface';

/**
 * Initializes the global state of the application (user session initialization, online status loading, etc.)
 * @param params - additional initialization parameters
 */
export function initAPI(params: InitAppOptions): InitAppParams {
	params.net ??= net;
	return Object.cast(params);
}
