/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ScrollRect, ElementPosition } from 'core/dom/intersection-watcher/engines/interface';

/**
 * Returns the scrollable geometry of the passed element
 */
export function getElementScrollRect(el: Element): ScrollRect {
	return {
		width: el.clientWidth,
		height: el.clientHeight,
		scrollLeft: el.scrollLeft,
		scrollTop: el.scrollTop
	};
}

/**
 * Returns the geometry and position of the specified element relative to the given scrollable parent
 *
 * @param el
 * @param scrollParent
 */
export function getElementPosition(el: Element, scrollParent: ScrollRect): ElementPosition {
	const
		rect = el.getBoundingClientRect();

	const
		{width, height} = rect;

	const
		top = scrollParent.scrollTop + rect.top,
		left = scrollParent.scrollLeft + rect.left;

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
 * Returns true if the specified element is in view relative to the given scrollable parent
 *
 * @param el
 * @param scrollParent
 * @param threshold - the percentage of element visibility at which this function will return true
 */
export function isElementInView(
	el: Element | ElementPosition,
	scrollParent: ScrollRect,
	threshold: number
): boolean {
	const
		pos = el instanceof Element ? getElementPosition(el, scrollParent) : el;

	if (pos.width === 0 || pos.height === 0) {
		return false;
	}

	const
		minElVisibleHeight = pos.top + pos.height * threshold,
		minElVisibleWidth = pos.left + pos.width * threshold;

	const
		parentScrollHeight = scrollParent.scrollTop + scrollParent.height,
		parentScrollWidth = scrollParent.scrollLeft + scrollParent.width;

	const
		isElInParentY = parentScrollHeight >= minElVisibleHeight,
		isElInParentX = parentScrollWidth >= minElVisibleWidth;

	const
		isVisibleElYTop = minElVisibleHeight >= scrollParent.scrollTop,
		isVisibleElYBottom = pos.bottom - pos.height * threshold < scrollParent.scrollTop;

	const isVisibleElX = pos.left > 0 ?
		pos.left - pos.width * threshold <= scrollParent.scrollLeft + scrollParent.width :
		minElVisibleWidth >= scrollParent.scrollLeft;

	return isElInParentY && isElInParentX && isVisibleElYTop && isVisibleElX && !isVisibleElYBottom;
}
