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
	images = require('./const'),
	delay = require('delay');

/**
 * Starts a test
 *
 * @param {Playwright.Page} page
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

	const getRandomImgUrl = () => `https://fakeim.pl/${Math.random().toString().substr(10)}x${Math.random().toString().substr(10)}`;

	const handleImageRequest = (url, sleep = 0, base64Img = images.pngImage) => {
		return page.route(url, async (route) => {
			await delay(sleep);

			if (base64Img === '') {
				route.abort('failed');
				return;
			}

			const
				res = base64Img.split(',')[1],
				headers = route.request().headers();

			headers['Content-Length'] = String(res?.length ?? 0);

			route.fulfill({
				status: 200,
				body: Buffer.from(res, 'base64'),
				contentType: 'image/png',
				headers
			});
		});
	}

	const abortImageRequest = (url, sleep = 0) => handleImageRequest(url, sleep, '')

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
			const imgUrl = getRandomImgUrl();
			abortImageRequest(imgUrl);

			await imageLoader.evaluate((imageLoaderCtx, imgUrl) => {
				const img = document.getElementById('img-target');
				img.onerror = console.error;
				imageLoaderCtx.init(img, {src: imgUrl, ctx: globalThis.dummy, error: () => globalThis.tmp = false});
			}, imgUrl);

			await expectAsync(page.waitForFunction('globalThis.tmp === false')).toBeResolved();
		});

		it('div tag `error` callback', async () => {
			const imgUrl = getRandomImgUrl();
			abortImageRequest(imgUrl);

			await imageLoader.evaluate((imageLoaderCtx, imgUrl) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: imgUrl, ctx: globalThis.dummy, error: () => globalThis.tmp = false});
			}, imgUrl);

			await expectAsync(page.waitForFunction('globalThis.tmp === false')).toBeResolved();
		});

		it('img tag `error` callback will not be called if loading are successful', async () => {
			await imageLoader.evaluate((imageLoaderCtx, images) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: images.pngImage, ctx: globalThis.dummy, error: () => globalThis.tmp = false});
			}, images);

			await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1500});
			expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
		});

		it('div tag `error` callback will not be called if loading are successful', async () => {
			await imageLoader.evaluate((imageLoaderCtx, images) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: images.pngImage, ctx: globalThis.dummy, error: () => globalThis.tmp = false});
			}, images);

			await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1500});
			expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
		});

		it('img tag `load` callback will not be called if loading are failed', async () => {
			await imageLoader.evaluate((imageLoaderCtx) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: 'https://error-url-fake-url-3/img.jpg', ctx: globalThis.dummy, load: () => globalThis.tmp = true});
			}, images);

			await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1500});
			expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
		});

		it('div tag `load` callback will not be called if loading are failed', async () => {
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

		it('img tag with `src` and preview with `src`', async () => {
			const
				imgUrl = getRandomImgUrl(),
				reqPromise = handleImageRequest(imgUrl, 2000);

			await imageLoader.evaluate((imageLoaderCtx, [images, imgUrl]) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: imgUrl, ctx: globalThis.dummy, preview: images.preview});
			}, [images, imgUrl]);

			await h.bom.waitForIdleCallback(page);
			expect(await imgNode.evaluate((ctx) => ctx.src)).toBe(images.preview);

			await reqPromise;
			await expectAsync(h.utils.waitForFunction(imgNode, (ctx, imgUrl) => ctx.src === imgUrl, imgUrl)).toBeResolved();
		});

		it('div tag with `src` and preview with `src`', async () => {
			const
				imgUrl = getRandomImgUrl(),
				reqPromise = handleImageRequest(imgUrl, 2000);

			await imageLoader.evaluate((imageLoaderCtx, [images, imgUrl]) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: imgUrl, ctx: globalThis.dummy, preview: images.preview});
			}, [images, imgUrl]);

			await h.bom.waitForIdleCallback(page);
			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).toBe(`url("${images.preview}")`);

			await reqPromise;
			await expectAsync(h.utils.waitForFunction(divNode, (ctx, imgUrl) => ctx.style.backgroundImage === `url("${imgUrl}")`, imgUrl)).toBeResolved();
		});

		it('img tag with loading error and broken with `src`', async () => {
			const imgUrl = getRandomImgUrl();
			abortImageRequest(imgUrl);

			await imageLoader.evaluate((imageLoaderCtx, [images, imgUrl]) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: imgUrl, ctx: globalThis.dummy, broken: images.broken});
			}, [images, imgUrl]);

			await expectAsync(h.utils.waitForFunction(imgNode, (ctx, broken) => ctx.src === broken, images.broken)).toBeResolved();
		});

		it('div tag with loading error and broken with `src`', async () => {
			const imgUrl = getRandomImgUrl();
			abortImageRequest(imgUrl);

			await imageLoader.evaluate((imageLoaderCtx, [images, imgUrl]) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: imgUrl, ctx: globalThis.dummy, broken: images.broken});
			}, [images, imgUrl]);

			await expectAsync(h.utils.waitForFunction(divNode, (ctx, broken) => ctx.style.backgroundImage === `url("${broken}")`, images.broken)).toBeResolved();
		});

		it('img tag with `src`, preview with `src`, broken with `src`', async () => {
			const
				imgUrl = getRandomImgUrl(),
				reqPromise = handleImageRequest(imgUrl, 2000);

			await imageLoader.evaluate((imageLoaderCtx, [images, imgUrl]) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: imgUrl, ctx: globalThis.dummy, preview: images.preview, broken: images.broken});
			}, [images, imgUrl]);

			await h.bom.waitForIdleCallback(page);

			expect(await imgNode.evaluate((ctx) => ctx.src)).toBe(images.preview);
			await expectAsync(h.utils.waitForFunction(imgNode, (ctx, imgUrl) => ctx.src === imgUrl, imgUrl)).toBeResolved();

			await reqPromise;
			await h.bom.waitForIdleCallback(page);

			expect(await imgNode.evaluate((ctx) => ctx.src)).toBe(imgUrl);
		});

		it('div tag with `src`, preview with `src`, broken with `src`', async () => {
			const
				imgUrl = getRandomImgUrl(),
				reqPromise = handleImageRequest(imgUrl, 2000);

			await imageLoader.evaluate((imageLoaderCtx, [images, imgUrl]) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: imgUrl, ctx: globalThis.dummy, preview: images.preview, broken: images.broken});
			}, [images, imgUrl]);

			await h.bom.waitForIdleCallback(page);

			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).toBe(`url("${images.preview}")`);
			await expectAsync(h.utils.waitForFunction(divNode, (ctx, imgUrl) => ctx.style.backgroundImage === `url("${imgUrl}")`, imgUrl)).toBeResolved();

			await reqPromise;
			await h.bom.waitForIdleCallback(page);

			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).toBe(`url("${imgUrl}")`);
		});

		it('img tag with loading error, preview with `src`, broken with `src`', async () => {
			const imgUrl = getRandomImgUrl();
			abortImageRequest(imgUrl, 1000);

			await imageLoader.evaluate((imageLoaderCtx, [images, imgUrl]) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: imgUrl, ctx: globalThis.dummy, preview: images.preview, broken: images.broken});
			}, [images, imgUrl]);

			await h.bom.waitForIdleCallback(page);

			expect(await imgNode.evaluate((ctx) => ctx.src)).toBe(images.preview);
			await expectAsync(h.utils.waitForFunction(imgNode, (ctx, broken) => ctx.src === broken, images.broken)).toBeResolved();
		});

		it('div tag with loading error, preview with `src`, broken with `src`', async () => {
			const imgUrl = getRandomImgUrl();
			abortImageRequest(imgUrl, 1000);

			await imageLoader.evaluate((imageLoaderCtx, [images, imgUrl]) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: imgUrl, ctx: globalThis.dummy, preview: images.preview, broken: images.broken});
			}, [images, imgUrl]);

			await h.bom.waitForIdleCallback(page);

			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).toBe(`url("${images.preview}")`);
			await expectAsync(h.utils.waitForFunction(divNode, (ctx, broken) => ctx.style.backgroundImage === `url("${broken}")`, images.broken)).toBeResolved();
		});

		it('img tag with `src`, preview with loading error, broken with `src`', async () => {
			const
				previewImgUrl = getRandomImgUrl(),
				mainImgUrl = getRandomImgUrl();

			abortImageRequest(previewImgUrl, 1000);
			handleImageRequest(mainImgUrl, 1000)

			await imageLoader.evaluate((imageLoaderCtx, [images, mainImgUrl, previewImgUrl]) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: mainImgUrl, ctx: globalThis.dummy, preview: previewImgUrl, broken: images.broken});
			}, [images, mainImgUrl, previewImgUrl]);

			await h.bom.waitForIdleCallback(page);
			expect(await imgNode.evaluate((ctx) => ctx.src)).not.toBe(previewImgUrl);

			await expectAsync(h.utils.waitForFunction(imgNode, (ctx, mainImgUrl) => ctx.src === mainImgUrl, mainImgUrl)).toBeResolved();
		});

		it('div tag with `src`, preview with loading error, broken with `src`', async () => {
			const
				previewImgUrl = getRandomImgUrl(),
				mainImgUrl = getRandomImgUrl();

			abortImageRequest(previewImgUrl, 1000);
			handleImageRequest(mainImgUrl, 1000);

			await imageLoader.evaluate((imageLoaderCtx, [images, mainImgUrl, previewImgUrl]) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: mainImgUrl, ctx: globalThis.dummy, preview: previewImgUrl, broken: images.broken});
			}, [images, mainImgUrl, previewImgUrl]);

			await h.bom.waitForIdleCallback(page);
			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).not.toBe(`url("${previewImgUrl}")`);

			await expectAsync(h.utils.waitForFunction(divNode, (ctx, mainImgUrl) => ctx.style.backgroundImage === `url("${mainImgUrl}")`, mainImgUrl)).toBeResolved();
		});

		it('img tag with loading error, preview with loading error, broken with loading error', async () => {
			const
				previewImgUrl = getRandomImgUrl(),
				brokenImgUrl = getRandomImgUrl(),
				mainImgUrl = getRandomImgUrl();

			const reqPromises = [
				abortImageRequest(previewImgUrl, 1000),
				abortImageRequest(brokenImgUrl, 1000),
				handleImageRequest(mainImgUrl, 1000)
			];

			await imageLoader.evaluate((imageLoaderCtx, [brokenImgUrl, mainImgUrl, previewImgUrl]) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: mainImgUrl, ctx: globalThis.dummy, preview: previewImgUrl, broken: brokenImgUrl});
			}, [brokenImgUrl, mainImgUrl, previewImgUrl]);

			await h.bom.waitForIdleCallback(page);
			expect(await imgNode.evaluate((ctx) => ctx.src)).not.toBe(previewImgUrl);

			await Promise.all(reqPromises);
			await h.bom.waitForIdleCallback(page);

			expect(await divNode.evaluate((ctx) => ctx.src)).not.toBe(previewImgUrl);
			expect(await divNode.evaluate((ctx) => ctx.src)).not.toBe(brokenImgUrl);
			expect(await divNode.evaluate((ctx) => ctx.src)).not.toBe(mainImgUrl);
		});

		it('div tag with loading error, preview with loading error, broken with loading error', async () => {
			const
				previewImgUrl = getRandomImgUrl(),
				brokenImgUrl = getRandomImgUrl(),
				mainImgUrl = getRandomImgUrl();

			const reqPromises = [
				abortImageRequest(previewImgUrl, 1000),
				abortImageRequest(brokenImgUrl, 1000),
				abortImageRequest(mainImgUrl, 1000)
			];

			await imageLoader.evaluate((imageLoaderCtx, [brokenImgUrl, mainImgUrl, previewImgUrl]) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: mainImgUrl, ctx: globalThis.dummy, preview: previewImgUrl, broken: brokenImgUrl});
			}, [brokenImgUrl, mainImgUrl, previewImgUrl]);

			await h.bom.waitForIdleCallback(page);
			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).not.toBe(`url("${previewImgUrl}"`);

			await Promise.all(reqPromises);
			await h.bom.waitForIdleCallback(page);

			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).not.toBe(`url("${previewImgUrl}"`);
			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).not.toBe(`url("${brokenImgUrl}"`);
			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).not.toBe(`url("${mainImgUrl}"`);
		});
	});
};
