// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers').default;

/**
 * Starts a test
 *
 * @param {Page} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	let
		target;

	beforeAll(async () => {
		await page.evaluate(() => {
			const scheme = [
				{
					attrs: {
						id: 'target'
					}
				}
			];

			globalThis.renderComponents('b-dummy-lfc', scheme);
		});

		target = await h.component.waitForComponent(page, '#target');
	});

	describe('`iBlock.lfc`', () => {
		it('checking the `beforeCreate` state', async () => {
			expect(
				await target.evaluate((ctx) => ({
					beforeCreateHook: ctx.tmp.beforeCreateHook,
					beforeCreateIsBefore: ctx.tmp.beforeCreateIsBefore
				}))

			).toEqual({
				beforeCreateHook: 'beforeCreate',
				beforeCreateIsBefore: true
			});
		});

		it('checking the `beforeDataCreate` state', async () => {
			expect(
				await target.evaluate((ctx) => ({
					fooBar: ctx.tmp.fooBar,
					rightTimeHookFromBeforeCreate: ctx.tmp.rightTimeHookFromBeforeCreate,
					rightTimeHookFromBeforeCreate2: ctx.tmp.rightTimeHookFromBeforeCreate2,
					beforeDataCreateHook: ctx.tmp.beforeDataCreateHook,
					beforeDataCreateIsBefore: ctx.tmp.beforeDataCreateIsBefore,
					beforeDataCreateIsBeforeWithSkipping: ctx.tmp.beforeDataCreateIsBeforeWithSkipping
				}))

			).toEqual({
				fooBar: 3,
				rightTimeHookFromBeforeCreate: 'beforeDataCreate',
				rightTimeHookFromBeforeCreate2: 'beforeDataCreate',
				beforeDataCreateHook: 'beforeDataCreate',
				beforeDataCreateIsBefore: true,
				beforeDataCreateIsBeforeWithSkipping: false
			});
		});

		it('`execCbAfterBlockReady`', async () => {
			expect(
				await target.evaluate((ctx) => ({
					blockReady: ctx.tmp.blockReady,
					blockReadyIsBefore: ctx.tmp.blockReadyIsBefore
				}))

			).toEqual({
				blockReady: true,
				blockReadyIsBefore: false
			});
		});

		it('`execCbAfterComponentCreated`', async () => {
			expect(
				await target.evaluate((ctx) => ({
					componentCreatedHook: ctx.tmp.componentCreatedHook,
					componentCreatedHook2: ctx.tmp.componentCreatedHook2
				}))

			).toEqual({
				componentCreatedHook: 'created',
				componentCreatedHook2: 'created'
			});
		});
	});
};
