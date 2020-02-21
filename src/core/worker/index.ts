/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/worker/README.md]]
 * @packageDocumentation
 */

/**
 * Wrapper to use web workers with WebPack
 *
 * @param text - worker text
 *
 * @example
 * ```js
 * RawWorker(require('raw!./workers/lanczos.ts'))
 * ```
 */
export function RawWorker(text: string): Worker {
	return new Worker(URL.createObjectURL(new Blob([text])));
}
