// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import type { JSHandle, Page } from 'playwright';
import type iBlock from 'super/i-block/i-block';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

test.describe('v-aria:controls', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	/**
	 * With modifiers
	 */
	test('modifiers. "for" is a string', async ({page}) => {
		const target = await init(page, {for: 'id3'});

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const [el1, el2] = Array.from(ctx.unsafe.block.elements('link'));

				return el1.getAttribute('aria-controls') === 'id3' && el2.getAttribute('aria-controls') === 'id3';
			})
		).toBe(true);
	});

	test('modifiers. "for" is an array', async ({page}) => {
		const target = await init(page, {for: ['id3', 'id4']});

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const [el1, el2]: HTMLElement[] = Array.from(ctx.unsafe.block.elements('link'));

				return [el1.getAttribute('aria-controls'), el2.getAttribute('aria-controls')];
			})
		).toEqual(['id3', 'id4']);
	});

	test('modifiers. "for" is an array with wrong length', async ({page}) => {
		const target = await init(page, {for: ['id3', 'id4', 'id5']});

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const [el1, el2]: HTMLElement[] = Array.from(ctx.unsafe.block.elements('link'));

				return [el1.hasAttribute('aria-controls'), el2.hasAttribute('aria-controls')];
			})
		).toEqual([false, false]);
	});

	test('modifiers. no "for" value passed', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const [el1, el2]: HTMLElement[] = Array.from(ctx.unsafe.block.elements('link'));

				return [el1.hasAttribute('aria-controls'), el2.hasAttribute('aria-controls')];
			})
		).toEqual([false, false]);
	});

	/**
	 * With 'for' param as an array of tuples
	 */
	test('tuples', async ({page}) => {
		const target = await init(page, {for: [['id1', 'id3'], ['id2', 'id4']]}, 'v-aria:controls');

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const [el1, el2]: HTMLElement[] = Array.from(ctx.unsafe.block.elements('link'));

				return [el1.getAttribute('aria-controls'), el2.getAttribute('aria-controls')];
			})
		).toEqual(['id3', 'id4']);
	});

	test('tuples. wrong ids', async ({page}) => {
		const target = await init(page, {for: [['id5', 'id6'], ['id3', 'id8']]}, 'v-aria:controls');

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const [el1, el2]: HTMLElement[] = Array.from(ctx.unsafe.block.elements('link'));

				return [el1.hasAttribute('aria-controls'), el2.hasAttribute('aria-controls')];
			})
		).toEqual([false, false]);
	});

	test('no params passed', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const [el1, el2]: HTMLElement[] = Array.from(ctx.unsafe.block.elements('link'));

				return [el1.hasAttribute('aria-controls'), el2.hasAttribute('aria-controls')];
			})
		).toEqual([false, false]);
	});

	/**
	 * @param page
	 * @param ariaConfig
	 * @param directive
	 */
	async function init(
		page: Page,
		ariaConfig: Dictionary = {},
		directive: string = 'v-aria:controls.tab'
	): Promise<JSHandle<iBlock>> {
		return Component.createComponent(page, 'b-list', {
			attrs: {
				[directive]: ariaConfig,
				items: [
					{label: 'foo', value: 0, attrs: {id: 'id1'}},
					{label: 'bla', value: 1, attrs: {id: 'id2'}}
				]
			}
		});
	}
});
