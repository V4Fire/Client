/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const hasIntersection =
	typeof IntersectionObserver === 'function' &&

	typeof IntersectionObserverEntry === 'function' &&

	'intersectionRatio' in IntersectionObserverEntry.prototype;
