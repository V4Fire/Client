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
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-checkbox component events', () => {
		const
			q = '[data-id="target"]';

		it('listening `change` and `actionChange` events', async () => {
			const
				target = await init();

			const scan = await target.evaluate(async (ctx) => {
				const
					wrapper = ctx.block.element('wrapper'),
					res = [];

				ctx.on('onChange', (val) => {
					res.push(['change', val]);
				});

				ctx.on('onActionChange', (val) => {
					res.push(['actionChange', val]);
				});

				wrapper.click();
				await ctx.toggle();
				wrapper.click();

				return res;
			});

			expect(scan).toEqual([
				['change', true],
				['actionChange', true],
				['change', undefined],
				['change', true],
				['actionChange', true]
			]);
		});

		it('listening `check` and `uncheck` events', async () => {
			const
				target = await init();

			const scan = await target.evaluate(async (ctx) => {
				const
					wrapper = ctx.block.element('wrapper'),
					res = [];

				ctx.on('onCheck', (type) => {
					res.push(['check', type]);
				});

				ctx.on('onUncheck', () => {
					res.push('uncheck');
				});

				wrapper.click();
				await ctx.toggle();
				wrapper.click();

				return res;
			});

			expect(scan).toEqual([
				['check', true],
				'uncheck',
				['check', true]
			]);
		});

		it('listening `clear`', async () => {
			const target = await init({
				value: 'foo',
				checked: true
			});

			expect(
				await target.evaluate(async (ctx) => {
					const
						res = [ctx.value];

					ctx.on('onClear', (val) => res.push(val));
					ctx.clear();
					ctx.clear();

					await ctx.nextTick();
					return res;
				})
			).toEqual(['foo', undefined]);
		});

		it('listening `reset`', async () => {
			const target = await init({
				value: 'foo',
				checked: false,
				default: true
			});

			expect(
				await target.evaluate(async (ctx) => {
					const
						res = [ctx.value];

					ctx.on('onReset', (val) => res.push(val));
					ctx.reset();
					ctx.reset();

					await ctx.nextTick();
					return res;
				})
			).toEqual([undefined, 'foo']);
		});

		async function init(attrs = {}) {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							'data-id': 'target',
							...attrs
						}
					}
				];

				globalThis.renderComponents('b-checkbox', scheme);
			}, attrs);

			return h.component.waitForComponent(page, q);
		}
	});
};
