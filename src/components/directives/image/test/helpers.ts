/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle, Locator, Page } from 'playwright';
import type { ImageOptions } from 'components/directives/image';

import { Component } from 'tests/helpers';
import type { ImageTestData, ImageTestImgData, ImageTestLocators } from 'components/directives/image/test/interface';
import { EXISTING_PICTURE_SRC } from 'components/directives/image/test/const';

/**
 * Creates a <div> element containing a <span> with v-image set to given imageValue
 *
 * @param page - The target page.
 * @param imageValue - The value of v-image directive.
 * @param [divAttributes] - Optional attributes for created <div>.
 */
export async function createDivForTest(
	page: Page, imageValue: Partial<ImageOptions>, divAttributes?: Partial<RenderComponentsVnodeParams['attrs']>
): Promise<ImageTestLocators> {
	await Component.createComponent(page, 'div', {
		attrs: {
			...divAttributes,
			'data-testid': 'div'
		},
		children: [
			{
				type: 'span',
				attrs: {
					'v-image': imageValue
				}
			}
		]
	});

	const divLocator = page.getByTestId('div');

	return {
		divLocator,
		imgLocator: divLocator.locator('img'),
		spanLocator: divLocator.locator('span')
	};
}

async function getImageTestImgData(imgLocator: Locator): Promise<ImageTestImgData> {
	const imgDataImg = await imgLocator.getAttribute('data-img');
	const imgStyle = await imgLocator.getAttribute('style');
	const imgSrc = await imgLocator.getAttribute('src');
	const imgSrcset = await imgLocator.getAttribute('srcset');
	const imgWidth = await imgLocator.getAttribute('width');
	const imgHeight = await imgLocator.getAttribute('height');
	const imgSizes = await imgLocator.getAttribute('sizes');
	const imgAlt = await imgLocator.getAttribute('alt');

	return {
		style: imgStyle,
		dataImg: imgDataImg,
		src: imgSrc,
		srcset: imgSrcset,
		width: imgWidth != null ? parseInt(imgWidth, 10) : null,
		height: imgHeight != null ? parseInt(imgHeight, 10) : null,
		sizes: imgSizes,
		alt: imgAlt
	};
}

/**
 * Returns image test data stored by v-image in attributes from <span> and <img> inside given <div>
 * @param divLocator - A locator to source <div>
 */
export async function getImageTestData(divLocator: Locator): Promise<ImageTestData> {
	const spanLocator = await divLocator.locator('span');
	const spanDataImage = await spanLocator.getAttribute('data-image');
	const spanStyle = await spanLocator.getAttribute('style');
	const imgLocator = await divLocator.locator('img');
	const imgData = await getImageTestImgData(imgLocator);
	const pictureLocator = await divLocator.locator('picture');
	const sourcesLocators = await pictureLocator.locator('source').all();

	const pictureSources = await Promise.all(
		sourcesLocators.map(async (locator) => ({
			srcset: await locator.getAttribute('srcset')
		}))
	);

	return {
		span: {
			style: spanStyle,
			dataImage: spanDataImage
		},
		img: imgData,
		picture: {
			sources: pictureSources
		}
	};
}

/**
 * Returns a Buffer which contains a valid PNG image.
 */
export function getPngBuffer(): Buffer {
	return Buffer.from(EXISTING_PICTURE_SRC.split(',')[1], 'base64');
}

/**
 * Waits for attribute to appear (and optionally equal to given value)
 * on element pointed by locator on given page.
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
 * Waits for image inside <div> pointed by locator to be loaded on given page.
 *
 * @param page
 * @param locator
 */
export async function waitForImageLoad(page: Page, locator: Locator): Promise<void> {
	return waitForImageState(page, locator, 'loaded');
}

/**
 * Waits for image loading inside <div> pointed by locator to be failed on given page.
 *
 * @param page
 * @param locator
 */
export async function waitForImageLoadFail(page: Page, locator: Locator): Promise<void> {
	return waitForImageState(page, locator, 'failed');
}
