/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ScrollRect, ElementRect, WatcherPosition } from 'core/dom/intersection-watcher/engines/interface';

/**
 * Returns the geometry and position of the specified element relative to the given root
 *
 * @param el
 * @param root
 */
export function getElementRect(el: Element, root: ScrollRect): ElementRect {
	const
		rect = el.getBoundingClientRect();

	const
		{width, height} = rect;

	const
		top = root.scrollTop + rect.top,
		left = root.scrollLeft + rect.left;

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
 * Returns the root element geometry
 */
export function getScrollRect(): ScrollRect {
	const
		r = document.documentElement,
		s = <Element>document.scrollingElement;

	return {
		width: r.clientWidth,
		height: r.clientHeight,
		scrollLeft: s.scrollLeft,
		scrollTop: s.scrollTop
	};
}

/**
 * Returns true if the specified element is in view
 *
 * @param elRect
 * @param rootRect
 * @param threshold
 */
export function isInView(elRect: WatcherPosition, rootRect: RootRect, threshold: number): boolean {
	if (elRect.width === 0 || elRect.height === 0) {
		return false;
	}

	const
		isBoxInRootY = rootRect.scrollTop + rootRect.height >= elRect.top + elRect.height * threshold,
		isBoxInRootX = rootRect.scrollLeft + rootRect.width >= elRect.left + elRect.width * threshold,
		isVisibleYTop = elRect.top + elRect.height * threshold >= rootRect.scrollTop,
		isVisibleYBottom = elRect.bottom - elRect.height * threshold < rootRect.scrollTop,
		isVisibleX = elRect.left > 0 ?
			elRect.left - elRect.width * threshold <= rootRect.scrollLeft + rootRect.width :
			elRect.left + elRect.width * threshold >= rootRect.scrollLeft;

	return isBoxInRootY && isBoxInRootX && isVisibleYTop && isVisibleX && !isVisibleYBottom;
}

/**
 * Returns true if the specified element is in view
 *
 * @param elRect
 * @param rootRect
 * @param threshold
 */
export function isElementInView(elRect: ElementRect, rootRect: RootRect, threshold: number): boolean {
	if (elRect.width === 0 || elRect.height === 0) {
		return false;
	}

	const
		isBoxInRootY = rootRect.scrollTop + rootRect.height >= elRect.top + elRect.height * threshold,
		isBoxInRootX = rootRect.scrollLeft + rootRect.width >= elRect.left + elRect.width * threshold,
		isVisibleYTop = elRect.top + elRect.height * threshold >= rootRect.scrollTop,
		isVisibleYBottom = elRect.bottom - elRect.height * threshold < rootRect.scrollTop,
		isVisibleX = elRect.left > 0 ?
			elRect.left - elRect.width * threshold <= rootRect.scrollLeft + rootRect.width :
			elRect.left + elRect.width * threshold >= rootRect.scrollLeft;

	return isBoxInRootY && isBoxInRootX && isVisibleYTop && isVisibleX && !isVisibleYBottom;
}
