/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import type { JSHandle, Page } from 'playwright';

import type iStaticPage from 'components/super/i-static-page/i-static-page';

import test from 'tests/config/unit/test';

import { BOM } from 'tests/helpers';

import { createInitRouter } from 'components/base/b-router/test/helpers';
import type { EngineName } from 'components/base/b-router/test/interface';

test.describe('<b-router> scroll control', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('with `history` engine', () => {
		generateSpecs('history');
	});

	test.describe('with `in-memory` engine', () => {
		generateSpecs('in-memory');
	});
});

/**
 * Generates common specs for all router engines of "watch" runners
 *
 * @param engineName
 */
function generateSpecs(engineName: EngineName) {
	const initRouter = createInitRouter(engineName);

	let root: JSHandle<iStaticPage>;

	test.beforeEach(async ({page}) => {
		root = await initRouter(page);

		await page.addStyleTag({
			content: '#root-component {height: 3000px;}'
		});
	});

	test('should restore scroll position after the transition', async ({page}) => {
		await scrollBy(page, [0, 500]);

		await test.expect(getScrollPosition(page)).resolves.toEqual([0, 500]);

		await root.evaluate(async ({router}) => {
			// Reset scroll before the transition ends to check scroll restoration
			router?.once('transition', () => {
				// @ts-ignore "instance" behavior is available according to MDN docs
				globalThis.scrollTo({top: 0, left: 0, behavior: 'instant'});
			});

			await router?.push(null, {query: {bla: 1}});
		});

		await test.expect(getScrollPosition(page)).resolves.toEqual([0, 0]);

		await root.evaluate(({router}) => router?.back());
		await BOM.waitForIdleCallback(page);

		await test.expect(getScrollPosition(page)).resolves.toEqual([0, 500]);
	});

	test('should reset scroll position on the hard change', async ({page}) => {
		await scrollBy(page, [0, 500]);

		await test.expect(getScrollPosition(page)).resolves.toEqual([0, 500]);

		await root.evaluate((ctx) => ctx.router?.push('second'));
		await BOM.waitForIdleCallback(page);

		await test.expect(getScrollPosition(page)).resolves.toEqual([0, 0]);
	});

	test('should add scroll position to the current route meta', async ({page}) => {
		await scrollBy(page, [0, 500]);

		await test.expect(getScrollPosition(page)).resolves.toEqual([0, 500]);

		await root.evaluate(({router}) => router?.push(null, {query: {bla: 1}}));
		await root.evaluate(({router}) => router?.back());

		// Check that router.engine route has scroll
		await test.expect(root.evaluate(({router}) => router?.unsafe.engine.route?.meta.scroll))
			.resolves.toEqual({x: 0, y: 500});

		// Check that root component route has scroll
		await test.expect(root.evaluate(({route}) => route?.meta.scroll))
			.resolves.toEqual({x: 0, y: 500});
	});

	/**
	 * Returns scroll position: [x, y]
	 * @param page
	 */
	function getScrollPosition(page: Page): Promise<[number, number]> {
		return page.evaluate(() => {
			const {scrollX, scrollY} = globalThis;
			return [scrollX, scrollY];
		});
	}

	/**
	 * Scrolls page by the specified deltas
	 *
	 * @param page
	 * @param deltas
	 */
	async function scrollBy(page: Page, [x, y]: [number, number]) {
		await page.mouse.wheel(x, y);
		await BOM.waitForIdleCallback(page);
	}
}
