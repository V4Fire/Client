/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import type bSlider from 'components/base/b-slider/b-slider';

import Component from 'tests/helpers/component';

/**
 * Creates b-slider component with the provided parameters
 *
 * @param page - playwright's isolated page
 * @param params - additional vnode parameters
 */
export function renderSlider(page: Page, params: RenderComponentsVnodeParams = {}): Promise<JSHandle<bSlider>> {
	return Component.createComponent(page, 'b-slider', params);
}

/**
 * @param slider
 */
export function current(slider: JSHandle<bSlider>): Promise<number> {
	return slider.evaluate((ctx) => ctx.current);
}

/**
 * @param slider
 */
export function lastIndex(slider: JSHandle<bSlider>): Promise<number> {
	return slider.evaluate((ctx) => ctx.contentLength - 1);
}
