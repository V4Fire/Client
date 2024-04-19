/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

import test from 'tests/config/unit/test';

import {

	BROKEN_PICTURE_SRC,
	EXISTING_PICTURE_SRC,
	SLOW_LOAD_PICTURE_SRC

} from 'components/directives/image/test/const';

import {

	renderDirective,
	serveStatic,

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
		'by default, the created `<img>` element should have the attribute `loading="lazy"`',

		async ({page}) => {
			const {image} = await renderDirective(page, {src: EXISTING_PICTURE_SRC});
			await test.expect(image.getAttribute('loading')).toBeResolvedTo('lazy');
		}
	);

	test(
		"the created `<img>` element should always have the `src` attribute, even if it's not explicitly provided",

		async ({page}) => {
			const {image} = await renderDirective(page, {});
			await test.expect(image.getAttribute('src')).toBeResolvedTo('');
		}
	);

	test(
		[
			'if the `sources` parameter is specified, ' +
			'the directive should be rendered using the `<picture>` element instead of `<img>`'
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

	test(
		'the `baseSrc` parameter should set a prefix for the image path',

		async ({page}) => {
			const {image} = await renderDirective(page, {src: 'some-image.png', baseSrc: 'https://example.com'});
			await test.expect(image.getAttribute('src')).toBeResolvedTo('https://example.com/some-image.png');
		}
	);

	test('the provided `onLoad` handler should be called upon successful image loading', async ({page}) => {
		const {image} = await renderDirective(page, {
			src: EXISTING_PICTURE_SRC,

			onLoad: (el: Element) => {
				el.setAttribute('data-on-load-called', '1');
			}
		});

		await waitForAttribute(page, image, 'data-on-load-called');
		await test.expect(image.getAttribute('data-on-load-called')).toBeResolvedTo('1');
	});

	test.describe('the provided `onError` handler should be called upon image loading errors', () => {
		test('if the specified `src` cannot be loaded', ({page}) => checkOnErrorHandler(page, BROKEN_PICTURE_SRC));

		test('if the `src` attribute is not explicitly provided', ({page}) => checkOnErrorHandler(page));

		async function checkOnErrorHandler(page: Page, src?: string): Promise<void> {
			const {image} = await renderDirective(page, {
				src,

				onError: (el: Element) => {
					el.setAttribute('data-on-error-called', '1');
				}
			});

			await waitForAttribute(page, image, 'data-on-error-called');
			await test.expect(image.getAttribute('data-on-error-called')).toBeResolvedTo('1');
		}
	});

	test(
		[
			'if the `optionsResolver` parameter is provided, ' +
			'its returned value should be set as attributes for the loaded image'
		].join(''),

		async ({page}) => {
			const {image} = await renderDirective(page, {
				src: BROKEN_PICTURE_SRC,
				optionsResolver: (opts) => ({...opts, src: `${opts.src}#resolver-called`})
			});

			const imageSrc = await image.getAttribute('src');
			test.expect(imageSrc?.endsWith('resolver-called')).toBe(true);
		}
	);

	test.describe('passing attributes to the nested `img` element', () => {
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
			'the `width` and `height` parameters should set the same attributes',

			async ({page}) => {
				const {image} = await renderDirective(page, {
					src: EXISTING_PICTURE_SRC,
					width: 20,
					height: 50
				});

				await test.expect(image.getAttribute('width')).toBeResolvedTo('20');
				await test.expect(image.getAttribute('height')).toBeResolvedTo('50');
			}
		);

		test('the `srcset` parameter should set the same attribute', async ({page}) => {
			const srcset = {
				'1x': EXISTING_PICTURE_SRC,
				'2x': BROKEN_PICTURE_SRC
			};

			const {image} = await renderDirective(page, {
				srcset
			});

			const expected = Object.entries(srcset).map(([k, v]) => `${v} ${k}`).join(', ');
			await test.expect(image.getAttribute('srcset')).toBeResolvedTo(expected);
		});
	});

	test.describe('the directive should set special attributes to define the image state', () => {
		test.describe('when the image is loading', () => {
			test.beforeEach(async ({context}) => {
				await serveStatic(context);
			});

			test(
				[
					'the element to which the directive is applied should have ' +
					'the attribute "data-image" set to "preview"'
				].join(''),

				async ({page}) => {
					const {container} = await renderDirective(page, {src: SLOW_LOAD_PICTURE_SRC});
					await test.expect(container.getAttribute('data-image')).toBeResolvedTo('preview');
				}
			);

			test(
				'if a preview image is specified, it should be displayed as a placeholder',

				async ({page}) => {
					const {container, image} = await renderDirective(page, {
						src: SLOW_LOAD_PICTURE_SRC,
						preview: EXISTING_PICTURE_SRC
					});

					const imageWrapperStyle = await container.getAttribute('style');

					test.expect(imageWrapperStyle?.startsWith(`background-image: url("${EXISTING_PICTURE_SRC}");`))
						.toBe(true);

					await test.expect(image.getAttribute('style')).toBeResolvedTo('opacity: 0;');
				}
			);
		});

		test.describe('when the image is successfully loaded', () => {
			test(
				[
					'the element to which the directive is applied should have ' +
					'the attribute "data-image" set to "loaded"'
				].join(''),

				async ({page}) => {
					const {container} = await renderDirective(page, {src: EXISTING_PICTURE_SRC});
					await waitForImageLoad(page, container);
					await test.expect(container.getAttribute('data-image')).toBeResolvedTo('loaded');
				}
			);

			test(
				'the nested `<img>` element should have the attribute "data-img" set to "loaded"',

				async ({page}) => {
					const {container, image} = await renderDirective(page, {src: EXISTING_PICTURE_SRC});
					await waitForImageLoad(page, container);
					await test.expect(image.getAttribute('data-img')).toBeResolvedTo('loaded');
				}
			);

			test(
				'the nested <img> element should be visible',

				async ({page}) => {
					const {container, image} = await renderDirective(page, {src: EXISTING_PICTURE_SRC});
					await waitForImageLoad(page, container);
					await test.expect(image.getAttribute('style')).toBeResolvedTo('opacity: 1;');
				}
			);
		});

		test.describe('if the image fails to load', () => {
			test(
				[
					'the element to which the directive is applied should have ' +
					'the attribute "data-image" set to "broken"'
				].join(''),

				async ({page}) => {
					const {container} = await renderDirective(page, {src: BROKEN_PICTURE_SRC});
					await waitForImageLoadFail(page, container);
					await test.expect(container.getAttribute('data-image')).toBeResolvedTo('broken');
				}
			);

			test(
				'the nested `<img>` element should have the attribute "data-img" set to "failed"',

				async ({page}) => {
					const {container, image} = await renderDirective(page, {src: BROKEN_PICTURE_SRC});
					await waitForImageLoadFail(page, container);
					await test.expect(image.getAttribute('data-img')).toBeResolvedTo('failed');
				}
			);

			test(
				"the nested `<img>` element shouldn't be visible",

				async ({page}) => {
					const {container, image} = await renderDirective(page, {src: BROKEN_PICTURE_SRC});
					await waitForImageLoadFail(page, container);
					await test.expect(image.getAttribute('style')).toBeResolvedTo('opacity: 0;');
				}
			);

			test(
				'if a fallback image is specified, it should be displayed as a placeholder',

				async ({page}) => {
					const {container} = await renderDirective(page, {
						src: BROKEN_PICTURE_SRC,
						broken: EXISTING_PICTURE_SRC,
						draggable: false
					});

					const
						styleAttribute = await container.getAttribute('style');

					await waitForImageLoadFail(page, container);
					test.expect(styleAttribute).toContain(`background-image: url("${EXISTING_PICTURE_SRC}");`);
				}
			);
		});

		test.describe('the `draggable` option should be set to the <img> element', () => {
			test('when `draggable` is true', async ({page}) => {
				const {image} = await renderDirective(page, {
					src: EXISTING_PICTURE_SRC,
					broken: BROKEN_PICTURE_SRC,
					draggable: true
				});

				test.expect(await image.getAttribute('draggable')).toBe('true');
			});

			test('when `draggable` is false', async ({page}) => {
				const {image} = await renderDirective(page, {
					src: EXISTING_PICTURE_SRC,
					broken: BROKEN_PICTURE_SRC,
					draggable: false
				});

				test.expect(await image.getAttribute('draggable')).toBe('false');
			});

			test("when `draggable` isn't set", async ({page}) => {
				const {image} = await renderDirective(page, {
					src: EXISTING_PICTURE_SRC,
					broken: BROKEN_PICTURE_SRC
				});

				test.expect(await image.getAttribute('draggable')).toBe(null);
			});
		});
	});
});
