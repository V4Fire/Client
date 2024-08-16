/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * {@link Performance.measure}
 * @param args
 */
export function measure(...args: Parameters<Performance['measure']>): CanUndef<ReturnType<Performance['measure']>> {
	if (
		'performance' in globalThis &&
		Object.isFunction(Object.get(globalThis, 'performance.measure'))
	) {
		return performance.measure(...args);
	}
}
