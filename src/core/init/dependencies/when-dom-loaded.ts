/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { resolveAfterDOMLoaded } from 'core/event';
import type { State } from 'core/component';

/**
 * Returns a promise that will be resolved after the `DOMContentLoaded` event
 * @param _state
 */
export function whenDOMLoaded(_state: State): Promise<void> {
	return resolveAfterDOMLoaded();
}
