/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle, Locator, Page } from 'playwright';
import { EXISTING_PICTURE_SRC } from 'components/directives/image/test/const';

/**
 * Returns a Buffer which contains a valid PNG image.
 */
export function getPngBuffer(): Buffer {
	return Buffer.from(EXISTING_PICTURE_SRC.split(',')[1], 'base64');
}

/**
 * Waits for `attribute` to appear (and optionally equal to given `value`)
 * on element pointed by `locator` on given `page`.
 *
 * @param page
 * @param locator
 * @param attribute
 * @param [value]
 */
export async function waitForAttribute(page: Page, locator: Locator, attribute: string, value?: string): Promise<void> {
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
		<[ElementHandle<HTMLElement>, string, CanUndef<string>]>[handle!, attribute, value]
	);
}

async function waitForImageState(page: Page, locator: Locator, state: 'loaded' | 'failed'): Promise<void> {
	const imgLocator = locator.locator('img');
	await waitForAttribute(page, imgLocator, 'data-img', state);
}

/**
 * Waits for image inside image wrapper pointed by `locator` to be loaded on given `page`.
 *
 * @param page
 * @param locator
 */
export async function waitForImageLoad(page: Page, locator: Locator): Promise<void> {
	await waitForImageState(page, locator, 'loaded');
	await waitForAttribute(page, locator, 'data-image', 'loaded');
}

/**
 * Waits for image loading inside image wrapper pointed by `locator` to be failed on given `page`.
 *
 * @param page
 * @param locator
 */
export async function waitForImageLoadFail(page: Page, locator: Locator): Promise<void> {
	return waitForImageState(page, locator, 'failed');
}
