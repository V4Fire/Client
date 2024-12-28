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
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (typeof globalThis.performance?.measure !== 'undefined') {
		return performance.measure(...args);
	}
}
