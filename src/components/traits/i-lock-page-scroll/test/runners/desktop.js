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
	h = include('tests/helpers').default;

/** @param {Page} page */
module.exports = (page) => {
	describe('i-lock-page-scroll desktop', () => {
		let
			bodyNode,
			dummyComponent;

		beforeEach(async () => {
			await h.utils.reloadAndWaitForIdle(page);

			bodyNode = await page.$('body');
			dummyComponent = await h.component.waitForComponent(page, '#dummy-component');
		});

		describe('lock', () => {
			it('sets `padding-right` to the body', async () => {
				await page.evaluate(() => {
					const body = document.querySelector('body');
					body.style.setProperty('padding-right', '20px');
				});

				const
					scrollBarWidth = await page.evaluate(() => (globalThis.innerWidth - document.body.clientWidth));

				await lock();
				await checkPaddingRight(`${scrollBarWidth}px`);
			});

			it('fast repetitive calls to set `padding-right` to the body', async () => {
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

			it('sets the `lockScrollDesktop` root modifier', async () => {
				await lock();
				await checkRootMod(true);
			});

			it('fast repetitive calls to set the `lockScrollDesktop` root modifier', async () => {
				await lockTwice();
				await checkRootMod(true);
			});
		});

		describe('unlock', () => {
			it('removes the `lockScrollDesktop` root modifier', async () => {
				await lock();
				await checkRootMod(true);

				await unlock();
				await checkRootMod(false);
			});

			it('fast repetitive calls to remove the `lockScrollDesktop` root modifier', async () => {
				await lock();
				await checkRootMod(true);

				await unlockTwice();
				await checkRootMod(false);
			});

			it('restores `padding-right` of the body', async () => {
				const
					paddingRightValue = '20px';

				await page.evaluate(
					(paddingRight) => {
						const body = document.querySelector('body');
						body.style.setProperty('padding-right', paddingRight);
					},

					paddingRightValue
				);

				await lock();
				await unlock();
				await checkPaddingRight(paddingRightValue);
			});

			it('fast repetitive calls to restore `padding-right` of the body', async () => {
				const
					paddingRightValue = '20px';

				await page.evaluate(
					(paddingRight) => {
						const body = document.querySelector('body');
						body.style.setProperty('padding-right', paddingRight);
					},

					paddingRightValue
				);

				await lock();
				await unlockTwice();
				await checkPaddingRight(paddingRightValue);
			});

			it('preserves a scroll position', async () => {
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

		async function checkPaddingRight(res) {
			const paddingRight = await bodyNode.evaluate((ctx) => ctx.style.getPropertyValue('padding-right'));
			expect(paddingRight).toEqual(res);
		}

		async function checkRootMod(res) {
			const
				root = await page.$('html'),
				fullModName = 'p-v4-components-demo-lock-scroll-desktop-true';

			const containsMod = await root.evaluate(
				(ctx, mod) => ctx.classList.contains(mod),
				fullModName
			);

			expect(containsMod).toEqual(res);
		}

		function lock() {
			return dummyComponent.evaluate(async (ctx) => {
				await ctx.lock();
			});
		}

		function lockTwice() {
			return dummyComponent.evaluate(async (ctx) => {
				await ctx.lock();
				await ctx.lock();
			});
		}

		function unlock() {
			return dummyComponent.evaluate(async (ctx) => {
				await ctx.unlock();
			});
		}

		function unlockTwice() {
			return dummyComponent.evaluate(async (ctx) => {
				await ctx.unlock();
				await ctx.unlock();
			});
		}
	});
};
