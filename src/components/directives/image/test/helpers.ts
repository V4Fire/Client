/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Locator, Page } from 'playwright';
import type { ImageOptions } from 'components/directives/image';

import { Component } from 'tests/helpers';
import type { ImageTestData } from 'components/directives/image/test/interface';

/**
 * Creates a <div> element containing a <span> with v-image set to given imageValue
 *
 * @param page - The target page.
 * @param imageValue - The value of v-image directive.
 */
export async function createDivForTest(page: Page, imageValue: Partial<ImageOptions>): Promise<Locator> {
	await Component.createComponent(page, 'div', {
		attrs: {
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

	return page.getByTestId('div');
}

/**
 * Returns image test data stored by v-image in attributes from <span> and <img> inside given <div>
 * @param divLocator - A locator to source <div>
 */
export async function getImageTestData(divLocator: Locator): Promise<ImageTestData> {
	const spanLocator = await divLocator.locator('span');
	const imgLocator = await divLocator.locator('img');
	const spanDataImage = await spanLocator.getAttribute('data-image');
	const spanStyle = await spanLocator.getAttribute('style');
	const imgDataImg = await imgLocator.getAttribute('data-img');
	const imgStyle = await imgLocator.getAttribute('style');
	const imgSrc = await imgLocator.getAttribute('src');
	return {
		span: {
			style: spanStyle,
			dataImage: spanDataImage
		},
		img: {
			style: imgStyle,
			dataImg: imgDataImg,
			src: imgSrc
		}
	};
}
