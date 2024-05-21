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

test.describe('<i-block> modules - activation', () => {
	let target: JSHandle<bDummy>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		target = await renderDummy(page);
	});

	test.describe('events', () => {
		// Disabling this test as the component must be deactivated ASAP,
		// which means that no events will be emitted
		// @see https://github.com/V4Fire/Client/issues/1108
		// @see https://github.com/V4Fire/Client/issues/1197
		test.fixme('should emit the `hook:deactivated` event when `deactivate` is invoked', async () => {
			const eventPromise = target.evaluate((ctx) => new Promise((resolve) => {
				ctx.once('hook:deactivated', resolve);
				ctx.deactivate();
			}));

			await test.expect(eventPromise).toBeResolved();
		});

		test('should emit the `hook:activated` event when `activate` is invoked', async () => {
			const eventPromise = target.evaluate((ctx) => new Promise((resolve) => {
				ctx.once('hook:activated', resolve);
				ctx.deactivate();
				ctx.activate();
			}));

			await test.expect(eventPromise).toBeResolved();
		});

		test.describe(
			[
				'added an event handler for deactivated with group :suspend',
				'component was deactivated',
				'component was activated'
			].join(', '),

			() => {
				test('should call the deactivated handler with group `:suspend` before the activated handlers are called', async () => {
					const result = await target.evaluate((ctx) => {
						const result = <string[]>[];

						ctx.on('hook:activated', () => {
							result.push('activated');
						});

						ctx.on('hook:deactivated', () => {
							result.push('deactivated');
						}, {
							group: 'test-deactivation:suspend'
						});

						ctx.deactivate();
						ctx.activate();

						return result;
					});

					test.expect(result).toEqual(['deactivated', 'activated']);
				});
			}
		);
	});
});
