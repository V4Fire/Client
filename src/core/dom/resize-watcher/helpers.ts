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
 * @param newBoxSize
 * @param oldBoxSize
 * @param watcher
 */
export function shouldInvokeHandler(
	newRect: DOMRectReadOnly,
	oldRect: DOMRectReadOnly,
	newBoxSize: CanUndef<readonly ResizeObserverSize[]>,
	oldBoxSize: CanUndef<readonly ResizeObserverSize[]>,
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

	// If the environment supports the boxSize property, use it. Otherwise, use DOMRect.
	const isBoxSizeSupported = newBoxSize !== undefined &&
		oldBoxSize !== undefined &&
		newBoxSize.length > 0 &&
		oldBoxSize.length > 0;

	if (isBoxSizeSupported) {
		if (watchWidth) {
			res = newBoxSize[0].inlineSize !== oldBoxSize[0].inlineSize;
		}

		if (watchHeight && !res) {
			res = newBoxSize[0].blockSize !== oldBoxSize[0].blockSize;
		}
	} else {
		if (watchWidth) {
			res = oldWidth !== newWidth;
		}

		if (watchHeight && !res) {
			res = oldHeight !== newHeight;
		}
	}

	return res;
}
