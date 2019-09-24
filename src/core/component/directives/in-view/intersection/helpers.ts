/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const hasIntersection =
	// tslint:disable-next-line strict-type-predicates
	typeof IntersectionObserver === 'function' &&
	// tslint:disable-next-line strict-type-predicates
	typeof IntersectionObserverEntry === 'function' &&
	'intersectionRatio' in IntersectionObserverEntry.prototype;
