/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { resolveAfterDOMLoaded } from 'core/event';
import type { InitAppOptions } from 'core/init/interface';

export default function initDom(params: InitAppOptions): Promise<void> {
	return resolveAfterDOMLoaded().then(() => params.semaphore('DOMReady'));
}
