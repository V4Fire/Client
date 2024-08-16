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

