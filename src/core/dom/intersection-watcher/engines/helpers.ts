/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { SearchDirection, ElementPosition, ScrollPosition } from 'core/dom/intersection-watcher/engines/interface';

const
	rectCache = new Map<Element, DOMRect>();

{
	const
		getFromCache = rectCache.get.bind(rectCache),
		setToCache = rectCache.set.bind(rectCache);

	let
		timer;

	rectCache.get = (key) => {
		let
			val = getFromCache(key);

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

		return setToCache(key, value);
	};
}

/**
 * Returns the overall scroll position of the given element and the document
 * @param el
 */
export function getRootScrollPosition(el: Element): ScrollPosition {
	const
		isGlobalRoot = el === document.documentElement;

	return {
		top: el.scrollTop + (isGlobalRoot ? 0 : scrollY),
		left: el.scrollLeft + (isGlobalRoot ? 0 : scrollX)
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
		scrollPos = getRootScrollPosition(root);

	return {
		width: rect.width,
		height: rect.height,

		top: rect.top + scrollPos.top,
		left: rect.left + scrollPos.left
	};
}

/**
 * Returns true if the specified element is in view relative to the given scrollable root.
 * If the element is out of view, then the method returns the direction for the binary search.
 *
 * @param el
 * @param root
 * @param threshold - the percentage of element visibility at which this function will return true
 */
export function isElementInView(el: Element, root: Element, threshold: number): boolean | SearchDirection {
	const
		// Old versions of Chromium don't support `isConnected`
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		isConnected = el.isConnected ?? true;

	if (!isConnected) {
		return false;
	}

	const
		rect = rectCache.get(el)!;

	const
		minWidth = rect.width * threshold,
		minHeight = rect.height * threshold;

	if (root !== document.documentElement) {
		const
			rootRect = rectCache.get(root)!;

		if (
			rootRect.bottom - rect.top < minHeight ||
			rootRect.right - rect.left < minWidth
		) {
			return SearchDirection.left;
		}

		if (
			rect.top - rootRect.top + rect.height < minHeight ||
			rect.left - rootRect.left + rect.width < minWidth
		) {
			return SearchDirection.right;
		}
	}

	if (
		rect.bottom - minHeight > innerHeight ||
		rect.right - minWidth > innerWidth
	) {
		return SearchDirection.left;
	}

	if (
		rect.top + minHeight < 0 ||
		rect.left + minWidth < 0
	) {
		return SearchDirection.right;
	}

	return true;
}
