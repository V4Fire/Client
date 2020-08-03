/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { InitOptions, AdapteeInstance } from 'core/component/directives/in-view/interface';

/**
 * Returns the first adaptee which is acceptable
 * @param strategies
 */
export function getAdaptee(strategies: AdapteeInstance[]): CanUndef<AdapteeInstance> {
	for (let i = 0; i < strategies.length; i++) {
		const
			strategy = strategies[i];

		if (strategy.acceptable === true) {
			return strategy;
		}
	}

	return undefined;
}

/**
 * Validates the specified value
 * @param value
 */
export function valueValidator(value: CanUndef<InitOptions>): boolean {
	// eslint-disable-next-line @typescript-eslint/unbound-method
	return Boolean(value && (value.callback || value.onEnter || value.onLeave));
}

/**
 * Returns true if the specified element is in view
 *
 * @param elRect - element DOMRect
 * @param [threshold] - ratio of an intersection area to the total bounding box area for the observed target
 * @param [scrollRoot]
 */
export function isInView(elRect: DOMRect, threshold: number = 1, scrollRoot?: Element): boolean {
	const {
		top,
		right,
		bottom,
		left,
		width,
		height
	} = elRect;

	if (elRect.height === 0 || elRect.width === 0) {
		return false;
	}

	const
		root = scrollRoot ?? document.documentElement,
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
		scrollRect.bottom - top >= elementThreshold.y &&
		scrollRect.right - left >= elementThreshold.x &&
		intersection.top >= elementThreshold.y &&
		intersection.right >= elementThreshold.x &&
		intersection.bottom >= elementThreshold.y &&
		intersection.left >= elementThreshold.x
	);
}
