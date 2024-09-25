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
import { createSpy, SpyObject } from 'tests/helpers/mock';

import type iBlock from 'components/super/i-block/i-block';

test.describe('<i-block> global listeners', () => {
	let dummy: JSHandle<iBlock>;
	let reloadSpy: SpyObject;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		dummy = await Component.createComponent(page, 'b-dummy');
		reloadSpy = await createSpy(dummy, (ctx) => jestMock.spy(ctx, 'reload'));

		// @ts-ignore (unsafe)
		await dummy.evaluate((ctx) => ctx.initGlobalEvents(true));
	});

	test('the reload method should be invoked on the next tick following the emission of the `reset.load.silence` event', async () => {
		await dummy.evaluate((ctx) => ctx.unsafe.globalEmitter.emit('reset.load.silence'));
		await dummy.evaluate((ctx) => ctx.nextTick());
		await test.expect(reloadSpy.callsCount).toBeResolvedTo(1);
	});

	test([
		'the reload method should not be invoked on the next tick after the `reset.load.silence` event is emitted',
		'if the component has been destroyed'
	].join(' '), async () => {
		const nextTick = dummy.evaluate((ctx) => ctx.nextTick());

		await dummy.evaluate((ctx) => {
			ctx.unsafe.globalEmitter.emit('reset.load.silence');

			// Using a callback to synchronously destroy the component
			ctx.nextTick(() => {
				ctx.unsafe.$destroy();
			});
		});

		await nextTick;
		await test.expect(reloadSpy.callsCount).toBeResolvedTo(0);
	});
});
