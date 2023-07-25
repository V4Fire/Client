/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';

import type { ImageOptions } from 'components/directives/image';

import type { ImageTestLocators } from 'components/directives/image/test/interface';
import {

	BROKEN_PICTURE_SRC,
	EXISTING_PICTURE_SRC,
	SLOW_LOAD_PICTURE_SRC

} from 'components/directives/image/test/const';

import {

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

	test(
		'the directive should be rendered as markup `<span data-image="..."><img data-img="..." src="..."></span>`',

		async ({page}) => {
			const {wrapper, container} = await renderDirective(page, {src: EXISTING_PICTURE_SRC});
			await waitForImageLoad(page, container);

			test.expect(await wrapper.innerHTML()).toBe(
				'<span data-image="loaded"><img data-img="loaded" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAACtJREFUOE9jfCuj8p+BioBx1ECKQ3M0DCkOQobRMBwNQzJCYDTZkBFoaFoAMcorhYzB4yEAAAAASUVORK5CYII=" loading="lazy" style="opacity: 1;"></span>'
			);
		}
	);

	test(
		'the directive should preserve the attributes of the node to which it is applied',

		async ({page}) => {
			const {container} = await renderDirective(page, {src: EXISTING_PICTURE_SRC}, {
				id: 'demo',
				class: 'example',
				'data-some': 'foo'
			});

			await test.expect(container.getAttribute('id')).toBeResolvedTo('demo');
			await test.expect(container.getAttribute('class')).toBeResolvedTo('example');
			await test.expect(container.getAttribute('data-some')).toBeResolvedTo('foo');
		}
	);

	test(
		'by default, the created `<img>` tag should have the attribute `loading="lazy"`',

		async ({page}) => {
			const {image} = await renderDirective(page, {src: EXISTING_PICTURE_SRC});
			await test.expect(image.getAttribute('loading')).toBeResolvedTo('lazy');
		}
	);

	test(
		[
			'if the `sources` parameter is specified, ' +
			'the directive should be rendered using the `<picture>` tag instead of `<img>`'
		].join(''),

		async ({page}) => {
			const {picture} = await renderDirective(page, {
				sources: [
					{width: 20, height: 20, srcset: EXISTING_PICTURE_SRC},
					{width: 0, height: 0, srcset: BROKEN_PICTURE_SRC}
				]
			});

			const sources = await picture.locator('source').all();

			await test.expect(
				Promise.all(
					sources.map((locator) => locator.getAttribute('srcset'))
				)

			).toBeResolvedTo([EXISTING_PICTURE_SRC, BROKEN_PICTURE_SRC]);
		}
	);

	test.describe('passing attributes to the nested `img` tag', () => {
		test(
			'if the `lazy` parameter is set to false, the loading attribute should not be added',

			async ({page}) => {
				const {image} = await renderDirective(page, {
					src: EXISTING_PICTURE_SRC,
					lazy: false
				});

				await test.expect(image.getAttribute('loading')).toBeResolvedTo(null);
			}
		);

		test(
			'the `alt` parameter should set the same attribute',

			async ({page}) => {
				const {image} = await renderDirective(page, {
					src: EXISTING_PICTURE_SRC,
					alt: 'Some text'
				});

				await test.expect(image.getAttribute('alt')).toBeResolvedTo('Some text');
			}
		);

		test(
			'the `alt` parameter should set the same attribute',

			async ({page}) => {
				const {image} = await renderDirective(page, {
					src: EXISTING_PICTURE_SRC,
					alt: 'Some text'
				});

				await test.expect(image.getAttribute('alt')).toBeResolvedTo('Some text');
			}
		);

		test(
			'the `width` and `height` parameters should set the same attributes',

			async ({page}) => {
				const {image} = await renderDirective(page, {
					src: EXISTING_PICTURE_SRC,
					width: 20,
					height: 50
				});

				await test.expect(image.getAttribute('width')).toBeResolvedTo('20');
				await test.expect(image.getAttribute('width')).toBeResolvedTo('50');
			}
		);
	});

	test.describe('load states', () => {
		test('the attributes of the image and the wrapper should indicate a successful load', async ({page}) => {
			const {container, image} = await renderDirective(page, {src: EXISTING_PICTURE_SRC});

			await waitForImageLoad(page, container);

			const imageWrapperStyle = await container.getAttribute('style');

			test.expect(imageWrapperStyle).toBe(null);
			await test.expect(container.getAttribute('data-image')).toBeResolvedTo('loaded');

			await test.expect(image.getAttribute('style')).toBeResolvedTo('opacity: 1;');
			await test.expect(image.getAttribute('data-img')).toBeResolvedTo('loaded');
			await test.expect(image.getAttribute('src')).toBeResolvedTo(EXISTING_PICTURE_SRC);
		});

		test('the initially invisible image should be instantly loaded when the `lazy` option is set to false', async ({page}) => {
			const {container, image} = await renderDirective(page, {
				lazy: false,
				src: EXISTING_PICTURE_SRC
			}, {
				style: 'margin-top: 200px'
			});

			await waitForImageLoad(page, container);

			await test.expect(image.getAttribute('data-img')).toBeResolvedTo('loaded');
		});

		test([
			'the attributes of the image and the wrapper should indicate',
			'that the image is a preview when the main image is not loaded yet'
		].join(' '), async ({page, context}) => {
			await context.route(SLOW_LOAD_PICTURE_SRC, (route) => {
				const buffer = getPngBuffer();

				setTimeout(() => route.fulfill({
					contentType: 'image/png',
					body: buffer
				}), 500);

			});

			const {container, image} = await renderDirective(page, {
				src: SLOW_LOAD_PICTURE_SRC,
				preview: EXISTING_PICTURE_SRC
			});

			const imageWrapperStyle = await container.getAttribute('style');

			test.expect(imageWrapperStyle?.startsWith(`background-image: url("${EXISTING_PICTURE_SRC}");`))
				.toBe(true);

			await test.expect(container.getAttribute('data-image')).toBeResolvedTo('preview');
			await test.expect(image.getAttribute('style')).toBeResolvedTo('opacity: 0;');
		});

		test('the attributes of the image and the wrapper should indicate that the image is a fallback when the main image failed loading', async ({page}) => {
			const {container, image} = await renderDirective(page, {
				src: BROKEN_PICTURE_SRC,
				broken: EXISTING_PICTURE_SRC
			});

			await waitForImageLoadFail(page, container);

			await test.expect(container.getAttribute('data-image')).toBeResolvedTo('broken');

			await test.expect(container.getAttribute('style'))
				.toBeResolvedTo(`background-image: url("${EXISTING_PICTURE_SRC}");`);

			await test.expect(image.getAttribute('data-img')).toBeResolvedTo('failed');
			await test.expect(image.getAttribute('style')).toBeResolvedTo('opacity: 0;');
		});

	});

	test.describe('directive options should be set as `img` attributes', () => {
		test('the provided `baseSrc` option should be used as a prefix for the `src` attribute of the `img` element',
			async ({page}) => {
				const {image} = await renderDirective(page, {src: 'test.png', baseSrc: 'http://127.0.0.1:1234'});

				await test.expect(image.getAttribute('src')).toBeResolvedTo('http://127.0.0.1:1234/test.png');
			});

		test('the provided `srcset` option should be set as an attribute of the `img` element', async ({page}) => {
			const srcset = {
				'1x': EXISTING_PICTURE_SRC,
				'2x': BROKEN_PICTURE_SRC
			};

			const {image} = await renderDirective(page, {
				srcset
			});

			const expectedSrcset = Object.entries(srcset).map(([k, v]) => `${v} ${k}`).join(', ');

			await test.expect(image.getAttribute('srcset')).toBeResolvedTo(expectedSrcset);
		});

		test('the provided `width` and `height` options should be set as attributes of the `img` element', async ({page}) => {
			const {image} = await renderDirective(page, {
				width: 100,
				height: 50
			});

			await test.expect(image.getAttribute('width')).toBeResolvedTo('100');
			await test.expect(image.getAttribute('height')).toBeResolvedTo('50');
		});

		test('the provided `sizes` option should be set as an attribute of the `img` element', async ({page}) => {
			const {image} = await renderDirective(page, {
				sizes: '20px'
			});

			await test.expect(image.getAttribute('sizes')).toBeResolvedTo('20px');
		});

		test('the provided `alt` option should be set as an attribute of the `img` element', async ({page}) => {
			const {image} = await renderDirective(page, {
				alt: 'Alt text'
			});

			await test.expect(image.getAttribute('alt')).toBeResolvedTo('Alt text');
		});
	});

	test.describe('options resolver', () => {
		test('the return value of `optionsResolver` should be used instead of the provided options', async ({page}) => {
			const {image} = await renderDirective(page, {
				src: BROKEN_PICTURE_SRC,
				optionsResolver: (opts) => ({...opts, src: `${opts.src}#resolver-called`})
			});

			const imageSrc = await image.getAttribute('src');

			test.expect(imageSrc?.endsWith('resolver-called')).toBe(true);
		});
	});

	test.describe('handlers', () => {
		test('the provided `onLoad` handler should be called on successful image load', async ({page}) => {
			const {image} = await renderDirective(page, {
				src: EXISTING_PICTURE_SRC,

				onLoad: (el: Element) => {
					el.setAttribute('data-on-load-called', '1');
				}
			});

			await waitForAttribute(page, image, 'data-on-load-called');

			await test.expect(image.getAttribute('data-on-load-called')).toBeResolvedTo('1');
		});

		test('the provided `onError` handler should be called on image load error', async ({page}) => {
			const {image} = await renderDirective(page, {
				src: BROKEN_PICTURE_SRC,

				onError: (el: Element) => {
					el.setAttribute('data-on-error-called', '1');
				}
			});

			await waitForAttribute(page, image, 'data-on-error-called');

			await test.expect(image.getAttribute('data-on-error-called')).toBeResolvedTo('1');
		});
	});

	async function renderDirective(
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
});
