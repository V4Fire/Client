/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Watcher } from 'core/dom/resize-watcher/interface';

/**
 * Returns true if geometry changes should cause the registered handler to be called
 *
 * @param newGeometry
 * @param oldGeometry
 * @param watcher
 */
export function shouldInvokeHandler(
	newGeometry: DOMRectReadOnly,
	oldGeometry: DOMRectReadOnly,
	watcher: Watcher
): boolean {
	const {
		watchWidth,
		watchHeight
	} = watcher;

	const {
		width: oldWidth,
		height: oldHeight
	} = oldGeometry;

	const {
		width: newWidth,
		height: newHeight
	} = newGeometry;

	let
		res = false;

	if (watchWidth) {
		res = oldWidth !== newWidth;
	}

	if (watchHeight && !res) {
		res = oldHeight !== newHeight;
	}

	return res;
}
