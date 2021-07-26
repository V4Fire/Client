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

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('i-block base decorators', () => {
		it('checking the initial values', async () => {
			const
				target = await init();

			const scan = await target.evaluate((ctx) => ({
				i: ctx.i,
				j: ctx.j,
				tmp: Object.fastClone(ctx.tmp)
			}));

			expect(scan).toEqual({
				i: 7,
				j: 1,

				tmp: {
					someChanges: [
						['created', 0, 1],
						['created', 0, 1],
						['created', 3, 1],
						['created', 6, 1],
						['created', 7, 1],
						['created', 7, 1],
						['mounted', 7, 1]
					],

					changes: [
						[7, 6, ['i']],
						[null, null, null],
						['boom!', null, null]
					]
				}
			});
		});
	});

	async function init(attrs = {}) {
		await page.evaluate((attrs = {}) => {
			const scheme = [
				{
					attrs: {
						id: 'target',
						...attrs
					}
				}
			];

			globalThis.renderComponents('b-dummy-decorators', scheme);
		}, attrs);

		return h.component.waitForComponent(page, '#target');
	}
};
