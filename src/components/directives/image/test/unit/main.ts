/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { BROKEN_PICTURE_SRC, EXISTING_PICTURE_SRC, SLOW_LOAD_PICTURE_SRC } from 'components/directives/image/test/const';
import {

	createDivForTest,
	getImageTestData,
	getPngBuffer,
	waitForAttribute,
	waitForImageLoad,
	waitForImageLoadFail

} from 'components/directives/image/test/helpers';

test.describe('components/directives/image', () => {

	test.use({viewport: {width: 100, height: 100}});

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('the provided main image should be shown when loaded successfully', async ({page}) => {
		const {divLocator} = await createDivForTest(page, {src: EXISTING_PICTURE_SRC});
		await waitForImageLoad(page, divLocator);
		const {span, img} = await getImageTestData(divLocator);
		test.expect(span.dataImage).toBe('preview');
		test.expect(span.style).toBeNull();
		test.expect(img!.dataImg).toBe('loaded');
		test.expect(img!.style).toBeNull();
		test.expect(img!.src).toBe(EXISTING_PICTURE_SRC);
	});

	test('the provided prefix should be used as prefix for `src` attribute', async ({page}) => {
		const {divLocator} = await createDivForTest(page, {src: 'test.png', baseSrc: 'http://127.0.0.1:1234'});
		const {img} = await getImageTestData(divLocator);
		test.expect(img!.src).toBe('http://127.0.0.1:1234/test.png');
	});

	test('the `srcset` attribute of img should be set if provided', async ({page}) => {
		const srcset = {
			'1x': EXISTING_PICTURE_SRC,
			'2x': BROKEN_PICTURE_SRC
		};

		const {divLocator} = await createDivForTest(page, {
			srcset
		});

		const {img} = await getImageTestData(divLocator);
		const expectedSrcset = Object.entries(srcset).map(([k, v]) => `${v} ${k}`).join(', ');
		test.expect(img!.srcset).toBe(expectedSrcset);
	});

	test('the `width` and the `height` attributes should be set to provided values', async ({page}) => {
		const {divLocator} = await createDivForTest(page, {
			width: 100,
			height: 50
		});

		const {img} = await getImageTestData(divLocator);
		test.expect(img!.width).toBe(100);
		test.expect(img!.height).toBe(50);
	});

	test('the `sizes` attribute should be set to provided value', async ({page}) => {
		const {divLocator} = await createDivForTest(page, {
			sizes: '20px'
		});

		const {img} = await getImageTestData(divLocator);
		test.expect(img!.sizes).toBe('20px');
	});

	test('a `picture` tag should be rendered when a list of sources is provided', async ({page}) => {
		const {divLocator} = await createDivForTest(page, {
			sources: [
				{width: 20, height: 20, srcset: EXISTING_PICTURE_SRC},
				{width: 0, height: 0, srcset: BROKEN_PICTURE_SRC}
			]
		});

		const {picture} = await getImageTestData(divLocator);
		const pictureSourcesSrcset = picture!.sources.map(({srcset}) => srcset);

		test.expect(pictureSourcesSrcset).toStrictEqual(
			[EXISTING_PICTURE_SRC, BROKEN_PICTURE_SRC]
		);

	});

	test('the `alt` attribute should be set to provided value', async ({page}) => {
		const {divLocator} = await createDivForTest(page, {
			alt: 'Alt text'
		});

		const {img} = await getImageTestData(divLocator);
		test.expect(img!.alt).toBe('Alt text');
	});

	test('the initially invisible image should be loaded when `lazy` is set to false', async ({page}) => {
		const {divLocator} = await createDivForTest(page, {
			lazy: false,
			src: EXISTING_PICTURE_SRC
		}, {
			style: 'margin-top: 200px'
		});

		await waitForImageLoad(page, divLocator);
		const {img} = await getImageTestData(divLocator);
		test.expect(img!.dataImg).toBe('loaded');
	});

	test('the preview image should be shown if image is not loaded yet', async ({page, context}) => {
		await context.route(SLOW_LOAD_PICTURE_SRC, (route) => {
			const buffer = getPngBuffer();

			setTimeout(() => route.fulfill({
				contentType: 'image/png',
				body: buffer
			}), 500);

		});

		const {divLocator} = await createDivForTest(page, {src: SLOW_LOAD_PICTURE_SRC, preview: EXISTING_PICTURE_SRC});
		const {span, img} = await getImageTestData(divLocator);
		test.expect(span.dataImage).toBe('preview');
		test.expect(span.style?.startsWith(`background-image: url("${EXISTING_PICTURE_SRC}");`)).toBe(true);
		test.expect(img!.style).toBe('opacity: 0;');
	});

	test('the fallback image should be shown when main image failed loading', async ({page}) => {
		const {divLocator} = await createDivForTest(page, {
			src: BROKEN_PICTURE_SRC,
			broken: EXISTING_PICTURE_SRC
		});

		await waitForImageLoadFail(page, divLocator);
		const {span, img} = await getImageTestData(divLocator);
		test.expect(span.dataImage).toBe('broken');
		test.expect(span.style).toBe(`background-image: url("${EXISTING_PICTURE_SRC}");`);
		test.expect(img!.dataImg).toBe('failed');
		test.expect(img!.style).toBe('opacity: 0;');
	});

	test('the load handler should be called on image load', async ({page}) => {
		const {imgLocator} = await createDivForTest(page, {
			src: EXISTING_PICTURE_SRC,

			onLoad: (el: Element) => {
				el.setAttribute('data-on-load-called', '1');
			}
		});

		await waitForAttribute(page, imgLocator, 'data-on-load-called');
		await test.expect(imgLocator.getAttribute('data-on-load-called')).toBeResolvedTo('1');
	});

	test('the error handler should be called on image load error', async ({page}) => {
		const {imgLocator} = await createDivForTest(page, {
			src: BROKEN_PICTURE_SRC,

			onError: (el: Element) => {
				el.setAttribute('data-on-error-called', '1');
			}
		});

		await waitForAttribute(page, imgLocator, 'data-on-error-called');
		await test.expect(imgLocator.getAttribute('data-on-error-called')).toBeResolvedTo('1');
	});

	test('the options resolver`s return value should be used for loading', async ({page}) => {
		const {divLocator} = await createDivForTest(page, {
			src: BROKEN_PICTURE_SRC,
			optionsResolver: (opts) => ({...opts, src: `${opts.src}#resolver-called`})
		});

		const {img} = await getImageTestData(divLocator);
		test.expect(img!.src!.endsWith('resolver-called')).toBe(true);
	});

});
