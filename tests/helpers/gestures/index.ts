/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';

import type GesturesInterface from '@src/core/prelude/test-env/gestures';

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
	async create(page: Page, options: TouchGesturesCreateOptions): Promise<JSHandle<GesturesInterface>> {
		const
			res = await page.evaluateHandle((options) => new globalThis._Gestures(options), options);

		return <JSHandle<GesturesInterface>>res;
	}
}
