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

import type bDummy from 'components/super/i-block/test/b-super-i-block-dummy/b-super-i-block-dummy';

test.describe('<i-block> props', () => {
	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
	});

	test('`rootTag`', async ({page}) => {
		const target = await renderDummy(page, {
			rootTag: 'main'
		});

		await test.expect(target.evaluate((ctx) => ctx.$el!.tagName)).resolves.toBe('MAIN');
	});

	test('`mods`', async({page}) => {
		const target = await renderDummy(page, {
			mods: {
				foo: 1,
				bla: true,
				baz: 'ban'
			}
		});

		await test.expect(
			target.evaluate((ctx) => Object.fastClone(ctx.mods))

		).resolves.toEqual({
			foo: '1',
			bla: 'true',
			baz: 'ban',
			progress: undefined,
			diff: undefined,
			theme: undefined,
			exterior: undefined,
			stage: undefined
		});
	});

	test('passing modifiers as props', async({page}) => {
		const target = await renderDummy(page, {
			exterior: 'foo',
			diff: true
		});

		await test.expect(
			target.evaluate((ctx) => Object.fastClone(ctx.mods))

		).resolves.toEqual({
			exterior: 'foo',
			diff: 'true',
			progress: undefined,
			theme: undefined,
			stage: undefined
		});
	});

	test('`stage`', async({page}) => {
		const target = await renderDummy(page, {
			stage: 'main'
		});

		await test.expect(target.evaluate((ctx) => ctx.stage)).resolves.toBe('main');
	});

	test('`activatedProp`', async({page}) => {
		const target = await renderDummy(page, {
			activatedProp: false
		});

		await test.expect(target.evaluate((ctx) => ctx.isActivated)).resolves.toBeFalsy();
	});

	test('`classes`', async({page}) => {
		const target = await renderDummy(page, {
			classes: {
				wrapper: 'baz'
			}
		});

		await test.expect(
			target.evaluate((ctx) => ctx.unsafe.block!.element('wrapper')!.classList.contains('baz'))
		).resolves.toBeTruthy();
	});

	test('`styles`', async({page}) => {
		const target = await renderDummy(page, {
			styles: {
				wrapper: 'color: red;'
			}
		});

		await test.expect(
			target.evaluate((ctx) => ctx.unsafe.block!.element('wrapper')!.getAttribute('style'))
		).resolves.toBe('color: red;');
	});

	test.describe('`watchProp`', () => {
		test('simple usage', async({page}) => {
			const target = await renderDummy(page, {
				watchProp: {
					setStage: 'stage'
				}
			});

			await test.expect(
				target.evaluate(async (ctx) => {
					ctx.$parent!.stage = 'foo';
					await ctx.nextTick();
					return ctx.stage;
				})
			).resolves.toBe('foo');
		});

		test('providing additional options', async({page}) => {
			const target = await renderDummy(page, {
				watchProp: {
					setStage: [
						'stage',

						{
							path: 'reactiveTmp.foo',
							collapse: false,
							flush: 'sync'
						}
					]
				}
			});

			let scan = await target.evaluate(async (ctx) => {
				ctx.$parent!.stage = 'foo';
				await ctx.nextTick();
				return ctx.stage;
			});

			test.expect(scan).toBe('foo');


			scan = await target.evaluate(async (ctx) => {
				ctx.$parent!.unsafe.reactiveTmp.foo = 'bar';
				await ctx.nextTick();
				return ctx.stage;
			});

			test.expect(scan).toBe('bar');
		});

		test('watching for events', async({page}) => {
			const target = await renderDummy(page, {
				watchProp: {
					setStage: [':onNewStage']
				}
			});

			const scan = await target.evaluate(async (ctx) => {
				ctx.$parent!.emit('newStage', 'foo');
				await ctx.nextTick();
				return ctx.stage;
			});

			test.expect(scan).toBe('foo');
		});
	});

	/**
	 * Returns the rendered dummy component
	 * @param page
	 * @param attrs
	 */
	async function renderDummy(
		page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}
	): Promise<JSHandle<bDummy>> {
		return Component.createComponent(page, 'b-super-i-block-dummy', attrs);
	}
});
