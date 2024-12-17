/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

//#unless node_js
import { measure as webMeasure } from 'core/performance/measure/engines/web';
//#endunless

/**
 * The measure method creates a named `PerformanceMeasure` object representing a time measurement between two marks
 * @param args
 */
export function measure(...args: Parameters<Performance['measure']>): CanUndef<ReturnType<Performance['measure']>> {
	//#unless node_js
	return webMeasure(...args);
	//#endif
}

/**
 * Wraps given function `original` with performance measurement with name `measurement`.
 * By default, measurements are only enabled if IS_PROD is false.
 * This may be overridden by supplying `enableMeasurement`.
 *
 * @param measurement
 * @param original
 * @param [enableMeasurement]
 */
export function wrapWithMeasurement<TThis = unknown, TArgs extends unknown[] = unknown[], TResult = void>(
	measurement: string | ((this: TThis, ...args: TArgs) => string),
	original: (this: TThis, ...args: TArgs) => TResult,
	enableMeasurement: boolean = !IS_PROD
) {
	if (!enableMeasurement) {
		return original;
	}

	return function wrapper(this: TThis, ...args: TArgs): TResult {
		if (typeof measurement === 'function') {
			measurement = <string>measurement.apply(this, args);
		}

		const start = performance.now();

		const result = original.apply(this, args);

		measure(measurement, {
			start,
			end: performance.now()
		});

		return result;
	};
}
