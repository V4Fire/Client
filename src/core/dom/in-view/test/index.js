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
		inViewMutation,
		inViewObserver,
		divNode;

	const
		strategies = ['mutation', 'observer'],
		getInView = (strategy) => strategy === 'mutation' ? inViewMutation : inViewObserver;

	beforeAll(async () => {
		componentNode = await h.dom.waitForEl(page, '#dummy-component');
		component = await h.component.waitForComponent(page, '#dummy-component');

		inViewMutation = await component.evaluateHandle((ctx) => ctx.directives.inViewMutation);
		inViewObserver = await component.evaluateHandle((ctx) => ctx.directives.inViewObserver);

		await component.evaluate((ctx) => globalThis.dummy = ctx);
	});

	beforeEach(async () => {
		await page.setViewportSize({
			width: 1024,
			height: 1024
		});

		for (let i = 0; i < strategies.length; i++) {
			await getInView(strategies[i]).evaluate((ctx) => ctx.remove(globalThis.target));
		}

		// eslint-disable-next-line no-inline-comments
		await componentNode.evaluate((/** @type HTMLElement */ ctx) => {
			ctx.innerHTML = '';

			const div = document.createElement('div');
			div.id = 'div-target';
			ctx.appendChild(div);

			Object.assign(div.style, {
				height: '200px',
				width: '200px',
				display: 'block'
			});

			globalThis.tmp = undefined;
			globalThis.tmpTime = undefined;
			globalThis.tmpTotalTime = undefined;

			globalThis.target = div;
		});

		divNode = await componentNode.$('#div-target');
	});

	strategies.forEach((strategy) => {
		describe(`in-view ${strategy} strategy`, () => {
			it('with `callback`', async () => {
				await getInView(strategy).evaluate((ctx) => {
					ctx.observe(globalThis.target, {
						callback: () => globalThis.tmp = true
					});
				});

				await expectAsync(page.waitForFunction('globalThis.tmp === true')).toBeResolved();
			});

			it('with `callback` and `delay`', async () => {
				await getInView(strategy).evaluate((ctx) => {
					globalThis.tmpTime = performance.now();

					ctx.observe(globalThis.target, {
						callback: () => {
							globalThis.tmp = true;
							globalThis.tmpTotalTime = performance.now() - globalThis.tmpTime;
						},
						delay: 1000
					});
				});

				await h.bom.waitForIdleCallback(page);
				expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();

				await expectAsync(page.waitForFunction('globalThis.tmp === true')).toBeResolved();
				expect(await page.evaluate(() => globalThis.tmpTotalTime)).toBeGreaterThanOrEqual(1000);
				expect(await page.evaluate(() => globalThis.tmpTotalTime)).not.toBeGreaterThanOrEqual(2000);
			});

			it('with `callback`: doesn\'t fire the callback on a hidden element', async () => {
				await page.evaluate(() => {
					globalThis.target.style.height = '0';
					globalThis.target.style.width = '0';
					globalThis.target.style.display = 'none';
				});

				await getInView(strategy).evaluate((ctx) => {
					ctx.observe(globalThis.target, {
						callback: () => globalThis.tmp = true
					});
				});

				await h.bom.waitForIdleCallback(page);
				expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
			});

			it('with `callback` and `polling`', async () => {
				await getInView(strategy).evaluate((ctx) => {
					ctx.observe(globalThis.target, {
						callback: () => globalThis.tmp = true,
						delay: 1,
						polling: true
					});
				});

				await expectAsync(page.waitForFunction('globalThis.tmp === true')).toBeResolved();
			});

			it('with `callback` and `polling`: doesn\'t fire the callback on a hidden element', async () => {
				await page.evaluate(() => {
					globalThis.target.style.height = '0';
					globalThis.target.style.width = '0';
					globalThis.target.style.display = 'none';
				});

				await getInView(strategy).evaluate((ctx) => {
					ctx.observe(globalThis.target, {
						callback: () => globalThis.tmp = true,
						polling: true
					});
				});

				await h.bom.waitForIdleCallback(page);
				expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
			});

			it('with `threshold: 0.5`: the element is positioned at the bottom of the page', async () => {
				await page.setViewportSize({
					width: 600,
					height: 300
				});

				await divNode.evaluate((ctx) => ctx.style.marginTop = '200px');

				await getInView(strategy).evaluate((ctx) => {
					ctx.observe(globalThis.target, {
						callback: () => globalThis.tmp = true,
						threshold: 0.5
					});
				});

				await expectAsync(page.waitForFunction('globalThis.tmp === true')).toBeResolved();
			});

			it('with `threshold: 0.5` and `polling`: the element is positioned at the bottom of the page', async () => {
				await page.setViewportSize({
					width: 600,
					height: 300
				});

				await divNode.evaluate((ctx) => ctx.style.marginTop = '200px');

				await getInView(strategy).evaluate((ctx) => {
					ctx.observe(globalThis.target, {
						callback: () => globalThis.tmp = true,
						threshold: 0.5,
						polling: true
					});
				});

				await expectAsync(page.waitForFunction('globalThis.tmp === true')).toBeResolved();
			});

			it('with `threshold: 0.5` and the element that is 0.2 visible: doesn\'t fire the callback', async () => {
				await page.setViewportSize({
					width: 600,
					height: 300
				});

				await divNode.evaluate((ctx) => ctx.style.marginTop = '250px');

				await getInView(strategy).evaluate((ctx) => {
					ctx.observe(globalThis.target, {
						callback: () => globalThis.tmp = true,
						threshold: 0.5,
						delay: 100
					});
				});

				await delay(200);
				expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
			});

			it('removing an element from observing', async () => {
				await getInView(strategy).evaluate((ctx) => {
					ctx.observe(globalThis.target, {
						callback: () => globalThis.tmp = true,
						delay: 200
					});

					ctx.remove(globalThis.target);
				});

				await delay(300);
				expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
			});

			it('suspending with `callback`: doesn\'t fire the callback', async () => {
				await getInView(strategy).evaluate((ctx) => {
					ctx.observe(globalThis.target, {
						callback: () => globalThis.tmp = true,
						delay: 200,
						group: 'test'
					});

					setTimeout(() => ctx.suspend('test'), 0);
				});

				await delay(300);
				expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();
			});

			it('suspending first observable by the group doesn\'t fire a callback, second observable without group fire a callback', async () => {
				await page.evaluate(() => globalThis.tmp = {});

				await getInView(strategy).evaluate((ctx) => {
					ctx.observe(globalThis.target, {
						callback: () => globalThis.tmp[1] = true,
						delay: 200,
						threshold: 0.7,
						group: 'test'
					});

					ctx.observe(globalThis.target, {
						callback: () => globalThis.tmp[2] = true,
						delay: 100,
						threshold: 0.8
					});

					setTimeout(() => ctx.suspend('test'), 0);
				});

				await delay(200);
				await page.waitForFunction('globalThis.tmp[2] === true');

				expect(await page.evaluate(() => globalThis.tmp)).toEqual({2: true});
			});

			it('suspending/unsuspending with `callback`: fires the callback', async () => {
				await getInView(strategy).evaluate((ctx) => {
					ctx.observe(globalThis.target, {
						callback: () => globalThis.tmp = true,
						delay: 200,
						group: 'test'
					});

					setTimeout(() => ctx.suspend('test'), 0);
				});

				await delay(300);
				expect(await page.evaluate(() => globalThis.tmp)).toBeUndefined();

				await getInView(strategy).evaluate((ctx) => ctx.unsuspend('test'));
				await expectAsync(page.waitForFunction('globalThis.tmp === true')).toBeResolved();
			});

			it('re-observing with an element and threshold provided', async () => {
				await page.evaluate(() => globalThis.tmp = 0);

				await getInView(strategy).evaluate((ctx) => {
					ctx.observe(globalThis.target, {
						callback: () => globalThis.tmp += 1,
						delay: 100,
						threshold: 0.7
					});

					setTimeout(() => ctx.reObserve(globalThis.target, 0.7), 400);
				});

				await expectAsync(page.waitForFunction('globalThis.tmp === 2')).toBeResolved();
			});

			it('re-observing with a group provided', async () => {
				await page.evaluate(() => globalThis.tmp = 0);

				await getInView(strategy).evaluate((ctx) => {
					ctx.observe(globalThis.target, {
						callback: () => globalThis.tmp += 1,
						delay: 100,
						threshold: 0.7,
						group: 'test-group'
					});

					setTimeout(() => ctx.reObserve('test-group'), 400);
				});

				await expectAsync(page.waitForFunction('globalThis.tmp === 2')).toBeResolved();
			});

			it('disconnected element doesn\'t invokes a callback', async () => {
				await page.evaluate(() => globalThis.tmp = 0);

				await getInView(strategy).evaluate((ctx) => {
					ctx.observe(globalThis.target, {
						callback: () => globalThis.tmp = 1,
						delay: 100,
						threshold: 0.7,
						group: 'test-group'
					});

					globalThis.target.remove();

					return new Promise((res) => setTimeout(res, 300));
				});

				expect(await page.evaluate(() => globalThis.tmp)).toBe(0);
			});
		});
	});
};
