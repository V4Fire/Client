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

test.describe('<i-block> modules - opt', () => {
	let target: JSHandle<bDummy>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		target = await renderDummy(page);
	});

	test.describe('`ifOnce`', () => {
		test('should return `0` if the condition was not met', async () => {
			const testVal = await target.evaluate((ctx) =>
				ctx.unsafe.opt.ifOnce('progress', false));

			test.expect(testVal).toBe(0);
		});

		test('should return `1` if the condition was met for the first time', async () => {
			const testVal = await target.evaluate((ctx) =>
				ctx.unsafe.opt.ifOnce('progress', true));

			test.expect(testVal).toBe(1);
		});

		test('should return `2` if the condition was already met', async () => {
			const testVal = await target.evaluate((ctx) => {
				ctx.unsafe.opt.ifOnce('progress', true);
				return ctx.unsafe.opt.ifOnce('progress', true);
			});

			test.expect(testVal).toBe(2);
		});
	});
});
