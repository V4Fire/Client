/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderDummy } from 'components/super/i-block/event/test/helpers';

import type bDummy from 'components/dummies/b-dummy/b-dummy';

test.describe('<i-block> events - base', () => {
	const
		componentName = 'b-dummy';

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await page.evaluate((componentName) => {
			globalThis.componentName = componentName;
		}, componentName);
	});

	test('specific hook events and change hook events should be emitted on `hook` changes', async ({page}) => {
		const target = await renderDummy(page);

		const scan = await target.evaluate((ctx) => {
			const res: any[] = [];

			ctx.on('onHook:beforeDestroy', (...args) => {
				res.push(Array.concat(args, 'specific'));
			});

			ctx.on('onHookChange', (...args) => {
				res.push(Array.concat(args, 'change'));
			});

			ctx.unsafe.$destroy();

			res.push(ctx.unsafe.hook === 'destroyed');

			return res;
		});

		test.expect(scan).toEqual([
			['beforeDestroy', 'mounted', 'specific'],
			['beforeDestroy', 'mounted', 'change'],
			true
		]);
	});

	test([
		'specific component status events and component status change events',
		'should be emitted on `componentStatus` changes'
	].join(' '), async ({page}) => {
		const target = await renderDummy(page);

		const scan = await target.evaluate((ctx) => {
			const res: any[] = [];

			ctx.on('onComponentStatus:destroyed', (...args) => {
				res.push(args);
			});

			ctx.on('onComponentStatusChange', (...args) => {
				res.push(args);
			});

			ctx.unsafe.$destroy();

			return res;
		});

		test.expect(scan).toEqual([
			['destroyed', 'ready'],
			['destroyed', 'ready']
		]);
	});

	test('`callChild` parent events should be handled by child with `proxyCall = true`', async ({page}) => {
		const target = await renderDummy(page, {
			proxyCall: true
		});

		const scan = await target.evaluate((ctx) => {
			const
				res: any[] = [],
				parent = ctx.$parent!;

			parent.emit('callChild', {
				if(ctx: bDummy) {
					return ctx.componentName === componentName;
				},
				then() {
					res.push(1);
				}
			});

			parent.emit('callChild', {
				if(ctx: bDummy) {
					return ctx.instance instanceof ctx.instance.constructor;
				},
				then() {
					res.push(2);
				}
			});

			parent.emit('callChild', {
				if(ctx: bDummy) {
					return ctx.globalName === 'foo';
				},
				then() {
					res.push(3);
				}
			});

			return res;
		});

		test.expect(scan).toEqual([1, 2]);
	});
});
