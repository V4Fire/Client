/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export * from '@v4fire/core/core/const/support';

export const IntersectionObserver =
	Object.isFunction(globalThis.IntersectionObserver) &&
	Object.isFunction(globalThis.IntersectionObserverEntry) &&
	'intersectionRatio' in IntersectionObserverEntry.prototype;
