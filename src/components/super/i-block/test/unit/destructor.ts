/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import type { JSHandle } from 'playwright';
import { Component, BOM } from 'tests/helpers';

import type iBlock from 'components/super/i-block/i-block';
import type iStaticPage from 'components/super/i-static-page/i-static-page';

import { renderDestructorDummy } from 'components/super/i-block/test/helpers';

test.describe('<i-block> calling a component\'s destructor', () => {
	let root: JSHandle<iStaticPage>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		root = await Component.waitForRoot<iStaticPage>(page);
	});

	test('the destructors of all components should be implicitly called if they are removed in the template', async ({page}) => {
		const target = await renderDestructorDummy(page);

		await target.evaluate(async (ctx) => {
			ctx.content = false;
			await ctx.nextTick();
		});

		const componentsStatuses = await target.evaluate(
			(ctx) => ctx.store.map((el) => el.hook)
		);

		test.expect(componentsStatuses.every((status) => status === 'destroyed')).toBe(true);
	});

	test(
		'the destructors of external root components should be called implicitly if their descendants have been removed from the template',

		async ({page}) => {
			const target = await renderDestructorDummy(page);

			await target.evaluate(async (ctx) => {
				ctx.content = false;
				await ctx.nextTick();
			});

			// 1 because the test case itself was created using async
			await test.expect(root.evaluate((ctx) => ctx.remoteRootInstances)).resolves.toBe(1);
		}
	);

	test('the destructors of all components should be called implicitly if the `$destroy` method has been invoked on the parent', async ({page}) => {
		const target = await renderDestructorDummy(page);

		const componentsStatuses = await target.evaluate((ctx) => {
			const {store} = ctx;
			ctx.unsafe.$destroy();
			return store.map((el) => el.componentStatus);
		});

		test.expect(componentsStatuses.every((status) => status === 'destroyed')).toBe(true);
	});

	test(
		'the destructors of external root components should be called implicitly if the `$destroy` method has been invoked on the parent',

		async ({page}) => {
			const target = await renderDestructorDummy(page);

			await target.evaluate((ctx) => {
				ctx.unsafe.$destroy();
			});

			// 1 because the test case itself was created using async
			await test.expect(root.evaluate((ctx) => ctx.remoteRootInstances)).resolves.toBe(1);
		}
	);

	test.describe('the destructor should be idempotent', () => {
		test.beforeEach(({consoleTracker}) => {
			consoleTracker.setMessageFilters({
				TypeError: (msg) => msg.args()[3].evaluate((value) => value?.message ?? null)
			});
		});

		test('when it is called directly more than once', async ({page, consoleTracker}) => {
			const
				target = await renderDestructorDummy(page),
				dynamicChild = await target.evaluateHandle<iBlock>((ctx) => ctx.unsafe.$refs.child?.[1]),
				destructor = await dynamicChild.evaluateHandle((ctx) => ctx.unsafe.$destroy.bind(ctx));

			await destructor.evaluate((destroy) => destroy(false));

			// Wait until memory is cleaned up
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			await page.waitForFunction((ctx) => ctx.r === undefined, dynamicChild);

			await destructor.evaluate((destroy) => destroy(false));

			await test.expect(consoleTracker.getMessages()).resolves.toHaveLength(0);
		});

		test(
			'when it is called via the `beforeUnmount` hook during the async chunk unmount',

			async ({page, consoleTracker}) => {
				const
					target = await renderDestructorDummy(page),
					dynamicChild = await target.evaluateHandle<iBlock>((ctx) => ctx.unsafe.$refs.child?.[1]);

				await dynamicChild.evaluate((ctx) => {
					ctx.unsafe.$destroy({recursive: false});
				});

				// Wait until memory is cleaned up
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				await page.waitForFunction((ctx) => ctx.r === undefined, dynamicChild);

				// Clear async chunks which should call child's destructor on vue unmount
				await target.evaluate((ctx) => {
					ctx.unsafe.async.clearAll({group: /asyncComponents/});
				});

				await BOM.waitForIdleCallback(page);

				await test.expect(consoleTracker.getMessages()).resolves.toHaveLength(0);
			}
		);
	});
});
