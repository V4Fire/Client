/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';

import type GesturesInterface from 'core/prelude/test-env/gestures';

/**
 * Class provides API to work with touch gestures
 */
export default class Gestures {
	/**
	 * Creates a gesture instance
	 *
	 * @param page
	 * @param options
	 */
	static async create(page: Page, options: TouchGesturesCreateOptions): Promise<JSHandle<GesturesInterface>> {
		const
			res = await page.evaluateHandle((options) => new globalThis._Gestures(options), options);

		return <JSHandle<GesturesInterface>>res;
	}

	/**
	 * @param page
	 * @param options
	 * @deprecated
	 * @see [[Gestures.create]]
	 */
	async create(page: Page, options: TouchGesturesCreateOptions): Promise<JSHandle<GesturesInterface>> {
		return Gestures.create(page, options);
	}
}
