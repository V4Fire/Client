/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderWatchDummy } from 'components/super/i-block/test/helpers';

test.describe('<i-block> watch - events', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should watch for a document events', async ({page}) => {
		const target = await renderWatchDummy(page);

		const scan = await target.evaluate((ctx) => {
			const res: any[] = [];

			ctx.watch('document.body:click', (e) => {
				res.push(e.target === document.body);
			});

			for (let i = 1; i <= 3; i++) {
				document.body.click();
			}

			return res;
		});

		test.expect(scan).toEqual(Array(3).fill(true));
	});

	test('should watch for a component events', async ({page}) => {
		const target = await renderWatchDummy(page);

		const scan = await target.evaluate((ctx) => {
			const res: any[] = [];

			ctx.watch('localEmitter:foo', (...args) => {
				res.push(...args);
			});

			ctx.unsafe.localEmitter.emit('foo', 1, 2);
			ctx.unsafe.localEmitter.emit('foo', 3, 4);
			ctx.unsafe.localEmitter.emit('foo', 5, 6);

			return res;
		});

		test.expect(scan).toEqual([1, 2, 3, 4, 5, 6]);
	});
});
