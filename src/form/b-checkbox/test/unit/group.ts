/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

import test from 'tests/config/unit/test';

import Component from 'tests/helpers/component';

import type { ComponentElement } from 'core/component';

import type bCheckbox from 'form/b-checkbox/b-checkbox';

test.describe('b-checkbox hierarchical groups', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('checking the root checkbox', async ({page}) => {
		const
			target = await init(page);

		test.expect(await target.evaluate(switcher, 'root')).toEqual([
			['root', true, 'true', true],
			['foo', true, 'true', 'foo'],
			['foo2', true, 'true', true],
			['bla', true, 'true', true],
			['bla2', true, 'true', 'bla2'],
			['baz', true, 'true', true]
		]);

		test.expect(await target.evaluate(switcher, 'root')).toEqual([
			['root', false, 'false', undefined],
			['foo', false, 'false', undefined],
			['foo2', false, 'false', undefined],
			['bla', false, 'false', undefined],
			['bla2', false, 'false', undefined],
			['baz', false, 'false', undefined]
		]);
	});

	test('checking the middle-level checkbox', async ({page}) => {
		const
			target = await init(page);

		test.expect(await target.evaluate(switcher, 'foo')).toEqual([
			['root', false, 'indeterminate', undefined],
			['foo', true, 'true', 'foo'],
			['foo2', false, 'false', undefined],
			['bla', true, 'true', true],
			['bla2', true, 'true', 'bla2'],
			['baz', false, 'false', undefined]
		]);

		test.expect(await target.evaluate(switcher, 'foo')).toEqual([
			['root', false, 'false', undefined],
			['foo', false, 'false', undefined],
			['foo2', false, 'false', undefined],
			['bla', false, 'false', undefined],
			['bla2', false, 'false', undefined],
			['baz', false, 'false', undefined]
		]);
	});

	test('checking different checkboxes', async ({page}) => {
		const
			target = await init(page);

		test.expect(await target.evaluate(switcher, 'bla')).toEqual([
			['root', false, 'indeterminate', undefined],
			['foo', false, 'indeterminate', undefined],
			['foo2', false, 'false', undefined],
			['bla', true, 'true', true],
			['bla2', false, 'false', undefined],
			['baz', false, 'false', undefined]
		]);

		test.expect(await target.evaluate(switcher, 'foo')).toEqual([
			['root', false, 'indeterminate', undefined],
			['foo', true, 'true', 'foo'],
			['foo2', false, 'false', undefined],
			['bla', true, 'true', true],
			['bla2', true, 'true', 'bla2'],
			['baz', false, 'false', undefined]
		]);

		test.expect(await target.evaluate(switcher, 'root')).toEqual([
			['root', true, 'true', true],
			['foo', true, 'true', 'foo'],
			['foo2', true, 'true', true],
			['bla', true, 'true', true],
			['bla2', true, 'true', 'bla2'],
			['baz', true, 'true', true]
		]);
	});

	/**
	 * @param page
	 */
	async function init(page: Page) {
		await Component.createComponents(page, 'b-checkbox', [
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
		]);

		return Component.waitForComponentByQuery(page, '[data-id="root"]');
	}

	/**
	 * @param ctx
	 * @param id
	 */
	function switcher(ctx: bCheckbox, id: string = 'foo'): Array<[string | undefined, boolean, string | undefined, boolean | string | undefined]> {
		const {$el} = ctx.r;

		(<ComponentElement<bCheckbox>>$el!.querySelector(`[data-id="${id}"]`)).component?.toggle();

		const
			els = Array.from<Required<ComponentElement<bCheckbox>>>($el!.querySelectorAll('.b-checkbox'));

		return els.map(({component}) => [
			component.id,
			component.isChecked,
			component.mods.checked,
			<string | boolean | undefined>component.value
		]);
	}
});
