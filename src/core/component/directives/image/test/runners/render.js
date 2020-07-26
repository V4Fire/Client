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
		});

		await imageLoader.evaluate((ctx) => {
			ctx.pending.delete(document.getElementById('div-target'));
			ctx.pending.delete(document.getElementById('img-target'));
		});

		imgNode = await componentNode.$('#img-target');
		divNode = await componentNode.$('#div-target');
	});

	describe('v-image rendering', () => {
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
	});
};
