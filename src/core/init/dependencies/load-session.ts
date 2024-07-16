/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { State } from 'core/component';
import type { SessionDescriptor } from 'core/session';

/**
 * Loads the user's session and sets the `isAuth` flag
 * @param state - the global application state
 */
export async function loadSession(state: State): Promise<void> {
	state.async.on(state.session.emitter, 'set', (e: SessionDescriptor) => {
		state.isAuth = Boolean(e.auth);
	});

	state.async.on(state.session.emitter, 'clear', () => {
		state.isAuth = false;
	});

	try {
		// eslint-disable-next-line require-atomic-updates
		state.isAuth = await state.session.isExists();

	} catch (err) {
		stderr(err);
	}
}
