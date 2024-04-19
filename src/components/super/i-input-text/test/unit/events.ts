/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderDummyInput } from 'components/super/i-input-text/test/helpers';

test.describe('<i-input-text> events', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test([
		'should emit the `selectText` event when the `selectText` method is invoked,',
		'subsequent invocations should be ignored if the value is already selected'
	].join(' '), async ({page}) => {
		const target = await renderDummyInput(page, {
			text: 'foo'
		});

		const scan = await target.evaluate(async (ctx) => {
			const res: any[] = [];

			ctx.on('selectText', () => res.push(true));
			await Promise.all([ctx.selectText(), ctx.selectText()]);

			return res;
		});

		test.expect(scan).toEqual([true]);
	});

	test([
		'should emit the `clearText` event when the `clearText` method is invoked,',
		'subsequent invocations should be ignored if the <input> is empty'
	].join(' '), async ({page}) => {
		const target = await renderDummyInput(page, {
			text: 'foo'
		});

		const scan = await target.evaluate(async (ctx) => {
			const res: any[] = [];

			ctx.on('clearText', () => res.push(true));
			await Promise.all([ctx.clearText(), ctx.clearText()]);

			return res;
		});

		test.expect(scan).toEqual([true]);
	});
});
