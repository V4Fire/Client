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
 * Starts a test
 *
 * @param {Page} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('i-page', () => {
		describe('page title', () => {
			it('providing `pageTitleProp`', async () => {
				const target = await init({
					pageTitleProp: 'BazBar'
				});

				expect(await target.evaluate((ctx) => ctx.pageTitle)).toBe('BazBar');
				expect(await target.evaluate((ctx) => ctx.r.pageTitle)).toBe('BazBar');
			});

			it('providing `stagePageTitles`', async () => {
				const target = await init({
					stage: 'foo',

					stagePageTitles: {
						'[[DEFAULT]]': 'return (ctx) => ctx.componentName',
						bla: 'bar'
					}
				});

				expect(
					await target.evaluate((ctx) => ctx.pageTitle)
				).toBe('p-v4-dynamic-page-1');

				expect(
					await target.evaluate((ctx) => {
						ctx.stage = 'bla';
						return ctx.pageTitle;
					})
				).toBe('bar');
			});

			it('providing `stagePageTitles` and `pageTitleProp`', async () => {
				const target = await init({
					pageTitleProp: 'BazBar',
					stage: 'foo',

					stagePageTitles: {
						'[[DEFAULT]]': 'return (ctx) => ctx.componentName',
						bla: 'bar'
					}
				});

				expect(
					await target.evaluate((ctx) => ctx.pageTitle)
				).toBe('p-v4-dynamic-page-1');
			});

			it('providing `stagePageTitles` and `pageTitleProp` without [[DEFAULT]]', async () => {
				const target = await init({
					pageTitleProp: 'BazBar',
					stage: 'foo',

					stagePageTitles: {
						bla: 'bar'
					}
				});

				expect(
					await target.evaluate((ctx) => ctx.pageTitle)
				).toBe('BazBar');
			});
		});

		describe('activation/deactivation', () => {
			it('simple usage', async () => {
				const target = await init();

				expect(
					await target.evaluate((ctx) => ctx.isActivated)
				).toBeTrue();

				expect(
					await target.evaluate((ctx) => {
						ctx.deactivate();
						return ctx.isActivated;
					})
				).toBeFalse();

				expect(
					await target.evaluate((ctx) => {
						ctx.activate();
						return ctx.isActivated;
					})
				).toBeTrue();
			});

			it('should set the root attribute', async () => {
				const target = await init();

				expect(
					await target.evaluate((ctx) => ctx.getRootMod('active'))
				).toBe('true');

				expect(
					await target.evaluate((ctx) => {
						ctx.deactivate();
						return ctx.getRootMod('active');
					})
				).toBe('false');

				expect(
					await target.evaluate((ctx) => {
						ctx.activate();
						return ctx.getRootMod('active');
					})
				).toBe('true');
			});
		});

		describe('scrollTo', () => {
			it('should invoke the native `scrollTo`', async () => {
				const target = await init();

				const scan = await target.evaluate((ctx) => {
					const
						res = [],
						originalScrollTo = scrollTo;

					globalThis.scrollTo = (...args) => {
						res.push(args);
						return originalScrollTo(...args);
					};

					ctx.scrollTo({x: 10, y: 15});
					ctx.scrollTo({y: 125});
					ctx.scrollTo(5, 20);
					ctx.scrollTo(15);

					globalThis.scrollTo = scrollTo;
					return res;
				});

				expect(scan).toEqual([
					[{left: 10, top: 15}],
					[{left: undefined, top: 125}],
					[{left: 5, top: 20}],
					[{left: 15, top: undefined}]
				]);
			});

			it('`scrollToProxy`', async () => {
				const target = await init();

				const scan = await target.evaluate(async (ctx) => {
					const
						res = [],
						originalScrollTo = scrollTo;

					globalThis.scrollTo = (...args) => {
						res.push(args);
						return originalScrollTo(...args);
					};

					ctx.scrollToProxy({x: 10, y: 15});
					ctx.scrollToProxy(5, 20);

					await ctx.nextTick();
					ctx.scrollTo(15);

					globalThis.scrollTo = scrollTo;
					return res;
				});

				expect(scan).toEqual([
					[{left: 5, top: 20}],
					[{left: 15, top: undefined}]
				]);
			});
		});
	});

	async function init(attrs = {}) {
		await page.evaluate((attrs) => {
			Object.forEach(attrs.stagePageTitles, (el, key, data) => {
				// eslint-disable-next-line no-new-func
				data[key] = /return /.test(el) ? Function(el)() : el;
			});

			const scheme = [
				{
					attrs: {
						id: 'target',
						...attrs
					}
				}
			];

			globalThis.renderComponents('p-v4-dynamic-page-1', scheme);
		}, attrs);

		return h.component.waitForComponent(page, '#target');
	}
};
