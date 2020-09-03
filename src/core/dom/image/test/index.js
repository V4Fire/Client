/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

 // @ts-check

/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */

const
	h = include('tests/helpers'),
	delay = require('delay'),
	images = require('./const');

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

	const handleImageRequest = (url, sleep = 0, base64Img = images.pngImage) => page.route(url, async (route) => {
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

	const
		getRandomUrlPostfix = () => `${Math.random().toString().substr(10)}x${Math.random().toString().substr(10)}`,
		getRandomImgUrl = () => `https://fakeim.pl/${getRandomUrlPostfix()}`,
		abortImageRequest = (url, sleep = 0) => handleImageRequest(url, sleep, ''),
		getNode = (target) => target === 'img' ? imgNode : divNode,
		waitFor = h.utils.waitForFunction;

	beforeAll(async () => {
		componentNode = await h.dom.waitForEl(page, '#dummy-component');
		component = await h.component.waitForComponent(page, '#dummy-component');
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
			globalThis.tmpComponent = undefined;

			globalThis.getSrc = (ctx) => {
				if (ctx instanceof HTMLImageElement) {
					return ctx.currentSrc;
				}

				return ctx.style.backgroundImage.match(/url\("(.*)"\)/)?.[1] ?? '';
			};

			// eslint-disable-next-line no-unused-expressions
			document.getElementById('expected-picture')?.remove();
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
		});
	});

	describe('v-image', () => {
		['div', 'img'].forEach((tag) => {
			describe(tag, () => {
				it(' with `src`', async () => {
					await imageLoader.evaluate((imageLoaderCtx, [tag, images]) => {
						const target = document.getElementById(`${tag}-target`);
						imageLoaderCtx.init(target, {src: images.pngImage, ctx: globalThis.dummy});
					}, [tag, images]);

					await h.bom.waitForIdleCallback(page);

					expect(await getNode(tag).evaluate((ctx) => globalThis.getSrc(ctx))).toBe(images.pngImage);
				});

				it('with `srcset`', async () => {
					await imageLoader.evaluate((imageLoaderCtx, [tag, images]) => {
						const target = document.getElementById(`${tag}-target`);
						imageLoaderCtx.init(target, {srcset: {'1x': images.pngImage}, ctx: globalThis.dummy});
					}, [tag, images]);

					await h.bom.waitForIdleCallback(page);

					expect(await getNode(tag).evaluate((ctx) => globalThis.getSrc(ctx))).toBe(images.pngImage);
				});

				it('`load` callback', async () => {
					await imageLoader.evaluate((imageLoaderCtx, [tag, images]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: images.pngImage,
							ctx: globalThis.dummy,
							load: () => globalThis.tmp = true
						});
					}, [tag, images]);

					await expectAsync(page.waitForFunction('globalThis.tmp === true')).toBeResolved();
				});

				it('`error` callback', async () => {
					const imgUrl = getRandomImgUrl();
					abortImageRequest(imgUrl);

					await imageLoader.evaluate((imageLoaderCtx, [tag, imgUrl]) => {
						const target = document.getElementById(`${tag}-target`);
						imageLoaderCtx.init(target, {src: imgUrl, ctx: globalThis.dummy, error: () => globalThis.tmp = false});
					}, [tag, imgUrl]);

					await expectAsync(page.waitForFunction('globalThis.tmp === false')).toBeResolved();
				});

				it('`error` callback will not be called if loading was successful', async () => {
					await imageLoader.evaluate((imageLoaderCtx, [tag, images]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: images.pngImage,
							ctx: globalThis.dummy,
							error: () => globalThis.tmp = false
						});
					}, [tag, images]);

					await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 1500});
					expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
				});

				it('update `src`', async () => {
					await imageLoader.evaluate((imageLoaderCtx, [tag, images]) => {
						const target = document.getElementById(`${tag}-target`);
						imageLoaderCtx.init(target, {src: images.pngImage, ctx: globalThis.dummy});
					}, [tag, images]);

					await h.bom.waitForIdleCallback(page);

					await imageLoader.evaluate((imageLoaderCtx, [tag, images]) => {
						const target = document.getElementById(`${tag}-target`);
						imageLoaderCtx.update(target, {src: images.pngImage2x, ctx: globalThis.dummy, handleUpdate: true});
					}, [tag, images]);

					await h.bom.waitForIdleCallback(page);
					expect(await getNode(tag).evaluate((ctx) => globalThis.getSrc(ctx))).toBe(images.pngImage2x);
				});

				it('with `src` and preview with `src`', async () => {
					const
						imgUrl = getRandomImgUrl(),
						reqPromise = handleImageRequest(imgUrl, 500);

					await imageLoader.evaluate((imageLoaderCtx, [tag, images, imgUrl]) => {
						const target = document.getElementById(`${tag}-target`);
						imageLoaderCtx.init(target, {src: imgUrl, ctx: globalThis.dummy, preview: images.preview});
					}, [tag, images, imgUrl]);

					await h.bom.waitForIdleCallback(page);
					expect(await getNode(tag).evaluate((ctx) => globalThis.getSrc(ctx))).toBe(images.preview);

					await reqPromise;
					await expectAsync(
						waitFor(getNode(tag), (ctx, imgUrl) => globalThis.getSrc(ctx) === imgUrl, imgUrl)
					).toBeResolved();
				});

				it('with loading error and broken with `src`', async () => {
					const imgUrl = getRandomImgUrl();
					abortImageRequest(imgUrl);

					await imageLoader.evaluate((imageLoaderCtx, [tag, images, imgUrl]) => {
						const target = document.getElementById(`${tag}-target`);
						imageLoaderCtx.init(target, {src: imgUrl, ctx: globalThis.dummy, broken: images.broken});
					}, [tag, images, imgUrl]);

					await expectAsync(
						waitFor(getNode(tag), (ctx, broken) => globalThis.getSrc(ctx) === broken, images.broken)
					).toBeResolved();
				});

				it('with `src`, preview with `src`, broken with `src`', async () => {
					const
						imgUrl = getRandomImgUrl(),
						reqPromise = handleImageRequest(imgUrl, 500);

					await imageLoader.evaluate((imageLoaderCtx, [tag, images, imgUrl]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: imgUrl,
							ctx: globalThis.dummy,
							preview: images.preview,
							broken: images.broken
						});

					}, [tag, images, imgUrl]);

					await h.bom.waitForIdleCallback(page);

					expect(await getNode(tag).evaluate((ctx) => globalThis.getSrc(ctx))).toBe(images.preview);
					await expectAsync(
						waitFor(getNode(tag), (ctx, imgUrl) => globalThis.getSrc(ctx) === imgUrl, imgUrl)
					).toBeResolved();

					await reqPromise;
					await h.bom.waitForIdleCallback(page);

					expect(await getNode(tag).evaluate((ctx) => globalThis.getSrc(ctx))).toBe(imgUrl);
				});

				it('with loading error, preview with `src`, broken with `src`', async () => {
					const imgUrl = getRandomImgUrl();
					abortImageRequest(imgUrl, 500);

					await imageLoader.evaluate((imageLoaderCtx, [tag, images, imgUrl]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: imgUrl,
							ctx: globalThis.dummy,
							preview: images.preview,
							broken: images.broken
						});
					}, [tag, images, imgUrl]);

					await h.bom.waitForIdleCallback(page);

					expect(await getNode(tag).evaluate((ctx) => globalThis.getSrc(ctx))).toBe(images.preview);
					await expectAsync(
						waitFor(getNode(tag), (ctx, broken) => globalThis.getSrc(ctx) === broken, images.broken)
					).toBeResolved();
				});

				it('tag with `src`, preview with loading error, broken with `src`', async () => {
					const
						previewImgUrl = getRandomImgUrl(),
						mainImgUrl = getRandomImgUrl();

					const
						abortReq = abortImageRequest(previewImgUrl, 100);

					handleImageRequest(mainImgUrl, 500);

					await imageLoader.evaluate((imageLoaderCtx, [tag, images, mainImgUrl, previewImgUrl]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: mainImgUrl,
							ctx: globalThis.dummy,
							preview: previewImgUrl,
							broken: images.broken
						});

					}, [tag, images, mainImgUrl, previewImgUrl]);

					await abortReq;
					await h.bom.waitForIdleCallback(page);
					expect(await getNode(tag).evaluate((ctx) => globalThis.getSrc(ctx))).not.toBe(previewImgUrl);

					await expectAsync(
						waitFor(getNode(tag), (ctx, mainImgUrl) => globalThis.getSrc(ctx) === mainImgUrl, mainImgUrl)
					).toBeResolved();
				});

				it('with loading error, preview with loading error, broken with loading error', async () => {
					const
						previewImgUrl = getRandomImgUrl(),
						brokenImgUrl = getRandomImgUrl(),
						mainImgUrl = getRandomImgUrl();

					const reqPromises = [
						abortImageRequest(previewImgUrl, 100),
						abortImageRequest(brokenImgUrl, 100),
						abortImageRequest(mainImgUrl, 100)
					];

					await imageLoader.evaluate((imageLoaderCtx, [tag, brokenImgUrl, mainImgUrl, previewImgUrl]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: mainImgUrl,
							ctx: globalThis.dummy,
							preview: previewImgUrl,
							broken: brokenImgUrl
						});

					}, [tag, brokenImgUrl, mainImgUrl, previewImgUrl]);

					await h.bom.waitForIdleCallback(page);
					expect(await getNode(tag).evaluate((ctx) => globalThis.getSrc(ctx))).not.toBe(previewImgUrl);

					await Promise.all(reqPromises);
					await h.bom.waitForIdleCallback(page);

					expect(await getNode(tag).evaluate((ctx) => globalThis.getSrc(ctx))).not.toBe(previewImgUrl);
					expect(await getNode(tag).evaluate((ctx) => globalThis.getSrc(ctx))).not.toBe(brokenImgUrl);
					expect(await getNode(tag).evaluate((ctx) => globalThis.getSrc(ctx))).not.toBe(mainImgUrl);
				});

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

						imageLoaderCtx.init(target, {
							src: mainImgUrl,
							ctx: globalThis.dummy,
							preview: {
								src: previewImgUrl,
								load: () => globalThis.tmp = true
							}
						});

					}, [tag, images.pngImage, images.preview]);

					await expectAsync(page.waitForFunction('globalThis.tmp === true')).toBeResolved();
				});

				it('main with loading error, broken with `src` and load callback', async () => {
					const mainImgUrl = getRandomImgUrl();
					abortImageRequest(mainImgUrl);

					await imageLoader.evaluate((imageLoaderCtx, [tag, mainImgUrl, brokenImgUrl]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: mainImgUrl,
							ctx: globalThis.dummy,
							broken: {
								src: brokenImgUrl,
								load: () => globalThis.tmp = true
							}
						});

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

						imageLoaderCtx.init(target, {
							src: mainImgUrl,
							ctx: globalThis.dummy,
							broken: {
								src: brokenImgUrl,
								error: () => globalThis.tmp = false
							}
						});

					}, [tag, mainImgUrl, brokenImgUrl]);

					await expectAsync(page.waitForFunction('globalThis.tmp === false')).toBeResolved();
				});

				it('main with `src`, `sources` (srcset, media)', async () => {
					await page.setViewportSize({
						width: 580,
						height: 480
					 });

					await imageLoader.evaluate((imageLoaderCtx, [tag, pngImage2x, pngImage]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: pngImage2x,
							ctx: globalThis.dummy,
							sources: [{srcset: pngImage, media: '(max-width: 600px)'}]
						});
					}, [tag, images.pngImage2x, images.pngImage]);

					await expectAsync(
						waitFor(getNode(tag), (ctx, pngImage) => globalThis.getSrc(ctx) === pngImage, images.pngImage)
					).toBeResolved();
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
					}, [tag, images.pngImage, images.webp]);

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
							ctx: globalThis.dummy
						});
					}, [tag, baseSrc, src]);

					await expectAsync(
						waitFor(getNode(tag), (ctx, reqUrl) => globalThis.getSrc(ctx) === reqUrl, reqUrl)
					).toBeResolved();
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
							ctx: globalThis.dummy
						});
					}, [tag, baseSrc, mainSrc, previewSrc]);

					await expectAsync(
						waitFor(getNode(tag), (ctx, previewReqUrl) => globalThis.getSrc(ctx) === previewReqUrl, previewReqUrl)
					).toBeResolved();

					await expectAsync(
						waitFor(getNode(tag), (ctx, mainReqUrl) => globalThis.getSrc(ctx) === mainReqUrl, mainReqUrl)
					).toBeResolved();
				});

				it('main with `src`, `baseSrc`, `sources` (srcset, media)', async () => {
					await page.setViewportSize({
						width: 580,
						height: 480
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

					await expectAsync(
						waitFor(getNode(tag), (ctx, sourceReqUrl) => globalThis.getSrc(ctx) === sourceReqUrl, sourceReqUrl)
					).toBeResolved();
				});

				it('main with `src`, `baseSrc`, preview with `src`, `sources` (srcset, media)', async () => {
					await page.setViewportSize({
						width: 580,
						height: 480
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

					await expectAsync(
						waitFor(getNode(tag), (ctx, sourceReqUrl) => globalThis.getSrc(ctx) === sourceReqUrl, sourceReqUrl)
					).toBeResolved();

					await expectAsync(
						waitFor(getNode(tag), (ctx, mainReqUrl) => globalThis.getSrc(ctx) === mainReqUrl, mainReqUrl)
					).toBeResolved();
				});

				it('main loading error with `src`, `baseSrc`, broken with `src`, `sources` (srcset, media)', async () => {
					await page.setViewportSize({
						width: 580,
						height: 480
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

					await expectAsync(
						waitFor(getNode(tag), (ctx, sourceReqUrl) => globalThis.getSrc(ctx) === sourceReqUrl, sourceReqUrl)
					).toBeResolved();
				});

				it('main state classes with `src`, preview with `src`', async () => {
					const
						mainSrcUrl = getRandomImgUrl(),
						previewSrcUrl = getRandomImgUrl();

					handleImageRequest(previewSrcUrl);
					handleImageRequest(mainSrcUrl, 100);

					const
						previewClass = await component.evaluate((ctx) => ctx.block.getFullElName('v-image', 'preview', 'true')),
						mainClass = await component.evaluate((ctx) => ctx.block.getFullElName('v-image', 'main', 'true'));

					await imageLoader.evaluate((imageLoaderCtx, [tag, mainSrcUrl, previewSrcUrl]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: mainSrcUrl,
							preview: previewSrcUrl,
							stateClasses: true,
							ctx: globalThis.dummy
						});
					}, [tag, mainSrcUrl, previewSrcUrl]);

					await expectAsync(
						waitFor(getNode(tag), (ctx, previewClass) => ctx.classList.contains(previewClass), previewClass)
					).toBeResolved();

					await expectAsync(
						waitFor(getNode(tag), (ctx, mainStateClass) => ctx.classList.contains(mainStateClass), mainClass)
					).toBeResolved();
				});

				it('main with `stateClasses`, `src`, preview with `src`, broken with `src`', async () => {
					const
						mainSrcUrl = getRandomImgUrl(),
						brokenSrcUrl = getRandomImgUrl(),
						previewSrcUrl = getRandomImgUrl();

					handleImageRequest(previewSrcUrl, 300);
					handleImageRequest(brokenSrcUrl);
					abortImageRequest(mainSrcUrl, 600);

					const
						brokenClass = await component.evaluate((ctx) => ctx.block.getFullElName('v-image', 'broken', 'true')),
						previewClass = await component.evaluate((ctx) => ctx.block.getFullElName('v-image', 'preview', 'true')),
						initialClass = await component.evaluate((ctx) => ctx.block.getFullElName('v-image', 'initial', 'true'));

					await imageLoader.evaluate((imageLoaderCtx, [tag, mainSrcUrl, previewSrcUrl, brokenSrcUrl]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: mainSrcUrl,
							preview: previewSrcUrl,
							broken: brokenSrcUrl,
							stateClasses: true,
							ctx: globalThis.dummy
						});
					}, [tag, mainSrcUrl, previewSrcUrl, brokenSrcUrl]);

					expect(
						await getNode(tag).evaluate((ctx, initialClass) => ctx.classList.contains(initialClass), initialClass)
					).toBeTrue();

					await expectAsync(
						waitFor(getNode(tag), (ctx, previewClass) => ctx.classList.contains(previewClass), previewClass)
					).toBeResolved();

					await expectAsync(
						waitFor(getNode(tag), (ctx, brokenClass) => ctx.classList.contains(brokenClass), brokenClass)
					).toBeResolved();
				});

				it('main with `src`, `load` will not call a `load` callback if context was destroyed', async () => {
					const
						mainSrcUrl = getRandomImgUrl(),
						imgReq = handleImageRequest(mainSrcUrl, 300);

					const targetComponent = await h.component.renderComponent(component, 'b-dummy', {});
					await targetComponent.evaluate((ctx) => globalThis.tmpComponent = ctx.component);

					await imageLoader.evaluate((imageLoaderCtx, [tag, mainSrcUrl]) => {
						const target = document.getElementById(`${tag}-target`);

						imageLoaderCtx.init(target, {
							src: mainSrcUrl,
							load: () => globalThis.tmp = true,
							ctx: globalThis.tmpComponent
						});
					}, [tag, mainSrcUrl]);

					await targetComponent.evaluate((ctx) => ctx.component.$destroy());
					await imgReq;
					await h.bom.waitForIdleCallback(page);

					expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
				});
			});
		});

		it('div main with `src`, `bgOptions`', async () => {
			const
				tag = 'div',
				beforeImg = 'linear-gradient(rgb(230, 100, 101), rgb(145, 152, 229))',
				afterImg = 'linear-gradient(rgb(230, 97, 101), rgb(145, 40, 229))';

			await imageLoader.evaluate((imageLoaderCtx, [tag, mainSrc, beforeImg, afterImg]) => {
				const target = document.getElementById(`${tag}-target`);

				imageLoaderCtx.init(target, {
					src: mainSrc,
					bgOptions: {size: 'contain', ratio: 100 / 50, beforeImg, afterImg, position: '47% 47%'},
					ctx: globalThis.dummy
				});
			}, [tag, images.pngImage, beforeImg, afterImg]);

			const
				expected = `${(1 / (100 / 50)) * 100}%`;

			await expectAsync(getNode(tag).evaluate((ctx, mainSrc) => globalThis.getSrc(ctx) === mainSrc, images.pngImage));

			const
				bg = await getNode(tag).evaluate((ctx) => ctx.style.backgroundImage);

			expect(bg.startsWith(beforeImg)).toBeTrue();
			expect(bg.endsWith(afterImg)).toBeTrue();

			expect(await getNode(tag).evaluate((ctx) => ctx.style.paddingBottom)).toBe(expected);
			expect(await getNode(tag).evaluate((ctx) => ctx.style.backgroundPosition)).toBe('47% 47%');
			expect(await getNode(tag).evaluate((ctx) => ctx.style.backgroundSize)).toBe('contain');
		});

		it('div main with `src`, default ratio', async () => {
			const
				tag = 'div';

			await imageLoader.evaluate((imageLoaderCtx, [tag, mainSrc]) => {
				const target = document.getElementById(`${tag}-target`);

				imageLoaderCtx.init(target, {
					src: mainSrc,
					ctx: globalThis.dummy
				});

				const testImg = document.createElement('img');
				testImg.src = mainSrc;

				testImg.onInit(() => {
					if (testImg.naturalHeight > 0 || testImg.naturalWidth > 0) {
						const ratio = testImg.naturalHeight === 0 ? 1 : testImg.naturalWidth / testImg.naturalHeight;
						globalThis.tmp = `${(1 / ratio) * 100}%`;
					}
				});
			}, [tag, images.pngImage]);

			await h.bom.waitForIdleCallback(page);
			await expectAsync(getNode(tag).evaluate((ctx) => ctx.style.paddingBottom === globalThis.tmp)).toBeResolved();
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
				imageLoaderCtx.init(div, {
					src: images.pngImage,
					alt: 'alt-text',
					ctx: globalThis.dummy
				});

			}, images);

			await h.bom.waitForIdleCallback(page);

			expect(await divNode.evaluate((ctx) => globalThis.getSrc(ctx))).toBe(images.pngImage);
			expect(await divNode.getAttribute('aria-label')).toBe('alt-text');
			expect(await divNode.getAttribute('role')).toBe('img');
		});
	});
};
