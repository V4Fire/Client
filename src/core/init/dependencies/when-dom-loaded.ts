/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { resolveAfterDOMLoaded } from 'core/event';
import type { InitAppParams } from 'core/init/interface';

/**
 * Returns a promise that will be resolved after the `DOMContentLoaded` event
 * @param _state
 */
export function whenDOMLoaded(_state: InitAppParams): Promise<void> {
	return resolveAfterDOMLoaded();
}
