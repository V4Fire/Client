/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

 // @ts-check

const
	h = include('tests/helpers'),
	images = require('./const');

/**
 * Starts a test
 *
 * @param {?} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	let
		componentNode,
		component,
		imageLoader;

	let
		imgNode,
		divNode;

	beforeAll(async () => {
		componentNode = await h.dom.waitForEl(page, '#target');
		component = await h.component.waitForComponent(page, '#target');
		imageLoader = await component.evaluateHandle((ctx) => ctx.directives.image);

		await component.evaluate((ctx) => globalThis.dummy = ctx);
	});

	beforeEach(async () => {
		// eslint-disable-next-line no-inline-comments
		await componentNode.evaluate((/** @type HTMLElement */ ctx) => {
			ctx.innerHTML = '';

			const image = new Image();
			image.id = 'img-target';
			image.setAttribute('data-test-ref', 'img-target');

			const div = document.createElement('div');
			div.id = 'div-target';
			div.setAttribute('data-test-ref', 'div-target');

			ctx.appendChild(image);
			ctx.appendChild(div);

			globalThis.tmp = undefined;
		});

		await imageLoader.evaluate((ctx) => {
			ctx.clearElement(document.getElementById('div-target'));
			ctx.clearElement(document.getElementById('img-target'));
		});

		imgNode = await componentNode.$('#img-target');
		divNode = await componentNode.$('#div-target');
	});

	describe('v-image', () => {
		it('img tag with `src`', async () => {
			await imageLoader.evaluate((imageLoaderCtx, images) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: images.pngImage, ctx: globalThis.dummy});
			}, images);

			await h.bom.waitForIdleCallback(page);

			expect(await imgNode.evaluate((ctx) => ctx.src)).toBe(images.pngImage);
		});

		it('div tag with `src`', async () => {
			await imageLoader.evaluate((imageLoaderCtx, images) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: images.pngImage, ctx: globalThis.dummy});
			}, images);

			await h.bom.waitForIdleCallback(page);

			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).toBe(`url("${images.pngImage}")`);
		});

		it('img tag with `srcset`', async () => {
			await imageLoader.evaluate((imageLoaderCTx, images) => {
				const img = document.getElementById('img-target');
				imageLoaderCTx.init(img, {srcset: {'1x': images.pngImage}, ctx: globalThis.dummy});
			}, images);

			await h.bom.waitForIdleCallback(page);

			expect(await imgNode.evaluate((ctx) => ctx.src)).toBe(images.pngImage);
			expect(await imgNode.evaluate((ctx) => ctx.currentSrc)).toBe(images.pngImage);
		});

		it('div tag with `srcset`', async () => {
			await imageLoader.evaluate((imageLoaderCtx, images) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {srcset: {'1x': images.pngImage}, ctx: globalThis.dummy});
			}, images);

			await h.bom.waitForIdleCallback(page);

			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).toBe(`url("${images.pngImage}")`);
		});

		it('img tag with `src` and `alt`', async () => {
			await imageLoader.evaluate((imageLoaderCtx, images) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: images.pngImage, alt: 'alt text', ctx: globalThis.dummy});
			}, images);

			await h.dom.waitForRef(page, 'img-target');

			expect(await imgNode.evaluate((ctx) => ctx.src)).toBe(images.pngImage);
			expect(await imgNode.evaluate((ctx) => ctx.alt)).toBe('alt text');
		});

		it('div tag with `src` and `alt`', async () => {
			await imageLoader.evaluate((imageLoaderCtx, images) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: images.pngImage, alt: 'alt-text', ctx: globalThis.dummy});
			}, images);

			await h.bom.waitForIdleCallback(page);

			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).toBe(`url("${images.pngImage}")`);
			expect(await divNode.getAttribute('aria-label')).toBe('alt-text');
			expect(await divNode.getAttribute('role')).toBe('img');
		});

		it('img tag `load` callback', async () => {
			await imageLoader.evaluate((imageLoaderCtx, images) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: images.pngImage, ctx: globalThis.dummy, load: () => globalThis.tmp = true});
			}, images);

			await expectAsync(page.waitForFunction('globalThis.tmp === true')).toBeResolved();
		});

		it('div tag `load` callback', async () => {
			await imageLoader.evaluate((imageLoaderCtx, images) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: images.pngImage, ctx: globalThis.dummy, load: () => globalThis.tmp = true});
			}, images);

			await expectAsync(page.waitForFunction('globalThis.tmp === true')).toBeResolved();
		});

		it('img tag `error` callback', async () => {
			await imageLoader.evaluate((imageLoaderCtx) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: 'https://error-url-fake-url-1/img.jpg', ctx: globalThis.dummy, error: () => globalThis.tmp = false});
			});

			await expectAsync(page.waitForFunction('globalThis.tmp === false')).toBeResolved();
		});

		it('div tag `error` callback', async () => {
			await imageLoader.evaluate((imageLoaderCtx) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: 'https://error-url-fake-url-2/img.jpg', ctx: globalThis.dummy, error: () => globalThis.tmp = false});
			});

			await expectAsync(page.waitForFunction('globalThis.tmp === false')).toBeResolved();
		});

		it('img tag `error` callback will not be called if a loading are successful', async () => {
			await imageLoader.evaluate((imageLoaderCtx, images) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: images.pngImage, ctx: globalThis.dummy, error: () => globalThis.tmp = false});
			}, images);

			await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1500});
			expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
		});

		it('div tag `error` callback will not be called if a loading are successful', async () => {
			await imageLoader.evaluate((imageLoaderCtx, images) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: images.pngImage, ctx: globalThis.dummy, error: () => globalThis.tmp = false});
			}, images);

			await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1500});
			expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
		});

		it('img tag `load` callback will not be called if a loading are failed', async () => {
			await imageLoader.evaluate((imageLoaderCtx) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: 'https://error-url-fake-url-3/img.jpg', ctx: globalThis.dummy, load: () => globalThis.tmp = true});
			}, images);

			await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1500});
			expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
		});

		it('div tag `load` callback will not be called if a loading are failed', async () => {
			await imageLoader.evaluate((imageLoaderCtx) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: 'https://error-url-fake-url-3/img.jpg', ctx: globalThis.dummy, load: () => globalThis.tmp = true});
			});

			await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1500});
			expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
		});

		it('img tag update `src`', async () => {
			await imageLoader.evaluate((imageLoaderCtx, images) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: images.pngImage, ctx: globalThis.dummy, handleUpdate: true});
			}, images);

			await h.bom.waitForIdleCallback(page);

			await imageLoader.evaluate((ctx, images) => {
				const img = document.getElementById('img-target');
				ctx.update(img, {src: images.pngImage2x, ctx: globalThis.dummy, handleUpdate: true});
			}, images);

			await h.bom.waitForIdleCallback(page);
			expect(await imgNode.evaluate((ctx) => ctx.src)).toBe(images.pngImage2x);
		});

		it('div tag update `src`', async () => {
			await imageLoader.evaluate((imageLoaderCtx, images) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: images.pngImage, ctx: globalThis.dummy});
			}, images);

			await h.bom.waitForIdleCallback(page);

			await imageLoader.evaluate((imageLoaderCtx, images) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.update(div, {src: images.pngImage2x, ctx: globalThis.dummy, handleUpdate: true});
			}, images);

			await h.bom.waitForIdleCallback(page);
			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).toBe(`url("${images.pngImage2x}")`);
		});
	});
};
