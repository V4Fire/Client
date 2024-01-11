/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { resolveAfterDOMLoaded } from 'core/event';

export default function initDom(semaphore: any): Promise<void> {
	return resolveAfterDOMLoaded().then(() => semaphore('DOMReady'));
}
