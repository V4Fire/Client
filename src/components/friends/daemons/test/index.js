// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	h = include('tests/helpers').default;

/**
 * Starts a test
 *
 * @param {Playwright.Page} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	let
		ctx;

	const check = async (fieldName, val) => {
		expect(await page.evaluate((fieldName) => globalThis.daemonsTest[fieldName], fieldName)).toBe(val);
	};

	describe('i-block/daemons', () => {
		beforeEach(async () => {
			await h.utils.reloadAndWaitForIdle(page);
			ctx = await h.component.waitForComponent(page, '#dummy-component');
		});

		describe('executes on hooks', () => {
			it('created', async () => {
				await check('created', true);
			});

			it('mounted', async () => {
				await check('mounted', true);
			});
		});

		it('executes on field changing', async () => {
			await check('fieldUpdate', undefined);

			await ctx.evaluate((ctx) => {
				ctx.testField = 2;
			});

			await h.bom.waitForIdleCallback(page);

			await check('fieldUpdate', true);
		});

		describe('isExists', () => {
			it('returns true if a daemon exists', async () => {
				const res = await ctx.evaluate((ctx) => ctx.daemons.isExists('execOnCreated'));
				expect(res).toBe(true);
			});

			it('returns false if a daemon doesn\'t exists', async () => {
				const res = await ctx.evaluate((ctx) => ctx.daemons.isExists('wrongDaemon'));
				expect(res).toBe(false);
			});
		});

		describe('spawn', () => {
			it('creates a new daemon', async () => {
				const res = await ctx.evaluate((ctx) => {
					ctx.daemons.spawn('spawnedDaemon', {
						fn: () => globalThis.daemonsTest.spawned = true
					});

					return ctx.daemons.isExists('spawnedDaemon');
				});

				expect(res).toBe(true);
			});

			it('execute the spawned daemon', async () => {
				await ctx.evaluate((ctx) => {
					ctx.daemons.spawn('spawnedDaemon', {
						fn: () => globalThis.daemonsTest.spawned = true
					});

					return ctx.daemons.run('spawnedDaemon');
				});

				await check('spawned', true);
			});
		});

		it('run', async () => {
			await ctx.evaluate((ctx) => {
				ctx.daemons.run('executable');
			});

			await check('executable', true);
		});
	});
};
