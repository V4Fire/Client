/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { resolveAfterDOMLoaded } from 'core/event';
import type { InitAppOptions } from 'core/init/interface';

/**
 * Resolved after DOMContentLoaded event
 * @param params
 */
export default function initDom(params: InitAppOptions): Promise<void> {
	return resolveAfterDOMLoaded().then(() => params.ready('DOMReady'));
}
