/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { initGlobalEnv } from 'core/env';

import semaphore from 'core/init/semaphore';
import type { InitAppOptions } from 'core/init/interface';

/**
 * Initializes pre-requests to data providers and other sources
 * @param params - additional initialization parameters
 */
// eslint-disable-next-line @typescript-eslint/require-await
export default async function initPrefetch(params: InitAppOptions): Promise<void> {
	initGlobalEnv(params);
	void semaphore('prefetchReady');
}
