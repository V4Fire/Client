/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Returns a first adaptee which is acceptable
 * @param strategies
 */
export function getAdaptee<T extends {acceptable: boolean}>(strategies: T[]): CanUndef<T> {
	for (let i = 0; i < strategies.length; i++) {
		const
			strategy = strategies[i];

		if (strategy.acceptable) {
			return strategy;
		}
	}

	return undefined;
}

/**
 * Returns true if the specified element is in view
 *
 * @param el
 * @param [threshold]
 * @param [scrollRoot]
 */
export function isInView(el: Element, threshold: number = 1, scrollRoot?: Element): boolean {
	if (!document.documentElement) {
		return false;
	}

	const {
		top,
		right,
		bottom,
		left,
		width,
		height
	} = el.getBoundingClientRect();

	const
		root = scrollRoot || document.documentElement,
		scrollRect = root.getBoundingClientRect();

	const intersection = {
		top: bottom,
		right: scrollRect.width - left,
		bottom: scrollRect.height - top,
		left: right
	};

	if (scrollRoot) {
		intersection.right -= scrollRoot.scrollLeft;
		intersection.top -= scrollRoot.scrollTop;
	}

	const elementThreshold = {
		x: threshold * width,
		y: threshold * height
	};

	return (
		top - scrollRect.top - height >= elementThreshold.y &&
		scrollRect.right - left >= elementThreshold.x &&
		intersection.top >= elementThreshold.y &&
		intersection.right >= elementThreshold.x &&
		intersection.bottom >= elementThreshold.y &&
		intersection.left >= elementThreshold.x
	);
}
