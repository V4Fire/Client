/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Wrapper for using web workers with WebPack
 *
 * @example
 * RawWorker(require('raw!./workers/lanczos.js'))
 *
 * @param text - worker text
 */
export function RawWorker(text: string): Worker {
	return new Worker(URL.createObjectURL(new Blob([text])));
}
