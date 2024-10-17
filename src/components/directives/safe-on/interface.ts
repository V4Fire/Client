/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface SafeOnElement extends Element {
	/**
	 * Private field to store event invokers
	 * - vei = vue event invokers
	 */
	_vei?: Record<string, EventListenerOrEventListenerObject | undefined>;
}
