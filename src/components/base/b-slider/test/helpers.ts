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
 * @param options - options for rendering, may contain `params`, `attrs`, `children`, `childrenIds`
 * (in ascending order by priority). The last one option is used to construct images
 * with given ids and use them as slides.
 */
export function renderSlider(page: Page, options: {
	params?: RenderComponentsVnodeParams;
	attrs?: RenderComponentsVnodeParams['attrs'];
	children?: RenderComponentsVnodeParams['children'];
	childrenIds?: Array<number | string>;
}): Promise<JSHandle<bSlider>> {
	const params: RenderComponentsVnodeParams = {...options.params};

	if (options.attrs != null) {
		params.attrs = options.attrs;
	}

	if (options.children != null) {
		params.children = options.children;
	}

	if (options.childrenIds != null) {
		params.children = options.childrenIds.map((i) => ({
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

/**
 * Dispatches a touch event with given name (e. g. touchstart), using
 * given touch points for touches
 *
 * @param page
 * @param eventType - the type of the event
 * @param touchPoints - a point or an array of points for touches
 */
export async function dispatchTouchEvent(
	page: Page,
	eventType: string,
	touchPoints: CanArray<{ x: number; y: number }>
): Promise<void> {
	await page.evaluate(([eventType, touchPoints]) => {

		if (!Object.isArray(touchPoints)) {
			touchPoints = [touchPoints];
		}

		const event = new TouchEvent(eventType, {
			bubbles: true,
			cancelable: true,
			composed: true,
			touches: touchPoints.map<Touch>(({x: clientX, y: clientY}, identifier) => new Touch({
				identifier,
				clientX,
				clientY,
				target: document.documentElement
			}))
		});

		const {x, y} = touchPoints[0];
		document.elementFromPoint(x, y)?.dispatchEvent(event);
	}, <[string, CanArray<{ x: number; y: number }>]>[eventType, touchPoints]);
}
