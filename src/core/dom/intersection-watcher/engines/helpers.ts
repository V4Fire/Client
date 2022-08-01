/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementPosition } from 'core/dom/intersection-watcher/engines/interface';

/**
 * Returns the geometry and position of the specified element relative to the given scrollable root
 *
 * @param el
 * @param root
 */
export function getElementPosition(el: Element, root: Element): ElementPosition {
	const
		rect = el.getBoundingClientRect(),
		isGlobalRoot = root === document.documentElement;

	const
		{width, height} = rect;

	const
		top = root.scrollTop + rect.top + (isGlobalRoot ? 0 : scrollY),
		left = root.scrollLeft + rect.left + (isGlobalRoot ? 0 : scrollX);

	return {
		bottom: top + height,
		right: left + width,

		top,
		left,

		width,
		height
	};
}

const
	rectCache = new Map<Element, DOMRect>();

{
	const
		addToRectCache = rectCache.set.bind(rectCache);

	let
		timer;

	rectCache.set = function set(key: Element, value: DOMRect) {
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
 * Returns true if the specified element is in view relative to the given scrollable root
 *
 * @param el
 * @param root
 * @param threshold - the percentage of element visibility at which this function will return true
 */
export function isElementInViewport(el: Element, root: Element, threshold: number): boolean {
	let
		rect = rectCache.get(el),
		rootRect = rectCache.get(root);

	if (rect == null) {
		rect = el.getBoundingClientRect();
		rectCache.set(el, rect);
	}

	if (rootRect == null) {
		rootRect = root.getBoundingClientRect();
		rectCache.set(root, rootRect);
	}

	if (rootRect.top > rect.top + rect.height * threshold) {
		return false;
	}

	if (rootRect.top + rootRect.height < rect.bottom - rect.height * threshold) {
		return false;
	}

	return !(
		1 - (rect.top >= 0 ? 0 : -rect.top) / rect.height < threshold ||
		1 - (rect.bottom - innerHeight) / rect.height < threshold
	);
}
