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

	describe('i-block watch API with mounted objects', () => {
		it('non-deep watching', async () => {
			const
				target = await init();

			const scan = await target.evaluate(async (ctx) => {
				const res = [];

				ctx.watch('mountedArrayWatcher', (val, ...args) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(args[0]),
						args[1].path,
						args[1].originalPath
					]);
				});

				ctx.mountedArrayWatcher.push(1);
				ctx.mountedArrayWatcher.push(2);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.push(3);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.pop();
				ctx.mountedArrayWatcher.shift();
				await ctx.nextTick();

				return res;
			});

			expect(scan).toEqual([
				[
					[1, 2],
					[1, 2],
					['mountedArrayWatcher'],
					['mountedArrayWatcher']
				],

				[
					[1, 2, 3],
					[1, 2, 3],
					['mountedArrayWatcher'],
					['mountedArrayWatcher']
				],

				[
					[2],
					[2],
					['mountedArrayWatcher'],
					['mountedArrayWatcher']
				]
			]);
		});

		it('non-deep watching without collapsing', async () => {
			const
				target = await init();

			const scan = await target.evaluate(async (ctx) => {
				const res = [];

				ctx.watch('mountedArrayWatcher', {collapse: false}, (mutations) => {
					mutations.forEach(([val, oldVal, i]) => {
						res.push([
							Object.fastClone(val),
							Object.fastClone(oldVal),
							i.path,
							i.originalPath
						]);
					});
				});

				ctx.mountedArrayWatcher.push(1);
				ctx.mountedArrayWatcher.push(2);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.push(3);
				await ctx.nextTick();

				ctx.mountedArrayWatcher.pop();
				ctx.mountedArrayWatcher.shift();
				await ctx.nextTick();

				return res;
			});

			expect(scan).toEqual([
				[
					1,
					undefined,
					['mountedArrayWatcher', 0],
					['mountedArrayWatcher', 0]
				],

				[
					2,
					undefined,
					['mountedArrayWatcher', 1],
					['mountedArrayWatcher', 1]
				],

				[
					3,
					undefined,
					['mountedArrayWatcher', 2],
					['mountedArrayWatcher', 2]
				],

				[
					2,
					3,
					['mountedArrayWatcher', 'length'],
					['mountedArrayWatcher', 'length']
				],

				[
					2,
					1,
					['mountedArrayWatcher', 0],
					['mountedArrayWatcher', 0]
				],

				[
					1,
					2,
					['mountedArrayWatcher', 'length'],
					['mountedArrayWatcher', 'length']
				]
			]);
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

			globalThis.renderComponents('b-dummy-watch', scheme);
		}, attrs);

		return h.component.waitForComponent(page, '#target');
	}
};
