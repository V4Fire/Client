/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';

import type bSuperIBlockDeactivationDummy from 'components/super/i-block/test/b-super-i-block-deactivation-dummy/b-super-i-block-deactivation-dummy';
import type { ComponentElement } from 'core/component';

test.describe('<i-block> component deactivation', () => {
	let
		target: JSHandle<bSuperIBlockDeactivationDummy>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		target = await Component.createComponent<bSuperIBlockDeactivationDummy>(page, 'b-super-i-block-deactivation-dummy');
	});

	test.describe('when parent component is deactivated', () => {
		test('children button should be deactivated', async () => {
			const state = await target.evaluate((ctx) => {
				ctx.deactivate();
				return ctx.unsafe.$refs.button1.hook;
			});

			test.expect(state).toBe('deactivated');
		});

		test('button on teleported component should be deactivated', async () => {
			const state = await target.evaluate((ctx) => {
				ctx.deactivate();
				return ctx.unsafe.$refs.button2.hook;
			});

			test.expect(state).toBe('deactivated');
		});

		test('dynamic child of component should be deactivated', async () => {

			const result = await target.evaluate((ctx) => {
				const vnode = ctx.vdom.create('b-radio-button');

				const node: ComponentElement = Object.cast(ctx.vdom.render(vnode));
				ctx.deactivate();

				return node.component?.hook;
			});

			test.expect(result).toBe('deactivated');
		});
	});
});
