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
 * Creates b-slider component with the provided attributes
 *
 * @param page - playwright's isolated page
 * @param attrs - additional component's attributes
 */
export function renderSlider(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bSlider>> {
	return Component.createComponent(page, 'b-slider', {
		attrs
	});
}

