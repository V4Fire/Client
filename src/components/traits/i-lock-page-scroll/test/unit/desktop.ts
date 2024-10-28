/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import type bTraitsILockPageScrollDummy from 'components/traits/i-lock-page-scroll/test/b-traits-i-lock-page-scroll-dummy/b-traits-i-lock-page-scroll-dummy';

test.describe('components/traits/i-lock-page-scroll - desktop', () => {
	let target: JSHandle<bTraitsILockPageScrollDummy>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await Component.waitForComponentTemplate(page, 'b-traits-i-lock-page-scroll-dummy');
		target = await Component.createComponent(page, 'b-traits-i-lock-page-scroll-dummy');
	});

	test.describe('lock', () => {
		test.describe('should set the body `padding-right` equal to the scrollbar width', () => {
			let scrollBarWidth: number;

			test.beforeEach(async ({page}) => {
				await page.evaluate(() => {
					const body = document.querySelector('body');
					body!.style.setProperty('padding-right', '20px');
				});

				scrollBarWidth = await page.evaluate(() =>
					(globalThis.innerWidth - document.body.clientWidth));
			});

			test('when called once', async ({page}) => {
				await lock();
				await assertBodyPaddingRightIs(page, `${scrollBarWidth}px`);
			});

			test('when called repetitive more than once', async ({page}) => {
				await lockTwice();
				await assertBodyPaddingRightIs(page, `${scrollBarWidth}px`);
			});
		});

		test('should add the `lock-page-scroll-desktop` modifier to the root element', async ({page}) => {
			await lock();
			await assertRootLockPageScrollModIs(page, true);
		});

		test('fast repetitive calls should add the `lock-page-scroll-desktop` modifier to the root element', async ({page}) => {
			await lockTwice();
			await assertRootLockPageScrollModIs(page, true);
		});
	});

	test.describe('unlock', () => {
		test.describe('should remove the `lock-page-scroll-desktop` modifier from the root element', () => {
			test('when the `unlockPageScroll` method called', async ({page}) => {
				await lock();
				await assertRootLockPageScrollModIs(page, true);

				await unlock();
				await assertRootLockPageScrollModIs(page, false);
			});

			test('when the component is destroyed', async ({page}) => {
				await lock();
				await assertRootLockPageScrollModIs(page, true);

				await target.evaluate((ctx) => ctx.unsafe.$destroy());
				await assertRootLockPageScrollModIs(page, false);
			});
		});

		test('fast repetitive calls should remove the `lock-page-scroll-desktop` modifier from the root element', async ({page}) => {
			await lock();
			await assertRootLockPageScrollModIs(page, true);

			await unlockTwice();
			await assertRootLockPageScrollModIs(page, false);
		});

		test.describe('should restore the `padding-right` of the body', () => {
			const paddingRightValue = '20px';

			test.beforeEach(async ({page}) => {
				await page.evaluate(
					(paddingRight) => {
						const body = document.querySelector('body');
						body!.style.setProperty('padding-right', paddingRight);
					},

					paddingRightValue
				);
			});

			test('when called once', async ({page}) => {
				await lock();
				await unlock();
				await assertBodyPaddingRightIs(page, paddingRightValue);
			});

			test('when called repetitive more than once', async ({page}) => {
				await lock();
				await unlockTwice();
				await assertBodyPaddingRightIs(page, paddingRightValue);
			});
		});

		test('should preserve a scroll position', async ({page}) => {
			const getScrollTop = () =>
				page.evaluate(() => document.documentElement.scrollTop);

			const
				scrollYPosition = 500;

			await page.evaluate(
				(yPos) => {
					document.querySelector('body')!.style.setProperty('height', '5000px');
					globalThis.scrollTo(0, yPos);
				},

				scrollYPosition
			);

			await test.expect(getScrollTop()).resolves.toEqual(scrollYPosition);

			await lock();
			await unlock();
			await test.expect(getScrollTop()).resolves.toEqual(scrollYPosition);
		});
	});

	async function assertBodyPaddingRightIs(page: Page, expected: string) {
		await test.expect(page.locator('body')).toHaveCSS('padding-right', expected);
	}

	async function assertRootLockPageScrollModIs(page: Page, expected: boolean) {
		const
			lockClassName = /lock-page-scroll-desktop-true/;

		if (expected) {
			await test.expect(page.locator(':root')).toHaveClass(lockClassName);

		} else {
			await test.expect(page.locator(':root')).not.toHaveClass(lockClassName);
		}
	}

	function lock() {
		return target.evaluate(async (ctx) => {
			await ctx.lockPageScroll();
		});
	}

	function lockTwice() {
		return target.evaluate(async (ctx) => {
			await ctx.lockPageScroll();
			await ctx.lockPageScroll();
		});
	}

	function unlock() {
		return target.evaluate(async (ctx) => {
			await ctx.unlockPageScroll();
		});
	}

	function unlockTwice() {
		return target.evaluate(async (ctx) => {
			await ctx.unlockPageScroll();
			await ctx.unlockPageScroll();
		});
	}
});
