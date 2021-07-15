/* eslint-disable max-lines */

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

	describe('i-block watch API updating templates on changes', () => {
		it('updating a root level field should force rendering', async () => {
			const
				target = await init();

			const scan = await target.evaluate(async (ctx) => {
				const
					el = ctx.block.element('complex-obj-store'),
					res = [el.textContent];

				ctx.complexObjStore = {a: 1};
				await ctx.nextTick();
				res.push(el.textContent);

				return res;
			});

			expect(scan).toEqual([
				'{"a":{"b":{"c":1,"d":2}}}',
				'{"a":1}'
			]);
		});

		it('updating a field should force rendering', async () => {
			const
				target = await init();

			const scan = await target.evaluate(async (ctx) => {
				const
					el = ctx.block.element('complex-obj-store'),
					res = [el.textContent];

				ctx.complexObjStore.a.b.c++;
				await ctx.nextTick();
				res.push(el.textContent);

				return res;
			});

			expect(scan).toEqual([
				'{"a":{"b":{"c":1,"d":2}}}',
				'{"a":{"b":{"c":2,"d":2}}}'
			]);
		});

		it('updating a field should invalidate cache of the tied computed', async () => {
			const
				target = await init();

			{
				const scan = await target.evaluate(async (ctx) => {
					const
						el = ctx.block.element('complex-obj'),
						res = [el.textContent];

					ctx.complexObjStore.a.b.c++;
					await ctx.nextTick();
					res.push(el.textContent);

					return res;
				});

				expect(scan).toEqual([
					'{"a":{"b":{"c":1,"d":2}}}',
					'{"a":{"b":{"c":2,"d":2}}}'
				]);
			}

			{
				const scan = await target.evaluate(async (ctx) => {
					const
						el = ctx.block.element('cached-complex-obj'),
						res = [el.textContent];

					ctx.complexObjStore.a.b.c++;
					await ctx.nextTick();
					res.push(el.textContent);

					return res;
				});

				expect(scan).toEqual([
					'{"a":{"b":{"c":2,"d":2}}}',
					'{"a":{"b":{"c":3,"d":2}}}'
				]);
			}
		});

		it('updating a Set field should force rendering', async () => {
			const
				target = await init();

			const scan = await target.evaluate(async (ctx) => {
				const
					el = ctx.block.element('set-field'),
					res = [el.textContent];

				ctx.setField.add('bla');
				await ctx.nextTick();
				res.push(el.textContent);

				return res;
			});

			expect(scan).toEqual([
				'[]',
				'["bla"]'
			]);
		});

		it('updating a Set field should force rendering of another component', async () => {
			const
				target = await init();

			const scan = await target.evaluate(async (ctx) => {
				const
					el = ctx.block.element('component-with-slot'),
					res = [el.textContent.trim()];

				ctx.setField.add('bla');
				await ctx.nextTick();
				res.push(el.textContent.trim());

				return res;
			});

			expect(scan).toEqual([
				'[]',
				'["bla"]'
			]);
		});

		it("updating a system field shouldn't force rendering", async () => {
			const
				target = await init();

			const scan = await target.evaluate(async (ctx) => {
				const
					el = ctx.block.element('system-complex-obj-store'),
					res = [el.textContent];

				ctx.systemComplexObjStore.a.b.c++;
				await ctx.nextTick();
				res.push(el.textContent);

				return res;
			});

			expect(scan).toEqual([
				'{"a":{"b":{"c":1,"d":2}}}',
				'{"a":{"b":{"c":1,"d":2}}}'
			]);
		});

		it('updating a watchable modifier should force rendering', async () => {
			const
				target = await init();

			const scan = await target.evaluate(async (ctx) => {
				const
					el = ctx.block.element('watchable-mod'),
					res = [[el.textContent, ctx.mods.watchable, ctx.block.getMod('watchable')]];

				ctx.setMod('watchable', 'val-1');
				await ctx.nextTick();
				res.push([el.textContent, ctx.mods.watchable, ctx.block.getMod('watchable')]);

				ctx.setMod('watchable', 'val-2');
				await ctx.nextTick();
				res.push([el.textContent, ctx.mods.watchable, ctx.block.getMod('watchable')]);

				ctx.removeMod('watchable');
				await ctx.nextTick();
				res.push([el.textContent, ctx.mods.watchable, ctx.block.getMod('watchable')]);

				return res;
			});

			expect(scan).toEqual([
				['', undefined, undefined],
				['val-1', 'val-1', 'val-1'],
				['val-2', 'val-2', 'val-2'],
				['', undefined, undefined]
			]);
		});

		it('updating a field and watchable modifier should force rendering', async () => {
			const
				target = await init();

			const scan = await target.evaluate(async (ctx) => {
				ctx.complexObjStore.a.b.c++;

				const
					el = ctx.block.element('watchable-mod'),
					res = [el.textContent];

				ctx.setMod('watchable', 'val1');
				await ctx.nextTick();
				res.push(el.textContent);

				ctx.setMod('watchable', 'val-2');
				await ctx.nextTick();
				res.push(el.textContent);

				return res;
			});

			expect(scan).toEqual([
				'',
				'val-1',
				'val-2'
			]);
		});

		it("updating a modifier shouldn't force rendering", async () => {
			const
				target = await init();

			const scan = await target.evaluate(async (ctx) => {
				const
					el = ctx.block.element('non-watchable-mod'),
					res = [[el.textContent, ctx.mods.nonWatchable, ctx.block.getMod('nonWatchable')]];

				ctx.setMod('nonWatchable', 'val2');
				await ctx.nextTick();
				res.push([el.textContent, ctx.mods.nonWatchable, ctx.block.getMod('nonWatchable')]);

				ctx.removeMod('non-watchable');
				await ctx.nextTick();
				res.push([el.textContent, ctx.mods.nonWatchable, ctx.block.getMod('nonWatchable')]);

				ctx.forceUpdate();
				await ctx.nextTick();
				res.push([el.textContent, ctx.mods.nonWatchable, ctx.block.getMod('nonWatchable')]);

				return res;
			});

			expect(scan).toEqual([
				['val-1', 'val-1', 'val-1'],
				['val-1', 'val-2', 'val-2'],
				['val-1', undefined, undefined],
				['', undefined, undefined]
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
