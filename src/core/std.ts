/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import 'core-js';
import 'core/shims';

//#if buildEdition = legacy
import ResizeObserverPolyfill from 'resize-observer-polyfill';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (globalThis.ResizeObserver == null) {
	globalThis.ResizeObserver = ResizeObserverPolyfill;
}
//#endif
