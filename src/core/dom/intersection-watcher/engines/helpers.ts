/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementPosition } from 'core/dom/intersection-watcher/engines/interface';

const
	rectCache = new Map<Element, DOMRect>();

{
	const
		getFromRectCache = rectCache.get.bind(rectCache),
		addToRectCache = rectCache.set.bind(rectCache);

	let
		timer;

	rectCache.get = (key) => {
		let
			val = getFromRectCache(key);

		if (val == null) {
			val = key.getBoundingClientRect();
			rectCache.set(key, val);
		}

		return val;
	};

	rectCache.set = (key, value) => {
		if (timer == null) {
			timer = setTimeout(() => {
				rectCache.clear();
				timer = null;
			}, 15);
		}

		return addToRectCache(key, value);
	};
}

/**
 * Returns the geometry and position of the specified element relative to the given scrollable root
 *
 * @param el
 * @param root
 */
export function getElementPosition(el: Element, root: Element): ElementPosition {
	const
		rect = rectCache.get(el)!,
		isGlobalRoot = root === document.documentElement;

	const
		{width, height} = rect;

	const
		top = rect.top + root.scrollTop + (isGlobalRoot ? 0 : scrollY),
		left = rect.left + root.scrollLeft + (isGlobalRoot ? 0 : scrollX);

	return {
		bottom: top + height,
		right: left + width,

		top,
		left,

		width,
		height
	};
}

/**
 * Returns true if the specified element is in view relative to the given scrollable root
 *
 * @param el
 * @param root
 * @param threshold - the percentage of element visibility at which this function will return true
 */
export function isElementInView(el: Element, root: Element, threshold: number): boolean {
	const
		// Old versions of Chromium don't support `isConnected`
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		isConnected = el.isConnected ?? true;

	if (!isConnected) {
		return false;
	}

	const
		rect = rectCache.get(el)!;

	if (root !== document.documentElement) {
		const
			rootRect = rectCache.get(root)!;

		if (rootRect.top > rect.top + rect.height * threshold) {
			return false;
		}

		if (rootRect.top + rootRect.height < rect.bottom - rect.height * threshold) {
			return false;
		}
	}

	return !(
		1 - (rect.top >= 0 ? 0 : -rect.top) / rect.height < threshold ||
		1 - (rect.bottom - innerHeight) / rect.height < threshold
	);
}
