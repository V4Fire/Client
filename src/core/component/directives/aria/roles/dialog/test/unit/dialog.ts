/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';
import type iBlock from 'super/i-block/i-block';
import type { ComponentElement } from 'super/i-block/i-block';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

test.describe('v-aria:dialog', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('role is set', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate(() => {
				const
					elem = <ComponentElement<iBlock>>document.querySelector('#window');

				return elem.component?.unsafe.block?.element('window')?.getAttribute('role');
			})
		).toBe('dialog');
	});

	test('aria-modal is set', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate(() => {
				const
					elem = <ComponentElement<iBlock>>document.querySelector('#window');

				return elem.component?.unsafe.block?.element('window')?.getAttribute('aria-modal');
			})
		).toBe('true');
	});

	test('aria-label is set', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate(() => {
				const
					elem = <ComponentElement<iBlock>>document.querySelector('#window');

				return elem.component?.unsafe.block?.element('window')?.getAttribute('aria-label');
			})
		).toBe('Title');
	});

	test('tab indexes are correct', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate(async (ctx) => {
				const
					openBtn = <HTMLElement>document.querySelector('#openBtn'),
					closeBtn = <HTMLElement>document.querySelector('#closeBtn'),
					res: Array<Nullable<string>> = [];

				openBtn.click();
				await ctx.nextTick();

				res.push(openBtn.getAttribute('tabindex'));
				res.push(closeBtn.getAttribute('tabindex'));

				return res;
			})
		).toEqual(['-1', '0']);
	});

	test('previous focused element get focus', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate(async (ctx) => {
				const
					openBtn = <HTMLElement>document.querySelector('#openBtn'),
					closeBtn = <HTMLElement>document.querySelector('#closeBtn');

				openBtn.focus();
				openBtn.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
				await ctx.nextTick();

				closeBtn.focus();
				closeBtn.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
				await ctx.nextTick();

				return document.activeElement?.id;
			})
		).toEqual('openBtn');
	});

	/**
	 * @param page
	 */
	async function init(page: Page): Promise<JSHandle<iBlock>> {
		return Component.createComponent(page, 'b-dummy-dialog');
	}
});
