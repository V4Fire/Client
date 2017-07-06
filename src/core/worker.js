'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Special class for using web workers with WebPack
 *
 * @example
 * new RawWorker(require('raw!./workers/lanczos.js'))
 */
export class RawWorker {
	/**
	 * @param text - worker text
	 */
	constructor(text: string): Worker {
		return new Worker(URL.createObjectURL(new Blob([text])));
	}
}
