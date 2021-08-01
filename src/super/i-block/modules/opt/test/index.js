// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	h = include('tests/helpers');

/**
 * Starts a test
 *
 * @param {Playwright.Page} page
 * @param {object} params
 * @returns {void}
 */
module.exports = (page, {browser, contextOpts}) => {
	const initialUrl = page.url();

	let
		dummyComponent,
		context;

	describe('`iBlock.opt`', () => {
		beforeEach(async () => {
			context = await browser.newContext(contextOpts);

			page = await context.newPage();
			await page.goto(initialUrl);

			dummyComponent = await h.component.waitForComponent(page, '.b-dummy');
		});

		afterEach(() => context.close());

		describe('`ifOnce`', () => {
			it('returns `0` if the condition was not met', async () => {
				const testVal = await dummyComponent.evaluate((ctx) =>
					ctx.opt.ifOnce('progress', false));

				expect(testVal).toBe(0);
			});

			it('returns `1` if the condition was met for the first time', async () => {
				const testVal = await dummyComponent.evaluate((ctx) =>
					ctx.opt.ifOnce('progress', true));

				expect(testVal).toBe(1);
			});

			it('returns `2` if the condition was met', async () => {
				const testVal = await dummyComponent.evaluate((ctx) => {
					ctx.opt.ifOnce('progress', true);
					return ctx.opt.ifOnce('progress', true);
				});

				expect(testVal).toBe(2);
			});
		});

		describe('`memoizeLiteral`', () => {
			it('freezes the provided object', async () => {
				const [isFrozenObj, isFrozenArr] = await dummyComponent.evaluate((ctx) => [
					Object.isFrozen(ctx.opt.memoizeLiteral({test: 1})),
					Object.isFrozen(ctx.opt.memoizeLiteral([1]))
				]);

				expect(isFrozenObj).toBeTrue();
				expect(isFrozenArr).toBeTrue();
			});

			it('stores an object into the cache', async () => {
				const res = await dummyComponent.evaluate((ctx) => {
					const
						testObj = {test: 1},
						frozenTestObj = ctx.opt.memoizeLiteral(testObj);

					return frozenTestObj === ctx.opt.memoizeLiteral(testObj);
				});

				expect(res).toBeTrue();
			});
		});
	});
};
