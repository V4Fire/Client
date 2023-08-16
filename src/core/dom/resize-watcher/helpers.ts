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

	if (watchWidth) {
		res = oldWidth !== newWidth;
	}

	if (watchHeight && !res) {
		res = oldHeight !== newHeight;
	}

	if(!res && watcher.box === 'border-box' && newBoxSize?.length !== undefined && oldBoxSize?.length !== undefined) {
		if(watchWidth) {
			res = newBoxSize[0].inlineSize !== oldBoxSize[0].inlineSize;
		}

		if (watchHeight && !res) {
			res = newBoxSize[0].blockSize !== oldBoxSize[0].blockSize;
		}
	}

	return res;
}
