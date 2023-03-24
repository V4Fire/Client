/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import type bSlider from 'components/base/b-slider/b-slider';

/**
 * @param slider - playwright's wrapper over the `bSlider`
 *
 * @returns index of the current active slide
 */
export function current(slider: JSHandle<bSlider>): Promise<number> {
	return slider.evaluate((ctx) => ctx.current);
}

/**
 * @param slider - playwright's wrapper over the `bSlider`
 *
 * @returns the last index of DOM nodes within the `content` block
 */
export function lastIndex(slider: JSHandle<bSlider>): Promise<number> {
	return slider.evaluate((ctx) => ctx.contentLength - 1);
}
