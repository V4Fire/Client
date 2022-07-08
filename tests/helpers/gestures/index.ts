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
	 * @param opts
	 */
	static async create(page: Page, opts: TouchGesturesCreateOptions): Promise<JSHandle<GesturesInterface>> {
		const
			res = await page.evaluateHandle((options) => new globalThis._Gestures(options), opts);

		return <JSHandle<GesturesInterface>>res;
	}

	/**
	 * @param page
	 * @param opts
	 * @deprecated
	 * @see [[Gestures.create]]
	 */
	async create(page: Page, opts: TouchGesturesCreateOptions): Promise<JSHandle<GesturesInterface>> {
		return Gestures.create(page, opts);
	}
}
