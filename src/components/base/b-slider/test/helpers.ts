/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import Component from 'tests/helpers/component';

import type bSlider from 'components/base/b-slider/b-slider';

/**
 * Renders the slider using given options
 *
 * @param page
 * @param [opts] - options for rendering the slider:
 *   it may contain parameters, attributes, children, and `childrenIds` (this option is used to construct images
 *   with given IDs and use them as slides)
 */
export function renderSlider(page: Page, opts: {
	params?: RenderComponentsVnodeParams;
	attrs?: RenderComponentsVnodeParams['attrs'];
	children?: RenderComponentsVnodeParams['children'];
	childrenIds?: Array<number | string>;
}): Promise<JSHandle<bSlider>> {
	const params: RenderComponentsVnodeParams = {...opts.params};

	if (opts.attrs != null) {
		params.attrs = opts.attrs;
	}

	if (opts.children != null) {
		params.children = opts.children;
	}

	if (opts.childrenIds != null) {
		params.children = opts.childrenIds.map((i) => ({
			type: 'img',
			attrs: {
				id: i,
				src: 'https://fakeimg.pl/300x200',
				width: 300,
				height: 200
			}
		}));
	}

	return Component.createComponent<bSlider>(page, 'b-slider', params);
}

/**
 * Returns the index of the current active slide
 * @param slider - bSlider context
 */
export function current(slider: JSHandle<bSlider>): Promise<number> {
	return slider.evaluate((ctx) => ctx.current);
}

/**
 * Returns the last index of DOM nodes within the `content` block
 * @param slider - bSlider context
 */
export function lastIndex(slider: JSHandle<bSlider>): Promise<number> {
	return slider.evaluate((ctx) => ctx.contentLength - 1);
}
