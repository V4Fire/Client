/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { InitAppParams } from 'core/init/interface';

/**
 * Initializes the global state of the application (user session initialization, online status loading, etc.)
 * @param params - additional initialization parameters
 */
export default async function initState(params: InitAppParams): Promise<void> {
	if (!SSR) {
		try {
			await params.session.isExists();

		} catch (err) {
			stderr(err);
		}
	}

	void params.ready('stateReady');
}
