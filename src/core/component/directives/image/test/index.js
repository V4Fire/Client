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

	const
		getRandomUrlPostfix = () => `${Math.random().toString().substr(10)}x${Math.random().toString().substr(10)}`,
		getRandomImgUrl = () => `https://fakeim.pl/${getRandomUrlPostfix()}`,
		abortImageRequest = (url, sleep = 0) => handleImageRequest(url, sleep, ''),
		getNode = (target) => target === 'img' ? imgNode : divNode,
		waitFor = h.utils.waitForFunction;

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

			globalThis.getSrc = (ctx) => {
				if (ctx instanceof HTMLImageElement) {
					return ctx.currentSrc;
				}

				return ctx.style.backgroundImage.match(/url\("(.*)"\)/)?.[1] ?? '';
			}

			const picture = document.getElementById('expected-picture');
			picture?.remove();
		});

		await imageLoader.evaluate((ctx) => {
			ctx.clearElement(document.getElementById('div-target'));
			ctx.clearElement(document.getElementById('img-target'));
		});

		imgNode = await componentNode.$('#img-target');
		divNode = await componentNode.$('#div-target');

		await page.setViewportSize({
			width: 1024,
			height: 1024
		})
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
				reqPromise = handleImageRequest(imgUrl, 500);

			await imageLoader.evaluate((imageLoaderCtx, [images, imgUrl]) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: imgUrl, ctx: globalThis.dummy, preview: images.preview});
			}, [images, imgUrl]);

			await h.bom.waitForIdleCallback(page);
			expect(await imgNode.evaluate((ctx) => ctx.src)).toBe(images.preview);

			await reqPromise;
			await expectAsync(waitFor(imgNode, (ctx, imgUrl) => ctx.src === imgUrl, imgUrl)).toBeResolved();
		});

		it('div tag with `src` and preview with `src`', async () => {
			const
				imgUrl = getRandomImgUrl(),
				reqPromise = handleImageRequest(imgUrl, 500);

			await imageLoader.evaluate((imageLoaderCtx, [images, imgUrl]) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: imgUrl, ctx: globalThis.dummy, preview: images.preview});
			}, [images, imgUrl]);

			await h.bom.waitForIdleCallback(page);
			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).toBe(`url("${images.preview}")`);

			await reqPromise;
			await expectAsync(waitFor(divNode, (ctx, imgUrl) => ctx.style.backgroundImage === `url("${imgUrl}")`, imgUrl)).toBeResolved();
		});

		it('img tag with loading error and broken with `src`', async () => {
			const imgUrl = getRandomImgUrl();
			abortImageRequest(imgUrl);

			await imageLoader.evaluate((imageLoaderCtx, [images, imgUrl]) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: imgUrl, ctx: globalThis.dummy, broken: images.broken});
			}, [images, imgUrl]);

			await expectAsync(waitFor(imgNode, (ctx, broken) => ctx.src === broken, images.broken)).toBeResolved();
		});

		it('div tag with loading error and broken with `src`', async () => {
			const imgUrl = getRandomImgUrl();
			abortImageRequest(imgUrl);

			await imageLoader.evaluate((imageLoaderCtx, [images, imgUrl]) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: imgUrl, ctx: globalThis.dummy, broken: images.broken});
			}, [images, imgUrl]);

			await expectAsync(waitFor(divNode, (ctx, broken) => ctx.style.backgroundImage === `url("${broken}")`, images.broken)).toBeResolved();
		});

		it('img tag with `src`, preview with `src`, broken with `src`', async () => {
			const
				imgUrl = getRandomImgUrl(),
				reqPromise = handleImageRequest(imgUrl, 500);

			await imageLoader.evaluate((imageLoaderCtx, [images, imgUrl]) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: imgUrl, ctx: globalThis.dummy, preview: images.preview, broken: images.broken});
			}, [images, imgUrl]);

			await h.bom.waitForIdleCallback(page);

			expect(await imgNode.evaluate((ctx) => ctx.src)).toBe(images.preview);
			await expectAsync(waitFor(imgNode, (ctx, imgUrl) => ctx.src === imgUrl, imgUrl)).toBeResolved();

			await reqPromise;
			await h.bom.waitForIdleCallback(page);

			expect(await imgNode.evaluate((ctx) => ctx.src)).toBe(imgUrl);
		});

		it('div tag with `src`, preview with `src`, broken with `src`', async () => {
			const
				imgUrl = getRandomImgUrl(),
				reqPromise = handleImageRequest(imgUrl, 500);

			await imageLoader.evaluate((imageLoaderCtx, [images, imgUrl]) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: imgUrl, ctx: globalThis.dummy, preview: images.preview, broken: images.broken});
			}, [images, imgUrl]);

			await h.bom.waitForIdleCallback(page);

			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).toBe(`url("${images.preview}")`);
			await expectAsync(waitFor(divNode, (ctx, imgUrl) => ctx.style.backgroundImage === `url("${imgUrl}")`, imgUrl)).toBeResolved();

			await reqPromise;
			await h.bom.waitForIdleCallback(page);

			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).toBe(`url("${imgUrl}")`);
		});

		it('img tag with loading error, preview with `src`, broken with `src`', async () => {
			const imgUrl = getRandomImgUrl();
			abortImageRequest(imgUrl, 500);

			await imageLoader.evaluate((imageLoaderCtx, [images, imgUrl]) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: imgUrl, ctx: globalThis.dummy, preview: images.preview, broken: images.broken});
			}, [images, imgUrl]);

			await h.bom.waitForIdleCallback(page);

			expect(await imgNode.evaluate((ctx) => ctx.src)).toBe(images.preview);
			await expectAsync(waitFor(imgNode, (ctx, broken) => ctx.src === broken, images.broken)).toBeResolved();
		});

		it('div tag with loading error, preview with `src`, broken with `src`', async () => {
			const imgUrl = getRandomImgUrl();
			abortImageRequest(imgUrl, 500);

			await imageLoader.evaluate((imageLoaderCtx, [images, imgUrl]) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: imgUrl, ctx: globalThis.dummy, preview: images.preview, broken: images.broken});
			}, [images, imgUrl]);

			await h.bom.waitForIdleCallback(page);

			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).toBe(`url("${images.preview}")`);
			await expectAsync(waitFor(divNode, (ctx, broken) => ctx.style.backgroundImage === `url("${broken}")`, images.broken)).toBeResolved();
		});

		it('img tag with `src`, preview with loading error, broken with `src`', async () => {
			const
				previewImgUrl = getRandomImgUrl(),
				mainImgUrl = getRandomImgUrl();

			const
				abortReq = abortImageRequest(previewImgUrl, 100);

			handleImageRequest(mainImgUrl, 500);

			await imageLoader.evaluate((imageLoaderCtx, [images, mainImgUrl, previewImgUrl]) => {
				const img = document.getElementById('img-target');
				imageLoaderCtx.init(img, {src: mainImgUrl, ctx: globalThis.dummy, preview: previewImgUrl, broken: images.broken});
			}, [images, mainImgUrl, previewImgUrl]);

			await abortReq;
			await h.bom.waitForIdleCallback(page);
			expect(await imgNode.evaluate((ctx) => ctx.src)).not.toBe(previewImgUrl);

			await expectAsync(waitFor(imgNode, (ctx, mainImgUrl) => ctx.src === mainImgUrl, mainImgUrl)).toBeResolved();
		});

		it('div tag with `src`, preview with loading error, broken with `src`', async () => {
			const
				previewImgUrl = getRandomImgUrl(),
				mainImgUrl = getRandomImgUrl();

			const
				abortReq = abortImageRequest(previewImgUrl, 100);

			handleImageRequest(mainImgUrl, 500);

			await imageLoader.evaluate((imageLoaderCtx, [images, mainImgUrl, previewImgUrl]) => {
				const div = document.getElementById('div-target');
				imageLoaderCtx.init(div, {src: mainImgUrl, ctx: globalThis.dummy, preview: previewImgUrl, broken: images.broken});
			}, [images, mainImgUrl, previewImgUrl]);

			await abortReq;
			await h.bom.waitForIdleCallback(page);
			expect(await divNode.evaluate((ctx) => ctx.style.backgroundImage)).not.toBe(`url("${previewImgUrl}")`);

			await expectAsync(waitFor(divNode, (ctx, mainImgUrl) => ctx.style.backgroundImage === `url("${mainImgUrl}")`, mainImgUrl)).toBeResolved();
		});

		it('img tag with loading error, preview with loading error, broken with loading error', async () => {
			const
				previewImgUrl = getRandomImgUrl(),
				brokenImgUrl = getRandomImgUrl(),
				mainImgUrl = getRandomImgUrl();

			const reqPromises = [
				abortImageRequest(previewImgUrl, 100),
				abortImageRequest(brokenImgUrl, 100),
				handleImageRequest(mainImgUrl, 100)
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
				abortImageRequest(previewImgUrl, 100),
				abortImageRequest(brokenImgUrl, 100),
				abortImageRequest(mainImgUrl, 100)
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

		['div', 'img'].forEach((tag) => {
			describe(tag, () => {
				it('main with `load` callback will not be called if loading are failed', async () => {
					const reqUrl = getRandomImgUrl();
					abortImageRequest(reqUrl);
		
					await imageLoader.evaluate((imageLoaderCtx, [tag, reqUrl]) => {
						const target = document.getElementById(`${tag}-target`);
						imageLoaderCtx.init(target, {src: reqUrl, ctx: globalThis.dummy, load: () => globalThis.tmp = true});
					}, [tag, reqUrl]);
		
					await abortImageRequest;
					await h.bom.waitForIdleCallback(page);

					expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
				});

				it('main with `src`, preview with `src` and load callback', async () => {
					await imageLoader.evaluate((imageLoaderCtx, [tag, mainImgUrl, previewImgUrl]) => {
						const target = document.getElementById(`${tag}-target`);
						imageLoaderCtx.init(target, {src: mainImgUrl, ctx: globalThis.dummy, preview: {src: previewImgUrl, load: () => globalThis.tmp = true}});
					}, [tag, images.pngImage, images.preview]);

					await expectAsync(page.waitForFunction('globalThis.tmp === true')).toBeResolved();
				});

				it('main with loading error, broken with `src` and load callback', async () => {
					const
						mainImgUrl = getRandomImgUrl();

					abortImageRequest(mainImgUrl);

					await imageLoader.evaluate((imageLoaderCtx, [tag, mainImgUrl, brokenImgUrl]) => {
						const target = document.getElementById(`${tag}-target`);
						imageLoaderCtx.init(target, {src: mainImgUrl, ctx: globalThis.dummy, broken: {src: brokenImgUrl, load: () => globalThis.tmp = true}});
					}, [tag, mainImgUrl, images.preview]);

					await expectAsync(page.waitForFunction('globalThis.tmp === true')).toBeResolved();
				});

				it('main with `src`, broken with loading error and error callback', async () => {
					const
						brokenImgUrl = getRandomImgUrl(),
						mainImgUrl = getRandomImgUrl();

					abortImageRequest(brokenImgUrl);
					abortImageRequest(mainImgUrl);

					await imageLoader.evaluate((imageLoaderCtx, [tag, mainImgUrl, brokenImgUrl]) => {
						const target = document.getElementById(`${tag}-target`);
						imageLoaderCtx.init(target, {src: mainImgUrl, ctx: globalThis.dummy, broken: {src: brokenImgUrl, error: () => globalThis.tmp = false}});
					}, [tag, mainImgUrl, brokenImgUrl]);

					await expectAsync(page.waitForFunction('globalThis.tmp === false')).toBeResolved();
				});

				it('main with `src`, `sources` (srcset, media)', async () => {
					await page.setViewportSize({
						width: 580,
						height: 480,
					 });

					await imageLoader.evaluate((imageLoaderCtx, [tag, pngImage2x, pngImage]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: pngImage2x,
							ctx: globalThis.dummy,
							sources: [{srcset: pngImage, media: '(max-width: 600px)'}]
						});
					}, [tag, images.pngImage2x, images.pngImage]);

					await expectAsync(waitFor(getNode(tag), (ctx, pngImage) => globalThis.getSrc(ctx) === pngImage, images.pngImage)).toBeResolved()
				});

				it('main with `src`, `sources` (srcset, type)', async () => {
					await page.evaluate(([png, webp]) => {
						const pictHTML = `
							<picture id="expected-picture">
								<source srcset="${webp}" type="image/webp">
								<img id="expected-img" src="${png}">
							</picture>
						`;

						document.body.insertAdjacentHTML('beforeend', pictHTML);
					}, [images.pngImage, images.webp]);

					await imageLoader.evaluate((imageLoaderCtx, [tag, png, webp]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: png,
							ctx: globalThis.dummy,
							sources: [{srcset: webp, type: 'webp'}]
						});
					}, [tag, images.png, images.webp]);

					await expectAsync(waitFor(getNode(tag), (ctx) => globalThis.getSrc(ctx) === document.getElementById('expected-img').currentSrc)).toBeResolved();
				});

				it('main with `src`, `baseSrc`', async () => {
					const
						baseSrc = 'https://fakeim.pl',
						src = '300x300',
						reqUrl = 'https://fakeim.pl/300x300';

					handleImageRequest(reqUrl);

					await imageLoader.evaluate((imageLoaderCtx, [tag, baseSrc, src]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src,
							baseSrc,
							ctx: globalThis.dummy,
						});
					}, [tag, baseSrc, src]);

					await expectAsync(waitFor(getNode(tag), (ctx, reqUrl) => globalThis.getSrc(ctx) === reqUrl, reqUrl)).toBeResolved();
				});

				it('main with `src`, `baseSrc`, preview with `src`', async () => {
					const
						baseSrc = 'https://fakeim.pl',
						mainSrc = getRandomUrlPostfix(),
						previewSrc = getRandomUrlPostfix(),
						mainReqUrl = `${baseSrc}/${mainSrc}`,
						previewReqUrl = `${baseSrc}/${previewSrc}`;

					handleImageRequest(previewReqUrl);
					handleImageRequest(mainReqUrl, 500);

					await imageLoader.evaluate((imageLoaderCtx, [tag, baseSrc, mainSrc, previewSrc]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: mainSrc,
							baseSrc,
							preview: previewSrc,
							ctx: globalThis.dummy,
						});
					}, [tag, baseSrc, mainSrc, previewSrc]);

					await expectAsync(waitFor(getNode(tag), (ctx, previewReqUrl) => globalThis.getSrc(ctx) === previewReqUrl, previewReqUrl)).toBeResolved();
					await expectAsync(waitFor(getNode(tag), (ctx, mainReqUrl) => globalThis.getSrc(ctx) === mainReqUrl, mainReqUrl)).toBeResolved();
				});

				it('main with `src`, `baseSrc`, `sources` (srcset, media)', async () => {
					await page.setViewportSize({
						width: 580,
						height: 480,
					 });

					const
						baseSrc = 'https://fakeim.pl',
						mainSrc = getRandomUrlPostfix(),
						sourceSrc = getRandomUrlPostfix(),
						mainReqUrl = `${baseSrc}/${mainSrc}`,
						sourceReqUrl = `${baseSrc}/${sourceSrc}`;

					handleImageRequest(sourceReqUrl);
					handleImageRequest(mainReqUrl);

					await imageLoader.evaluate((imageLoaderCtx, [tag, baseSrc, mainSrc, sourceSrc]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: mainSrc,
							baseSrc,
							sources: [{srcset: sourceSrc, media: '(max-width: 600px)'}],
							ctx: globalThis.dummy
						});
					}, [tag, baseSrc, mainSrc, sourceSrc]);

					await expectAsync(waitFor(getNode(tag), (ctx, sourceReqUrl) => globalThis.getSrc(ctx) === sourceReqUrl, sourceReqUrl)).toBeResolved();
				});

				it('main with `src`, `baseSrc`, preview with `src`, `sources` (srcset, media)', async () => {
					await page.setViewportSize({
						width: 580,
						height: 480,
					 });

					const
						baseSrc = 'https://fakeim.pl',
						mainSrc = getRandomUrlPostfix(),
						previewSrc = getRandomUrlPostfix(),
						sourceSrc = getRandomUrlPostfix(),
						previewUrl = `${baseSrc}/${previewSrc}`,
						mainReqUrl = `${baseSrc}/${mainSrc}`,
						sourceReqUrl = `${baseSrc}/${sourceSrc}`;

					handleImageRequest(sourceReqUrl);
					handleImageRequest(mainReqUrl, 1000);
					handleImageRequest(previewUrl);
	
					await imageLoader.evaluate((imageLoaderCtx, [tag, baseSrc, mainSrc, previewSrc, sourceSrc]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: mainSrc,
							baseSrc,
							preview: {
								src: previewSrc,
								sources: [{srcset: sourceSrc, media: '(max-width: 600px)'}]
							},
							ctx: globalThis.dummy
						});
					}, [tag, baseSrc, mainSrc, previewSrc, sourceSrc]);

					await expectAsync(waitFor(getNode(tag), (ctx, sourceReqUrl) => globalThis.getSrc(ctx) === sourceReqUrl, sourceReqUrl)).toBeResolved();
					await expectAsync(waitFor(getNode(tag), (ctx, mainReqUrl) => globalThis.getSrc(ctx) === mainReqUrl, mainReqUrl)).toBeResolved();
				});

				it('main loading error with `src`, `baseSrc`, broken with `src`, `sources` (srcset, media)', async () => {
					await page.setViewportSize({
						width: 580,
						height: 480,
					 });

					const
						baseSrc = 'https://fakeim.pl',
						mainSrc = getRandomUrlPostfix(),
						brokenSrc = getRandomUrlPostfix(),
						sourceSrc = getRandomUrlPostfix(),
						brokeUrl = `${baseSrc}/${brokenSrc}`,
						mainReqUrl = `${baseSrc}/${mainSrc}`,
						sourceReqUrl = `${baseSrc}/${sourceSrc}`;

					handleImageRequest(sourceReqUrl);
					abortImageRequest(mainReqUrl, 1000);
					handleImageRequest(brokeUrl);
	
					await imageLoader.evaluate((imageLoaderCtx, [tag, baseSrc, mainSrc, brokenSrc, sourceSrc]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: mainSrc,
							baseSrc,
							broken: {
								src: brokenSrc,
								sources: [{srcset: sourceSrc, media: '(max-width: 600px)'}]
							},
							ctx: globalThis.dummy
						});
					}, [tag, baseSrc, mainSrc, brokenSrc, sourceSrc]);

					await expectAsync(waitFor(getNode(tag), (ctx, sourceReqUrl) => globalThis.getSrc(ctx) === sourceReqUrl, sourceReqUrl)).toBeResolved();
				});
			});
		});
	});
};
