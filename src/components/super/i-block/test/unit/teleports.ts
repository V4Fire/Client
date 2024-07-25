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

import type bSuperIBlockTeleportDummy from 'components/super/i-block/test/b-super-i-block-teleport-dummy/b-super-i-block-teleport-dummy';

test.describe('<i-block> using the root teleport', () => {
	let target: JSHandle<bSuperIBlockTeleportDummy>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		target = await Component.createComponent<bSuperIBlockTeleportDummy>(page, 'b-super-i-block-teleport-dummy');
	});

	test('the reference `$el` should be equal to the reference `$refs.$el`', async () => {
		const res = await target.evaluate((ctx) => {
			const {component: {unsafe: component}} = ctx.unsafe.$refs;
			return component.$refs[component.$resolveRef('$el')] === component.$el;
		});

		test.expect(res).toBe(true);
	});

	test('the root node should have a reference to a component instance', async () => {
		const componentName = await target.evaluate((ctx) =>
			ctx.unsafe.$refs.component.$el!.component!.componentName);

		test.expect(componentName).toBe('b-bottom-slide');
	});

	test('the node must have the correct class name', async () => {
		const attrs = await target.evaluate((ctx) =>
			ctx.unsafe.$refs.component.$el!.className);

		test.expect(attrs).toBe('i-block-helper u3b379f9a91182 b-bottom-slide b-bottom-slide_opened_false b-bottom-slide_stick_true b-bottom-slide_events_false b-bottom-slide_height-mode_full b-bottom-slide_visible_false b-bottom-slide_theme_light b-bottom-slide_hidden_true');
	});
});
