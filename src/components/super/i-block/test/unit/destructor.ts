/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderDestructorDummy } from 'components/super/i-block/test/helpers';

test.describe('<i-block> calling a component\'s destructor', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('the destructors of all components should be implicitly called if they are removed in the template', async ({page}) => {
		const target = await renderDestructorDummy(page);

		await target.evaluate(async (ctx) => {
			ctx.content = false;
			await ctx.nextTick();
		});

		const componentsStatuses = await target.evaluate(
			(ctx) => ctx.store.map((el) => el.componentStatus)
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
			await test.expect(target.evaluate(({r}) => r.remoteRootInstances)).resolves.toBe(1);
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
			await test.expect(target.evaluate(({r}) => r.remoteRootInstances)).resolves.toBe(1);
		}
	);
});
