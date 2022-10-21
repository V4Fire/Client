/* eslint-disable max-lines-per-function */

// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers').default,
	delay = require('delay'),
	images = include('src/core/dom/image/test/const');

/**
* Starts a test
*
* @param {Page} page
* @param {!Object} params
* @returns {!Promise<void>}
*/
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	let
		component,
		node,
		isClosed;

	page.on('close', () => isClosed = true);

	const
		mainImg = () => page.$('.b-image__img'),
		getRandomUrlPostfix = () => `${Math.random().toString().substr(10)}x${Math.random().toString().substr(10)}`,
		getRandomImgUrl = () => `https://fakeim.pl/${getRandomUrlPostfix()}`,
		abortImageRequest = (url, sleep = 0) => handleImageRequest(url, sleep, ''),
		getSrc = (node) => node.evaluate((el) => globalThis.getSrc(el));

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();

			globalThis.getSrc = (ctx) => {
				if (ctx instanceof HTMLImageElement) {
					return ctx.currentSrc;
				}

				return ctx.style.backgroundImage.match(/url\("(.*)"\)/)?.[1] ?? '';
			};
		});
	});

	describe('b-image', () => {
		describe('src', () => {
			it('renders a component with the provided `src`', async () => {
				const
					imgUrl = getRandomImgUrl(),
					reqPromise = handleImageRequest(imgUrl);

				await init({
					src: imgUrl
				});

				await reqPromise;
				await h.bom.waitForIdleCallback(page, {sleepAfterIdles: 200});

				expect(await getSrc(await mainImg())).toBe(imgUrl);
			});

			it('re-renders a component with a new `src`', async () => {
				const
					imgUrl = getRandomImgUrl(),
					reqPromise = handleImageRequest(imgUrl);

				await init({
					src: imgUrl
				});

				await reqPromise;
				await h.bom.waitForIdleCallback(page);

				const
					newImgUrl = getRandomImgUrl(),
					newReqPromise = handleImageRequest(newImgUrl);

				await component.evaluate((ctx, [newImgUrl]) => ctx.src = newImgUrl, [newImgUrl]);
				await newReqPromise;
				await h.bom.waitForIdleCallback(page);

				expect(await getSrc(await mainImg())).toBe(newImgUrl);
			});
		});

		describe('srcset', () => {
			it('renders a component with the provided `srcset`', async () => {
				const
					imgUrl = getRandomImgUrl(),
					reqPromise = handleImageRequest(imgUrl);

				await init({
					srcset: {'1x': imgUrl}
				});

				await reqPromise;
				await h.bom.waitForIdleCallback(page);

				expect(await getSrc(await mainImg())).toBe(imgUrl);
			});
		});

		describe('alt', () => {
			it('renders a component with aria attributes', async () => {
				const
					imgUrl = getRandomImgUrl(),
					reqPromise = handleImageRequest(imgUrl);

				const
					altText = 'alt text';

				await init({
					src: imgUrl,
					alt: altText
				});

				await reqPromise;
				await h.bom.waitForIdleCallback(page);

				const attrsVal = await node.evaluate((ctx) => [
					ctx.getAttribute('role'),
					ctx.getAttribute('aria-label')
				]);

				expect(attrsVal[0]).toBe('img');
				expect(attrsVal[1]).toBe(altText);
			});
		});

		describe('position', () => {
			it('renders a component with the provided `position`', async () => {
				const
					imgUrl = getRandomImgUrl(),
					reqPromise = handleImageRequest(imgUrl);

				const
					position = '40% 40%';

				await init({
					src: imgUrl,
					position
				});

				await reqPromise;
				await h.bom.waitForIdleCallback(page);

				expect(await (await mainImg()).evaluate((ctx) => ctx.style.backgroundPosition)).toBe(position);
			});

			it('by default is set to 50% 50%', async () => {
				const
					imgUrl = getRandomImgUrl(),
					reqPromise = handleImageRequest(imgUrl);

				const
					position = '50% 50%';

				await init({
					src: imgUrl
				});

				await reqPromise;
				await h.bom.waitForIdleCallback(page);

				expect(await (await mainImg()).evaluate((ctx) => ctx.style.backgroundPosition)).toBe(position);
			});
		});

		describe('ratio', () => {
			it('renders a component with the provided `ratio`', async () => {
				const
					imgUrl = getRandomImgUrl(),
					reqPromise = handleImageRequest(imgUrl);

				const
					ratio = 100 / 50,
					expected = `${(1 / (100 / 50)) * 100}%`;

				await init({
					src: imgUrl,
					ratio
				});

				await reqPromise;
				await h.bom.waitForIdleCallback(page);

				expect(await (await mainImg()).evaluate((ctx) => ctx.style.paddingBottom)).toBe(expected);
			});
		});

		describe('beforeImg, afterImg', () => {
			it('renders a component with the provided `beforeImg`', async () => {
				const
					imgUrl = getRandomImgUrl(),
					reqPromise = handleImageRequest(imgUrl);

				const
					beforeImg = 'linear-gradient(rgb(230, 100, 101), rgb(145, 152, 229))';

				await init({
					src: imgUrl,
					beforeImg
				});

				await reqPromise;
				await h.bom.waitForIdleCallback(page);

				const
					bg = await (await mainImg()).evaluate((ctx) => ctx.style.backgroundImage);

				expect(bg.startsWith(beforeImg)).toBe(true);
			});

			it('renders a component with the provided `afterImg`', async () => {
				const
					imgUrl = getRandomImgUrl(),
					reqPromise = handleImageRequest(imgUrl);

				const
					afterImg = 'linear-gradient(rgb(230, 97, 101), rgb(145, 40, 229))';

				await init({
					src: imgUrl,
					afterImg
				});

				await reqPromise;
				await h.bom.waitForIdleCallback(page);

				const
					bg = await (await mainImg()).evaluate((ctx) => ctx.style.backgroundImage);

				expect(bg.endsWith(afterImg)).toBe(true);
			});

			it('renders a component with the provided `afterImg` and `beforeImg`', async () => {
				const
					imgUrl = getRandomImgUrl(),
					reqPromise = handleImageRequest(imgUrl);

				const
					beforeImg = 'linear-gradient(rgb(230, 100, 101), rgb(145, 152, 229))',
					afterImg = 'linear-gradient(rgb(230, 97, 101), rgb(145, 40, 229))';

				await init({
					src: imgUrl,
					beforeImg,
					afterImg
				});

				await reqPromise;
				await h.bom.waitForIdleCallback(page);

				const
					bg = await (await mainImg()).evaluate((ctx) => ctx.style.backgroundImage);

				expect(bg.startsWith(beforeImg)).toBe(true);
				expect(bg.endsWith(afterImg)).toBe(true);
			});
		});

		describe('overlayImg', () => {
			it('renders a component with the overlay image if loading is still in progress', async () => {
				const
					imgUrl = getRandomImgUrl(),
					previewImg = images.preview,
					reqPromise = handleImageRequest(imgUrl, 1000);

				await init({
					src: imgUrl,
					overlayImg: previewImg
				});

				await h.bom.waitForIdleCallback(page);

				const previewElSelector = await component.evaluate(
					(ctx) => ctx.block.getElementSelector('overlay-img')
				);

				const previewSrc = await component.evaluate(
					(ctx) => globalThis.getSrc(ctx.block.element('overlay-img'))
				);

				await expectAsync(page.waitForSelector(previewElSelector, {state: 'visible'})).toBeResolved();
				expect(previewSrc).toBe(previewImg);

				await reqPromise;
			});

			it('hides an overlay image if loading is complete', async () => {
				const
					imgUrl = getRandomImgUrl(),
					previewImg = images.preview,
					reqPromise = handleImageRequest(imgUrl, 300);

				await init({
					src: imgUrl,
					overlayImg: previewImg
				});

				await h.bom.waitForIdleCallback(page);

				const
					opacity = await component.evaluate((ctx) => ctx.block.element('overlay-img').style.opacity);

				await reqPromise;

				expect(Number(opacity)).toBe(0);
			});

			it('hides an overlay image if loading is failed', async () => {
				const
					imgUrl = getRandomImgUrl(),
					previewImg = images.preview,
					reqPromise = abortImageRequest(imgUrl, 300);

				await init({
					src: imgUrl,
					overlayImg: previewImg
				});

				await h.bom.waitForIdleCallback(page);

				const opacity = await component.evaluate((ctx) => ctx.block.element('overlay-img').style.opacity);

				await reqPromise;
				await h.bom.waitForIdleCallback(page);

				expect(Number(opacity)).toBe(0);
			});
		});

		describe('brokenImg', () => {
			it('renders a component with the broken image if loading error occurs', async () => {
				const
					imgUrl = getRandomImgUrl(),
					brokenImg = images.broken,
					reqPromise = abortImageRequest(imgUrl, 100);

				await init({
					src: imgUrl,
					brokenImg
				});

				await h.bom.waitForIdleCallback(page);

				const brokenElSelector = await component.evaluate(
					(ctx) => ctx.block.getElementSelector('broken-img')
				);

				const brokenElSrc = await component.evaluate(
					(ctx) => globalThis.getSrc(ctx.block.element('broken-img'))
				);

				await reqPromise;
				await h.bom.waitForIdleCallback(page);

				await expectAsync(page.waitForSelector(brokenElSelector, {state: 'visible'})).toBeResolved();
				expect(brokenElSrc).toBe(brokenImg);
			});

			it('renders a component without the broken image if loading was successful', async () => {
				const
					imgUrl = getRandomImgUrl(),
					brokenImg = images.broken,
					reqPromise = abortImageRequest(imgUrl, 300);

				await init({
					src: imgUrl,
					brokenImg
				});

				await h.bom.waitForIdleCallback(page);

				const opacity = await component.evaluate((ctx) => ctx.block.element('broken-img').style.opacity);

				await reqPromise;
				await h.bom.waitForIdleCallback(page);

				expect(Number(opacity)).toBe(0);
			});
		});

		describe('image loading failed', () => {
			it('fires the `loadFail` event', async () => {
				const
					imgUrl = getRandomImgUrl(),
					reqPromise = abortImageRequest(imgUrl, 300);

				await init({
					src: imgUrl
				});

				const
					eventPromise = component.evaluate((ctx) => new Promise((res) => ctx.once('loadFail', res)));

				await reqPromise;

				await expectAsync(eventPromise).toBeResolved();
			});

			it('sets the `showError` mod to `true`', async () => {
				const
					imgUrl = getRandomImgUrl(),
					reqPromise = abortImageRequest(imgUrl, 500);

				await init({
					src: imgUrl
				});

				await reqPromise;
				await h.bom.waitForIdleCallback(page);

				await expectAsync(page.waitForFunction(() => {
					const
						// @ts-ignore
						{component} = document.querySelector('#target');

					return component.mods.showError === 'true';
				})).toBeResolved();
			});
		});

		describe('image loaded successfully', () => {
			it('fires the `loadSuccess` event', async () => {
				const
					imgUrl = getRandomImgUrl(),
					reqPromise = handleImageRequest(imgUrl, 100);

				await init({
					src: imgUrl
				});

				const
					eventPromise = component.evaluate((ctx) => new Promise((res) => ctx.once('loadSuccess', res)));

				await reqPromise;
				await h.bom.waitForIdleCallback(page);

				await expectAsync(eventPromise).toBeResolved();
			});
		});
	});

	function handleImageRequest(url, sleep = 0, base64Img = images.pngImage) {
		return page.route(url, async (route) => {
			await delay(sleep);

			if (isClosed) {
				return;
			}

			if (base64Img === '') {
				await route.abort('failed');
				return;
			}

			const
				res = base64Img.split(',')[1],
				headers = route.request().headers();

			headers['Content-Length'] = String(res?.length ?? 0);

			await route.fulfill({
				status: 200,
				body: Buffer.from(res, 'base64'),
				contentType: 'image/png',
				headers
			});
		});
	}

	async function init(props = {}) {
		await page.evaluate((props) => {
			const scheme = [
				{
					attrs: {
						id: 'target',
						...props
					}
				}
			];

			globalThis.renderComponents('b-image', scheme);
		}, props);

		node = await h.dom.waitForEl(page, '#target');
		component = await h.component.waitForComponent(page, '#target');
	}
};
