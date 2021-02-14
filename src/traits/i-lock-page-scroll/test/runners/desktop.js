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
	h = include('tests/helpers');

/**
 * @param {Page} page
 */
module.exports = (page) => {
	describe('i-lock-page-scroll desktop', () => {
		let
			bodyNode,
			dummyComponent;

		const checkPaddingRight = async (res) => {
			const
				paddingRight = await bodyNode.evaluate((ctx) => ctx.style.getPropertyValue('padding-right'));

			expect(paddingRight).toEqual(res);
		};

		const checkRootMod = async (res) => {
			const
				root = await page.$('html'),
				fullModName = 'p-v-4-components-demo-lock-scroll-desktop-true',
				containsMod = await root.evaluate(
					(ctx, mod) => ctx.classList.contains(mod),
					fullModName
				);

			expect(containsMod).toEqual(res);
		};

		const lock = () => dummyComponent.evaluate(async (ctx) => {
			await ctx.lock();
		});

		const lockTwice = () => dummyComponent.evaluate(async (ctx) => {
			await ctx.lock();
			await ctx.lock();
		});

		const unlock = () => dummyComponent.evaluate(async (ctx) => {
			await ctx.unlock();
		});

		const unlockTwice = () => dummyComponent.evaluate(async (ctx) => {
			await ctx.unlock();
			await ctx.unlock();
		});

		beforeEach(async () => {
			await h.utils.reloadAndWaitForIdle(page);

			await page.waitForSelector('#root-component', {timeout: (20).seconds()});
			await h.component.waitForComponent(page, '#root-component');

			bodyNode = await page.$('body');
			dummyComponent = await h.component.waitForComponent(page, '#dummy-component');
		});

		describe('lock', () => {
			it('sets padding-right to body', async () => {
				await page.evaluate(() => {
					const
						body = document.querySelector('body');

					body.style.setProperty('padding-right', '20px');
				});

				const
					scrollBarWidth = await page.evaluate(() => (globalThis.innerWidth - document.body.clientWidth));

				await lock();
				await checkPaddingRight(`${scrollBarWidth}px`);
			});

			it('fast repetitive calls set padding-right to body', async () => {
				await page.evaluate(() => {
					const
						body = document.querySelector('body');

					body.style.setProperty('padding-right', '20px');
				});

				const
					scrollBarWidth = await page.evaluate(() => (globalThis.innerWidth - document.body.clientWidth));

				await lockTwice();
				await checkPaddingRight(`${scrollBarWidth}px`);
			});

			it('sets root mod lockScrollDesktop', async () => {
				await lock();
				await checkRootMod(true);
			});

			it('fast repetitive calls set root mod lockScrollDesktop', async () => {
				await lockTwice();
				await checkRootMod(true);
			});
		});

		describe('unlock', () => {
			it('removes root mod lockScrollDesktop', async () => {
				await lock();
				await checkRootMod(true);

				await unlock();
				await checkRootMod(false);
			});

			it('fast repetitive calls remove root mod lockScrollDesktop', async () => {
				await lock();
				await checkRootMod(true);

				await unlockTwice();
				await checkRootMod(false);
			});

			it('restores body padding-right', async () => {
				const
					paddingRightValue = '20px';

				await page.evaluate(
					(paddingRight) => {
						const
							body = document.querySelector('body');

						body.style.setProperty('padding-right', paddingRight);
					},

					paddingRightValue
				);

				await lock();
				await unlock();
				await checkPaddingRight(paddingRightValue);
			});

			it('fast repetitive calls restore body padding-right', async () => {
				const
					paddingRightValue = '20px';

				await page.evaluate(
					(paddingRight) => {
						const
							body = document.querySelector('body');

						body.style.setProperty('padding-right', paddingRight);
					},

					paddingRightValue
				);

				await lock();
				await unlockTwice();
				await checkPaddingRight(paddingRightValue);
			});

			it('preserves scroll position', async () => {
				const getScrollTop = () =>
					page.evaluate(() => document.documentElement.scrollTop);

				const
					scrollYPosition = 500;

				await page.evaluate(
					(yPos) => {
						document.querySelector('body').style.setProperty('height', '5000px');
						globalThis.scrollTo(0, yPos);
					},

					scrollYPosition
				);

				await expect(await getScrollTop()).toEqual(scrollYPosition);

				await lock();
				await unlock();
				await expect(await getScrollTop()).toEqual(scrollYPosition);
			});
		});
	});
};
