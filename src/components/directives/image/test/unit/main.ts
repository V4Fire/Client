/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

import type { ImageOptions } from 'components/directives/image';

import test from 'tests/config/unit/test';

import { BROKEN_PICTURE_SRC, EXISTING_PICTURE_SRC, SLOW_LOAD_PICTURE_SRC } from 'components/directives/image/test/const';
import {

	getPngBuffer,
	waitForAttribute,
	waitForImageLoad,
	waitForImageLoadFail

} from 'components/directives/image/test/helpers';
import type { ImageTestLocators } from 'components/directives/image/test/interface';

test.describe('components/directives/image', () => {

	test.use({viewport: {width: 100, height: 100}});

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('the provided main image should be shown when loaded successfully', async ({page}) => {
		const {imageWrapper, image} = await createImageForTest(page, {src: EXISTING_PICTURE_SRC});

		await waitForImageLoad(page, imageWrapper);

		const imageWrapperStyle = await imageWrapper.getAttribute('style');

		test.expect(imageWrapperStyle).toBe(null);
		await test.expect(imageWrapper.getAttribute('data-image')).toBeResolvedTo('loaded');

		await test.expect(image.getAttribute('style')).toBeResolvedTo('opacity: 1;');
		await test.expect(image.getAttribute('data-img')).toBeResolvedTo('loaded');
		await test.expect(image.getAttribute('src')).toBeResolvedTo(EXISTING_PICTURE_SRC);
	});

	test('the provided prefix should be used as a prefix for `src` attribute', async ({page}) => {
		const {image} = await createImageForTest(page, {src: 'test.png', baseSrc: 'http://127.0.0.1:1234'});

		await test.expect(image.getAttribute('src')).toBeResolvedTo('http://127.0.0.1:1234/test.png');
	});

	test('the `srcset` attribute should be set', async ({page}) => {
		const srcset = {
			'1x': EXISTING_PICTURE_SRC,
			'2x': BROKEN_PICTURE_SRC
		};

		const {image} = await createImageForTest(page, {
			srcset
		});

		const expectedSrcset = Object.entries(srcset).map(([k, v]) => `${v} ${k}`).join(', ');

		await test.expect(image.getAttribute('srcset')).toBeResolvedTo(expectedSrcset);
	});

	test('the `width` and the `height` attributes should be set', async ({page}) => {
		const {image} = await createImageForTest(page, {
			width: 100,
			height: 50
		});

		await test.expect(image.getAttribute('width')).toBeResolvedTo('100');
		await test.expect(image.getAttribute('height')).toBeResolvedTo('50');
	});

	test('the `sizes` attribute should be set', async ({page}) => {
		const {image} = await createImageForTest(page, {
			sizes: '20px'
		});

		await test.expect(image.getAttribute('sizes')).toBeResolvedTo('20px');
	});

	test('a `picture` tag should be rendered when a list of sources is provided', async ({page}) => {
		const {picture} = await createImageForTest(page, {
			sources: [
				{width: 20, height: 20, srcset: EXISTING_PICTURE_SRC},
				{width: 0, height: 0, srcset: BROKEN_PICTURE_SRC}
			]
		});

		const sourcesLocators = await picture.locator('source').all();

		await test.expect(
			Promise.all(
				sourcesLocators.map((locator) => locator.getAttribute('srcset'))
			)
		).toBeResolvedTo([EXISTING_PICTURE_SRC, BROKEN_PICTURE_SRC]);
	});

	test('the `alt` attribute should be set', async ({page}) => {
		const {image} = await createImageForTest(page, {
			alt: 'Alt text'
		});

		await test.expect(image.getAttribute('alt')).toBeResolvedTo('Alt text');
	});

	test('the initially invisible image should be loaded when `lazy` is set to false', async ({page}) => {
		const {imageWrapper, image} = await createImageForTest(page, {
			lazy: false,
			src: EXISTING_PICTURE_SRC
		}, {
			style: 'margin-top: 200px'
		});

		await waitForImageLoad(page, imageWrapper);

		await test.expect(image.getAttribute('data-img')).toBeResolvedTo('loaded');
	});

	test('the preview image should be shown if image is not loaded yet', async ({page, context}) => {
		await context.route(SLOW_LOAD_PICTURE_SRC, (route) => {
			const buffer = getPngBuffer();

			setTimeout(() => route.fulfill({
				contentType: 'image/png',
				body: buffer
			}), 500);

		});

		const {imageWrapper, image} = await createImageForTest(page, {
			src: SLOW_LOAD_PICTURE_SRC,
			preview: EXISTING_PICTURE_SRC
		});

		const imageWrapperStyle = await imageWrapper.getAttribute('style');

		test.expect(imageWrapperStyle?.startsWith(`background-image: url("${EXISTING_PICTURE_SRC}");`))
			.toBe(true);

		await test.expect(imageWrapper.getAttribute('data-image')).toBeResolvedTo('preview');
		await test.expect(image.getAttribute('style')).toBeResolvedTo('opacity: 0;');
	});

	test('the fallback image should be shown when main image failed loading', async ({page}) => {
		const {imageWrapper, image} = await createImageForTest(page, {
			src: BROKEN_PICTURE_SRC,
			broken: EXISTING_PICTURE_SRC
		});

		await waitForImageLoadFail(page, imageWrapper);

		await test.expect(imageWrapper.getAttribute('data-image')).toBeResolvedTo('broken');

		await test.expect(imageWrapper.getAttribute('style'))
			.toBeResolvedTo(`background-image: url("${EXISTING_PICTURE_SRC}");`);

		await test.expect(image.getAttribute('data-img')).toBeResolvedTo('failed');
		await test.expect(image.getAttribute('style')).toBeResolvedTo('opacity: 0;');
	});

	test('the load handler should be called on image load', async ({page}) => {
		const {image} = await createImageForTest(page, {
			src: EXISTING_PICTURE_SRC,

			onLoad: (el: Element) => {
				el.setAttribute('data-on-load-called', '1');
			}
		});

		await waitForAttribute(page, image, 'data-on-load-called');

		await test.expect(image.getAttribute('data-on-load-called')).toBeResolvedTo('1');
	});

	test('the error handler should be called on image load error', async ({page}) => {
		const {image} = await createImageForTest(page, {
			src: BROKEN_PICTURE_SRC,

			onError: (el: Element) => {
				el.setAttribute('data-on-error-called', '1');
			}
		});

		await waitForAttribute(page, image, 'data-on-error-called');

		await test.expect(image.getAttribute('data-on-error-called')).toBeResolvedTo('1');
	});

	test('the options resolver`s return value should be used for loading', async ({page}) => {
		const {image} = await createImageForTest(page, {
			src: BROKEN_PICTURE_SRC,
			optionsResolver: (opts) => ({...opts, src: `${opts.src}#resolver-called`})
		});

		const imageSrc = await image.getAttribute('src');

		test.expect(imageSrc?.endsWith('resolver-called')).toBe(true);
	});

	/**
	 * Creates an element with `image` directive
	 *
	 * @param page
	 * @param imageOpts - options for the `image` directive
	 * @param [attrs] - additional attributes for the element to which the directive is applied
	 */
	async function createImageForTest(
		page: Page, imageOpts: Partial<ImageOptions>, attrs?: Partial<RenderComponentsVnodeParams['attrs']>
	): Promise<ImageTestLocators> {

		await page.evaluate(
			(attrs) => {
				globalThis.renderComponents('div', [{attrs}]);
			},
			{
				...attrs,
				'data-testid': 'imageWrapper',
				'v-image': imageOpts
			}
		);

		await page.waitForSelector('span[data-testid="imageWrapper"]');

		const imageWrapper = page.getByTestId('imageWrapper');

		return {
			imageWrapper,
			image: imageWrapper.locator('img'),
			picture: imageWrapper.locator('picture')
		};
	}

});
