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
 */
export function isInView(el: Element, threshold: number = 1): boolean {
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

	const intersection = {
		top: bottom,
		right: document.documentElement.clientWidth - left,
		bottom: document.documentElement.clientHeight - top,
		left: right
	};

	const elementThreshold = {
		x: threshold * width,
		y: threshold * height
	};

	return (
		intersection.top >= elementThreshold.y &&
		intersection.right >= elementThreshold.x &&
		intersection.bottom >= elementThreshold.y &&
		intersection.left >= elementThreshold.x
	);
}
