/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Watcher } from 'core/dom/resize-watcher/interface';

/**
 * Returns true if geometry changes should cause the watcher handler to be called
 *
 * @param newRect
 * @param oldRect
 * @param watcher
 */
export function shouldInvokeHandler(
	newRect: DOMRectReadOnly,
	oldRect: DOMRectReadOnly,
	watcher: Watcher
): boolean {
	const {
		watchWidth,
		watchHeight
	} = watcher;

	const {
		width: oldWidth,
		height: oldHeight
	} = oldRect;

	const {
		width: newWidth,
		height: newHeight
	} = newRect;

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
