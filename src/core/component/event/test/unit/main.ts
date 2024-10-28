/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import { renderDummy } from 'components/super/i-block/test/helpers';

import type bDummy from 'components/dummies/b-dummy/b-dummy';

test.describe('core/component/event', () => {
	let target: JSHandle<bDummy>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		target = await renderDummy(page);
	});

	test('adding an event handler using the `$on` method should be done using `$async`', async () => {
		const isWrapped = await target.evaluate((ctx) => {
			ctx.unsafe.$on('$onTest', () => {
				// ...
			});

			const {eventListener} = ctx.unsafe.async.Namespaces;
			return Object.get(ctx, `$async.cache.${eventListener}.groups.$onTest`) != null;
		});

		test.expect(isWrapped).toBe(true);
	});

	test('adding an event handler using the `$once` method should be done using `$async`', async () => {
		const isWrapped = await target.evaluate((ctx) => {
			ctx.unsafe.$once('$onTest', () => {
				// ...
			});

			const {eventListener} = ctx.unsafe.async.Namespaces;
			return Object.get(ctx, `$async.cache.${eventListener}.groups.$onTest`) != null;
		});

		test.expect(isWrapped).toBe(true);
	});

	test('the `prepend` flag should indicate the addition of the handler before all others', async () => {
		const scan = await target.evaluate((ctx) => {
			const {
				unsafe
			} = ctx;

			const res: number[] = [];

			unsafe.$on('foo', () => res.push(1));
			unsafe.$on('foo', () => res.push(2), {prepend: true});
			unsafe.$on('foo', () => res.push(3), {prepend: true});

			unsafe.emit('foo');

			return res;
		});

		test.expect(scan).toEqual([3, 2, 1]);
	});

	test.describe('`$off`', () => {
		test('should remove event handlers added with `prepend`', async () => {
			const scan = await target.evaluate((ctx) => {
				const {
					unsafe
				} = ctx;

				const res: number[] = [];

				unsafe.$on('foo', () => res.push(1));

				const cb1 = () => res.push(2);
				unsafe.$on('foo', cb1, {prepend: true});
				unsafe.$off('foo', cb1);

				const cb2 = () => res.push(3);
				unsafe.$on('foo', cb2, {prepend: true});
				unsafe.$off('foo', cb2);

				unsafe.$emit('foo');

				return res;
			});

			test.expect(scan).toEqual([1]);
		});

		test('without a passed callback, all event handlers should be removed', async () => {
			const scan = await target.evaluate((ctx) => {
				const {
					unsafe
				} = ctx;

				const res: number[] = [];

				unsafe.$on('foo', () => res.push(1));
				unsafe.$on('foo', () => res.push(2), {prepend: true});
				unsafe.$on('foo', () => res.push(3), {prepend: true});

				unsafe.$off('foo');
				unsafe.emit('foo');

				return res;
			});

			test.expect(scan).toEqual([]);
		});
	});
});
