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
