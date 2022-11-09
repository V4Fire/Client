/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

import type * as DOM from 'components/friends/dom';

import type { ComponentElement } from 'core/component';
import type bCheckbox from 'components/form/b-checkbox/b-checkbox';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';
import Utils from 'tests/helpers/utils';

test.describe('<b-checkbox> hierarchical groups', () => {
	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		const DOMAPI = await Utils.import<typeof DOM>(page, 'components/friends/dom');
		await DOMAPI.evaluate((ctx) => ctx.default.addToPrototype(ctx));
	});

	test('clicking on the root checkbox should select or deselect all checkboxes in the group', async ({page}) => {
		const
			root = await renderCheckboxes(page);

		test.expect(await root.evaluate(switcher, 'root')).toEqual([
			['root', true, 'true', true],
			['foo', true, 'true', 'foo'],
			['foo2', true, 'true', true],
			['bla', true, 'true', true],
			['bla2', true, 'true', 'bla2'],
			['baz', true, 'true', true]
		]);

		test.expect(await root.evaluate(switcher, 'root')).toEqual([
			['root', false, 'false', undefined],
			['foo', false, 'false', undefined],
			['foo2', false, 'false', undefined],
			['bla', false, 'false', undefined],
			['bla2', false, 'false', undefined],
			['baz', false, 'false', undefined]
		]);
	});

	test('clicking on the middle checkbox should select or deselect all nested checkboxes', async ({page}) => {
		const
			root = await renderCheckboxes(page);

		test.expect(await root.evaluate(switcher, 'foo')).toEqual([
			['root', false, 'indeterminate', undefined],
			['foo', true, 'true', 'foo'],
			['foo2', false, 'false', undefined],
			['bla', true, 'true', true],
			['bla2', true, 'true', 'bla2'],
			['baz', false, 'false', undefined]
		]);

		test.expect(await root.evaluate(switcher, 'foo')).toEqual([
			['root', false, 'false', undefined],
			['foo', false, 'false', undefined],
			['foo2', false, 'false', undefined],
			['bla', false, 'false', undefined],
			['bla2', false, 'false', undefined],
			['baz', false, 'false', undefined]
		]);
	});

	test('clicking on different checkboxes', async ({page}) => {
		const
			target = await renderCheckboxes(page);

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

	/** @param page */
	async function renderCheckboxes(page: Page) {
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
	function switcher(ctx: bCheckbox, id: string = 'foo'): Array<[CanUndef<string>, boolean, CanUndef<string>, CanUndef<boolean | string>]> {
		const $el = ctx.r.$el!;
		(<ComponentElement<bCheckbox>>$el.querySelector(`[data-id="${id}"]`)).component?.toggle();

		const
			els = Array.from<Required<ComponentElement<bCheckbox>>>($el.querySelectorAll('.b-checkbox'));

		return els.map(({component}) => [
			component.id,
			component.isChecked,
			component.mods.checked,
			<CanUndef<boolean | string>>component.value
		]);
	}
});
