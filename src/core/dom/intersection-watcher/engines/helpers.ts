/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementPosition, ScrollPosition } from 'core/dom/intersection-watcher/engines/interface';

const
	rectCache = new Map<Element, DOMRect>();

{
	const
		getFromCache = rectCache.get.bind(rectCache),
		setToCache = rectCache.set.bind(rectCache);

	let
		timer: CanNull<ReturnType<typeof setTimeout>> = null;

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

export enum InViewStatus {
	left = -2,
	right = -1,
	false = 0,
	true = 1
}

/**
 * Resolves the given target on which the scroll occurs
 * @param target
 */
export function resolveScrollTarget(target: null | undefined): CanUndef<Element>;

/**
 * Resolves the given target on which the scroll occurs
 * @param target
 */
export function resolveScrollTarget(target: Document | Element): Element;

/**
 * Resolves the given target on which the scroll occurs
 * @param target
 */
// eslint-disable-next-line @typescript-eslint/unified-signatures
export function resolveScrollTarget(target: Nullable<Document | Element>): CanUndef<Element>;

export function resolveScrollTarget(target: Nullable<Document | Element>): CanUndef<Element> {
	if (target == null) {
		return undefined;
	}

	return target === document ? target.documentElement : Object.cast(target);
}

/**
 * Checks if the specified element is in view relative to the given scrollable root.
 * The function returns a special enum that can be used for binary search.
 *
 * @param el
 * @param root
 * @param threshold - the percentage of element visibility at which this function will return true
 */
export function isElementInView(el: Element, root: Element, threshold: number): InViewStatus {
	el = resolveScrollTarget(el);
	root = resolveScrollTarget(root);

	const
		// Old versions of Chromium don't support `isConnected`
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		isConnected = el.isConnected ?? true;

	if (!isConnected) {
		return InViewStatus.false;
	}

	const
		rect = rectCache.get(el)!;

	if (root !== document.documentElement) {
		const
			rootRect = rectCache.get(root)!,
			areaInView = calcElementAreaInView(rect, rootRect);

		if (areaInView < threshold) {
			if (
				rect.bottom > rootRect.bottom ||
				rect.right > rootRect.right
			) {
				return InViewStatus.left;
			}

			if (
				rect.top > rootRect.top ||
				rect.left > rootRect.left
			) {
				return InViewStatus.right;
			}
		}
	}

	const areaInView = calcElementAreaInView(rect);

	if (areaInView < threshold) {
		if (
			rect.bottom > innerHeight ||
			rect.right > innerWidth
		) {
			return InViewStatus.left;
		}

		if (
			rect.top < 0 ||
			rect.left < 0
		) {
			return InViewStatus.right;
		}
	}

	return InViewStatus.true;
}

/**
 * Calculates the area of the specified element that is in the viewport / in the view of a
 * given scrollable root element.
 * The function returns the size of the area in relative units.
 *
 * @param rect
 * @param rootRect
 */
function calcElementAreaInView(rect: DOMRect, rootRect?: DOMRect): number {
	const
		topBound = rootRect?.top ?? 0,
		rightBound = rootRect?.right ?? innerWidth,
		bottomBound = rootRect?.bottom ?? innerHeight,
		leftBound = rootRect?.left ?? 0,
		rootWidth = rootRect?.width ?? innerWidth,
		rootHeight = rootRect?.height ?? innerHeight;

	let
		heightInView: number,
		widthInView: number;

	if (rect.left >= leftBound && rect.right <= rightBound) {
		widthInView = rect.width;

	} else if (rect.left < leftBound && rect.right > rightBound) {
		widthInView = rootWidth;

	} else if (rect.right > rightBound) {
		widthInView = Math.max(0, rect.width - (rect.right - rightBound));

	} else {
		widthInView = Math.max(0, rect.right);
	}

	if (rect.top >= topBound && rect.bottom <= bottomBound) {
		heightInView = rect.height;

	} else if (rect.top < topBound && rect.bottom > bottomBound) {
		heightInView = rootHeight;

	} else if (rect.bottom > bottomBound) {
		heightInView = Math.max(0, rect.height - (rect.bottom - bottomBound));

	} else {
		heightInView = Math.max(0, rect.bottom);
	}

	return (widthInView / rect.width) * (heightInView / rect.height);
}
