/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';

import type iBlock from 'components/super/i-block/i-block';
import type { PageAttrs } from 'components/super/i-page/test/interface';

test.describe('<i-page>', () => {
	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await Component.removeCreatedComponents(page);
	});

	test(
		'the `pageTitleProp` value should define the current page title',

		async ({page}) => {
			const target = await createTarget(page, {
				pageTitleProp: 'Initial testing title'
			});

			await assertPageTitleIs(target, 'Initial testing title');
		}
	);

	test(
		[
			'if the `pageTitleProp` is defined as a function,',
			'a page title value should be set to the result of that function call'
		].join(' '),

		async ({page}) => {
			const target = await createTarget(page, {
				pageTitleProp: (ctx: iBlock) => ctx.componentName
			});

			await assertPageTitleIs(target, 'p-v4-dynamic-page1');
		}
	);

	test(
		'the `pageDescriptionProp` value should define the current page description',

		async ({page}) => {
			const target = await createTarget(page, {
				pageDescriptionProp: 'Testing page description'
			});

			await test.expect(target.evaluate(({r}) => r.remoteState.pageMetaData.description))
				.resolves.toBe('Testing page description');
		}
	);

	test(
		[
			'if the `pageDescriptionProp` is defined as a function,',
			'a page description value should be set to the result of that function call'
		].join(' '),

		async ({page}) => {
			const target = await createTarget(page, {
				pageDescriptionProp: (ctx: iBlock) => ctx.componentName
			});

			await test.expect(target.evaluate(({r}) => r.remoteState.pageMetaData.description))
				.resolves.toBe('p-v4-dynamic-page1');
		}
	);

	test(
		'`stagePageTitles` values should define the current page title depending on the components\'s `stage` value',

		async ({page}) => {
			const target = await createTarget(page, {
				pageTitleProp: 'Initial testing title',
				stage: 'foo',
				stagePageTitles: {
					foo: 'New testing title',
					bar: 'Another testing title'
				}
			});

			await assertPageTitleIs(target, 'New testing title');
		}
	);

	test(
		[
			'if none of the keys in the `stagePageTitles` match the `stage` value,',
			'then the title should be set to the value of the [[DEFAULT]] key'
		].join(' '),

		async ({page}) => {
			const target = await createTarget(page, {
				pageTitleProp: 'Initial testing title',
				stage: 'foo',
				stagePageTitles: {
					bar: 'New testing title',
					'[[DEFAULT]]': 'Default testing title'
				}
			});

			await assertPageTitleIs(target, 'Default testing title');
		}
	);

	test(
		[
			'if a key of the `stagePageTitles` is defined as a function,',
			'a page title value should be set to the result of that function call'
		].join(' '),

		async ({page}) => {
			const target = await createTarget(page, {
				pageTitleProp: 'Initial testing title',
				stage: 'foo',
				stagePageTitles: {
					foo: (ctx: iBlock) => ctx.componentName
				}
			});

			await assertPageTitleIs(target, 'p-v4-dynamic-page1');
		}
	);

	test(
		'the page component should update the title using values from the `stagePageTitles` when the `stage` value changes',

		async ({page}) => {
			const target = await createTarget(page, {
				pageTitleProp: 'Initial testing title',
				stagePageTitles: {
					foo: 'New testing title',
					'[[DEFAULT]]': 'Default testing title'
				}
			});

			await assertPageTitleIs(target, 'Initial testing title');

			await target.evaluate((ctx) => {
				ctx.stage = 'foo';
			});

			await assertPageTitleIs(target, 'New testing title');

			await target.evaluate((ctx) => {
				ctx.stage = 'bar';
			});

			await assertPageTitleIs(target, 'Default testing title');
		}
	);

	test(
		[
			'if the value of `stage` does not match any of the keys `stagePageTitles`',
			'and the [[DEFAULT]] value is not set, the title should not change'
		].join(' '),

		async ({page}) => {
			const target = await createTarget(page, {
				pageTitleProp: 'Initial testing title',
				stagePageTitles: {
					bar: 'New testing title'
				}
			});

			await target.evaluate((ctx) => {
				ctx.stage = 'foo';
			});

			await assertPageTitleIs(target, 'Initial testing title');
		}
	);

	test(
		'the `scrollTo` method should scroll a page to the specified coordinates',

		async ({page}) => {
			const target = await createTarget(page);

			await page.addStyleTag({
				content: '#root-component {height: 3000px;}'
			});

			// Coordinates are passed as numbers (x, y)
			await target.evaluate(({r}) => r.scrollTo(0, 500));
			await assertScrollPositionIs(page, [0, 500]);

			// Coordinates are passed as a `ScrollOptions` object
			await target.evaluate(({r}) => r.scrollTo({x: 0, y: 200}));
			await assertScrollPositionIs(page, [0, 200]);
		}
	);

	/**
	 * Creates the `p-v4-dynamic-page1` component with specified attributes.
	 * The function returns a Promise that resolves to the `iBlock` wrapped with the `JSHandle` container.
	 *
	 * @param page
	 * @param attrs
	 *
	 */
	async function createTarget(page: Page, attrs: PageAttrs = {}): Promise<JSHandle<iBlock>> {
		return Component.createComponent(page, 'p-v4-dynamic-page1', {attrs});
	}

	/**
	 * Checks whether the page title matches the assertion.
	 * The function returns a Promise.
	 *
	 * @param target
	 * @param assertion
	 */
	async function assertPageTitleIs(target: JSHandle<iBlock>, assertion: string): Promise<void> {
		await test.expect(target.evaluate(({r}) => r.pageTitle)).resolves.toBe(assertion);
	}

	/**
	 * Checks whether the page scroll coordinates match the assertion.
	 * The function returns a Promise.
	 *
	 * @param page
	 * @param assertion
	 */
	async function assertScrollPositionIs(page: Page, assertion: [number, number]): Promise<void> {
		await test.expect(page.evaluate(() => [globalThis.scrollX, globalThis.scrollY])).resolves.toEqual(assertion);
	}
});
