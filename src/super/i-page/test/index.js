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
				).toBe('p-v4-dynamic-page1');

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
				).toBe('p-v4-dynamic-page1');
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

			globalThis.renderComponents('p-v4-dynamic-page1', scheme);
		}, attrs);

		return h.component.waitForComponent(page, '#target');
	}
};
