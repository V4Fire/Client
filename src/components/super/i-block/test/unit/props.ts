/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { LIGHT } from 'core/theme-manager';

import test from 'tests/config/unit/test';

import { DOM } from 'tests/helpers';

import { renderDummy, renderModsDummy } from 'components/super/i-block/test/helpers';

test.describe('<i-block> props', () => {
	const
		componentName = 'b-super-i-block-dummy',
		createSelector = DOM.elNameSelectorGenerator(componentName);

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('`rootTag` should set a tag in which the component is rendered', async ({page}) => {
		const target = await renderDummy(page, {
			rootTag: 'main'
		});

		await test.expect(target.evaluate((ctx) => ctx.$el!.tagName)).toBeResolvedTo('MAIN');
	});

	test.describe('modifiers', () => {
		test('`mods` should set default values for the component modifiers', async ({page}) => {
			const target = await renderModsDummy(page, {
				stage: 'providing mods using modsProp',

				modsToProvide: {
					foo: 1,
					bla: true,
					baz: 'ban'
				}
			});

			await test.expect(
				target.evaluate((ctx) => Object.fastClone(ctx.providedMods))

			).resolves.toEqual({
				foo: '1',
				bla: 'true',
				baz: 'ban',
				context: undefined,
				progress: undefined,
				diff: undefined,
				theme: LIGHT,
				exterior: undefined,
				stage: undefined
			});
		});

		test('should accept modifiers as props', async ({page}) => {
			const target = await renderDummy(page, {
				exterior: 'foo',
				diff: true
			});

			await test.expect(
				target.evaluate((ctx) => Object.fastClone(ctx.mods))

			).resolves.toEqual({
				context: undefined,
				exterior: 'foo',
				diff: 'true',
				progress: undefined,
				theme: LIGHT,
				stage: undefined
			});
		});

		test('should accept mixing modifiers as props, `modsProp` and `sharedMods`', async ({page}) => {
			const target = await renderModsDummy(page, {
				stage: 'providing mods using modsProp, provide.mods and attributes',

				modsToProvide: {
					foo: 1,
					bla: true,
					baz: 'ban'
				}
			});

			await test.expect(
				target.evaluate((ctx) => Object.fastClone(ctx.providedMods))

			).resolves.toEqual({
				foo: '1',
				bla: 'true',
				baz: 'ban',
				checked: 'false',
				form: 'true',
				hidden: 'false',
				showError: 'false',
				showInfo: 'false',
				size: 'm',
				theme: LIGHT
			});

			await target.evaluate((ctx) => {
				ctx.checked = true;
			});

			await test.expect(
				target.evaluate((ctx) => Object.fastClone(ctx.providedMods))

			).resolves.toEqual({
				foo: '1',
				bla: 'true',
				baz: 'ban',
				checked: 'true',
				form: 'true',
				hidden: 'false',
				showError: 'false',
				showInfo: 'false',
				size: 'm',
				theme: LIGHT
			});
		});

		test('modifiers passed as `undefined` should use the default value, if it is set', async ({page}) => {
			const target = await renderModsDummy(page, {
				stage: 'passing mods as undefined'
			});

			await test.expect(
				target.evaluate((ctx) => Object.fastClone(ctx.providedMods))

			).resolves.toEqual({
				checked: 'false',
				form: 'true',
				hidden: 'false',
				showError: 'false',
				showInfo: 'false',
				size: 'm',
				theme: LIGHT
			});
		});

		test.describe('updating', () => {
			for (const [testCase, dummyStage] of [
				['Modifiers should update when provided as separate attributes', 'updating. providing mods as separate attributes'],
				['Modifiers should update when provided by `v-attrs`', 'updating. providing mods by v-attrs'],
				['Modifiers should update when provided using `modsProp`', 'updating. providing mods using modsProp'],
				['Modifiers should update when provided with `modsProp` by `v-attrs`', 'updating. providing mods using modsProp by v-attrs']
			]) {
				test(testCase, async ({page}) => {
					const target = await renderModsDummy(page, {
						stage: dummyStage
					});

					await test.expect(
						target.evaluate((ctx) => ctx.providedMods.checked)
					).resolves.toBe('false');

					await target.evaluate((ctx) => ctx.checked = true);
					await test.expect.poll(
						() => target.evaluate((ctx) => ctx.providedMods.checked)
					).toBe('true');
				});
			}
		});
	});

	test('`stage` should set the stage of the component', async ({page}) => {
		const target = await renderDummy(page, {
			stage: 'main'
		});

		await test.expect(target.evaluate((ctx) => ctx.stage)).toBeResolvedTo('main');
	});

	test('`activatedProp` should deactivate the component when `false` is passed', async ({page}) => {
		const target = await renderDummy(page, {
			activatedProp: false
		});

		await test.expect(target.evaluate((ctx) => ctx.isActivated)).resolves.toBeFalsy();
	});

	test('`classes` should set the component element classes', async ({page}) => {
		await renderDummy(page, {
			classes: {
				wrapper: 'baz'
			}
		});

		await test.expect(page.locator(createSelector('wrapper'))).toHaveClass(/baz/);
	});

	test('`styles` should set the component element styles', async ({page}) => {
		await renderDummy(page, {
			styles: {
				wrapper: 'color: red;'
			}
		});

		await test.expect(page.locator(createSelector('wrapper'))).toHaveCSS('color', 'rgb(255, 0, 0)');
	});

	test.describe('`watchProp` should call `setStage` method', () => {
		test("when the parent's `stage` property changes", async ({page}) => {
			const target = await renderDummy(page, {
				watchProp: {
					setStage: 'stage'
				}
			});

			const scan = await target.evaluate(async (ctx) => {
				ctx.$parent!.stage = 'foo';
				await ctx.nextTick();
				return ctx.stage;
			});

			await test.expect(scan).toBe('foo');
		});

		test('when one of the specified parent\'s properties changes ', async ({page}) => {
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

		test('when the parent emits the `onNewStage` event', async ({page}) => {
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
});
