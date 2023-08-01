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
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
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
	 * Dispatches a touch event
	 *
	 * @param page
	 * @param eventType
	 * @param touchPoints
	 */
	static async dispatchTouchEvent(
		page: Page,
		eventType: 'touchstart' | 'touchmove' | 'touchend',
		touchPoints: CanArray<{ x: number; y: number }>
	): Promise<void> {
		await page.evaluate(
			({eventType, touchPoints}) =>
				globalThis._Gestures.dispatchTouchEvent(eventType, touchPoints),
			{eventType, touchPoints}
		);
	}
}
