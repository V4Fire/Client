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
 * @param state - additional application environment parameters
 */
export async function loadSession(state: InitAppParams): Promise<void> {
	try {
		// eslint-disable-next-line require-atomic-updates
		state.isAuth = await state.session.isExists();

	} catch (err) {
		stderr(err);
	}
}
