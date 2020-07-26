/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers'),
	images = require('./const');

/**
 * @param {Page} page
 */
module.exports = (page) => {
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
			ctx.pending.delete(document.getElementById('div-target'));
			ctx.pending.delete(document.getElementById('img-target'));
		});

		imgNode = await componentNode.$('#img-target');
		divNode = await componentNode.$('#div-target');
	});

	describe('v-image', () => {
		it('img tag with `src`', async () => {
			await imageLoader.evaluate((ctx, images) => {
				const img = document.getElementById('img-target');
				ctx.load(img, images.pngImage);
			}, images);

			await h.bom.waitForIdleCallback(page);

			expect(await imgNode.evaluate((ctx) => ctx.src)).toBe(images.pngImage);
		});

		it('div tag with `src`', async () => {
			await imageLoader.evaluate((ctx, images) => {
				const div = document.getElementById('div-target');
				ctx.load(div, images.pngImage);
			}, images);

			await h.bom.waitForIdleCallback(page);

			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).toBe(`url("${images.pngImage}")`);
		});

		it('img tag with `src` and `alt`', async () => {
			await imageLoader.evaluate((ctx, images) => {
				const img = document.getElementById('img-target');
				ctx.load(img, {src: images.pngImage, alt: 'alt text'});
			}, images);

			await h.dom.waitForRef(page, 'img-target');

			expect(await imgNode.evaluate((ctx) => ctx.src)).toBe(images.pngImage);
			expect(await imgNode.evaluate((ctx) => ctx.alt)).toBe('alt text');
		});

		it('div tag with `src` and `alt`', async () => {
			await imageLoader.evaluate((ctx, images) => {
				const div = document.getElementById('div-target');
				ctx.load(div, {src: images.pngImage, alt: 'alt-text'});
			}, images);

			await h.bom.waitForIdleCallback(page);

			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).toBe(`url("${images.pngImage}")`);
			expect(await divNode.getAttribute('aria-label')).toBe('alt-text');
			expect(await divNode.getAttribute('role')).toBe('img');
		});

		it('img tag `load` callback', async () => {
			await imageLoader.evaluate((ctx, images) => {
				const img = document.getElementById('img-target');
				ctx.load(img, {src: images.pngImage, load: () => globalThis.tmp = true});
			}, images);

			await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 300});

			expect(await page.evaluate(() => globalThis.tmp)).toBeTrue();
		});

		it('div tag `load` callback', async () => {
			await imageLoader.evaluate((ctx, images) => {
				const div = document.getElementById('div-target');
				ctx.load(div, {src: images.pngImage, load: () => globalThis.tmp = true});
			}, images);

			await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 300});
			expect(await page.evaluate(() => globalThis.tmp)).toBeTrue();
		});

		it('img tag `error` callback', async () => {
			await imageLoader.evaluate((ctx) => {
				const img = document.getElementById('img-target');
				ctx.load(img, {src: 'https://error-url-fake-url-1/img.jpg', error: () => globalThis.tmp = false});
			});

			await h.request.waitForRequestsFail(page, ['https://error-url-fake-url-1/img.jpg']);
			await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 300});

			expect(await page.evaluate(() => globalThis.tmp)).toBeFalse();
		});

		it('div tag `error` callback', async () => {
			await imageLoader.evaluate((ctx) => {
				const div = document.getElementById('div-target');
				ctx.load(div, {src: 'https://error-url-fake-url-2/img.jpg', error: () => globalThis.tmp = false});
			});

			await h.request.waitForRequestsFail(page, ['https://error-url-fake-url-2/img.jpg']);
			await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 300});

			expect(await page.evaluate(() => globalThis.tmp)).toBeFalse();
		});

		it('img tag `error` callback will not be called if a loading are successful', async () => {
			await imageLoader.evaluate((ctx, images) => {
				const img = document.getElementById('img-target');
				ctx.load(img, {src: images.pngImage, error: () => globalThis.tmp = false});
			}, images);

			await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1500});
			expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
		});

		it('div tag `error` callback will not be called if a loading are successful', async () => {
			await imageLoader.evaluate((ctx, images) => {
				const div = document.getElementById('div-target');
				ctx.load(div, {src: images.pngImage, error: () => globalThis.tmp = false});
			}, images);

			await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1500});
			expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
		});

		it('img tag `load` callback will not be called if a loading are failed', async () => {
			await imageLoader.evaluate((ctx) => {
				const img = document.getElementById('img-target');
				ctx.load(img, {src: 'https://error-url-fake-url-3/img.jpg', load: () => globalThis.tmp = true});
			}, images);

			await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1500});
			expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
		});

		it('div tag `load` callback will not be called if a loading are failed', async () => {
			await imageLoader.evaluate((ctx) => {
				const div = document.getElementById('div-target');
				ctx.load(div, {src: 'https://error-url-fake-url-3/img.jpg', load: () => globalThis.tmp = true});
			});

			await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1500});
			expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
		});
	});
};
