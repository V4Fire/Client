/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { InitAppParams } from 'core/init/interface';

/**
 * Loads the user's session and sets the `isAuth` flag
 * @param params - additional application environment parameters
 */
export async function loadSession(params: InitAppParams): Promise<void> {
	try {
		// eslint-disable-next-line require-atomic-updates
		params.isAuth = await params.session.isExists();

	} catch (err) {
		stderr(err);
	}
}
