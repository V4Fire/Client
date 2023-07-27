/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type {

	Page,
	BrowserContext,

	Locator,
	ElementHandle

} from 'playwright';

import { Component } from 'tests/helpers';

import {

	EXISTING_PICTURE_SRC,
	SLOW_LOAD_PICTURE_SRC

} from 'components/directives/image/test/const';

import type { ImageOptions } from 'components/directives/image';

/**
 * Waits for the attribute to appear for the element specified by the locator on this page
 *
 * @param page
 * @param locator
 * @param attrName
 * @param [attrValue]
 */
export async function waitForAttribute(
	page: Page,
	locator: Locator,
	attrName: string,
	attrValue?: string
): Promise<void> {
	const handle = await locator.elementHandle();

	await page.waitForFunction(
		([el, attr, expected]) => {
			const actual = el.getAttribute(attr);

			if (actual == null) {
				return false;
			}

			if (expected == null) {
				return true;
			}

			return actual === expected;
		},

		<[ElementHandle<HTMLElement>, string, CanUndef<string>]>[handle!, attrName, attrValue]
	);
}

/**
 * Waits until the image specified by the locator is loaded
 *
 * @param page
 * @param locator
 */
export async function waitForImageLoad(page: Page, locator: Locator): Promise<void> {
	await waitForImgState(page, locator, 'loaded');
	await waitForAttribute(page, locator, 'data-image', 'loaded');
}

/**
 * Waits until the image specified by the locator is loaded with an error.
 *
 * @param page
 * @param locator
 */
export async function waitForImageLoadFail(page: Page, locator: Locator): Promise<void> {
	return waitForImgState(page, locator, 'failed');
}

/**
 * Waits for the `<img>` element of the image directive to transition to the specified state
 *
 * @param page
 * @param locator
 * @param state
 */
async function waitForImgState(page: Page, locator: Locator, state: 'loaded' | 'failed'): Promise<void> {
	const imgLocator = locator.locator('img');
	await waitForAttribute(page, imgLocator, 'data-img', state);
}

/**
 * Servers static assets for testing image loading
 * @param context
 */
export async function serveStatic(context: BrowserContext): Promise<void> {
	await context.route(SLOW_LOAD_PICTURE_SRC, (route) => {
		setTimeout(() => route.fulfill({
			contentType: 'image/png',
			body: getPngBuffer()
		}), 500);
	});

	function getPngBuffer() {
		return Buffer.from(EXISTING_PICTURE_SRC.split(',')[1], 'base64');
	}
}

interface ImageTestLocators {
	wrapper: Locator;
	container: Locator;
	image: Locator;
	picture: Locator;
}

/**
 * Renders an element with the `v-image` directive with the specified parameters
 *
 * @param page
 * @param imageOpts
 * @param [attrs] - additional attributes for the element to which the directive is attached
 */
export async function renderDirective(
	page: Page,
	imageOpts: Partial<ImageOptions>,
	attrs?: Partial<RenderComponentsVnodeParams['attrs']>
): Promise<ImageTestLocators> {
	await Component.createComponent(page, 'div', {
		attrs: {
			'data-testid': 'target'
		},

		children: [
			{
				type: 'div',

				attrs: {
					...attrs,
					'v-image': imageOpts
				}
			}
		]
	});

	const wrapper = page.getByTestId('target');

	return {
		wrapper,
		container: wrapper.locator('span'),
		image: wrapper.locator('img'),
		picture: wrapper.locator('picture')
	};
}
