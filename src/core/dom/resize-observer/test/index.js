/* eslint-disable max-lines,max-lines-per-function */

// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	delay = require('delay'),
	h = include('tests/helpers');

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
		resizeWatcher,
		divNode;

	beforeAll(async () => {
		componentNode = await h.dom.waitForEl(page, '#dummy-component');
		component = await h.component.waitForComponent(page, '#dummy-component');
		resizeWatcher = await component.evaluateHandle((ctx) => ctx.modules.resizeWatcher);
		await component.evaluate((ctx) => globalThis.dummy = ctx);
	});

	beforeEach(async () => {
		await resizeWatcher.evaluate((ctx) => {
			if (globalThis.target == null) {
				return;
			}

			ctx.clear(globalThis.target);
			globalThis.target.remove();
		});

		// eslint-disable-next-line no-inline-comments
		await componentNode.evaluate((/** @type HTMLElement */ ctx) => {
			ctx.innerHTML = '';

			const div = document.createElement('div');
			div.id = 'div-target';
			ctx.appendChild(div);

			Object.assign(div.style, {
				height: '200px',
				width: '200px',
				display: 'block',
				transition: ''
			});

			globalThis.tmp = undefined;
			globalThis.target = div;
		});

		divNode = await page.$('#div-target');
	});

	describe('core/dom/resize-observer', () => {
		it('invokes the initial callback', async () => {
			await resizeWatcher.evaluate((ctx) => {
				globalThis.fn = () => globalThis.tmp = true;
				ctx.observe(globalThis.target, globalThis.fn);
			});

			await expectAsync(page.waitForFunction(() => globalThis.tmp === true)).toBeResolved();
		});

		it('does not invoke the initial callback', async () => {
			await resizeWatcher.evaluate((ctx) => {
				globalThis.fn = () => globalThis.tmp = true;

				ctx.observe(globalThis.target, {
					callback: globalThis.fn,
					initial: false
				});
			});

			await delay(300);
			expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
		});

		it('invokes once with `once` settled to `true`', async () => {
			await resizeWatcher.evaluate((ctx) => {
				globalThis.tmp = 0;
				globalThis.fn = () => globalThis.tmp += 1;

				ctx.observe(globalThis.target, {
					callback: globalThis.fn,
					once: true,
					initial: false
				});
			});

			await page.evaluate(() => globalThis.target.style.width = '300px');
			await h.bom.waitForIdleCallback(page);
			await page.evaluate(() => globalThis.target.style.width = '320px');
			await h.bom.waitForIdleCallback(page);

			expect(await page.evaluate(() => globalThis.tmp)).toBe(1);
		});

		it('invokes the callback after an element width has been changed `watchWidth: true`', async () => {
			await resizeWatcher.evaluate((ctx) => {
				globalThis.fn = () => globalThis.tmp = true;

				ctx.observe(globalThis.target, {
					callback: globalThis.fn,
					initial: false,
					watchHeight: false,
					watchWidth: true
				});
			});

			await h.bom.waitForIdleCallback(page);
			await page.evaluate(() => globalThis.target.style.width = '300px');
			await h.bom.waitForIdleCallback(page);

			expect(await page.evaluate(() => globalThis.tmp)).toBeTrue();
		});

		it('does not invoke the callback after an element width has been changed `watchWidth: false`', async () => {
			await resizeWatcher.evaluate((ctx) => {
				globalThis.fn = () => globalThis.tmp = true;

				ctx.observe(globalThis.target, {
					callback: globalThis.fn,
					initial: false,
					watchHeight: true,
					watchWidth: false
				});
			});

			await h.bom.waitForIdleCallback(page);
			await divNode.evaluate((ctx) => ctx.style.width = '300px');
			await h.bom.waitForIdleCallback(page);

			expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
		});

		it('invokes the callback after an element height has been changed', async () => {
			await resizeWatcher.evaluate((ctx) => {
				globalThis.fn = () => globalThis.tmp = true;

				ctx.observe(globalThis.target, {
					callback: globalThis.fn,
					initial: false,
					watchHeight: true,
					watchWidth: false
				});
			});

			await h.bom.waitForIdleCallback(page);
			await divNode.evaluate((ctx) => ctx.style.height = '300px');
			await h.bom.waitForIdleCallback(page);

			await expectAsync(page.waitForFunction(() => globalThis.tmp)).toBeResolved();
		});

		it('invokes the lazy callback after an element width has been changed', async () => {
			await resizeWatcher.evaluate((ctx) => {
				globalThis.tmp = 0;
				globalThis.fn = () => globalThis.tmp += 1;

				ctx.observe(globalThis.target, {
					callback: globalThis.fn,
					initial: false,
					watchHeight: false,
					watchWidth: true
				});
			});

			await divNode.evaluate((ctx) => new Promise((res) => {
				let flag = true;

				const interval = setInterval(() => {
					ctx.style.width = flag === true ? '400px' : '300px';
					flag = !flag;
				}, 30);

				setTimeout(() => {
					clearInterval(interval);
					res();
				}, 300);
			}));

			await h.bom.waitForIdleCallback(page);

			expect(await page.evaluate(() => globalThis.tmp)).toBe(1);
		});

		it('invokes the callback multiple times if the size of an element has been changed', async () => {
			await resizeWatcher.evaluate((ctx) => {
				globalThis.tmp = 0;
				globalThis.fn = () => globalThis.tmp += 1;

				ctx.observe(globalThis.target, {
					callback: globalThis.fn,
					initial: false,
					watchHeight: false,
					watchWidth: true,
					immediate: true
				});
			});

			await divNode.evaluate((ctx) => new Promise((res) => {
				let flag = true;

				const interval = setInterval(() => {
					ctx.style.width = flag === true ? '400px' : '300px';
					flag = !flag;
				}, 30);

				setTimeout(() => {
					clearInterval(interval);
					res();
				}, 300);
			}));

			expect(await page.evaluate(() => globalThis.tmp)).toBeGreaterThan(1);
		});

		it('unobserved element does not invokes the callback', async () => {
			await resizeWatcher.evaluate((ctx) => {
				globalThis.fn = () => globalThis.tmp = true;

				ctx.observe(globalThis.target, {
					callback: globalThis.fn,
					initial: false
				});

				ctx.unobserve(globalThis.target, globalThis.fn);
			});

			await divNode.evaluate((ctx) => ctx.style.height = '300px');
			await h.bom.waitForIdleCallback(page);

			expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
		});
	});
};
