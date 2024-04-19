/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import { BOM, Component } from 'tests/helpers';

import type bTraitsIObserveDOMDummy from 'components/traits/i-observe-dom/test/b-traits-i-observe-dom-dummy/b-traits-i-observe-dom-dummy';

test.describe('components/traits/i-observe-dom', () => {
	let target: JSHandle<bTraitsIObserveDOMDummy>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await Component.waitForComponentTemplate(page, 'b-traits-i-observe-dom-dummy');
		target = await Component.createComponent(page, 'b-traits-i-observe-dom-dummy');
	});

	test('should emit the `DOMChange` event when the child is appended to the component element', async () => {
		const domChanged = target.evaluate((ctx) =>
			new Promise((resolve) => ctx.unsafe.localEmitter.once('DOMChange', resolve)));

		await target.evaluate((ctx) => {
			const div = document.createElement('div');
			ctx.$el!.append(div);
		});

		await test.expect(domChanged).toBeResolved();
	});

	test(
		[
			'should not emit `DOMChange` event',
			'when the child is appended to the component element',
			'and `unobserve` was called on the component\'s element '
		].join(' '),

		async ({page}) => {
			await target.evaluate((ctx) =>
				ctx.unsafe.localEmitter.once('DOMChange', () => globalThis.tVal = true));

			await target.evaluate((ctx) => {
				ctx.observeAPI.unobserve(ctx, ctx.$el!);

				const div = document.createElement('div');
				ctx.$el!.append(div);
			});

			await BOM.waitForIdleCallback(page);
			await test.expect(page.evaluate(() => globalThis.tVal)).resolves.toBeUndefined();
		}
	);

	test('`isNodeBeingObserved` should return `true` for the component\'s element', async () => {
		const result = await target.evaluate((ctx) =>
			ctx.observeAPI.isNodeBeingObserved(ctx, ctx.$el!));

		test.expect(result).toBeTruthy();
	});
});
