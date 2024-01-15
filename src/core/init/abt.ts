/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { initGlobalEnv } from 'core/env';

import type { InitAppOptions } from 'core/init/interface';

/**
 * Initializes the A/B experiment context
 * @param params - additional initialization parameters
 */
// eslint-disable-next-line @typescript-eslint/require-await
export default async function initABT(params: InitAppOptions): Promise<void> {
	initGlobalEnv(params);
	void params.ready('ABTReady');
}
