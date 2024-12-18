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
 * Measurements are only enabled if IS_PROD is false.
 *
 * @param measurement
 * @param original
 */
export function wrapWithMeasurement<TThis = unknown, TArgs extends unknown[] = unknown[], TResult = void>(
	measurement: string | ((this: TThis, ...args: TArgs) => CanNull<string>),
	original: (this: TThis, ...args: TArgs) => TResult
): (this: TThis, ...args: TArgs) => TResult {
	if (!IS_PROD) {
		return original;
	}

	return function wrapper(this: TThis, ...args: TArgs): TResult {
		const start = performance.now();

		const result = original.apply(this, args);

		const end = performance.now();

		let computedMeasurement: CanNull<string> = null;

		if (Object.isFunction(measurement)) {
			computedMeasurement = measurement.apply(this, args);

		} else {
			computedMeasurement = measurement;
		}

		if (computedMeasurement != null) {
			measure(computedMeasurement, {start, end});
		}

		return result;
	};
}
