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

	describe('b-checkbox hierarchical groups', () => {
		it('checking the root checkbox', async () => {
			const
				target = await init();

			expect(await target.evaluate(switcher, 'root')).toEqual([
				['root', true, 'true', true],
				['foo', true, 'true', 'foo'],
				['foo2', true, 'true', true],
				['bla', true, 'true', true],
				['bla2', true, 'true', 'bla2'],
				['baz', true, 'true', true]
			]);

			expect(await target.evaluate(switcher, 'root')).toEqual([
				['root', false, 'false', undefined],
				['foo', false, 'false', undefined],
				['foo2', false, 'false', undefined],
				['bla', false, 'false', undefined],
				['bla2', false, 'false', undefined],
				['baz', false, 'false', undefined]
			]);

			function switcher(ctx) {
				ctx.toggle();
				return Array.from(ctx.r.$el.querySelectorAll('.b-checkbox')).map(({component}) => [
					component.id,
					component.isChecked,
					component.mods.checked,
					component.value
				]);
			}
		});

		it('checking the middle-level checkbox', async () => {
			const
				target = await init();

			expect(await target.evaluate(switcher, 'foo')).toEqual([
				['root', false, 'indeterminate', undefined],
				['foo', true, 'true', 'foo'],
				['foo2', false, 'false', undefined],
				['bla', true, 'true', true],
				['bla2', true, 'true', 'bla2'],
				['baz', false, 'false', undefined]
			]);

			expect(await target.evaluate(switcher, 'foo')).toEqual([
				['root', false, 'false', undefined],
				['foo', false, 'false', undefined],
				['foo2', false, 'false', undefined],
				['bla', false, 'false', undefined],
				['bla2', false, 'false', undefined],
				['baz', false, 'false', undefined]
			]);

			function switcher(ctx) {
				const {$el} = ctx.r;
				$el.querySelector('[data-id="foo"]').component.toggle();

				return Array.from($el.querySelectorAll('.b-checkbox')).map(({component}) => [
					component.id,
					component.isChecked,
					component.mods.checked,
					component.value
				]);
			}
		});

		it('checking different checkboxes', async () => {
			const
				target = await init();

			expect(await target.evaluate(switcher, 'bla')).toEqual([
				['root', false, 'indeterminate', undefined],
				['foo', false, 'indeterminate', undefined],
				['foo2', false, 'false', undefined],
				['bla', true, 'true', true],
				['bla2', false, 'false', undefined],
				['baz', false, 'false', undefined]
			]);

			expect(await target.evaluate(switcher, 'foo')).toEqual([
				['root', false, 'indeterminate', undefined],
				['foo', true, 'true', 'foo'],
				['foo2', false, 'false', undefined],
				['bla', true, 'true', true],
				['bla2', true, 'true', 'bla2'],
				['baz', false, 'false', undefined]
			]);

			expect(await target.evaluate(switcher, 'root')).toEqual([
				['root', true, 'true', true],
				['foo', true, 'true', 'foo'],
				['foo2', true, 'true', true],
				['bla', true, 'true', true],
				['bla2', true, 'true', 'bla2'],
				['baz', true, 'true', true]
			]);
		});

		async function init(attrs = {}) {
			await page.evaluate(() => {
				const scheme = [
					{
						attrs: {
							'data-id': 'root',
							id: 'root'
						}
					},

					{
						attrs: {
							'data-id': 'foo',

							id: 'foo',
							parentId: 'root',

							name: 'lvl2',
							value: 'foo'
						}
					},

					{
						attrs: {
							'data-id': 'foo2',

							id: 'foo2',
							parentId: 'root',

							name: 'lvl2'
						}
					},

					{
						attrs: {
							'data-id': 'bla',

							id: 'bla',
							parentId: 'foo',

							name: 'lvl3-foo'
						}
					},

					{
						attrs: {
							'data-id': 'bla2',

							id: 'bla2',
							parentId: 'foo',

							name: 'lvl3-foo',
							value: 'bla2'
						}
					},

					{
						attrs: {
							'data-id': 'baz',

							id: 'baz',
							parentId: 'foo2',

							name: 'lvl3-foo2'
						}
					}
				];

				globalThis.renderComponents('b-checkbox', scheme);
			}, attrs);

			return h.component.waitForComponent(page, '[data-id="root"]');
		}

		function switcher(ctx, id) {
			const {$el} = ctx.r;
			$el.querySelector(`[data-id="${id}"]`).component.toggle();

			return Array.from($el.querySelectorAll('.b-checkbox')).map(({component}) => [
				component.id,
				component.isChecked,
				component.mods.checked,
				component.value
			]);
		}
	});
};
